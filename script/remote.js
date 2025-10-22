// Capa opcional para persistencia remota de consejos.
// Por defecto está desactivada. Configura REMOTE_TIPS_ENDPOINT para habilitarla.
// Requisitos del endpoint (estilo REST muy simple):
// - GET  <ENDPOINT>?_limit=3  -> devuelve array de consejos [{id,title,text,at}]
// - POST <ENDPOINT>           -> body JSON {id,title,text,at} y responde el objeto creado
// Puedes usar un servicio como MockAPI, JSON Server o tu propio backend.

(function(){
  const REMOTE_TIPS_ENDPOINT = ""; // <-- coloca aquí tu endpoint (p.ej. https://api.mockapi.io/tips)

  async function read(limit = 3) {
    if (!REMOTE_TIPS_ENDPOINT) return [];
    const url = `${REMOTE_TIPS_ENDPOINT}${REMOTE_TIPS_ENDPOINT.includes('?') ? '&' : '?'}_limit=${encodeURIComponent(limit)}&_sort=at&_order=desc`;
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('[RemoteTips] Error leyendo del endpoint:', e);
      return [];
    }
  }

  async function add(tip) {
    if (!REMOTE_TIPS_ENDPOINT || !tip) return null;
    try {
      const res = await fetch(REMOTE_TIPS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tip)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('[RemoteTips] Error creando tip en endpoint:', e);
      return null;
    }
  }

  window.RemoteTips = {
    get enabled(){ return !!REMOTE_TIPS_ENDPOINT; },
    read, add
  };
})();
