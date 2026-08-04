import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import {
  BIOMES,
  CLIMATE_ACTIVITIES,
  CLIMATE_COLLECTIONS,
  CLIMATE_DESTINATION_KEY,
  CLIMATE_LOCATIONS,
  CLIMATE_MODES,
  CLIMATE_SOURCE_RECORDS,
  CLIMATE_TOOLS,
  CLIMATE_ZONES,
  GLOBAL_TEMPERATURE_ANOMALY,
  validateClimateManifest,
} from '../src/data/climate.js';
import { KEY_MANIFEST, KEY_TYPES, getKeyByCode, validateKeyManifest } from '../src/data/keys.js';
import { ARTEFACT_TYPES, validateArtefactTypeManifest } from '../src/data/artefactTypes.js';
import { REQUIRED_CLIMATE_TERMS, getGlossaryEntriesByTerm } from '../src/data/glossary.js';
import {
  climateSummary,
  compareClimateLocations,
  distributeRainfall,
  modelScene,
  possibleBiomes,
  validateClimateData,
} from '../src/climate/model.js';
import { generateClimateTask, validateGeneratedClimateTask } from '../src/climate/generator.js';

const BUILD_3_KEY_HASH = '4863631b583f2435250c25513eea37183acb436b164ad2f2fdc3603709909c61';
const CLIMATE_ACTIVITY_CODES = ['3759', '6417', '9281', '5063', '1748', '8327', '4591', '2168', '7834', '3496', '6951', '4287', '9175', '5632'];
const CLIMATE_COLLECTION_CODES = ['2469', '8041', '3572', '6815', '7926'];

function legacyKeyHash() {
  const climateActivityIds = new Set(CLIMATE_ACTIVITIES.map(({ id }) => id));
  const records = KEY_MANIFEST
    .filter((key) => key.destinationId !== 'climate-laboratory' && !(key.activityIds || []).some((id) => climateActivityIds.has(id)))
    .map(({ id, code }) => `${id}:${code}`)
    .sort()
    .join('\n');
  return { count: records.split('\n').length, hash: createHash('sha256').update(records).digest('hex') };
}

test('Build 4 climate manifests are complete, permanent and collision-free', () => {
  const climate = validateClimateManifest();
  const data = validateClimateData();
  const keys = validateKeyManifest(KEY_MANIFEST);
  const artefacts = validateArtefactTypeManifest(ARTEFACT_TYPES);
  assert.equal(climate.valid, true, climate.errors.join('\n'));
  assert.equal(data.valid, true, data.errors.join('\n'));
  assert.equal(keys.valid, true, keys.errors.join('\n'));
  assert.equal(artefacts.valid, true, artefacts.errors.join('\n'));
  assert.equal(CLIMATE_MODES.length, 4);
  assert.equal(CLIMATE_TOOLS.length, 16);
  assert.equal(CLIMATE_ACTIVITIES.length, 14);
  assert.equal(CLIMATE_COLLECTIONS.length, 5);
  assert.equal(CLIMATE_ZONES.length, 5);
  assert.equal(BIOMES.length, 8);

  assert.deepEqual(CLIMATE_ACTIVITIES.map(({ keyCode }) => keyCode), CLIMATE_ACTIVITY_CODES);
  assert.deepEqual(CLIMATE_COLLECTIONS.map(({ code }) => code), CLIMATE_COLLECTION_CODES);
  assert.equal(CLIMATE_DESTINATION_KEY.code, '1457');
  for (const activity of CLIMATE_ACTIVITIES) {
    const key = getKeyByCode(activity.keyCode);
    assert.equal(key?.type, KEY_TYPES.ACTIVITY);
    assert.deepEqual(key.activityIds, [activity.id]);
    assert.ok(activity.likelyMisconceptions.length);
    assert.equal(activity.keyCheck.unscored, true);
    assert.equal(activity.outcome.printable, true);
  }
});

test('every Build 1–3 key remains byte-for-byte locked by ID and code', () => {
  const legacy = legacyKeyHash();
  assert.equal(legacy.count, 72);
  assert.equal(legacy.hash, BUILD_3_KEY_HASH);
});

test('climate records retain units, period, coordinates, provenance and careful status labels', () => {
  assert.ok(CLIMATE_SOURCE_RECORDS.length >= 7);
  for (const source of CLIMATE_SOURCE_RECORDS) {
    assert.match(source.url, /^https:\/\//);
    assert.match(source.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(source.publisher && source.title && source.use);
  }
  for (const location of CLIMATE_LOCATIONS) {
    assert.equal(location.pattern.temperatureC.length, 12);
    assert.equal(location.pattern.rainfallMm.length, 12);
    assert.ok(Number.isFinite(location.latitude));
    assert.ok(Number.isFinite(location.longitude));
    assert.ok(location.sourceIds.length);
    assert.ok(location.dataPeriod && location.unitNote && location.seasonNote);
    assert.equal(location.status, 'sourced-rounded');
    const summary = climateSummary(location);
    assert.equal(summary.locationId, location.id);
    assert.equal(summary.longitude, location.longitude);
  }
  assert.equal(CLIMATE_LOCATIONS.find(({ id }) => id === 'united-kingdom').atlasPlaceId, 'uk');
  assert.equal(CLIMATE_LOCATIONS.find(({ id }) => id === 'the-gambia').atlasPlaceId, 'gambia');
  assert.equal(GLOBAL_TEMPERATURE_ANOMALY.status, 'sourced-rounded');
  assert.ok(GLOBAL_TEMPERATURE_ANOMALY.points.every((point, index, points) => !index || point.year > points[index - 1].year));
});

test('published location arrays remain pinned to their named official station tables', () => {
  const byId = Object.fromEntries(CLIMATE_LOCATIONS.map((location) => [location.id, location]));
  assert.deepEqual(byId['united-kingdom'].pattern.temperatureC, [5.6, 5.8, 7.9, 10.5, 13.7, 16.8, 19, 18.7, 15.9, 12.3, 8.4, 5.9]);
  assert.deepEqual(byId['united-kingdom'].pattern.rainfallMm, [58.83, 44.96, 38.78, 42.31, 45.91, 47.25, 45.8, 52.78, 49.61, 65.07, 66.63, 57.05]);
  assert.deepEqual(byId['the-gambia'].pattern.temperatureC, [25.2, 26.3, 27.1, 26.7, 27.2, 28.3, 27.9, 27.4, 27.7, 28.1, 27.3, 25.7]);
  assert.deepEqual(byId['the-gambia'].pattern.rainfallMm, [0.4, 0.6, 0, 0, 3.4, 57.8, 226.4, 325.6, 262.8, 64.2, 1.4, 0.2]);
  assert.equal(byId['united-kingdom'].sourceIds[0], 'met-office-heathrow-climatology');
  assert.equal(byId['the-gambia'].sourceIds[0], 'wmo-yundum-climatology');
  assert.equal(byId['yakutsk-russia'].dataPeriod, 'Source period not supplied');
  assert.ok(byId['cape-town-south-africa']);
  assert.equal(byId['wellington-new-zealand'], undefined);
});

test('the simplified model is explicit, bounded and does not claim one exact biome', () => {
  const cold = modelScene({ temperatureC: -18, rainfallMm: 300, seasonality: 'spread' });
  const warmWet = modelScene({ temperatureC: 28, rainfallMm: 2600, seasonality: 'seasonal' });
  assert.equal(cold.status, 'simplified-model');
  assert.equal(warmWet.status, 'simplified-model');
  assert.match(cold.caution, /cannot predict one real place/i);
  assert.ok(possibleBiomes({ temperatureC: 28, rainfallMm: 2600, seasonality: 'seasonal' }).length >= 1);
  const spread = distributeRainfall(997, 'spread', 4);
  const seasonal = distributeRainfall(997, 'seasonal', 4);
  assert.equal(spread.reduce((sum, value) => sum + value, 0), 997);
  assert.equal(seasonal.reduce((sum, value) => sum + value, 0), 997);
  assert.notDeepEqual(spread, seasonal);
  const comparison = compareClimateLocations('united-kingdom', 'the-gambia');
  assert.match(comparison.evidence, /United Kingdom/);
  assert.match(comparison.caution, /rounded averages/i);
});

test('two thousand seeded climate tasks are deterministic and provenance-valid', () => {
  const kinds = ['weather-climate', 'locations', 'seasonality', 'model', 'effects', 'responses'];
  for (let index = 0; index < 2000; index += 1) {
    const kind = kinds[index % kinds.length];
    const seed = `build-4-climate-${index}`;
    const first = generateClimateTask(kind, seed);
    const second = generateClimateTask(kind, seed);
    assert.deepEqual(first, second);
    const validation = validateGeneratedClimateTask(first);
    assert.equal(validation.valid, true, validation.errors.join('\n'));
    if (kind === 'model') assert.equal(first.status, 'simplified-model');
    if (kind === 'weather-climate') {
      assert.equal(first.status, 'fictional');
      assert.equal(first.weatherEvent.status, 'fictional');
      assert.equal(first.climatePattern.status, 'sourced-rounded');
    }
    if (['effects', 'responses'].includes(kind)) assert.equal(first.status, 'simplified-model');
  }
  assert.throws(() => generateClimateTask('real-world-forecast', 'blocked'), /Unknown climate generator kind/);
});

test('climate vocabulary and all fifteen climate work types join shared registries contextually', () => {
  for (const term of REQUIRED_CLIMATE_TERMS) {
    assert.ok(getGlossaryEntriesByTerm(term).some(({ active }) => active), `Climate glossary term should be active: ${term}`);
  }
  const climateTypes = ARTEFACT_TYPES.filter(({ destinationIds }) => destinationIds?.includes('climate-laboratory'));
  assert.equal(climateTypes.length, 15);
  assert.ok(climateTypes.every(({ printable, versioned }) => printable && versioned));
});
