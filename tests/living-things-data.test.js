import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HABITATS,
  MICROHABITATS,
  ORGANISMS,
  SCIENCE_SOURCES,
  validateOrganismLibrary,
} from '../src/data/organisms.js';
import {
  LIVING_THINGS_ACTIVITIES,
  SCIENCE_COLLECTIONS,
  SCIENCE_DESTINATION_KEY,
  SCIENCE_REGIONS,
  SCIENCE_TOOLS,
  validateLivingThingsManifest,
} from '../src/data/livingThings.js';
import { ARTEFACT_TYPES } from '../src/data/artefactTypes.js';
import { KEY_MANIFEST, getKeyByCode, resolveKeyPermissions } from '../src/data/keys.js';

test('the local organism library contains 56 diverse, validated and attributed records', () => {
  const validation = validateOrganismLibrary();
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.equal(ORGANISMS.length, 56);
  assert.equal(new Set(ORGANISMS.map(({ id }) => id)).size, 56);
  assert.equal(ORGANISMS.filter(({ kingdom }) => kingdom === 'plant').length, 6);
  assert.equal(ORGANISMS.filter(({ backbone }) => backbone === 'vertebrate').length, 26);
  assert.equal(ORGANISMS.filter(({ backbone }) => backbone === 'invertebrate').length, 24);
  assert.deepEqual(
    ['mammal', 'bird', 'fish', 'reptile', 'amphibian'].map((group) => [group, ORGANISMS.filter(({ broadGroup }) => broadGroup === group).length]),
    [['mammal', 6], ['bird', 6], ['fish', 5], ['reptile', 5], ['amphibian', 4]],
  );
  for (const organism of ORGANISMS) {
    assert.ok(organism.commonName);
    assert.ok(organism.scientificName);
    assert.ok(organism.features?.bodyCovering);
    assert.ok(Number.isInteger(organism.features?.visibleLimbs));
    assert.ok(organism.pronunciation?.text);
    assert.ok(organism.childDescription.length > 20);
    assert.ok(organism.teacherNotes);
    assert.equal(organism.classificationKeyCompatibility, true);
    assert.match(organism.imageRights?.licence || '', /original in-product illustration/i);
    assert.match(organism.imageRights?.attribution || '', /original/i);
    assert.ok(organism.sources.every((source) => source.url && source.retrievedAt));
  }
});

test('habitats, microhabitats, UK and Gambian connections use stored evidence contracts', () => {
  assert.equal(HABITATS.length, 10);
  assert.equal(MICROHABITATS.length, 8);
  assert.ok(Object.keys(SCIENCE_SOURCES).length >= 6);
  assert.ok(ORGANISMS.filter(({ occurrence }) => occurrence.uk).length >= 20);
  assert.ok(ORGANISMS.filter(({ occurrence }) => occurrence.gambia).length >= 6);
  for (const habitat of HABITATS) {
    assert.ok(habitat.resources.length >= 3);
    assert.ok(habitat.conditions.length >= 2);
    assert.ok(Array.isArray(habitat.atlasLinks));
  }
  for (const microhabitat of MICROHABITATS) {
    assert.ok(microhabitat.parentHabitatIds.length >= 1);
    assert.ok(microhabitat.parentHabitatIds.every((parentId) => HABITATS.some(({ id }) => id === parentId)));
    assert.ok(microhabitat.conditions.length >= 2);
  }
  assert.equal(ORGANISMS.find(({ id }) => id === 'bottlenose-dolphin').broadGroup, 'mammal');
  assert.equal(ORGANISMS.find(({ id }) => id === 'garden-cross-spider').subgroup, 'arachnid');
  assert.equal(ORGANISMS.find(({ id }) => id === 'emperor-penguin').broadGroup, 'bird');
});

test('Build 3 exposes six regions, 18 open tools and exactly 16 guided activities', () => {
  const validation = validateLivingThingsManifest();
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.equal(SCIENCE_REGIONS.length, 6);
  assert.equal(SCIENCE_TOOLS.length, 18);
  assert.equal(LIVING_THINGS_ACTIVITIES.length, 16);
  assert.equal(SCIENCE_COLLECTIONS.length, 5);
  assert.deepEqual(LIVING_THINGS_ACTIVITIES.map(({ order }) => order), Array.from({ length: 16 }, (_, index) => index + 1));
  for (const activity of LIVING_THINGS_ACTIVITIES) {
    assert.match(activity.keyCode, /^\d{4}$/);
    assert.ok(activity.curriculumObjective);
    assert.equal(activity.rhythm.join(' → '), 'Notice → Explore → Make → Explain');
    assert.ok(activity.likelyMisconceptions.length);
    assert.ok(activity.vocabulary.length);
    assert.equal(activity.keyCheck.unscored, true);
    assert.equal(activity.boardViewSuitable, true);
    assert.ok(activity.printMetadata.blackAndWhite);
  }
});

test('every Living Things activity, collection and destination code resolves its permanent pathway', () => {
  const scienceKeys = KEY_MANIFEST.filter(({ destinationId }) => destinationId === 'living-things-observatory');
  assert.equal(scienceKeys.length, 22);
  for (const activity of LIVING_THINGS_ACTIVITIES) {
    const key = getKeyByCode(activity.keyCode);
    assert.equal(key?.destinationId, 'living-things-observatory');
    assert.equal(key?.route, `#/activity/${activity.id}`);
    assert.deepEqual(resolveKeyPermissions(activity.keyCode).activityIds, [activity.id]);
  }
  for (const collection of SCIENCE_COLLECTIONS) {
    const key = getKeyByCode(collection.code);
    assert.equal(key?.id, `key-${collection.id}`);
    assert.deepEqual(resolveKeyPermissions(collection.code).activityIds, [...collection.activityIds].sort());
  }
  const destination = getKeyByCode(SCIENCE_DESTINATION_KEY.code);
  assert.equal(destination?.id, SCIENCE_DESTINATION_KEY.id);
  assert.deepEqual(resolveKeyPermissions(SCIENCE_DESTINATION_KEY.code).futureScopes, [{
    destinationId: 'living-things-observatory',
    activityIds: ['*'],
    includeFuture: true,
  }]);
  const wholeWorld = resolveKeyPermissions('7046');
  assert.ok(LIVING_THINGS_ACTIVITIES.every(({ id }) => wholeWorld.activityIds.includes(id)));
});

test('all major scientific My Work artefacts share one active versioned contract', () => {
  const scienceTypes = ARTEFACT_TYPES.filter(({ destinationIds }) => destinationIds.includes('living-things-observatory'));
  assert.equal(scienceTypes.length, 20);
  for (const type of scienceTypes) {
    assert.equal(type.active, true);
    assert.equal(type.versioned, true);
    assert.equal(type.printable, true);
    assert.deepEqual(type.requiredContent, ['scienceState']);
  }
});
