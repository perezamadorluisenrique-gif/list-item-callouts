import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_CALLOUTS } from '../src/callouts.ts';
import { extractCallouts, groupByCallout, plainText, truncate } from '../src/overview.ts';

const C = DEFAULT_CALLOUTS;

test('finds callout items with line, character and text', () => {
  const note = ['# T', '- & Milk', '- plain', '1. ? Ask Ana', '- [ ] ! Pay rent'].join('\n');
  assert.deepEqual(extractCallouts(note, C), [
    { line: 1, char: '&', text: 'Milk' },
    { line: 3, char: '?', text: 'Ask Ana' },
    { line: 4, char: '!', text: 'Pay rent' },
  ]);
});

test('finds nested items and keeps their line numbers', () => {
  const note = '- parent\n  - & child\n    - ! grandchild\n';
  assert.deepEqual(
    extractCallouts(note, C).map((f) => [f.line, f.char]),
    [[1, '&'], [2, '!']],
  );
});

test('does not count a character without a space, or a bare paragraph', () => {
  assert.deepEqual(extractCallouts('- $5 each\n& not a list\n- &nospace', C), []);
});

test('skips fenced code, tilde fences, maths and front matter', () => {
  const note = [
    '---',
    '- & in front matter',
    '---',
    '```',
    '- & in code',
    '```',
    '- & kept 1',
    '~~~js',
    '- ! in tilde',
    '~~~',
    '$$',
    '- ? in maths',
    '$$',
    '- ! kept 2',
    '````',
    '```',
    '- & still code',
    '````',
    '- ~ kept 3',
  ].join('\n');
  assert.deepEqual(
    extractCallouts(note, C).map((f) => f.text),
    ['kept 1', 'kept 2', 'kept 3'],
  );
});

test('an unclosed fence hides the rest, like the editor', () => {
  assert.deepEqual(extractCallouts('```\n- & x', C), []);
});

test('uses the configured characters, longest first, and handles CRLF', () => {
  const custom = [
    { char: '!', color: '1, 1, 1' },
    { char: '!!', color: '2, 2, 2' },
    { char: '★', color: '3, 3, 3' },
  ];
  const found = extractCallouts('- !! urgent\r\n- ! warn\r\n- ★ star', custom);
  assert.deepEqual(found.map((f) => [f.line, f.char, f.text]), [[0, '!!', 'urgent'], [1, '!', 'warn'], [2, '★', 'star']]);
});

test('an empty callout list or note finds nothing', () => {
  assert.deepEqual(extractCallouts('- & x', []), []);
  assert.deepEqual(extractCallouts('', C), []);
});

test('plainText strips markup', () => {
  assert.equal(plainText('Call **Ana** about [[Trip|the trip]] and [docs](https://x.y) `now` ^abc'), 'Call Ana about the trip and docs now');
  assert.equal(plainText('see [[Folder/Note#Head]] and *this*'), 'see Head and this');
  assert.equal(plainText('2 * 3 * 4'), '2 * 3 * 4');
});

test('truncate cuts on characters and adds an ellipsis', () => {
  assert.equal(truncate('short', 10), 'short');
  assert.equal(truncate('abcdefghij', 5), 'abcd…');
  assert.equal(truncate('★★★★★★', 3), '★★…');
});

test('groupByCallout follows the configured order and drops empty groups', () => {
  const items = [{ char: '!' }, { char: '&' }, { char: '!' }, { char: 'gone' }];
  const groups = groupByCallout(items, C);
  assert.deepEqual(groups.map((g) => [g.callout.char, g.items.length]), [['&', 1], ['!', 2]]);
});
