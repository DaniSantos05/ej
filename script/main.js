// Orquestación por página
// Detectamos página por clase en <html> o por estructura

const App = (() => {
  const PACK_KEY = 'mae:selectedPack';

  const showError = (msg) => {
    // Modal mínimo accesible
    let modal = document.getElementById('app-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'app-modal';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.background = 'rgba(0,0,0,.5)';
      modal.style.zIndex = '1000';
      modal.innerHTML = '<div id="app-modal-card" role="alertdialog" aria-modal="true" style="background:#101936;border:1px solid #1f2a44;border-radius:.8rem;padding:1rem;max-width:520px;width:calc(100% - 2rem);"><h3 style="margin-top:0">Aviso</h3><p id="app-modal-msg" style="margin:.6rem 0 1rem"></p><div style="text-align:right"><button id="app-modal-ok" class="btn">Aceptar</button></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      modal.querySelector('#app-modal-ok').addEventListener('click', () => modal.remove());
    }
    modal.querySelector('#app-modal-msg').textContent = msg;
    modal.style.display = 'flex';
  };

  const showConfirm = (msg, onConfirm) => {
    let modal = document.getElementById('app-confirm');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'app-confirm';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.background = 'rgba(0,0,0,.5)';
      modal.style.zIndex = '1000';
      modal.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="app-confirm-title" style="background:#101936;border:1px solid #1f2a44;border-radius:.8rem;padding:1rem;max-width:520px;width:calc(100% - 2rem);">\
        <h3 id="app-confirm-title" style="margin-top:0">Confirmación</h3>\
        <p id="app-confirm-msg" style="margin:.6rem 0 1rem"></p>\
        <div style="display:flex;gap:.5rem;justify-content:flex-end">\
          <button id="app-confirm-cancel" class="btn outline" type="button">Cancelar</button>\
          <button id="app-confirm-ok" class="btn" type="button">Confirmar</button>\
        </div>\
      </div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
      modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.remove(); });
    }
    modal.querySelector('#app-confirm-msg').textContent = msg;
    const btnOk = modal.querySelector('#app-confirm-ok');
    const btnCancel = modal.querySelector('#app-confirm-cancel');
    // Limpiar posibles listeners previos
    const newOk = btnOk.cloneNode(true);
    const newCancel = btnCancel.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);
    newCancel.addEventListener('click', () => modal.remove());
    newOk.addEventListener('click', () => { modal.remove(); onConfirm && onConfirm(); });
    modal.style.display = 'flex';
    // Enfocar botón confirmar para accesibilidad
    newOk.focus();
  };

  const wireBuyButtons = () => {
    // Captura botones de compra en el carrusel, con o sin data-attributes
    document.querySelectorAll('.carousel .card a.btn').forEach(a => {
      a.addEventListener('click', (e) => {
        // Guardar datos del pack y continuar navegación por href
        const t = e.currentTarget;
        // Si no hay data-attrs, inferir desde la tarjeta
        const card = t.closest('.card');
        const pack = {
          img: t.getAttribute('data-img') || card?.querySelector('img')?.getAttribute('src') || '',
          title: t.getAttribute('data-title') || card?.querySelector('h4')?.textContent || '',
          price: t.getAttribute('data-price') || (card?.querySelector('.price-row strong')?.textContent || '').replace('€','').trim(),
          desc: t.getAttribute('data-desc') || card?.querySelector('p')?.textContent || '',
          longDesc: t.getAttribute('data-longdesc') || t.getAttribute('data-desc') || card?.querySelector('p')?.textContent || ''
        };
        Storage.setSession(PACK_KEY, pack);
      });
    });
  };

  const pageHome = () => {
    wireBuyButtons();
    Carousel.init();
    // Login simple: interceptar submit para usar Auth
    const form = document.querySelector('.login form');
    if (form) {
      // Autorelleno desde cookie de "rememberLogin"
      const remembered = Storage.getCookie('rememberLogin');
      if (remembered && form.u) {
        form.u.value = remembered;
        if (form.remember) form.remember.checked = true;
      }
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = form.u?.value;
        const p = form.p?.value;
        const remember = !!form.remember?.checked;
        const res = Auth.login(u, p, remember);
        if (!res.ok) {
          showError(res.msg);
          return;
        }
        window.location.href = 'version-b.html';
      });
    }
  };

  const pageRegister = () => {
    const form = document.querySelector('form.form-card');
    if (!form) return;
    const submitBtn = document.getElementById('submit-reg');
    const policy = document.getElementById('policy');
    if (policy && submitBtn) {
      const toggle = () => { submitBtn.disabled = !policy.checked; };
      policy.addEventListener('change', toggle);
      toggle();
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form;
      const data = {
        nombre: f.nombre.value,
        apellidos: f.apellidos.value,
        email: f.email.value,
        email2: f.email2.value,
        fecha: f.fecha.value,
        login: f.login.value,
        pass: f.pass.value,
        foto: null
      };
      const errors = [];
      if (!Validators.minLen(data.nombre, 3)) errors.push('Nombre (≥3)');
      if (!Validators.minWords(data.apellidos, 2, 3)) errors.push('Apellidos (2 palabras, ≥3)');
      if (!Validators.email(data.email)) errors.push('Email');
      if (!Validators.same(data.email, data.email2)) errors.push('Confirmación email');
      if (!Validators.dateValid(data.fecha)) errors.push('Fecha de nacimiento');
      if (!Validators.minLen(data.login, 5)) errors.push('Login (≥5)');
      if (!Validators.passwordStrong(data.pass)) errors.push('Password (8+; 2 números; 1 especial; 1 may.; 1 min.)');
      if (errors.length) { alert('Revisa: ' + errors.join(', ')); return; }
      const file = f.foto?.files?.[0];
      const proceed = () => {
        Auth.saveUser(data); // guardar localStorage y cookies de login/pass
        Storage.setSession('mae:loggedIn', true);
        alert('Registro guardado correctamente');
        window.location.href = 'version-b.html';
      };
      if (file) {
        // Aceptar solo webp/png/jpg
        const okType = /image\/(webp|png|jpeg)/.test(file.type || '');
        const okExt = /\.(webp|png|jpe?g)$/i.test(file.name || '');
        if (!(okType || okExt)) { alert('Formato de imagen no permitido (webp, png, jpg)'); return; }
        const reader = new FileReader();
        reader.onload = () => { data.foto = reader.result; proceed(); };
        reader.onerror = proceed; // si falla, seguimos sin foto
        reader.readAsDataURL(file);
      } else {
        proceed();
      }
    });
  };

  const pagePrivate = () => {
    if (!Auth.isLogged()) {
      window.location.href = 'index.html';
      return;
    }
    // Carrusel también en privada
    Carousel.init();
    // Perfil y logout
    const user = Auth.getUser();
    const nameEl = document.getElementById('profile-name');
    if (nameEl && user) nameEl.textContent = user.nombre || user.login;
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl && user && user.foto) avatarEl.src = user.foto;
    const out = document.getElementById('logout-btn');
    out && out.addEventListener('click', (e) => {
      e.preventDefault();
      showConfirm('¿Desea cerrar sesión?', () => { Auth.logout(); window.location.href = 'index.html'; });
    });

    // Tips
    const list = document.querySelector('.tips .link-list');
    const form = document.querySelector('.tips form');
    Tips.render(list);
    Tips.attachForm(form, list);

    // Migrar handlers inline de "Ver más" y "like" para que no naveguen
    document.querySelectorAll('.exp-card .btn.small, .exp-card .like').forEach(el => {
      el.addEventListener('click', (e) => e.preventDefault());
    });
  };

  const pageCheckout = () => {
    Checkout.init();
  };

  const init = () => {
    const html = document.documentElement;
    if (html.classList.contains('page-home')) return pageHome();
    if (html.classList.contains('page-a')) return pageRegister();
    // Detectar por contenido cuando no hay clase
    if (document.querySelector('.checkout-form')) return pageCheckout();
    if (document.getElementById('profile-name')) return pagePrivate();
    // Newsletter genérica en cualquier página
    const news = document.querySelector('form.newsletter');
    news && news.addEventListener('submit', (e) => { e.preventDefault(); alert('Gracias por suscribirte.'); news.reset(); });
  };

  return { init };
})();

// Inicialización tras cargar DOM
document.addEventListener('DOMContentLoaded', () => App.init());
