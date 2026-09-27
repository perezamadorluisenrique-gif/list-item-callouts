import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_CALLOUTS,
  calloutAt,
  calloutAtText,
  continuationLines,
  listItem,
  nextCallout,
  readCallouts,
  setCallout,
  toHex,
  toRgb,
  validChar,
} from '../src/callouts.ts';

const C = DEFAULT_CALLOUTS;
const at = (line: string) => {
  const m = calloutAt(line, C);
  return m ? [m.callout.char, m.from, m.to] : null;
};

test('finds a callout after any list marker and task box', () => {
  assert.deepEqual(at('- & milk'), ['&', 2, 3]);
  assert.deepEqual(at('  * ! careful'), ['!', 4, 5]);
  assert.deepEqual(at('+ ? why'), ['?', 2, 3]);
  assert.deepEqual(at('12. @ Ana'), ['@', 4, 5]);
  assert.deepEqual(at('3) ~ aside'), ['~', 3, 4]);
  assert.deepEqual(at('- [ ] & task'), ['&', 6, 7]);
  assert.deepEqual(at('- [x] $ paid'), ['$', 6, 7]);
  assert.deepEqual(at('\t- %'), ['%', 3, 4]);
});

test('needs a space after the character', () => {
  assert.equal(at('- $5 each'), null);
  assert.equal(at('- &nbsp;'), null);
  assert.equal(at('& not a list'), null);
  assert.equal(at('-& no space after marker'), null);
  assert.equal(at('- - -'), null);
});

test('longer characters win', () => {
  const custom = [...C, { char: '!!', color: '1, 2, 3' }];
  assert.equal(calloutAt('- !! urgent', custom)?.callout.char, '!!');
  assert.equal(calloutAt('- ! normal', custom)?.callout.char, '!');
});

test('rendered text', () => {
  assert.equal(calloutAtText('& milk', C)?.char, '&');
  assert.equal(calloutAtText('&milk', C), null);
  assert.equal(calloutAtText('!', C)?.char, '!');
});

test('continuation lines belong to the item', () => {
  const lines = ['- & first', 'lazy line', '  indented', '- next', '- ! x', '', 'after'];
  assert.equal(continuationLines(lines, 0), 2);
  assert.equal(continuationLines(lines, 4), 0);
  assert.equal(continuationLines(['- & a', '## Heading'], 0), 0);
});

test('setCallout adds, changes and removes', () => {
  const apply = (line: string, char: string | null) => {
    const e = setCallout(line, char, C);
    return e ? line.slice(0, e.from) + e.insert + line.slice(e.to) : line;
  };
  assert.equal(apply('- milk', '&'), '- & milk');
  assert.equal(apply('- [ ] task', '!'), '- [ ] ! task');
  assert.equal(apply('- & milk', '!'), '- ! milk');
  assert.equal(apply('- & milk', null), '- milk');
  assert.equal(apply('- &', null), '- ');
  assert.equal(apply('  plain text', '?'), '  - ? plain text');
  assert.equal(apply('', '&'), '- & ');
  assert.equal(setCallout('- & milk', '&', C), null);
  assert.equal(setCallout('- milk', null, C), null);
});

test('nextCallout cycles through the list and back to none', () => {
  assert.equal(nextCallout(null, C), '&');
  assert.equal(nextCallout('&', C), '?');
  assert.equal(nextCallout('%', C), null);
  assert.equal(nextCallout('x', C), null);
  assert.equal(nextCallout(null, []), null);
});

test('colours', () => {
  assert.equal(toRgb('#ff9100'), '255, 145, 0');
  assert.equal(toRgb('f00'), '255, 0, 0');
  assert.equal(toRgb('rgb(1,2,3)'), '1, 2, 3');
  assert.equal(toRgb('255,214,0'), '255, 214, 0');
  assert.equal(toRgb('300, 0, 0'), null);
  assert.equal(toRgb('red'), null);
  assert.equal(toHex('255, 145, 0'), '#ff9100');
});

test('valid characters', () => {
  for (const ok of ['&', '!!', '→', '★', '??!']) assert.equal(validChar(ok), true, ok);
  for (const bad of ['', ' ', 'a b', '-', '*', '1', '[', 'abcd']) assert.equal(validChar(bad), false, bad);
});

test('reads List Callouts settings and its own', () => {
  const legacy = [
    { color: '255, 214, 0', char: '&' },
    { color: '255, 145, 0', char: '?', icon: 'help-circle' },
    { color: 'junk', char: '!' },
    { color: '#00ff00', char: '✓', custom: true },
    { color: '1, 1, 1', char: '&' },
    'nonsense',
  ];
  assert.deepEqual(readCallouts(legacy), [
    { char: '&', color: '255, 214, 0', name: 'Highlight' },
    { char: '?', color: '255, 145, 0', icon: 'help-circle', name: 'Question' },
    { char: '✓', color: '0, 255, 0' },
  ]);
  assert.equal(readCallouts(null), null);
  assert.equal(readCallouts([]), null);
});

test('listItem', () => {
  assert.deepEqual(listItem('  - [ ] x'), { indent: '  ', textStart: 8 });
  assert.equal(listItem('text'), null);
});
