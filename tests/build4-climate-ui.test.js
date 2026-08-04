import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

let server;
let ClimateLaboratory;
let climateTools;

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="climate"></div></body></html>', {
    url: 'https://our-planet.test/#/climate',
    pretendToBeVisual: true,
  });
  const globals = {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    navigator: dom.window.navigator,
    Element: dom.window.Element,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    CustomEvent: dom.window.CustomEvent,
    XMLSerializer: dom.window.XMLSerializer,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
  };
  for (const [name, value] of Object.entries(globals)) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  return dom;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

before(async () => {
  server = await createServer({ root: process.cwd(), server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' });
  ({ default: ClimateLaboratory } = await server.ssrLoadModule('/src/destinations/climate-laboratory/ClimateLaboratory.js'));
  ({ CLIMATE_TOOLS: climateTools } = await server.ssrLoadModule('/src/data/climate.js'));
});

after(async () => server?.close());

test('Climate Laboratory opens on one living scene with two accessible variables and four modes', () => {
  const dom = installDom();
  let spoken = '';
  const laboratory = new ClimateLaboratory(document.querySelector('#climate'), { onSpeak: (value) => { spoken = value; } });
  assert.equal(document.querySelectorAll('.climate-modes > button').length, 4);
  assert.equal(document.querySelectorAll('.climate-core-controls input[type="range"]').length, 2);
  assert.equal(document.querySelectorAll('.climate-core-controls [data-climate-action="step"]').length, 4);
  assert.match(document.body.textContent, /Explore a simplified climate pattern/);
  assert.match(document.body.textContent, /°C/);
  assert.match(document.body.textContent, /mm yearly rainfall/);
  assert.ok(document.querySelector('.climate-more-tools'));
  assert.ok(document.querySelector('.show-me'));
  assert.equal(document.querySelectorAll('[data-climate-action="save"]').length, 1);
  document.querySelector('[data-climate-action="speak"]').click();
  assert.match(spoken, /degrees Celsius/);
  assert.match(spoken, /millimetres yearly rainfall/);
  laboratory.destroy();
  dom.window.close();
});

test('Pattern Viewer changes scale honestly while labels, seasons and provenance remain explicit', async () => {
  const dom = installDom();
  let saved = null;
  const laboratory = new ClimateLaboratory(document.querySelector('#climate'), {
    toolId: 'pattern-viewer',
    onSave: async (payload) => { saved = payload; },
  });
  assert.equal(laboratory.state.generatedTask.locationId, laboratory.state.leftLocationId);
  assert.equal(document.querySelectorAll('.month-labels text').length, 12);
  assert.ok(document.querySelector('.season-context'));
  assert.match(document.querySelector('.climate-graph .sr-only').textContent, /Jan: .* degrees Celsius and .* millimetres/);
  document.querySelector('[data-field="labelsVisible"]').click();
  assert.equal(document.querySelector('.month-labels'), null);
  assert.ok(document.querySelector('.climate-graph .sr-only'));
  document.querySelector('[data-field="seasonsVisible"]').click();
  assert.equal(document.querySelector('.season-context'), null);
  document.querySelector('[data-climate-action="time-scale"][data-value="day"]').click();
  assert.match(document.querySelector('.short-pattern-view').textContent, /fictional learning event/i);
  assert.equal(document.querySelector('.climate-graph'), null);
  document.querySelector('[data-climate-action="save"]').click();
  await settle();
  assert.equal(saved.structuredContent.dataStatus, 'fictional');
  assert.ok(saved.structuredContent.dataComponents.some(({ id, status }) => id === 'generated-short-weather-pattern' && status === 'fictional'));
  document.querySelector('[data-climate-action="time-scale"][data-value="week"]').click();
  assert.equal(document.querySelectorAll('.weather-week article').length, 7);
  assert.match(document.querySelector('.short-pattern-view').textContent, /fictional learning pattern/i);
  document.querySelector('[data-climate-action="time-scale"][data-value="multi-year"]').click();
  assert.ok(document.querySelector('.multi-year-pattern'));
  assert.match(document.querySelector('.multi-year-pattern').textContent, /simplified learning pattern/i);
  assert.match(document.querySelector('.multi-year-pattern').textContent, /not a real forecast/i);
  document.querySelector('[data-climate-action="save"]').click();
  await settle();
  assert.equal(saved.structuredContent.dataStatus, 'simplified-model');
  assert.ok(saved.structuredContent.dataComponents.some(({ id, status }) => id === 'multi-year-learning-pattern' && status === 'simplified-model'));
  document.querySelector('[data-climate-action="time-scale"][data-value="year"]').click();
  assert.ok(document.querySelector('.climate-graph'));
  laboratory.destroy();
  dom.window.close();
});

test('all sixteen climate tools render deeply and save provenance-rich shared artefacts', async () => {
  const dom = installDom();
  for (const tool of climateTools) {
    document.body.innerHTML = '<div id="climate"></div>';
    let saved = null;
    const laboratory = new ClimateLaboratory(document.querySelector('#climate'), {
      toolId: tool.id,
      onSave: async (payload, state) => { saved = { payload, state }; },
    });
    assert.match(document.body.textContent, new RegExp(tool.title.replace(/[?+]/g, '\\$&')));
    assert.equal(document.querySelectorAll('.climate-modes > button').length, 4);
    assert.ok(document.querySelector('[data-climate-action="open-board"]'));
    document.querySelector('[data-climate-action="save"]').click();
    await settle();
    assert.equal(saved.payload.destinationId, 'climate-laboratory');
    assert.equal(saved.payload.structuredContent.climateState.toolId, tool.id);
    assert.ok(saved.payload.structuredContent.generatorSeed);
    assert.ok(saved.payload.structuredContent.units.temperature);
    assert.ok(['sourced-rounded', 'simplified-model', 'fictional'].includes(saved.payload.structuredContent.dataStatus));
    assert.ok(saved.payload.structuredContent.dataComponents.every(({ status }) => ['sourced-rounded', 'simplified-model', 'fictional'].includes(status)));
    assert.ok(saved.payload.structuredContent.sourceRecords.every(({ url, retrievedAt }) => /^https:\/\//.test(url) && /^\d{4}-\d{2}-\d{2}$/.test(retrievedAt)));
    if (tool.kind === 'weather-climate') {
      assert.equal(saved.payload.structuredContent.dataStatus, 'fictional');
      assert.deepEqual(saved.payload.structuredContent.dataComponents.map(({ status }) => status), ['sourced-rounded', 'fictional']);
    }
    if (tool.modeId === 'experiment') assert.equal(saved.payload.structuredContent.dataStatus, 'simplified-model');
    if (tool.modeId === 'change' && tool.kind !== 'warming') {
      assert.equal(saved.payload.structuredContent.dataStatus, 'simplified-model');
      assert.deepEqual(saved.payload.structuredContent.sourceIds, ['ipcc-ar6-impacts-adaptation']);
    }
    laboratory.destroy();
  }
  dom.window.close();
});

test('Climate Map reuses the Planet Atlas engine and returns to linked real-place views', () => {
  const dom = installDom();
  const map = new ClimateLaboratory(document.querySelector('#climate'), { toolId: 'climate-zone-map' });
  assert.ok(document.querySelector('.climate-shared-atlas .atlas-map__stage'));
  assert.ok(document.querySelector('[data-climate-atlas-map] [data-climate-band]'));
  assert.match(document.body.textContent, /shared Planet Atlas map/i);
  assert.match(document.body.textContent, /examples, not zone borders/i);
  assert.equal(document.querySelectorAll('.zone-legend button').length, 5);
  assert.equal(document.querySelectorAll('.atlas-map__point--marker').length, 2);
  assert.match(document.body.textContent, /Heathrow, United Kingdom/);
  assert.match(document.body.textContent, /Cape Town, South Africa/);
  document.querySelector('[data-climate-action="zone"][data-value="dry"]').click();
  assert.equal(document.querySelectorAll('.atlas-map__point--marker').length, 1);
  assert.match(document.body.textContent, /Cairo, Egypt/);
  map.destroy();

  document.body.innerHTML = '<div id="climate"></div>';
  const comparison = new ClimateLaboratory(document.querySelector('#climate'), { toolId: 'compare-locations' });
  assert.equal(document.querySelectorAll('[data-route="atlas"][data-atlas-focus]').length, 2);
  comparison.destroy();
  dom.window.close();
});

test('Climate Board View is anonymous, reversible and protected from save actions', () => {
  const dom = installDom();
  const laboratory = new ClimateLaboratory(document.querySelector('#climate'), { toolId: 'change-over-time' });
  const before = laboratory.snapshot();
  document.querySelector('[data-climate-action="open-board"]').click();
  const board = document.querySelector('.climate-board-view');
  assert.ok(board);
  assert.match(board.textContent, /no learner information/i);
  assert.equal(board.querySelector('[data-climate-action="save"]'), null);
  assert.equal(board.querySelectorAll('[data-climate-action="close-board"]').length, 1);
  document.querySelector('[data-climate-action="close-board"]').click();
  assert.deepEqual(laboratory.snapshot(), before);
  laboratory.destroy();
  dom.window.close();
});
