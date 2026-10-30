import type { Messages } from '../i18n.ts';

const ptBR: Messages = {
  // Commands
  'command.openOverview': 'Abrir a visão geral dos destaques',
  'command.toggleCallout': 'Alternar o destaque do item da lista',
  'command.cycleCallout': 'Alternar entre os tipos de destaque do item da lista',
  'command.removeCallout': 'Remover o destaque do item da lista',
  'command.chooseCallout': 'Transformar o item da lista em destaque…',

  // The built-in callouts
  'callout.highlight': 'Realce',
  'callout.question': 'Pergunta',
  'callout.important': 'Importante',
  'callout.aside': 'Observação',
  'callout.personOrPlace': 'Pessoa ou lugar',
  'callout.money': 'Dinheiro',
  'callout.lowPriority': 'Baixa prioridade',

  // The overview in the sidebar
  'overview.title': 'Destaques',
  'overview.thisNote': 'Esta nota',
  'overview.wholeVault': 'Cofre inteiro',
  'overview.emptyNote': 'Não há itens com destaque nesta nota.',
  'overview.emptyVault': 'Não há itens com destaque no cofre.',
  'overview.emptyItem': '(vazio)',
  'picker.placeholder': 'Escolha um destaque para o item da lista',

  // Settings
  'setting.colourContinuation.name': 'Colorir linhas quebradas',
  'setting.colourContinuation.desc': 'Colore no editor as linhas para as quais um item se estende, não apenas a primeira linha.',
  'setting.colourChildren.name': "Colorir itens aninhados",
  'setting.colourChildren.desc': "Colore no editor os itens aninhados sob um callout com a cor dele. A visualização de leitura sempre os mantém dentro do fundo do item pai, porque é assim que o Markdown aninha uma lista. Requer \"Colorir linhas quebradas\".",
  'setting.syntax.name': 'Como escrever um destaque',
  'setting.syntax.desc':
    'Comece um item da lista com um destes caracteres e um espaço, como em "- & Buy milk". Um ícone, se definido, aparece no lugar do caractere; use qualquer nome de ícone do Lucide, como "star" ou "alert-triangle".',
  'setting.restore.name': 'Restaurar padrões',
  'setting.restore.desc': 'Substitui seus destaques pelos sete embutidos.',
  'setting.legacy.name': 'Importar do List Callouts',
  'setting.legacy.desc': 'Copia os caracteres, as cores e os ícones que você configurou no plugin List Callouts, se ele já esteve instalado neste cofre.',
  'setting.legacy.button': 'Importar',
  'setting.callouts.heading': 'Destaques',
  'setting.callouts.empty': 'Nenhum destaque. Adicione um ou restaure os padrões.',
  'setting.callouts.add': 'Adicionar destaque',
  'setting.row.char': 'Caractere',
  'setting.row.name': 'Nome',
  'setting.row.icon': 'Ícone',
  'setting.row.background': "Fundo",
  'setting.row.text': "Cor do texto",
  'setting.row.textReset': "Usar a cor de texto do tema",
  'setting.row.lowContrast.light': "Contraste baixo no tema claro",
  'setting.row.lowContrast.dark': "Contraste baixo no tema escuro",
  'setting.row.lowContrast.both': "Contraste baixo nos temas claro e escuro",
  'notice.imported.one': '1 destaque importado do List Callouts.',
  'notice.imported.other': '{count} destaques importados do List Callouts.',
  'notice.noLegacy': 'Nenhuma configuração do List Callouts foi encontrada neste cofre.',
};

export default ptBR;
