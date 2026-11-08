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

### Adicionado

- Documentação de arquitetura em `docs/` (arc42 + ADRs em MADR), com diagramas
  C4 de contexto, container e deployment em Mermaid.
- Sete ADRs a registar as decisões já tomadas: aplicação estática, ausência de
  build, mascotes Fluent Emoji, seleção adaptativa, armazenamento no browser,
  Material Design 3 e som sintetizado.
- `AGENTS.md` com as convenções de código, documentação e versionamento.

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

[Unreleased]: https://github.com/mcduarte2000/tabuada12/compare/cee4b10...main
[1.2.0]: https://github.com/mcduarte2000/tabuada12/compare/32a6e5e...cee4b10
[1.1.0]: https://github.com/mcduarte2000/tabuada12/compare/8bb1b47...32a6e5e
[1.0.1]: https://github.com/mcduarte2000/tabuada12/compare/ec4ea41...8bb1b47
[1.0.0]: https://github.com/mcduarte2000/tabuada12/commit/ec4ea41
