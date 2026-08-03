import {
  STORES,
  getAllRecords,
  getRecord,
  quarantineRecord,
  runTransaction,
} from "./db.js";

export const KEY_ACCESS_SCHEMA_VERSION = 1;
export const KEY_TYPES = Object.freeze(["individual", "collection", "destination", "world"]);

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9:._/-]{0,639}$/;

function now() {
  return new Date().toISOString();
}

function cleanText(value, maximum = 120) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum);
}

function assertId(value, label) {
  const id = String(value ?? "").trim();
  if (!SAFE_ID.test(id)) throw new TypeError(`${label} is invalid`);
  return id;
}

async function assertProfileExists(profileId) {
  const id = assertId(profileId, "Profile ID");
  if (!await getRecord(STORES.PROFILES, id)) throw new Error("The learner profile could not be found");
  return id;
}

function normaliseKeyType(value) {
  const aliases = {
    activity: "individual",
    individual_activity: "individual",
    destination_key: "destination",
    whole_world: "world",
  };
  const candidate = aliases[String(value ?? "").toLowerCase()] || String(value ?? "").toLowerCase();
  if (!KEY_TYPES.includes(candidate)) throw new TypeError("Key type is invalid or is not a child pathway key");
  return candidate;
}

function normalisePermission(permission) {
  if (typeof permission === "string") {
    const value = permission.trim();
    if (value === "*" || value === "world:*" || value === "activity:*") return "world:*";
    if (value.startsWith("destination:") && value.endsWith(":*")) return value;
    if (value.endsWith(":*") && value.split(":").length === 2) {
      return `destination:${value}`;
    }
    if (value.startsWith("activity:")) return value;
    if (SAFE_ID.test(value)) return `activity:${value}`;
    throw new TypeError(`Invalid key permission: ${value}`);
  }

  if (permission && typeof permission === "object") {
    const scope = String(permission.scope ?? permission.type ?? "").toLowerCase();
    if (scope === "world" || scope === "all") return "world:*";
    if (scope === "destination") {
      return `destination:${assertId(permission.destinationId ?? permission.destination, "Destination ID")}:*`;
    }
    if (scope === "activity" || permission.activityId) {
      return `activity:${assertId(permission.activityId ?? permission.id, "Activity ID")}`;
    }
  }
  throw new TypeError("Key permission is invalid");
}

function defaultPermissions(key, keyType, destinationId, activityIds) {
  if (keyType === "world") return ["world:*"];
  if (keyType === "destination") return [`destination:${destinationId}:*`];
  if (keyType === "individual" && activityIds[0]) return [`activity:${activityIds[0]}`];
  if (keyType === "collection") return activityIds.map((id) => `activity:${id}`);
  return [];
}

function normaliseActivity(activity, fallbackDestination) {
  const source = typeof activity === "string" ? { id: activity } : activity;
  if (!source || typeof source !== "object") throw new TypeError("Activity is invalid");
  return {
    id: assertId(source.id ?? source.activityId, "Activity ID"),
    destinationId: assertId(
      source.destinationId ?? source.destination ?? fallbackDestination,
      "Activity destination ID",
    ),
    title: cleanText(source.title ?? source.label, 100),
    invitation: cleanText(source.invitation ?? source.shortInvitation ?? source.description, 180),
    route: cleanText(source.route, 240),
  };
}

function manifestActivityGrants(key) {
  return Array.isArray(key?.grants)
    ? key.grants.filter((grant) => grant?.resource === "key-activity")
    : [];
}

function permissionsFromManifestGrants(key, knownActivities) {
  const permissions = [];
  for (const grant of manifestActivityGrants(key)) {
    const destinationId = String(grant.destinationId ?? key.destinationId ?? "");
    const activityIds = Array.isArray(grant.activityIds) ? grant.activityIds : [];
    const allActivities = activityIds.includes("*");

    if (grant.includeFuture && destinationId === "*" && allActivities) {
      permissions.push("world:*");
      continue;
    }
    if (grant.includeFuture && destinationId && destinationId !== "*" && allActivities) {
      permissions.push(`destination:${assertId(destinationId, "Destination ID")}:*`);
      continue;
    }

    for (const activityId of activityIds.filter((id) => id !== "*")) {
      permissions.push(`activity:${assertId(activityId, "Activity ID")}`);
    }

    // A non-future `*` means all activities known at the moment the key is
    // entered, not activities introduced by a later build.
    if (allActivities && !grant.includeFuture) {
      for (const activity of knownActivities) {
        if (destinationId === "*" || activity.destinationId === destinationId) {
          permissions.push(`activity:${activity.id}`);
        }
      }
    }
  }
  return permissions;
}

function activityIdentity(activity) {
  return typeof activity === "string" ? activity : activity?.id ?? activity?.activityId;
}

export function permissionMatchesActivity(permission, activity) {
  const activityId = String(activityIdentity(activity) ?? "");
  const destinationId = String(
    typeof activity === "object" ? activity.destinationId ?? activity.destination ?? "" : "",
  );
  if (!activityId) return false;
  let rule;
  try {
    rule = normalisePermission(permission);
  } catch {
    return false;
  }
  if (rule === "world:*") return true;
  if (rule.startsWith("activity:")) return rule.slice("activity:".length) === activityId;
  if (rule.startsWith("destination:") && rule.endsWith(":*")) {
    return rule.slice("destination:".length, -2) === destinationId;
  }
  return false;
}

export function validateKeyGrant(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["Key grant is not an object"] };
  }
  if (!SAFE_ID.test(String(record.id ?? ""))) errors.push("Grant ID is invalid");
  if (!SAFE_ID.test(String(record.profileId ?? ""))) errors.push("Grant profile is invalid");
  if (!SAFE_ID.test(String(record.keyId ?? ""))) errors.push("Key ID is invalid");
  if (record.code !== null && record.code !== undefined && !/^\d{4}$/.test(String(record.code))) {
    errors.push("Key code must contain exactly four digits");
  }
  if (!KEY_TYPES.includes(record.keyType)) errors.push("Key type is invalid");
  if (!Array.isArray(record.permissions) || record.permissions.some((rule) => {
    try {
      normalisePermission(rule);
      return false;
    } catch {
      return true;
    }
  })) errors.push("Key permissions are invalid");
  if (Number.isNaN(Date.parse(record.grantedAt))) errors.push("Grant date is invalid");
  return { valid: errors.length === 0, errors };
}

export function validateActivityAccess(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["Activity access is not an object"] };
  }
  for (const [field, label] of [
    ["id", "Access ID"],
    ["profileId", "Access profile"],
    ["activityId", "Access activity"],
    ["destinationId", "Access destination"],
  ]) {
    if (!SAFE_ID.test(String(record[field] ?? ""))) errors.push(`${label} is invalid`);
  }
  if (!Array.isArray(record.sourceKeyIds)) errors.push("Access source keys are invalid");
  if (Number.isNaN(Date.parse(record.firstOpenedAt))) errors.push("First opened date is invalid");
  if (record.lastVisitedAt && Number.isNaN(Date.parse(record.lastVisitedAt))) errors.push("Last visited date is invalid");
  return { valid: errors.length === 0, errors };
}

function keyGrantRecord(profileId, key, suppliedActivities) {
  if (!key || typeof key !== "object") throw new TypeError("A key manifest entry is required");
  const keyId = assertId(key.stableId ?? key.keyId ?? key.id, "Key ID");
  const keyType = normaliseKeyType(key.keyType ?? key.type);
  const destinationId = keyType === "world"
    ? "all-destinations"
    : assertId(key.destinationId ?? key.destination, "Key destination ID");
  const declaredActivityIds = [...new Set([
    ...(Array.isArray(key.activityIds) ? key.activityIds : []),
    ...(key.activityId ? [key.activityId] : []),
    ...manifestActivityGrants(key).flatMap((grant) => grant.activityIds || []),
  ].filter((id) => id && id !== "*").map((id) => assertId(id, "Activity ID")))];
  const permissionsInput = key.permissionsGranted ?? key.permissions;
  const manifestPermissions = permissionsFromManifestGrants(key, suppliedActivities);
  const permissions = [...new Set(
    Array.isArray(permissionsInput) && permissionsInput.length
      ? permissionsInput.map(normalisePermission)
      : manifestPermissions.length
        ? manifestPermissions
        : defaultPermissions(
          key,
          keyType,
          destinationId,
          declaredActivityIds.length ? declaredActivityIds : suppliedActivities.map(activityIdentity),
        ),
  )];
  if (permissions.length === 0) throw new TypeError("The key does not grant any pathways");
  const activityIds = [...new Set([
    ...declaredActivityIds,
    ...suppliedActivities
      .filter((activity) => permissions.some((permission) => permissionMatchesActivity(permission, activity)))
      .map(activityIdentity),
  ])];
  const code = key.code === undefined || key.code === null ? null : String(key.code);
  if (code !== null && !/^\d{4}$/.test(code)) throw new TypeError("Key code must contain exactly four digits");

  const timestamp = now();
  return {
    id: `grant:${profileId}:${keyId}`,
    profileId,
    keyId,
    code,
    keyType,
    destinationId,
    title: cleanText(key.childFacingTitle ?? key.title ?? key.label, 100),
    description: cleanText(key.description, 180),
    route: cleanText(key.route, 240),
    permissions,
    manifestGrants: manifestActivityGrants(key).map((grant) => ({
      resource: "key-activity",
      destinationId: grant.destinationId,
      activityIds: Array.isArray(grant.activityIds) ? [...grant.activityIds] : [],
      includeFuture: Boolean(grant.includeFuture),
    })),
    activityIds,
    grantedAt: timestamp,
    lastUsedAt: timestamp,
    schemaVersion: KEY_ACCESS_SCHEMA_VERSION,
  };
}

function mergeSourceIds(existing = [], sourceId) {
  return [...new Set([...existing, sourceId].filter(Boolean))];
}

function makeAccessRecord(profileId, activity, grant, existing) {
  const firstOpenedAt = existing?.firstOpenedAt || grant.grantedAt || now();
  return {
    id: `access:${profileId}:${activity.id}`,
    profileId,
    activityId: activity.id,
    destinationId: activity.destinationId,
    title: activity.title || existing?.title || "",
    invitation: activity.invitation || existing?.invitation || "",
    route: activity.route || existing?.route || grant.route || "",
    sourceKeyIds: mergeSourceIds(existing?.sourceKeyIds, grant.keyId),
    firstOpenedAt,
    firstOpened: firstOpenedAt,
    createdAt: firstOpenedAt,
    lastVisitedAt: existing?.lastVisitedAt || null,
    lastVisited: existing?.lastVisitedAt || null,
    visitCount: Number.isInteger(existing?.visitCount) ? existing.visitCount : 0,
    savedArtefactIds: Array.isArray(existing?.savedArtefactIds) ? [...new Set(existing.savedArtefactIds)] : [],
    schemaVersion: KEY_ACCESS_SCHEMA_VERSION,
  };
}

function keyMatches(grant, activity) {
  return grant.permissions.some((permission) => permissionMatchesActivity(permission, activity));
}

async function recoverRecord(storeName, record, validator) {
  const validation = validator(record);
  if (validation.valid) return record;
  await quarantineRecord(storeName, record?.id || `unknown-${Date.now()}`, record, validation.errors.join("; "), {
    remove: Boolean(record?.id),
  });
  return null;
}

/**
 * Persist a manifest key grant and materialise any known matching activities.
 * Wildcards remain on the grant, so future activity registries are covered too.
 */
export async function grantKey(profileId, key, { activities = [] } = {}) {
  const learnerId = await assertProfileExists(profileId);
  if (key?.active === false) throw new Error("This key pathway is not active");
  const destination = key.destinationId ?? key.destination;
  const declaredActivityIds = [
    ...(Array.isArray(key.activityIds) ? key.activityIds : []),
    ...(key.activityId ? [key.activityId] : []),
    ...manifestActivityGrants(key).flatMap((grant) => grant.activityIds || []),
  ].filter((id) => id && id !== "*");
  const rawActivities = [
    ...activities,
    ...(Array.isArray(key.activities) ? key.activities : []),
    ...declaredActivityIds.map((id) => ({
      id,
      destinationId: destination,
      title: declaredActivityIds.length === 1 ? key.childFacingTitle ?? key.title : "",
      invitation: declaredActivityIds.length === 1 ? key.description : "",
      route: declaredActivityIds.length === 1 ? key.route : "",
    })),
  ];
  const activityMap = new Map();
  for (const activity of rawActivities) {
    const normalised = normaliseActivity(activity, destination);
    activityMap.set(normalised.id, { ...activityMap.get(normalised.id), ...normalised });
  }
  const normalisedActivities = [...activityMap.values()];
  const incoming = keyGrantRecord(learnerId, key, normalisedActivities);

  return runTransaction([STORES.KEY_GRANTS, STORES.KEY_ACCESS], "readwrite", async (transaction) => {
    const existingGrant = await transaction.get(STORES.KEY_GRANTS, incoming.id);
    const grant = existingGrant
      ? {
        ...existingGrant,
        ...incoming,
        permissions: [...new Set([...(existingGrant.permissions || []), ...incoming.permissions])],
        activityIds: [...new Set([...(existingGrant.activityIds || []), ...incoming.activityIds])],
        grantedAt: existingGrant.grantedAt,
        lastUsedAt: now(),
      }
      : incoming;
    const validation = validateKeyGrant(grant);
    if (!validation.valid) throw new TypeError(validation.errors.join("; "));
    await transaction.put(STORES.KEY_GRANTS, grant);

    const materialised = [];
    for (const activity of normalisedActivities.filter((item) => keyMatches(grant, item))) {
      const id = `access:${learnerId}:${activity.id}`;
      const existing = await transaction.get(STORES.KEY_ACCESS, id);
      const access = makeAccessRecord(learnerId, activity, grant, existing);
      await transaction.put(STORES.KEY_ACCESS, access);
      materialised.push(access);
    }
    return { grant, activities: materialised };
  });
}

export async function grantKeyAccess(input, options = {}) {
  if (!input || typeof input !== "object") throw new TypeError("Key access details are required");
  const { profileId, key, activities = options.activities || [] } = input;
  return grantKey(profileId, key || input, { activities });
}

export async function listKeyGrants(profileId) {
  const learnerId = await assertProfileExists(profileId);
  const records = await getAllRecords(STORES.KEY_GRANTS, { index: "profileId", query: learnerId });
  const grants = [];
  for (const record of records) {
    const recovered = await recoverRecord(STORES.KEY_GRANTS, record, validateKeyGrant);
    if (recovered) grants.push(recovered);
  }
  return grants.sort((left, right) => right.grantedAt.localeCompare(left.grantedAt));
}

export async function getKeyGrant(profileId, keyId) {
  const learnerId = await assertProfileExists(profileId);
  const record = await getRecord(STORES.KEY_GRANTS, `grant:${learnerId}:${assertId(keyId, "Key ID")}`);
  if (!record) return null;
  return recoverRecord(STORES.KEY_GRANTS, record, validateKeyGrant);
}

/** Materialise wildcard and collection permissions against the current registry. */
export async function syncGrantedActivities(profileId, activityRegistry = []) {
  const learnerId = await assertProfileExists(profileId);
  const activities = activityRegistry.map((activity) => normaliseActivity(activity, activity.destinationId));
  const grants = await listKeyGrants(learnerId);
  if (grants.length === 0 || activities.length === 0) return listActivityAccess(learnerId);

  await runTransaction(STORES.KEY_ACCESS, "readwrite", async (transaction) => {
    for (const activity of activities) {
      const matching = grants.filter((grant) => keyMatches(grant, activity));
      if (matching.length === 0) continue;
      const id = `access:${learnerId}:${activity.id}`;
      let access = await transaction.get(STORES.KEY_ACCESS, id);
      for (const grant of matching) access = makeAccessRecord(learnerId, activity, grant, access);
      await transaction.put(STORES.KEY_ACCESS, access);
    }
  });
  return listActivityAccess(learnerId);
}

export async function listActivityAccess(profileId, { destinationId, activityRegistry } = {}) {
  const learnerId = await assertProfileExists(profileId);
  if (activityRegistry) await syncGrantedActivities(learnerId, activityRegistry);
  const records = await getAllRecords(STORES.KEY_ACCESS, { index: "profileId", query: learnerId });
  const access = [];
  for (const record of records) {
    const recovered = await recoverRecord(STORES.KEY_ACCESS, record, validateActivityAccess);
    if (recovered && (!destinationId || recovered.destinationId === destinationId)) access.push(recovered);
  }
  return access.sort((left, right) => {
    const leftDate = left.lastVisitedAt || left.firstOpenedAt;
    const rightDate = right.lastVisitedAt || right.firstOpenedAt;
    return rightDate.localeCompare(leftDate);
  });
}

export async function hasActivityAccess(profileId, activity) {
  const learnerId = await assertProfileExists(profileId);
  const activityId = assertId(activityIdentity(activity), "Activity ID");
  if (await getRecord(STORES.KEY_ACCESS, `access:${learnerId}:${activityId}`)) return true;
  const normalised = typeof activity === "string"
    ? { id: activityId, destinationId: "" }
    : normaliseActivity(activity, activity?.destinationId ?? activity?.destination);
  const grants = await listKeyGrants(learnerId);
  return grants.some((grant) => keyMatches(grant, normalised));
}

export async function recordActivityVisit(profileId, activity, { savedArtefactId } = {}) {
  const learnerId = await assertProfileExists(profileId);
  const normalised = normaliseActivity(activity, activity?.destinationId ?? activity?.destination);
  if (!await hasActivityAccess(learnerId, normalised)) {
    throw new Error("This activity has not been added to My Keys for this profile");
  }
  const grants = (await listKeyGrants(learnerId)).filter((grant) => keyMatches(grant, normalised));

  return runTransaction(STORES.KEY_ACCESS, "readwrite", async (transaction) => {
    const id = `access:${learnerId}:${normalised.id}`;
    let access = await transaction.get(STORES.KEY_ACCESS, id);
    for (const grant of grants) access = makeAccessRecord(learnerId, normalised, grant, access);
    access.lastVisitedAt = now();
    access.lastVisited = access.lastVisitedAt;
    access.visitCount = (Number.isInteger(access.visitCount) ? access.visitCount : 0) + 1;
    if (savedArtefactId) {
      const artefactId = assertId(savedArtefactId, "Saved artefact ID");
      access.savedArtefactIds = [...new Set([...(access.savedArtefactIds || []), artefactId])];
    }
    await transaction.put(STORES.KEY_ACCESS, access);
    return access;
  });
}

export async function linkArtefactToActivityAccess(profileId, activityId, artefactId) {
  const learnerId = await assertProfileExists(profileId);
  const id = `access:${learnerId}:${assertId(activityId, "Activity ID")}`;
  return runTransaction(STORES.KEY_ACCESS, "readwrite", async (transaction) => {
    const access = await transaction.get(STORES.KEY_ACCESS, id);
    if (!access) return null;
    access.savedArtefactIds = [...new Set([
      ...(access.savedArtefactIds || []),
      assertId(artefactId, "Artefact ID"),
    ])];
    await transaction.put(STORES.KEY_ACCESS, access);
    return access;
  });
}

export async function revokeKeyGrant(profileId, keyId, { confirm = false } = {}) {
  if (!confirm) throw new Error("Removing a remembered key requires explicit confirmation");
  const learnerId = await assertProfileExists(profileId);
  const safeKeyId = assertId(keyId, "Key ID");
  const grants = (await listKeyGrants(learnerId)).filter((grant) => grant.keyId !== safeKeyId);

  return runTransaction([STORES.KEY_GRANTS, STORES.KEY_ACCESS], "readwrite", async (transaction) => {
    await transaction.delete(STORES.KEY_GRANTS, `grant:${learnerId}:${safeKeyId}`);
    const accessRecords = await transaction.getAll(STORES.KEY_ACCESS, { index: "profileId", query: learnerId });
    for (const access of accessRecords) {
      const activity = { id: access.activityId, destinationId: access.destinationId };
      const matching = grants.filter((grant) => keyMatches(grant, activity));
      if (matching.length === 0) {
        await transaction.delete(STORES.KEY_ACCESS, access.id);
      } else {
        access.sourceKeyIds = matching.map((grant) => grant.keyId);
        await transaction.put(STORES.KEY_ACCESS, access);
      }
    }
    return true;
  });
}

export async function clearProfileKeyAccess(profileId, { confirm = false } = {}) {
  if (!confirm) throw new Error("Resetting My Keys requires explicit confirmation");
  const learnerId = await assertProfileExists(profileId);
  return runTransaction([STORES.KEY_GRANTS, STORES.KEY_ACCESS], "readwrite", async (transaction) => {
    for (const storeName of [STORES.KEY_GRANTS, STORES.KEY_ACCESS]) {
      const records = await transaction.getAll(storeName, { index: "profileId", query: learnerId });
      for (const record of records) await transaction.delete(storeName, record.id);
    }
    return true;
  });
}

export async function grantKeyToEveryProfile(key, { activities = [], confirm = false } = {}) {
  if (!confirm) throw new Error("Adding a key to every local profile requires explicit confirmation");
  const profiles = await getAllRecords(STORES.PROFILES);
  const results = [];
  for (const profile of profiles) {
    results.push(await grantKey(profile.id, key, { activities }));
  }
  return results;
}

export const listMyKeys = listActivityAccess;
export const touchKeyActivity = recordActivityVisit;
