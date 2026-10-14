import type { Messages } from '../i18n.ts';

const ru: Messages = {
  // Commands
  'command.openOverview': 'Открыть обзор выносных блоков',
  'command.toggleCallout': 'Включить или убрать выносной блок у пункта списка',
  'command.cycleCallout': 'Переключить тип выносного блока у пункта списка',
  'command.removeCallout': 'Убрать выносной блок у пункта списка',
  'command.chooseCallout': 'Сделать пункт списка выносным блоком…',

  // The built-in callouts
  'callout.highlight': 'Выделение',
  'callout.question': 'Вопрос',
  'callout.important': 'Важно',
  'callout.aside': 'Замечание',
  'callout.personOrPlace': 'Человек или место',
  'callout.money': 'Деньги',
  'callout.lowPriority': 'Низкий приоритет',

  // The overview in the sidebar
  'overview.title': 'Выносные блоки',
  'overview.thisNote': 'Эта заметка',
  'overview.wholeVault': 'Всё хранилище',
  'overview.emptyNote': 'В этой заметке нет пунктов с выносными блоками.',
  'overview.emptyVault': 'В хранилище нет пунктов с выносными блоками.',
  'overview.emptyItem': '(пусто)',
  'picker.placeholder': 'Выберите выносной блок для пункта списка',

  // Settings
  'setting.colourContinuation.name': 'Раскрашивать перенесённые строки',
  'setting.colourContinuation.desc': 'Раскрашивает в редакторе строки, на которые переносится пункт, а не только его первую строку.',
  'setting.syntax.name': 'Как записать выносной блок',
  'setting.syntax.desc':
    'Начните пункт списка с одного из этих символов и пробела, как в "- & Buy milk". Значок, если он задан, показывается вместо символа; можно использовать любое имя значка Lucide, например "star" или "alert-triangle".',
  'setting.restore.name': 'Восстановить значения по умолчанию',
  'setting.restore.desc': 'Заменяет ваши выносные блоки семью встроенными.',
  'setting.legacy.name': 'Импортировать из List Callouts',
  'setting.legacy.desc':
    'Копирует символы, цвета и значки, которые вы настроили в плагине List Callouts, если он когда-либо был установлен в этом хранилище.',
  'setting.legacy.button': 'Импортировать',
  'setting.callouts.heading': 'Выносные блоки',
  'setting.callouts.empty': 'Выносных блоков нет. Добавьте один или восстановите значения по умолчанию.',
  'setting.callouts.add': 'Добавить выносной блок',
  'setting.row.char': 'Символ',
  'setting.row.name': 'Название',
  'setting.row.icon': 'Значок',
  'notice.imported.one': 'Из List Callouts импортирован 1 выносной блок.',
  'notice.imported.other': 'Из List Callouts импортировано выносных блоков: {count}.',
  'notice.noLegacy': 'В этом хранилище не найдено настроек List Callouts.',
};

export default ru;
