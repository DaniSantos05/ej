// Carrusel tipo slider con bucle infinito: 1 tarjeta visible, auto-rotación y flechas
const Carousel = (() => {
  let timer = null;
  let fallbackTimer = null;
  let index = 1;            // empezamos en 1 (tras clonar el último al principio)
  let count = 0;            // número de ítems reales
  let ul, items, container; // refs

  const sel = {
    root: '.carousel',
    list: '.carousel .cards.scroll',
    prev: '.carousel .arrows .arrow:first-child',
    next: '.carousel .arrows .arrow:last-child'
  };

  const intervalMs = 2000; // cambio cada 2s

  const setupLayout = () => {
    // Forzar layout del track
    ul.style.display = 'flex';
    ul.style.gap = '0';
    ul.style.padding = '0';
    ul.style.margin = '0';
    ul.style.listStyle = 'none';
    ul.style.transition = 'transform 500ms ease';
    ul.style.transform = 'translateX(0)';
    items.forEach((li) => {
      li.style.flex = '0 0 100%';
      li.style.maxWidth = '100%';
      li.style.margin = '0';
    });
    // Contenedor recorta
    container.style.overflow = 'hidden';
  };

  const width = () => {
    const w = container.getBoundingClientRect().width || container.clientWidth || ul.clientWidth;
    return Math.max(1, Math.floor(w));
  };

  const goTo = (i, animate = true) => {
    index = i;
    if (!animate) ul.style.transition = 'none';
    else ul.style.transition = 'transform 500ms ease';
    const x = -index * width();
    requestAnimationFrame(() => { ul.style.transform = `translateX(${x}px)`; });
    // aria-hidden sólo para reales
    items.forEach((li, k) => li.setAttribute('aria-hidden', (k !== index) ? 'true' : 'false'));
  };

  const maxIndex = () => items.length - 1; // índice del clon "first"

  const next = () => {
    // avanzar a siguiente, con límite superior al clon "first"
    let i = index + 1;
    if (i > maxIndex()) i = maxIndex();
    goTo(i, true);
    // Fallback: si estamos en el clon "first", forzar salto al primero real por tiempo
    clearTimeout(fallbackTimer);
    if (i === maxIndex()) {
      fallbackTimer = setTimeout(() => goTo(1, false), 600);
    }
  };

  const prev = () => {
    // retroceder, con límite inferior al clon "last"
    let i = index - 1;
    if (i < 0) i = 0;
    goTo(i, true);
    // Fallback: si estamos en el clon "last", forzar salto al último real por tiempo
    clearTimeout(fallbackTimer);
    if (i === 0) {
      fallbackTimer = setTimeout(() => goTo(count, false), 600);
    }
  };

  const start = () => { stop(); timer = setInterval(next, intervalMs); };
  const stop  = () => { if (timer) clearInterval(timer); timer = null; };

  const buildClones = () => {
    const originals = Array.from(ul.querySelectorAll('.card'));
    count = originals.length;
    if (count === 0) return false;
    // Limpiar clones previos si existen
    originals.forEach(o => o.removeAttribute('data-clone'));
    // Crear clones
    const firstClone = originals[0].cloneNode(true);
    const lastClone = originals[count - 1].cloneNode(true);
    firstClone.dataset.clone = 'first';
    lastClone.dataset.clone = 'last';
    ul.insertBefore(lastClone, originals[0]);
    ul.appendChild(firstClone);
    items = Array.from(ul.querySelectorAll('.card'));
    index = 1; // posición del primer real
    return true;
  };

  const attachEvents = () => {
    // Flechas
    const prevBtn = document.querySelector(sel.prev);
    const nextBtn = document.querySelector(sel.next);
    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);

    // Bucle infinito al terminar transición
    ul.addEventListener('transitionend', () => {
      const el = items[index];
      if (!el) return;
      if (el.dataset.clone === 'first') {
        // Hemos pasado del último real al clon del primero -> saltar al primero real
        goTo(1, false);
      } else if (el.dataset.clone === 'last') {
        // Hemos pasado del primero real al clon del último -> saltar al último real
        goTo(count, false);
      }
    });

    // Reposicionar al redimensionar
    window.addEventListener('resize', () => goTo(index, false));
  };

  const init = () => {
    ul = document.querySelector(sel.list);
    if (!ul) return;
    container = document.querySelector(sel.root) || ul.parentElement;
    if (!container) container = ul.parentElement || document.body;

    // Si ya habíamos inicializado (por recarga in-page), no duplicar clones
    // Reset: mover posibles clones y reconstruir
    const currentCards = ul.querySelectorAll('.card');
    if (currentCards.length > 3) {
      // Suponemos estructura [clone-last, real..., clone-first]
      // remover clones si están marcados
      ul.querySelectorAll('.card[data-clone]').forEach(n => n.remove());
    }

    // Construir y aplicar layout
    buildClones();
    items = Array.from(ul.querySelectorAll('.card'));
    setupLayout();

    // Posicionar en el primer real
    setTimeout(() => goTo(1, false), 0);

    attachEvents();
    start();
  };

  return { init };
})();
