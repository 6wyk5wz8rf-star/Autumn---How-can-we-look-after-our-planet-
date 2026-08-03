import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('the install manifest stays GitHub Pages subpath-safe and supports either iPad orientation', async () => {
  const manifest = JSON.parse(await read('../public/manifest.webmanifest'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.orientation, 'any');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(({ sizes }) => sizes === '192x192'));
  assert.ok(manifest.icons.some(({ sizes }) => sizes === '512x512'));
  assert.ok(manifest.shortcuts.every(({ url }) => url.startsWith('./#/')));
  assert.ok(manifest.shortcuts.some(({ url }) => url === './#/living-things'));
});

test('the service worker keeps a good shell and receives an automatic build identifier', async () => {
  const worker = await read('../public/service-worker.js');
  const injector = await read('../scripts/inject-sw-assets.mjs');
  assert.match(worker, /response\.ok && contentType\.includes\('text\/html'\)/);
  assert.match(worker, /caches\.match\('\.\/index\.html'\)/);
  assert.match(worker, /SKIP_WAITING/);
  assert.match(worker, /key\.startsWith\(CACHE_PREFIX\) && key !== CACHE_VERSION/);
  assert.match(injector, /createHash\('sha256'\)/);
  assert.match(injector, /INJECT_CACHE_VERSION/);
  assert.match(injector, /INJECT_BUILD_ASSETS/);
});

test('print styles establish A4 pages and deliberate Atlas output sizing', async () => {
  const printCss = await read('../src/styles/print.css');
  assert.match(printCss, /@page\s*\{[\s\S]*size:\s*A4/);
  assert.match(printCss, /\.key-guide-page[\s\S]*break-after:\s*page/);
  assert.match(printCss, /\.atlas-map(?:\s+svg|__stage)[\s\S]*(?:mm|max-height)/);
  assert.match(printCss, /\.no-print[\s\S]*display:\s*none/);
});

test('Living Things print rules preserve organism diagrams, branches and monochrome A4 work', async () => {
  const scienceCss = await read('../src/destinations/living-things/living-things.css');
  assert.match(scienceCss, /@media print/);
  assert.match(scienceCss, /\.science-tree ol:before/);
  assert.match(scienceCss, /border-color:#000/);
  assert.match(scienceCss, /\.organism-illustration svg\{max-height:70mm\}/);
  assert.match(scienceCss, /\.survey-table/);
});
