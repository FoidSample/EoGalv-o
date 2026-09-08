/* =====================================================================
   /api/roblox  —  função serverless da Vercel
   ---------------------------------------------------------------------
   Existe porque o navegador não consegue chamar a API do Roblox direto
   (bloqueio de CORS). Aqui a chamada é feita no servidor da Vercel, que
   devolve os números já prontos para o site.

   Uso:   /api/roblox?placeIds=128648080604091,123782212683554
   Debug: /api/roblox?placeIds=128648080604091&debug=1
          (mostra passo a passo o que o Roblox respondeu — use isso
           quando os números aparecerem como "indisponível")

   Resposta:
   {
     "games": { "128648080604091": { "playing": 3, "visits": 1200, "name": "..." } },
     "totalPlaying": 3,
     "totalVisits": 1200,
     "stale": false,
     "updatedAt": "2026-09-08T12:00:00.000Z"
   }

   Não precisa de chave, conta ou configuração.
   ===================================================================== */

/* O Roblox responde melhor a um User-Agent de navegador. Sem isso, os
   IPs de datacenter (Vercel, AWS) às vezes levam 403. */
const CABECALHOS = {
  accept: 'application/json',
  'accept-language': 'en-US,en;q=0.9',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
};

/* Memória que sobrevive entre chamadas enquanto a função está "quente" */
const universoDe = new Map();   /* placeId -> universeId (nunca muda) */
let ultimoBom = null;           /* { em: timestamp, corpo: {...} }    */

const VIDA_CACHE = 45000;       /* 45s servindo o mesmo resultado     */
const VIDA_RESERVA = 6 * 60 * 60 * 1000; /* 6h de números antigos     */

function espera(ms){ return new Promise(r => setTimeout(r, ms)); }

/* Busca com 3 tentativas: 429 e 5xx costumam passar na segunda. */
async function json(url, diario){
  let ultimoErro;
  for (let tentativa = 1; tentativa <= 3; tentativa++){
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try{
      const r = await fetch(url, { headers: CABECALHOS, signal: ctrl.signal });
      clearTimeout(timer);
      if (diario) diario.push({ url, status: r.status, tentativa });
      if (r.status === 429 || r.status >= 500){
        ultimoErro = new Error('HTTP ' + r.status);
        await espera(tentativa * 400);
        continue;
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    }catch(e){
      clearTimeout(timer);
      ultimoErro = e;
      if (diario) diario.push({ url, erro: String(e && e.message || e), tentativa });
      if (tentativa < 3) await espera(tentativa * 400);
    }
  }
  throw ultimoErro || new Error('falhou: ' + url);
}

module.exports = async (req, res) => {
  const q = req.query || {};
  const debug = q.debug === '1';
  const diario = debug ? [] : null;

  const ids = String(q.placeIds || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => /^\d+$/.test(s))
    .slice(0, 12);

  res.setHeader('access-control-allow-origin', '*');

  if (!ids.length){
    res.setHeader('cache-control', 'no-store');
    res.status(400).json({ error: 'informe placeIds, ex.: /api/roblox?placeIds=128648080604091' });
    return;
  }

  /* Resposta recente já pronta: devolve sem incomodar o Roblox */
  const chave = ids.join(',');
  if (!debug && ultimoBom && ultimoBom.chave === chave && Date.now() - ultimoBom.em < VIDA_CACHE){
    res.setHeader('cache-control', 'public, s-maxage=45, stale-while-revalidate=300');
    res.status(200).json(ultimoBom.corpo);
    return;
  }

  try{
    /* 1. placeId -> universeId, um de cada vez (em paralelo dá 429).
          O resultado nunca muda, então fica guardado em memória. */
    for (const id of ids){
      if (universoDe.has(id)) continue;
      try{
        const d = await json('https://apis.roblox.com/universes/v1/places/' + id + '/universe', diario);
        if (d && d.universeId) universoDe.set(id, String(d.universeId));
      }catch(e){ /* jogo privado ou fora do ar: segue sem ele */ }
    }

    const lista = ids.map(id => universoDe.get(id)).filter(Boolean);
    if (!lista.length) throw new Error('nenhum universeId encontrado');

    /* 2. números de todos os universos numa requisição só */
    const d2 = await json('https://games.roblox.com/v1/games?universeIds=' + lista.join(','), diario);
    const porUniverso = {};
    (d2.data || []).forEach(g => {
      porUniverso[String(g.id)] = {
        playing: g.playing || 0,
        visits: g.visits || 0,
        name: g.name || ''
      };
    });

    /* 3. resposta indexada pelo placeId que o site conhece */
    const games = {};
    let totalPlaying = 0, totalVisits = 0;
    ids.forEach(id => {
      const u = universoDe.get(id);
      const g = u && porUniverso[u];
      if (!g) return;
      games[id] = g;
      totalPlaying += g.playing;
      totalVisits += g.visits;
    });
    if (!Object.keys(games).length) throw new Error('o Roblox nao devolveu numeros para esses jogos');

    const corpo = {
      games, totalPlaying, totalVisits,
      stale: false,
      updatedAt: new Date().toISOString()
    };
    if (debug) corpo.debug = diario;

    ultimoBom = { chave, em: Date.now(), corpo };

    res.setHeader('cache-control', 'public, s-maxage=45, stale-while-revalidate=300');
    res.status(200).json(corpo);
  }catch(e){
    /* Deu ruim. Se ainda temos números recentes, é melhor mostrar eles
       marcados como antigos do que escrever "indisponível" na tela. */
    if (ultimoBom && ultimoBom.chave === chave && Date.now() - ultimoBom.em < VIDA_RESERVA){
      const corpo = Object.assign({}, ultimoBom.corpo, { stale: true });
      if (debug) corpo.debug = diario;
      res.setHeader('cache-control', 'no-store');
      res.status(200).json(corpo);
      return;
    }
    /* Erro nunca vai para o cache da borda: senão fica 60s preso nele. */
    res.setHeader('cache-control', 'no-store');
    res.status(502).json({ error: String((e && e.message) || e), debug: diario || undefined });
  }
};
