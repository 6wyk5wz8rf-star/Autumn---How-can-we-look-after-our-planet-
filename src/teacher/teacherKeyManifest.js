/**
 * Build 2 teacher-key contract.
 *
 * The existing key manifest remains the single source of truth. This module
 * supplies the permanent teacher record and the extra validation rules which
 * keep that manifest safe as later environments are added.
 */

export const TEACHER_KEY_CODE = '8584';
export const TEACHER_KEY_ID = 'key-teacher-key-room';
export const TEACHER_KEY_ROUTE = '#/maintenance';
export const LEGACY_TEACHER_KEY_CODE = '4829';
export const LEGACY_TEACHER_KEY_ID = 'key-maintenance-adult-utility';

export const TEACHER_KEY_CAPABILITIES = Object.freeze([
  'search-key-library',
  'display-key-full-screen',
  'copy-key-code',
  'print-key-card',
  'print-key-guide',
  'export-backup',
  'import-backup',
  'inspect-local-profiles',
  'inspect-destinations',
  'add-key-to-device-profiles',
  'reset-profile-keys',
  'clear-profile-work',
  'clear-all-local-data',
]);

/**
 * Drop-in record for `KEY_MANIFEST`.
 *
 * It deliberately keeps the existing `maintenance` type and route so Build 2
 * can migrate without changing persisted child key types. It has no activity
 * grant, activity IDs or learner permissions and therefore cannot enter My
 * Keys or create activity access records.
 */
export const TEACHER_KEY_RECORD = Object.freeze({
  code: TEACHER_KEY_CODE,
  id: TEACHER_KEY_ID,
  type: 'maintenance',
  scale: 'teacher',
  destinationId: null,
  destination: null,
  activityIds: Object.freeze([]),
  permissionsGranted: Object.freeze([]),
  grants: Object.freeze([Object.freeze({
    resource: 'adult-utility',
    capabilities: TEACHER_KEY_CAPABILITIES,
  })]),
  route: TEACHER_KEY_ROUTE,
  title: 'Teacher Key Room',
  childFacingTitle: 'Teacher Key Room',
  description: 'Open the session-only teacher key library and local product utilities.',
  curriculumTags: Object.freeze([]),
  savedOutcomeType: null,
  active: true,
  printGuide: Object.freeze({
    group: 'Teacher entrance',
    quickUse: false,
    purpose: 'Open the Teacher Key Room for this session only.',
    usefulMoments: Object.freeze(['adult-utility']),
    expectedOutcome: 'No learner outcome',
    displayCard: false,
  }),
});

const FOUR_DIGITS = /^\d{4}$/;
const CHILD_TYPES = new Set(['activity', 'individual', 'collection', 'destination', 'environment', 'world', 'whole-world']);
const TEACHER_TYPES = new Set(['maintenance', 'teacher']);

function codeOf(key) {
  return String(key?.code ?? key?.key ?? '').replace(/\s+/g, '');
}

function idOf(key) {
  return String(key?.id ?? key?.stableId ?? key?.keyId ?? '').trim();
}

function typeOf(key) {
  return String(key?.type ?? key?.keyType ?? '').trim().toLowerCase();
}

function destinationOf(key) {
  return key?.destinationId ?? key?.destination ?? null;
}

function isObviousCode(code) {
  if (!FOUR_DIGITS.test(code)) return false;
  const digits = [...code].map(Number);
  if (new Set(digits).size === 1) return true;
  const steps = digits.slice(1).map((digit, index) => digit - digits[index]);
  return steps.every((step) => step === 1) || steps.every((step) => step === -1);
}

export function isTeacherKey(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).replace(/\s+/g, '') === TEACHER_KEY_CODE;
  }
  return codeOf(value) === TEACHER_KEY_CODE || idOf(value) === TEACHER_KEY_ID;
}

/** Hidden Build 1 compatibility alias; never render it in the Teacher Key Room. */
export function isLegacyTeacherKey(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).replace(/\s+/g, '') === LEGACY_TEACHER_KEY_CODE;
  }
  return codeOf(value) === LEGACY_TEACHER_KEY_CODE || idOf(value) === LEGACY_TEACHER_KEY_ID;
}

export function isAdultEntranceKey(value) {
  return isTeacherKey(value) || isLegacyTeacherKey(value);
}

/** Active manifest entries safe to show in the ordinary Teacher Key Room. */
export function getProductionTeacherKeys(manifest = []) {
  return manifest.filter((key) => (
    key
    && key.active !== false
    && CHILD_TYPES.has(typeOf(key))
    && !isTeacherKey(key)
  ));
}

function activityIdsFromKey(key) {
  const ids = new Set(Array.isArray(key?.activityIds) ? key.activityIds : []);
  for (const grant of key?.grants ?? []) {
    if (grant?.resource !== 'key-activity') continue;
    for (const id of grant.activityIds ?? []) ids.add(id);
  }
  return [...ids].filter((id) => id && id !== '*');
}

function validateWildcard(key, errors, label) {
  const type = typeOf(key);
  const grants = (key.grants ?? []).filter((grant) => grant?.resource === 'key-activity');
  if (!['destination', 'environment', 'world', 'whole-world'].includes(type)) return;

  if (grants.length !== 1) {
    errors.push(`${label} must declare exactly one wildcard activity grant.`);
    return;
  }
  const [grant] = grants;
  if (!grant.includeFuture || !Array.isArray(grant.activityIds) || grant.activityIds.length !== 1 || grant.activityIds[0] !== '*') {
    errors.push(`${label} must use one includeFuture wildcard activity ID.`);
  }
  if (['world', 'whole-world'].includes(type) && grant.destinationId !== '*') {
    errors.push(`${label} must wildcard every destination.`);
  }
  if (['destination', 'environment'].includes(type) && (
    !grant.destinationId
    || grant.destinationId === '*'
    || grant.destinationId !== destinationOf(key)
  )) {
    errors.push(`${label} has a malformed destination wildcard.`);
  }
}

/**
 * Validate Build 2's permanent-code rules without mutating the manifest.
 *
 * This complements the existing Build 1 validator and intentionally checks
 * cross-record conditions that the teacher room depends on. Pass the current
 * activity and destination registries for the strictest result.
 */
export function validateTeacherKeyManifest(
  manifest,
  { activities = [], destinations = [], productionEntries = null } = {},
) {
  const errors = [];
  if (!Array.isArray(manifest)) {
    return { valid: false, errors: ['Key manifest must be an array.'], teacherKey: null };
  }

  const seenCodes = new Map();
  const seenIds = new Map();
  const knownActivities = new Set(activities.map((activity) => activity.id));
  const knownDestinations = new Set(destinations.map((destination) => destination.id));
  let teacherKey = null;
  let legacyTeacherKey = null;

  manifest.forEach((key, index) => {
    const id = idOf(key);
    const code = codeOf(key);
    const type = typeOf(key);
    const label = id || `key entry ${index + 1}`;

    if (!id) errors.push(`Key entry ${index + 1} needs a stable ID.`);
    if (!FOUR_DIGITS.test(code)) errors.push(`${label} must contain exactly four digits.`);
    if (isObviousCode(code)) errors.push(`${label} uses an obvious or repeated code.`);
    if (seenCodes.has(code)) errors.push(`Duplicate key code ${code}: ${seenCodes.get(code)} and ${label}.`);
    if (seenIds.has(id)) errors.push(`Duplicate key ID ${id}.`);
    seenCodes.set(code, label);
    seenIds.set(id, label);

    if (isTeacherKey(key)) {
      if (teacherKey) errors.push(`${TEACHER_KEY_CODE} is assigned more than once.`);
      teacherKey = key;
      if (code !== TEACHER_KEY_CODE) errors.push(`${TEACHER_KEY_ID} must use ${TEACHER_KEY_CODE}.`);
      if (id !== TEACHER_KEY_ID) errors.push(`${TEACHER_KEY_CODE} must keep stable ID ${TEACHER_KEY_ID}.`);
      if (!TEACHER_TYPES.has(type)) errors.push(`${TEACHER_KEY_CODE} must be a teacher-only manifest type.`);
      if ((key.activityIds ?? []).length) errors.push(`${TEACHER_KEY_CODE} cannot reference child activities.`);
      if ((key.permissionsGranted ?? []).length) errors.push(`${TEACHER_KEY_CODE} cannot grant learner permissions.`);
      if ((key.grants ?? []).some((grant) => grant.resource === 'key-activity')) {
        errors.push(`${TEACHER_KEY_CODE} cannot grant child activity access.`);
      }
    } else if (isLegacyTeacherKey(key)) {
      if (legacyTeacherKey) errors.push(`${LEGACY_TEACHER_KEY_CODE} is assigned more than once.`);
      legacyTeacherKey = key;
      if (code !== LEGACY_TEACHER_KEY_CODE || id !== LEGACY_TEACHER_KEY_ID) {
        errors.push(`The hidden Build 1 adult alias must remain ${LEGACY_TEACHER_KEY_CODE} with ID ${LEGACY_TEACHER_KEY_ID}.`);
      }
      if (!TEACHER_TYPES.has(type)) errors.push(`${LEGACY_TEACHER_KEY_CODE} must remain a teacher-only manifest type.`);
      if (key?.active === false) errors.push(`${LEGACY_TEACHER_KEY_CODE} must remain active for Build 1 compatibility.`);
      if ((key.activityIds ?? []).length || (key.permissionsGranted ?? []).length) {
        errors.push(`${LEGACY_TEACHER_KEY_CODE} cannot grant learner access.`);
      }
      if ((key.grants ?? []).some((grant) => grant.resource === 'key-activity')) {
        errors.push(`${LEGACY_TEACHER_KEY_CODE} cannot grant child activity access.`);
      }
    } else if (TEACHER_TYPES.has(type) && key?.active !== false) {
      errors.push(`${label} is an unrecognised adult entrance; only ${TEACHER_KEY_CODE} and hidden legacy alias ${LEGACY_TEACHER_KEY_CODE} are allowed.`);
    }

    if (key?.active !== false && !String(key?.route ?? '').trim()) {
      errors.push(`${label} needs an active route.`);
    }
    if (!isAdultEntranceKey(key) && !CHILD_TYPES.has(type)) errors.push(`${label} has unsupported key type ${type || '(missing)'}.`);

    const destinationId = destinationOf(key);
    if (knownDestinations.size && destinationId && destinationId !== '*' && !knownDestinations.has(destinationId)) {
      errors.push(`${label} refers to missing destination ${destinationId}.`);
    }

    if (knownActivities.size) {
      for (const activityId of activityIdsFromKey(key)) {
        if (!knownActivities.has(activityId)) errors.push(`${label} refers to missing activity ${activityId}.`);
      }
    }

    if (type === 'collection' && activityIdsFromKey(key).length === 0) {
      errors.push(`${label} is an empty collection.`);
    }
    validateWildcard(key, errors, label);
  });

  if (!teacherKey) errors.push(`${TEACHER_KEY_CODE} must be permanently reserved for ${TEACHER_KEY_ID}.`);
  if (!legacyTeacherKey) {
    errors.push(`${LEGACY_TEACHER_KEY_CODE} must remain as hidden Build 1 alias ${LEGACY_TEACHER_KEY_ID}.`);
  }

  if (Array.isArray(productionEntries)) {
    const allowed = new Set(getProductionTeacherKeys(manifest).map(idOf));
    for (const key of productionEntries) {
      const id = idOf(key);
      if (key?.active === false || !allowed.has(id)) {
        errors.push(`Inactive or teacher-only key ${id || '(missing ID)'} appears in the production teacher view.`);
      }
    }
  }

  return { valid: errors.length === 0, errors, teacherKey, legacyTeacherKey };
}

export function assertValidTeacherKeyManifest(manifest, options) {
  const result = validateTeacherKeyManifest(manifest, options);
  if (!result.valid) throw new Error(`Invalid Build 2 key manifest:\n- ${result.errors.join('\n- ')}`);
  return manifest;
}
