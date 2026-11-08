# Tabuada 12

Jogo educativo para crianças treinarem a tabuada do 1 ao 12, com mascotes
divertidos que fazem as perguntas e reagem aos acertos e erros.

Aplicação 100% estática (HTML, CSS e JavaScript puros), pensada para ser
hospedada gratuitamente no GitHub Pages ou no Cloudflare Pages.

## Funcionalidades

- Contas de multiplicação aleatórias entre 1 × 1 e 12 × 12.
- Duas tentativas por conta: ao segundo erro, a resposta correta é revelada
  e o jogo avança.
- Repetição inteligente: as contas erradas voltam com prioridade alta e as
  já dominadas com prioridade baixa.
- Escolha de nome e de mascote (30 animais do Fluent Emoji) no primeiro uso.
- Frases divertidas por mascote, sorteadas sem repetição imediata
  (editáveis em `content.json`).
- Cronómetro da sessão, acertos, sequência e recorde guardados localmente.
- Tema dia/noite e efeitos sonoros opcionais.
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
*Settings → Pages → Deploy from a branch* (`main` / `/root`).

**Cloudflare Pages** — ligar o repositório e usar o diretório raiz sem
comando de build.

## Estrutura

```
index.html            página única da aplicação
styles.css            estilos (Material Design 3, temas claro/escuro)
app.js                lógica do jogo
mascots.js            lista de mascotes e frases de recurso
content.json          frases de cada mascote (editável)
manifest.webmanifest  metadados da app instalável
assets/
  icon.svg            ícone da aplicação
  icon-192.png        ícone para PWA
  icon-512.png        ícone para PWA
  apple-touch-icon.png
  mascots/fluent/     mascotes SVG + licença de origem
```

## Conteúdo editável

`content.json` guarda as falas de cada mascote e pode ser editado sem tocar
no código. Marcadores suportados: `{nome}`, `{produto}`, `{a}`, `{b}`,
`{interjeicao}` e `{traco}`.

## Créditos

- **Mascotes** — [Fluent Emoji](https://github.com/microsoft/fluentui-emoji)
  da Microsoft, licença MIT. Cópia da licença em
  `assets/mascots/fluent/LICENSE-fluentui-emoji.md`.
- **Tipografia** — [Roboto](https://fonts.google.com/specimen/Roboto),
  licença Apache 2.0, servida pelo Google Fonts.
- **Design system** — [Material Design 3](https://m3.material.io/).

Não são usados ficheiros de música nem áudio de terceiros. Os efeitos
sonoros são gerados em tempo real pela Web Audio API.

## Licença

Este projeto está licenciado sob a **licença MIT**. Consulta o ficheiro
[`LICENSE`](LICENSE).

Copyright (c) 2026 Miguel Duarte
