import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { resetDatabaseConnection } from '../src/services/db.js';
import { SCIENCE_TOOLS } from '../src/data/livingThings.js';
import LivingThingsObservatory from '../src/destinations/living-things/LivingThingsObservatory.js';
import { renderWorkDetailView } from '../src/app/views.js';

function installDom(url = 'https://our-planet.test/#/home') {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url, pretendToBeVisual: true });
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
    FileReader: dom.window.FileReader,
    XMLSerializer: dom.window.XMLSerializer,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    addEventListener: dom.window.addEventListener.bind(dom.window),
    removeEventListener: dom.window.removeEventListener.bind(dom.window),
    dispatchEvent: dom.window.dispatchEvent.bind(dom.window),
  };
  for (const [name, value] of Object.entries(globals)) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  globalThis.scrollTo = () => {};
  return dom;
}

const settle = (milliseconds = 40) => new Promise((resolve) => setTimeout(resolve, milliseconds));

test('all 18 open scientific tools render, regenerate, save structured work and use anonymous Board View', async () => {
  const dom = installDom();
  const host = document.querySelector('#app');
  for (const tool of SCIENCE_TOOLS) {
    let saved = null;
    host.innerHTML = '<div id="workspace"></div>';
    const workspace = new LivingThingsObservatory(document.querySelector('#workspace'), {
      toolId: tool.id,
      onSave: async (payload, state) => { saved = { payload, state }; },
    });
    assert.match(document.body.textContent, new RegExp(tool.title.replace(/[?+]/g, '\\$&')));
    document.querySelector('[data-science-action="new-task"]').click();
    assert.match(workspace.state.task.id, /^science-/);
    const beforeBoard = workspace.snapshot();
    document.querySelector('[data-science-action="open-board"]').click();
    const board = document.querySelector('.science-board-view');
    assert.ok(board, `${tool.id} needs Board View`);
    assert.doesNotMatch(board.textContent, /learner profile|save to my work/i);
    assert.equal(board.querySelectorAll('[data-science-action="close-board"]').length, 1);
    document.querySelector('[data-science-action="close-board"]').click();
    assert.deepEqual(workspace.snapshot(), beforeBoard, `${tool.id} Board View must not change learner work`);
    if (tool.mode === 'challenge') {
      workspace.state.compareOrganismIds = workspace.state.organismIds.slice(0, 4);
      workspace.state.explanation = 'Use observable features to ask a clear question and explain the evidence.';
    }
    await workspace.save();
    assert.equal(saved.payload.destinationId, 'living-things-observatory');
    assert.equal(saved.payload.structuredContent.scienceState.toolId, tool.id);
    assert.ok(saved.payload.structuredContent.generatorSeed);
    assert.ok(Array.isArray(saved.payload.structuredContent.organismIds));
    workspace.destroy();
  }
  dom.window.close();
});

test('science challenge saving rejects incomplete work and preserves validated challenge logic', async () => {
  const dom = installDom();
  const host = document.querySelector('#app');
  const saved = [];
  const messages = [];
  const workspace = new LivingThingsObservatory(host, {
    toolId: 'create-science-challenge',
    onSave: async (payload) => saved.push(payload),
    onToast: (message) => messages.push(message),
  });

  workspace.state.compareOrganismIds = workspace.state.organismIds.slice(0, 2);
  workspace.state.explanation = '';
  await workspace.save();
  assert.equal(saved.length, 0);
  assert.match(messages[0], /Choose at least 4 organisms/);

  workspace.state.challengeType = 'key';
  workspace.state.compareOrganismIds = workspace.state.organismIds.slice(0, 4);
  workspace.state.explanation = 'Follow each binary question and explain which observable feature separates the organisms.';
  await workspace.save();
  assert.equal(saved.length, 1);
  const challenge = saved[0].structuredContent.challengeData;
  assert.equal(challenge.valid, true);
  assert.equal(challenge.selectedOrganismIds.length, 4);
  assert.equal(challenge.branchLogic.type, 'question');
  assert.equal(saved[0].structuredContent.assetReferences.length >= 4, true);

  workspace.destroy();
  dom.window.close();
});

test('a repaired classification key retains its deliberate fault and checked replacement', async () => {
  const dom = installDom();
  const saved = [];
  const workspace = new LivingThingsObservatory(document.querySelector('#app'), {
    toolId: 'repair-broken-key',
    onSave: async (payload) => saved.push(payload),
  });
  workspace.state.repairQuestionId = workspace.state.task.repairQuestionIds[0];
  await workspace.save();
  const repair = saved[0].structuredContent.beforeAfterRepair;
  assert.equal(repair.fixtureId, workspace.state.task.fixtureId);
  assert.ok(repair.before.wording);
  assert.ok(repair.before.fault);
  assert.equal(repair.after.questionId, workspace.state.repairQuestionId);
  assert.equal(repair.after.validForSelectedSet, true);
  assert.ok(repair.after.yesOrganismIds.length);
  assert.ok(repair.after.noOrganismIds.length);
  workspace.destroy();
  dom.window.close();
});

test('scientific observation, sorting and key construction expose accessible alternatives and reversible actions', () => {
  const dom = installDom();
  const host = document.querySelector('#app');

  let workspace = new LivingThingsObservatory(host, { toolId: 'observation-lens' });
  document.querySelector('[data-science-action="toggle-silhouette"]').click();
  assert.ok(document.querySelector('.specimen-table.is-silhouette'));
  document.querySelector('[data-science-action="undo-science"]').click();
  assert.equal(document.querySelector('.specimen-table.is-silhouette'), null);
  document.querySelector('[data-science-action="redo-science"]').click();
  assert.ok(document.querySelector('.specimen-table.is-silhouette'));
  workspace.destroy();

  host.innerHTML = '';
  workspace = new LivingThingsObservatory(host, { toolId: 'free-sorting' });
  const originalGroupCount = workspace.state.groups.length;
  document.querySelector('[data-science-action="add-sorting-group"]').click();
  assert.equal(workspace.state.groups.length, originalGroupCount + 1);
  assert.ok(document.querySelector('[data-science-action="remove-sorting-group"]'));
  document.querySelector('[data-science-action="undo-science"]').click();
  assert.equal(workspace.state.groups.length, originalGroupCount);
  workspace.destroy();

  host.innerHTML = '';
  workspace = new LivingThingsObservatory(host, { toolId: 'build-classification-key' });
  const question = document.querySelector('[data-science-field="customQuestionText"]');
  question.value = 'Is it scary?';
  question.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  document.querySelector('[data-science-action="validate-custom-question"]').click();
  assert.match(document.body.textContent, /opinion|another observer/i);
  document.querySelector('[data-science-action="show-blank-key"]').click();
  assert.ok(document.querySelector('.blank-key-sheet'));
  assert.equal(document.querySelectorAll('.blank-key-outcome').length, 4);
  assert.ok(document.querySelector('.blank-key-sheet [data-action="print-page"]'));
  workspace.destroy();
  dom.window.close();
});

test('a guided science key saves and reopens without losing evidence or the original version', async () => {
  const dom = installDom();
  await resetDatabaseConnection({ databaseName: 'our-planet-build3-science-flow', clearMemory: true });
  const { default: App } = await import('../src/app/App.js');
  const app = new App(document.querySelector('#app'));
  await app.init();
  const form = document.querySelector('#create-profile-form');
  form.elements.name.value = 'Kai';
  await app.submitProfile(form);

  await app.handleKey('5427', { setMessage() {}, reset() {} });
  await settle(500);
  assert.equal(app.route.name, 'activity');
  assert.equal(app.route.params.activityId, 'look-like-scientist');
  assert.ok(app.livingThings);
  assert.equal(document.querySelectorAll('.science-guided-guide article').length, 4);
  assert.match(document.querySelector('.science-guided-guide details').textContent, /unscored/i);

  const observation = document.querySelector('[data-science-field="observationText"]');
  const inference = document.querySelector('[data-science-field="inferenceText"]');
  observation.value = 'It has six visible legs and two antennae.';
  observation.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  inference.value = 'It may move between flowers because wings are visible.';
  inference.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  await app.livingThings.save();
  await settle();

  const saved = app.artifacts.find(({ activityId }) => activityId === 'look-like-scientist');
  assert.ok(saved);
  assert.equal(saved.destinationId, 'living-things-observatory');
  assert.equal(saved.artefactType, 'organism-observation');
  assert.equal(saved.content.scienceState.observationText, 'It has six visible legs and two antennae.');
  assert.equal(saved.content.scienceState.inferenceText, 'It may move between flowers because wings are visible.');
  assert.ok(saved.content.generatorSeed);

  await app.reopenArtifact(saved.id);
  await settle();
  assert.equal(app.livingThings.state.observationText, 'It has six visible legs and two antennae.');
  app.livingThings.state.observationText = 'It has six legs, antennae and a segmented body.';
  await app.livingThings.save();
  await settle();
  const revised = app.artifacts.find(({ id }) => id === saved.id);
  assert.ok((revised.versionHistory?.length || revised.versions?.length || 0) >= 2);
  dom.window.close();
});

test('saved scientific records print organism references, branch lines and careful evidence labels', () => {
  const tree = {
    id: 'question-root', type: 'question', questionId: 'has-backbone', label: 'Does it have a backbone?',
    yes: { id: 'result-fox', type: 'result', organismId: 'red-fox', organismIds: ['red-fox'], complete: true },
    no: { id: 'result-bee', type: 'result', organismId: 'western-honey-bee', organismIds: ['western-honey-bee'], complete: true },
  };
  const html = renderWorkDetailView({
    id: 'science-key',
    artefactType: 'branching-classification-key',
    title: 'My branching key',
    createdAt: '2026-08-03T12:00:00.000Z',
    updatedAt: '2026-08-03T12:00:00.000Z',
    content: {
      scienceState: { toolId: 'build-classification-key' },
      organismIds: ['red-fox', 'western-honey-bee'],
      branchLogic: tree,
      changeScenario: { evidence: 'Water is lower.', prediction: 'A frog may have fewer moist places.', uncertain: 'Nearby ponds are unknown.' },
      generatorSeed: 'science-print-1',
    },
  });
  const dom = new JSDOM(html);
  assert.equal(dom.window.document.querySelectorAll('[data-organism-illustration]').length, 2);
  assert.ok(dom.window.document.querySelector('.saved-science-tree'));
  assert.match(dom.window.document.body.textContent, /Does it have a backbone/);
  assert.match(dom.window.document.body.textContent, /We observed/);
  assert.match(dom.window.document.body.textContent, /We predict/);
  dom.window.close();
});
