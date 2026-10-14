import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_CALLOUTS, calloutLabel, calloutName } from '../src/callouts.ts';
import { setLocale } from '../src/i18n.ts';

test('a built-in name is shown in the app language until it is renamed; stored names never change', () => {
  const highlight = { ...DEFAULT_CALLOUTS[0] };
  try {
    assert.equal(calloutName(highlight), 'Highlight');
    setLocale('de');
    assert.equal(calloutName(highlight), 'Hervorhebung');
    assert.equal(highlight.name, 'Highlight');
    assert.equal(calloutName({ ...highlight, name: 'Mein Name' }), 'Mein Name');
    setLocale('ja');
    assert.equal(calloutLabel({ char: '??', color: '1, 2, 3' }), '??');
    assert.equal(calloutName({ char: '??', color: '1, 2, 3' }), '');
  } finally {
    setLocale('en');
  }
});

test('every built-in name has a translation key', () => {
  try {
    for (const callout of DEFAULT_CALLOUTS) {
      setLocale('fr');
      assert.notEqual(calloutName({ ...callout }), '', callout.char);
    }
  } finally {
    setLocale('en');
  }
});
