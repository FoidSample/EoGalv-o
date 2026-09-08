# Projeto: site do EoGalvão (Violenszz)

Portfólio pessoal de um game producer / game designer do Roblox.
Site estático + uma função serverless. Hospedado na Vercel.

## Regras deste projeto

- **Sem build, sem npm, sem framework.** HTML, CSS e JS nativos. Módulos ES
  com `import`/`export`. Não introduza dependências nem etapas de build
  (não crie `package.json`: isso faz a Vercel procurar um build inexistente).
- **Todo texto visível vive em `js/i18n.js`**, em `pt` e `en`. Nunca escreva
  texto de interface direto no HTML ou no JS — crie uma chave nova nos dois
  idiomas. No HTML, use `data-i18n="chave"`.
- **Dados de conteúdo vivem em `js/config.js`** (jogos, links, imagens,
  contatos, geometria da torre, brasas). Nada de dados espalhados pelo código.
- **Imagens são arquivos em `assets/`**, referenciados por caminho em
  `js/config.js` (`art`, `icon`, `portrait`). Não há mais componente de
  arrastar imagem: o que vale é o arquivo no repositório.
- **Estilo só em `css/style.css`**, com classes, em 16 seções comentadas.
  Evite `style="..."` no HTML, exceto valores calculados em tempo de execução.
- **Cores sempre por variável CSS** (`var(--brand)`, `var(--ink)`,
  `var(--surface)`...). Não use hex solto: quebra o tema claro/escuro.
- Não renomeie os `id` usados pelo JS sem atualizar `ui.js` e `main.js`.

## Arquitetura

```
index.html      estrutura estática; ids são os pontos de encaixe do JS
css/style.css   16 seções (variáveis → base → componentes → animações → responsivo)
js/config.js    dados editáveis pelo dono do site
js/i18n.js      textos PT/EN + fill() para {placeholders}
js/roblox.js    buscarNumeros(): tenta /api/roblox, depois proxies públicos
js/anim.js      revelação ao rolar, contadores, terminal, brasas, texturas, torre
js/ui.js        funções render* — só desenham; quem decide o clique é o main
js/main.js      estado, eventos, orquestração
api/roblox.js   função serverless da Vercel (CommonJS, sem dependências)
assets/         logo, GIFs, artes e ícones dos jogos, retrato
vercel.json     cleanUrls + cache dos assets
```

### Estado (js/main.js)

```js
estado = { lang, theme, indice, fato, dados, status, hora }
```
- `indice` — projeto em destaque no arquivo de mundos
- `fato` — item fixado na seção Sobre (-1 = nenhum)
- `status` — `'loading' | 'ok' | 'failed'` para os números do Roblox

### Interações já implementadas

- Blocos da torre na capa: **rolam até Projetos e destacam aquele jogo**
  (`irParaProjeto`). Não abrem o Roblox direto — isso é intencional.
- Clique na arte do jogo: lightbox
  (`abrirLightbox` / `fecharLightbox`, fecha com Esc, clique fora ou botão).
- Itens da seção Sobre: clique fixa/desfixa o destaque.
- Etapas do método: passar o mouse destaca, clicar fixa (importante no toque).
- Contatos com `copy: true` copiam o valor no clique.
- Trilha de miniaturas e setas trocam o projeto em destaque.

### Identidade visual

- Cor da marca: **vermelho** (`--brand`), vinda da coroa da logo EG.
  Trocável por `data-tone` no `<html>` (7 opções na seção 1 do CSS).
- Tipografia: **Archivo** (títulos, caixa-alta, números) e
  **Public Sans** (corpo). Números tabulares em estatísticas.
- Tema claro e escuro por `data-theme` no `<html>`, salvo em localStorage.
- Ritmo de animação por `data-motion` (cinema / arcade / neon).
- Mascotes em GIF pixel art (gato-rei e patos) na capa, painel, faixa,
  seção Sobre, chamada final e rodapé.

## Números do Roblox

`api/roblox.js` roda no servidor da Vercel e resolve o CORS:
`placeId → universeId` (`apis.roblox.com/universes/v1/places/{id}/universe`)
e depois `games.roblox.com/v1/games?universeIds=...`. Sem chave, sem conta.
Rodando local a rota não existe e `js/roblox.js` cai nos proxies públicos —
falhar ali é normal e o site continua funcionando com "indisponível".

## Acessibilidade e desempenho

- Contraste mínimo 4.5:1 para texto.
- `prefers-reduced-motion` já desliga as animações — mantenha isso.
- Toque mínimo de 44px em botões no celular.
- Nada de bibliotecas; um pedido por arquivo.

## Como testar

Servidor local obrigatório (módulos ES não funcionam via `file://`):

```bash
npx serve .
```

Para testar a rota `/api/roblox` local: `npx vercel dev`.

Verifique: troca de idioma PT/EN, troca de tema, setas do arquivo de jogos,
clique nos blocos da torre (deve rolar até Projetos e trocar o cartão),
lightbox da arte, copiar Discord/e-mail, e o layout em
375px de largura.
