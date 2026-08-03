import { escapeHTML } from '../utils/dom.js';

export class Keypad {
  constructor(root, { onComplete, onChange } = {}) {
    this.root = root;
    this.onComplete = onComplete;
    this.onChange = onChange;
    this.value = '';
    this.busy = false;
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.root.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown);
    this.renderDigits();
  }

  onClick(event) {
    const button = event.target.closest('[data-keypad-value], [data-keypad-action]');
    if (!button || this.busy) return;
    if (button.dataset.keypadValue) this.add(button.dataset.keypadValue);
    if (button.dataset.keypadAction === 'backspace') this.remove();
    if (button.dataset.keypadAction === 'reset') this.reset();
  }

  onKeyDown(event) {
    if (this.busy || !this.root.isConnected) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const overlay = document.querySelector('.modal-backdrop, .glossary-popover');
    if (overlay && (!(target instanceof Node) || !this.root.contains(target))) return;
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      this.add(event.key);
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.remove();
    }
    if (event.key === 'Escape') this.reset();
  }

  add(digit) {
    if (this.value.length >= 4) return;
    this.value += digit;
    this.renderDigits();
    this.onChange?.(this.value);
    if (this.value.length === 4) this.check();
  }

  remove() {
    this.value = this.value.slice(0, -1);
    this.renderDigits();
    this.onChange?.(this.value);
  }

  reset({ keepMessage = false } = {}) {
    this.value = '';
    this.busy = false;
    this.renderDigits();
    if (!keepMessage) this.setMessage('Enter the four digits. The pathway opens after the last one.', 'quiet');
    this.onChange?.(this.value);
  }

  async check() {
    this.busy = true;
    try {
      await this.onComplete?.(this.value, this);
    } finally {
      this.busy = false;
    }
  }

  setMessage(message, tone = 'quiet') {
    const element = this.root.querySelector('[data-key-message]');
    if (!element) return;
    element.textContent = message;
    element.dataset.tone = tone;
  }

  renderDigits() {
    this.root.querySelectorAll('[data-key-digit]').forEach((element, index) => {
      const digit = this.value[index];
      element.textContent = digit ? escapeHTML(digit) : '·';
      element.dataset.filled = String(Boolean(digit));
    });
    const accessibleValue = this.root.querySelector('[data-key-accessible-value]');
    if (accessibleValue) {
      accessibleValue.textContent = this.value.length
        ? `${this.value.length} of 4 digits entered: ${this.value.split('').join(', ')}.`
        : 'No digits entered. Four digits are needed.';
    }
  }

  destroy() {
    this.root.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
  }
}

export function renderKeypad() {
  return `<div class="keypad-wrap" data-keypad-root>
    <div class="key-digits" role="group" aria-label="Four digit key">
      ${[0, 1, 2, 3].map((index) => `<span class="key-digit" data-key-digit="${index}" aria-hidden="true">·</span>`).join('')}
    </div>
    <p class="sr-only" data-key-accessible-value role="status" aria-live="polite">No digits entered. Four digits are needed.</p>
    <div class="keypad" aria-label="Number keypad">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => `<button type="button" data-keypad-value="${number}" aria-label="${number}">${number}</button>`).join('')}
      <button type="button" data-keypad-action="reset" aria-label="Clear all digits"><span aria-hidden="true">C</span></button>
      <button type="button" data-keypad-value="0" aria-label="0">0</button>
      <button type="button" data-keypad-action="backspace" aria-label="Remove last digit"><span aria-hidden="true">⌫</span></button>
    </div>
    <div class="key-message" data-key-message role="status">Enter the four digits. The pathway opens after the last one.</div>
  </div>`;
}
