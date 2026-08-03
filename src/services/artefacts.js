import {
  STORES,
  getAllRecords,
  getRecord,
  putRecord,
  quarantineRecord,
  runTransaction,
} from "./db.js";
import { validateArtefactContent } from "../data/artefactTypes.js";

export const ARTEFACT_SCHEMA_VERSION = 1;
export const PLANET_QUESTION = "How can we look after our planet?";

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9:._/-]{0,639}$/;
const SAFE_TYPE = /^[a-z0-9][a-z0-9-]{0,79}$/;

function now() {
  return new Date().toISOString();
}

function makeId(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}:${uuid}`;
}

function cleanText(value, maximum) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum);
}

function assertId(value, label, { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === "")) return null;
  const id = String(value ?? "").trim();
  if (!SAFE_ID.test(id)) throw new TypeError(`${label} is invalid`);
  return id;
}

function safeType(value) {
  const type = String(value ?? "").trim().toLowerCase();
  if (!SAFE_TYPE.test(type)) throw new TypeError("Artefact type is invalid");
  return type;
}

function stringList(values, maximumItems = 40, itemLength = 80) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values
    .slice(0, maximumItems)
    .map((item) => cleanText(item, itemLength))
    .filter(Boolean))];
}

function idList(values, maximumItems = 100) {
  if (!Array.isArray(values)) return [];
  const ids = [];
  for (const value of values.slice(0, maximumItems)) {
    try {
      ids.push(assertId(value, "Linked artefact ID"));
    } catch {
      // A malformed optional link should not make an otherwise sound save fail.
    }
  }
  return [...new Set(ids)];
}

function legacyIdList(value, maximumItems = 100) {
  if (Array.isArray(value)) return idList(value, maximumItems);
  if (typeof value === "string" && value.trim()) return idList([value], maximumItems);
  return [];
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sameStringArray(left, right) {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

/**
 * Repair legacy response envelopes before they can reach My Work. Early builds
 * sometimes stored a single evidence ID as a string; the public contract is
 * always an array, even when it is empty.
 */
export function normalisePlanetResponse(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return record;
  const linkedArtefactIds = [...new Set([
    ...legacyIdList(record.linkedArtefactIds, 40),
    ...legacyIdList(record.evidence, 40),
  ])];
  return {
    ...record,
    shortText: cleanText(record.shortText ?? record.text, 2000),
    text: cleanText(record.shortText ?? record.text, 2000),
    visualIdeas: stringList(record.visualIdeas, 20, 120),
    linkedArtefactIds,
    evidence: [...linkedArtefactIds],
  };
}

async function assertProfileExists(profileId) {
  const id = assertId(profileId, "Profile ID");
  if (!await getRecord(STORES.PROFILES, id)) throw new Error("The learner profile could not be found");
  return id;
}

function validateTimestamp(value, label, errors) {
  if (Number.isNaN(Date.parse(value))) errors.push(`${label} is invalid`);
}

export function validateArtefact(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["Artefact is not an object"] };
  }
  for (const [field, label] of [
    ["id", "Artefact ID"],
    ["profileId", "Artefact profile"],
    ["destinationId", "Artefact destination"],
  ]) {
    if (!SAFE_ID.test(String(record[field] ?? ""))) errors.push(`${label} is invalid`);
  }
  if (!SAFE_TYPE.test(String(record.artefactTypeId ?? record.artefactType ?? ""))) errors.push("Artefact type is invalid");
  const contentValidation = validateArtefactContent(
    record.artefactTypeId ?? record.artefactType,
    record.content ?? record.structuredContent,
  );
  if (!contentValidation.valid) errors.push(...contentValidation.errors);
  if (!cleanText(record.title, 120)) errors.push("Artefact title is missing");
  if (!Number.isInteger(record.versionNumber ?? record.version) || (record.versionNumber ?? record.version) < 1) {
    errors.push("Artefact version is invalid");
  }
  if (!Number.isInteger(record.schemaVersion) || record.schemaVersion < 1) errors.push("Artefact schema version is invalid");
  validateTimestamp(record.createdAt, "Artefact creation date", errors);
  validateTimestamp(record.updatedAt, "Artefact update date", errors);
  if (record.revisedAt) validateTimestamp(record.revisedAt, "Artefact revision date", errors);
  return { valid: errors.length === 0, errors };
}

export function validateArtefactVersion(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["Artefact version is not an object"] };
  }
  if (!SAFE_ID.test(String(record.id ?? ""))) errors.push("Version ID is invalid");
  if (!SAFE_ID.test(String(record.artefactId ?? ""))) errors.push("Version artefact ID is invalid");
  if (!SAFE_ID.test(String(record.profileId ?? ""))) errors.push("Version profile is invalid");
  if (!Number.isInteger(record.version) || record.version < 1) errors.push("Version number is invalid");
  if (!record.snapshot || typeof record.snapshot !== "object") errors.push("Version snapshot is missing");
  validateTimestamp(record.createdAt, "Version date", errors);
  return { valid: errors.length === 0, errors };
}

export function validatePlanetResponse(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["Planet Question response is not an object"] };
  }
  if (!SAFE_ID.test(String(record.id ?? ""))) errors.push("Response ID is invalid");
  if (!SAFE_ID.test(String(record.profileId ?? ""))) errors.push("Response profile is invalid");
  if (record.question !== PLANET_QUESTION) errors.push("Planet Question text is invalid");
  for (const field of ["linkedArtefactIds", "evidence"]) {
    if (!Array.isArray(record[field])) {
      errors.push(`Response ${field} must be an array`);
    } else if (record[field].some((id) => typeof id !== "string" || !SAFE_ID.test(id))) {
      errors.push(`Response ${field} contains an invalid artefact ID`);
    }
  }
  if (!Array.isArray(record.visualIdeas)) errors.push("Response visual ideas must be an array");
  validateTimestamp(record.createdAt, "Response date", errors);
  return { valid: errors.length === 0, errors };
}

export function validateActivityState(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["Activity state is not an object"] };
  }
  if (!SAFE_ID.test(String(record.id ?? ""))) errors.push("Activity state ID is invalid");
  if (!SAFE_ID.test(String(record.profileId ?? ""))) errors.push("Activity state profile is invalid");
  if (!SAFE_ID.test(String(record.activityId ?? ""))) errors.push("Activity state activity is invalid");
  if (!isPlainObject(record.state)) errors.push("Activity state payload must be a plain object");
  validateTimestamp(record.createdAt, "Activity state creation date", errors);
  validateTimestamp(record.updatedAt, "Activity state update date", errors);
  return { valid: errors.length === 0, errors };
}

async function recoverRecord(storeName, record, validator) {
  const validation = validator(record);
  if (validation.valid) return record;
  await quarantineRecord(storeName, record?.id || `unknown-${Date.now()}`, record, validation.errors.join("; "), {
    remove: Boolean(record?.id),
  });
  return null;
}

async function recoverPlanetResponse(record) {
  const normalised = normalisePlanetResponse(record);
  const validation = validatePlanetResponse(normalised);
  if (!validation.valid) {
    await quarantineRecord(
      STORES.PLANET_RESPONSES,
      record?.id || `unknown-${Date.now()}`,
      record,
      validation.errors.join("; "),
      { remove: Boolean(record?.id) },
    );
    return null;
  }

  const needsRepair = !sameStringArray(record.linkedArtefactIds, normalised.linkedArtefactIds)
    || !sameStringArray(record.evidence, normalised.evidence)
    || !Array.isArray(record.visualIdeas)
    || record.shortText !== normalised.shortText
    || record.text !== normalised.text;
  if (needsRepair) await putRecord(STORES.PLANET_RESPONSES, normalised);
  return normalised;
}

function versionRecord(artefact, reason = "saved") {
  return {
    id: `version:${artefact.id}:${artefact.version}`,
    artefactId: artefact.id,
    profileId: artefact.profileId,
    version: artefact.version,
    reason: cleanText(reason, 100) || "saved",
    createdAt: artefact.updatedAt,
    snapshot: { ...artefact },
    schemaVersion: ARTEFACT_SCHEMA_VERSION,
  };
}

function buildArtefact(profileId, input) {
  if (!input || typeof input !== "object") throw new TypeError("Artefact details are required");
  const timestamp = now();
  const id = makeId("artefact");
  const artefactTypeId = safeType(input.artefactTypeId ?? input.artefactType ?? input.type);
  const content = input.content ?? input.structuredContent ?? {};
  const record = {
    id,
    profileId,
    destinationId: assertId(input.destinationId ?? input.destination, "Destination ID"),
    activityId: assertId(input.activityId ?? input.activity, "Activity ID", { optional: true }),
    keyActivityId: assertId(input.keyActivityId ?? input.keyId, "Key Activity ID", { optional: true }),
    title: cleanText(input.title, 120) || "My work",
    artefactTypeId,
    artefactType: artefactTypeId,
    type: artefactTypeId,
    curriculumTags: stringList(input.curriculumTags),
    conceptTags: stringList(input.conceptTags),
    content,
    structuredContent: content,
    preview: input.preview ?? null,
    voiceExplanation: input.voiceExplanation ?? null,
    voiceExplanationRef: input.voiceExplanationRef ?? null,
    writtenExplanation: cleanText(input.writtenExplanation ?? input.explanation, 2000),
    explanation: cleanText(input.writtenExplanation ?? input.explanation, 2000),
    linkedArtefactIds: idList(input.linkedArtefactIds),
    reflection: input.reflection ? cleanText(input.reflection, 400) : null,
    createdAt: timestamp,
    updatedAt: timestamp,
    revisedAt: timestamp,
    version: 1,
    versionNumber: 1,
    parentVersionId: assertId(input.parentVersionId, "Parent version ID", { optional: true }),
    versionHistory: [{
      id: `version:${id}:1`,
      versionNumber: 1,
      revisedAt: timestamp,
      reason: "created",
    }],
    schemaVersion: ARTEFACT_SCHEMA_VERSION,
  };
  const validation = validateArtefact(record);
  if (!validation.valid) throw new TypeError(validation.errors.join("; "));
  return record;
}

export async function createArtefact(profileId, input) {
  const learnerId = await assertProfileExists(profileId);
  const artefact = buildArtefact(learnerId, input);
  const version = versionRecord(artefact, "created");
  await runTransaction([STORES.ARTEFACTS, STORES.ARTEFACT_VERSIONS], "readwrite", async (transaction) => {
    await transaction.add(STORES.ARTEFACTS, artefact);
    await transaction.add(STORES.ARTEFACT_VERSIONS, version);
  });
  return artefact;
}

export async function saveArtefact(input) {
  if (!input?.profileId) throw new TypeError("A profile ID is required");
  return createArtefact(input.profileId, input);
}

export async function getArtefact(profileId, artefactId) {
  const learnerId = await assertProfileExists(profileId);
  const record = await getRecord(STORES.ARTEFACTS, assertId(artefactId, "Artefact ID"));
  if (!record || record.profileId !== learnerId) return null;
  return recoverRecord(STORES.ARTEFACTS, record, validateArtefact);
}

export async function listArtefacts(profileId, filters = {}) {
  const learnerId = await assertProfileExists(profileId);
  const records = await getAllRecords(STORES.ARTEFACTS, { index: "profileId", query: learnerId });
  const results = [];
  for (const record of records) {
    const artefact = await recoverRecord(STORES.ARTEFACTS, record, validateArtefact);
    if (!artefact) continue;
    if (filters.destinationId && artefact.destinationId !== filters.destinationId) continue;
    if (filters.activityId && artefact.activityId !== filters.activityId) continue;
    if (filters.artefactType && artefact.artefactTypeId !== filters.artefactType) continue;
    if (filters.conceptTag && !artefact.conceptTags.includes(filters.conceptTag)) continue;
    if (filters.curriculumTag && !artefact.curriculumTags.includes(filters.curriculumTag)) continue;
    results.push(artefact);
  }
  return results.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function applyArtefactChanges(existing, changes) {
  const updated = { ...existing };
  if (changes.title !== undefined) updated.title = cleanText(changes.title, 120) || existing.title;
  if (changes.destinationId !== undefined) updated.destinationId = assertId(changes.destinationId, "Destination ID");
  if (changes.activityId !== undefined) updated.activityId = assertId(changes.activityId, "Activity ID", { optional: true });
  if (changes.keyActivityId !== undefined) updated.keyActivityId = assertId(changes.keyActivityId, "Key Activity ID", { optional: true });
  if (changes.artefactTypeId !== undefined || changes.artefactType !== undefined || changes.type !== undefined) {
    updated.artefactTypeId = safeType(changes.artefactTypeId ?? changes.artefactType ?? changes.type);
    updated.artefactType = updated.artefactTypeId;
    updated.type = updated.artefactTypeId;
  }
  if (changes.curriculumTags !== undefined) updated.curriculumTags = stringList(changes.curriculumTags);
  if (changes.conceptTags !== undefined) updated.conceptTags = stringList(changes.conceptTags);
  if (changes.structuredContent !== undefined || changes.content !== undefined) {
    updated.content = changes.content ?? changes.structuredContent;
    updated.structuredContent = updated.content;
  }
  if (changes.preview !== undefined) updated.preview = changes.preview;
  if (changes.voiceExplanation !== undefined) updated.voiceExplanation = changes.voiceExplanation;
  if (changes.voiceExplanationRef !== undefined) updated.voiceExplanationRef = changes.voiceExplanationRef;
  if (changes.writtenExplanation !== undefined || changes.explanation !== undefined) {
    updated.writtenExplanation = cleanText(changes.writtenExplanation ?? changes.explanation, 2000);
    updated.explanation = updated.writtenExplanation;
  }
  if (changes.linkedArtefactIds !== undefined) updated.linkedArtefactIds = idList(changes.linkedArtefactIds);
  if (changes.reflection !== undefined) {
    updated.reflection = changes.reflection ? cleanText(changes.reflection, 400) : null;
  }
  updated.version = (existing.versionNumber ?? existing.version) + 1;
  updated.versionNumber = updated.version;
  updated.updatedAt = now();
  updated.revisedAt = updated.updatedAt;
  updated.versionHistory = [
    ...(Array.isArray(existing.versionHistory) ? existing.versionHistory : []),
    {
      id: `version:${existing.id}:${updated.version}`,
      versionNumber: updated.version,
      revisedAt: updated.updatedAt,
      reason: "revised",
    },
  ];
  updated.schemaVersion = ARTEFACT_SCHEMA_VERSION;
  return updated;
}

export async function updateArtefact(profileId, artefactId, changes = {}, { reason = "revised" } = {}) {
  const learnerId = await assertProfileExists(profileId);
  const id = assertId(artefactId, "Artefact ID");
  return runTransaction([STORES.ARTEFACTS, STORES.ARTEFACT_VERSIONS], "readwrite", async (transaction) => {
    const existing = await transaction.get(STORES.ARTEFACTS, id);
    if (!existing || existing.profileId !== learnerId) throw new Error("The saved work could not be found");
    const updated = applyArtefactChanges(existing, changes);
    updated.versionHistory[updated.versionHistory.length - 1].reason = cleanText(reason, 100) || "revised";
    const validation = validateArtefact(updated);
    if (!validation.valid) throw new TypeError(validation.errors.join("; "));
    await transaction.put(STORES.ARTEFACTS, updated);
    await transaction.add(STORES.ARTEFACT_VERSIONS, versionRecord(updated, reason));
    return updated;
  });
}

export function renameArtefact(profileId, artefactId, title) {
  return updateArtefact(profileId, artefactId, { title }, { reason: "renamed" });
}

export function addArtefactReflection(profileId, artefactId, reflection) {
  return updateArtefact(profileId, artefactId, { reflection }, { reason: "reflection added" });
}

export async function getArtefactVersions(profileId, artefactId) {
  const learnerId = await assertProfileExists(profileId);
  const id = assertId(artefactId, "Artefact ID");
  const current = await getArtefact(learnerId, id);
  if (!current) return [];
  const records = await getAllRecords(STORES.ARTEFACT_VERSIONS, { index: "artefactId", query: id });
  const versions = [];
  for (const record of records) {
    if (record.profileId !== learnerId) continue;
    const recovered = await recoverRecord(STORES.ARTEFACT_VERSIONS, record, validateArtefactVersion);
    if (recovered) versions.push(recovered);
  }
  return versions.sort((left, right) => left.version - right.version);
}

export async function getArtefactVersion(profileId, artefactId, versionNumber) {
  const learnerId = await assertProfileExists(profileId);
  const id = assertId(artefactId, "Artefact ID");
  if (!Number.isInteger(versionNumber) || versionNumber < 1) throw new TypeError("Version number is invalid");
  const record = await getRecord(STORES.ARTEFACT_VERSIONS, `version:${id}:${versionNumber}`);
  if (!record || record.profileId !== learnerId) return null;
  return recoverRecord(STORES.ARTEFACT_VERSIONS, record, validateArtefactVersion);
}

export async function restoreArtefactVersion(profileId, artefactId, versionNumber) {
  const historic = await getArtefactVersion(profileId, artefactId, versionNumber);
  if (!historic) throw new Error("That saved version could not be found");
  const snapshot = historic.snapshot;
  return updateArtefact(profileId, artefactId, {
    title: snapshot.title,
    destinationId: snapshot.destinationId,
    activityId: snapshot.activityId,
    keyActivityId: snapshot.keyActivityId,
    artefactType: snapshot.artefactType,
    artefactTypeId: snapshot.artefactTypeId,
    curriculumTags: snapshot.curriculumTags,
    conceptTags: snapshot.conceptTags,
    content: snapshot.content ?? snapshot.structuredContent,
    preview: snapshot.preview,
    voiceExplanation: snapshot.voiceExplanation,
    voiceExplanationRef: snapshot.voiceExplanationRef,
    writtenExplanation: snapshot.writtenExplanation,
    linkedArtefactIds: snapshot.linkedArtefactIds,
    reflection: snapshot.reflection,
  }, { reason: `restored from version ${versionNumber}` });
}

export async function duplicateArtefact(profileId, artefactId, { title } = {}) {
  const original = await getArtefact(profileId, artefactId);
  if (!original) throw new Error("The saved work could not be found");
  return createArtefact(profileId, {
    ...original,
    title: cleanText(title, 120) || `${original.title} — copy`,
    parentVersionId: `version:${original.id}:${original.versionNumber ?? original.version}`,
    linkedArtefactIds: [...new Set([...original.linkedArtefactIds, original.id])],
  });
}

export async function deleteArtefact(profileId, artefactId, { confirm = false } = {}) {
  if (!confirm) throw new Error("Deleting saved work requires explicit confirmation");
  const learnerId = await assertProfileExists(profileId);
  const id = assertId(artefactId, "Artefact ID");
  return runTransaction(
    [STORES.ARTEFACTS, STORES.ARTEFACT_VERSIONS, STORES.KEY_ACCESS],
    "readwrite",
    async (transaction) => {
      const artefact = await transaction.get(STORES.ARTEFACTS, id);
      if (!artefact || artefact.profileId !== learnerId) return false;
      const versions = await transaction.getAll(STORES.ARTEFACT_VERSIONS, { index: "artefactId", query: id });
      for (const version of versions) await transaction.delete(STORES.ARTEFACT_VERSIONS, version.id);
      const accessRecords = await transaction.getAll(STORES.KEY_ACCESS, { index: "profileId", query: learnerId });
      for (const access of accessRecords) {
        if (!access.savedArtefactIds?.includes(id)) continue;
        access.savedArtefactIds = access.savedArtefactIds.filter((savedId) => savedId !== id);
        await transaction.put(STORES.KEY_ACCESS, access);
      }
      await transaction.delete(STORES.ARTEFACTS, id);
      return true;
    },
  );
}

export async function addPlanetQuestionResponse(profileId, input = {}) {
  const learnerId = await assertProfileExists(profileId);
  const linkedArtefactIds = [...new Set([
    ...legacyIdList(input.linkedArtefactIds, 40),
    ...legacyIdList(input.evidence, 40),
  ])];
  const response = normalisePlanetResponse({
    id: makeId("planet-response"),
    profileId: learnerId,
    question: PLANET_QUESTION,
    shortText: cleanText(input.shortText ?? input.text, 2000),
    text: cleanText(input.shortText ?? input.text, 2000),
    visualIdeas: stringList(input.visualIdeas, 20, 120),
    linkedArtefactIds,
    voiceResponse: input.voiceResponse ?? input.voice ?? null,
    whatChangedMyThinking: cleanText(input.whatChangedMyThinking, 1000),
    evidence: [...linkedArtefactIds],
    stillWondering: cleanText(input.stillWondering ?? input.wonder, 1000),
    sourceActivityId: assertId(input.sourceActivityId, "Source activity ID", { optional: true }),
    createdAt: now(),
    schemaVersion: ARTEFACT_SCHEMA_VERSION,
  });
  if (!response.shortText
    && response.visualIdeas.length === 0
    && response.linkedArtefactIds.length === 0
    && !response.voiceResponse
    && !response.stillWondering) {
    throw new TypeError("Add a thought, voice response, visual idea, work link, or question before saving");
  }
  const validation = validatePlanetResponse(response);
  if (!validation.valid) throw new TypeError(validation.errors.join("; "));
  await runTransaction(STORES.PLANET_RESPONSES, "readwrite", (transaction) => (
    transaction.add(STORES.PLANET_RESPONSES, response)
  ));
  return response;
}

export async function listPlanetQuestionResponses(profileId) {
  const learnerId = await assertProfileExists(profileId);
  const records = await getAllRecords(STORES.PLANET_RESPONSES, { index: "profileId", query: learnerId });
  const results = [];
  for (const record of records) {
    const response = await recoverPlanetResponse(record);
    if (response) results.push(response);
  }
  return results.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function deletePlanetQuestionResponse(profileId, responseId, { confirm = false } = {}) {
  if (!confirm) throw new Error("Deleting a Planet Question response requires explicit confirmation");
  const learnerId = await assertProfileExists(profileId);
  const id = assertId(responseId, "Response ID");
  return runTransaction(STORES.PLANET_RESPONSES, "readwrite", async (transaction) => {
    const response = await transaction.get(STORES.PLANET_RESPONSES, id);
    if (!response || response.profileId !== learnerId) return false;
    await transaction.delete(STORES.PLANET_RESPONSES, id);
    return true;
  });
}

export async function saveActivityState(profileId, activityId, state, details = {}) {
  const learnerId = await assertProfileExists(profileId);
  const safeActivityId = assertId(activityId, "Activity ID");
  const id = `state:${learnerId}:${safeActivityId}`;
  const existing = await getRecord(STORES.ACTIVITY_STATE, id);
  const record = {
    id,
    profileId: learnerId,
    activityId: safeActivityId,
    destinationId: assertId(
      details.destinationId ?? existing?.destinationId,
      "Destination ID",
      { optional: true },
    ),
    state,
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
    schemaVersion: ARTEFACT_SCHEMA_VERSION,
  };
  const validation = validateActivityState(record);
  if (!validation.valid) throw new TypeError(validation.errors.join("; "));
  await runTransaction(STORES.ACTIVITY_STATE, "readwrite", (transaction) => (
    transaction.put(STORES.ACTIVITY_STATE, record)
  ));
  return record;
}

export async function getActivityState(profileId, activityId) {
  const learnerId = await assertProfileExists(profileId);
  const id = `state:${learnerId}:${assertId(activityId, "Activity ID")}`;
  const record = await getRecord(STORES.ACTIVITY_STATE, id);
  if (!record || record.profileId !== learnerId) return null;
  return recoverRecord(STORES.ACTIVITY_STATE, record, validateActivityState);
}

export async function listActivityStates(profileId) {
  const learnerId = await assertProfileExists(profileId);
  const records = await getAllRecords(STORES.ACTIVITY_STATE, { index: "profileId", query: learnerId });
  const results = [];
  for (const record of records) {
    const state = await recoverRecord(STORES.ACTIVITY_STATE, record, validateActivityState);
    if (state) results.push(state);
  }
  return results.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function clearActivityState(profileId, activityId, { confirm = false } = {}) {
  if (!confirm) throw new Error("Clearing unfinished work requires explicit confirmation");
  const learnerId = await assertProfileExists(profileId);
  const id = `state:${learnerId}:${assertId(activityId, "Activity ID")}`;
  return runTransaction(STORES.ACTIVITY_STATE, "readwrite", async (transaction) => {
    const record = await transaction.get(STORES.ACTIVITY_STATE, id);
    if (!record || record.profileId !== learnerId) return false;
    await transaction.delete(STORES.ACTIVITY_STATE, id);
    return true;
  });
}

export async function clearProfileWork(profileId, { confirm = false, includePlanetResponses = true } = {}) {
  if (!confirm) throw new Error("Clearing a learner's saved work requires explicit confirmation");
  const learnerId = await assertProfileExists(profileId);
  const stores = [
    STORES.ARTEFACTS,
    STORES.ARTEFACT_VERSIONS,
    STORES.ACTIVITY_STATE,
    STORES.KEY_ACCESS,
  ];
  if (includePlanetResponses) stores.push(STORES.PLANET_RESPONSES);
  await runTransaction(stores, "readwrite", async (transaction) => {
    for (const storeName of stores.filter((name) => name !== STORES.KEY_ACCESS)) {
      const records = await transaction.getAll(storeName, { index: "profileId", query: learnerId });
      for (const record of records) await transaction.delete(storeName, record.id);
    }
    const accessRecords = await transaction.getAll(STORES.KEY_ACCESS, { index: "profileId", query: learnerId });
    for (const access of accessRecords) {
      access.savedArtefactIds = [];
      await transaction.put(STORES.KEY_ACCESS, access);
    }
  });
  return true;
}

export const createPlanetQuestionResponse = addPlanetQuestionResponse;
export const listPlanetResponses = listPlanetQuestionResponses;
