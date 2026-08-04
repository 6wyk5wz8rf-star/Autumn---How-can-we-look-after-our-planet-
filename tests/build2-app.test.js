import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { resetDatabaseConnection } from '../src/services/db.js';
import { NUMBER_TOOLS } from '../src/data/numberExpedition.js';
import { getKeyByCode } from '../src/data/keys.js';
import NumberExpedition from '../src/destinations/number-expedition/NumberExpedition.js';
import { teacherKeySession } from '../src/teacher/index.js';
import { renderWorkDetailView } from '../src/app/views.js';

function installDom(url = 'https://our-planet.test/#/home') {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url,
    pretendToBeVisual: true,
  });
  const globals = {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    navigator: dom.window.navigator,
    localStorage: dom.window.localStorage,
    sessionStorage: dom.window.sessionStorage,
    Element: dom.window.Element,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    CustomEvent: dom.window.CustomEvent,
    HashChangeEvent: dom.window.HashChangeEvent,
    FormData: dom.window.FormData,
    Blob: dom.window.Blob,
    File: dom.window.File,
    XMLSerializer: dom.window.XMLSerializer,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    addEventListener: dom.window.addEventListener.bind(dom.window),
    removeEventListener: dom.window.removeEventListener.bind(dom.window),
    dispatchEvent: dom.window.dispatchEvent.bind(dom.window),
  };
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  return dom;
}

const settle = (milliseconds = 30) => new Promise((resolve) => setTimeout(resolve, milliseconds));

test('all 17 open mathematical tools generate valid new values and enter anonymous Board View', () => {
  const dom = installDom();
  const host = document.querySelector('#app');
  for (const tool of NUMBER_TOOLS) {
    host.innerHTML = '<div id="workspace"></div>';
    const workspace = new NumberExpedition(document.querySelector('#workspace'), { toolId: tool.id });
    assert.match(document.body.textContent, new RegExp(tool.title.replace(/[?+]/g, '\\$&')));
    const newValues = document.querySelector('[data-number-action="new-challenge"]');
    assert.ok(newValues, `${tool.id} needs a New values control`);
    newValues.click();
    assert.match(workspace.state.generatorTaskId, /^number-task-/);
    document.querySelector('[data-number-action="open-board"]').click();
    const board = document.querySelector('.board-view');
    assert.ok(board, `${tool.id} needs Board View`);
    assert.doesNotMatch(board.textContent, /learner|profile|Mina/i);
    assert.equal(board.querySelectorAll('[data-number-action="close-board"]').length, 1);
    workspace.destroy();
  }
  dom.window.close();
});

test('generated tasks update the visible mathematics and boundary inputs stay truthful', () => {
  const dom = installDom();
  const host = document.querySelector('#app');
  const cases = [
    ['more-less-stepper', (state, values) => state.value === values.start && state.step === Math.abs(values.change)],
    ['subtraction-model', (state, values) => state.left === values.minuend && state.right === values.subtrahend],
    ['strategy-comparator', (state, values) => state.left === values.minuend && state.right === values.subtrahend],
    ['inverse-builder', (state, values) => state.left === values.firstAddend && state.right === values.secondAddend],
    ['problem-modeller', (state, values) => state.left === values.start && state.right === values.changeOne],
    ['create-challenge', (state, values) => state.left === values.start && state.right === values.changeOne],
  ];
  for (const [toolId, matches] of cases) {
    host.innerHTML = '<div id="workspace"></div>';
    const workspace = new NumberExpedition(document.querySelector('#workspace'), { toolId });
    document.querySelector('[data-number-action="new-challenge"]').click();
    assert.ok(matches(workspace.state, workspace.state.generatedTask.values), `${toolId} must apply its generated values`);
    workspace.destroy();
  }

  host.innerHTML = '<div id="workspace"></div>';
  const stepper = new NumberExpedition(document.querySelector('#workspace'), { toolId: 'more-less-stepper' });
  stepper.commit((state) => { state.value = 9990; });
  document.querySelector('[data-number-action="step"][data-delta="10"]').click();
  assert.equal(stepper.state.value, 10000);
  assert.match(document.body.textContent, /10,000/);
  stepper.destroy();

  host.innerHTML = '<div id="workspace"></div>';
  const addition = new NumberExpedition(document.querySelector('#workspace'), { toolId: 'addition-model' });
  const first = document.querySelector('[data-number-field="left"]');
  first.value = '12000';
  first.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.equal(addition.state.left, 9999);
  assert.equal(document.querySelector('[data-number-field="left"]').value, '9999');
  addition.destroy();

  host.innerHTML = '<div id="workspace"></div>';
  const rounding = new NumberExpedition(document.querySelector('#workspace'), {
    toolId: 'rounding-tool',
    savedState: { value: 1, roundingUnit: 10, roundingChoice: null },
  });
  assert.equal(document.querySelector('[data-number-action="round-choice"][aria-pressed="true"]'), null);
  assert.match(document.querySelector('.maths-feedback').textContent, /choose the nearest multiple/i);
  rounding.destroy();
  dom.window.close();
});

test('saved mathematical work reconstructs its model without exposing generator internals', () => {
  const html = renderWorkDetailView({
    id: 'saved-subtraction',
    artefactType: 'subtraction-model',
    title: 'Exchange Across Zero',
    createdAt: '2026-08-03T12:00:00.000Z',
    updatedAt: '2026-08-03T12:00:00.000Z',
    content: {
      generatorSeed: 'hidden-seed:4',
      explanation: 'I exchanged through the empty hundreds and tens places.',
      modelState: { left: 4002, right: 1786, answerRevealed: true },
    },
  });
  const dom = new JSDOM(html);
  const calculation = dom.window.document.querySelector('.column-calculation');
  assert.ok(calculation);
  assert.equal(calculation.querySelectorAll('.place-headings > span').length, 5);
  assert.match(calculation.textContent, /4002/);
  assert.match(calculation.textContent, /2216/);
  assert.match(dom.window.document.body.textContent, /empty hundreds and tens places/);
  assert.doesNotMatch(dom.window.document.body.textContent, /hidden-seed|generator seed/i);
  dom.window.close();
});

test('saved mathematical work retains its original values and recent learner actions', async () => {
  const dom = installDom();
  let payload = null;
  const workspace = new NumberExpedition(document.querySelector('#app'), {
    toolId: 'build-number',
    onSave: async (nextPayload) => { payload = nextPayload; },
  });
  const valueInput = document.querySelector('[data-number-field="value"]');
  valueInput.value = '4052';
  valueInput.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  document.querySelector('[data-number-action="place-delta"][data-place="ones"][data-delta="1"]').click();
  await workspace.save();
  assert.equal(payload.structuredContent.originalValues.value, 4382);
  assert.equal(payload.structuredContent.values.value, 4053);
  assert.deepEqual(
    payload.structuredContent.childActions.map(({ action }) => action),
    ['change-value', 'adjust-place-value'],
  );
  assert.equal(payload.structuredContent.modelState.value, 4053);
  workspace.destroy();
  dom.window.close();
});

test('saving captures a focused mathematical explanation before its change event', async () => {
  const dom = installDom();
  let payload = null;
  const workspace = new NumberExpedition(document.querySelector('#app'), {
    toolId: 'build-number',
    onSave: async (nextPayload) => { payload = nextPayload; },
  });
  const explanation = document.querySelector('[data-number-text="explanation"]');
  explanation.value = 'The zero keeps the hundreds place visible.';
  explanation.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  await workspace.save();

  assert.equal(payload.writtenExplanation, 'The zero keeps the hundreds place visible.');
  assert.equal(
    payload.structuredContent.modelState.explanation,
    'The zero keeps the hundreds place visible.',
  );
  assert.ok(payload.structuredContent.childActions.some(({ action, field }) => (
    action === 'change-written-response' && field === 'explanation'
  )));
  workspace.destroy();
  dom.window.close();
});

test('Roman feedback, spoken maths, reasoning controls and Board keyboard behaviour are specific', () => {
  const dom = installDom();
  const host = document.querySelector('#app');
  host.innerHTML = '<div id="workspace"></div>';
  const roman = new NumberExpedition(document.querySelector('#workspace'), { toolId: 'roman-builder' });
  const romanInput = document.querySelector('[data-number-text="romanInput"]');
  romanInput.value = 'XX';
  romanInput.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.equal(document.querySelector('.maths-feedback').dataset.tone, 'inspect');
  assert.match(document.querySelector('.maths-feedback').textContent, /not 47/);
  roman.destroy();

  let spoken = '';
  host.innerHTML = '<div id="workspace"></div>';
  const addition = new NumberExpedition(document.querySelector('#workspace'), { toolId: 'addition-model', onSpeak: (text) => { spoken = text; } });
  document.querySelector('[data-number-action="speak-number"]').click();
  assert.match(spoken, /three thousand six hundred and eighty-seven plus four thousand seven hundred and fifty-six/i);
  const boardButton = document.querySelector('[data-number-action="open-board"]');
  boardButton.click();
  assert.equal(document.activeElement.dataset.numberAction, 'close-board');
  document.querySelector('.board-view').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(document.querySelector('.board-view'), null);
  assert.equal(document.activeElement.dataset.numberAction, 'open-board');
  addition.destroy();

  host.innerHTML = '<div id="workspace"></div>';
  let boardPersistenceChanges = 0;
  const statement = new NumberExpedition(document.querySelector('#workspace'), {
    toolId: 'statement-tester',
    savedState: {
      selectedClassification: 'sometimes',
      answerRevealed: true,
      annotation: 'Keep this learner note.',
    },
    onChange: () => { boardPersistenceChanges += 1; },
  });
  document.querySelector('[data-number-action="open-board"]').click();
  assert.equal(statement.state.selectedClassification, '');
  document.querySelector('[data-number-action="board-next"]').click();
  const boardNote = document.querySelector('[data-number-text="annotation"]');
  boardNote.value = 'Temporary board note';
  boardNote.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  document.querySelector('[data-number-action="close-board"]').click();
  assert.equal(statement.state.selectedClassification, 'sometimes');
  assert.equal(statement.state.answerRevealed, true);
  assert.equal(statement.state.annotation, 'Keep this learner note.');
  assert.equal(boardPersistenceChanges, 0);
  statement.destroy();

  for (const [toolId, selector] of [
    ['inverse-builder', '[data-number-text="inverseMissingRole"]'],
    ['problem-modeller', '[data-number-action="problem-operation"]'],
    ['statement-tester', '[data-number-action="classify"]'],
    ['create-challenge', '[data-number-text="challengeType"]'],
    ['build-number', '[data-number-action="exchange"]'],
  ]) {
    host.innerHTML = '<div id="workspace"></div>';
    const workspace = new NumberExpedition(document.querySelector('#workspace'), { toolId });
    assert.ok(document.querySelector(selector), `${toolId} needs its deliberate interaction`);
    workspace.destroy();
  }
  dom.window.close();
});

test('Build 2 child flow grants a maths key, saves and accurately reopens a mathematical model', async () => {
  const dom = installDom();
  await resetDatabaseConnection({ databaseName: 'our-planet-build2-child-flow', clearMemory: true });
  const { default: App } = await import('../src/app/App.js');
  const app = new App(document.querySelector('#app'));
  await app.init();

  const form = document.querySelector('#create-profile-form');
  form.elements.name.value = 'Mina';
  await app.submitProfile(form);
  assert.match(document.body.textContent, /Today’s Key/);
  assert.match(document.body.textContent, /Number Expedition/);

  app.route = { name: 'numbers', params: {} };
  await app.render();
  assert.equal(document.querySelectorAll('.destination-mode-nav [data-route="number-tool"]').length, 4);
  assert.ok(document.querySelector('.destination-more-tools'));

  let keyMessage = '';
  await app.handleKey('4827', {
    setMessage(message) { keyMessage = message; },
    reset() {},
  });
  await settle(460);
  assert.match(keyMessage, /Build a Four-Digit Number is ready/);
  assert.ok(app.access.some((record) => record.activityId === 'build-four-digit-number'));

  await app.handleKey('1847', { setMessage() {}, reset() {} });
  await settle(460);
  assert.equal(location.hash, '#/collection/key-number-collection-four-digit-foundations');
  app.route = { name: 'collection', params: { keyId: 'key-number-collection-four-digit-foundations' } };
  await app.render();
  assert.match(document.body.textContent, /Four-Digit Foundations/);
  assert.equal(document.querySelectorAll('.key-path-row').length, 4);

  app.route = { name: 'activity', params: { activityId: 'build-four-digit-number' } };
  await app.prepareRoute();
  await app.render();
  assert.ok(app.numberExpedition);
  app.numberExpedition.commit((state) => {
    state.value = 4052;
    state.explanation = 'The zero keeps the hundreds place visible.';
  });
  await app.numberExpedition.save();

  const saved = app.artifacts.find((item) => item.activityId === 'build-four-digit-number');
  assert.ok(saved);
  assert.equal(saved.artefactType, 'four-digit-model');
  assert.equal(saved.content.modelState.value, 4052);
  assert.equal(saved.content.generatorSeed, 'build-four-digit-number:1');

  await app.reopenArtifact(saved.id);
  await settle();
  app.route = { name: 'activity', params: { activityId: 'build-four-digit-number' } };
  await app.prepareRoute();
  await app.render();
  assert.equal(app.numberExpedition.state.value, 4052);
  assert.match(app.numberExpedition.state.explanation, /zero keeps the hundreds place/);

  dom.window.close();
});

test('8584 and legacy 4829 open the same non-mutating, refresh-closing Teacher Key Room', async () => {
  const dom = installDom();
  await resetDatabaseConnection({ databaseName: 'our-planet-build2-teacher-flow', clearMemory: true });
  const { default: App } = await import('../src/app/App.js');
  const app = new App(document.querySelector('#app'));
  await app.init();
  const form = document.querySelector('#create-profile-form');
  form.elements.name.value = 'Ari';
  await app.submitProfile(form);

  const accessBefore = app.access.length;
  const workBefore = app.artifacts.length;
  app.route = { name: 'work', params: {} };
  app.keyEntryOrigin = { name: 'work', params: {} };
  await app.render();
  await app.handleKey('8584', { setMessage() {}, reset() {} });
  await settle(360);
  assert.equal(teacherKeySession.getState().active, true);
  assert.equal(app.maintenanceUnlocked, true);

  app.route = { name: 'maintenance', params: {} };
  await app.render();
  assert.match(document.body.textContent, /Teacher Key Room/);
  assert.match(document.body.textContent, /8584/);
  assert.equal(document.querySelectorAll('[data-teacher-key-id]').length, 0);
  const search = document.querySelector('[data-teacher-filter="query"]');
  search.value = 'exchange';
  search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.ok(document.querySelectorAll('[data-teacher-key-id]').length >= 1);
  assert.doesNotMatch(document.querySelector('[data-teacher-key-results]').textContent, /4829|8584/);
  assert.equal(app.access.length, accessBefore);
  assert.equal(app.artifacts.length, workBefore);

  await app.exitTeacherKeyRoom({ name: 'work', params: {} });
  await settle();
  assert.equal(teacherKeySession.getState().active, false);
  assert.equal(app.maintenanceUnlocked, false);

  app.route = { name: 'key', params: {} };
  await app.render();
  await app.handleKey('4829', { setMessage() {}, reset() {} });
  await settle(360);
  assert.equal(teacherKeySession.getState().active, true);
  assert.equal(app.access.length, accessBefore);
  await app.exitTeacherKeyRoom({ name: 'home', params: {} });

  const refreshedApp = new App(document.querySelector('#app'));
  assert.equal(refreshedApp.maintenanceUnlocked, false);
  assert.equal(teacherKeySession.getState().active, false);
  dom.window.close();
});

test('Teacher Key Room opens the actual guided activity as a non-mutating preview', async () => {
  const dom = installDom();
  await resetDatabaseConnection({ databaseName: 'our-planet-build2-teacher-preview', clearMemory: true });
  const { default: App } = await import('../src/app/App.js');
  const app = new App(document.querySelector('#app'));
  await app.init();
  const form = document.querySelector('#create-profile-form');
  form.elements.name.value = 'Sam';
  await app.submitProfile(form);
  const accessBefore = app.access.length;
  const workBefore = app.artifacts.length;

  await app.handleKey('8584', { setMessage() {}, reset() {} });
  await settle(360);
  await app.openTeacherKey(getKeyByCode('4827'));
  app.route = { name: 'activity', params: { activityId: 'build-four-digit-number' } };
  await app.prepareRoute();
  await app.render();
  assert.equal(app.teacherPreviewActivityId, 'build-four-digit-number');
  assert.ok(document.querySelector('.guided-notice'));
  assert.match(document.body.textContent, /Represent and identify four-digit numbers/);
  assert.equal(app.access.length, accessBefore);

  app.numberExpedition.commit((state) => { state.value = 4052; });
  await app.numberExpedition.save();
  assert.equal(app.artifacts.length, workBefore);
  assert.equal(app.access.length, accessBefore);
  dom.window.close();
});
