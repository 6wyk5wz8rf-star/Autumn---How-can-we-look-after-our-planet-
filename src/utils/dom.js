export function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeAttr(value = '') {
  return escapeHTML(value).replaceAll('`', '&#096;');
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function uniqueId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const focusable = qsa('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container)
    .filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function announce(message) {
  const region = document.querySelector('#global-announcer');
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

export function setDocumentTitle(pageTitle) {
  document.title = pageTitle
    ? `${pageTitle} · How Can We Look After Our Planet?`
    : 'How Can We Look After Our Planet?';
}
