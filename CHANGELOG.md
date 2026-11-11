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

## [1.8.2] - 2026-11-11

### Alterado

- **Regras do projeto mais rigorosas.** `AGENTS.md` passa a nomear os erros já
  cometidos neste repositório, para não se repetirem: inventar uma versão que só
  existiu em trabalho não commitado, dividir trabalho por commits para o
  histórico parecer arrumado, mudar comportamento além do pedido, e confiar num
  resultado obtido com um service worker a servir a versão antiga.
- `AGENTS.md` deixa de afirmar que o único pedido externo é o Google Fonts; a
  aplicação não faz qualquer pedido externo.
- `CONTRIBUTING.md` explica que a versão vive em três sítios e que as duas
  suites também passam com a árvore suja, pelo que é preciso commitá-la antes de
  verificar e só depois publicar.

### Corrigido

- O validador aceitava uma versão por publicar desde que houvesse alterações por
  commitar. Passa a exigir que a etiqueta mais recente aponte para `HEAD` numa
  árvore limpa, que é o erro que deixou o changelog a anunciar versões que nunca
  foram publicadas.
- O teste da versão só comparava `app.js` com o changelog; `index.html` podia
  ficar atrás. Passa a comparar os três sítios.

## [1.8.1] - 2026-11-11

### Corrigido

- **Uma tecla perdida podia custar uma tentativa.** Num ecrã tátil que falha um
  toque, a criança escrevia `1` em vez de `12`, carregava em confirmar e perdia
  a tentativa por um erro do teclado, não dela. O botão de confirmar só fica
  disponível quando o número de dígitos escritos é igual ao da resposta certa.
- **Dígitos a mais também são recusados.** `100` não é uma tentativa de `10`, e
  o mesmo vale para `1` ou `10` quando a resposta é `100`. O botão fica cinzento
  e a mensagem diz o que falta ou o que sobra.
- Uma resposta com o número errado de dígitos não conta como falha: a pergunta
  fica aberta, a mascote diz «Faltam números.» ou «São números a mais.» e as
  estatísticas não mudam. O atalho Enter segue a mesma regra do botão.

## [1.8.0] - 2026-11-11

Esta versão junta duas iterações: correções de fiabilidade nos controlos e a
música tradicional.

### Adicionado

- **Música tradicional durante o jogo.** Dezoito melodias tradicionais tocam em
  sequência aleatória, sintetizadas no próprio dispositivo com Tone.js. Não há
  ficheiros de áudio nem pedidos de rede.
- **Escolha de instrumento.** Oito timbres: triângulo, flauta, sino, caixa de
  música, piano, guitarra, ukelele e clarinete. O piano é o som inicial. A
  escolha fica guardada.
- **Página «Músicas»**, ligada a partir do ecrã de informação, com a história de
  cada melodia, o país, a época, o autor e um botão para ouvir.
- **Controlo de volume** na barra de música.
- O ecrã de informação mostra a versão instalada e uma ligação direta ao
  `CHANGELOG.md`, para que um adulto consiga relatar um problema indicando a
  versão certa.

### Alterado

- A barra de música aparece apenas no ecrã de jogo.
- O botão de música é **Tocar / Parar**, em vez de um altifalante.
- A música começa **desligada** e nunca começa sozinha. A decisão de tocar ou
  parar fica guardada num cookie, `tabuada12_music`, mas essa memória só define
  o estado do botão: é sempre preciso carregar em Tocar.
- A ligação para a página das músicas fica no fim da secção de música do ecrã de
  informação, com o mesmo espaçamento dos outros botões.

### Corrigido

- **O teclado numérico podia parecer que aceitava uma tecla sem a aceitar.** Uma
  tecla premida durante a animação de acerto, ou depois do limite de três
  dígitos, mudava de cor e não escrevia nada. As teclas que não aceitam o toque
  ficam agora visivelmente desativadas e não reagem.
- **O cronómetro congelava na segunda tentativa.** Depois de uma primeira
  resposta errada, o tempo deixava de contar, pelo que a conta nunca expirava.
  O tempo passou a correr nas duas tentativas, como as regras dos níveis
  descrevem.
- **Uma conta podia ficar a 0:00 sem contar como falha.** Se o fim do tempo
  coincidisse com uma pausa, a conta seguinte não voltava a armar o cronómetro e
  a pergunta ficava respondível indefinidamente. O fim do tempo resolve sempre a
  pergunta como falha.
- O indicador de tempo mostrava `0:00` durante o último segundo, embora a conta
  ainda aceitasse resposta. Passa a arredondar para cima.
- Abrir os painéis de Acertos, Falhas, Recordes ou Informação não parava o
  cronómetro, e ler as estatísticas custava tempo de resposta. Os painéis pausam
  e retomam o tempo.
- **A música começava no ecrã do mascote.** Se a preferência guardada fosse
  «ligada», o primeiro toque em qualquer sítio retomava a música, pelo que ela
  começava no segundo ecrã da configuração, sem controlos à vista. O primeiro
  toque passou a servir apenas para desbloquear o áudio.
- **A música continuava ao sair do jogo.** Sair do ecrã de jogo escondia a
  barra mas deixava a música a tocar. Ao sair do ecrã de jogo, a música para.
- **Sons estranhos no meio das músicas.** As partes da melodia anterior ficavam
  ligadas ao transporte partilhado enquanto a seguinte começava, pelo que notas
  da música antiga soavam sobre a nova. As partes antigas são agora libertadas
  antes de o transporte avançar.
- A guitarra e o ukelele ficavam quase inaudíveis ao lado dos outros
  instrumentos; o nível foi equilibrado.

## [1.7.0] - 2026-11-09

### Adicionado

- Tipografia Roboto servida pelo próprio site, em `assets/fonts/`, com
  pré-carregamento e cache no service worker. A aplicação deixa de fazer
  qualquer pedido a serviços externos.

### Corrigido

- O indicador de tempo anunciava "Tempo de jogo" enquanto contava ao contrário;
  passa a anunciar o tempo restante.
- O erro do nome era anunciado duas vezes: pela região `role="alert"` e pela
  descrição do campo. Fica só a descrição.
- O nível era anunciado duas vezes: pelo emblema com `aria-live` e pelo ecrã de
  subida de nível. O emblema deixa de ser região viva.
- **A licença da Roboto estava errada.** O aviso dizia Apache 2.0, herdado da
  Roboto v2 estática. A família variável usada é SIL Open Font License 1.1. O
  aviso e o ficheiro de licença foram substituídos.

## [1.6.1] - 2026-11-09

### Alterado

- `AGENTS.md` passa a ser um contrato curto, com instalar, correr, testar, mapa do
  repositório, convenções e proibições. O detalhe passou para `CONTRIBUTING.md`.
- Adicionado `tests/validate-docs.py`, adaptado do validador do skill, com os
  valores por omissão deste projeto.
- CI em `.github/workflows/ci.yml`: verificação de sintaxe, suite de regressão e
  validador da documentação em cada push.

## [1.6.0] - 2026-11-09

### Adicionado

- A janela da aplicação instalada no computador abre com um tamanho adequado ao
  conteúdo (cerca de 460×760), centrada, em vez de ocupar o ecrã inteiro. Só
  acontece na app instalada em ecrãs grandes e uma única vez, para não contrariar
  quem redimensiona a janela.

### Corrigido

- O emblema do nível continuava encostado ao título em vez de ficar à direita:
  a linha do cabeçalho encolhia ao conteúdo, por isso `margin-left: auto` não
  tinha espaço para empurrar.

## [1.5.0] - 2026-11-09

### Adicionado

- Seis níveis progressivos: Iniciante, Aprendiz, Esperto, Mestre, Génio e
  Einstein. Cada nível define as tabuadas, o tempo por questão e se há
  equações. Especificação em `docs/levels.md`.
- Contagem decrescente por questão, com aviso a meio tempo e alerta nos
  últimos 20 %.
- Esgotar o tempo conta como resposta errada, revela a resposta certa e quebra
  a série.
- Questões de equação a partir do nível 4, nas formas `? x 8 = 80` e
  `7 x ? = 56`.
- Celebração de subida de nível: ecrã "Nível X" com emoji, confete, som e
  parabéns do mascote.
- Emblema do nível sempre visível no cabeçalho, com emoji, alinhado à direita.
- O nível fica guardado em `localStorage` e num cookie de 1 ano.

### Corrigido

- Trocar de mascote durante o jogo trocava a conta em curso, o que permitia à
  criança escapar a uma conta difícil. A conta, o que já estava escrito, a
  tentativa e o tempo restante são agora preservados.
- O tempo continuava a correr enquanto a criança escolhia o mascote.
- O produto da equação aparecia como `?`, indistinguível do fator em falta.

### Alterado

- O indicador "Tempo" passou de tempo decorrido para tempo restante da
  questão.
- As falas de tempo esgotado passaram a frases completas.

## [1.4.1] - 2026-11-08

### Alterado

- Documentação da iteração 2 alinhada com o que foi entregue: 9 user stories,
  64 requisitos EARS e 40 cenários Gherkin, com o âmbito, o registo de
  verificação e as lacunas conhecidas reescritos.
- `iteration-01.md` assinala os requisitos substituídos pela iteração 2.
- `quality-and-risks.md` registra o aviso "Unsafe app blocked" do Samsung
  Internet (R12), o bloqueio regional do Android 13+ (R13) e uma secção nova
  de limitações de plataforma (P1 a P4), incluindo a ausência do convite de
  instalação no Firefox e no Safari iOS.
- A instalação foi confirmada num telemóvel Android real com Chrome.

## [1.4.0] - 2026-11-08

### Adicionado

- Aplicação instalável como PWA: manifest completo com ícones normais e
  maskable, dois screenshots e um atalho, e botão "Instalar aplicação" no
  cabeçalho quando o browser o permite.
- Service worker que guarda em cache a aplicação e os 30 mascotes, permitindo
  jogar sem rede depois da primeira visita.
- Ícone maskable dedicado, com a arte dentro da zona segura de 80 %.
- Metadados para o ecrã principal do iOS.
- `docs/backlog.md` regista a investigação sobre publicar na F-Droid, com os
  bloqueios encontrados e o trabalho que exigiria.

### Alterado

- `manifest.webmanifest` ganha `id`, `display_override`, categorias,
  screenshots e atalho.

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

[Unreleased]: https://github.com/mcduarte2000/tabuada12/compare/v1.8.2...main
[1.8.2]: https://github.com/mcduarte2000/tabuada12/compare/v1.8.1...v1.8.2
[1.8.1]: https://github.com/mcduarte2000/tabuada12/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/mcduarte2000/tabuada12/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/mcduarte2000/tabuada12/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/mcduarte2000/tabuada12/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/mcduarte2000/tabuada12/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/mcduarte2000/tabuada12/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/mcduarte2000/tabuada12/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/mcduarte2000/tabuada12/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/mcduarte2000/tabuada12/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/mcduarte2000/tabuada12/compare/32a6e5e...cee4b10
[1.1.0]: https://github.com/mcduarte2000/tabuada12/compare/8bb1b47...32a6e5e
[1.0.1]: https://github.com/mcduarte2000/tabuada12/compare/ec4ea41...8bb1b47
[1.0.0]: https://github.com/mcduarte2000/tabuada12/commit/ec4ea41
