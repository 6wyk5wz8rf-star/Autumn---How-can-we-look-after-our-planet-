import { STORES, getMetadata, getRecord, setMetadata } from './db.js';

export const FLOW_PREFERENCES_SCHEMA_VERSION = 1;

export function defaultFlowPreferences() {
  return {
    schemaVersion: FLOW_PREFERENCES_SCHEMA_VERSION,
    recentDestinationId: null,
    recentRoute: null,
    myKeysView: 'by-destination',
    myWorkView: 'recent',
  };
}

function metadataKey(profileId) {
  return `flow:profile:${String(profileId)}`;
}

function sanitise(value = {}) {
  const defaults = defaultFlowPreferences();
  const allowedWorkViews = new Set(['recent', 'by-place', 'planet-thinking']);
  return {
    ...defaults,
    recentDestinationId: typeof value.recentDestinationId === 'string' ? value.recentDestinationId : null,
    recentRoute: value.recentRoute && typeof value.recentRoute.name === 'string'
      ? { name: value.recentRoute.name, params: { ...(value.recentRoute.params || {}) } }
      : null,
    myKeysView: value.myKeysView === 'by-destination' ? value.myKeysView : defaults.myKeysView,
    myWorkView: allowedWorkViews.has(value.myWorkView) ? value.myWorkView : defaults.myWorkView,
  };
}

async function requireProfile(profileId) {
  const profile = await getRecord(STORES.PROFILES, String(profileId || ''));
  if (!profile) throw new Error('The learner profile could not be found');
  return profile;
}

export async function getFlowPreferences(profileId) {
  await requireProfile(profileId);
  return Object.freeze(sanitise(await getMetadata(metadataKey(profileId), {})));
}

export async function updateFlowPreferences(profileId, patch = {}) {
  await requireProfile(profileId);
  const current = await getMetadata(metadataKey(profileId), {});
  const next = sanitise({ ...current, ...patch });
  await setMetadata(metadataKey(profileId), next);
  return Object.freeze(next);
}
