import type { Messages } from '../i18n.ts';

const ja: Messages = {
  // Commands
  'command.openOverview': 'コールアウト一覧を開く',
  'command.toggleCallout': 'リスト項目のコールアウトを切り替え',
  'command.cycleCallout': 'リスト項目のコールアウトの種類を順に切り替え',
  'command.removeCallout': 'リスト項目からコールアウトを削除',
  'command.chooseCallout': 'リスト項目をコールアウトにする…',

  // The built-in callouts
  'callout.highlight': 'ハイライト',
  'callout.question': '質問',
  'callout.important': '重要',
  'callout.aside': '補足',
  'callout.personOrPlace': '人物・場所',
  'callout.money': 'お金',
  'callout.lowPriority': '優先度低',

  // The overview in the sidebar
  'overview.title': 'コールアウト',
  'overview.thisNote': 'このノート',
  'overview.wholeVault': '保管庫全体',
  'overview.emptyNote': 'このノートにコールアウト項目はありません。',
  'overview.emptyVault': '保管庫にコールアウト項目はありません。',
  'overview.emptyItem': '（空）',
  'picker.placeholder': 'リスト項目のコールアウトを選択',

  // Settings
  'setting.colourContinuation.name': '折り返し行にも色を付ける',
  'setting.colourContinuation.desc': 'エディタで、項目の最初の行だけでなく、折り返された行にも色を付けます。',
  'setting.syntax.name': 'コールアウトの書き方',
  'setting.syntax.desc':
    'リスト項目を、これらの文字のいずれかとスペースで始めます（例: "- & Buy milk"）。アイコンを設定すると、文字の代わりに表示されます。"star" や "alert-triangle" など、Lucide の任意のアイコン名を使えます。',
  'setting.restore.name': 'デフォルトに戻す',
  'setting.restore.desc': 'コールアウトを、組み込みの 7 つに置き換えます。',
  'setting.legacy.name': 'List Callouts からインポート',
  'setting.legacy.desc': 'この保管庫に List Callouts プラグインが入っていたことがあれば、そこで設定した文字、色、アイコンをコピーします。',
  'setting.legacy.button': 'インポート',
  'setting.callouts.heading': 'コールアウト',
  'setting.callouts.empty': 'コールアウトがありません。追加するか、デフォルトに戻してください。',
  'setting.callouts.add': 'コールアウトを追加',
  'setting.row.char': '文字',
  'setting.row.name': '名前',
  'setting.row.icon': 'アイコン',
  'notice.imported.one': 'List Callouts から 1 件のコールアウトをインポートしました。',
  'notice.imported.other': 'List Callouts から {count} 件のコールアウトをインポートしました。',
  'notice.noLegacy': 'この保管庫に List Callouts の設定は見つかりませんでした。',
};

export default ja;
