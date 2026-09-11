/* =====================================================================
   CONFIGURAÇÃO — mexa aqui primeiro.
   Tudo neste arquivo é seguro de editar sem saber programar.
   ===================================================================== */

export const CONFIG = {
  /* idioma que abre por padrão: 'en' ou 'pt' */
  defaultLang: 'en',

  /* cor da identidade: sangue | brasa | patos | vhs | mata | gelo | cripta
     (as cores de cada um estão em css/style.css, seção 1) */
  tone: 'sangue',

  /* ritmo das animações: cinema | arcade | neon */
  motion: 'cinema',

  /* textura do fundo da capa: gato | patos | listras | scan | grade | pontos | aurora */
  texture: 'gato',

  /* sua foto ou avatar na seção "Sobre mim".
     Vazio = espaço para arrastar (só aparece no seu navegador).
     Preenchido = imagem de verdade para todos. Ex.: 'assets/eu.png' */
  portrait: 'assets/portrait.webp',

  /* Números do Roblox: na Vercel o site usa /api/roblox (pasta api/) e
     funciona sem configurar nada. Só preencha aqui se quiser usar outro
     proxy próprio (ex.: 'https://meu-worker.seu-nome.workers.dev'). */
  proxy: ''
};

/* ------------------------------ JOGOS ------------------------------
   Para adicionar um jogo, copie um bloco inteiro e troque os dados.
   placeId  = número que aparece na URL do jogo no Roblox
   status   = 'lancado' ou 'dev'
   art      = caminho da arte grande (ex.: 'assets/art-career-line.png')
   icon     = caminho do ícone quadrado (ex.: 'assets/icon-career-line.png')

   IMPORTANTE: deixe art/icon vazios ('') e o site mostra um espaço
   para arrastar imagem — mas essa imagem fica salva só no SEU navegador.
   Para o site publicado, coloque os arquivos em assets/ e escreva o
   caminho aqui. É o único jeito de todos os visitantes verem a imagem.
------------------------------------------------------------------- */
export const GAMES = [
  {
    slug: 'career-line',
    placeId: '128648080604091',
    art: 'assets/art-career-line.webp',
    icon: 'assets/icon-career-line.webp',
    url: 'https://www.roblox.com/games/128648080604091/Career-Line',
    status: 'lancado',
    pt: {
      name: 'Career Line',
      role: 'Game producer e game designer',
      statusLabel: 'Lançado',
      focus: 'Produção, prioridades e cronograma',
      text: 'Meu primeiro jogo publicado. Cuidei da produção, das prioridades e do cronograma até o lançamento, mantendo a equipe alinhada em cada etapa da produção.'
    },
    en: {
      name: 'Career Line',
      role: 'Game producer and game designer',
      statusLabel: 'Released',
      focus: 'Production, priorities and schedule',
      text: 'My first published game. I handled production, priorities and the schedule all the way to launch, keeping the team aligned at every stage.'
    }
  },
  {
    slug: 'escape-the-cat',
    placeId: '123782212683554',
    art: 'assets/art-escape-the-cat.webp',
    icon: 'assets/icon-escape-the-cat.webp',
    url: 'https://www.roblox.com/games/123782212683554/Escape-the-Cat',
    status: 'lancado',
    pt: {
      name: 'Escape the Cat',
      role: 'Game producer e game designer',
      statusLabel: 'Lançado',
      focus: 'Produção, prioridades e cronograma',
      text: 'Meu segundo jogo publicado. Cuidei da produção, das prioridades e do cronograma até o lançamento, mantendo a equipe alinhada em cada etapa da produção.'
    },
    en: {
      name: 'Escape the Cat',
      role: 'Game producer and game designer',
      statusLabel: 'Released',
      focus: 'Production, priorities and schedule',
      text: 'My second published game. I handled production, priorities and the schedule all the way to launch, keeping the team aligned at every stage.'
    }
  },
  {
    slug: 'block-zombies',
    placeId: '86748868810444',
    art: 'assets/art-block-zombies.webp',
    icon: 'assets/icon-block-zombies.webp',
    url: 'https://www.roblox.com/games/86748868810444/Block-Zombies',
    status: 'dev',
    pt: {
      name: 'Block Zombies',
      role: 'Fundador do projeto',
      statusLabel: 'Em desenvolvimento',
      focus: 'Ideia original e formação da equipe',
      text: 'Em produção. Atuei como fundador da equipe e da ideia principal do projeto. Não estou mais como producer, mas mantenho participação no jogo por ter sido a base dele.'
    },
    en: {
      name: 'Block Zombies',
      role: 'Project founder',
      statusLabel: 'In development',
      focus: 'Original idea and team formation',
      text: 'In production. I founded the team and the core idea behind this project. I am no longer the producer, but I keep a stake in the game for having been its foundation.'
    }
  }
];

/* ----------------------------- CONTATOS -----------------------------
   copy: true  -> clicar copia o valor
   href        -> clicar abre o link
   icon        -> chave em ICONS (abaixo)
------------------------------------------------------------------- */
export const CONTACTS = [
  { label: 'Discord', value: 'eogalvones', copy: true, icon: 'discord' },
  { labelKey: 'labelEmail', value: 'eogalvao955@gmail.com', copy: true, icon: 'email' },
  { label: 'Roblox', value: 'EoGalvão', href: 'https://www.roblox.com/users/3140316342/profile', icon: 'roblox' },
  { label: 'Twitter', value: '@violenszz', href: 'https://x.com/violenszz', icon: 'x' }
];

/* logos das plataformas (SVG de um traço só) */
export const ICONS = {
  discord: { bg: '#5865F2', rule: 'evenodd', d: 'M18.9 5.4A15.3 15.3 0 0 0 15.2 4.2l-.3.6a12.2 12.2 0 0 1 2.4 1 14.6 14.6 0 0 0-10.6 0 12.2 12.2 0 0 1 2.4-1l-.3-.6A15.3 15.3 0 0 0 5.1 5.4C2.8 9 2.1 12.5 2.5 16a15.5 15.5 0 0 0 4.7 2.4l.6-1a11 11 0 0 1-1.7-.8l.5-.4a11.4 11.4 0 0 0 10.1 0l.5.4a11 11 0 0 1-1.7.8l.6 1A15.5 15.5 0 0 0 21.5 16c.4-3.9-.6-7.4-2.6-10.6zM8.9 14c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z' },
  email:   { bg: '#141418', d: 'M2 6.2A2.2 2.2 0 0 1 4.2 4h15.6A2.2 2.2 0 0 1 22 6.2v11.6A2.2 2.2 0 0 1 19.8 20H4.2A2.2 2.2 0 0 1 2 17.8zm2.4-.2 7.6 5.6L19.6 6z' },
  roblox:  { bg: '#E8112D', rule: 'evenodd', d: 'M6.2 2 2 18.1 17.8 22 22 5.9 6.2 2zm3.7 7.2 4.7 1.2-1.2 4.6-4.7-1.2 1.2-4.6z' },
  x:       { bg: '#0B0B0D', d: 'M17.5 3h3.3l-7.1 8.1L21.5 21h-5.7l-4.4-6.2L5.6 21H2.3l7.5-8.6L2.5 3h5.8l4.1 5.9L17.5 3z' }
};

/* geometria dos três blocos da torre na capa (coordenadas do SVG) */
export const TOWER = [
  { slug: 'career-line',    tone: 'shipped', hit: '130,120 200,155 200,199 130,234 60,199 60,155', left: '60,155 130,190 130,234 60,199',  right: '200,155 130,190 130,234 200,199', top: '130,120 200,155 130,190 60,155' },
  { slug: 'escape-the-cat', tone: 'shipped', hit: '130,64 200,99 200,143 130,178 60,143 60,99',    left: '60,99 130,134 130,178 60,143',   right: '200,99 130,134 130,178 200,143',  top: '130,64 200,99 130,134 60,99' },
  { slug: 'block-zombies',  tone: 'dev',     hit: '130,8 200,43 200,87 130,122 60,87 60,43',       left: '60,43 130,78 130,122 60,87',     right: '200,43 130,78 130,122 200,87',    top: '130,8 200,43 130,78 60,43' }
];

export const BLOCK_TONES = {
  shipped: { top: 'var(--brand-lift)', left: 'var(--brand-deep)', right: 'var(--brand)' },
  dev:     { top: 'color-mix(in srgb,var(--amber) 75%,#fff)', left: 'color-mix(in srgb,var(--amber) 70%,#000)', right: 'var(--amber)' }
};

/* brasas que sobem na capa */
export const EMBERS = [
  { x: '12%', size: '5px', round: '50%', op: .50, dur: '13s', delay: '0s' },
  { x: '22%', size: '3px', round: '1px', op: .42, dur: '17s', delay: '2.4s' },
  { x: '34%', size: '6px', round: '50%', op: .36, dur: '15s', delay: '5.1s' },
  { x: '46%', size: '4px', round: '1px', op: .50, dur: '19s', delay: '1.2s' },
  { x: '58%', size: '5px', round: '50%', op: .32, dur: '14s', delay: '6.8s' },
  { x: '67%', size: '3px', round: '1px', op: .46, dur: '18s', delay: '3.6s' },
  { x: '78%', size: '6px', round: '50%', op: .30, dur: '16s', delay: '8.2s' },
  { x: '86%', size: '4px', round: '1px', op: .44, dur: '20s', delay: '4.4s' },
  { x: '94%', size: '5px', round: '50%', op: .34, dur: '15s', delay: '9.6s' }
];

/* símbolo de cada etapa do método */
export const STEP_GLYPHS = ['◆', '▤', '◈', '▶'];
