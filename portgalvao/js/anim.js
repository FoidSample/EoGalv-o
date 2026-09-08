/* =====================================================================
   ANIMAÇÕES
   Revelação ao rolar, contadores, slogan palavra por palavra,
   terminal datilografado, brasas, texturas de fundo e brilho do cursor.
   ===================================================================== */

import { EMBERS } from './config.js';

/* ---------- revelação ao rolar ---------- */
let obs = null;

export function iniciarRevelacao(){
  if (!('IntersectionObserver' in window)){
    document.querySelectorAll('[data-rev]').forEach(el => el.dataset.shown = '1');
    return;
  }
  obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
      revelar(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  observarNovos();
}

export function observarNovos(){
  document.querySelectorAll('[data-rev]:not([data-watched])').forEach((el, i) => {
    el.dataset.watched = '1';
    el.style.transitionDelay = ((i % 4) * 80) + 'ms';
    if (obs) obs.observe(el); else revelar(el);
  });
}

function revelar(el){
  if (el.dataset.shown === '1') return;
  el.dataset.shown = '1';
  el.querySelectorAll('[data-count]').forEach(c => contar(c, Number(c.dataset.count)));
  if (obs) obs.unobserve(el);
}

/* rolagem rápida e saltos por âncora podem pular o observador */
export function varrerVisiveis(){
  const limite = window.innerHeight * 0.95;
  document.querySelectorAll('[data-rev]').forEach(el => {
    if (el.dataset.shown === '1') return;
    if (el.getBoundingClientRect().top < limite) revelar(el);
  });
}

/* ---------- contador que sobe ---------- */
export function contar(el, valor, locale){
  const nf = new Intl.NumberFormat(locale || 'en-US');
  const ini = performance.now();
  const passo = agora => {
    const p = Math.min(1, (agora - ini) / 900);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = nf.format(Math.round(valor * e));
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

/* ---------- slogan palavra por palavra ---------- */
export function montarTitulo(el, linhas){
  el.innerHTML = '';
  let i = 0;
  linhas.forEach(linha => {
    const div = document.createElement('span');
    div.style.display = 'block';
    linha.split(' ').forEach(palavra => {
      const s = document.createElement('span');
      s.dataset.word = '1';
      s.textContent = palavra;
      s.style.animation = 'word var(--dur) var(--pop) ' + (120 + i * 95) + 'ms both';
      div.appendChild(s);
      i++;
    });
    el.appendChild(div);
  });
}

export function animarRegua(el){
  el.style.animation = 'stretch .8s var(--ease) .55s both';
}

/* ---------- terminal ---------- */
let termTimer = null;

export function datilografar(el, linhas){
  clearTimeout(termTimer);
  let li = 0, ci = 0, apagando = false;
  const passo = () => {
    if (!el || !linhas || !linhas.length) return;
    const txt = linhas[li % linhas.length];
    el.textContent = txt.slice(0, ci);
    if (!apagando){
      ci++;
      if (ci > txt.length){ apagando = true; termTimer = setTimeout(passo, 2100); return; }
    } else {
      ci -= 2;
      if (ci <= 0){ ci = 0; apagando = false; li++; }
    }
    termTimer = setTimeout(passo, apagando ? 24 : 58);
  };
  passo();
}

/* ---------- brasas subindo ---------- */
export function montarBrasas(el){
  el.innerHTML = EMBERS.map(b =>
    '<span style="left:' + b.x + ';width:' + b.size + ';height:' + b.size +
    ';border-radius:' + b.round + ';opacity:' + b.op +
    ';animation:rise ' + b.dur + ' linear ' + b.delay + ' infinite"></span>'
  ).join('');
}

/* ---------- textura de fundo da capa ---------- */
const TEXTURAS = {
  gato:    '<div class="tex tex--gato"></div>',
  patos:   '<div class="tex tex--patos"></div>',
  listras: '<div class="tex tex--listras"></div>',
  scan:    '<div class="tex tex--scan"></div>',
  grade:   '<div class="tex tex--grade"></div>',
  pontos:  '<div class="tex tex--pontos"></div>',
  aurora:  '<div class="orb orb--a"></div><div class="orb orb--b"></div>'
};

export function montarTextura(el, nome){
  el.innerHTML = TEXTURAS[nome] || TEXTURAS.gato;
}

/* ---------- decoração de movimento ---------- */
const DECOR = {
  cinema: '<div class="beam beam--a"></div><div class="beam beam--b"></div>',
  arcade: '<div class="dotgrid"></div>',
  neon:   '<div class="orb orb--a"></div><div class="orb orb--b"></div>'
};

export function montarDecor(el, movimento){
  el.innerHTML = DECOR[movimento] || DECOR.cinema;
}

/* ---------- brilho que segue o cursor ---------- */
export function seguirCursor(area, glow){
  if (!window.matchMedia('(hover: hover)').matches) return;
  let tick = false;
  area.addEventListener('pointermove', e => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => {
      const c = area.getBoundingClientRect();
      glow.style.opacity = getComputedStyle(document.documentElement).getPropertyValue('--glow') || '.9';
      glow.style.transform = 'translate3d(' + (e.clientX - c.left) + 'px,' + (e.clientY - c.top) + 'px,0)';
      tick = false;
    });
  });
  area.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
}

/* ---------- entrada dos blocos da torre ---------- */
export function animarTorre(svg){
  svg.querySelectorAll('[data-block]').forEach((el, i) => {
    el.style.animation = 'drop .7s var(--pop) ' + (260 + i * 150) + 'ms both';
    setTimeout(() => {
      el.style.animation = 'float var(--float) ease-in-out ' + (i * 0.5) + 's infinite';
    }, 1100 + i * 150);
  });
}

/* ---------- onda ao clicar na marca ---------- */
export function ondaNaTorre(svg, tile){
  if (tile){
    tile.style.animation = 'none';
    void tile.offsetWidth;
    tile.style.animation = 'spinPop .85s var(--pop)';
  }
  svg.querySelectorAll('[data-block]').forEach((el, i) => {
    setTimeout(() => {
      const antes = el.style.animation;
      el.style.animation = 'wave .7s var(--pop)';
      setTimeout(() => { el.style.animation = antes; }, 720);
    }, i * 110);
  });
}
