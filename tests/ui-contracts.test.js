import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { Keypad, renderKeypad } from '../src/components/Keypad.js';
import { renderKeyGuide } from '../src/components/KeyGuide.js';
import { KEY_MANIFEST } from '../src/data/keys.js';
import { PLANET_ATLAS_ACTIVITIES } from '../src/data/activities.js';
import { defaultActivityState, renderActivityView } from '../src/destinations/planet-atlas/activityExperience.js';
import { renderMaintenanceView } from '../src/app/views.js';

function installDom(markup = '') {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {
    url: 'https://our-planet.test/#/key',
    pretendToBeVisual: true,
  });
  for (const name of ['window', 'document', 'Element', 'HTMLElement', 'Node', 'KeyboardEvent']) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: dom.window[name],
    });
  }
  return dom;
}

test('the four-digit keypad checks automatically and announces progress', async () => {
  const dom = installDom(renderKeypad());
  let completed = '';
  const keypad = new Keypad(document.querySelector('[data-keypad-root]'), {
    onComplete(value) { completed = value; },
  });

  for (const digit of '7318') {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: digit, bubbles: true }));
  }
  await Promise.resolve();

  assert.equal(completed, '7318');
  assert.match(document.querySelector('[data-key-accessible-value]').textContent, /4 of 4 digits entered: 7, 3, 1, 8/);
  assert.equal(document.querySelector('[data-keypad-root] button[type="submit"]'), null);
  keypad.destroy();
  dom.window.close();
});

test('typing in another field never leaks digits into the global keypad', () => {
  const dom = installDom(`${renderKeypad()}<input id="other-field" />`);
  const keypad = new Keypad(document.querySelector('[data-keypad-root]'));
  const input = document.querySelector('#other-field');
  input.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }));
  assert.equal(keypad.value, '');
  keypad.destroy();
  dom.window.close();
});

test('the adult backup import uses a keyboard-focusable button', () => {
  const dom = installDom(renderMaintenanceView({ profiles: [] }));
  const trigger = document.querySelector('[data-action="choose-backup-file"]');
  const input = document.querySelector('#backup-file');
  assert.equal(trigger?.tagName, 'BUTTON');
  assert.equal(trigger?.type, 'button');
  assert.equal(input?.type, 'file');
  dom.window.close();
});

test('the generated Key Guide splits cut-out cards into four-card pages', () => {
  const dom = installDom(renderKeyGuide(KEY_MANIFEST));
  const cardPages = [...document.querySelectorAll('.key-guide-page')]
    .filter((page) => page.querySelector('.display-key-card'));
  assert.equal(cardPages.length, 3);
  assert.equal(cardPages[0].querySelectorAll('.display-key-card').length, 4);
  assert.deepEqual(cardPages.slice(1).map((page) => page.querySelectorAll('.display-key-card').length), [4, 4]);
  dom.window.close();
});

test('all eight guided pathways render five distinct, usable stages', () => {
  for (const activity of PLANET_ATLAS_ACTIVITIES) {
    const titles = [];
    for (let step = 0; step < 5; step += 1) {
      const state = { ...defaultActivityState(activity), step };
      const dom = installDom(renderActivityView(activity, state));
      const title = document.querySelector('#stage-title');
      assert.ok(title, `${activity.id} stage ${step + 1} needs a heading`);
      assert.doesNotMatch(document.body.textContent, /\bundefined\b/);
      titles.push(title.textContent.trim());
      dom.window.close();
    }
    assert.equal(new Set(titles).size, 5, `${activity.id} has a duplicated stage`);
  }
});
