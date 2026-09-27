// Pure logic: no `obsidian` import, so tests/ can run it under plain Node.
//
// A list item callout is a list item whose text starts with one of the
// configured characters and a space: `- & Remember the milk`. The syntax,
// the default characters and their colours are the ones the List Callouts
// plugin (mgmeyers/obsidian-list-callouts) used, so notes written for it
// look the same here.

export interface Callout {
  /** What starts the item: one to three characters, no spaces. */
  char: string;
  /** `r, g, b`, the form the stylesheet uses inside `rgba()`. */
  color: string;
  /** A Lucide icon shown in place of the character, or none. */
  icon?: string;
  /** What the callout is for, shown in the picker and the settings. */
  name?: string;
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
    if (typeof char !== 'string' || !validChar(char) || seen.has(char)) continue;
    const rgb = typeof color === 'string' ? toRgb(color) : null;
    if (!rgb) continue;
    seen.add(char);
    const callout: Callout = { char, color: rgb };
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
