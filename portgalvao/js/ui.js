/* =====================================================================
   RENDERIZAÇÃO
   Monta as partes do site que vêm de config.js e i18n.js:
   torre, faixa, sobre, cartão do jogo, ficha, trilha, método e contatos.

   Regra: este arquivo só desenha. Quem decide o que acontece no clique
   é o js/main.js, que passa a função de callback.
   ===================================================================== */

import { GAMES, CONTACTS, ICONS, TOWER, BLOCK_TONES, STEP_GLYPHS } from './config.js';
import { fill } from './i18n.js';

const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dp = n => (n < 10 ? '0' : '') + n;

/* HTML de uma imagem de arquivo, ou de um espaço listrado se o caminho
   estiver vazio em js/config.js */
function imgHTML(caminho, fit, alt, aviso){
  return caminho
    ? '<img src="' + esc(caminho) + '" alt="' + esc(alt || '') + '" loading="lazy" style="width:100%;height:100%;object-fit:' + fit + ';display:block" />'
    : '<span class="empty">' + esc(aviso || '') + '</span>';
}

/* -------------------------- torre da capa --------------------------
   aoClicar(slug) -> main.js leva para o projeto na seção Projetos
   aoPassar(jogo) -> atualiza a legenda embaixo da torre               */
export function renderTorre(t, aoClicar, aoPassar){
  const svg = $('#tower');
  svg.innerHTML = TOWER.map(b => {
    const c = BLOCK_TONES[b.tone];
    return '<g role="button" tabindex="0" data-slug="' + b.slug + '">' +
      '<polygon points="' + b.hit + '" fill="none" style="pointer-events:all"></polygon>' +
      '<g data-block="1" style="transition:transform .3s var(--pop)">' +
        '<polygon points="' + b.left  + '" fill="' + c.left  + '" stroke="var(--paper)" stroke-width="1.5" stroke-linejoin="round"></polygon>' +
        '<polygon points="' + b.right + '" fill="' + c.right + '" stroke="var(--paper)" stroke-width="1.5" stroke-linejoin="round"></polygon>' +
        '<polygon points="' + b.top   + '" fill="' + c.top   + '" stroke="var(--paper)" stroke-width="1.5" stroke-linejoin="round"></polygon>' +
      '</g></g>';
  }).join('');

  svg.querySelectorAll('g[role="button"]').forEach(g => {
    const slug = g.dataset.slug;
    const jogo = GAMES.find(x => x.slug === slug);
    const entrar = () => {
      const inner = g.querySelector('[data-block]');
      if (inner) inner.style.transform = 'translate(22px,9px)';
      svg.querySelectorAll('g[role="button"]').forEach(o => {
        o.style.filter = o === g ? 'none' : 'saturate(.2) brightness(.92)';
      });
      aoPassar(jogo);
    };
    const sair = () => {
      const inner = g.querySelector('[data-block]');
      if (inner) inner.style.transform = 'none';
      svg.querySelectorAll('g[role="button"]').forEach(o => { o.style.filter = 'none'; });
      aoPassar(null);
    };
    g.addEventListener('pointerenter', entrar);
    g.addEventListener('focus', entrar);
    g.addEventListener('pointerleave', sair);
    g.addEventListener('blur', sair);
    g.addEventListener('click', () => aoClicar(slug));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aoClicar(slug); } });
  });
  return svg;
}

/* ------------------------------ faixa ------------------------------ */
export function renderFaixa(t){
  const track = $('#marqueeTrack');
  let html = '';
  for (let i = 0; i < 8; i++){
    const par = i % 2 === 1;
    html += '<span class="marquee__item" style="color:' + (par ? '#F3F4F8' : 'var(--brand-lift)') + '">' +
      (par ? 'EoGalvão — Violenszz' : esc(t.footerSlogan)) +
      '<img src="assets/' + (par ? 'mascote.gif' : 'patos.gif') + '" alt="" style="width:' + (par ? '26px' : '52px') + '" />' +
    '</span>';
  }
  track.innerHTML = html;
}

/* ------------------------------ sobre ------------------------------
   aoFixar(i) -> main.js guarda qual fato está fixado (clique)        */
export function renderSobre(t, fixado, aoFixar){
  const dl = $('#facts');
  dl.innerHTML = t.facts.map(([rotulo, valor], i) =>
    '<div tabindex="0" data-i="' + i + '" data-on="' + (i === fixado ? '1' : '0') + '">' +
      '<dt>' + esc(rotulo) + '</dt><dd>' + esc(valor) + '</dd>' +
    '</div>'
  ).join('');
  dl.querySelectorAll('div').forEach(d => {
    const i = Number(d.dataset.i);
    d.addEventListener('click', () => aoFixar(i));
    d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aoFixar(i); } });
  });

  $('#network').innerHTML = t.network.map(n =>
    '<span class="chip"><span class="chip__dot"></span>' + esc(n) + '</span>'
  ).join('');

  $('#tools').innerHTML = t.tools.map(n =>
    '<span class="chip">' + esc(n) + '</span>'
  ).join('');
}

/* ------------------------ cartão do jogo -------------------------- */
export function renderCartao(t, lang, indice, dados, statusTipo){
  const g = GAMES[indice];
  const x = g[lang];
  const d = dados[g.slug];
  const nf = new Intl.NumberFormat(t.locale);
  const semDado = statusTipo === 'failed' ? t.unavailable : '—';
  const rotuloLink = g.status === 'lancado' ? t.playOn : t.viewOn;

  $('#archiveCounter').textContent = t.archive + ' / ' + dp(indice + 1);
  $('#windowLabel').textContent = 'eg_archive / ' + dp(indice + 1);
  $('#gameEyebrow').textContent = x.role + ' · ' + x.focus;
  $('#gameName').textContent = x.name;
  $('#gameText').textContent = x.text;
  $('#gameVisits').textContent = d ? nf.format(d.visits) : semDado;
  $('#gamePlaying').textContent = d ? nf.format(d.playing) : semDado;

  $('#gameLink').href = g.url;
  $('#gameLinkLabel').textContent = rotuloLink;
  $('#playLink').href = g.url;
  $('#playLink').title = rotuloLink;
  $('#playLabel').textContent = rotuloLink;

  const badge = $('#devBadge');
  if (g.status === 'dev'){ badge.hidden = false; $('#devLabel').textContent = x.statusLabel; }
  else badge.hidden = true;

  /* arte e ícone: caminhos vêm de js/config.js */
  montarImagem($('#artHolder'), g.art, 'contain', x.name, t.slotArt);
  montarImagem($('#iconHolder'), g.icon, 'cover', '', t.slotIcon);
}

/* coloca uma imagem de arquivo (ou o espaço listrado) dentro de um holder */
export function montarImagem(holder, caminho, fit, alt, aviso){
  if (!holder) return;
  const marca = (caminho || 'vazio') + '|' + fit;
  if (holder.dataset.marca === marca) return;
  holder.dataset.marca = marca;
  holder.innerHTML = imgHTML(caminho, fit, alt, aviso);
}

/* ----------------------------- trilha ------------------------------ */
export function renderTrilha(t, lang, indice, aoEscolher){
  const el = $('#trail');
  el.innerHTML = GAMES.map((g, i) =>
    '<button type="button" data-i="' + i + '" aria-current="' + (i === indice) + '">' +
      '<span class="trail__thumb">' + imgHTML(g.icon, 'cover', '', '') + '</span>' +
      '<span class="trail__meta">' +
        '<span class="trail__num">' + dp(i + 1) + '</span>' +
        '<span class="trail__name">' + esc(g[lang].name) + '</span>' +
      '</span>' +
    '</button>'
  ).join('');
  el.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => aoEscolher(Number(b.dataset.i)))
  );
}

/* ----------------------------- método ------------------------------
   passar o mouse destaca; clicar fixa (importante no celular)        */
export function renderMetodo(t){
  const ol = $('#steps');
  ol.innerHTML = t.method.map(([titulo, texto], i) =>
    '<li class="step" tabindex="0" data-i="' + i + '" data-on="' + (i === 0 ? '1' : '0') + '" data-rev>' +
      '<span class="step__ghost" aria-hidden="true">' + dp(i + 1) + '</span>' +
      '<span class="step__num">' + dp(i + 1) + '</span>' +
      '<h3>' + esc(titulo) + '</h3>' +
      '<p>' + esc(texto) + '</p>' +
      '<span class="step__glyph">' + (STEP_GLYPHS[i] || '◆') + '</span>' +
    '</li>'
  ).join('');

  let fixado = 0;
  const marcar = i => ol.querySelectorAll('.step').forEach(s => {
    s.dataset.on = Number(s.dataset.i) === i ? '1' : '0';
  });
  ol.querySelectorAll('.step').forEach(s => {
    const i = Number(s.dataset.i);
    s.addEventListener('pointerenter', () => marcar(i));
    s.addEventListener('focus', () => marcar(i));
    s.addEventListener('click', () => { fixado = i; marcar(i); });
    s.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fixado = i; marcar(i); }
    });
  });
  ol.addEventListener('pointerleave', () => marcar(fixado));
}

/* ---------------------------- contatos ----------------------------- */
export function renderContatos(t, aoCopiar){
  const ul = $('#contacts');
  ul.innerHTML = CONTACTS.map((c, i) => {
    const ico = ICONS[c.icon];
    const rotulo = c.labelKey ? t[c.labelKey] : c.label;
    const acao = c.copy ? t.copy : t.openProfile;
    return '<li data-rev>' +
      '<a href="' + esc(c.href || '#contato') + '" target="' + (c.href ? '_blank' : '_self') + '" rel="noopener" data-i="' + i + '">' +
        '<span class="contact__icon" style="background:' + ico.bg + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ico.d + '" fill="currentColor" fill-rule="' + (ico.rule || 'nonzero') + '"></path></svg>' +
        '</span>' +
        '<span class="contact__label">' + esc(rotulo) + '</span>' +
        '<span class="contact__value">' + esc(c.value) + '</span>' +
        '<span class="contact__action">' + esc(acao) + '</span>' +
      '</a>' +
    '</li>';
  }).join('');

  ul.querySelectorAll('a').forEach(a => {
    const c = CONTACTS[Number(a.dataset.i)];
    if (!c.copy) return;
    a.addEventListener('click', e => {
      e.preventDefault();
      const alvo = a.querySelector('.contact__action');
      aoCopiar(c.value);
      alvo.textContent = t.copied;
      alvo.dataset.done = '1';
      setTimeout(() => { alvo.textContent = t.copy; alvo.dataset.done = ''; }, 1800);
    });
  });
}

/* --------------------------- lightbox ------------------------------ */
export function abrirLightbox(t, caminho, legenda){
  if (!caminho) return;
  const box = $('#lightbox');
  $('#lightboxImg').src = caminho;
  $('#lightboxImg').alt = legenda || '';
  $('#lightboxCaption').textContent = legenda || '';
  $('#lightboxCloseLabel').textContent = t.closeLabel;
  box.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#lightboxClose').focus();
}

export function fecharLightbox(){
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
}

/* -------------------------- textos fixos --------------------------- */
export function aplicarTextos(t){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t[el.dataset.i18n];
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const [attr, chave] = el.dataset.i18nAttr.split(':');
    if (t[chave]) el.setAttribute(attr, t[chave]);
  });
}

/* ----------------------------- aviso ------------------------------- */
let avisoTimer = null;
export function mostrarAviso(msg){
  const a = $('#toast');
  a.textContent = msg;
  a.dataset.show = '1';
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => { a.dataset.show = ''; }, 2200);
}

export { fill };
