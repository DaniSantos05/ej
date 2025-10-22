// Gestión de consejos guardados en localStorage
const Tips = (() => {
  const KEY = 'mae:tips';

  const read = () => Array.isArray(Storage.getLocal(KEY)) ? Storage.getLocal(KEY) : [];
  // Lee de remoto si está habilitado, con fallback a local
  const readAsync = async (limit = 3) => {
    if (window.RemoteTips?.enabled) {
      const remote = await window.RemoteTips.read(limit);
      if (Array.isArray(remote) && remote.length) return remote;
    }
    const local = read();
    return local.slice(0, limit);
  };
  const save = (arr) => Storage.setLocal(KEY, arr);

  const render = (ul) => {
    if (!ul) return;
    ul.innerHTML = '';
    // Mostrar solo los 3 más recientes
    readAsync(3).then(tips => {
      tips.forEach(t => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // Enlace ficticio: mantener aspecto de link pero sin navegación real
        a.href = '#';
        a.addEventListener('click', (e) => e.preventDefault());
        a.setAttribute('aria-disabled', 'true');
        a.title = 'Vista de detalle no disponible';
        a.textContent = t.title;
        li.appendChild(a);
        ul.appendChild(li);
      });
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
      const tip = { id, title, text, at: Date.now() };
      list.unshift(tip);
      save(list);
      // Intentar guardar también en remoto si está habilitado (sin bloquear la UI)
      if (window.RemoteTips?.enabled) {
        window.RemoteTips.add(tip).catch(() => {});
      }
      form.reset();
      render(ul);
    });
  };

  return { read, save, render, attachForm };
})();
