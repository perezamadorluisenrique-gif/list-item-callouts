/**
 * Properties of setting, changing and removing a callout on any line, and of
 * finding callouts in a note, checked on hand-written notes in the style of
 * the Obsidian help vault and on generated ones with callouts on every other
 * line.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_CALLOUTS, calloutAt, listItem, nextCallout, setCallout } from '../src/callouts.ts';
import type { LineEdit } from '../src/callouts.ts';
import { extractCallouts } from '../src/overview.ts';
import { SAMPLES, protectedPieces, randomNote } from './markdown-samples.ts';

const C = DEFAULT_CALLOUTS;
const CHARS: (string | null)[] = [...C.map((c) => c.char), null];

/** A generated note whose list items on even lines are callouts. */
function withCallouts(seed: number): string {
  return randomNote(seed)
    .replace(/\r/g, '')
    .split('\n')
    .map((line, i) =>
      i % 2 ? line : line.replace(/^([ \t]*(?:[-*+]|\d+[.)])[ \t]+(?:\[.\][ \t]+)?)/, `$1${C[(seed + i) % C.length].char} `),
    )
    .join('\n');
}

const NOTES: [string, string][] = [
  ...Object.entries(SAMPLES),
  ...Array.from({ length: 2000 }, (_, i): [string, string] => [`seed ${i + 1}`, withCallouts(i + 1)]),
];

const LINES = [...new Set(NOTES.flatMap(([, note]) => note.split('\n')))];

const apply = (line: string, edit: LineEdit | null) =>
  edit === null ? line : line.slice(0, edit.from) + edit.insert + line.slice(edit.to);

/** A list item's text with three or more dashes, stars or underscores: without a callout it is a rule. */
const becomesRule = (line: string) => /^[ \t]*[-*+][ \t]+\S+[ \t]+(?:[-*_][ \t]*){2,}$/.test(line);

test('setting a callout makes the line read as that callout, and setting it again changes nothing', () => {
  for (const line of LINES) {
    for (const char of CHARS) {
      const after = apply(line, setCallout(line, char, C));
      if (char !== null || calloutAt(line, C) !== null) {
        assert.equal(calloutAt(after, C)?.callout.char ?? null, char, `${JSON.stringify(line)} -> ${char}`);
      }
      assert.equal(setCallout(after, char, C), null, `${JSON.stringify(line)} -> ${char}`);
    }
  }
});

test('changing a list item’s callout and changing it back gives back the line', () => {
  for (const line of LINES) {
    if (!listItem(line) || becomesRule(line)) continue;
    const before = calloutAt(line, C)?.callout.char ?? null;
    for (const char of CHARS) {
      const after = apply(line, setCallout(line, char, C));
      assert.equal(apply(after, setCallout(after, before, C)), line, `${JSON.stringify(line)} -> ${char}`);
    }
  }
});

test('cycling through every callout comes back to the line it started from', () => {
  for (const line of LINES) {
    if (!listItem(line) || calloutAt(line, C) !== null || becomesRule(line)) continue;
    let text = line;
    for (let i = 0; i <= C.length; i++) {
      text = apply(text, setCallout(text, nextCallout(calloutAt(text, C)?.callout.char ?? null, C), C));
    }
    assert.equal(text, line);
  }
});

test('the overview finds every callout item outside code and maths, and none inside', () => {
  for (const [name, note] of NOTES) {
    const lines = note.split('\n');
    // Lines inside fenced code or $$ maths, by a reading independent of the plugin's.
    const blocks = protectedPieces(note).filter((p) => /^[ \t>]*(?:```|~~~|\$\$)|^---\n/.test(p) && p.includes('\n'));
    const hidden = new Set<number>();
    let from = 0;
    for (const block of blocks) {
      const at = note.indexOf(block, from);
      const first = note.slice(0, at).split('\n').length - 1;
      block.split('\n').forEach((_, k) => hidden.add(first + k));
      from = at + block.length;
    }
    const found = new Set(extractCallouts(note, C).map((f) => f.line));
    lines.forEach((line, i) => {
      if (hidden.has(i)) assert.ok(!found.has(i), `${name}: line ${i} is in code`);
      else if (calloutAt(line, C)) assert.ok(found.has(i), `${name}: line ${i} ${JSON.stringify(line)} missed`);
    });
  }
});
