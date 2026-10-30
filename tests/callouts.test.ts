import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_CALLOUTS,
  calloutAt,
  blockOwner,
  calloutAtText,
  continuationLines,
  contrastRatio,
  effectiveBg,
  itemBlock,
  lowContrastThemes,
  paintPlan,
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

const TREE = ['- ! Parent', '  - child', '    - grandchild', '  - ? own colour', '    - its child', '  - back to parent', '- sibling'];

test('itemBlock covers children and grandchildren and stops at a sibling', () => {
  assert.equal(itemBlock(TREE, 0), 5);
  assert.equal(itemBlock(TREE, 1), 1);
  assert.equal(itemBlock(TREE, 3), 1);
  assert.equal(itemBlock(TREE, 6), 0);
});

test('itemBlock: blank lines, headings and lazy continuation', () => {
  assert.equal(itemBlock(['- & a', '', '  - b', '- c'], 0), 2);
  assert.equal(itemBlock(['- & a', '', '', '  - b'], 0), 0);
  assert.equal(itemBlock(['- & a', '', '- b'], 0), 0);
  assert.equal(itemBlock(['- & a', '  - b', '## Heading', '  - c'], 0), 1);
  assert.equal(itemBlock(['- & a', 'lazy', '  - b'], 0), 2);
  assert.equal(itemBlock(['- & a', '---', '  - b'], 0), 0);
  assert.equal(itemBlock(['- & a'], 0), 0);
});

test('itemBlock: tabs count as tabSize columns, ordered parents work', () => {
  assert.equal(itemBlock(['- & a', '\t- b', '- c'], 0, 4), 1);
  assert.equal(itemBlock(['  - & a', '\t- b'], 0, 4), 1);
  assert.equal(itemBlock(['1. & a', '   - b', '2. c'], 0), 1);
});

test('blockOwner finds the outermost item', () => {
  assert.equal(blockOwner(TREE, 2), 0);
  assert.equal(blockOwner(TREE, 4), 0);
  assert.equal(blockOwner(TREE, 0), null);
  assert.equal(blockOwner(['text', '', 'more text'], 2), null);
  assert.equal(blockOwner(['- a', '## H', '  - b'], 2), null);
  const deep = ['- ! top', ...Array.from({ length: 50 }, () => '  - x')];
  assert.equal(blockOwner(deep, 50), 0);
  assert.equal(blockOwner(deep, 50, 4, 10), null);
});

test('paintPlan colours children, a nested callout keeps its own colour', () => {
  const plan = paintPlan(TREE, C, { colourContinuation: true, colourChildren: true });
  assert.deepEqual(
    plan.map((p) => `${p.line}${p.callout.char}${p.role[0]}`),
    ['0!f', '1!c', '2!c', '3?f', '4?c', '5!c'],
  );
  assert.deepEqual(plan.map((p) => `${+p.first}${+p.last}`), ['10', '00', '01', '10', '01', '11']);
});

test('paintPlan with colourChildren off paints the item and its wrapped lines only', () => {
  const lines = ['- & a', 'wrapped', '  - child', '- b'];
  const plan = paintPlan(lines, C, { colourContinuation: true, colourChildren: false });
  assert.deepEqual(plan.map((p) => [p.line, p.role]), [[0, 'first'], [1, 'continued']]);
  const off = paintPlan(lines, C, { colourContinuation: false, colourChildren: true });
  assert.deepEqual(off.map((p) => p.line), [0]);
});

test('paintPlan skips callouts inside code and carries the text colour', () => {
  const callouts = [{ char: '&', color: '255, 0, 0', textColor: '1, 2, 3' }];
  const plan = paintPlan(['- & a', '  - b'], callouts, { colourContinuation: true, colourChildren: true });
  assert.equal(plan[1].callout.textColor, '1, 2, 3');
  const code = paintPlan(['- & a'], callouts, { colourContinuation: true, colourChildren: true, isCode: () => true });
  assert.equal(code.length, 0);
});

test('readCallouts keeps a valid text colour and drops an invalid one', () => {
  const read = readCallouts([
    { char: '&', color: '255, 214, 0', textColor: '#c80000' },
    { char: '?', color: '255, 145, 0', textColour: 'rgb(1, 2, 3)' },
    { char: '!', color: '255, 23, 68', textColor: 'blue' },
    { char: '~', color: '124, 77, 255' },
  ]);
  assert.equal(read?.[0].textColor, '200, 0, 0');
  assert.equal(read?.[1].textColor, '1, 2, 3');
  assert.equal(read?.[2].char, '!');
  assert.equal('textColor' in (read?.[2] ?? {}), false);
  assert.equal('textColor' in (read?.[3] ?? {}), false);
});

test('contrastRatio, effectiveBg and the low-contrast warning', () => {
  assert.equal(contrastRatio('0, 0, 0', '255, 255, 255'), 21);
  assert.equal(contrastRatio('9, 9, 9', '9, 9, 9'), 1);
  assert.equal(effectiveBg('255, 0, 0', 0.5, '255, 255, 255'), '255, 128, 128');
  assert.deepEqual(lowContrastThemes({ char: '&', color: '255, 214, 0' }), []);
  assert.deepEqual(lowContrastThemes({ char: '&', color: '255, 214, 0', textColor: '255, 255, 255' }), ['light']);
  assert.deepEqual(lowContrastThemes({ char: '&', color: '255, 214, 0', textColor: '255, 255, 0' }).includes('light'), true);
  assert.deepEqual(lowContrastThemes({ char: '&', color: '255, 214, 0', textColor: '0, 0, 0' }), ['dark']);
});
