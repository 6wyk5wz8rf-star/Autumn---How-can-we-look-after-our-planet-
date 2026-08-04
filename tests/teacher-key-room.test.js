import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { KEY_MANIFEST } from '../src/data/keys.js';
import { ACTIVITIES } from '../src/data/activities.js';
import { DESTINATIONS } from '../src/data/destinations.js';
import { resetDatabaseConnection } from '../src/services/db.js';
import { createBackup, importBackup } from '../src/services/backup.js';
import {
  LEGACY_TEACHER_KEY_CODE,
  LEGACY_TEACHER_KEY_ID,
  TEACHER_KEY_CODE,
  TEACHER_KEY_ID,
  TEACHER_KEY_RECORD,
  getProductionTeacherKeys,
  validateTeacherKeyManifest,
} from '../src/teacher/teacherKeyManifest.js';
import { TeacherKeySessionController } from '../src/teacher/teacherKeySession.js';
import {
  createTeacherKeyLibrary,
  filterTeacherKeyLibrary,
  getQuickTeacherKeys,
  groupTeacherKeyLibrary,
} from '../src/teacher/teacherKeyLibrary.js';
import {
  MAX_TEACHER_FAVOURITES,
  TeacherKeyPreferencesStore,
} from '../src/teacher/teacherKeyPreferences.js';
import {
  FullScreenKeyDisplay,
  renderFullScreenKeyDisplay,
  renderPrintableTeacherKeyGuide,
  renderPrintableTodayKeyCard,
} from '../src/teacher/teacherKeyPresentation.js';
import {
  TeacherKeyRoomController,
  renderTeacherKeyRoom,
} from '../src/teacher/TeacherKeyRoom.js';

function upgradedManifest() {
  return [
    ...KEY_MANIFEST.filter((key) => (
      !['maintenance', 'teacher'].includes(key.type)
      || key.id === LEGACY_TEACHER_KEY_ID
    )),
    TEACHER_KEY_RECORD,
  ];
}

function extraKey({
  id,
  code,
  title,
  description = 'A precise mathematics pathway.',
  strand = 'Place value',
  active = true,
} = {}) {
  return {
    id,
    code,
    type: 'activity',
    destinationId: 'number-expedition',
    destination: 'number-expedition',
    activityIds: [id.replace(/^key-/, '')],
    permissionsGranted: [`activity:${id.replace(/^key-/, '')}`],
    grants: [{
      resource: 'key-activity',
      destinationId: 'number-expedition',
      activityIds: [id.replace(/^key-/, '')],
      includeFuture: false,
    }],
    route: `#/activity/${id.replace(/^key-/, '')}`,
    title,
    description,
    curriculumStrand: strand,
    curriculumTags: ['mathematics', strand.toLowerCase()],
    active,
    printGuide: { purpose: description, quickUse: false, displayCard: true },
  };
}

test('8584 is the only reserved teacher entrance and has no child grants', () => {
  const manifest = upgradedManifest();
  const validation = validateTeacherKeyManifest(manifest, {
    activities: ACTIVITIES,
    destinations: DESTINATIONS,
  });
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.equal(validation.teacherKey.id, TEACHER_KEY_ID);
  assert.equal(validation.teacherKey.code, TEACHER_KEY_CODE);
  assert.deepEqual(validation.teacherKey.activityIds, []);
  assert.deepEqual(validation.teacherKey.permissionsGranted, []);
  assert.equal(validation.legacyTeacherKey.id, LEGACY_TEACHER_KEY_ID);
  assert.equal(validation.legacyTeacherKey.code, LEGACY_TEACHER_KEY_CODE);
  assert.equal(getProductionTeacherKeys(manifest).some((key) => key.code === TEACHER_KEY_CODE), false);
});

test('teacher manifest validation fails loudly for collisions, legacy entrances and malformed wildcards', () => {
  const manifest = upgradedManifest();
  const collision = [...manifest, { ...manifest[0], id: 'collision', code: TEACHER_KEY_CODE }];
  const extraAdult = [...manifest, {
    ...TEACHER_KEY_RECORD,
    id: 'another-adult-entrance',
    code: '6193',
  }];
  const malformed = manifest.map((key) => key.type === 'destination'
    ? { ...key, grants: [{ ...key.grants[0], activityIds: ['*', 'find-the-gambia'] }] }
    : key);

  assert.match(validateTeacherKeyManifest(collision).errors.join(' '), /assigned more than once|Duplicate key code/);
  assert.match(validateTeacherKeyManifest(extraAdult).errors.join(' '), /unrecognised adult entrance/);
  assert.match(validateTeacherKeyManifest(malformed).errors.join(' '), /includeFuture wildcard/);

  const productionEntries = [...getProductionTeacherKeys(manifest), { ...manifest[0], id: 'inactive', active: false }];
  assert.match(validateTeacherKeyManifest(manifest, { productionEntries }).errors.join(' '), /Inactive or teacher-only key/);
});

test('teacher session intercepts 8584 before child persistence and closes to its return location', () => {
  const session = new TeacherKeySessionController();
  const manifest = upgradedManifest();
  const teacher = session.resolve('8584', {
    manifest,
    returnLocation: { name: 'work', params: { filter: 'mathematics' } },
  });
  assert.equal(teacher.kind, 'teacher');
  assert.equal(session.getState().active, true);
  assert.deepEqual(session.close(), { name: 'work', params: { filter: 'mathematics' } });
  assert.equal(session.getState().active, false);

  const legacy = session.resolve(LEGACY_TEACHER_KEY_CODE, { manifest });
  assert.equal(legacy.kind, 'teacher');
  assert.equal(legacy.canonical, false);
  assert.equal(legacy.legacyAlias, true);
  session.close();

  const child = session.resolve('7318', { manifest });
  assert.equal(child.kind, 'pathway');
  assert.equal(child.key.id, 'key-atlas-find-the-gambia');
  assert.equal(session.getState().active, false);
  assert.equal(session.resolve('9999', { manifest }).kind, 'invalid');
});

test('teacher library is generated from active manifest records and supports useful search and filters', () => {
  const rounding = extraKey({
    id: 'key-nearest-hundred',
    code: '6427',
    title: 'Nearest Hundred',
    description: 'Round by locating the lower multiple, midpoint and upper multiple.',
    strand: 'Rounding and estimation',
  });
  const exchange = extraKey({
    id: 'key-exchange-across-zero',
    code: '3752',
    title: 'Exchange Across Zero',
    description: 'Model subtraction through zero placeholders using exchange.',
    strand: 'Formal subtraction',
  });
  const inactive = extraKey({ id: 'key-inactive', code: '1947', title: 'Unfinished', active: false });
  const entries = createTeacherKeyLibrary([...upgradedManifest(), rounding, exchange, inactive], {
    destinations: DESTINATIONS,
  });

  assert.equal(entries.some((entry) => entry.id === 'key-inactive'), false);
  assert.equal(entries.some((entry) => entry.code === TEACHER_KEY_CODE), false);
  assert.deepEqual(filterTeacherKeyLibrary(entries, { query: 'The Gambia' }).map((entry) => entry.code).includes('7318'), true);
  assert.ok(filterTeacherKeyLibrary(entries, { query: 'rounding', subject: 'mathematics' }).map((entry) => entry.id).includes('key-nearest-hundred'));
  assert.ok(filterTeacherKeyLibrary(entries, { query: 'exchange', environment: 'number-expedition' }).map((entry) => entry.id).includes('key-exchange-across-zero'));
  assert.ok(groupTeacherKeyLibrary(entries).find((group) => group.id === 'number-expedition'));
});

test('8584 science search and quick-topic filters remain available in the Build 4 manifest', () => {
  const entries = createTeacherKeyLibrary(KEY_MANIFEST, { destinations: DESTINATIONS });
  assert.equal(entries.length, 90);
  for (const query of ['living things', 'vertebrate', 'invertebrate', 'classification', 'key', 'habitat', 'environmental change', 'organism', 'sorting']) {
    assert.ok(filterTeacherKeyLibrary(entries, { query }).length >= 1, `Teacher search should find ${query}`);
  }
  for (const topic of ['observation', 'grouping', 'vertebrates', 'invertebrates', 'classification keys', 'habitats', 'environmental change']) {
    const matches = filterTeacherKeyLibrary(entries, { topic, subject: 'science' });
    assert.ok(matches.length >= 1, `Teacher topic should find ${topic}`);
    assert.ok(matches.every(({ subject }) => subject.id === 'science'));
  }
  for (const topic of ['weather climate', 'climate zones', 'climate experiments', 'climate biomes', 'global warming', 'climate response']) {
    assert.ok(filterTeacherKeyLibrary(entries, { topic }).length >= 1, `Teacher topic should find ${topic}`);
  }
  const scienceActivities = filterTeacherKeyLibrary(entries, {
    subject: 'science',
    environment: 'living-things-observatory',
    scale: 'activity',
  });
  assert.equal(scienceActivities.length, 16);
  assert.ok(scienceActivities.every(({ savedOutcome, usefulMoments, boardViewSuitable, approximateMinutes }) => (
    savedOutcome && usefulMoments.length && boardViewSuitable && approximateMinutes
  )));
});

test('teacher favourites are device-level, manifest constrained and backup-compatible metadata', async () => {
  const manifest = upgradedManifest();
  let saved = null;
  const store = new TeacherKeyPreferencesStore({
    manifest,
    read: async (_key, fallback) => saved ?? fallback,
    write: async (_key, value) => { saved = value; },
    remove: async () => { saved = null; },
  });
  const defaults = await store.load();
  assert.ok(defaults.favouriteKeyIds.length > 0);
  await store.toggleFavourite('key-atlas-find-the-gambia');
  assert.equal(saved.schemaVersion, 2);
  assert.equal(Object.hasOwn(saved, 'profileId'), false);
  await assert.rejects(store.toggleFavourite(TEACHER_KEY_ID), /active child pathway/);

  const productionIds = getProductionTeacherKeys(manifest).map((key) => key.id);
  await store.setFavourites([...productionIds, ...productionIds, 'unknown']);
  assert.ok(store.getSnapshot().favouriteKeyIds.length <= MAX_TEACHER_FAVOURITES);
  assert.equal(store.getSnapshot().favouriteKeyIds.includes('unknown'), false);
});

test('teacher favourites round-trip through the product backup without a learner profile', async () => {
  const manifest = upgradedManifest();
  await resetDatabaseConnection({ databaseName: 'our-planet-test-teacher-preferences-source', clearMemory: true });
  const source = new TeacherKeyPreferencesStore({ manifest });
  await source.load();
  await source.setFavourites(['key-atlas-find-the-gambia']);
  await source.setShowTitleOnBoard(false);
  const backup = await createBackup({ appVersion: 'teacher-preferences-test' });

  await resetDatabaseConnection({ databaseName: 'our-planet-test-teacher-preferences-target', clearMemory: true });
  await importBackup(backup, { mode: 'merge' });
  const restored = await new TeacherKeyPreferencesStore({ manifest }).load();
  assert.deepEqual(restored.favouriteKeyIds, ['key-atlas-find-the-gambia']);
  assert.equal(restored.showTitleOnBoard, false);
});

test('full-screen and print renderers escape content and keep board display to one exit control', () => {
  const unsafe = {
    id: 'unsafe',
    code: '6427',
    title: '<img src=x onerror=alert(1)>',
    purpose: 'Safe',
    scaleTitle: 'Activity',
    environment: { id: 'number-expedition', title: 'Number Expedition', ordinal: 2 },
    strand: { id: 'rounding', title: 'Rounding' },
    curriculumTags: [],
  };
  const fullScreen = renderFullScreenKeyDisplay(unsafe);
  assert.equal((fullScreen.match(/<button/g) ?? []).length, 1);
  assert.doesNotMatch(fullScreen, /<img/);
  assert.match(fullScreen, /&lt;img/);
  assert.match(renderPrintableTodayKeyCard(unsafe), /6427/);
  assert.doesNotMatch(renderPrintableTodayKeyCard(unsafe), /<img/);

  const guide = renderPrintableTeacherKeyGuide([unsafe]);
  assert.match(guide, /Number Expedition/);
  assert.match(guide, /Rounding/);
});

test('full-screen controller restores focus and Teacher Key Room controller filters without app-shell coupling', async () => {
  const dom = new JSDOM('<!doctype html><html><body><button id="before">Before</button><main id="room"></main></body></html>', {
    url: 'https://example.test/',
  });
  const before = dom.window.document.querySelector('#before');
  before.focus();
  const display = new FullScreenKeyDisplay({ document: dom.window.document });
  await display.open({ code: '7318', title: 'Find The Gambia' }, { requestBrowserFullscreen: false });
  assert.ok(dom.window.document.querySelector('[data-teacher-key-display]'));
  display.close();
  assert.equal(dom.window.document.activeElement, before);

  let saved = null;
  const preferencesStore = new TeacherKeyPreferencesStore({
    manifest: upgradedManifest(),
    read: async (_key, fallback) => saved ?? fallback,
    write: async (_key, value) => { saved = value; },
    remove: async () => { saved = null; },
  });
  const controller = new TeacherKeyRoomController(dom.window.document.querySelector('#room'), {
    manifest: upgradedManifest(),
    destinations: DESTINATIONS,
    preferencesStore,
  });
  await controller.mount();
  const search = dom.window.document.querySelector('[data-teacher-filter="query"]');
  search.value = 'Gambia';
  search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  const cards = [...dom.window.document.querySelectorAll('[data-teacher-key-id]')];
  assert.ok(cards.length >= 1);
  assert.equal(cards.every((card) => /gambia/i.test(card.textContent)), true);
  controller.destroy();
});

test('room renderer exposes the required teacher utilities without learner analytics', () => {
  const entries = createTeacherKeyLibrary(upgradedManifest(), { destinations: DESTINATIONS });
  const html = renderTeacherKeyRoom({
    entries,
    favouriteIds: getQuickTeacherKeys(entries).map((entry) => entry.id),
    profileCount: 2,
  });
  for (const phrase of ['Teacher Key Room', 'Return to Children’s View', 'Print full Key Guide', 'Export local backup', 'Import local backup']) {
    assert.match(html, new RegExp(phrase));
  }
  assert.doesNotMatch(html, /rank|score|attainment/i);
});
