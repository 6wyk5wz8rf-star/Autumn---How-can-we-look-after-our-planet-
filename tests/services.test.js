import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STORES,
  getRecord,
  putRecord,
  resetDatabaseConnection,
} from '../src/services/db.js';
import { createProfile, getActiveProfile, listProfiles, setActiveProfile } from '../src/services/profiles.js';
import { grantKey, listActivityAccess, syncGrantedActivities } from '../src/services/keyAccess.js';
import {
  addPlanetQuestionResponse,
  createArtefact,
  duplicateArtefact,
  getActivityState,
  getArtefactVersions,
  listArtefacts,
  listPlanetQuestionResponses,
  saveActivityState,
  updateArtefact,
} from '../src/services/artefacts.js';
import { createBackup, importBackup, inspectBackup } from '../src/services/backup.js';
import { getSettings, updateSettings } from '../src/services/settings.js';
import { KEY_MANIFEST } from '../src/data/keys.js';
import { PLANET_ATLAS_ACTIVITIES } from '../src/data/activities.js';

async function freshDatabase(name) {
  await resetDatabaseConnection({ databaseName: `our-planet-test-${name}`, clearMemory: true });
}

function key(id) {
  return KEY_MANIFEST.find((entry) => entry.id === id);
}

test('local learner profiles remain separate and the active profile survives service calls', async () => {
  await freshDatabase('profiles');
  const aria = await createProfile({ displayName: 'Aria', symbol: 'globe', pattern: 'ripples' });
  const ben = await createProfile({ displayName: 'Ben', symbol: 'leaf', pattern: 'contours' });
  assert.equal((await listProfiles()).length, 2);
  await setActiveProfile(ben.id);
  assert.equal((await getActiveProfile()).displayName, 'Ben');
  assert.notEqual(aria.id, ben.id);
});

test('collection, destination and whole-world grants accumulate without crossing profiles', async () => {
  await freshDatabase('keys');
  const first = await createProfile({ displayName: 'First' });
  const second = await createProfile({ displayName: 'Second' });

  await grantKey(first.id, key('key-collection-map-foundations'), { activities: PLANET_ATLAS_ACTIVITIES });
  assert.equal((await listActivityAccess(first.id)).length, 4);
  assert.equal((await listActivityAccess(second.id)).length, 0);

  await grantKey(first.id, key('key-destination-planet-atlas'), { activities: PLANET_ATLAS_ACTIVITIES });
  assert.equal((await syncGrantedActivities(first.id, PLANET_ATLAS_ACTIVITIES)).length, 8);

  await grantKey(second.id, key('key-world-all-pathways'), { activities: PLANET_ATLAS_ACTIVITIES });
  const futureActivity = {
    id: 'future-number-expedition-pathway',
    destinationId: 'number-expedition',
    title: 'Future number pathway',
    route: '/number-expedition/future',
  };
  const futureAccess = await syncGrantedActivities(second.id, [...PLANET_ATLAS_ACTIVITIES, futureActivity]);
  assert.equal(futureAccess.length, 9);
  assert.ok(futureAccess.some((record) => record.activityId === futureActivity.id));
});

test('shared artefacts preserve versions, duplicate safely and append Planet Question responses', async () => {
  await freshDatabase('work');
  const learner = await createProfile({ displayName: 'Mina' });
  const other = await createProfile({ displayName: 'Other' });
  const created = await createArtefact(learner.id, {
    destinationId: 'planet-atlas',
    activityId: 'place-portrait',
    title: 'The Gambia · Place Portrait',
    artefactType: 'place-portrait',
    structuredContent: {
      placeId: 'gambia',
      selectedEvidence: ['river', 'coastline'],
      observation: 'The river and country share a close shape.',
    },
  });

  const revised = await updateArtefact(learner.id, created.id, {
    writtenExplanation: 'The Atlantic coast, Senegal and the river help locate the country.',
  }, { reason: 'revisited after teaching' });
  assert.equal(revised.version, 2);
  assert.equal((await getArtefactVersions(learner.id, created.id)).length, 2);

  const copy = await duplicateArtefact(learner.id, created.id);
  assert.notEqual(copy.id, created.id);
  assert.equal((await listArtefacts(learner.id)).length, 2);
  assert.equal((await listArtefacts(other.id)).length, 0);

  await addPlanetQuestionResponse(learner.id, { shortText: 'Understand the place before choosing an action.' });
  await addPlanetQuestionResponse(learner.id, { shortText: 'Use map and community evidence together.', linkedArtefactIds: [created.id] });
  const responses = await listPlanetQuestionResponses(learner.id);
  assert.equal(responses.length, 2);
  assert.notEqual(responses[0].id, responses[1].id);
});

test('unfinished activity state and accessibility settings are durable per learner', async () => {
  await freshDatabase('drafts');
  const learner = await createProfile({ displayName: 'Kai' });
  await saveActivityState(learner.id, 'journey-thread', { step: 2, observation: 'The line crosses the Atlantic.' }, { destinationId: 'planet-atlas' });
  assert.equal((await getActivityState(learner.id, 'journey-thread')).state.step, 2);

  const settings = await updateSettings({ scaffold: 'strong', textScale: 1.3, reducedMotion: true }, { profileId: learner.id });
  assert.equal(settings.scaffold, 'strong');
  assert.equal((await getSettings(learner.id)).reducedMotion, true);
});

test('backup inspection and merge import preserve validated records', async () => {
  await freshDatabase('backup-source');
  await createProfile({ displayName: 'Backup Learner' });
  const backup = await createBackup({ appVersion: 'test' });
  const inspection = await inspectBackup(backup);
  assert.equal(inspection.formatVersion, 1);
  assert.equal(inspection.rejected.length, 0);

  await freshDatabase('backup-target');
  const result = await importBackup(backup, { mode: 'merge' });
  assert.equal(result.partial, false);
  assert.equal((await listProfiles()).length, 1);
});

test('legacy local response links are repaired as arrays and malformed drafts are quarantined', async () => {
  await freshDatabase('malformed-local');
  const learner = await createProfile({ displayName: 'Recovery Learner' });
  const createdAt = new Date().toISOString();
  const responseId = 'planet-response:legacy-local';
  await putRecord(STORES.PLANET_RESPONSES, {
    id: responseId,
    profileId: learner.id,
    question: 'How can we look after our planet?',
    shortText: 'Use evidence from saved work.',
    visualIdeas: 'legacy-single-idea',
    linkedArtefactIds: 'artefact:legacy-map',
    evidence: 'artefact:legacy-comparison',
    createdAt,
    schemaVersion: 1,
  });

  const [recovered] = await listPlanetQuestionResponses(learner.id);
  assert.deepEqual(recovered.linkedArtefactIds, [
    'artefact:legacy-map',
    'artefact:legacy-comparison',
  ]);
  assert.deepEqual(recovered.evidence, recovered.linkedArtefactIds);
  assert.deepEqual(recovered.visualIdeas, []);
  const repairedRecord = await getRecord(STORES.PLANET_RESPONSES, responseId);
  assert.ok(Array.isArray(repairedRecord.linkedArtefactIds));
  assert.ok(Array.isArray(repairedRecord.evidence));

  const created = await addPlanetQuestionResponse(learner.id, {
    shortText: 'A current response with one linked piece.',
    evidence: 'artefact:current-map',
  });
  assert.deepEqual(created.linkedArtefactIds, ['artefact:current-map']);
  assert.deepEqual(created.evidence, ['artefact:current-map']);

  const stateId = `state:${learner.id}:journey-thread`;
  await putRecord(STORES.ACTIVITY_STATE, {
    id: stateId,
    profileId: learner.id,
    activityId: 'journey-thread',
    destinationId: 'planet-atlas',
    state: 'legacy string that must never reach the activity view',
    createdAt,
    updatedAt: createdAt,
    schemaVersion: 1,
  });
  assert.equal(await getActivityState(learner.id, 'journey-thread'), null);
  assert.equal(await getRecord(STORES.ACTIVITY_STATE, stateId), undefined);
  await assert.rejects(
    saveActivityState(learner.id, 'journey-thread', ['not', 'an', 'object']),
    /plain object/,
  );
});

test('backup inspection and import reject malformed response links and activity payloads', async () => {
  await freshDatabase('malformed-import-source');
  const learner = await createProfile({ displayName: 'Import Recovery Learner' });
  const backup = await createBackup({ appVersion: 'malformed-import-test' });
  delete backup.integrity;
  const timestamp = new Date().toISOString();
  backup.stores[STORES.PLANET_RESPONSES].push({
    id: 'planet-response:bad-import',
    profileId: learner.id,
    question: 'How can we look after our planet?',
    shortText: 'This record uses a malformed link envelope.',
    text: 'This record uses a malformed link envelope.',
    visualIdeas: [],
    linkedArtefactIds: 'artefact:not-an-array',
    evidence: [],
    createdAt: timestamp,
    schemaVersion: 1,
  });
  backup.stores[STORES.ACTIVITY_STATE].push({
    id: `state:${learner.id}:journey-thread`,
    profileId: learner.id,
    activityId: 'journey-thread',
    destinationId: 'planet-atlas',
    state: ['array payloads are not activity state'],
    createdAt: timestamp,
    updatedAt: timestamp,
    schemaVersion: 1,
  });

  const inspection = await inspectBackup(backup);
  assert.equal(inspection.rejected.length, 2);
  assert.deepEqual(
    inspection.rejected.map((record) => record.storeName).sort(),
    [STORES.ACTIVITY_STATE, STORES.PLANET_RESPONSES].sort(),
  );

  await freshDatabase('malformed-import-target');
  const result = await importBackup(backup, { mode: 'merge' });
  assert.equal(result.partial, true);
  assert.equal(result.importedCounts[STORES.PLANET_RESPONSES], 0);
  assert.equal(result.importedCounts[STORES.ACTIVITY_STATE], 0);
  const [importedProfile] = await listProfiles();
  assert.equal((await listPlanetQuestionResponses(importedProfile.id)).length, 0);
  assert.equal(await getActivityState(importedProfile.id, 'journey-thread'), null);
});
