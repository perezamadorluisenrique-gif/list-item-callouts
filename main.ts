import {
  App,
  Editor,
  EditorChange,
  FuzzySuggestModal,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  editorLivePreviewField,
  getIcon,
  setIcon,
} from 'obsidian';
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

          const attrs = { class: 'lic-callout lic-first', style: `--lic-color: ${hit.callout.color}`, 'data-lic': hit.callout.char };
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

          if (settings.colourContinuation) {
            const lines: string[] = [];
            for (let i = line.number + 1; i <= Math.min(doc.lines, line.number + 200); i++) lines.push(doc.line(i).text);
            const extra = continuationLines([line.text, ...lines], 0);
            for (let i = 1; i <= extra; i++) {
              const next = doc.line(line.number + i);
              builder.add(
                next.from,
                next.from,
                Decoration.line({ attributes: { class: 'lic-callout lic-continued', style: `--lic-color: ${hit.callout.color}` } }),
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
    if (child instanceof Text) {
      if (child.nodeValue?.trim()) return child;
      continue;
    }
    if (!(child instanceof HTMLElement)) continue;
    if (child.tagName === 'UL' || child.tagName === 'OL') return null;
    if (child.tagName === 'INPUT' || child.hasClass('list-bullet') || child.hasClass('list-collapse-indicator')) continue;
    if (child.tagName === 'P') {
      const first = child.firstChild;
      return first instanceof Text ? first : null;
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

class ListItemCalloutsSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: ListItemCalloutsPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const settings = this.plugin.settings;
    const save = () => void this.plugin.saveSettings();

    new Setting(containerEl)
      .setName('Colour wrapped lines')
      .setDesc('Colour the lines an item wraps onto in the editor, not just its first line.')
      .addToggle((toggle) =>
        toggle.setValue(settings.colourContinuation).onChange((value) => {
          settings.colourContinuation = value;
          save();
        }),
      );

    new Setting(containerEl).setName('Callouts').setHeading();
    containerEl.createEl('p', {
      cls: 'setting-item-description',
      text: 'Start a list item with one of these characters and a space, as in "- & Buy milk". An icon, if set, is shown in place of the character; use any Lucide icon name, such as "star" or "alert-triangle".',
    });

    settings.callouts.forEach((callout, index) => {
      const row = new Setting(containerEl).setClass('lic-setting-row');
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
      row.addExtraButton((button) =>
        button
          .setIcon('trash-2')
          .setTooltip('Remove')
          .onClick(() => {
            settings.callouts.splice(index, 1);
            save();
            this.display();
          }),
      );
    });

    new Setting(containerEl)
      .addButton((button) =>
        button
          .setButtonText('Add callout')
          .setCta()
          .onClick(() => {
            const used = new Set(settings.callouts.map((c) => c.char));
            const char = ['*', '^', '+', '=', '#', '>', '<', '/'].map((c) => c + c).find((c) => !used.has(c) && validChar(c)) ?? '??';
            settings.callouts.push({ char, color: '100, 100, 255', name: 'New' });
            save();
            this.display();
          }),
      )
      .addButton((button) =>
        button.setButtonText('Restore defaults').onClick(() => {
          settings.callouts = DEFAULT_CALLOUTS.map((c) => ({ ...c }));
          save();
          this.display();
        }),
      );

    const legacy = new Setting(containerEl)
      .setName('Import from List Callouts')
      .setDesc('Copy the characters, colours and icons you set up in the List Callouts plugin, if it was ever installed in this vault.');
    legacy.addButton((button) =>
      button.setButtonText('Import').onClick(async () => {
        const n = await this.plugin.importLegacy();
        new Notice(n > 0 ? `Imported ${n} callouts from List Callouts.` : 'No List Callouts settings were found in this vault.');
        this.display();
      }),
    );
  }
}
