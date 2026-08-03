import {
  STORES,
  getAllRecords,
  getMetadata,
  getRecord,
  putRecord,
  quarantineRecord,
  removeMetadata,
  runTransaction,
  setMetadata,
} from "./db.js";

export const PROFILE_SCHEMA_VERSION = 1;

export const PROFILE_SYMBOLS = Object.freeze([
  "leaf",
  "river",
  "shell",
  "mountain",
  "compass",
  "globe",
  "sun",
  "wave",
  "seed",
  "brush",
]);

export const PROFILE_PATTERNS = Object.freeze([
  "contours",
  "ripples",
  "woven",
  "speckles",
  "strata",
  "crosshatch",
]);

const PROFILE_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9:_-]{5,127}$/;
const SAFE_CHOICE_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;

function now() {
  return new Date().toISOString();
}

function makeId(prefix = "profile") {
  const uuid = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}:${uuid}`;
}

function normaliseName(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeChoice(value, fallback) {
  const choice = String(value ?? "").trim().toLowerCase();
  return SAFE_CHOICE_PATTERN.test(choice) ? choice : fallback;
}

function sanitiseAccessibility(value = {}) {
  const scaffoldOptions = new Set(["light", "core", "strong", "intensive"]);
  const scaffold = scaffoldOptions.has(String(value.scaffold ?? "").toLowerCase())
    ? String(value.scaffold).toLowerCase()
    : "core";
  const textScale = Number(value.textScale);
  return {
    scaffold,
    textScale: Number.isFinite(textScale) ? Math.min(1.5, Math.max(0.9, textScale)) : 1,
    spokenInstructions: Boolean(value.spokenInstructions),
    reducedMotion: Boolean(value.reducedMotion),
    reducedComplexity: Boolean(value.reducedComplexity),
    captions: value.captions !== false,
    highContrast: Boolean(value.highContrast),
  };
}

export function validateProfile(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["Profile is not an object"] };
  }
  if (!PROFILE_ID_PATTERN.test(String(record.id ?? ""))) errors.push("Profile ID is invalid");
  const displayName = normaliseName(record.displayName);
  if (displayName.length < 1 || displayName.length > 40) errors.push("Display name must contain 1 to 40 characters");
  if (!SAFE_CHOICE_PATTERN.test(String(record.symbol ?? ""))) errors.push("Profile symbol is invalid");
  if (!SAFE_CHOICE_PATTERN.test(String(record.pattern ?? ""))) errors.push("Profile pattern is invalid");
  if (!Number.isInteger(record.schemaVersion) || record.schemaVersion < 1) errors.push("Profile schema version is invalid");
  if (Number.isNaN(Date.parse(record.createdAt))) errors.push("Profile creation date is invalid");
  if (Number.isNaN(Date.parse(record.updatedAt))) errors.push("Profile update date is invalid");
  return { valid: errors.length === 0, errors };
}

function toPublicProfile(record) {
  return {
    ...record,
    displayName: normaliseName(record.displayName),
    name: normaliseName(record.displayName),
    accessibility: sanitiseAccessibility(record.accessibility),
  };
}

async function recoverInvalidProfile(record) {
  const validation = validateProfile(record);
  if (validation.valid) return toPublicProfile(record);
  const key = record?.id || `unknown-${Date.now()}`;
  await quarantineRecord(STORES.PROFILES, key, record, validation.errors.join("; "), {
    remove: Boolean(record?.id),
  });
  return null;
}

export async function createProfile(input = {}) {
  const displayName = normaliseName(input.displayName ?? input.name ?? input.firstName);
  if (displayName.length < 1 || displayName.length > 40) {
    throw new TypeError("Choose a name, nickname, or initials of 1 to 40 characters");
  }

  const timestamp = now();
  const profile = {
    id: makeId(),
    displayName,
    name: displayName,
    normalisedName: displayName.toLocaleLowerCase(),
    symbol: safeChoice(input.symbol, "leaf"),
    pattern: safeChoice(input.pattern, "contours"),
    accessibility: sanitiseAccessibility(input.accessibility),
    createdAt: timestamp,
    updatedAt: timestamp,
    schemaVersion: PROFILE_SCHEMA_VERSION,
  };
  const validation = validateProfile(profile);
  if (!validation.valid) throw new TypeError(validation.errors.join("; "));
  await putRecord(STORES.PROFILES, profile);

  const activeId = await getMetadata("activeProfileId", null);
  if (!activeId) await setMetadata("activeProfileId", profile.id);
  return toPublicProfile(profile);
}

export async function listProfiles() {
  const records = await getAllRecords(STORES.PROFILES);
  const profiles = [];
  for (const record of records) {
    const recovered = await recoverInvalidProfile(record);
    if (recovered) profiles.push(recovered);
  }
  return profiles.sort((left, right) => (
    left.createdAt.localeCompare(right.createdAt)
    || left.displayName.localeCompare(right.displayName)
  ));
}

export async function getProfile(profileId) {
  if (!PROFILE_ID_PATTERN.test(String(profileId ?? ""))) return null;
  const record = await getRecord(STORES.PROFILES, profileId);
  return record ? recoverInvalidProfile(record) : null;
}

export async function requireProfile(profileId) {
  const profile = await getProfile(profileId);
  if (!profile) throw new Error("The learner profile could not be found");
  return profile;
}

export async function updateProfile(profileId, changes = {}) {
  const existing = await requireProfile(profileId);
  const displayName = changes.displayName === undefined && changes.name === undefined
    ? existing.displayName
    : normaliseName(changes.displayName ?? changes.name);
  if (displayName.length < 1 || displayName.length > 40) {
    throw new TypeError("Choose a name, nickname, or initials of 1 to 40 characters");
  }

  const updated = {
    ...existing,
    displayName,
    name: displayName,
    normalisedName: displayName.toLocaleLowerCase(),
    symbol: changes.symbol === undefined ? existing.symbol : safeChoice(changes.symbol, existing.symbol),
    pattern: changes.pattern === undefined ? existing.pattern : safeChoice(changes.pattern, existing.pattern),
    accessibility: changes.accessibility === undefined
      ? sanitiseAccessibility(existing.accessibility)
      : sanitiseAccessibility({ ...existing.accessibility, ...changes.accessibility }),
    updatedAt: now(),
    schemaVersion: PROFILE_SCHEMA_VERSION,
  };
  const validation = validateProfile(updated);
  if (!validation.valid) throw new TypeError(validation.errors.join("; "));
  await putRecord(STORES.PROFILES, updated);
  return toPublicProfile(updated);
}

export async function setActiveProfile(profileId) {
  await requireProfile(profileId);
  await setMetadata("activeProfileId", profileId);
  return profileId;
}

export async function getActiveProfileId() {
  const profileId = await getMetadata("activeProfileId", null);
  if (!profileId) return null;
  if (await getProfile(profileId)) return profileId;
  await removeMetadata("activeProfileId");
  return null;
}

export async function getActiveProfile() {
  const profileId = await getActiveProfileId();
  return profileId ? getProfile(profileId) : null;
}

export async function deleteProfile(profileId, { confirm = false, deleteLearnerData = true } = {}) {
  if (!confirm) throw new Error("Profile deletion requires explicit confirmation");
  const profile = await requireProfile(profileId);
  const stores = deleteLearnerData
    ? [
      STORES.PROFILES,
      STORES.KEY_GRANTS,
      STORES.KEY_ACCESS,
      STORES.ARTEFACTS,
      STORES.ARTEFACT_VERSIONS,
      STORES.PLANET_RESPONSES,
      STORES.ACTIVITY_STATE,
      STORES.METADATA,
    ]
    : [STORES.PROFILES, STORES.METADATA];

  await runTransaction(stores, "readwrite", async (transaction) => {
    if (deleteLearnerData) {
      for (const storeName of stores.filter((name) => (
        name !== STORES.PROFILES && name !== STORES.METADATA
      ))) {
        const records = await transaction.getAll(storeName, { index: "profileId", query: profileId });
        for (const record of records) await transaction.delete(storeName, record.id);
      }
    }
    await transaction.delete(STORES.METADATA, `settings:profile:${profileId}`);
    await transaction.delete(STORES.PROFILES, profileId);
  });

  const activeId = await getMetadata("activeProfileId", null);
  if (activeId === profileId) {
    await removeMetadata("activeProfileId");
    const [nextProfile] = await listProfiles();
    if (nextProfile) await setActiveProfile(nextProfile.id);
  }
  return profile;
}

export async function updateAccessibilityPreferences(profileId, preferences) {
  const profile = await updateProfile(profileId, { accessibility: preferences });
  return profile.accessibility;
}

// Clear aliases keep integration language readable without creating a second API.
export const createLearnerProfile = createProfile;
export const listLearnerProfiles = listProfiles;
export const switchProfile = setActiveProfile;
