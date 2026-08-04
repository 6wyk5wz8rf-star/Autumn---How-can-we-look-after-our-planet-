import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

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

const settle = (milliseconds = 60) => new Promise((resolve) => setTimeout(resolve, milliseconds));

test('Climate cross-links reuse mathematics, return exactly, and guided work versions safely', async (context) => {
  const dom = installDom();
  const server = await createServer({ root: process.cwd(), server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' });
  context.after(async () => server.close());
  const { resetDatabaseConnection } = await server.ssrLoadModule('/src/services/db.js');
  const { navigate } = await server.ssrLoadModule('/src/utils/router.js');
  await resetDatabaseConnection({ databaseName: 'our-planet-build4-app-flow', clearMemory: true });
  const { default: App } = await server.ssrLoadModule('/src/app/App.js');
  const app = new App(document.querySelector('#app'));
  await app.init();
  const form = document.querySelector('#create-profile-form');
  form.elements.name.value = 'Mina';
  await app.submitProfile(form);

  navigate('climate-tool', 'temperature-rainfall-lab');
  await settle(500);
  assert.equal(app.route.name, 'climate-tool');
  app.climateLaboratory.update((state) => { state.temperatureC = -6; state.rainfallMm = 1_240; }, 'prepared-cross-destination-values');
  const numberLineLink = document.querySelector('[data-route="number-tool"][data-route-value="negative-number-line"]');
  assert.equal(numberLineLink.dataset.returnToContext, 'true');
  numberLineLink.click();
  await settle(500);
  assert.equal(app.route.name, 'number-tool');
  assert.equal(app.numberExpedition.state.start, -6);
  assert.equal(app.numberExpedition.state.end, 0);
  assert.ok(document.querySelector('[data-action="return-from-context"]'));
  document.querySelector('[data-action="return-from-context"]').click();
  await settle(500);
  assert.equal(app.route.name, 'climate-tool');
  assert.equal(app.route.params.toolId, 'temperature-rainfall-lab');
  assert.equal(app.climateLaboratory.state.temperatureC, -6);
  assert.equal(app.climateLaboratory.state.rainfallMm, 1_240);

  await app.handleKey('4591', { setMessage() {}, reset() {} });
  await settle(600);
  assert.equal(app.route.name, 'activity');
  assert.equal(app.route.params.activityId, 'change-temperature');
  assert.ok(app.climateLaboratory);
  document.querySelector('[data-climate-action="step"][data-field="temperatureC"][data-delta="1"]').click();
  document.querySelector('[data-climate-field="observed"]').value = 'The displayed temperature rose by one degree Celsius.';
  document.querySelector('[data-climate-field="observed"]').dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  document.querySelector('[data-climate-action="save"]').click();
  await settle(200);

  const saved = app.artifacts.find(({ activityId }) => activityId === 'change-temperature');
  assert.ok(saved);
  assert.equal(saved.destinationId, 'climate-laboratory');
  assert.equal(saved.content.dataStatus, 'simplified-model');
  assert.equal(saved.content.evidence.observed, 'The displayed temperature rose by one degree Celsius.');
  assert.ok(saved.content.dataComponents.some(({ status }) => status === 'simplified-model'));

  await app.reopenArtifact(saved.id);
  await settle(500);
  assert.equal(app.climateLaboratory.state.observed, 'The displayed temperature rose by one degree Celsius.');
  app.climateLaboratory.update((state) => { state.predicted = 'Vegetation may respond, but the model leaves other factors uncertain.'; }, 'revised-climate-prediction');
  document.querySelector('[data-climate-action="save"]').click();
  await settle(200);
  const revised = app.artifacts.find(({ id }) => id === saved.id);
  assert.ok((revised.versionHistory?.length || revised.versions?.length || 0) >= 2);
  assert.equal(revised.content.evidence.predicted, 'Vegetation may respond, but the model leaves other factors uncertain.');

  navigate('climate');
  await settle(500);
  document.querySelector('.primary-nav [data-route="key"]').click();
  await settle(200);
  await app.handleKey('1457', { setMessage() {}, reset() {} });
  await settle(600);
  assert.equal(app.route.name, 'climate');
  assert.equal(app.access.filter(({ destinationId }) => destinationId === 'climate-laboratory').length, 14);

  document.querySelector('.primary-nav [data-route="key"]').click();
  await settle(200);
  await app.handleKey('2469', { setMessage() {}, reset() {} });
  await settle(600);
  assert.equal(app.route.name, 'collection');
  assert.match(document.body.textContent, /Weather and Climate/);
  assert.equal(document.querySelectorAll('.collection-pathways [data-route="activity"]').length, 3);
  dom.window.close();
});
