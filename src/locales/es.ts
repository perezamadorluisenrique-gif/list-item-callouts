import type { Messages } from '../i18n.ts';

const es: Messages = {
  // Commands
  'command.openOverview': 'Abrir el resumen de destacados',
  'command.toggleCallout': 'Activar o quitar el destacado del elemento de lista',
  'command.cycleCallout': 'Cambiar al siguiente tipo de destacado del elemento de lista',
  'command.removeCallout': 'Quitar el destacado del elemento de lista',
  'command.chooseCallout': 'Convertir el elemento de lista en un destacado…',

  // The built-in callouts
  'callout.highlight': 'Resaltado',
  'callout.question': 'Pregunta',
  'callout.important': 'Importante',
  'callout.aside': 'Aparte',
  'callout.personOrPlace': 'Persona o lugar',
  'callout.money': 'Dinero',
  'callout.lowPriority': 'Prioridad baja',

  // The overview in the sidebar
  'overview.title': 'Destacados',
  'overview.thisNote': 'Esta nota',
  'overview.wholeVault': 'Toda la bóveda',
  'overview.emptyNote': 'No hay elementos destacados en esta nota.',
  'overview.emptyVault': 'No hay elementos destacados en la bóveda.',
  'overview.emptyItem': '(vacío)',
  'picker.placeholder': 'Elige un destacado para el elemento de lista',

  // Settings
  'setting.colourContinuation.name': 'Colorear las líneas partidas',
  'setting.colourContinuation.desc': 'Colorea en el editor las líneas a las que se extiende un elemento, no solo su primera línea.',
  'setting.colourChildren.name': "Colorear elementos anidados",
  'setting.colourChildren.desc': "Colorea en el editor los elementos anidados bajo un callout con su color. La vista de lectura siempre los deja dentro del fondo del padre, porque así anida Markdown una lista. Requiere «Colorear las líneas partidas».",
  'setting.syntax.name': 'Cómo escribir un destacado',
  'setting.syntax.desc':
    'Empieza un elemento de lista con uno de estos caracteres y un espacio, como en "- & Buy milk". Si se define un icono, se muestra en lugar del carácter; usa cualquier nombre de icono de Lucide, como "star" o "alert-triangle".',
  'setting.restore.name': 'Restaurar valores predeterminados',
  'setting.restore.desc': 'Sustituye tus destacados por los siete incluidos.',
  'setting.legacy.name': 'Importar desde List Callouts',
  'setting.legacy.desc':
    'Copia los caracteres, colores e iconos que configuraste en el complemento List Callouts, si alguna vez estuvo instalado en esta bóveda.',
  'setting.legacy.button': 'Importar',
  'setting.callouts.heading': 'Destacados',
  'setting.callouts.empty': 'No hay destacados. Añade uno o restaura los predeterminados.',
  'setting.callouts.add': 'Añadir destacado',
  'setting.row.char': 'Carácter',
  'setting.row.name': 'Nombre',
  'setting.row.icon': 'Icono',
  'setting.row.background': "Fondo",
  'setting.row.text': "Color del texto",
  'setting.row.textReset': "Usar el color de texto del tema",
  'setting.row.lowContrast.light': "Contraste bajo en el tema claro",
  'setting.row.lowContrast.dark': "Contraste bajo en el tema oscuro",
  'setting.row.lowContrast.both': "Contraste bajo en los temas claro y oscuro",
  'notice.imported.one': 'Se importó 1 destacado desde List Callouts.',
  'notice.imported.other': 'Se importaron {count} destacados desde List Callouts.',
  'notice.noLegacy': 'No se encontraron ajustes de List Callouts en esta bóveda.',
};

export default es;
