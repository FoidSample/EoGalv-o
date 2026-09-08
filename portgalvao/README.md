# Site do EoGalvão (Violenszz)

Portfólio de game producer e game designer. HTML, CSS e JavaScript puros —
sem build, sem npm, sem framework. Uma função serverless cuida dos números
do Roblox.

**Esta pasta é o site inteiro.** É ela que vai para a Vercel.

---

## Publicar na Vercel (sem configurar nada)

**Arrastando:** entre em https://vercel.com/new e arraste **esta pasta**
(`site`) para a tela de deploy. Framework: *Other*. Build: vazio. Pronto.

**Pelo GitHub:** envie o conteúdo desta pasta para um repositório e importe
na Vercel. Se você subir o projeto todo e o site ficar numa subpasta, abra
*Settings → General → Root Directory* e escreva `site`.

O que já vem resolvido:
- `api/roblox.js` — os números ao vivo do Roblox funcionam no site publicado
  sem chave, conta ou proxy. Não precisa mexer.
- `vercel.json` — cache das imagens e das respostas da API.
- Imagens são arquivos reais em `assets/`, então todo visitante vê.

---

## Rodar no seu computador

Os arquivos usam módulos JavaScript, então **não funciona abrindo o
index.html com dois cliques**. Use um servidor local:

```bash
npx serve .
# ou
python -m http.server 8000
```

Depois abra http://localhost:8000

No VS Code, a extensão **Live Server** faz o mesmo com um clique direito no
`index.html`.

Rodando local, a rota `/api/roblox` não existe: o site tenta proxies
públicos e, se falharem, mostra "indisponível" — normal, o resto funciona.
Para testar a API igual à Vercel: `npx vercel dev`.

---

## Onde mudar cada coisa

| Quero mudar | Arquivo |
|---|---|
| Textos (PT e EN) | `js/i18n.js` |
| Jogos, links, imagens, contatos, cor da marca | `js/config.js` |
| Cores, espaçamentos, tamanhos, animações | `css/style.css` |
| Estrutura da página (seções, ordem) | `index.html` |
| Números ao vivo do Roblox (servidor) | `api/roblox.js` |
| Números ao vivo do Roblox (navegador) | `js/roblox.js` |
| Revelações, terminal, brasas, torre | `js/anim.js` |
| Montagem das listas (cartão, trilha, método) | `js/ui.js` |
| Ligação de tudo, eventos, estado | `js/main.js` |

### Ajustes rápidos em `js/config.js`

```js
defaultLang: 'en',      // idioma que abre: 'en' ou 'pt'
tone: 'sangue',         // cor: sangue brasa patos vhs mata gelo cripta
motion: 'cinema',       // ritmo: cinema arcade neon
texture: 'gato',        // fundo da capa: gato patos listras scan grade pontos aurora
portrait: 'assets/portrait.webp'
```

### Adicionar um jogo

Em `js/config.js`, copie um bloco inteiro dentro de `GAMES` e troque:
`slug` (nome curto sem espaços), `placeId` (número da URL do Roblox),
`url`, `status` (`'lancado'` ou `'dev'`), `art`, `icon` e os textos `pt`/`en`.

Um jogo novo entra sozinho na trilha de miniaturas, nas setas e na API.
Para ele aparecer também como bloco na torre da capa, adicione uma entrada
em `TOWER` (as coordenadas estão comentadas no arquivo).

---

## Imagens

Todas ficam em `assets/` e são apontadas por caminho em `js/config.js`:

```
assets/art-career-line.webp        arte grande do cartão
assets/icon-career-line.webp       ícone quadrado
assets/art-escape-the-cat.webp
assets/icon-escape-the-cat.webp
assets/art-block-zombies.webp
assets/icon-block-zombies.webp
assets/portrait.webp               sua foto na seção Sobre
assets/sticker-panel.webp          adesivo do painel de números
assets/logo-eg.png                 logo do cabeçalho e favicon
assets/mascote.gif                 gato-rei
assets/patos.gif                   patos
```

Para trocar uma imagem, substitua o arquivo mantendo o nome — ou salve com
outro nome e atualize o caminho em `js/config.js`.

Tamanhos que funcionam bem: arte **1280×720**, ícone **256×256**,
foto **800×1000**. Se um caminho ficar vazio, aparece um espaço listrado
avisando o que falta.

---

## O que é clicável no site

- **Blocos da torre** (capa) — rolam até Projetos e destacam aquele jogo.
- **Arte do jogo** — clique abre a imagem ampliada; fecha com Esc, clique fora ou X.
- **Miniaturas e setas** — trocam o projeto em destaque.
- **Itens da seção Sobre** — clique fixa o destaque.
- **Etapas de "Como eu trabalho"** — passar o mouse destaca, clicar fixa.
- **Discord e e-mail** — clique copia.
- **PT / EN, modo claro/escuro, logo do topo** — trocam idioma, tema e
  disparam a onda na torre.

---

## Estrutura

```
index.html          página inteira
css/style.css       todo o estilo, em 16 seções comentadas
js/config.js        dados que você edita (jogos, imagens, contatos, cores)
js/i18n.js          textos em português e inglês
js/roblox.js        números ao vivo (navegador)
js/anim.js          animações
js/ui.js            monta as listas na tela
js/main.js          liga tudo
api/roblox.js       função serverless da Vercel (números do Roblox)
assets/             logo, GIFs, artes, ícones, retrato
vercel.json         cache e URLs limpas
CLAUDE.md           explicação da arquitetura para o Claude Code
```

---

## Trabalhando com o Claude Code

Dentro desta pasta, rode `claude` e peça o que quiser — o `CLAUDE.md` já
explica a arquitetura e as regras para ele.

Exemplos de pedido:
- "adiciona uma seção de depoimentos depois de Sobre mim"
- "o cartão do jogo está quebrando no celular, arruma"
- "troca a cor da marca para laranja"
- "adiciona um quarto jogo chamado X, place id Y"
