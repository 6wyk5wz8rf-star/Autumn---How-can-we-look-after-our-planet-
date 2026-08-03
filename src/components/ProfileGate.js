import { escapeAttr, escapeHTML } from '../utils/dom.js';

export const PROFILE_SYMBOLS = [
  { id: 'globe', icon: '◉' },
  { id: 'river', icon: '⌁' },
  { id: 'sun', icon: '✦' },
  { id: 'mountain', icon: '△' },
  { id: 'wave', icon: '≈' },
  { id: 'seed', icon: '❋' },
  { id: 'compass', icon: '◇' },
  { id: 'leaf', icon: '☘' },
];
export const PROFILE_PATTERNS = ['ripples', 'contours', 'speckles', 'crosshatch'];

export function profileSymbolIcon(symbol) {
  return PROFILE_SYMBOLS.find((choice) => choice.id === symbol)?.icon || '◉';
}

export function renderProfileModal(profiles = [], { forceCreate = false, canClose = false } = {}) {
  const hasProfiles = profiles.length > 0;
  return `<div class="modal-backdrop" data-modal="profiles">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div class="modal-head">
        <div>
          <p class="eyebrow">This device</p>
          <h2 id="profile-title">${forceCreate || !hasProfiles ? 'Make a learner space' : 'Whose work is this?'}</h2>
        </div>
        ${canClose ? '<button class="icon-button" type="button" data-action="close-profile-modal" aria-label="Close">×</button>' : ''}
      </div>
      <div class="modal-body stack">
        ${hasProfiles && !forceCreate ? `<div class="profile-grid">
        ${profiles.map((profile) => `<button class="profile-card" type="button" data-action="choose-profile" data-profile-id="${escapeAttr(profile.id)}">
            <span class="profile-symbol" aria-hidden="true">${profileSymbolIcon(profile.symbol)}</span>
            <strong>${escapeHTML(profile.displayName || profile.name)}</strong>
            <span class="small muted">Open my space</span>
          </button>`).join('')}
          <button class="profile-card" type="button" data-action="show-create-profile">
            <span class="profile-symbol" aria-hidden="true">＋</span>
            <strong>New learner</strong>
            <span class="small muted">Make a separate space</span>
          </button>
        </div>` : renderCreateProfileForm({ showBack: hasProfiles })}
        ${hasProfiles && !forceCreate ? '<p class="small muted">Keys, work and settings stay separate for each learner.</p>' : ''}
      </div>
    </section>
  </div>`;
}

export function renderCreateProfileForm({ showBack = false } = {}) {
  return `<form class="stack" id="create-profile-form" autocomplete="off">
    <label class="stack" style="gap:.4rem">
      <strong>First name, nickname or initials</strong>
      <input name="name" type="text" maxlength="24" required placeholder="For example, Mina or MJ" aria-describedby="profile-privacy" />
    </label>
    <p class="small muted" id="profile-privacy">No email, surname or password. This stays on this device.</p>
    <fieldset class="stack" style="border:0;padding:0;margin:0">
      <legend><strong>Choose a symbol</strong></legend>
      <div class="symbol-picker">
        ${PROFILE_SYMBOLS.map((symbol, index) => `<button class="symbol-choice" type="button" data-action="choose-symbol" data-value="${escapeAttr(symbol.id)}" aria-label="Choose ${symbol.id} symbol" aria-pressed="${index === 0}">${escapeHTML(symbol.icon)}</button>`).join('')}
      </div>
      <input type="hidden" name="symbol" value="${escapeAttr(PROFILE_SYMBOLS[0].id)}" />
    </fieldset>
    <fieldset class="stack" style="border:0;padding:0;margin:0">
      <legend><strong>Choose a pattern</strong></legend>
      <div class="pattern-picker">
        ${PROFILE_PATTERNS.map((pattern, index) => `<button class="pattern-choice" type="button" data-action="choose-pattern" data-pattern="${pattern}" data-value="${pattern}" aria-label="Choose ${pattern} pattern" aria-pressed="${index === 0}"></button>`).join('')}
      </div>
      <input type="hidden" name="pattern" value="${PROFILE_PATTERNS[0]}" />
    </fieldset>
    <div class="cluster">
      <button class="button" type="submit">Enter Our Planet</button>
      ${showBack ? '<button class="button secondary" type="button" data-action="back-to-profiles">Back</button>' : ''}
    </div>
  </form>`;
}
