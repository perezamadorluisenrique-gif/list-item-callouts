// Pure logic: no `obsidian` import, so tests/ can run it under plain Node.
//
// A list item callout is a list item whose text starts with one of the
// configured characters and a space: `- & Remember the milk`. The syntax,
// the default characters and their colours are the ones the List Callouts
// plugin (mgmeyers/obsidian-list-callouts) used, so notes written for it
// look the same here.

import { t } from './i18n.ts';
import type { MessageKey } from './i18n.ts';

export interface Callout {
  /** What starts the item: one to three characters, no spaces. */
  char: string;
  /** `r, g, b`, the form the stylesheet uses inside `rgba()`. */
  color: string;
  /** A Lucide icon shown in place of the character, or none. */
  icon?: string;
  /** What the callout is for, shown in the picker and the settings. */
  name?: string;
  /** `r, g, b` of the item's text; none leaves the theme's text colour. */
  textColor?: string;
}

export const DEFAULT_CALLOUTS: readonly Callout[] = [
  { char: '&', color: '255, 214, 0', name: 'Highlight' },
  { char: '?', color: '255, 145, 0', name: 'Question' },
  { char: '!', color: '255, 23, 68', name: 'Important' },
  { char: '~', color: '124, 77, 255', name: 'Aside' },
  { char: '@', color: '0, 184, 212', name: 'Person or place' },
  { char: '$', color: '0, 200, 83', name: 'Money' },
  { char: '%', color: '158, 158, 158', name: 'Low priority' },
];

/** The built-in names, English as stored in data.json, and the messages that show them in the app's language. */
const BUILT_IN_NAMES = new Map<string, Extract<MessageKey, `callout.${string}`>>([
  ['Highlight', 'callout.highlight'],
  ['Question', 'callout.question'],
  ['Important', 'callout.important'],
  ['Aside', 'callout.aside'],
  ['Person or place', 'callout.personOrPlace'],
  ['Money', 'callout.money'],
  ['Low priority', 'callout.lowPriority'],
]);

/**
 * What to show as the callout's name: '' when it has none. One of the built-in
 * names, as long as the user has not renamed it, is shown in the app's
 * language; the stored name is never changed.
 */
export function calloutName(callout: Callout): string {
  const name = callout.name ?? '';
  const key = BUILT_IN_NAMES.get(name);
  return key ? t(key) : name;
}

/** The name, or the character for a callout without one. */
export function calloutLabel(callout: Callout): string {
  return calloutName(callout) || callout.char;
}

/** The list marker, an optional task box, and the space before the text. */
const LIST_ITEM = /^([ \t]*)([-*+]|\d{1,9}[.)])([ \t]+)(\[.\][ \t]+)?/;

export interface ListItem {
  /** Leading whitespace, as written. */
  indent: string;
  /** Offset in the line where the item's text starts, after marker and box. */
  textStart: number;
}

/** The list item on this line, or null when it is not one. */
export function listItem(line: string): ListItem | null {
  const match = LIST_ITEM.exec(line);
  if (!match) return null;
  // `- - -` is a thematic break, not a list.
  if (/^[ \t]*([-*_])([ \t]*\1){2,}[ \t]*$/.test(line)) return null;
  return { indent: match[1], textStart: match[0].length };
}

export interface CalloutMatch {
  callout: Callout;
  /** Offset of the callout character in the line. */
  from: number;
  /** Offset just after it. */
  to: number;
}

/**
 * The callout this line starts, or null. The character must be followed by
 * a space or end the line, so `- $5 each` is a plain item and `- $ 5 each`
 * a callout. Longer characters win over shorter ones that start the same.
 */
export function calloutAt(line: string, callouts: readonly Callout[]): CalloutMatch | null {
  const item = listItem(line);
  if (!item) return null;
  const rest = line.slice(item.textStart);
  const found = byLength(callouts).find(
    (c) => c.char !== '' && rest.startsWith(c.char) && /^(?:[ \t]|$)/.test(rest.slice(c.char.length)),
  );
  return found ? { callout: found, from: item.textStart, to: item.textStart + found.char.length } : null;
}

/** The same test on the text of a rendered list item, which has no marker. */
export function calloutAtText(text: string, callouts: readonly Callout[]): Callout | null {
  return (
    byLength(callouts).find(
      (c) => c.char !== '' && text.startsWith(c.char) && /^(?:[ \t\u00A0]|$)/.test(text.slice(c.char.length)),
    ) ?? null
  );
}

function byLength(callouts: readonly Callout[]): Callout[] {
  return [...callouts].sort((a, b) => b.char.length - a.char.length);
}

/**
 * The lines, after a callout item at `index`, that belong to the same item
 * and so get its colour: continuation lines of its paragraph, indented or
 * not. It stops at a blank line, another list item, or the start of any
 * other block.
 */
export function continuationLines(lines: readonly string[], index: number): number {
  let n = 0;
  for (let i = index + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '' || listItem(line) || /^[ \t]*(#{1,6}[ \t]|>|```|~~~|\||\$\$)/.test(line)) break;
    n++;
  }
  return n;
}

/** Scans past this many lines when looking for where an item ends or starts. */
const SCAN_LIMIT = 2000;

/** Column of the first non-blank character, tabs expanded to `tabSize`. */
function indentColumn(line: string, tabSize: number): number {
  let col = 0;
  for (const ch of line) {
    if (ch === ' ') col++;
    else if (ch === '\t') col += tabSize - (col % tabSize);
    else break;
  }
  return col;
}

const BLOCK_START = /^[ \t]*(#{1,6}[ \t]|>|```|~~~|\||\$\$)/;
const THEMATIC_BREAK = /^[ \t]*([-*_])([ \t]*\1){2,}[ \t]*$/;

/**
 * How many lines after the list item at `index` belong to it: its wrapped
 * lines and everything nested under it. A line belongs when it is indented
 * past the item's marker, or lazily continues its paragraph. It ends at the
 * next item at the same or a lower level, a heading, a rule, a table or a
 * quote at the margin, or two blank lines in a row. A single blank line
 * stays inside only when the item goes on after it.
 */
export function itemBlock(lines: readonly string[], index: number, tabSize = 4): number {
  const parent = indentColumn(lines[index] ?? '', tabSize);
  let end = index;
  let blanks = 0;
  const stop = Math.min(lines.length, index + 1 + SCAN_LIMIT);
  for (let i = index + 1; i < stop; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      if (++blanks >= 2) break;
      continue;
    }
    const col = indentColumn(line, tabSize);
    const item = listItem(line);
    let inside: boolean;
    if (item) inside = col > parent;
    else if (col > parent) inside = true;
    else inside = blanks === 0 && !BLOCK_START.test(line) && !THEMATIC_BREAK.test(line);
    if (!inside) break;
    blanks = 0;
    end = i;
  }
  return end - index;
}

/**
 * The outermost list item that contains the line at `index`, as an index
 * into `lines`, or null when the line is in no list. Looks back at most
 * `limit` lines, so a note of any length costs the same.
 */
export function blockOwner(lines: readonly string[], index: number, tabSize = 4, limit = 1000): number | null {
  const first = lines[index];
  if (first === undefined) return null;
  let owner: number | null = null;
  let below = first.trim() === '' ? Infinity : indentColumn(first, tabSize) + (listItem(first) ? 0 : 1);
  let blanks = 0;
  for (let i = index - 1; i >= Math.max(0, index - limit); i--) {
    const line = lines[i];
    if (line.trim() === '') {
      if (++blanks >= 2) break;
      continue;
    }
    blanks = 0;
    const col = indentColumn(line, tabSize);
    if (listItem(line)) {
      if (col < below) {
        owner = i;
        below = col;
        if (col === 0) break;
      }
    } else if (col < below && (col === 0 || BLOCK_START.test(line) || THEMATIC_BREAK.test(line))) {
      break;
    }
  }
  return owner;
}

export type PaintRole = 'first' | 'continued' | 'child';

export interface Paint {
  /** Index into the lines given to `paintPlan`. */
  line: number;
  callout: Callout;
  /** `first` is the item's own line; `continued` wraps its text; `child` is nested under it. */
  role: PaintRole;
  /** First and last line of a run in one colour, which get rounded corners. */
  first: boolean;
  last: boolean;
}

export interface PaintOptions {
  /** Colour the lines an item wraps onto, not just its first. */
  colourContinuation: boolean;
  /** Colour the items nested under a callout with its colour. Needs `colourContinuation`. */
  colourChildren: boolean;
  tabSize?: number;
  /** Whether a line that looks like a callout is inside code and so is not one. */
  isCode?: (line: number) => boolean;
}

/**
 * Which lines get which callout's colour. A nested callout uses its own
 * colour for its own block, and the lines after it go back to the parent's.
 */
export function paintPlan(lines: readonly string[], callouts: readonly Callout[], opts: PaintOptions): Paint[] {
  const tabSize = opts.tabSize ?? 4;
  const stack: { callout: Callout; end: number; wrapEnd: number; id: number }[] = [];
  const out: Paint[] = [];
  /** Which item painted each entry of `out`. */
  const runs: number[] = [];
  let ids = 0;
  for (let i = 0; i < lines.length; i++) {
    while (stack.length > 0 && stack[stack.length - 1].end < i) stack.pop();
    const hit = calloutAt(lines[i], callouts);
    if (hit && !opts.isCode?.(i)) {
      const wrap = opts.colourContinuation ? continuationLines(lines.slice(i, i + 201), 0) : 0;
      const block = opts.colourContinuation && opts.colourChildren ? itemBlock(lines, i, tabSize) : wrap;
      const entry = { callout: hit.callout, end: i + Math.max(block, wrap), wrapEnd: i + wrap, id: ids++ };
      stack.push(entry);
      out.push({ line: i, callout: entry.callout, role: 'first', first: true, last: false });
      runs.push(entry.id);
      continue;
    }
    const top = stack[stack.length - 1];
    if (!top) continue;
    out.push({ line: i, callout: top.callout, role: i <= top.wrapEnd ? 'continued' : 'child', first: false, last: false });
    runs.push(top.id);
  }
  // A run is consecutive lines painted by the same item: a nested callout
  // interrupts its parent's run, which starts again after it.
  for (let k = 0; k < out.length; k++) {
    const p = out[k];
    const prev = out[k - 1];
    const next = out[k + 1];
    p.first = !prev || prev.line !== p.line - 1 || runs[k - 1] !== runs[k];
    p.last = !next || next.line !== p.line + 1 || runs[k + 1] !== runs[k];
  }
  return out;
}

export interface LineEdit {
  /** Offsets within the line. */
  from: number;
  to: number;
  insert: string;
}

/**
 * The edit that gives this line the callout `char`, changes it to that
 * one, or with `char` null takes the callout away. A line that is not a
 * list item becomes one. Null when nothing needs to change.
 */
export function setCallout(line: string, char: string | null, callouts: readonly Callout[]): LineEdit | null {
  const current = calloutAt(line, callouts);
  if (current) {
    if (char === current.callout.char) return null;
    if (char === null) {
      const end = /^[ \t]/.test(line.slice(current.to)) ? current.to + 1 : current.to;
      return { from: current.from, to: end, insert: '' };
    }
    return { from: current.from, to: current.to, insert: char };
  }
  if (char === null) return null;
  const item = listItem(line);
  if (item) {
    return { from: item.textStart, to: item.textStart, insert: char + ' ' };
  }
  const indent = /^[ \t]*/.exec(line)?.[0] ?? '';
  return { from: indent.length, to: indent.length, insert: `- ${char} ` };
}

/** The next callout in the list after `char`, or null after the last (no callout). */
export function nextCallout(char: string | null, callouts: readonly Callout[]): string | null {
  if (callouts.length === 0) return null;
  if (char === null) return callouts[0].char;
  const at = callouts.findIndex((c) => c.char === char);
  return at === -1 || at === callouts.length - 1 ? null : callouts[at + 1].char;
}

/** `#ff9100` or `255, 145, 0` to `255, 145, 0`; null when it is neither. */
export function toRgb(value: string): string | null {
  const text = value.trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');
  }
  const rgb = /^(?:rgba?\()?\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)?$/i.exec(text);
  if (rgb && rgb.slice(1, 4).every((n) => Number(n) <= 255)) return rgb.slice(1, 4).map(Number).join(', ');
  return null;
}

/** `255, 145, 0` to `#ff9100`, for a colour picker. */
export function toHex(rgb: string): string {
  const parts = (toRgb(rgb) ?? '0, 0, 0').split(',').map((n) => Number(n.trim()));
  return '#' + parts.map((n) => n.toString(16).padStart(2, '0')).join('');
}

function channels(rgb: string): number[] {
  return (toRgb(rgb) ?? '0, 0, 0').split(',').map((n) => Number(n.trim()));
}

/** WCAG contrast ratio of two `r, g, b` colours: 1 for equal ones, 21 for black on white. */
export function contrastRatio(a: string, b: string): number {
  const luminance = (rgb: string): number => {
    const [r, g, bl] = channels(rgb).map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The colour a background `rgb` at `opacity` shows over `base`, as `r, g, b`. */
export function effectiveBg(rgb: string, opacity: number, base: string): string {
  const over = channels(rgb);
  const under = channels(base);
  return over.map((v, i) => Math.round(v * opacity + under[i] * (1 - opacity))).join(', ');
}

/** The theme backgrounds and the callout opacities the stylesheet uses, for the contrast warning. */
export const CONTRAST_THEMES = {
  light: { base: '255, 255, 255', opacity: 0.12 },
  dark: { base: '30, 30, 30', opacity: 0.18 },
} as const;

/** Themes in which `textColor` on the callout's background is below 4.5:1. */
export function lowContrastThemes(callout: Callout): Array<keyof typeof CONTRAST_THEMES> {
  const text = callout.textColor;
  if (!text) return [];
  return (Object.keys(CONTRAST_THEMES) as Array<keyof typeof CONTRAST_THEMES>).filter((k) => {
    const { base, opacity } = CONTRAST_THEMES[k];
    return contrastRatio(text, effectiveBg(callout.color, opacity, base)) < 4.5;
  });
}

/** Whether a character can start a callout: 1 to 3 characters, no spaces, not a list marker or `[`. */
export function validChar(char: string): boolean {
  const n = Array.from(char).length;
  return n >= 1 && n <= 3 && !/[\s[\]]/.test(char) && !/^[-*+]$/.test(char) && !/^\d/.test(char);
}

/**
 * Callouts read from stored settings: this plugin's own, or the array the
 * List Callouts plugin keeps in its `data.json`. Anything malformed is
 * dropped, a colour in any accepted form is normalised, and a character
 * that appears twice keeps its first definition. Null when nothing usable
 * is there.
 */
export function readCallouts(stored: unknown): Callout[] | null {
  if (!Array.isArray(stored)) return null;
  const seen = new Set<string>();
  const out: Callout[] = [];
  for (const item of stored as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const { char, color, icon, name } = item as Record<string, unknown>;
    const extra = item as Record<string, unknown>;
    if (typeof char !== 'string' || !validChar(char) || seen.has(char)) continue;
    const rgb = typeof color === 'string' ? toRgb(color) : null;
    if (!rgb) continue;
    seen.add(char);
    const callout: Callout = { char, color: rgb };
    const text = [extra.textColor, extra.textColour].find((v) => typeof v === 'string');
    const textRgb = typeof text === 'string' ? toRgb(text) : null;
    if (textRgb) callout.textColor = textRgb;
    if (typeof icon === 'string' && icon.trim() !== '') callout.icon = icon.trim();
    if (typeof name === 'string' && name.trim() !== '') callout.name = name.trim();
    else {
      const known = DEFAULT_CALLOUTS.find((d) => d.char === char);
      if (known?.name) callout.name = known.name;
    }
    out.push(callout);
  }
  return out.length > 0 ? out : null;
}
