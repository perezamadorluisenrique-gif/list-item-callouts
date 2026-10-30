import type { Messages } from '../i18n.ts';

const zh: Messages = {
  // Commands
  'command.openOverview': '打开标注总览',
  'command.toggleCallout': '切换列表项的标注',
  'command.cycleCallout': '循环切换列表项的标注类型',
  'command.removeCallout': '移除列表项的标注',
  'command.chooseCallout': '将列表项设为标注…',

  // The built-in callouts
  'callout.highlight': '高亮',
  'callout.question': '问题',
  'callout.important': '重要',
  'callout.aside': '旁注',
  'callout.personOrPlace': '人物或地点',
  'callout.money': '金钱',
  'callout.lowPriority': '低优先级',

  // The overview in the sidebar
  'overview.title': '标注',
  'overview.thisNote': '此笔记',
  'overview.wholeVault': '整个仓库',
  'overview.emptyNote': '此笔记中没有标注项。',
  'overview.emptyVault': '仓库中没有标注项。',
  'overview.emptyItem': '（空）',
  'picker.placeholder': '为列表项选择标注',

  // Settings
  'setting.colourContinuation.name': '为折行着色',
  'setting.colourContinuation.desc': '在编辑器中，不仅为列表项的第一行着色，也为它折到的后续行着色。',
  'setting.colourChildren.name': "为嵌套项着色",
  'setting.colourChildren.desc': "在编辑器中用标注的颜色为其下嵌套的项着色。阅读视图始终把它们放在父项的背景内，因为 Markdown 就是这样嵌套列表的。需要开启“为折行着色”。",
  'setting.syntax.name': '如何书写标注',
  'setting.syntax.desc':
    '列表项以这些字符之一加一个空格开头，例如 "- & Buy milk"。若设置了图标，则用图标代替该字符显示；可使用任何 Lucide 图标名称，例如 "star" 或 "alert-triangle"。',
  'setting.restore.name': '恢复默认',
  'setting.restore.desc': '用七个内置标注替换你的标注。',
  'setting.legacy.name': '从 List Callouts 导入',
  'setting.legacy.desc': '如果此仓库中曾安装过 List Callouts 插件，则复制你在其中设置的字符、颜色和图标。',
  'setting.legacy.button': '导入',
  'setting.callouts.heading': '标注',
  'setting.callouts.empty': '没有标注。请添加一个，或恢复默认。',
  'setting.callouts.add': '添加标注',
  'setting.row.char': '字符',
  'setting.row.name': '名称',
  'setting.row.icon': '图标',
  'setting.row.background': "背景",
  'setting.row.text': "文字颜色",
  'setting.row.textReset': "使用主题文字颜色",
  'setting.row.lowContrast.light': "浅色主题下对比度偏低",
  'setting.row.lowContrast.dark': "深色主题下对比度偏低",
  'setting.row.lowContrast.both': "浅色和深色主题下对比度偏低",
  'notice.imported.one': '已从 List Callouts 导入 1 个标注。',
  'notice.imported.other': '已从 List Callouts 导入 {count} 个标注。',
  'notice.noLegacy': '在此仓库中没有找到 List Callouts 的设置。',
};

export default zh;
