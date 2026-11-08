# Changelog

Todas as alterações relevantes deste projeto são documentadas neste ficheiro.

Este documento segue as boas práticas do
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao
[Semantic Versioning](https://semver.org/lang/pt-BR/) (SemVer), no formato
`MAJOR.MINOR.PATCH`:

- **MAJOR** — alterações incompatíveis, por exemplo mudar o formato dos dados
  guardados de forma que impeça a leitura dos dados antigos.
- **MINOR** — novas funcionalidades compatíveis com as anteriores.
- **PATCH** — correções e alterações internas sem impacto no comportamento
  visível para quem joga.

As versões correspondem aos commits indicados nas ligações no fim do ficheiro.

## [Unreleased]

## [1.3.0] - 2026-11-08

### Adicionado

- Documentação de arquitetura em `docs/` (arc42 + ADRs em MADR), com diagramas
  C4 de contexto, container e deployment em Mermaid.
- Sete ADRs a registar as decisões já tomadas: aplicação estática, ausência de
  build, mascotes Fluent Emoji, seleção adaptativa, armazenamento no browser,
  Material Design 3 e som sintetizado.
- `AGENTS.md` com as convenções de código, documentação e versionamento.
- Requisitos das iterações 1 e 2 em `docs/requirements/`, com user stories,
  EARS e critérios de aceitação em Gherkin.
- Secção **Third-party notices** no `LICENSE`, com origem, ficheiros e licença
  de todos os conteúdos externos (Fluent Emoji, Roboto e Material Design 3).

### Alterado

- Escolha de mascote passa de grelha vertical para carrossel horizontal com
  snap, cabendo a apresentação do mascote e o botão de jogar num só ecrã de
  telemóvel.
- Alturas de linha deixam de ser fixas em píxeis, para o texto crescer sem
  cortar quando o sistema usa fontes grandes.
- O subtítulo do cabeçalho passa a ocupar até duas linhas em vez de ser cortado.
- As estatísticas passam a poder distribuir-se em duas linhas em vez de truncar
  rótulos.
- O botão de som fica sempre disponível, mesmo ao voltar ao ecrã de escolha do
  mascote.
- O título da aplicação passa para uma linha própria, acima do mascote e dos
  botões, e deixa de ser cortado em ecrãs estreitos.
- O ícone da aplicação substitui o "×" no cabeçalho antes de escolher um
  mascote.
- A fila de mascotes ganha indicador de deslize: barra de progresso, chip
  "Desliza para ver mais" e gradiente na margem direita, que desaparecem ao
  chegar ao fim.
- `README.md` resume os créditos numa tabela e remete para o `LICENSE`.
- Documentação passa a indicar o endereço público
  <https://tabuada12.miguelduarte.eu/>.

### Adicionado

- Suite de testes de regressão em `tests/regression.js`, sem dependências
  obrigatórias, com catálogo em `docs/tests/README.md`.
- Cada mascote tem agora cinco frases de apresentação próprias, sorteadas de
  forma diferente quando é escolhido.

### Adicionado

- Os indicadores "Acertos", "Falhas" e "Recorde" são agora botões: abrem um
  diálogo com o total da sessão e o desdobramento entre primeira e segunda
  tentativa, e a lista dos 10 melhores recordes por ordem decrescente, com data.
- A sessão em curso aparece no histórico de recordes, marcada "agora", para
  não contradizer o valor mostrado no cabeçalho.
- O histórico de recordes guarda **uma entrada por sessão**, com a melhor série
  alcançada nela, em vez de uma entrada por cada incremento da série.
- O histórico de recordes é guardado em `localStorage` e num cookie com
  validade de 1 ano, como o nome e o mascote.
- Botão de informação no cabeçalho, presente em todos os ecrãs, que abre um
  diálogo "Sobre esta aplicação" com a licença MIT, a lista de conteúdos de
  terceiros e a política de privacidade.
- O diálogo explica que nada sai do dispositivo, que não há contas, servidores,
  análises nem publicidade, e indica os prazos de conservação dos dados.
- Ligação "Ver o código no GitHub" no fim da secção de licença, a abrir numa
  nova aba.
- Removida a ligação duplicada "Licença e privacidade" do rodapé, já que o
  botão do cabeçalho está sempre visível.

### Alterado

- Mais espaço vertical entre o título e os botões do cabeçalho.
- O cabeçalho passa a estar fixo ao topo, em duas linhas: o ícone da aplicação
  e o título à esquerda, e os botões de som, tema, edição e informação à
  direita, na linha de baixo. O mascote fica junto da fala, com o nome por
  baixo da imagem.
- "Acertos" e o respetivo número aparecem a verde; "Falhas" e o número a
  vermelho.
- O diálogo de licença e privacidade abre no topo, em "Privacidade", em vez de
  aparecer deslocado até ao link do GitHub.
- O título do ecrã inicial passa a "Como te queres chamar?".
- O ecrã inicial passa a pedir um nome de jogo em vez do nome real, com o aviso
  "Escolhe um nome divertido para jogar (ex: um animal, o teu super-herói
  preferido). Não escrevas o teu nome verdadeiro."
- Entradas com várias palavras são recusadas, porque têm a forma de um nome
  completo; o campo também deixa de pedir preenchimento automático de nomes.

### Corrigido

- O cronómetro da sessão deixava de contar enquanto o separador estava oculto;
  agora pausa e retoma sem perder o tempo acumulado.
- O deslize da fila de mascotes não funcionava no Android: o `scroll-snap`
  obrigatório fazia o deslocamento voltar atrás e o `touch-action` bloqueava o
  gesto nativo.
- Tocar num mascote deixava de o selecionar, porque a captura de ponteiro
  desviava o clique para a fila.
- A barra de progresso parecia estática; foi substituída por pontos de página,
  um por ecrã, que mudam visivelmente a cada deslize.
- Só era desenhado um ponto de página, porque a contagem ocorria antes de as
  imagens carregarem.
- O título "Tabuada 12" ficava sobreposto pelos botões de ação com fontes
  grandes.

## [1.2.0] - 2026-11-08

### Adicionado

- Indicador **Falhas** no painel da sessão, com o valor destacado a cor de erro.
- Animação de destaque (pulse) no contador de falhas ao errar.

### Alterado

- Painel de estatísticas passa de 4 para 5 colunas: Tempo, Acertos, Falhas,
  Série e Recorde.
- Rótulo "Sequência" encurtado para "Série" para caber sem truncar em ecrãs
  estreitos.
- Cabeçalho ajustado em ecrãs até 380 px: ícones, logótipo e tipografia
  reduzidos, e o título passa a encolher com reticências em vez de ser
  sobreposto pelos botões.

### Corrigido

- O contador de falhas só atualizava ao segundo erro; agora é atualizado logo
  na primeira tentativa falhada.
- Título "Tabuada 12" ficava por baixo dos botões de ação em ecrãs de 320 px.

## [1.1.0] - 2026-11-08

### Adicionado

- Nome e mascote guardados em cookies (`tabuada12_name`, `tabuada12_mascot`)
  com validade de um ano, mantendo o `localStorage` como alternativa.
- Progresso por conta guardado em cookie (`tabuada12_progress`) em formato
  compacto, com validade de 24 horas.
- Leitura tolerante dos dados: o progresso expirado (mais de 24 h) é ignorado
  ao arrancar, e o jogo recorre ao `localStorage` se o cookie estiver ausente
  ou corrompido.
- Secção **Dados guardados** no README, com a origem e a validade de cada dado.

### Alterado

- Trocar de mascote durante o jogo deixa de reiniciar acertos, série e
  cronómetro; apenas trocar de perfil reinicia a sessão.
- Recência de cada conta (última resposta e último acerto) continua apenas no
  `localStorage`, por não caber no formato compacto do cookie.

### Corrigido

- Perda dos contadores da sessão ao mudar de mascote.

## [1.0.1] - 2026-11-08

### Adicionado

- `wrangler.jsonc` e `.assetsignore` para publicar no Cloudflare Workers com
  assets estáticos.
- Ficheiro `.nojekyll` e `.gitignore` para publicação correta no GitHub Pages.

## [1.0.0] - 2026-11-08

Primeira versão publicada.

### Adicionado

- Jogo de tabuada do 1 ao 12 com contas aleatórias entre 1 × 1 e 12 × 12.
- Duas tentativas por conta, com revelação da resposta certa ao segundo erro.
- Repetição adaptativa: contas falhadas voltam com prioridade alta e contas
  dominadas com prioridade baixa, com proteção contra repetições imediatas.
- Ecrã inicial a pedir o primeiro nome e a escolha do mascote.
- 30 mascotes do Fluent Emoji (Microsoft, licença MIT), cada um com nome,
  personalidade, interjeição e frases próprias.
- Frases sorteadas sem repetição imediata, editáveis em `content.json`, com
  marcadores `{nome}`, `{produto}`, `{a}`, `{b}`, `{interjeicao}` e `{traco}`.
- Cronómetro da sessão, acertos, série e recorde guardado localmente.
- Tema dia/noite persistido e efeitos sonoros opcionais sintetizados com a
  Web Audio API.
- Interface Material Design 3, responsiva, com suporte a *safe areas*,
  alvos táteis de 48 px, `prefers-reduced-motion` e modo escuro.
- Ícone da aplicação, ícones PNG para PWA e `manifest.webmanifest`.
- Licença MIT, README com instruções de execução, publicação, estrutura e
  créditos.

[Unreleased]: https://github.com/mcduarte2000/tabuada12/compare/v1.3.0...main
[1.3.0]: https://github.com/mcduarte2000/tabuada12/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/mcduarte2000/tabuada12/compare/32a6e5e...cee4b10
[1.1.0]: https://github.com/mcduarte2000/tabuada12/compare/8bb1b47...32a6e5e
[1.0.1]: https://github.com/mcduarte2000/tabuada12/compare/ec4ea41...8bb1b47
[1.0.0]: https://github.com/mcduarte2000/tabuada12/commit/ec4ea41
