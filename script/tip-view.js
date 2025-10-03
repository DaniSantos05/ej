// Lee el id de la query y muestra el consejo desde localStorage
(function(){
  function getParam(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  const id = getParam('id');
  const list = Array.isArray(Storage.getLocal('mae:tips')) ? Storage.getLocal('mae:tips') : [];
  const tip = list.find(t => t.id === id);
  const titleEl = document.getElementById('tip-title');
  const textEl = document.getElementById('tip-text');
  if (tip) {
    titleEl.textContent = tip.title;
    textEl.textContent = tip.text || 'Sin descripción';
  } else {
    titleEl.textContent = 'Consejo no encontrado';
    textEl.textContent = 'Es posible que haya sido eliminado.';
  }
})();
