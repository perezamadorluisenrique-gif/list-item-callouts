import type { Messages } from '../i18n.ts';

const ko: Messages = {
  // Commands
  'command.openOverview': '콜아웃 모아보기 열기',
  'command.toggleCallout': '목록 항목의 콜아웃 켜기/끄기',
  'command.cycleCallout': '목록 항목의 콜아웃 유형 순환',
  'command.removeCallout': '목록 항목에서 콜아웃 제거',
  'command.chooseCallout': '목록 항목을 콜아웃으로 만들기…',

  // The built-in callouts
  'callout.highlight': '강조',
  'callout.question': '질문',
  'callout.important': '중요',
  'callout.aside': '여담',
  'callout.personOrPlace': '사람 또는 장소',
  'callout.money': '돈',
  'callout.lowPriority': '낮은 우선순위',

  // The overview in the sidebar
  'overview.title': '콜아웃',
  'overview.thisNote': '이 노트',
  'overview.wholeVault': '보관함 전체',
  'overview.emptyNote': '이 노트에는 콜아웃 항목이 없습니다.',
  'overview.emptyVault': '보관함에 콜아웃 항목이 없습니다.',
  'overview.emptyItem': '(비어 있음)',
  'picker.placeholder': '목록 항목에 쓸 콜아웃을 고르세요',

  // Settings
  'setting.colourContinuation.name': '줄바꿈된 줄에도 색 입히기',
  'setting.colourContinuation.desc': '편집기에서 항목의 첫 줄만이 아니라 항목이 이어지는 줄에도 색을 입힙니다.',
  'setting.colourChildren.name': "중첩 항목 색칠",
  'setting.colourChildren.desc': "편집기에서 콜아웃 아래에 중첩된 항목을 해당 콜아웃의 색으로 칠합니다. 읽기 보기에서는 Markdown이 목록을 중첩하는 방식대로 항상 부모 배경 안에 들어갑니다. \"줄바꿈된 줄에도 색 입히기\"이 필요합니다.",
  'setting.syntax.name': '콜아웃 쓰는 법',
  'setting.syntax.desc':
    '목록 항목을 이 문자 중 하나와 공백으로 시작합니다(예: "- & Buy milk"). 아이콘을 설정하면 문자 대신 표시됩니다. "star"나 "alert-triangle" 같은 Lucide 아이콘 이름을 쓸 수 있습니다.',
  'setting.restore.name': '기본값 복원',
  'setting.restore.desc': '콜아웃을 기본 제공되는 일곱 개로 바꿉니다.',
  'setting.legacy.name': 'List Callouts에서 가져오기',
  'setting.legacy.desc': '이 보관함에 List Callouts 플러그인이 설치된 적이 있다면, 거기서 설정한 문자, 색, 아이콘을 복사합니다.',
  'setting.legacy.button': '가져오기',
  'setting.callouts.heading': '콜아웃',
  'setting.callouts.empty': '콜아웃이 없습니다. 하나 추가하거나 기본값을 복원하세요.',
  'setting.callouts.add': '콜아웃 추가',
  'setting.row.char': '문자',
  'setting.row.name': '이름',
  'setting.row.icon': '아이콘',
  'setting.row.background': "배경",
  'setting.row.text': "글자색",
  'setting.row.textReset': "테마 글자색 사용",
  'setting.row.lowContrast.light': "밝은 테마에서 대비가 낮음",
  'setting.row.lowContrast.dark': "어두운 테마에서 대비가 낮음",
  'setting.row.lowContrast.both': "밝은 테마와 어두운 테마에서 대비가 낮음",
  'notice.imported.one': 'List Callouts에서 콜아웃 1개를 가져왔습니다.',
  'notice.imported.other': 'List Callouts에서 콜아웃 {count}개를 가져왔습니다.',
  'notice.noLegacy': '이 보관함에서 List Callouts 설정을 찾지 못했습니다.',
};

export default ko;
