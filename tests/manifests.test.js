import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DESTINATIONS,
  getActiveDestinations,
  getDestinationById,
} from '../src/data/destinations.js';
import {
  ACTIVITIES,
  getActivitiesForDestination,
} from '../src/data/activities.js';
import {
  KEY_MANIFEST,
  KEY_TYPES,
  getKeyByCode,
  isObviousKeyCode,
  resolveKeyPermissions,
  validateKeyManifest,
} from '../src/data/keys.js';
import {
  ARTIST_METADATA_SCHEMA,
  ARTWORK_REFERENCES,
  ARTWORK_RIGHTS_SCHEMA,
  CURRICULUM_RECORDS,
  TIDES_OF_CHANGE_STAGES,
  validateCurriculumManifest,
} from '../src/data/curriculum.js';
import {
  CONCEPT_GRAPH,
  findConceptPath,
  getRelatedConcepts,
  validateConceptGraph,
} from '../src/data/conceptGraph.js';
import {
  GLOSSARY,
  REQUIRED_MATHEMATICS_TERMS,
  REQUIRED_ART_TERMS,
  REQUIRED_ATLAS_TERMS,
  getGlossaryEntriesByTerm,
  validateGlossary,
} from '../src/data/glossary.js';
import {
  ARTEFACT_RECORD_SCHEMA,
  ARTEFACT_TYPES,
  getArtefactTypeById,
  validateArtefactTypeManifest,
} from '../src/data/artefactTypes.js';

const EXPECTED_ACTIVITY_IDS = [
  'earth-in-different-forms',
  'locate-africa',
  'find-the-gambia',
  'equator-climate-patterns',
  'compare-uk-gambia',
  'journey-thread',
  'place-portrait',
  'understand-before-action',
];

test('all ten destinations are registered while Build 2 activates Atlas and Number Expedition', () => {
  assert.equal(DESTINATIONS.length, 10);
  assert.deepEqual(DESTINATIONS.map(({ ordinal }) => ordinal), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(new Set(DESTINATIONS.map(({ id }) => id)).size, 10);
  assert.deepEqual(getActiveDestinations().map(({ id }) => id), ['planet-atlas', 'number-expedition']);
  assert.equal(getDestinationById('planet-atlas')?.route, '#/atlas');
  assert.equal(getDestinationById('tides-of-change-studio')?.activationBuild, 10);
  assert.equal(getDestinationById('number-expedition')?.active, true);
  assert.equal(getDestinationById('number-expedition')?.route, '#/numbers');
});

test('Planet Atlas exposes exactly eight substantial guided pathways', () => {
  const atlasActivities = getActivitiesForDestination('planet-atlas');
  assert.deepEqual(atlasActivities.map(({ id }) => id), EXPECTED_ACTIVITY_IDS);
  assert.equal(new Set(atlasActivities.map(({ route }) => route)).size, 8);

  for (const activity of atlasActivities) {
    assert.equal(activity.active, true);
    assert.equal(activity.interactionModel, 'continuous');
    assert.ok(activity.enquiry.length > 20);
    assert.ok(activity.flow.notice.prompt);
    assert.ok(activity.flow.explore.actions.length > 1);
    assert.ok(activity.flow.make.product);
    assert.ok(activity.flow.explain.prompt);
    assert.ok(activity.flow.revisit.invitation);
    assert.ok(activity.outcome.artefactTypeId);
    assert.equal(activity.route, `#/activity/${activity.id}`);
  }
});

test('Number Expedition exposes exactly 28 Autumn 1 pathways in seven regions', () => {
  const numberActivities = getActivitiesForDestination('number-expedition');
  assert.equal(numberActivities.length, 28);
  assert.deepEqual(numberActivities.map(({ order }) => order), Array.from({ length: 28 }, (_, index) => index + 1));
  assert.equal(new Set(numberActivities.map(({ regionId }) => regionId)).size, 7);
  for (const activity of numberActivities) {
    assert.equal(activity.active, true);
    assert.ok(activity.curriculumObjective);
    assert.ok(activity.toolId);
    assert.ok(activity.keyCode);
    assert.ok(activity.keyCheck?.unscored);
    assert.ok(activity.outcome?.artefactTypeId);
  }
});

test('the permanent key manifest is valid, unique and complete', () => {
  const validation = validateKeyManifest(KEY_MANIFEST);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.equal(KEY_MANIFEST.length, 50);
  assert.equal(new Set(KEY_MANIFEST.map(({ code }) => code)).size, 50);
  assert.equal(KEY_MANIFEST.filter(({ type }) => type === KEY_TYPES.ACTIVITY).length, 36);
  assert.equal(KEY_MANIFEST.filter(({ type }) => type === KEY_TYPES.COLLECTION).length, 9);
  assert.equal(KEY_MANIFEST.filter(({ type }) => type === KEY_TYPES.DESTINATION).length, 2);
  assert.equal(KEY_MANIFEST.filter(({ type }) => type === KEY_TYPES.WORLD).length, 1);
  assert.equal(KEY_MANIFEST.filter(({ type }) => type === KEY_TYPES.MAINTENANCE).length, 2);

  for (const key of KEY_MANIFEST) {
    assert.match(key.code, /^\d{4}$/);
    assert.equal(isObviousKeyCode(key.code), false);
    assert.ok(key.printGuide?.purpose);
    assert.ok(Array.isArray(key.permissionsGranted));
    assert.ok(Array.isArray(key.activityIds));
  }
});

test('Find The Gambia permanently uses key 7318 and routes to the exact activity', () => {
  const key = getKeyByCode('7318');
  assert.equal(key?.id, 'key-atlas-find-the-gambia');
  assert.deepEqual(key.activityIds, ['find-the-gambia']);
  assert.deepEqual(key.permissionsGranted, ['activity:find-the-gambia']);
  assert.equal(key.route, '#/activity/find-the-gambia');
});

test('key validation rejects duplicates, malformed codes and obvious sequences', () => {
  const duplicate = KEY_MANIFEST.map((key, index) => index === 1
    ? { ...key, code: KEY_MANIFEST[0].code }
    : key);
  const malformed = KEY_MANIFEST.map((key, index) => index === 0 ? { ...key, code: '842' } : key);
  const obvious = KEY_MANIFEST.map((key, index) => index === 0 ? { ...key, code: '1234' } : key);

  assert.equal(validateKeyManifest(duplicate).valid, false);
  assert.match(validateKeyManifest(duplicate).errors.join(' '), /Duplicate key code/);
  assert.equal(validateKeyManifest(malformed).valid, false);
  assert.match(validateKeyManifest(malformed).errors.join(' '), /exactly four digits/);
  assert.equal(validateKeyManifest(obvious).valid, false);
  assert.match(validateKeyManifest(obvious).errors.join(' '), /obvious or repeated sequence/);
  assert.equal(isObviousKeyCode('1111'), true);
  assert.equal(isObviousKeyCode('4321'), true);
});

test('individual, collection and destination keys accumulate the expected pathways', () => {
  const individual = resolveKeyPermissions('7318');
  assert.deepEqual(individual.activityIds, ['find-the-gambia']);

  const collection = resolveKeyPermissions('2746');
  assert.deepEqual(collection.activityIds, [
    'earth-in-different-forms',
    'equator-climate-patterns',
    'find-the-gambia',
    'locate-africa',
  ]);

  const destination = resolveKeyPermissions('5392');
  assert.deepEqual(destination.activityIds, [...EXPECTED_ACTIVITY_IDS].sort());
  assert.deepEqual(destination.futureScopes, [{
    destinationId: 'planet-atlas',
    activityIds: ['*'],
    includeFuture: true,
  }]);

  const cumulative = resolveKeyPermissions(['7318', '8163']);
  assert.equal(cumulative.activityIds.includes('find-the-gambia'), true);
  assert.equal(cumulative.activityIds.includes('journey-thread'), true);
  assert.equal(new Set(cumulative.activityIds).size, cumulative.activityIds.length);
});

test('the whole-world wildcard resolves activities introduced in future builds', () => {
  const futureActivity = {
    id: 'future-number-model',
    destinationId: 'number-expedition',
    active: true,
  };
  const activities = [...ACTIVITIES, futureActivity];
  const world = resolveKeyPermissions('7046', { activities });
  const atlas = resolveKeyPermissions('5392', { activities });

  assert.equal(world.activityIds.includes('future-number-model'), true);
  assert.equal(atlas.activityIds.includes('future-number-model'), false);
  assert.deepEqual(world.futureScopes, [{
    destinationId: '*',
    activityIds: ['*'],
    includeFuture: true,
  }]);
});

test('the maintenance key grants only separated adult capabilities', () => {
  const maintenance = resolveKeyPermissions('4829');
  assert.deepEqual(maintenance.activityIds, []);
  assert.ok(maintenance.capabilities.includes('print-key-guide'));
  assert.ok(maintenance.capabilities.includes('clear-profile-work'));
  assert.ok(maintenance.capabilities.includes('clear-all-local-data'));
  assert.equal(maintenance.capabilities.includes('reset-everything'), false);
});

test('the curriculum manifest uses a complete shared record contract', () => {
  const validation = validateCurriculumManifest(CURRICULUM_RECORDS);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.deepEqual(
    [...new Set(CURRICULUM_RECORDS.map(({ subject }) => subject))].sort(),
    ['art-and-design', 'english', 'geography', 'mathematics', 'pshe', 'science'],
  );
  const mathematics = CURRICULUM_RECORDS.filter(({ subject }) => subject === 'mathematics');
  assert.equal(mathematics.length, 28);
  assert.ok(CURRICULUM_RECORDS.find(({ id }) => id === 'math-autumn-1-04')
    .objectives.some((objective) => objective.includes('non-standard ways')));
  assert.ok(CURRICULUM_RECORDS.find(({ id }) => id === 'geo-locate-africa-gambia')
    .likelyMisconceptions.some((idea) => idea.includes('Africa is one country')));
});

test('Tides of Change is fully registered for Build 10 without a Build 1 activity', () => {
  assert.equal(TIDES_OF_CHANGE_STAGES.length, 6);
  assert.deepEqual(TIDES_OF_CHANGE_STAGES.map(({ order }) => order), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(TIDES_OF_CHANGE_STAGES.map(({ artistIds }) => artistIds[0]), [
    'jmw-turner',
    'cornelia-parker',
    'olafur-eliasson',
    'agnes-denes',
    'katsushika-hokusai',
    'jmw-turner',
  ]);
  assert.equal(TIDES_OF_CHANGE_STAGES.at(-1).finalConstraints.physicalFormat, 'A3');
  assert.equal(TIDES_OF_CHANGE_STAGES.at(-1).finalConstraints.media, 'mixed media');
  assert.match(TIDES_OF_CHANGE_STAGES.at(-1).finalConstraints.artistStatementFrame, /My work is inspired by/);

  const artRecords = CURRICULUM_RECORDS.filter(({ subject }) => subject === 'art-and-design');
  assert.equal(artRecords.length, 6);
  assert.equal(artRecords.every(({ activeInBuild1 }) => activeInBuild1 === false), true);
  assert.equal(ACTIVITIES.some(({ destinationId }) => destinationId === 'tides-of-change-studio'), false);
});

test('artist and artwork-rights contracts prevent unapproved reproduction', () => {
  assert.ok(ARTIST_METADATA_SCHEMA.required.includes('focusConcepts'));
  assert.ok(ARTWORK_RIGHTS_SCHEMA.required.includes('licenceOrPermission'));
  assert.ok(ARTWORK_RIGHTS_SCHEMA.required.includes('displayApproved'));
  assert.equal(ARTWORK_REFERENCES.every(({ artworkImageIncluded }) => artworkImageIncluded === false), true);
  assert.equal(ARTWORK_REFERENCES.some(({ rightsAction }) => /before display/.test(rightsAction)), true);
});

test('the concept graph is valid and connects disciplines through explainable paths', () => {
  const validation = validateConceptGraph(CONCEPT_GRAPH);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.ok(findConceptPath('the-gambia', 'environmental-action'));
  assert.deepEqual(
    findConceptPath('climate-zone', 'negative-numbers', { directed: true }),
    ['climate-zone', 'biome', 'habitat', 'living-things', 'environmental-change', 'temperature', 'negative-numbers'],
  );
  assert.ok(getRelatedConcepts('human-impact').some(({ concept }) => concept.id === 'cornelia-parker'));
});

test('the visual glossary includes every Atlas term and every future art term', () => {
  const validation = validateGlossary(GLOSSARY);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  for (const term of REQUIRED_ATLAS_TERMS) {
    assert.ok(getGlossaryEntriesByTerm(term).some(({ domain }) => domain === 'geography'), `Missing Atlas term: ${term}`);
  }
  for (const term of REQUIRED_ART_TERMS) {
    assert.ok(getGlossaryEntriesByTerm(term).some(({ domain }) => domain === 'art'), `Missing art term: ${term}`);
  }
  assert.equal(getGlossaryEntriesByTerm('scale').length, 2);
  for (const entry of GLOSSARY) {
    assert.ok(entry.spokenPronunciation.speechText);
    assert.ok(entry.spokenPronunciation.guide);
    assert.ok(entry.definition);
    assert.ok(entry.visualExample.description);
    assert.ok(entry.contextualExample);
  }
});

test('the visual glossary activates the Number Expedition mathematical language', () => {
  for (const term of REQUIRED_MATHEMATICS_TERMS) {
    const matches = GLOSSARY.filter((entry) => entry.term === term && entry.domain === 'mathematics');
    assert.equal(matches.length, 1, `Expected one active mathematics glossary entry for ${term}`);
    assert.equal(matches[0].active, true);
    assert.equal(matches[0].activationBuild, 2);
  }
});

test('all activity outcomes use the shared artefact contract', () => {
  const validation = validateArtefactTypeManifest(ARTEFACT_TYPES);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.ok(ARTEFACT_RECORD_SCHEMA.required.includes('profileId'));
  assert.ok(ARTEFACT_RECORD_SCHEMA.fields.versionHistory);

  for (const activity of ACTIVITIES) {
    assert.ok(getArtefactTypeById(activity.outcome.artefactTypeId), `Unknown outcome type for ${activity.id}`);
  }
});

test('Build 10 physical-art and sketchbook artefact contracts are present but inactive', () => {
  const requiredArtTypes = [
    'artist-observation',
    'movement-study',
    'texture-study',
    'colour-study',
    'composition-thumbnail',
    'media-experiment',
    'a4-plan',
    'final-artwork',
    'artist-statement',
    'artist-influence-record',
    'physical-sketchbook-photograph',
  ];

  for (const id of requiredArtTypes) {
    const type = getArtefactTypeById(id);
    assert.ok(type, `Missing art artefact type: ${id}`);
    assert.equal(type.active, false);
    assert.equal(type.activationBuild, 10);
    assert.equal(type.supportsPhysicalWork, true);
  }
  assert.equal(getArtefactTypeById('final-artwork').fixedConstraints.format, 'A3');
  assert.equal(getArtefactTypeById('physical-sketchbook-photograph').binaryStorage, 'indexeddb');
});
