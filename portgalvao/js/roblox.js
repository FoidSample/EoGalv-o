/* =====================================================================
   NÚMEROS AO VIVO DO ROBLOX (lado do navegador)

   Ordem de tentativa:
   1. /api/roblox      -> função serverless da pasta api/ (Vercel).
                          É o caminho normal do site publicado.
   2. CONFIG.proxy     -> seu proxy próprio, se você preencher em config.js.
   3. proxies públicos -> só para rodar local; falham de vez em quando.

   Se nada responde, o site mostra "indisponível" e segue funcionando.
   ===================================================================== */

/* ---------------------- caminho 1: /api/roblox --------------------- */
async function viaApi(games){
  const qs = games.map(g => g.placeId).join(',');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try{
    const r = await fetch('/api/roblox?placeIds=' + encodeURIComponent(qs), {
      headers: { accept: 'application/json' },
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    const porJogo = {};
    games.forEach(g => {
      const x = d.games && d.games[String(g.placeId)];
      if (x) porJogo[g.slug] = { playing: x.playing || 0, visits: x.visits || 0 };
    });
    if (!Object.keys(porJogo).length) throw new Error('resposta vazia');
    return { porJogo, totalPlaying: d.totalPlaying || 0, totalVisits: d.totalVisits || 0 };
  }finally{
    clearTimeout(timer);
  }
}

/* ------------------- caminhos 2 e 3: proxies ----------------------- */
const ROTAS = [
  (url, proxy) => (proxy ? proxy.replace(/\/$/, '') + '/' + url.replace(/^https?:\/\//, '') : null),
  (url) => url,
  (url) => 'https://corsproxy.io/?url=' + encodeURIComponent(url),
  (url) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url),
  (url) => 'https://thingproxy.freeboard.io/fetch/' + url
];

async function pegaJSON(url, proxy){
  for (const rota of ROTAS){
    const alvo = rota(url, proxy);
    if (!alvo) continue;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    try{
      const res = await fetch(alvo, { signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const txt = await res.text();
      clearTimeout(t);
      const abre = txt.search(/[\[{]/);
      return JSON.parse(abre > 0 ? txt.slice(abre) : txt);
    }catch(e){
      clearTimeout(t);
      console.info('[roblox] rota indisponivel:', (e && e.message) || e);
    }
  }
  throw new Error('nenhuma rota respondeu');
}

async function viaProxies(games, proxy){
  /* 1. universeId de cada jogo */
  for (const g of games){
    if (g.universeId) continue;
    try{
      const d = await pegaJSON('https://apis.roblox.com/universes/v1/places/' + g.placeId + '/universe', proxy);
      if (d && d.universeId) g.universeId = d.universeId;
    }catch(e){ /* segue */ }
  }

  const ids = games.filter(g => g.universeId).map(g => g.universeId);
  if (!ids.length) throw new Error('sem universeId');

  /* 2. números */
  const res = await pegaJSON('https://games.roblox.com/v1/games?universeIds=' + ids.join(','), proxy);
  const linhas = res.data || [];

  const porJogo = {};
  let totalPlaying = 0, totalVisits = 0;
  games.forEach(g => {
    const r = linhas.find(x => String(x.id) === String(g.universeId));
    if (!r) return;
    porJogo[g.slug] = { playing: r.playing || 0, visits: r.visits || 0 };
    totalPlaying += r.playing || 0;
    totalVisits += r.visits || 0;
  });
  if (!Object.keys(porJogo).length) throw new Error('nenhum numero');

  return { porJogo, totalPlaying, totalVisits };
}

/* ------------------------------ público ---------------------------- */
/* Retorna { porJogo: { slug: {playing, visits} }, totalPlaying, totalVisits } */
export async function buscarNumeros(games, proxy){
  try{
    return await viaApi(games);
  }catch(e){
    console.info('[roblox] /api/roblox indisponivel:', (e && e.message) || e);
  }
  return viaProxies(games, proxy);
}
