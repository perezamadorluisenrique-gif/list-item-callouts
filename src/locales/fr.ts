import type { Messages } from '../i18n.ts';

const fr: Messages = {
  // Commands
  'command.openOverview': 'Ouvrir la vue d’ensemble des mises en avant',
  'command.toggleCallout': 'Activer ou retirer la mise en avant de l’élément de liste',
  'command.cycleCallout': 'Passer au type de mise en avant suivant pour l’élément de liste',
  'command.removeCallout': 'Retirer la mise en avant de l’élément de liste',
  'command.chooseCallout': 'Faire de l’élément de liste une mise en avant…',

  // The built-in callouts
  'callout.highlight': 'Surlignage',
  'callout.question': 'Question',
  'callout.important': 'Important',
  'callout.aside': 'En aparté',
  'callout.personOrPlace': 'Personne ou lieu',
  'callout.money': 'Argent',
  'callout.lowPriority': 'Priorité basse',

  // The overview in the sidebar
  'overview.title': 'Mises en avant',
  'overview.thisNote': 'Cette note',
  'overview.wholeVault': 'Tout le coffre',
  'overview.emptyNote': 'Aucun élément mis en avant dans cette note.',
  'overview.emptyVault': 'Aucun élément mis en avant dans le coffre.',
  'overview.emptyItem': '(vide)',
  'picker.placeholder': 'Choisir une mise en avant pour l’élément de liste',

  // Settings
  'setting.colourContinuation.name': 'Colorer les lignes coupées',
  'setting.colourContinuation.desc': 'Colore dans l’éditeur les lignes sur lesquelles un élément se prolonge, pas seulement sa première ligne.',
  'setting.syntax.name': 'Écrire une mise en avant',
  'setting.syntax.desc':
    'Commencez un élément de liste par l’un de ces caractères suivi d’une espace, comme dans "- & Buy milk". Une icône, si elle est définie, s’affiche à la place du caractère ; utilisez n’importe quel nom d’icône Lucide, comme "star" ou "alert-triangle".',
  'setting.restore.name': 'Rétablir les valeurs par défaut',
  'setting.restore.desc': 'Remplace vos mises en avant par les sept intégrées.',
  'setting.legacy.name': 'Importer depuis List Callouts',
  'setting.legacy.desc':
    'Copie les caractères, couleurs et icônes que vous aviez définis dans le module List Callouts, s’il a déjà été installé dans ce coffre.',
  'setting.legacy.button': 'Importer',
  'setting.callouts.heading': 'Mises en avant',
  'setting.callouts.empty': 'Aucune mise en avant. Ajoutez-en une ou rétablissez les valeurs par défaut.',
  'setting.callouts.add': 'Ajouter une mise en avant',
  'setting.row.char': 'Caractère',
  'setting.row.name': 'Nom',
  'setting.row.icon': 'Icône',
  'notice.imported.one': '1 mise en avant importée depuis List Callouts.',
  'notice.imported.other': '{count} mises en avant importées depuis List Callouts.',
  'notice.noLegacy': 'Aucun réglage de List Callouts n’a été trouvé dans ce coffre.',
};

export default fr;
