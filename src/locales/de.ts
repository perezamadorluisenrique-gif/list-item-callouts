import type { Messages } from '../i18n.ts';

const de: Messages = {
  // Commands
  'command.openOverview': 'Callout-Übersicht öffnen',
  'command.toggleCallout': 'Callout am Listeneintrag umschalten',
  'command.cycleCallout': 'Callout-Typ am Listeneintrag durchschalten',
  'command.removeCallout': 'Callout vom Listeneintrag entfernen',
  'command.chooseCallout': 'Listeneintrag zum Callout machen…',

  // The built-in callouts
  'callout.highlight': 'Hervorhebung',
  'callout.question': 'Frage',
  'callout.important': 'Wichtig',
  'callout.aside': 'Nebenbei',
  'callout.personOrPlace': 'Person oder Ort',
  'callout.money': 'Geld',
  'callout.lowPriority': 'Niedrige Priorität',

  // The overview in the sidebar
  'overview.title': 'Callouts',
  'overview.thisNote': 'Diese Notiz',
  'overview.wholeVault': 'Ganzer Vault',
  'overview.emptyNote': 'Keine Callout-Einträge in dieser Notiz.',
  'overview.emptyVault': 'Keine Callout-Einträge im Vault.',
  'overview.emptyItem': '(leer)',
  'picker.placeholder': 'Callout für den Listeneintrag wählen',

  // Settings
  'setting.colourContinuation.name': 'Umbrochene Zeilen einfärben',
  'setting.colourContinuation.desc': 'Färbt im Editor auch die Zeilen ein, auf die ein Eintrag umbricht, nicht nur seine erste Zeile.',
  'setting.colourChildren.name': "Verschachtelte Einträge färben",
  'setting.colourChildren.desc': "Färbt im Editor die unter einem Callout verschachtelten Einträge mit dessen Farbe. Die Leseansicht hält sie immer im Hintergrund des übergeordneten Eintrags, weil Markdown Listen so verschachtelt. Setzt „Umbrochene Zeilen einfärben“ voraus.",
  'setting.syntax.name': 'Einen Callout schreiben',
  'setting.syntax.desc':
    'Beginne einen Listeneintrag mit einem dieser Zeichen und einem Leerzeichen, etwa "- & Buy milk". Ein Symbol, falls festgelegt, wird anstelle des Zeichens angezeigt; verwende einen beliebigen Lucide-Symbolnamen, etwa "star" oder "alert-triangle".',
  'setting.restore.name': 'Standardwerte wiederherstellen',
  'setting.restore.desc': 'Ersetzt deine Callouts durch die sieben eingebauten.',
  'setting.legacy.name': 'Aus List Callouts importieren',
  'setting.legacy.desc':
    'Kopiert die Zeichen, Farben und Symbole, die du in der Erweiterung List Callouts eingerichtet hast, falls sie je in diesem Vault installiert war.',
  'setting.legacy.button': 'Importieren',
  'setting.callouts.heading': 'Callouts',
  'setting.callouts.empty': 'Keine Callouts. Füge einen hinzu oder stelle die Standardwerte wieder her.',
  'setting.callouts.add': 'Callout hinzufügen',
  'setting.row.char': 'Zeichen',
  'setting.row.name': 'Name',
  'setting.row.icon': 'Symbol',
  'setting.row.background': "Hintergrund",
  'setting.row.text': "Textfarbe",
  'setting.row.textReset': "Textfarbe des Themes verwenden",
  'setting.row.lowContrast.light': "Geringer Kontrast im hellen Theme",
  'setting.row.lowContrast.dark': "Geringer Kontrast im dunklen Theme",
  'setting.row.lowContrast.both': "Geringer Kontrast im hellen und dunklen Theme",
  'notice.imported.one': '1 Callout aus List Callouts importiert.',
  'notice.imported.other': '{count} Callouts aus List Callouts importiert.',
  'notice.noLegacy': 'In diesem Vault wurden keine Einstellungen von List Callouts gefunden.',
};

export default de;
