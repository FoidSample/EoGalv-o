/* =====================================================================
   MAIN — liga tudo. Ordem: idioma, tema, render, animações, dados.

   Mapa rápido:
   - estado          tudo que a página precisa saber
   - aplicarIdioma   redesenha os textos e as listas
   - escolher(i)     troca o projeto em destaque
   - irParaProjeto   clique na torre -> rola até Projetos e destaca
   - iniciar()       liga eventos e busca os números do Roblox
   ===================================================================== */

import { CONFIG, GAMES } from './config.js';
import { I18N, fill } from './i18n.js';
import { buscarNumeros } from './roblox.js';
import * as UI from './ui.js';
import * as A from './anim.js';

const $ = s => document.querySelector(s);
const html = document.documentElement;

/* ----------------------------- estado ----------------------------- */
const estado = {
  lang: CONFIG.defaultLang,
  theme: 'light',
  indice: 0,       /* projeto em destaque */
  fato: 0,         /* item fixado na seção Sobre */
  dados: {},
  status: 'loading',
  hora: ''
};

const t = () => I18N[estado.lang];

/* -------------------------- preferências -------------------------- */
try{
  const l = localStorage.getItem('eg-lang');
  const th = localStorage.getItem('eg-theme');
  if (I18N[l]) estado.lang = l;
  estado.theme = th || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}catch(e){}

html.dataset.tone = CONFIG.tone;
html.dataset.motion = CONFIG.motion;

/* ----------------------------- idioma ----------------------------- */
function aplicarIdioma(){
  const tt = t();
  html.lang = estado.lang === 'pt' ? 'pt-BR' : 'en';

  UI.aplicarTextos(tt);
  $('#themeBtn').lastElementChild.textContent = estado.theme === 'dark' ? tt.themeLight : tt.themeDark;
  $('#towerHint').textContent = tt.towerHint;

  A.montarTitulo($('#heroTitle'), tt.slogan);
  A.animarRegua($('#heroRule'));
  A.datilografar($('#terminalText'), tt.terminal);

  UI.montarImagem($('#portraitHolder'), CONFIG.portrait, 'cover', 'EoGalvão', tt.slotPortrait);
  UI.renderFaixa(tt);
  UI.renderSobre(tt, estado.fato, fixarFato);
  UI.renderMetodo(tt);
  UI.renderContatos(tt, copiar);
  UI.renderTrilha(tt, estado.lang, estado.indice, escolher);
  pintarCartao();
  atualizarStatus();
  atualizarTotais();

  $('.lang').querySelectorAll('button').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.lang === estado.lang))
  );
  $('#langPill').style.transform = estado.lang === 'en' ? 'translateX(100%)' : 'none';

  A.observarNovos();
  A.varrerVisiveis();
}

function trocarIdioma(l){
  estado.lang = l;
  try{ localStorage.setItem('eg-lang', l); }catch(e){}
  aplicarIdioma();
}

/* ------------------------------ tema ------------------------------ */
function aplicarTema(){
  html.dataset.theme = estado.theme;
  $('#themeBtn').lastElementChild.textContent = estado.theme === 'dark' ? t().themeLight : t().themeDark;
}

/* ---------------------------- projetos ---------------------------- */
function pintarCartao(){
  UI.renderCartao(t(), estado.lang, estado.indice, estado.dados, estado.status);
}

function escolher(i){
  estado.indice = (i + GAMES.length) % GAMES.length;
  pintarCartao();
  UI.renderTrilha(t(), estado.lang, estado.indice, escolher);
}

/* clique num bloco da torre: não abre o Roblox, leva ao projeto aqui */
function irParaProjeto(slug){
  const i = GAMES.findIndex(g => g.slug === slug);
  if (i < 0) return;
  escolher(i);

  const alvo = $('#projetos');
  const y = window.scrollY + alvo.getBoundingClientRect().top - 72;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });

  const cartao = document.querySelector('.card');
  cartao.dataset.flash = '1';
  setTimeout(() => { cartao.dataset.flash = ''; }, 950);

  UI.mostrarAviso(fill(t().toastProject, { nome: GAMES[i][estado.lang].name }));
}

/* item fixado na seção Sobre */
function fixarFato(i){
  estado.fato = estado.fato === i ? -1 : i;
  UI.renderSobre(t(), estado.fato, fixarFato);
  A.observarNovos();
  A.varrerVisiveis();
}

/* ----------------------------- números ---------------------------- */
function atualizarStatus(){
  const tt = t();
  const txt = estado.status === 'ok'     ? fill(tt.statsOk, { hora: estado.hora })
            : estado.status === 'stale'  ? fill(tt.statsStale, { hora: estado.hora })
            : estado.status === 'failed' ? tt.statsFailed
            : tt.loadingStats;
  $('#statusText').textContent = txt;
  const pulse = $('#livePulse');
  /* a bolinha só pulsa quando o número é realmente de agora */
  pulse.dataset.off = estado.status === 'ok' ? '' : '1';
}

function atualizarTotais(){
  if (estado.status !== 'ok' && estado.status !== 'stale') return;
  A.contar($('#statPlaying'), estado.totalPlaying || 0, t().locale);
  A.contar($('#statVisits'), estado.totalVisits || 0, t().locale);
  $('#statVisits').classList.remove('stat__value--soft');
}

/* --------- memória dos últimos números que deram certo ----------
   Guardada no navegador de quem visita. Se o Roblox falhar numa
   atualização, o site mostra o último número conhecido com a hora
   dele, em vez de escrever "indisponível" por cima de tudo.
---------------------------------------------------------------- */
const CHAVE_CACHE = 'eg-stats';
const VALIDADE_CACHE = 24 * 60 * 60 * 1000; /* 24h */

function guardarNumeros(r){
  try{
    localStorage.setItem(CHAVE_CACHE, JSON.stringify({
      em: Date.now(),
      porJogo: r.porJogo,
      totalPlaying: r.totalPlaying,
      totalVisits: r.totalVisits
    }));
  }catch(e){}
}

function lerNumerosGuardados(){
  try{
    const bruto = localStorage.getItem(CHAVE_CACHE);
    if (!bruto) return null;
    const d = JSON.parse(bruto);
    if (!d || !d.porJogo || Date.now() - d.em > VALIDADE_CACHE) return null;
    return d;
  }catch(e){ return null; }
}

function horaDe(ms){
  return new Date(ms).toLocaleTimeString(t().locale, { hour: '2-digit', minute: '2-digit' });
}

async function carregarNumeros(){
  try{
    const r = await buscarNumeros(GAMES, CONFIG.proxy);
    estado.dados = r.porJogo;
    estado.totalPlaying = r.totalPlaying;
    estado.totalVisits = r.totalVisits;
    estado.status = 'ok';
    estado.hora = new Date().toLocaleTimeString(t().locale, { hour: '2-digit', minute: '2-digit' });
    guardarNumeros(r);
  }catch(e){
    console.info('[roblox] numeros ao vivo indisponiveis:', (e && e.message) || e);
    const guardado = lerNumerosGuardados();
    if (guardado){
      estado.dados = guardado.porJogo;
      estado.totalPlaying = guardado.totalPlaying;
      estado.totalVisits = guardado.totalVisits;
      estado.status = 'stale';
      estado.hora = horaDe(guardado.em);
    }else{
      estado.status = 'failed';
    }
  }
  atualizarStatus();
  atualizarTotais();
  pintarCartao();
}

/* ---------------------------- utilidades -------------------------- */
function copiar(valor){
  try{ navigator.clipboard.writeText(valor); }catch(e){}
  UI.mostrarAviso(fill(t().toastCopied, { valor }));
}

function aoRolar(){
  const alcance = document.documentElement.scrollHeight - window.innerHeight;
  const razao = alcance > 0 ? Math.min(1, window.scrollY / alcance) : 0;
  $('#progress').style.transform = 'scaleX(' + razao + ')';
  $('#toTop').dataset.show = window.scrollY > 420 ? '1' : '';
  A.varrerVisiveis();
}

/* ------------------------------ início ---------------------------- */
function iniciar(){
  aplicarTema();

  A.montarTextura($('#heroTexture'), CONFIG.texture);
  A.montarDecor($('#heroDecor'), CONFIG.motion);
  A.montarBrasas($('#heroEmbers'));
  A.seguirCursor($('.hero'), $('#heroGlow'));

  const svg = UI.renderTorre(t(),
    irParaProjeto,
    jogo => { $('#towerHint').textContent = jogo ? (jogo[estado.lang].name + ' — ' + jogo[estado.lang].statusLabel.toLowerCase()) : t().towerHint; }
  );
  A.animarTorre(svg);

  aplicarIdioma();
  A.iniciarRevelacao();

  /* eventos */
  $('#themeBtn').addEventListener('click', () => {
    estado.theme = estado.theme === 'dark' ? 'light' : 'dark';
    try{ localStorage.setItem('eg-theme', estado.theme); }catch(e){}
    aplicarTema();
  });
  document.querySelectorAll('.lang button').forEach(b =>
    b.addEventListener('click', () => trocarIdioma(b.dataset.lang))
  );
  $('#prevGame').addEventListener('click', () => escolher(estado.indice - 1));
  $('#nextGame').addEventListener('click', () => escolher(estado.indice + 1));

  /* lightbox: clique na arte do jogo */
  const abrirArte = () => {
    const g = GAMES[estado.indice];
    UI.abrirLightbox(t(), g.art, g[estado.lang].name);
  };
  $('#artHolder').addEventListener('click', abrirArte);
  $('#lightboxClose').addEventListener('click', UI.fecharLightbox);
  $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') UI.fecharLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#lightbox').hidden) UI.fecharLightbox();
  });

  $('#refreshBtn').addEventListener('click', () => {
    estado.status = 'loading';
    atualizarStatus();
    UI.mostrarAviso(t().refreshing);
    carregarNumeros();
  });
  $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  $('#brand').addEventListener('click', () => A.ondaNaTorre($('#tower'), $('#brandTile')));

  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  carregarNumeros();
  setInterval(() => { if (document.visibilityState === 'visible') carregarNumeros(); }, 60000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
