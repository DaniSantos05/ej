// Gestión de consejos guardados en localStorage
const Tips = (() => {
  const KEY = 'mae:tips';

  const read = () => Array.isArray(Storage.getLocal(KEY)) ? Storage.getLocal(KEY) : [];
  const save = (arr) => Storage.setLocal(KEY, arr);

  const render = (ul) => {
    if (!ul) return;
    const tips = read();
    ul.innerHTML = '';
    // Mostrar solo los 3 más recientes (guardados al inicio)
    tips.slice(0, 3).forEach(t => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `tip.html?id=${encodeURIComponent(t.id || '')}`;
      a.textContent = t.title;
      li.appendChild(a);
      ul.appendChild(li);
    });
  };

  const attachForm = (form, ul) => {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = form.querySelector('#t')?.value || '';
      const text = form.querySelector('textarea')?.value || '';
      // Validaciones según enunciado
      if (!Validators.minLen(title, 15)) { alert('El título debe tener al menos 15 caracteres.'); return; }
      if (!Validators.minLen(text, 30)) { alert('La descripción debe tener al menos 30 caracteres.'); return; }
      const list = read();
      const id = 'tip-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      // Insertar al principio de la lista
      list.unshift({ id, title, text, at: Date.now() });
      save(list);
      form.reset();
      render(ul);
    });
  };

  return { read, save, render, attachForm };
})();
