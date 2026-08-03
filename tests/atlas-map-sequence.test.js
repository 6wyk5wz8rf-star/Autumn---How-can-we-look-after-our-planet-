import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

let server;
let AtlasMap;
let renderWorkDetailView;

function installDom({ reducedMotion = false } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="atlas"></div></body></html>', {
    url: 'https://our-planet.test/',
    pretendToBeVisual: true,
  });
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    Element: dom.window.Element,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    CustomEvent: dom.window.CustomEvent,
    XMLSerializer: dom.window.XMLSerializer,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
  };
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  globalThis.matchMedia = () => ({
    matches: reducedMotion,
    addEventListener() {},
    removeEventListener() {},
  });
  return dom;
}

before(async () => {
  server = await createServer({
    root: process.cwd(),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    logLevel: 'silent',
  });
  ({ default: AtlasMap } = await server.ssrLoadModule('/src/destinations/planet-atlas/AtlasMap.js'));
  ({ renderWorkDetailView } = await server.ssrLoadModule('/src/app/views.js'));
});

after(async () => {
  await server?.close();
});

test('the complete Gambia focus trail uses one stable sequence token', async () => {
  const dom = installDom();
  const visited = [];
  const map = new AtlasMap(document.querySelector('#atlas'), {
    onChange(state, reason) {
      if (reason === 'focus-place') visited.push(state.focus);
    },
  });

  const completed = await map.focusSequence('gambia', { stepDuration: 0, pause: 0 });

  assert.equal(completed, true);
  assert.equal(map.getState().focus, 'gambia');
  assert.deepEqual(visited, ['world', 'africa', 'westAfrica', 'gambia']);
  map.destroy();
  dom.window.close();
});

test('reduced motion completes every focus step immediately rather than cancelling itself', async () => {
  const dom = installDom({ reducedMotion: true });
  const visited = [];
  const map = new AtlasMap(document.querySelector('#atlas'), {
    reducedMotion: true,
    onChange(state, reason) {
      if (reason === 'focus-place') visited.push(state.focus);
    },
  });

  const completed = await map.focusSequence('gambia', { stepDuration: 800, pause: 500 });

  assert.equal(completed, true);
  assert.equal(map.getState().focus, 'gambia');
  assert.deepEqual(visited, ['world', 'africa', 'westAfrica', 'gambia']);
  map.destroy();
  dom.window.close();
});

test('an explicit focus change cancels and settles an in-flight sequence', async () => {
  const dom = installDom();
  const map = new AtlasMap(document.querySelector('#atlas'), { reducedMotion: false });
  const sequence = map.focusSequence('gambia', { stepDuration: 1000, pause: 0 });
  await Promise.resolve();

  await map.focusPlace('uk', { animate: false });
  const completed = await Promise.race([
    sequence,
    new Promise((resolve) => setTimeout(() => resolve('timeout'), 150)),
  ]);

  assert.equal(completed, false);
  assert.equal(map.getState().focus, 'uk');
  map.destroy();
  dom.window.close();
});

test('snapshot delivery reports whether a My Work consumer actually accepted it', async () => {
  const dom = installDom();
  const map = new AtlasMap(document.querySelector('#atlas'));

  const unhandled = map.saveSnapshot({ includeSvg: false });
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(unhandled.delivery.handled, false);
  assert.equal(unhandled.delivery.status, 'unhandled');
  assert.equal(Object.keys(unhandled).includes('delivery'), false);
  assert.match(map.liveRegion.textContent, /has not been saved to My Work/);

  let received = null;
  map.update({
    onSnapshot(snapshot) {
      received = snapshot;
      return true;
    },
  });
  const handled = map.saveSnapshot({ includeSvg: false });
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(received, handled);
  assert.equal(handled.delivery.handled, true);
  assert.equal(handled.delivery.status, 'accepted');
  assert.deepEqual(handled.delivery.via, ['callback']);
  assert.match(map.liveRegion.textContent, /handed to My Work to save/);
  map.destroy();
  dom.window.close();
});

test('real Atlas snapshots produce a compact printable map preview', () => {
  const dom = installDom({ reducedMotion: true });
  const map = new AtlasMap(document.querySelector('#atlas'), { reducedMotion: true });
  map.focusPlace('gambia', { animate: false });
  const snapshot = map.createSnapshot();

  assert.ok(snapshot.preview.markup.length < 750_000, `preview was ${snapshot.preview.markup.length} characters`);
  assert.match(snapshot.preview.markup, /^<svg/);
  const html = renderWorkDetailView({
    id: 'preview-test',
    title: 'The Gambia exploration',
    artefactType: 'exploration-snapshot',
    content: { viewState: snapshot.state },
    preview: { label: snapshot.title, markup: snapshot.preview.markup },
    createdAt: new Date().toISOString(),
  });
  assert.match(html, /class="saved-map-preview"/);
  assert.match(html, /data:image\/svg\+xml/);
  map.destroy();
  dom.window.close();
});

test('Journey Thread exposes broad continent and ocean evidence', () => {
  const dom = installDom({ reducedMotion: true });
  const map = new AtlasMap(document.querySelector('#atlas'), { reducedMotion: true });
  const summary = map.setJourney(
    { coordinates: [-0.1, 51.5], label: 'United Kingdom' },
    { coordinates: [-15.31, 13.45], label: 'The Gambia' },
  );
  assert.deepEqual(summary.continents, ['Europe', 'Africa']);
  assert.ok(summary.oceans.includes('Atlantic Ocean'));
  map.destroy();
  dom.window.close();
});

test('map scale guide is derived from the current projection and changes with zoom', () => {
  const dom = installDom({ reducedMotion: true });
  const map = new AtlasMap(document.querySelector('#atlas'), { reducedMotion: true });
  const scaleOutput = document.querySelector('[data-map-scale]');
  const initialLabel = scaleOutput.querySelector('[data-map-scale-label]').textContent;

  assert.match(initialLabel, /≈ [\d,]+ km near centre/);
  assert.match(scaleOutput.style.width, /%$/);
  assert.match(scaleOutput.getAttribute('aria-label'), /Approximate distance near the centre/);

  map.zoomBy(4, { announce: false });
  const zoomedLabel = scaleOutput.querySelector('[data-map-scale-label]').textContent;
  assert.notEqual(zoomedLabel, initialLabel);

  map.setState({ view: 'flat', zoom: 2 });
  assert.match(scaleOutput.title, /scale changes across a world map/);
  map.destroy();
  dom.window.close();
});

test('climate layer uses patterned bands and lets a child inspect a careful biome connection', () => {
  const dom = installDom({ reducedMotion: true });
  const map = new AtlasMap(document.querySelector('#atlas'), { reducedMotion: true });

  map.setLayer('climate', true);
  assert.equal(document.querySelectorAll('[data-climate-band]').length, 5);
  assert.equal(document.querySelectorAll('pattern[id*="climate-"]').length, 3);

  map.setBiome('savanna');
  assert.equal(map.getState().selectedBiome, 'savanna');
  assert.equal(document.querySelector('[data-biome="savanna"]').getAttribute('aria-pressed'), 'true');
  assert.equal(document.querySelectorAll('[data-climate-band="tropical"].is-related').length, 1);
  assert.match(document.querySelector('[data-biome-description]').textContent, /may develop/);
  assert.match(document.querySelector('[data-biome-caution]').textContent, /does not decide.*on its own/i);

  map.destroy();
  dom.window.close();
});

test('UK and The Gambia comparison includes physical features and relative map scale evidence', () => {
  const dom = installDom({ reducedMotion: true });
  const map = new AtlasMap(document.querySelector('#atlas'), { reducedMotion: true });

  map.comparePlaces('uk', 'gambia', { animate: false });
  const comparison = document.querySelector('[data-comparison-content]').textContent;
  assert.match(comparison, /Selected physical feature/);
  assert.match(comparison, /River Gambia crosses the country/);
  assert.match(comparison, /Approx\. surface area/);
  assert.match(comparison, /roughly 22 times the surface area/);
  assert.match(comparison, /area alone does not describe either place/);

  map.destroy();
  dom.window.close();
});
