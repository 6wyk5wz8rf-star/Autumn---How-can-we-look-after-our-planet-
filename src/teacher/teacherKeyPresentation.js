import { escapeAttr, escapeHTML } from '../utils/dom.js';
import { groupTeacherKeyLibrary } from './teacherKeyLibrary.js';

function viewOf(value) {
  const key = value?.key ?? value ?? {};
  const scale = value?.scaleTitle ?? ({
    activity: 'Activity',
    individual: 'Activity',
    collection: 'Collection',
    destination: 'Environment',
    environment: 'Environment',
    world: 'Whole World',
    'whole-world': 'Whole World',
  })[key.type ?? key.keyType] ?? '';
  return {
    id: String(value?.id ?? key.id ?? key.stableId ?? ''),
    code: String(value?.code ?? key.code ?? key.key ?? ''),
    title: String(value?.title ?? key.title ?? key.childFacingTitle ?? key.label ?? ''),
    purpose: String(value?.purpose ?? key.description ?? key.printGuide?.purpose ?? ''),
    scale,
    environmentTitle: String(value?.environment?.title ?? key.environmentTitle ?? key.destinationTitle ?? ''),
    curriculumTags: value?.curriculumTags ?? key.curriculumTags ?? [],
  };
}

export function renderFullScreenKeyDisplay(entry, { showTitle = true } = {}) {
  const key = viewOf(entry);
  return `<section class="teacher-key-display" role="dialog" aria-modal="true" aria-labelledby="teacher-key-display-heading" data-teacher-key-display>
    <button class="teacher-key-display__exit" type="button" data-teacher-key-display-exit aria-label="Close full-screen key display">Return</button>
    <div class="teacher-key-display__content">
      <p class="teacher-key-display__eyebrow" id="teacher-key-display-heading">Today’s Key</p>
      <div class="teacher-key-display__code" aria-label="Key ${escapeAttr(key.code.split('').join(' '))}">${escapeHTML(key.code)}</div>
      ${showTitle ? `<p class="teacher-key-display__title">${escapeHTML(key.title)}</p>` : ''}
    </div>
  </section>`;
}

export class FullScreenKeyDisplay {
  constructor({ document = globalThis.document, onExit = null } = {}) {
    this.document = document;
    this.onExit = onExit;
    this.element = null;
    this.returnFocus = null;
    this.inertedElements = [];
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  async open(entry, { showTitle = true, requestBrowserFullscreen = true } = {}) {
    this.close();
    if (!this.document?.body) throw new Error('A document body is required for board display');
    const wrapper = this.document.createElement('div');
    wrapper.innerHTML = renderFullScreenKeyDisplay(entry, { showTitle });
    this.element = wrapper.firstElementChild;
    this.returnFocus = this.document.activeElement;
    this.document.body.append(this.element);
    this.inertedElements = [...this.document.body.children]
      .filter((element) => element !== this.element)
      .map((element) => ({ element, wasInert: element.hasAttribute('inert') }));
    this.inertedElements.forEach(({ element }) => element.setAttribute('inert', ''));
    this.element.addEventListener('click', this.onClick);
    this.document.addEventListener('keydown', this.onKeyDown);
    this.element.querySelector('[data-teacher-key-display-exit]')?.focus({ preventScroll: true });
    if (requestBrowserFullscreen && this.element.requestFullscreen) {
      try {
        await this.element.requestFullscreen({ navigationUI: 'hide' });
      } catch {
        // The fixed viewport overlay remains a complete board display.
      }
    }
    return this.element;
  }

  onClick(event) {
    if (event.target.closest('[data-teacher-key-display-exit]')) this.close();
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab' || !this.element) return;
    const focusable = [...this.element.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const current = focusable.indexOf(this.document.activeElement);
    const next = event.shiftKey
      ? (current <= 0 ? focusable.at(-1) : focusable[current - 1])
      : (current === -1 || current === focusable.length - 1 ? focusable[0] : focusable[current + 1]);
    event.preventDefault();
    next.focus({ preventScroll: true });
  }

  close() {
    if (!this.element) return false;
    const element = this.element;
    this.element = null;
    element.removeEventListener('click', this.onClick);
    this.document?.removeEventListener('keydown', this.onKeyDown);
    if (this.document?.fullscreenElement === element) {
      try {
        this.document.exitFullscreen?.();
      } catch {
        // Removing the overlay still exits the in-app display.
      }
    }
    element.remove();
    this.inertedElements.forEach(({ element: inerted, wasInert }) => {
      if (!wasInert) inerted.removeAttribute('inert');
    });
    this.inertedElements = [];
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
    this.returnFocus = null;
    this.onExit?.();
    return true;
  }
}

export async function copyTeacherKeyCode(entry, {
  clipboard = globalThis.navigator?.clipboard,
  document = globalThis.document,
} = {}) {
  const code = viewOf(entry).code;
  if (!/^\d{4}$/.test(code)) throw new TypeError('A four-digit key is required');
  if (clipboard?.writeText) {
    await clipboard.writeText(code);
    return true;
  }
  if (!document?.body) throw new Error('Clipboard access is not available');
  const field = document.createElement('textarea');
  field.value = code;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  let copied = false;
  try {
    copied = Boolean(document.execCommand?.('copy'));
  } finally {
    field.remove();
  }
  if (!copied) throw new Error('Copy is not available in this browser');
  return true;
}

export function renderPrintableTodayKeyCard(entry, { showTitle = true, cutOut = false } = {}) {
  const key = viewOf(entry);
  return `<article class="teacher-print-key-card${cutOut ? ' teacher-print-key-card--cut-out' : ''}">
    <p>Today’s Key</p>
    <div class="teacher-print-key-card__code">${escapeHTML(key.code)}</div>
    ${showTitle ? `<h2>${escapeHTML(key.title)}</h2>` : ''}
  </article>`;
}

export function renderPrintableTeacherKeyGuide(entries = [], {
  title = 'Teacher Key Guide',
  environmentId = 'all',
} = {}) {
  const selected = environmentId === 'all'
    ? entries
    : entries.filter((entry) => entry.environment.id === environmentId);
  const groups = groupTeacherKeyLibrary(selected);
  return `<section class="teacher-print-guide">
    <header class="teacher-print-guide__header"><p>How Can We Look After Our Planet?</p><h1>${escapeHTML(title)}</h1><p>Children may explore every open environment. A key points towards one guided pathway.</p></header>
    ${groups.map((environment) => `<section class="teacher-print-guide__environment">
      <h2>${escapeHTML(environment.title)}</h2>
      ${environment.strands.map((strand) => `<section class="teacher-print-guide__strand"><h3>${escapeHTML(strand.title)}</h3><table>
        <thead><tr><th>Key</th><th>Pathway</th><th>Scale</th><th>Purpose</th></tr></thead>
        <tbody>${strand.entries.map((entry) => `<tr><td class="teacher-print-guide__code">${escapeHTML(entry.code)}</td><td><strong>${escapeHTML(entry.title)}</strong><br><span>${escapeHTML(entry.curriculumTags.join(' · '))}</span></td><td>${escapeHTML(entry.scaleTitle)}</td><td>${escapeHTML(entry.purpose)}</td></tr>`).join('')}</tbody>
      </table></section>`).join('')}
    </section>`).join('')}
  </section>`;
}

export function renderPrintableTodayKeyCards(entries = [], { showTitle = true } = {}) {
  return `<section class="teacher-print-card-sheet">${entries.map((entry) => renderPrintableTodayKeyCard(entry, { showTitle, cutOut: true })).join('')}</section>`;
}

export function mountTeacherPrintSurface(html, { document = globalThis.document } = {}) {
  if (!document?.body) throw new Error('A document body is required for printing');
  document.querySelector('[data-teacher-print-surface]')?.remove();
  const surface = document.createElement('div');
  surface.className = 'teacher-print-surface';
  surface.dataset.teacherPrintSurface = 'true';
  surface.innerHTML = html;
  document.body.append(surface);
  document.body.classList.add('teacher-printing');
  let destroyed = false;
  return Object.freeze({
    element: surface,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      surface.remove();
      document.body.classList.remove('teacher-printing');
    },
  });
}

export function printTeacherHTML(html, {
  document = globalThis.document,
  window = globalThis.window,
} = {}) {
  if (!window?.print) throw new Error('Printing is not available');
  const job = mountTeacherPrintSurface(html, { document });
  const cleanup = () => {
    window.removeEventListener?.('afterprint', cleanup);
    job.destroy();
  };
  window.addEventListener?.('afterprint', cleanup, { once: true });
  window.print();
  // Safari has historically omitted `afterprint` in some iPad versions.
  // Keep the printable snapshot long enough for the native sheet to capture it.
  globalThis.setTimeout?.(cleanup, 60_000);
  return job;
}
