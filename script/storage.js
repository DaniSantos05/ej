// Utilidades de almacenamiento: localStorage, sessionStorage y cookies

const Storage = (() => {
  const setLocal = (k, v) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  const getLocal = (k) => {
    const v = localStorage.getItem(k);
    if (v == null) return null;
    try { return JSON.parse(v); } catch { return v; }
  };
  const removeLocal = (k) => localStorage.removeItem(k);

  const setSession = (k, v) => sessionStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  const getSession = (k) => {
    const v = sessionStorage.getItem(k);
    if (v == null) return null;
    try { return JSON.parse(v); } catch { return v; }
  };
  const removeSession = (k) => sessionStorage.removeItem(k);

  // Cookies sencillas
  const setCookie = (name, value, days) => {
    let expires = '';
    if (typeof days === 'number') {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
  };
  const getCookie = (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  };
  const eraseCookie = (name) => { document.cookie = name + '=; Max-Age=-99999999; path=/'; };

  return { setLocal, getLocal, removeLocal, setSession, getSession, removeSession, setCookie, getCookie, eraseCookie };
})();
