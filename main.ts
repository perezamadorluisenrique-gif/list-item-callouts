import {
  App,
  Editor,
  EditorChange,
  FuzzySuggestModal,
  ItemView,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  SettingDefinitionItem,
  TFile,
  debounce,
  editorLivePreviewField,
  getIcon,
  setIcon,
} from 'obsidian';
import type { ViewStateResult, WorkspaceLeaf } from 'obsidian';
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';

import {
  DEFAULT_CALLOUTS,
  calloutAt,
  calloutAtText,
  continuationLines,
  nextCallout,
  readCallouts,
  setCallout,
  toHex,
  toRgb,
  validChar,
} from './src/callouts.ts';
import type { Callout } from './src/callouts.ts';
import { extractCallouts, groupByCallout, plainText, truncate } from './src/overview.ts';
import type { FoundCallout } from './src/overview.ts';

interface ListItemCalloutsSettings {
  callouts: Callout[];
  /** Colour the wrapped lines of an item as well as its first line. */
  colourContinuation: boolean;
}

const DEFAULT_SETTINGS: ListItemCalloutsSettings = {
  callouts: DEFAULT_CALLOUTS.map((c) => ({ ...c })),
  colourContinuation: true,
};

/** Where List Callouts keeps its settings, relative to the config folder. */
const LEGACY_DATA = 'plugins/obsidian-list-callouts/data.json';

export default class ListItemCalloutsPlugin extends Plugin {
  settings: ListItemCalloutsSettings = { ...DEFAULT_SETTINGS };
  /** Rebuilt in place when the settings change; Obsidian reads it again on `updateOptions`. */
  private editorExtensions: Extension[] = [];

  async onload() {
    await this.loadSettings();

    this.editorExtensions.push(this.buildExtension());
    this.registerEditorExtension(this.editorExtensions);
    this.registerMarkdownPostProcessor((el) => this.processReading(el));
    this.addSettingTab(new ListItemCalloutsSettingTab(this.app, this));
    this.registerView(VIEW_TYPE, (leaf) => new CalloutsView(leaf, this));
    this.addCommand({
      id: 'open-overview',
      name: 'Open the callout overview',
      icon: 'list-checks',
      callback: () => void this.openOverview(),
    });

    this.addCommand({
      id: 'toggle-callout',
      name: 'Toggle callout on the list item',
      icon: 'highlighter',
      editorCallback: (editor) =>
        this.editLines(editor, (line) => (calloutAt(line, this.settings.callouts) ? null : this.settings.callouts[0]?.char ?? null)),
    });
    this.addCommand({
      id: 'cycle-callout',
      name: 'Cycle callout type on the list item',
      icon: 'repeat',
      editorCallback: (editor) =>
        this.editLines(editor, (line) =>
          nextCallout(calloutAt(line, this.settings.callouts)?.callout.char ?? null, this.settings.callouts),
        ),
    });
    this.addCommand({
      id: 'remove-callout',
      name: 'Remove callout from the list item',
      icon: 'eraser',
      editorCallback: (editor) => this.editLines(editor, () => null),
    });
    this.addCommand({
      id: 'choose-callout',
      name: 'Make the list item a callout…',
      icon: 'palette',
      editorCallback: (editor) => {
        new CalloutPicker(this.app, this.settings.callouts, (callout) => this.editLines(editor, () => callout.char)).open();
      },
    });
  }

  /** Shows the overview in the right sidebar, reusing it when it is already open. */
  async openOverview(): Promise<void> {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE)[0] ?? null;
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (!leaf) return;
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.rightSplit.expand();
    workspace.setActiveLeaf(leaf, { focus: true });
  }

  /** Redraws the open overviews, after the callouts changed. */
  refreshOverviews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      if (leaf.view instanceof CalloutsView) leaf.view.invalidate();
    }
  }

  /**
   * Gives every line touched by a selection the callout `pick` chooses for
   * it (null: none), in one transaction so one undo reverts them all.
   */
  private editLines(editor: Editor, pick: (line: string) => string | null): void {
    const lines = new Set<number>();
    for (const sel of editor.listSelections()) {
      const a = Math.min(sel.anchor.line, sel.head.line);
      const b = Math.max(sel.anchor.line, sel.head.line);
      for (let i = a; i <= b; i++) lines.add(i);
    }
    const changes: EditorChange[] = [];
    for (const n of [...lines].sort((x, y) => x - y)) {
      const text = editor.getLine(n);
      if (lines.size > 1 && text.trim() === '') continue;
      const edit = setCallout(text, pick(text), this.settings.callouts);
      if (edit) changes.push({ from: { line: n, ch: edit.from }, to: { line: n, ch: edit.to }, text: edit.insert });
    }
    if (changes.length === 0) return;
    editor.transaction({ changes });
    // Leave a lone cursor after the character, ready to type the item.
    if (lines.size === 1 && !editor.somethingSelected()) {
      const n = [...lines][0];
      const hit = calloutAt(editor.getLine(n), this.settings.callouts);
      if (hit) editor.setCursor({ line: n, ch: Math.min(editor.getLine(n).length, hit.to + 1) });
    }
  }

  async loadSettings() {
    const stored = (await this.loadData()) as Partial<ListItemCalloutsSettings> | null;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...stored,
      callouts: readCallouts(stored?.callouts) ?? DEFAULT_CALLOUTS.map((c) => ({ ...c })),
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.refresh();
    this.refreshOverviews();
  }

  /** Redraws open notes with the current settings, in the editor and in Reading view. */
  refresh(): void {
    this.editorExtensions.length = 0;
    this.editorExtensions.push(this.buildExtension());
    this.app.workspace.updateOptions();
    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      if (leaf.view instanceof MarkdownView) leaf.view.previewMode.rerender(true);
    }
  }

  /** The List Callouts settings file, if that plugin was ever installed in this vault. */
  legacyPath(): string {
    return `${this.app.vault.configDir}/${LEGACY_DATA}`;
  }

  async importLegacy(): Promise<number> {
    const path = this.legacyPath();
    if (!(await this.app.vault.adapter.exists(path))) return 0;
    let parsed: unknown;
    try {
      parsed = JSON.parse(await this.app.vault.adapter.read(path));
    } catch {
      return 0;
    }
    const callouts = readCallouts(parsed);
    if (!callouts) return 0;
    this.settings.callouts = callouts;
    await this.saveSettings();
    return callouts.length;
  }

  // ── Reading view ───────────────────────────────────────────────────────

  private processReading(el: HTMLElement): void {
    for (const li of Array.from(el.querySelectorAll('li'))) {
      const node = firstTextNode(li);
      const text = node?.textContent ?? '';
      const callout = node ? calloutAtText(text, this.settings.callouts) : null;
      if (!node || !callout) continue;
      li.addClass('lic-callout');
      li.setAttribute('data-lic', callout.char);
      li.style.setProperty('--lic-color', callout.color);
      const marker = createSpan({ cls: 'lic-marker', text: callout.char });
      if (callout.icon && getIcon(callout.icon)) {
        marker.empty();
        setIcon(marker, callout.icon);
      }
      const rest = text.slice(callout.char.length);
      node.replaceWith(marker, rest);
    }
  }

  // ── Editor ─────────────────────────────────────────────────────────────

  /**
   * Line decorations for every callout in view, and in Live Preview the
   * character drawn as a coloured marker or icon. The note is read line by
   * line, never by forcing a full parse, so a long note cannot make it give
   * up (the failure behind List Callouts' blank callouts, mgmeyers/
   * obsidian-list-callouts#75 and #80). The syntax tree, as far as it is
   * parsed, only says which lines are code.
   */
  private buildExtension(): Extension {
    const settings = this.settings;
    const build = (view: EditorView): DecorationSet => {
      const builder = new RangeSetBuilder<Decoration>();
      const state = view.state;
      const live = state.field(editorLivePreviewField, false) === true;
      const tree = syntaxTree(state);
      const doc = state.doc;
      let colouredUpTo = 0;
      let processed = 0;

      for (const { from, to } of view.visibleRanges) {
        // Start a little above the viewport so the item a visible
        // continuation line belongs to is found.
        let lineNo = Math.max(processed + 1, doc.lineAt(from).number - 20);
        const lastLine = doc.lineAt(to).number;
        while (lineNo <= lastLine) {
          const line = doc.line(lineNo);
          lineNo++;
          processed = Math.max(processed, line.number);
          if (line.number <= colouredUpTo) continue;
          const hit = calloutAt(line.text, settings.callouts);
          if (!hit || isCode(tree.resolveInner(line.from, 1).type.name)) continue;

          // How many lines the item wraps onto, so the last one can round
          // its bottom corners (a class, not `:has()`, which is slow).
          let extra = 0;
          if (settings.colourContinuation) {
            const lines: string[] = [];
            for (let i = line.number + 1; i <= Math.min(doc.lines, line.number + 200); i++) lines.push(doc.line(i).text);
            extra = continuationLines([line.text, ...lines], 0);
          }

          const attrs = {
            class: extra === 0 ? 'lic-callout lic-first lic-last' : 'lic-callout lic-first',
            style: `--lic-color: ${hit.callout.color}`,
            'data-lic': hit.callout.char,
          };
          builder.add(line.from, line.from, Decoration.line({ attributes: attrs }));
          const markFrom = line.from + hit.from;
          const markTo = line.from + hit.to;
          builder.add(
            markFrom,
            markTo,
            live
              ? Decoration.replace({ widget: new MarkerWidget(hit.callout) })
              : Decoration.mark({ class: 'lic-marker' }),
          );

          if (extra > 0) {
            for (let i = 1; i <= extra; i++) {
              const next = doc.line(line.number + i);
              const cls = i === extra ? 'lic-callout lic-continued lic-last' : 'lic-callout lic-continued';
              builder.add(
                next.from,
                next.from,
                Decoration.line({ attributes: { class: cls, style: `--lic-color: ${hit.callout.color}` } }),
              );
            }
            colouredUpTo = line.number + extra;
            lineNo = Math.max(lineNo, colouredUpTo + 1);
            processed = Math.max(processed, colouredUpTo);
          }
        }
      }
      return builder.finish();
    };

    return ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
          this.decorations = build(view);
        }
        update(update: ViewUpdate) {
          const modeChanged =
            update.startState.field(editorLivePreviewField, false) !== update.state.field(editorLivePreviewField, false);
          if (update.docChanged || update.viewportChanged || modeChanged || syntaxTree(update.startState) !== syntaxTree(update.state)) {
            this.decorations = build(update.view);
          }
        }
      },
      { decorations: (v) => v.decorations },
    );
  }
}

const VIEW_TYPE = 'list-item-callouts-overview';
/** Longest item text shown in the overview, in characters. */
const SNIPPET_LENGTH = 140;

type OverviewScope = 'note' | 'vault';

interface OverviewItem extends FoundCallout {
  file: TFile;
}

/** The sidebar listing every callout item of the note or the vault, by type. */
class CalloutsView extends ItemView {
  private mode: OverviewScope = 'note';
  /** Characters shown; empty means all of them. */
  private only = new Set<string>();
  /** Per file: what was found, and the modification time it was found at. */
  private cache = new Map<string, { mtime: number; found: FoundCallout[] }>();
  private token = 0;
  private readonly refreshSoon = debounce(() => void this.render(), 300, true);

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: ListItemCalloutsPlugin,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Callouts';
  }

  getIcon(): string {
    return 'list-checks';
  }

  getState(): Record<string, unknown> {
    return { ...super.getState(), scope: this.mode, only: [...this.only] };
  }

  async setState(state: unknown, result: ViewStateResult): Promise<void> {
    const saved = (state ?? {}) as { scope?: unknown; only?: unknown };
    this.mode = saved.scope === 'vault' ? 'vault' : 'note';
    this.only = new Set(Array.isArray(saved.only) ? saved.only.filter((c): c is string => typeof c === 'string') : []);
    await super.setState(state, result);
    void this.render();
  }

  onOpen(): Promise<void> {
    this.contentEl.addClass('lic-overview');
    const { workspace, metadataCache, vault } = this.app;
    this.registerEvent(workspace.on('active-leaf-change', () => this.refreshSoon()));
    this.registerEvent(
      metadataCache.on('changed', (file) => {
        if (this.mode === 'vault' || file.path === workspace.getActiveFile()?.path) this.refreshSoon();
      }),
    );
    this.registerEvent(
      vault.on('delete', (file) => {
        this.cache.delete(file.path);
        this.refreshSoon();
      }),
    );
    this.registerEvent(
      vault.on('rename', (_file, oldPath) => {
        this.cache.delete(oldPath);
        this.refreshSoon();
      }),
    );
    void this.render();
    return Promise.resolve();
  }

  onClose(): Promise<void> {
    this.token++;
    this.cache.clear();
    this.contentEl.empty();
    return Promise.resolve();
  }

  /** Forget what was found (the callouts changed) and draw again. */
  invalidate(): void {
    this.cache.clear();
    void this.render();
  }

  /** The Markdown files to read for the current scope. */
  private files(): TFile[] {
    if (this.mode === 'vault') return this.app.vault.getMarkdownFiles();
    const active = this.app.workspace.getActiveFile();
    return active && active.extension === 'md' ? [active] : [];
  }

  private async scan(file: TFile): Promise<FoundCallout[]> {
    // The metadata cache lists a note's list items without reading it, so
    // notes without any are never opened.
    if (!this.app.metadataCache.getFileCache(file)?.listItems?.length) return [];
    const hit = this.cache.get(file.path);
    if (hit && hit.mtime === file.stat.mtime) return hit.found;
    const found = extractCallouts(await this.app.vault.cachedRead(file), this.plugin.settings.callouts);
    this.cache.set(file.path, { mtime: file.stat.mtime, found });
    return found;
  }

  private async render(): Promise<void> {
    const token = ++this.token;
    const items: OverviewItem[] = [];
    for (const file of this.files()) {
      const found = await this.scan(file);
      if (token !== this.token) return;
      for (const f of found) items.push({ ...f, file });
    }
    if (token !== this.token) return;
    this.draw(items);
  }

  private draw(items: OverviewItem[]): void {
    const el = this.contentEl;
    el.empty();
    const callouts = this.plugin.settings.callouts;

    const bar = el.createDiv({ cls: 'lic-ov-scope' });
    for (const [scope, label] of [['note', 'This note'], ['vault', 'Whole vault']] as const) {
      const button = bar.createEl('button', { cls: 'lic-ov-scope-button', text: label, attr: { 'data-scope': scope } });
      button.toggleClass('mod-cta', this.mode === scope);
      button.setAttribute('aria-pressed', String(this.mode === scope));
      button.addEventListener('click', () => {
        if (this.mode === scope) return;
        this.mode = scope;
        this.app.workspace.requestSaveLayout();
        void this.render();
      });
    }

    const all = groupByCallout(items, callouts);
    if (all.length === 0) {
      el.createDiv({
        cls: 'lic-ov-empty',
        text: this.mode === 'note' ? 'No callout items in this note.' : 'No callout items in the vault.',
      });
      return;
    }

    const filters = el.createDiv({ cls: 'lic-ov-filters' });
    for (const group of all) {
      const { callout } = group;
      const on = this.only.size === 0 || this.only.has(callout.char);
      const button = filters.createEl('button', {
        cls: 'lic-ov-filter',
        attr: { 'data-lic': callout.char, 'aria-pressed': String(on), 'aria-label': callout.name ?? callout.char },
      });
      button.toggleClass('is-off', !on);
      this.marker(button, callout);
      button.createSpan({ cls: 'lic-ov-count', text: String(group.items.length) });
      button.addEventListener('click', () => {
        // From "all shown", a click picks that one callout; after that
        // clicks add or remove callouts, and none left means all again.
        const present = all.map((g) => g.callout.char);
        const next = new Set(this.only.size === 0 ? [callout.char] : [...this.only].filter((c) => present.includes(c)));
        if (this.only.size > 0) {
          if (next.has(callout.char)) next.delete(callout.char);
          else next.add(callout.char);
        }
        this.only = next.size === present.length || next.size === 0 ? new Set() : next;
        this.app.workspace.requestSaveLayout();
        this.draw(items);
      });
    }

    for (const group of all) {
      const { callout } = group;
      if (this.only.size > 0 && !this.only.has(callout.char)) continue;
      const section = el.createDiv({ cls: 'lic-ov-group', attr: { 'data-lic': callout.char } });
      const head = section.createDiv({ cls: 'lic-ov-head' });
      this.marker(head, callout);
      head.createSpan({ cls: 'lic-ov-name', text: callout.name ?? callout.char });
      head.createSpan({ cls: 'lic-ov-count', text: String(group.items.length) });
      for (const item of group.items) {
        const row = section.createDiv({ cls: 'lic-ov-item', attr: { 'data-line': String(item.line), 'data-path': item.file.path } });
        row.style.setProperty('--lic-color', callout.color);
        row.createSpan({ cls: 'lic-ov-text', text: truncate(plainText(item.text), SNIPPET_LENGTH) || '(empty)' });
        if (this.mode === 'vault') row.createSpan({ cls: 'lic-ov-note', text: item.file.basename });
        row.addEventListener('click', () => void this.jump(item));
      }
    }
  }

  private marker(parent: HTMLElement, callout: Callout): void {
    const marker = parent.createSpan({ cls: 'lic-marker', text: callout.char });
    marker.style.setProperty('--lic-color', callout.color);
    if (callout.icon && getIcon(callout.icon)) {
      marker.empty();
      setIcon(marker, callout.icon);
    }
  }

  /** Opens the note (in the tab that already shows it, if any) with the cursor on the item. */
  private async jump(item: OverviewItem): Promise<void> {
    const { workspace } = this.app;
    const open = workspace
      .getLeavesOfType('markdown')
      .find((leaf) => leaf.view instanceof MarkdownView && leaf.view.file?.path === item.file.path);
    const leaf = open ?? workspace.getLeaf(false);
    await leaf.openFile(item.file, { eState: { line: item.line } });
    workspace.setActiveLeaf(leaf, { focus: true });
    const view = leaf.view;
    if (view instanceof MarkdownView && view.getMode() === 'source') {
      const pos = { line: Math.min(item.line, view.editor.lastLine()), ch: 0 };
      view.editor.setCursor(pos);
      view.editor.scrollIntoView({ from: pos, to: pos }, true);
      view.editor.focus();
    }
  }
}

/** Code blocks, maths and front matter, where a `- &` is not a list item. */
function isCode(nodeName: string): boolean {
  return /codeblock|math|frontmatter|comment/i.test(nodeName);
}

class MarkerWidget extends WidgetType {
  constructor(private callout: Callout) {
    super();
  }

  eq(other: MarkerWidget): boolean {
    return other.callout.char === this.callout.char && other.callout.icon === this.callout.icon;
  }

  toDOM(): HTMLElement {
    const span = createSpan({ cls: 'lic-marker', text: this.callout.char, attr: { 'aria-label': this.callout.name ?? this.callout.char } });
    if (this.callout.icon && getIcon(this.callout.icon)) {
      span.empty();
      setIcon(span, this.callout.icon);
    }
    return span;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

/** The first piece of text in a rendered list item, past its checkbox. */
function firstTextNode(li: HTMLElement): Text | null {
  for (const child of Array.from(li.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.nodeValue?.trim()) return child as Text;
      continue;
    }
    // Node types rather than `instanceof`, which fails for nodes from a
    // popped-out window.
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as HTMLElement;
    if (el.tagName === 'UL' || el.tagName === 'OL') return null;
    if (el.tagName === 'INPUT' || el.hasClass('list-bullet') || el.hasClass('list-collapse-indicator')) continue;
    if (el.tagName === 'P') {
      const first = el.firstChild;
      return first?.nodeType === Node.TEXT_NODE ? (first as Text) : null;
    }
    return null;
  }
  return null;
}

class CalloutPicker extends FuzzySuggestModal<Callout> {
  constructor(
    app: App,
    private callouts: Callout[],
    private onChoose: (callout: Callout) => void,
  ) {
    super(app);
    this.setPlaceholder('Pick a callout for the list item');
  }

  getItems(): Callout[] {
    return this.callouts;
  }

  getItemText(callout: Callout): string {
    return `${callout.char} ${callout.name ?? ''}`.trim();
  }

  renderSuggestion(match: { item: Callout }, el: HTMLElement): void {
    const callout = match.item;
    const row = el.createDiv({ cls: 'lic-suggestion' });
    const marker = row.createSpan({ cls: 'lic-marker', text: callout.char });
    marker.style.setProperty('--lic-color', callout.color);
    if (callout.icon && getIcon(callout.icon)) {
      marker.empty();
      setIcon(marker, callout.icon);
    }
    row.createSpan({ text: callout.name ?? callout.char });
  }

  onChooseItem(callout: Callout): void {
    this.onChoose(callout);
  }
}

/** Names and descriptions shared by both renderings of the settings tab. */
const SETTING_TEXT = {
  colourContinuation: {
    name: 'Colour wrapped lines',
    desc: 'Colour the lines an item wraps onto in the editor, not just its first line.',
  },
  syntax: {
    name: 'Writing a callout',
    desc: 'Start a list item with one of these characters and a space, as in "- & Buy milk". An icon, if set, is shown in place of the character; use any Lucide icon name, such as "star" or "alert-triangle".',
  },
  restore: {
    name: 'Restore defaults',
    desc: 'Replace your callouts with the seven built-in ones.',
  },
  legacy: {
    name: 'Import from List Callouts',
    desc: 'Copy the characters, colours and icons you set up in the List Callouts plugin, if it was ever installed in this vault.',
  },
};

class ListItemCalloutsSettingTab extends PluginSettingTab {
  /** Set once Obsidian has drawn the tab through `display()`, which it does only before 1.13. */
  private legacy = false;

  constructor(
    app: App,
    private plugin: ListItemCalloutsPlugin,
  ) {
    super(app, plugin);
  }

  /**
   * The settings, described rather than drawn. Obsidian 1.13 and later
   * renders this itself and indexes it, so the settings turn up in the
   * settings search. Older versions ignore it and call `display()`.
   */
  getSettingDefinitions(): SettingDefinitionItem[] {
    const settings = this.plugin.settings;
    return [
      {
        ...SETTING_TEXT.colourContinuation,
        control: { type: 'toggle', key: 'colourContinuation', defaultValue: DEFAULT_SETTINGS.colourContinuation },
      },
      SETTING_TEXT.syntax,
      {
        type: 'list',
        heading: 'Callouts',
        emptyState: 'No callouts. Add one, or restore the defaults.',
        items: settings.callouts.map((callout, index) => ({
          name: `${callout.char} ${callout.name ?? ''}`.trim(),
          aliases: callout.icon ? [callout.icon] : undefined,
          render: (setting: Setting) => this.calloutRow(setting, callout, index),
        })),
        onDelete: (index: number) => {
          settings.callouts.splice(index, 1);
          this.saveAndRedraw();
        },
        onReorder: (from: number, to: number) => {
          const [moved] = settings.callouts.splice(from, 1);
          settings.callouts.splice(to, 0, moved);
          this.saveAndRedraw();
        },
        addItem: { name: 'Add callout', action: () => this.addCallout() },
      },
      { ...SETTING_TEXT.restore, action: () => this.restoreDefaults() },
      { ...SETTING_TEXT.legacy, action: () => void this.importLegacy() },
    ];
  }

  /** Persists a change made through a declarative control, through the plugin's one path to disk. */
  async setControlValue(key: string, value: unknown): Promise<void> {
    Object.assign(this.plugin.settings, { [key]: value });
    await this.plugin.saveSettings();
  }

  /** The pre-1.13 rendering. Obsidian skips it once `getSettingDefinitions()` returns anything. */
  display(): void {
    this.legacy = true;
    this.draw();
  }

  private draw(): void {
    const { containerEl } = this;
    containerEl.empty();
    const settings = this.plugin.settings;

    new Setting(containerEl)
      .setName(SETTING_TEXT.colourContinuation.name)
      .setDesc(SETTING_TEXT.colourContinuation.desc)
      .addToggle((toggle) =>
        toggle.setValue(settings.colourContinuation).onChange((value) => {
          settings.colourContinuation = value;
          void this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl).setName('Callouts').setHeading();
    containerEl.createEl('p', { cls: 'setting-item-description', text: SETTING_TEXT.syntax.desc });

    settings.callouts.forEach((callout, index) => {
      const row = new Setting(containerEl);
      this.calloutRow(row, callout, index);
      row.addExtraButton((button) =>
        button.setIcon('trash-2').onClick(() => {
          settings.callouts.splice(index, 1);
          this.saveAndRedraw();
        }),
      );
    });

    new Setting(containerEl)
      .addButton((button) => button.setButtonText('Add callout').setCta().onClick(() => this.addCallout()))
      .addButton((button) => button.setButtonText(SETTING_TEXT.restore.name).onClick(() => this.restoreDefaults()));

    new Setting(containerEl)
      .setName(SETTING_TEXT.legacy.name)
      .setDesc(SETTING_TEXT.legacy.desc)
      .addButton((button) => button.setButtonText('Import').onClick(() => void this.importLegacy()));
  }

  /** One callout's row: character, name, icon and colour. */
  private calloutRow(row: Setting, callout: Callout, index: number): void {
    const settings = this.plugin.settings;
    const save = () => void this.plugin.saveSettings();
    row.setClass('lic-setting-row');
    row.nameEl.empty();
    row.nameEl.createSpan({ cls: 'lic-marker', text: callout.char }).style.setProperty('--lic-color', callout.color);
    row.nameEl.createSpan({ text: ` ${callout.name ?? ''}` });
    row.addText((text) =>
      text
        .setPlaceholder('Char')
        .setValue(callout.char)
        .onChange((value) => {
          const taken = settings.callouts.some((c, i) => i !== index && c.char === value);
          text.inputEl.toggleClass('lic-invalid', !validChar(value) || taken);
          if (!validChar(value) || taken) return;
          callout.char = value;
          save();
        }),
    );
    row.addText((text) =>
      text
        .setPlaceholder('Name')
        .setValue(callout.name ?? '')
        .onChange((value) => {
          callout.name = value.trim() || undefined;
          save();
        }),
    );
    row.addText((text) =>
      text
        .setPlaceholder('Icon')
        .setValue(callout.icon ?? '')
        .onChange((value) => {
          const icon = value.trim();
          text.inputEl.toggleClass('lic-invalid', icon !== '' && !getIcon(icon));
          if (icon !== '' && !getIcon(icon)) return;
          callout.icon = icon || undefined;
          save();
        }),
    );
    row.addColorPicker((picker) =>
      picker.setValue(toHex(callout.color)).onChange((value) => {
        const rgb = toRgb(value);
        if (!rgb) return;
        callout.color = rgb;
        save();
      }),
    );
  }

  private addCallout(): void {
    const settings = this.plugin.settings;
    const used = new Set(settings.callouts.map((c) => c.char));
    const char = ['*', '^', '+', '=', '#', '>', '<', '/'].map((c) => c + c).find((c) => !used.has(c) && validChar(c)) ?? '??';
    settings.callouts.push({ char, color: '100, 100, 255', name: 'New' });
    this.saveAndRedraw();
  }

  private restoreDefaults(): void {
    this.plugin.settings.callouts = DEFAULT_CALLOUTS.map((c) => ({ ...c }));
    this.saveAndRedraw();
  }

  private async importLegacy(): Promise<void> {
    const n = await this.plugin.importLegacy();
    new Notice(n > 0 ? `Imported ${n} callouts from List Callouts.` : 'No List Callouts settings were found in this vault.');
    this.redraw();
  }

  private saveAndRedraw(): void {
    void this.plugin.saveSettings();
    this.redraw();
  }

  /** Draws the tab again after the list of callouts changed, whichever way it was drawn. */
  private redraw(): void {
    if (this.legacy) {
      this.draw();
      return;
    }
    // Obsidian 1.13's re-render of the declarative definitions. Looked up
    // rather than called directly, because older versions do not have it.
    const tab = this as unknown as { update?: () => void };
    tab.update?.();
  }
}
