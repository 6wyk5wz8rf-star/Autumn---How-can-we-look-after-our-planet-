import { escapeAttr, escapeHTML } from '../utils/dom.js';

export function closeButton(action = 'close-modal') {
  return `<button class="icon-button" type="button" data-action="${escapeAttr(action)}" aria-label="Close">×</button>`;
}

export function renderConfirmModal({ title, message, confirmLabel = 'Yes, continue', action, tone = 'danger' }) {
  return `<div class="modal-backdrop" data-modal="confirm">
    <section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
      <div class="modal-head">
        <h2 id="confirm-title">${escapeHTML(title)}</h2>
        ${closeButton()}
      </div>
      <div class="modal-body stack">
        <p id="confirm-message">${escapeHTML(message)}</p>
        <div class="cluster">
          <button class="button ${escapeAttr(tone)}" type="button" data-action="${escapeAttr(action)}">${escapeHTML(confirmLabel)}</button>
          <button class="button secondary" type="button" data-action="close-modal">Keep everything</button>
        </div>
      </div>
    </section>
  </div>`;
}
