// Pure logic for the callout overview: which list items in a note are
// callouts, and how their text is shown. No `obsidian` import.

import { calloutAt } from './callouts.ts';
import type { Callout } from './callouts.ts';

export interface FoundCallout {
  /** Zero-based line of the list item. */
  line: number;
  /** The callout's character, as configured. */
  char: string;
  /** The item's text after the character, trimmed, markdown as written. */
  text: string;
}

/**
 * Every callout list item in a note, in order, nested items included. Code
 * blocks (fenced), maths blocks and front matter are skipped, as the
 * editor decorations skip them.
 */
export function extractCallouts(content: string, callouts: readonly Callout[]): FoundCallout[] {
  const found: FoundCallout[] = [];
  if (callouts.length === 0) return found;
  const lines = content.split(/\r\n|\r|\n/);
  let start = 0;
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((l, i) => i > 0 && /^(---|\.\.\.)[ \t]*$/.test(l));
    if (end > 0) start = end + 1;
  }
  let fence: { char: string; length: number } | null = null;
  let inMath = false;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const open = /^[ \t]*(`{3,}|~{3,})/.exec(line);
    if (fence) {
      const close = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(line);
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) fence = null;
      continue;
    }
    if (inMath) {
      if (line.includes('$$')) inMath = false;
      continue;
    }
    if (open) {
      fence = { char: open[1][0], length: open[1].length };
      continue;
    }
    const dollars = line.split('$$').length - 1;
    if (dollars % 2 === 1) {
      inMath = true;
      continue;
    }
    const hit = calloutAt(line, callouts);
    if (!hit) continue;
    found.push({ line: i, char: hit.callout.char, text: line.slice(hit.to).trim() });
  }
  return found;
}

/** The text of an item without its markdown markup, for a one-line list. */
export function plainText(text: string): string {
  return text
    .replace(/!?\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/!?\[\[([^\]]*)\]\]/g, (_m, target: string) => target.replace(/^.*[/#]/, ''))
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|~~|==)(.+?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(^|[^*\w])([*_])(?=\S)([^*_]*?\S)\2(?![*\w])/g, '$1$3')
    .replace(/[ \t]+\^[\w-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** At most `max` characters, ending in an ellipsis when cut. */
export function truncate(text: string, max: number): string {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  return chars.slice(0, Math.max(0, max - 1)).join('').replace(/\s+$/, '') + '…';
}

export interface Group<T extends { char: string }> {
  callout: Callout;
  items: T[];
}

/**
 * Items grouped by callout, in the order the callouts are configured. A
 * group with no items is left out; items whose character is no longer
 * configured are dropped.
 */
export function groupByCallout<T extends { char: string }>(items: readonly T[], callouts: readonly Callout[]): Group<T>[] {
  const groups: Group<T>[] = [];
  for (const callout of callouts) {
    const mine = items.filter((item) => item.char === callout.char);
    if (mine.length > 0) groups.push({ callout, items: mine });
  }
  return groups;
}
