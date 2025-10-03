// Módulo de autenticación simple usando localStorage y sessionStorage
const Auth = (() => {
  const LS_USER_KEY = 'mae:user';
  const SS_LOGGED_KEY = 'mae:loggedIn';
  const CK_LOGIN = 'mae:login';
  const CK_PASS = 'mae:pass';

  const saveUser = (user) => {
    Storage.setLocal(LS_USER_KEY, user);
    // También guardamos en cookies para cumplir el enunciado (cookie o localStorage)
    if (user?.login) Storage.setCookie(CK_LOGIN, user.login, 30);
    if (user?.pass) Storage.setCookie(CK_PASS, user.pass, 30);
  };
  const getUser = () => Storage.getLocal(LS_USER_KEY);

  const credsFromCookie = () => ({
    login: Storage.getCookie(CK_LOGIN),
    pass: Storage.getCookie(CK_PASS)
  });

  const login = (loginName, password, remember) => {
    const user = getUser();
    let ok = false;
    let hasUser = false;
    if (user) {
      hasUser = true;
      ok = user.login === loginName && user.pass === password;
    } else {
      // fallback a cookies si no hay registro en localStorage
      const ck = credsFromCookie();
      if (ck.login && ck.pass) {
        hasUser = true;
        ok = ck.login === loginName && ck.pass === password;
      }
    }
    if (!hasUser) return { ok: false, msg: 'No hay usuario registrado' };
    if (!ok) return { ok: false, msg: 'Credenciales incorrectas' };
    Storage.setSession(SS_LOGGED_KEY, true);
    if (remember) Storage.setCookie('rememberLogin', loginName, 30);
    return { ok: true };
  };

  const logout = () => {
    Storage.removeSession(SS_LOGGED_KEY);
  };

  const isLogged = () => !!Storage.getSession(SS_LOGGED_KEY);

  return { saveUser, getUser, login, logout, isLogged };
})();
