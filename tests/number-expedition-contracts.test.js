import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

import {
  NUMBER_COLLECTIONS,
  NUMBER_EXPEDITION_ACTIVITIES,
  NUMBER_REGIONS,
  NUMBER_TOOLS,
} from '../src/data/numberExpedition.js';
import { DESTINATIONS } from '../src/data/destinations.js';
import { KEY_MANIFEST } from '../src/data/keys.js';
import NumberExpedition from '../src/destinations/number-expedition/NumberExpedition.js';
import { parseRoute } from '../src/utils/router.js';
import {
  renderPrintableTodayKeyCard,
  renderPrintableTodayKeyCards,
} from '../src/teacher/teacherKeyPresentation.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><main id="host"></main></body></html>', {
    url: 'https://our-planet.test/#/numbers',
    pretendToBeVisual: true,
  });
  for (const name of ['window', 'document', 'Element', 'HTMLElement', 'Node']) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: dom.window[name],
    });
  }
  return dom;
}

function mountTool(toolId, savedState = null) {
  const dom = installDom();
  const host = document.querySelector('#host');
  const expedition = new NumberExpedition(host, { toolId, savedState });
  return {
    dom,
    host,
    expedition,
    close() {
      expedition.destroy();
      dom.window.close();
    },
  };
}

test('Build 2 static routes expose one active Number Expedition destination and every permanent pathway', async () => {
  const destination = DESTINATIONS.find(({ id }) => id === 'number-expedition');
  assert.deepEqual(
    {
      active: destination?.active,
      route: destination?.route,
      activationBuild: destination?.activationBuild,
      curriculumDomains: destination?.curriculumDomains,
    },
    {
      active: true,
      route: '#/numbers',
      activationBuild: 2,
      curriculumDomains: ['mathematics'],
    },
  );
  assert.deepEqual(parseRoute('#/numbers'), { name: 'numbers', params: {} });
  assert.deepEqual(parseRoute('#/number-tool/build-number'), {
    name: 'number-tool',
    params: { toolId: 'build-number' },
  });
  assert.deepEqual(parseRoute('#/collection/key-number-collection-four-digit-foundations'), {
    name: 'collection',
    params: { keyId: 'key-number-collection-four-digit-foundations' },
  });

  assert.equal(NUMBER_REGIONS.length, 7);
  assert.equal(NUMBER_TOOLS.length, 17);
  assert.equal(NUMBER_EXPEDITION_ACTIVITIES.length, 28);
  assert.equal(NUMBER_COLLECTIONS.length, 7);
  assert.equal(new Set(NUMBER_EXPEDITION_ACTIVITIES.map(({ id }) => id)).size, 28);
  for (const activity of NUMBER_EXPEDITION_ACTIVITIES) {
    assert.deepEqual(parseRoute(activity.route), {
      name: 'activity',
      params: { activityId: activity.id },
    });
    assert.equal(activity.printMetadata?.format, 'A4');
    assert.equal(activity.printMetadata?.blackAndWhite, true);
    assert.equal(activity.printMetadata?.preserveAlignment, true);
  }

  const numberActivityKeys = KEY_MANIFEST.filter((key) => (
    key.type === 'activity' && key.destinationId === 'number-expedition'
  ));
  const numberCollectionKeys = KEY_MANIFEST.filter((key) => (
    key.type === 'collection' && key.destinationId === 'number-expedition'
  ));
  assert.equal(numberActivityKeys.length, 28);
  assert.equal(numberCollectionKeys.length, 7);
  assert.ok(KEY_MANIFEST.some((key) => (
    key.type === 'destination'
    && key.destinationId === 'number-expedition'
    && key.route === '#/numbers'
  )));

  const main = await read('../src/main.js');
  const manifest = JSON.parse(await read('../public/manifest.webmanifest'));
  assert.match(main, /number-expedition\/number-expedition\.css/);
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.orientation, 'any');
  for (const shortcut of manifest.shortcuts) {
    assert.match(shortcut.url, /^\.\/#\//);
    assert.notEqual(parseRoute(shortcut.url.replace(/^\.\//, '')).name, 'home', shortcut.url);
  }
});

test('formal calculations render five invariant print columns and retain zero placeholders', () => {
  const addition = mountTool('addition-model', { left: 3687, right: 4756, answerRevealed: true });
  const additionTable = addition.host.querySelector('.column-calculation');
  assert.ok(additionTable);
  assert.equal(additionTable.querySelectorAll('.place-headings > span').length, 5);
  for (const row of additionTable.querySelectorAll('.column-row')) {
    assert.equal(row.querySelectorAll(':scope > span').length, 5);
  }
  assert.equal(additionTable.querySelector('.column-row.result').textContent.trim(), '8443');
  addition.close();

  const subtraction = mountTool('subtraction-model', { left: 4002, right: 1786, answerRevealed: true });
  const firstRowDigits = [...subtraction.host.querySelector('.column-row').querySelectorAll(':scope > span')]
    .map((cell) => cell.textContent);
  assert.deepEqual(firstRowDigits, ['', '4', '0', '0', '2']);
  assert.equal(subtraction.host.querySelector('.column-row.result').textContent.trim(), '2216');
  subtraction.close();
});

test('number-line SVG geometry and print CSS preserve one truthful linear scale', async () => {
  const mounted = mountTool('open-number-line', {
    lower: 2000,
    upper: 10000,
    target: 6000,
    position: 6000,
    answerRevealed: true,
  });
  const line = mounted.host.querySelector('svg.scaled-number-line');
  assert.equal(line.getAttribute('viewBox'), '0 0 1000 180');
  assert.match(line.getAttribute('aria-label'), /from 2000 to 10000; marker at 6000/);

  const ticks = [...line.querySelectorAll('line')]
    .filter((node) => ['72', '80'].includes(node.getAttribute('y1')));
  assert.equal(ticks.length, 11);
  assert.deepEqual(ticks.map((tick) => Number(tick.getAttribute('x1'))), [70, 156, 242, 328, 414, 500, 586, 672, 758, 844, 930]);
  assert.match(line.querySelector('path.line-marker').getAttribute('d'), /^M500(?:\.0+)?\b/);
  mounted.close();

  const printCss = await read('../src/styles/print.css');
  assert.match(printCss, /svg\.scaled-number-line\s*\{[\s\S]*width:\s*100%\s*!important[\s\S]*height:\s*auto\s*!important[\s\S]*aspect-ratio:\s*50\s*\/\s*9/);
  assert.match(printCss, /\.scaled-number-line line\s*\{[\s\S]*vector-effect:\s*non-scaling-stroke/);
});

test('A4 print rules force economical monochrome models, fixed columns and uncluttered output', async () => {
  const printCss = await read('../src/styles/print.css');
  assert.match(printCss, /@page\s*\{\s*size:\s*A4/);
  assert.match(printCss, /--ink:\s*#000/);
  assert.match(printCss, /\.number-workspace[\s\S]*color:\s*#000\s*!important[\s\S]*background:\s*#fff\s*!important/);
  assert.match(printCss, /\.place-headings,[\s\S]*\.column-row\s*\{[\s\S]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)\s*!important/);
  assert.match(printCss, /\.column-row\s*\{[\s\S]*font-variant-numeric|\.column-calculation\s*\{[\s\S]*font-variant-numeric/);
  assert.match(printCss, /\.exchange-trace\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,[\s\S]*overflow:\s*visible\s*!important/);
  assert.match(printCss, /\.board-view\s*\{\s*display:\s*none\s*!important/);
  assert.match(printCss, /\.no-print,[\s\S]*display:\s*none\s*!important/);
});

test('Board View contains a model and controls but no learner identity or save surface', () => {
  const mounted = mountTool('addition-model', {
    left: 2341,
    right: 3126,
    answerRevealed: true,
    boardOpen: true,
  });
  const board = mounted.host.querySelector('.board-view');
  assert.ok(board);
  assert.equal(board.getAttribute('role'), 'dialog');
  assert.equal(board.getAttribute('aria-modal'), 'true');
  assert.ok(board.querySelector('.column-calculation'));
  assert.ok(board.querySelector('[data-number-action="close-board"]'));
  assert.equal(board.querySelector('[data-number-action="close-board"]').disabled, false);
  assert.equal(board.querySelector('[data-number-action="board-previous"]').disabled, false);
  assert.equal(board.querySelector('[data-number-action="board-next"]').disabled, false);
  assert.equal(board.querySelector('[data-number-action="save"]'), null);
  assert.equal(board.querySelector('[data-route]'), null);
  assert.equal(board.querySelector('.profile-pill, .profile-name, [data-profile-id], [data-learner-id]'), null);
  assert.doesNotMatch(board.textContent, /My Work|learner profile|saved by/i);
  mounted.close();
});

test('Today’s Key cards are semantic, four-digit and laid out as black-and-white cut-outs', async () => {
  const entries = KEY_MANIFEST.filter((key) => (
    key.type === 'activity' && key.destinationId === 'number-expedition'
  )).slice(0, 4);
  const dom = new JSDOM(renderPrintableTodayKeyCards(entries));
  const cards = [...dom.window.document.querySelectorAll('.teacher-print-key-card--cut-out')];
  assert.equal(cards.length, 4);
  for (const [index, card] of cards.entries()) {
    assert.equal(card.tagName, 'ARTICLE');
    assert.match(card.textContent, /Today’s Key/);
    assert.match(card.querySelector('.teacher-print-key-card__code').textContent, /^\d{4}$/);
    assert.match(card.textContent, new RegExp(entries[index].title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(renderPrintableTodayKeyCard(entries[0], { showTitle: false }), /Today’s Key/);
  assert.doesNotMatch(renderPrintableTodayKeyCard(entries[0], { showTitle: false }), /<h2>/);
  dom.window.close();

  const printCss = await read('../src/styles/print.css');
  assert.match(printCss, /\.teacher-print-card-sheet\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(printCss, /\.teacher-print-key-card\s*\{[\s\S]*color:\s*#000\s*!important[\s\S]*background:\s*#fff\s*!important[\s\S]*break-inside:\s*avoid/);
});

test('touch, keyboard, responsive, high-contrast and reduced-motion contracts remain structural', async () => {
  const baseCss = await read('../src/styles/base.css');
  const layoutCss = await read('../src/styles/layout.css');
  const numberCss = await read('../src/destinations/number-expedition/number-expedition.css');

  assert.match(baseCss, /button,[\s\S]*touch-action:\s*manipulation/);
  assert.match(baseCss, /button\s*\{\s*min-height:\s*44px/);
  assert.match(baseCss, /button:focus-visible,[\s\S]*outline:\s*3px\s+solid\s+var\(--amber\)/);
  assert.match(baseCss, /html\[data-contrast="high"\]\s*\{[\s\S]*--ink:\s*#101719[\s\S]*--line-strong:/);
  assert.match(baseCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation-duration:\s*0\.01ms\s*!important/);
  assert.match(baseCss, /html\[data-motion="reduced"\][\s\S]*transition-duration:\s*0\.01ms\s*!important/);
  assert.match(numberCss, /@media\(max-width:820px\)/);
  assert.match(numberCss, /@media\(max-width:520px\)/);
  assert.match(numberCss, /\.region-tools button\{[^}]*min-height:70px/);
  assert.match(layoutCss, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*600px\)/);

  const home = mountTool(null);
  const routeButtons = [...home.host.querySelectorAll('[data-route="number-tool"]')];
  assert.equal(routeButtons.length, NUMBER_TOOLS.length);
  assert.ok(routeButtons.every((button) => button.tagName === 'BUTTON' && button.type === 'button'));
  home.close();

  for (const tool of NUMBER_TOOLS) {
    const mounted = mountTool(tool.id);
    const actions = [...mounted.host.querySelectorAll('[data-number-action]')];
    assert.ok(actions.length > 0, `${tool.id} has no operable controls`);
    assert.ok(actions.every((control) => control.tagName === 'BUTTON' && control.type === 'button'), `${tool.id} exposes a non-native action`);
    assert.equal(mounted.host.querySelector('[draggable="true"]'), null, `${tool.id} must not require dragging`);
    assert.ok([...mounted.host.querySelectorAll('input, select, textarea')].every((control) => !control.disabled), `${tool.id} contains an unavailable native input`);
    mounted.close();
  }
});
