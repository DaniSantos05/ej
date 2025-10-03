// Validaciones comunes para formularios
const Validators = (() => {
  const required = (v) => v != null && String(v).trim().length > 0;
  const minLen = (v, n) => String(v || '').trim().length >= n;
  const email = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
  const cardNumber = (v) => /^[0-9 ]{12,19}$/.test(String(v || ''));
  // Acepta números de tarjeta de 13, 15, 16 o 19 dígitos (ignorando espacios)
  const cardNumberAllowed = (v) => {
    const s = String(v || '').replace(/\s+/g, '');
    if (!/^\d+$/.test(s)) return false;
    const len = s.length;
    return len === 13 || len === 15 || len === 16 || len === 19;
  };
  const cvv = (v) => /^[0-9]{3}$/.test(String(v || ''));
  const mmYY = (v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(v || ''));
  const same = (a, b) => String(a || '') === String(b || '');

  // Al menos 'count' palabras con longitud mínima 'wordMin'
  const minWords = (v, count, wordMin) => {
    const words = String(v || '').trim().split(/\s+/).filter(Boolean);
    if (words.length < count) return false;
    let ok = 0;
    for (const w of words) if (w.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '').length >= wordMin) ok++;
    return ok >= count;
  };

  // Password: >=8, >=2 dígitos, 1 especial, 1 mayúscula, 1 minúscula
  const passwordStrong = (v) => {
    const s = String(v || '');
    if (s.length < 8) return false;
    const hasUpper = /[A-ZÁÉÍÓÚÑÜ]/.test(s);
    const hasLower = /[a-záéíóúñü]/.test(s);
    const digits = (s.match(/\d/g) || []).length;
    const hasSpecial = /[^A-Za-z0-9\s]/.test(s);
    return hasUpper && hasLower && digits >= 2 && hasSpecial;
  };

  // Fecha válida: no en el futuro, después de 1900-01-01
  const dateValid = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const min = new Date('1900-01-01');
    const today = new Date();
    // Comparar solo fecha
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dOnly >= min && dOnly <= tOnly;
  };

  // No pasada (>= hoy). Acepta fecha en formato ISO (YYYY-MM-DD) de <input type="date">
  const notPastDate = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dOnly >= tOnly;
  };

  // No pasado por mes (>= mes actual). Acepta:
  // - "YYYY-MM" (propio de <input type="month">)
  // - "MM/YY" (texto estilo 08/30)
  const notPastMonth = (value) => {
    if (!value) return false;
    let year, month; // month: 1..12
    if (/^\d{4}-\d{2}$/.test(value)) {
      // YYYY-MM
      const [y, m] = value.split('-');
      year = parseInt(y, 10);
      month = parseInt(m, 10);
    } else if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
      // MM/YY -> asumimos 20YY
      const [m, yy] = value.split('/');
      month = parseInt(m, 10);
      year = 2000 + parseInt(yy, 10);
    } else {
      return false;
    }
    if (!(month >= 1 && month <= 12)) return false;
    if (year < 1900 || year > 9999) return false;
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1; // 1..12
    // válido si (año > actual) o (año == actual y mes >= actual)
    return year > curYear || (year === curYear && month >= curMonth);
  };

  return { required, minLen, email, cardNumber, cardNumberAllowed, cvv, mmYY, same, minWords, passwordStrong, dateValid, notPastDate, notPastMonth };
})();
