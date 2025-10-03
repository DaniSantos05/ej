// Lógica de compra: precarga pack y validaciones del formulario
const Checkout = (() => {
  const PACK_KEY = 'mae:selectedPack';

  const hydratePack = () => {
    const pack = Storage.getSession(PACK_KEY);
    if (!pack) return;
    const img = document.querySelector('.product-image');
    const title = document.getElementById('pack-title');
    const price = document.getElementById('pack-price');
    const brief = document.getElementById('pack-brief');
    const desc = document.getElementById('pack-desc');
    if (img && pack.img) img.src = pack.img;
    if (title && pack.title) title.textContent = pack.title;
    if (price && pack.price) price.textContent = '€' + pack.price;
    if (brief && pack.desc) brief.textContent = pack.desc;
    if (desc && pack.longDesc) desc.textContent = pack.longDesc;
  };

  const attachForm = () => {
    const form = document.querySelector('.checkout-form');
    if (!form) return;
    // Selector de fecha con días: fijar min y abrir con el botón
    const cadInput = form.querySelector('#cad[type="date"]');
    const calBtn = form.querySelector('.cal-btn');
    if (cadInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      cadInput.min = `${yyyy}-${mm}-${dd}`;
    }
    if (calBtn && cadInput) {
      calBtn.addEventListener('click', () => {
        if (typeof cadInput.showPicker === 'function') cadInput.showPicker();
        else cadInput.focus();
      });
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = form.n?.value;
      const ce = form.ce?.value;
      const tt = form.tt?.value;
      const num = form.num?.value;
      const tit = form.tit?.value;
      const cad = form.cad?.value;
      const cvv = form.cvv?.value;

      const errors = [];
  if (!Validators.minLen(n, 3)) errors.push('Nombre (≥3)');
      if (!Validators.email(ce)) errors.push('Email');
  if (!Validators.required(tt)) errors.push('Tipo de tarjeta');
  if (!Validators.cardNumberAllowed(num)) errors.push('Número de tarjeta (13, 15, 16 o 19 dígitos)');
  if (!Validators.minLen(tit, 3)) errors.push('Titular (≥3)');
  // Validación de fecha de caducidad: no puede estar vencida
  if (!Validators.notPastDate(cad)) errors.push('Fecha de caducidad (no pasada)');
  if (!Validators.cvv(cvv)) errors.push('CVV (3 dígitos)');

      if (errors.length) {
        alert('Revisa: ' + errors.join(', '));
        return;
      }
      alert('Compra realizada correctamente. ¡Buen viaje!');
      form.reset();
      Storage.removeSession(PACK_KEY);
    });
  };

  const init = () => {
    hydratePack();
    attachForm();
  };

  return { init };
})();
