// The source of the message keys and the fallback language. Every other file in
// this folder must have exactly these keys and the same {placeholders}; the
// build fails on a missing or extra key and `tests/i18n.test.ts` checks the rest.
// Not here: the callout characters and the names and colours the user gave them,
// which are the user's own data in data.json. The seven built-in names are the
// exception: they are shown in the app's language while the user has not
// renamed them (`callout.*` below).
const en = {
  // Commands
  'command.openOverview': 'Open the callout overview',
  'command.toggleCallout': 'Toggle callout on the list item',
  'command.cycleCallout': 'Cycle callout type on the list item',
  'command.removeCallout': 'Remove callout from the list item',
  'command.chooseCallout': 'Make the list item a callout…',

  // The built-in callouts, by their English names
  'callout.highlight': 'Highlight',
  'callout.question': 'Question',
  'callout.important': 'Important',
  'callout.aside': 'Aside',
  'callout.personOrPlace': 'Person or place',
  'callout.money': 'Money',
  'callout.lowPriority': 'Low priority',

  // The overview in the sidebar
  'overview.title': 'Callouts',
  'overview.thisNote': 'This note',
  'overview.wholeVault': 'Whole vault',
  'overview.emptyNote': 'No callout items in this note.',
  'overview.emptyVault': 'No callout items in the vault.',
  'overview.emptyItem': '(Empty)',
  'picker.placeholder': 'Pick a callout for the list item',

  // Settings
  'setting.colourContinuation.name': 'Colour wrapped lines',
  'setting.colourContinuation.desc': 'Colour the lines an item wraps onto in the editor, not just its first line.',
  'setting.colourChildren.name': "Colour nested items",
  'setting.colourChildren.desc': "Colour the items nested under a callout with its colour in the editor. Reading view always keeps them inside the parent's background, because that is how Markdown nests a list. Needs wrapped lines to be coloured too.",
  'setting.syntax.name': 'Writing a callout',
  'setting.syntax.desc':
    'Start a list item with one of these characters and a space, as in "- & Buy milk". An icon, if set, is shown in place of the character; use any Lucide icon name, such as "star" or "alert-triangle".',
  'setting.restore.name': 'Restore defaults',
  'setting.restore.desc': 'Replace your callouts with the seven built-in ones.',
  'setting.legacy.name': 'Import from List Callouts',
  'setting.legacy.desc':
    'Copy the characters, colours and icons you set up in the List Callouts plugin, if it was ever installed in this vault.',
  'setting.legacy.button': 'Import',
  'setting.callouts.heading': 'Callouts',
  'setting.callouts.empty': 'No callouts. Add one, or restore the defaults.',
  'setting.callouts.add': 'Add callout',
  'setting.row.char': 'Char',
  'setting.row.name': 'Name',
  'setting.row.icon': 'Icon',
  'setting.row.background': "Background",
  'setting.row.text': "Text colour",
  'setting.row.textReset': "Use the theme's text colour",
  'setting.row.lowContrast.light': "Low contrast in the light theme",
  'setting.row.lowContrast.dark': "Low contrast in the dark theme",
  'setting.row.lowContrast.both': "Low contrast in the light and dark themes",
  'notice.imported.one': 'Imported 1 callout from List Callouts.',
  'notice.imported.other': 'Imported {count} callouts from List Callouts.',
  'notice.noLegacy': 'No List Callouts settings were found in this vault.',
} as const;

export default en;
