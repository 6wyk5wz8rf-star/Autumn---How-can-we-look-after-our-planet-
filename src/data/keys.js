import { ACTIVITIES } from './activities.js';
import { DESTINATIONS } from './destinations.js';
import { parseRoute } from '../utils/router.js';

/**
 * Permanent four-digit Key manifest.
 *
 * Codes and IDs are persistence contracts. Once released they must not be
 * reassigned. Open exploration never consults this manifest; keys only remember
 * and route to especially useful guided pathways.
 */

export const KEY_TYPES = Object.freeze({
  ACTIVITY: 'activity',
  COLLECTION: 'collection',
  DESTINATION: 'destination',
  WORLD: 'world',
  MAINTENANCE: 'maintenance',
});

const activityGrant = (activityIds, includeFuture = false) => ({
  resource: 'key-activity',
  destinationId: 'planet-atlas',
  activityIds,
  includeFuture,
});

const activityKey = ({ code, id, activityId, title, description, curriculumTags, outcome, quickUse = true }) => ({
  code,
  id,
  type: KEY_TYPES.ACTIVITY,
  destinationId: 'planet-atlas',
  destination: 'planet-atlas',
  activityIds: [activityId],
  permissionsGranted: [`activity:${activityId}`],
  grants: [activityGrant([activityId])],
  route: `#/activity/${activityId}`,
  title,
  childFacingTitle: title,
  description,
  curriculumTags,
  savedOutcomeType: outcome,
  active: true,
  printGuide: {
    group: 'Planet Atlas activities',
    quickUse,
    purpose: description,
    usefulMoments: ['encounter', 'during-teaching', 'after-teaching', 'revisit'],
    expectedOutcome: outcome,
    displayCard: true,
  },
});

export const KEY_MANIFEST = Object.freeze([
  activityKey({
    code: '5842',
    id: 'key-atlas-earth-different-forms',
    activityId: 'earth-in-different-forms',
    title: 'Earth in Different Forms',
    description: 'Compare a globe, flat world map and close atlas view.',
    curriculumTags: ['maps-atlases-globes', 'representation', 'scale'],
    outcome: 'three-view-comparison',
  }),
  activityKey({
    code: '2967',
    id: 'key-atlas-locate-africa',
    activityId: 'locate-africa',
    title: 'Locate Africa',
    description: 'Locate Africa using coastlines, oceans and nearby continents as evidence.',
    curriculumTags: ['africa', 'continents', 'map-evidence'],
    outcome: 'annotated-location-card',
  }),
  activityKey({
    code: '7318',
    id: 'key-atlas-find-the-gambia',
    activityId: 'find-the-gambia',
    title: 'Find The Gambia',
    description: 'Follow a scale-preserving trail from Earth to The Gambia.',
    curriculumTags: ['the-gambia', 'west-africa', 'scale', 'location'],
    outcome: 'place-pin',
  }),
  activityKey({
    code: '4139',
    id: 'key-atlas-equator-climate-patterns',
    activityId: 'equator-climate-patterns',
    title: 'The Equator and Broad Climate Patterns',
    description: 'Use the equator to notice broad patterns while considering other climate influences.',
    curriculumTags: ['equator', 'climate-zones', 'latitude', 'biomes'],
    outcome: 'climate-pattern-observation',
  }),
  activityKey({
    code: '8625',
    id: 'key-atlas-compare-uk-gambia',
    activityId: 'compare-uk-gambia',
    title: 'Compare the United Kingdom and The Gambia',
    description: 'Compare two countries using visible geographical evidence.',
    curriculumTags: ['place-comparison', 'united-kingdom', 'the-gambia'],
    outcome: 'two-place-comparison',
  }),
  activityKey({
    code: '3471',
    id: 'key-atlas-journey-thread',
    activityId: 'journey-thread',
    title: 'Journey Thread',
    description: 'Create and revise a route using direction, approximate distance and world features.',
    curriculumTags: ['digital-mapping', 'direction', 'distance', 'journeys'],
    outcome: 'journey-thread',
  }),
  activityKey({
    code: '9256',
    id: 'key-atlas-place-portrait',
    activityId: 'place-portrait',
    title: 'Place Portrait',
    description: 'Build a revisable profile from selected geographical evidence.',
    curriculumTags: ['place-knowledge', 'climate', 'physical-features', 'habitats'],
    outcome: 'place-portrait',
  }),
  activityKey({
    code: '6084',
    id: 'key-atlas-understanding-place',
    activityId: 'understand-before-action',
    title: 'Looking After a Place Begins with Understanding It',
    description: 'Test an environmental action against evidence about a particular place and community.',
    curriculumTags: ['environmental-change', 'community', 'evidence', 'consequences'],
    outcome: 'planet-question-response',
  }),
  {
    code: '2746',
    id: 'key-collection-map-foundations',
    type: KEY_TYPES.COLLECTION,
    destinationId: 'planet-atlas',
    destination: 'planet-atlas',
    activityIds: [
      'earth-in-different-forms',
      'locate-africa',
      'find-the-gambia',
      'equator-climate-patterns',
    ],
    permissionsGranted: [
      'activity:earth-in-different-forms',
      'activity:locate-africa',
      'activity:find-the-gambia',
      'activity:equator-climate-patterns',
    ],
    grants: [activityGrant([
      'earth-in-different-forms',
      'locate-africa',
      'find-the-gambia',
      'equator-climate-patterns',
    ])],
    route: '#/keys',
    title: 'Map Foundations',
    childFacingTitle: 'Map Foundations',
    description: 'A coherent set for representations, Africa, The Gambia and the equator.',
    curriculumTags: ['maps-atlases-globes', 'africa', 'the-gambia', 'equator'],
    savedOutcomeType: null,
    active: true,
    printGuide: {
      group: 'Collections and larger keys',
      quickUse: true,
      purpose: 'Add four linked map-foundation pathways.',
      usefulMoments: ['encounter', 'during-teaching', 'revisit'],
      expectedOutcome: 'Four revisable Atlas outcomes',
      displayCard: true,
    },
  },
  {
    code: '8163',
    id: 'key-collection-place-evidence',
    type: KEY_TYPES.COLLECTION,
    destinationId: 'planet-atlas',
    destination: 'planet-atlas',
    activityIds: [
      'compare-uk-gambia',
      'journey-thread',
      'place-portrait',
      'understand-before-action',
    ],
    permissionsGranted: [
      'activity:compare-uk-gambia',
      'activity:journey-thread',
      'activity:place-portrait',
      'activity:understand-before-action',
    ],
    grants: [activityGrant([
      'compare-uk-gambia',
      'journey-thread',
      'place-portrait',
      'understand-before-action',
    ])],
    route: '#/keys',
    title: 'Places, Journeys and Evidence',
    childFacingTitle: 'Places, Journeys and Evidence',
    description: 'A set for comparing, connecting, portraying and making informed decisions about places.',
    curriculumTags: ['place-comparison', 'journeys', 'place-knowledge', 'environmental-action'],
    savedOutcomeType: null,
    active: true,
    printGuide: {
      group: 'Collections and larger keys',
      quickUse: false,
      purpose: 'Add four linked place-and-evidence pathways.',
      usefulMoments: ['during-teaching', 'after-teaching', 'revisit'],
      expectedOutcome: 'Four revisable Atlas outcomes',
      displayCard: true,
    },
  },
  {
    code: '5392',
    id: 'key-destination-planet-atlas',
    type: KEY_TYPES.DESTINATION,
    destinationId: 'planet-atlas',
    destination: 'planet-atlas',
    activityIds: [],
    permissionsGranted: ['destination:planet-atlas:*'],
    grants: [activityGrant(['*'], true)],
    route: '#/atlas',
    title: 'Every Planet Atlas Pathway',
    childFacingTitle: 'Every Planet Atlas Pathway',
    description: 'Add every current and future Planet Atlas Key Activity to My Keys.',
    curriculumTags: ['planet-atlas'],
    savedOutcomeType: null,
    active: true,
    printGuide: {
      group: 'Collections and larger keys',
      quickUse: false,
      purpose: 'Remember every Planet Atlas guided pathway.',
      usefulMoments: ['revisit'],
      expectedOutcome: 'All Planet Atlas pathways in My Keys',
      displayCard: true,
    },
  },
  {
    code: '7046',
    id: 'key-world-all-pathways',
    type: KEY_TYPES.WORLD,
    destinationId: '*',
    destination: '*',
    activityIds: [],
    permissionsGranted: ['world:*'],
    grants: [{
      resource: 'key-activity',
      destinationId: '*',
      activityIds: ['*'],
      includeFuture: true,
    }],
    route: '#/home',
    title: 'Every Guided Pathway',
    childFacingTitle: 'Every Guided Pathway',
    description: 'Add every current and future Key Activity across the whole world.',
    curriculumTags: ['whole-world'],
    savedOutcomeType: null,
    active: true,
    printGuide: {
      group: 'Collections and larger keys',
      quickUse: false,
      purpose: 'Remember all guided pathways, including those activated in later builds.',
      usefulMoments: ['revisit'],
      expectedOutcome: 'All current and future pathways in My Keys',
      displayCard: false,
    },
  },
  {
    code: '4829',
    id: 'key-maintenance-adult-utility',
    type: KEY_TYPES.MAINTENANCE,
    destinationId: null,
    destination: null,
    activityIds: [],
    permissionsGranted: [],
    grants: [{
      resource: 'adult-utility',
      capabilities: [
        'print-key-guide',
        'export-backup',
        'import-backup',
        'inspect-local-profiles',
        'add-key-to-device-profiles',
        'reset-profile-keys',
        'clear-profile-work',
        'reset-demonstration-data',
        'clear-all-local-data',
      ],
    }],
    route: '#/maintenance',
    title: 'Adult Utility',
    childFacingTitle: 'Adult Utility',
    description: 'Open the discreet, device-local adult utility.',
    curriculumTags: [],
    savedOutcomeType: null,
    active: true,
    printGuide: {
      group: 'Adult utility',
      quickUse: false,
      purpose: 'Open backup, print and carefully separated maintenance actions.',
      usefulMoments: ['adult-maintenance'],
      expectedOutcome: 'No learner outcome',
      displayCard: false,
    },
  },
]);

const KEY_CODE_PATTERN = /^\d{4}$/;
const ALLOWED_TYPES = new Set(Object.values(KEY_TYPES));

/** Normalise a code entered through either the touch keypad or a keyboard. */
export function normaliseKeyCode(code) {
  return String(code ?? '').replace(/\s+/g, '');
}

/** True only for exactly four decimal digits. */
export function isFourDigitKeyCode(code) {
  return KEY_CODE_PATTERN.test(normaliseKeyCode(code));
}

/** Reject deliberately guessable sequences in addition to four repeated digits. */
export function isObviousKeyCode(code) {
  const value = normaliseKeyCode(code);
  if (!isFourDigitKeyCode(value)) return false;
  const digits = [...value].map(Number);
  if (new Set(digits).size === 1) return true;
  const steps = digits.slice(1).map((digit, index) => digit - digits[index]);
  return steps.every((step) => step === 1) || steps.every((step) => step === -1);
}

/** Find an active manifest entry without introducing routing or storage side effects. */
export function getKeyByCode(code, manifest = KEY_MANIFEST) {
  const normalised = normaliseKeyCode(code);
  return manifest.find((key) => key.active !== false && key.code === normalised) ?? null;
}

/** Find a key by either stable ID or four-digit code. */
export function getKeyByReference(reference, manifest = KEY_MANIFEST) {
  if (reference && typeof reference === 'object' && Array.isArray(reference.grants)) return reference;
  const value = normaliseKeyCode(reference);
  return manifest.find((key) => key.id === reference || key.code === value) ?? null;
}

/** Does one structured grant include this activity record? */
export function grantIncludesActivity(grant, activity) {
  if (!grant || grant.resource !== 'key-activity' || !activity) return false;
  const destinationMatches = grant.destinationId === '*' || grant.destinationId === activity.destinationId;
  const activityMatches = grant.activityIds?.includes('*') || grant.activityIds?.includes(activity.id);
  return Boolean(destinationMatches && activityMatches);
}

/**
 * Resolve one or more accumulated keys against the currently registered
 * activities. Wildcard scopes are returned as well as expanded activity IDs so
 * persisted world/destination keys continue to grant later-build activities.
 */
export function resolveKeyPermissions(
  keyReferences,
  { manifest = KEY_MANIFEST, activities = ACTIVITIES } = {},
) {
  const references = Array.isArray(keyReferences) ? keyReferences : [keyReferences];
  const keys = [];
  const unresolved = [];

  for (const reference of references.filter((item) => item != null)) {
    const key = getKeyByReference(reference, manifest);
    if (key?.active !== false) keys.push(key);
    else unresolved.push(reference);
  }

  const activityIds = new Set();
  const capabilities = new Set();
  const futureScopes = new Map();

  for (const key of keys) {
    for (const grant of key.grants) {
      if (grant.resource === 'key-activity') {
        for (const activity of activities) {
          if (activity.active !== false && grantIncludesActivity(grant, activity)) {
            activityIds.add(activity.id);
          }
        }
        if (grant.includeFuture) {
          const scope = `${grant.destinationId}:${grant.activityIds.join(',')}`;
          futureScopes.set(scope, {
            destinationId: grant.destinationId,
            activityIds: [...grant.activityIds],
            includeFuture: true,
          });
        }
      }

      if (grant.resource === 'adult-utility') {
        for (const capability of grant.capabilities ?? []) capabilities.add(capability);
      }
    }
  }

  return {
    keyIds: [...new Set(keys.map((key) => key.id))],
    activityIds: [...activityIds].sort(),
    futureScopes: [...futureScopes.values()],
    capabilities: [...capabilities].sort(),
    unresolved,
  };
}

/**
 * Validate a candidate manifest without mutating it or throwing. This is used at
 * build/test time and by safe migrations before accepting changed key data.
 */
export function validateKeyManifest(
  manifest,
  { activities = ACTIVITIES, destinations = DESTINATIONS } = {},
) {
  const errors = [];
  if (!Array.isArray(manifest)) {
    return { valid: false, errors: ['Key manifest must be an array.'] };
  }

  const seenCodes = new Set();
  const seenIds = new Set();
  const activityIds = new Set(activities.map((activity) => activity.id));
  const destinationIds = new Set(destinations.map((destination) => destination.id));

  for (const [index, key] of manifest.entries()) {
    const label = key?.id || `entry ${index}`;
    if (!key || typeof key !== 'object') {
      errors.push(`Key ${label} must be an object.`);
      continue;
    }
    if (!key.id || typeof key.id !== 'string') errors.push(`Key ${label} needs a stable string ID.`);
    if (seenIds.has(key.id)) errors.push(`Duplicate key ID: ${key.id}.`);
    seenIds.add(key.id);

    if (!isFourDigitKeyCode(key.code)) errors.push(`Key ${label} must use exactly four digits.`);
    if (isObviousKeyCode(key.code)) errors.push(`Key ${label} uses an obvious or repeated sequence.`);
    if (seenCodes.has(key.code)) errors.push(`Duplicate key code: ${key.code}.`);
    seenCodes.add(key.code);

    if (!ALLOWED_TYPES.has(key.type)) errors.push(`Key ${label} has unknown type ${key.type}.`);
    if (!Array.isArray(key.grants) || key.grants.length === 0) errors.push(`Key ${label} must declare grants.`);
    if (!key.route || typeof key.route !== 'string') errors.push(`Key ${label} needs a route.`);
    if (typeof key.route === 'string') {
      const parsed = parseRoute(key.route);
      const expectedRoute = ({
        [KEY_TYPES.ACTIVITY]: 'activity',
        [KEY_TYPES.COLLECTION]: 'keys',
        [KEY_TYPES.DESTINATION]: 'atlas',
        [KEY_TYPES.WORLD]: 'home',
        [KEY_TYPES.MAINTENANCE]: 'maintenance',
      })[key.type];
      if (parsed.name !== expectedRoute) errors.push(`Key ${label} route does not resolve to ${expectedRoute}.`);
      if (key.type === KEY_TYPES.ACTIVITY && parsed.params.activityId !== key.activityIds?.[0]) {
        errors.push(`Key ${label} route does not resolve to its activity.`);
      }
    }
    if (!key.childFacingTitle) errors.push(`Key ${label} needs a child-facing title.`);
    if (!key.printGuide) errors.push(`Key ${label} needs printable-guide information.`);

    if (key.destinationId && key.destinationId !== '*' && !destinationIds.has(key.destinationId)) {
      errors.push(`Key ${label} refers to unknown destination ${key.destinationId}.`);
    }

    for (const grant of key.grants ?? []) {
      if (grant.resource === 'key-activity') {
        if (!Array.isArray(grant.activityIds) || grant.activityIds.length === 0) {
          errors.push(`Key ${label} has an empty activity grant.`);
        }
        if (grant.destinationId !== '*' && !destinationIds.has(grant.destinationId)) {
          errors.push(`Key ${label} grants unknown destination ${grant.destinationId}.`);
        }
        for (const activityId of grant.activityIds ?? []) {
          if (activityId !== '*' && !activityIds.has(activityId)) {
            errors.push(`Key ${label} grants unknown activity ${activityId}.`);
          }
        }
      } else if (grant.resource === 'adult-utility') {
        if (key.type !== KEY_TYPES.MAINTENANCE) {
          errors.push(`Non-maintenance key ${label} cannot grant adult utility access.`);
        }
        if (!Array.isArray(grant.capabilities) || grant.capabilities.length === 0) {
          errors.push(`Maintenance key ${label} needs explicit capabilities.`);
        }
      } else {
        errors.push(`Key ${label} has unknown grant resource ${grant.resource}.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Throw a single useful error when the permanent manifest is invalid. */
export function assertValidKeyManifest(manifest = KEY_MANIFEST, options) {
  const result = validateKeyManifest(manifest, options);
  if (!result.valid) throw new Error(`Invalid key manifest:\n- ${result.errors.join('\n- ')}`);
  return manifest;
}

export default KEY_MANIFEST;
