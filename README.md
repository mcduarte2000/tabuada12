# Tabuada 12

Jogo educativo para crianças treinarem a tabuada do 1 ao 12, com mascotes
divertidos que fazem as perguntas e reagem aos acertos e erros.

Aplicação 100% estática (HTML, CSS e JavaScript puros), hospedada em
<https://tabuada12.miguelduarte.eu/> e pensada para correr gratuitamente em
GitHub Pages ou Cloudflare Pages.

## Funcionalidades

- Contas de multiplicação aleatórias entre 1 × 1 e 12 × 12.
- Duas tentativas por conta: ao segundo erro, a resposta correta é revelada
  e o jogo avança.
- Repetição inteligente: as contas erradas voltam com prioridade alta e as
  já dominadas com prioridade baixa.
- Escolha de nome e de mascote (30 animais do Fluent Emoji) no primeiro uso.
- Frases divertidas por mascote, sorteadas sem repetição imediata
  (editáveis em `content.json`).
- Cronómetro da sessão, acertos, falhas, série e recorde guardados localmente.
- O nome, o mascote e o progresso ficam também em cookies: o perfil dura
  um ano e o progresso expira ao fim de 24 horas.
- Tema dia/noite e efeitos sonoros opcionais.
- Instalável como aplicação (PWA) no Chrome ou Edge do Android, com
  funcionamento offline depois da primeira visita.
- Interface Material Design 3, responsiva e com suporte a telemóvel
  (safe areas, alvos táteis e `prefers-reduced-motion`).

## Como executar localmente

Como o jogo lê `content.json` por `fetch`, precisa de ser servido por HTTP
(abrir o ficheiro diretamente bloqueia o pedido por CORS).

```sh
python3 -m http.server 8000
# depois abrir http://localhost:8000/
```

## Publicar

**GitHub Pages** — enviar os ficheiros para um repositório e ativar em
*Settings → Pages → Deploy from a branch* (`main` / `/root`). O domínio
personalizado `tabuada12.miguelduarte.eu` aponta para esta publicação.

**Cloudflare Pages** — ligar o repositório e usar o diretório raiz sem
comando de build.

## Instalar como aplicação

O site é uma PWA. No Chrome ou Edge do Android, abrir a app e escolher
**Instalar app** (ou o botão de instalação no cabeçalho, quando aparece). Fica
no ecrã principal e abre sem barra do browser. No iPhone e iPad, usar
*Partilhar → Adicionar ao ecrã principal*.

Depois da primeira visita a app funciona sem rede: o service worker guarda a
interface, os textos e os 30 mascotes.

Ao alterar qualquer ficheiro da lista de cache em `sw.js`, aumentar
`VERSION` para os browsers descarregarem a versão nova.

## Estrutura

```
index.html            página única da aplicação
styles.css            estilos (Material Design 3, temas claro/escuro)
app.js                lógica do jogo
mascots.js            lista de mascotes e frases de recurso
content.json          frases de cada mascote (editável)
CHANGELOG.md          histórico de versões
AGENTS.md             regras para contribuidores e agentes
manifest.webmanifest  metadados da app instalável
sw.js                 service worker (cache offline)
assets/
  icon.svg            ícone da aplicação
  icon-192.png        ícone para PWA
  icon-512.png        ícone para PWA
  icon-maskable*.png  ícone adaptável ao launcher Android
  screenshot-*.png    imagens do convite de instalação
  apple-touch-icon.png
  mascots/fluent/     mascotes SVG + licença de origem
docs/                 documentação de arquitetura (arc42 + ADRs)
```

## Conteúdo editável

`content.json` guarda as falas de cada mascote e pode ser editado sem tocar
no código. Marcadores suportados: `{nome}`, `{produto}`, `{a}`, `{b}`,
`{interjeicao}` e `{traco}`.

## Dados guardados

O jogo guarda tudo localmente, sem servidores nem contas:

| Dado | Onde | Validade |
| --- | --- | --- |
| Nome e mascote | cookie `tabuada12_name`, `tabuada12_mascot` + `localStorage` | 1 ano |
| Progresso por conta (acertos, acertos à segunda, falhas) | cookie `tabuada12_progress` (formato compacto) + `localStorage` | 24 horas |
| Recorde, tema e som | `localStorage` | persistente |

O progresso expirado é ignorado ao arrancar. Para apagar tudo, basta limpar
os dados do site no navegador.

## Créditos

A lista completa de conteúdos de terceiros, com origem, ficheiros abrangidos e
licença de cada um, está em [`LICENSE`](LICENSE), na secção
**Third-party notices**.

Resumo:

| Conteúdo | Autor | Licença | Onde |
| --- | --- | --- | --- |
| [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) | Microsoft | MIT | `assets/mascots/fluent/` |
| [Roboto](https://fonts.google.com/specimen/Roboto) | Google | Apache 2.0 | carregada em runtime do Google Fonts |
| [Material Design 3](https://m3.material.io/) | Google | Apache 2.0 | tokens de cor em `styles.css` |

Não são usados ficheiros de música nem áudio de terceiros. Os efeitos
sonoros são gerados em tempo real pela Web Audio API.

## Documentação

A arquitetura está documentada em [`docs/`](docs/README.md): visão geral com
diagrama de contexto, blocos de construção, qualidade e riscos, e os ADRs. Os
requisitos por iteração, com user stories, EARS e critérios de aceitação em
Gherkin, estão em [`docs/requirements/`](docs/requirements/README.md).

## Versões

O histórico de alterações está em [`CHANGELOG.md`](CHANGELOG.md), seguindo
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e
[Semantic Versioning](https://semver.org/lang/pt-BR/).

## Licença

Este projeto está licenciado sob a **licença MIT**. Consulta o ficheiro
[`LICENSE`](LICENSE).

Copyright (c) 2026 Miguel Duarte
