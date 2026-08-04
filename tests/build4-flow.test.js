import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { renderNavigation } from '../src/components/AppShell.js';
import { renderGlossary, renderHomeView, renderKeyEntryView, renderKeysView, renderWorkView } from '../src/app/views.js';
import { DESTINATIONS, getActiveDestinations } from '../src/data/destinations.js';
import { CLIMATE_ACTIVITIES } from '../src/data/climate.js';
import { ACTIVITIES } from '../src/data/activities.js';
import { KEY_MANIFEST } from '../src/data/keys.js';
import { createTeacherKeyLibrary } from '../src/teacher/teacherKeyLibrary.js';
import { renderTeacherKeyRoom } from '../src/teacher/TeacherKeyRoom.js';
import { DATABASE_VERSION, STORES, resetDatabaseConnection } from '../src/services/db.js';
import { createProfile } from '../src/services/profiles.js';
import { defaultFlowPreferences, getFlowPreferences, updateFlowPreferences } from '../src/services/flowPreferences.js';
import { GLOSSARY } from '../src/data/glossary.js';

function documentFor(markup) {
  return new JSDOM(`<!doctype html><body>${markup}</body>`).window.document;
}

test('the child shell has exactly four top-level choices in every destination context', () => {
  const document = documentFor(renderNavigation('climate-tool'));
  const labels = [...document.querySelectorAll('.primary-nav [data-route]')].map((button) => button.textContent.trim());
  assert.deepEqual(labels, ['Our Planet', 'My Keys', 'My Work', 'Enter a Key']);
  assert.equal(document.querySelectorAll('[aria-current="page"]').length, 1);
  assert.equal(document.querySelector('[data-route="home"]').getAttribute('aria-current'), 'page');
});

test('Our Planet presents only four working destinations and at most one continuation', () => {
  const html = renderHomeView({
    profile: { displayName: 'Mina' },
    recentActivity: CLIMATE_ACTIVITIES[0],
    recentWork: { id: 'recent-climate', title: 'My climate pattern' },
    workCount: 8,
  });
  const document = documentFor(html);
  assert.equal(document.querySelectorAll('.destination-landmark').length, 4);
  assert.deepEqual([...document.querySelectorAll('.destination-landmark strong')].map(({ textContent }) => textContent), getActiveDestinations().map(({ title }) => title));
  assert.equal(document.querySelectorAll('.continue-invitation').length, 1);
  assert.doesNotMatch(document.body.textContent, /coming soon|build \d|locked|padlock/i);
  assert.equal(document.querySelectorAll('.today-key-invitation [data-route="key"]').length, 1);
});

test('every active destination exposes no more than four primary modes and future places stay registry-only', () => {
  assert.equal(getActiveDestinations().length, 4);
  for (const destination of getActiveDestinations()) assert.equal(destination.primaryModes.length, 4);
  const materials = DESTINATIONS.find(({ id }) => id === 'materials-river');
  assert.equal(materials.active, false);
  assert.ok(materials.extensionPoints.includes('repair'));
  assert.equal(Object.hasOwn(materials, 'tools'), false);
});

test('My Keys, My Work and Today’s Key use the simplified library contracts', () => {
  const access = CLIMATE_ACTIVITIES.slice(0, 3).map((activity, index) => ({ activityId: activity.id, lastVisitedAt: `2026-08-0${index + 1}T12:00:00.000Z` }));
  const keysDocument = documentFor(renderKeysView({ activities: ACTIVITIES, access, artifacts: [] }));
  assert.equal(keysDocument.querySelectorAll('.key-continue').length, 1);
  assert.equal(keysDocument.querySelectorAll('[data-key-environment]').length, 1);
  assert.ok(keysDocument.querySelector('[data-key-library-search]'));
  assert.doesNotMatch(keysDocument.body.textContent, /3759|6417|9281|percentage|overdue/i);

  const workDocument = documentFor(renderWorkView({ artifacts: [], responses: [], activeFilter: 'recent' }));
  assert.deepEqual([...workDocument.querySelectorAll('[data-work-filter]')].map(({ textContent }) => textContent), ['Recent', 'By Place', 'My Planet Thinking']);

  const keyDocument = documentFor(renderKeyEntryView());
  assert.match(keyDocument.body.textContent, /opens after the fourth digit/i);
  assert.doesNotMatch(keyDocument.body.textContent, /key type|confirm|submit/i);
});

test('the shared glossary removes duplicate cards and prefers the current destination context', () => {
  const document = documentFor(renderGlossary(GLOSSARY, { preferredDomain: 'climate' }));
  const terms = [...document.querySelectorAll('[data-glossary-entry]')].map((entry) => entry.dataset.glossaryEntry.toLowerCase());
  assert.equal(terms.length, new Set(terms).size);
  const climate = document.querySelector('[data-glossary-entry="climate"]');
  assert.match(climate.textContent, /longer time|long-term/i);
  assert.match(climate.querySelector('.glossary-more').textContent, /Say it|Picture it|Related/i);
});

test('8584 begins with favourites, recent codes and four destination filters—not a code wall', () => {
  const entries = createTeacherKeyLibrary(KEY_MANIFEST, { destinations: DESTINATIONS });
  const html = renderTeacherKeyRoom({ entries, favouriteIds: [entries[0].id], recentDisplayedKeyIds: [entries[1].id], filters: { environment: 'none' } });
  const document = documentFor(html);
  assert.equal(document.querySelectorAll('.teacher-environment-shortcuts button').length, 4);
  assert.equal(document.querySelectorAll('[data-teacher-key-id]').length, 0);
  assert.match(document.body.textContent, /Choose a destination or search/);
  assert.match(document.body.textContent, /Quick Keys/);
  assert.match(document.body.textContent, /Recent Codes/);
  assert.match(document.body.textContent, /Return to Children’s View/);
});

test('Build 4 migration is additive and flow preferences remain profile-separated', async () => {
  assert.equal(DATABASE_VERSION, 4);
  assert.deepEqual(Object.keys(STORES).sort(), ['ACTIVITY_STATE', 'ARTEFACTS', 'ARTEFACT_VERSIONS', 'KEY_ACCESS', 'KEY_GRANTS', 'METADATA', 'PLANET_RESPONSES', 'PROFILES'].sort());
  await resetDatabaseConnection({ databaseName: 'our-planet-build4-flow-preferences', clearMemory: true });
  const first = await createProfile({ displayName: 'First' });
  const second = await createProfile({ displayName: 'Second' });
  await updateFlowPreferences(first.id, { recentDestinationId: 'climate-laboratory', recentRoute: { name: 'climate-tool', params: { toolId: 'pattern-viewer' } }, myWorkView: 'by-place' });
  const firstPreferences = await getFlowPreferences(first.id);
  const secondPreferences = await getFlowPreferences(second.id);
  assert.equal(firstPreferences.recentDestinationId, 'climate-laboratory');
  assert.equal(firstPreferences.myWorkView, 'by-place');
  assert.deepEqual(secondPreferences, defaultFlowPreferences());
});
