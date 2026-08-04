import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { resetDatabaseConnection } from '../src/services/db.js';
import { getActivityById } from '../src/data/activities.js';
import { defaultActivityState } from '../src/destinations/planet-atlas/activityExperience.js';

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'https://our-planet.test/#/home',
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

test('child shell creates a profile, accepts the Gambia key and appends Planet Question thinking', async () => {
  const dom = installDom();
  await resetDatabaseConnection({ databaseName: 'our-planet-app-shell-test', clearMemory: true });
  const { default: App } = await import('../src/app/App.js');
  const app = new App(document.querySelector('#app'));
  await app.init();

  assert.match(document.body.textContent, /Make a learner space/);
  const profileForm = document.querySelector('#create-profile-form');
  profileForm.elements.name.value = 'Mina';
  await app.submitProfile(profileForm);
  assert.match(document.body.textContent, /Welcome back, Mina/);
  assert.equal(app.profile.displayName, 'Mina');

  app.route = { name: 'key', params: {} };
  await app.render();
  app.AtlasMapClass = class AtlasMapStub {
    constructor() { this.state = {}; }
    focusPlace() { return this; }
    getState() { return this.state; }
    destroy() {}
  };
  let keyMessage = '';
  await app.handleKey('7318', {
    setMessage(message) { keyMessage = message; },
    reset() {},
  });
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.match(keyMessage, /Find The Gambia is ready/);
  assert.ok(app.access.some((record) => record.activityId === 'find-the-gambia'));

  app.route = { name: 'keys', params: {} };
  await app.render();
  assert.match(document.body.textContent, /Find The Gambia/);
  assert.doesNotMatch(document.body.textContent, /Overdue|percentage complete|score/i);

  const activity = getActivityById('find-the-gambia');
  const snapshot = {
    title: 'The Gambia exploration',
    state: { view: 'flat', focus: 'gambia', labels: true, oceans: true, equator: true, climate: false, markers: [] },
    journey: null,
    comparison: null,
    question: '',
    attribution: {},
    preview: { markup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0L10 10"/></svg>' },
  };
  const mapStub = {
    createSnapshot: () => snapshot,
    getState: () => snapshot.state,
    getJourneySummary: () => null,
    setQuestion() {},
    destroy() {},
  };
  app.map = mapStub;
  await app.saveAtlasSnapshot('', snapshot, { activityId: activity.id, keyActivityId: activity.id });
  const exploration = app.artifacts.find((item) => item.artefactType === 'exploration-snapshot');
  assert.ok(exploration);
  assert.equal(exploration.activityId, 'open-atlas-exploration');
  assert.equal(exploration.content.sourceActivityId, activity.id);

  app.route = { name: 'activity', params: { activityId: activity.id } };
  app.activityState = {
    ...defaultActivityState(activity),
    step: 4,
    observation: 'The country follows the river and is closely bordered by Senegal.',
  };
  app.map = mapStub;
  await app.saveKeyActivity();
  const guided = app.artifacts.find((item) => item.artefactType === 'place-pin');
  assert.ok(guided);
  assert.notEqual(guided.id, exploration.id);
  assert.equal(guided.keyActivityId, activity.id);
  assert.equal(app.artifacts.find((item) => item.id === exploration.id).artefactType, 'exploration-snapshot');

  const representationState = { view: 'flat', focus: 'gambia' };
  app.activityState = defaultActivityState(getActivityById('earth-in-different-forms'));
  app.map = {
    setView(view) { representationState.view = view; return this; },
    async focusPlace(place) { representationState.focus = place; return true; },
    createSnapshot() {
      return {
        state: { ...representationState },
        preview: { markup: `<svg data-view="${representationState.view}" data-focus="${representationState.focus}"></svg>` },
      };
    },
    destroy() {},
  };
  await app.respondToActivityChoice('close');
  await app.respondToActivityChoice('globe');
  await app.respondToActivityChoice('flat');
  assert.deepEqual(app.activityState.viewPreviews.close.state, { view: 'flat', focus: 'gambia' });
  assert.deepEqual(app.activityState.viewPreviews.globe.state, { view: 'globe', focus: 'world' });
  assert.deepEqual(app.activityState.viewPreviews.flat.state, { view: 'flat', focus: 'world' });

  app.route = { name: 'work', params: {} };
  await app.render();
  await app.handleAction('open-planet-question', document.createElement('button'));
  const responseForm = document.querySelector('#planet-question-form');
  responseForm.elements.text.value = 'We need to understand each place before choosing an action.';
  await app.submitPlanetQuestion(responseForm);
  assert.equal(app.responses.length, 1);
  app.workFilter = 'planet-thinking';
  await app.render();
  assert.match(document.body.textContent, /understand each place/);

  dom.window.close();
});
