import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { Keypad, renderKeypad } from '../src/components/Keypad.js';
import { renderKeyGuide } from '../src/components/KeyGuide.js';
import { KEY_MANIFEST } from '../src/data/keys.js';
import { PLANET_ATLAS_ACTIVITIES } from '../src/data/activities.js';
import {
  ACTIVITY_STAGE_COUNT,
  defaultActivityState,
  normaliseActivityState,
  renderActivityView,
} from '../src/destinations/planet-atlas/activityExperience.js';
import {
  renderArtifactCard,
  renderAtlasView,
  renderHomeView,
  renderMaintenanceView,
  renderWorkDetailView,
} from '../src/app/views.js';

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

test('all eight guided pathways use three continuous stages rather than five rigid screens', () => {
  for (const activity of PLANET_ATLAS_ACTIVITIES) {
    const labels = [];
    for (let step = 0; step < ACTIVITY_STAGE_COUNT; step += 1) {
      const state = { ...defaultActivityState(activity), step };
      const dom = installDom(renderActivityView(activity, state));
      const progress = document.querySelector('.activity-progress');
      assert.ok(progress, `${activity.id} stage ${step + 1} needs clear progress`);
      assert.equal(document.querySelectorAll('.activity-moment').length, step < 2 ? 2 : 1);
      assert.equal(document.querySelectorAll('[data-activity-step]').length, 0);
      assert.doesNotMatch(document.body.textContent, /\bundefined\b/);
      labels.push(progress.textContent.trim());
      dom.window.close();
    }
    assert.equal(new Set(labels).size, ACTIVITY_STAGE_COUNT, `${activity.id} has a duplicated stage`);
  }
});

test('the reduced child surfaces keep one canonical action for each outcome', () => {
  let dom = installDom(renderHomeView({ profile: { displayName: 'Mina' } }));
  assert.equal(document.querySelectorAll('[data-route="atlas"]').length, 1);
  dom.window.close();

  dom = installDom(renderAtlasView());
  assert.equal(document.querySelectorAll('[data-action^="save-atlas"]').length, 1);
  assert.equal(document.querySelector('.atlas-side'), null);
  dom.window.close();

  dom = installDom(renderArtifactCard({ id: 'piece-1', title: 'My map', artefactType: 'exploration-snapshot' }));
  assert.equal(document.querySelectorAll('button').length, 1);
  assert.equal(document.querySelector('[data-action="duplicate-artifact"]'), null);
  dom.window.close();
});

test('unfinished five-screen drafts migrate safely into the reduced three-stage flow', () => {
  const activity = PLANET_ATLAS_ACTIVITIES[0];
  assert.equal(normaliseActivityState(activity, { activityId: activity.id, step: 0 }).step, 0);
  assert.equal(normaliseActivityState(activity, { activityId: activity.id, step: 2 }).step, 1);
  assert.equal(normaliseActivityState(activity, { activityId: activity.id, step: 4 }).step, 2);
  assert.equal(normaliseActivityState(activity, { activityId: activity.id, workflowVersion: 2, step: 2 }).step, 2);
});

test('saved work never exposes internal workflow or schema language', () => {
  const dom = installDom(renderWorkDetailView({
    id: 'piece-1',
    title: 'My Place Pin',
    artefactType: 'place-pin',
    createdAt: new Date().toISOString(),
    content: {
      workflowVersion: 2,
      outcomeSchemaVersion: 1,
      observation: 'The country follows the river.',
    },
  }));
  assert.doesNotMatch(document.body.textContent, /workflow version|schema version/i);
  assert.match(document.body.textContent, /country follows the river/i);
  dom.window.close();
});
