import {
  DATABASE_VERSION,
  STORES,
  getAllRecords,
  runTransaction,
} from "./db.js";
import { validateProfile } from "./profiles.js";
import { validateActivityAccess, validateKeyGrant } from "./keyAccess.js";
import {
  validateActivityState,
  validateArtefact,
  validateArtefactVersion,
  validatePlanetResponse,
} from "./artefacts.js";

export const BACKUP_FORMAT = "our-planet-backup";
export const BACKUP_FORMAT_VERSION = 1;
export const MAX_BACKUP_BYTES = 128 * 1024 * 1024;

const BACKUP_STORES = Object.freeze([
  STORES.PROFILES,
  STORES.KEY_GRANTS,
  STORES.KEY_ACCESS,
  STORES.ARTEFACTS,
  STORES.ARTEFACT_VERSIONS,
  STORES.PLANET_RESPONSES,
  STORES.ACTIVITY_STATE,
  STORES.METADATA,
]);

const KEY_PATHS = Object.freeze({
  [STORES.PROFILES]: "id",
  [STORES.KEY_GRANTS]: "id",
  [STORES.KEY_ACCESS]: "id",
  [STORES.ARTEFACTS]: "id",
  [STORES.ARTEFACT_VERSIONS]: "id",
  [STORES.PLANET_RESPONSES]: "id",
  [STORES.ACTIVITY_STATE]: "id",
  [STORES.METADATA]: "key",
});

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes) {
  let result = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    result += BASE64[first >> 2];
    result += BASE64[((first & 3) << 4) | ((second ?? 0) >> 4)];
    result += second === undefined ? "=" : BASE64[((second & 15) << 2) | ((third ?? 0) >> 6)];
    result += third === undefined ? "=" : BASE64[third & 63];
  }
  return result;
}

function base64ToBytes(value) {
  const input = String(value ?? "").replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input) || input.length % 4 !== 0) {
    throw new TypeError("Backup contains invalid binary data");
  }
  const outputLength = Math.max(0, (input.length / 4) * 3 - (input.endsWith("==") ? 2 : input.endsWith("=") ? 1 : 0));
  const output = new Uint8Array(outputLength);
  let outputIndex = 0;
  for (let index = 0; index < input.length; index += 4) {
    const a = BASE64.indexOf(input[index]);
    const b = BASE64.indexOf(input[index + 1]);
    const c = input[index + 2] === "=" ? 0 : BASE64.indexOf(input[index + 2]);
    const d = input[index + 3] === "=" ? 0 : BASE64.indexOf(input[index + 3]);
    if (outputIndex < outputLength) output[outputIndex++] = (a << 2) | (b >> 4);
    if (outputIndex < outputLength) output[outputIndex++] = ((b & 15) << 4) | (c >> 2);
    if (outputIndex < outputLength) output[outputIndex++] = ((c & 3) << 6) | d;
  }
  return output;
}

function safeObjectEntries(value) {
  return Object.entries(value).filter(([key]) => (
    key !== "__proto__" && key !== "prototype" && key !== "constructor"
  ));
}

async function encodeValue(value, depth = 0, seen = new WeakSet()) {
  if (depth > 80) throw new TypeError("Backup data is nested too deeply");
  if (value === null || value === undefined || typeof value === "string" || typeof value === "boolean") {
    return value ?? null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : { __ourPlanetType: "Number", value: String(value) };
  }
  if (typeof value === "bigint") return { __ourPlanetType: "BigInt", value: value.toString() };
  if (typeof value !== "object") throw new TypeError("Backup contains a value that cannot be exported");
  if (seen.has(value)) throw new TypeError("Backup data contains a circular reference");

  if (value instanceof Date) return { __ourPlanetType: "Date", value: value.toISOString() };
  if (typeof File !== "undefined" && value instanceof File) {
    return {
      __ourPlanetType: "File",
      name: value.name,
      mimeType: value.type,
      lastModified: value.lastModified,
      data: bytesToBase64(new Uint8Array(await value.arrayBuffer())),
    };
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return {
      __ourPlanetType: "Blob",
      mimeType: value.type,
      data: bytesToBase64(new Uint8Array(await value.arrayBuffer())),
    };
  }
  if (value instanceof ArrayBuffer) {
    return { __ourPlanetType: "ArrayBuffer", data: bytesToBase64(new Uint8Array(value)) };
  }
  if (ArrayBuffer.isView(value)) {
    return {
      __ourPlanetType: "TypedArray",
      constructorName: value.constructor.name,
      data: bytesToBase64(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)),
    };
  }

  seen.add(value);
  if (Array.isArray(value)) {
    const result = [];
    for (const item of value) result.push(await encodeValue(item, depth + 1, seen));
    seen.delete(value);
    return result;
  }
  const result = {};
  for (const [key, item] of safeObjectEntries(value)) {
    result[key] = await encodeValue(item, depth + 1, seen);
  }
  seen.delete(value);
  return result;
}

function decodeValue(value, depth = 0) {
  if (depth > 80) throw new TypeError("Backup data is nested too deeply");
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => decodeValue(item, depth + 1));
  const marker = value.__ourPlanetType;
  if (marker === "Date") {
    const date = new Date(value.value);
    if (Number.isNaN(date.getTime())) throw new TypeError("Backup contains an invalid date");
    return date;
  }
  if (marker === "Number") {
    if (value.value === "NaN") return Number.NaN;
    if (value.value === "Infinity") return Infinity;
    if (value.value === "-Infinity") return -Infinity;
    throw new TypeError("Backup contains an invalid number");
  }
  if (marker === "BigInt") return BigInt(value.value);
  if (marker === "ArrayBuffer") return base64ToBytes(value.data).buffer;
  if (marker === "Blob" || marker === "File") {
    const bytes = base64ToBytes(value.data);
    if (marker === "File" && typeof File !== "undefined") {
      return new File([bytes], String(value.name || "recording"), {
        type: String(value.mimeType || ""),
        lastModified: Number(value.lastModified) || Date.now(),
      });
    }
    return new Blob([bytes], { type: String(value.mimeType || "") });
  }
  if (marker === "TypedArray") {
    const bytes = base64ToBytes(value.data);
    const constructors = {
      Uint8Array,
      Uint8ClampedArray,
      Int8Array,
      Uint16Array,
      Int16Array,
      Uint32Array,
      Int32Array,
      Float32Array,
      Float64Array,
      BigInt64Array: globalThis.BigInt64Array,
      BigUint64Array: globalThis.BigUint64Array,
      DataView,
    };
    const Constructor = constructors[value.constructorName];
    if (!Constructor) throw new TypeError("Backup contains an unsupported typed array");
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    return Constructor === DataView ? new DataView(buffer) : new Constructor(buffer);
  }

  const result = {};
  for (const [key, item] of safeObjectEntries(value)) result[key] = decodeValue(item, depth + 1);
  return result;
}

async function sha256(value) {
  if (!globalThis.crypto?.subtle || typeof TextEncoder === "undefined") return null;
  try {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return bytesToBase64(new Uint8Array(digest));
  } catch {
    return null;
  }
}

function integritySource(payload) {
  const { integrity, ...unsigned } = payload;
  return JSON.stringify(unsigned);
}

export async function createBackup({ appVersion = "unknown", includeRecoveryRecords = false } = {}) {
  const stores = {};
  for (const storeName of BACKUP_STORES) {
    let records = await getAllRecords(storeName);
    if (storeName === STORES.METADATA && !includeRecoveryRecords) {
      records = records.filter((record) => !String(record.key).startsWith("quarantine:"));
    }
    stores[storeName] = await encodeValue(records);
  }
  const payload = {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    databaseSchemaVersion: DATABASE_VERSION,
    appVersion: String(appVersion),
    exportedAt: new Date().toISOString(),
    stores,
  };
  const digest = await sha256(integritySource(payload));
  if (digest) payload.integrity = { algorithm: "SHA-256", digest };
  return payload;
}

export async function exportBackup(options) {
  const payload = await createBackup(options);
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

async function readBackupInput(source) {
  if (typeof Blob !== "undefined" && source instanceof Blob) {
    if (source.size > MAX_BACKUP_BYTES) throw new RangeError("This backup is too large to import safely");
    return JSON.parse(await source.text());
  }
  if (typeof source === "string") {
    if (source.length > MAX_BACKUP_BYTES) throw new RangeError("This backup is too large to import safely");
    return JSON.parse(source);
  }
  if (source && typeof source === "object") return source;
  throw new TypeError("Choose an Our Planet backup file");
}

async function parseBackup(source) {
  const raw = await readBackupInput(source);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new TypeError("Backup file is not valid");
  if (raw.format !== BACKUP_FORMAT) throw new TypeError("This is not an Our Planet backup");
  if (!Number.isInteger(raw.formatVersion) || raw.formatVersion < 1) {
    throw new TypeError("Backup format version is missing");
  }
  if (raw.formatVersion > BACKUP_FORMAT_VERSION) {
    throw new Error("This backup was made by a newer version of Our Planet");
  }
  if (!raw.stores || typeof raw.stores !== "object" || Array.isArray(raw.stores)) {
    throw new TypeError("Backup stores are missing");
  }
  if (raw.integrity?.digest) {
    const expected = await sha256(integritySource(raw));
    if (expected && expected !== raw.integrity.digest) {
      throw new Error("The backup appears to be incomplete or altered");
    }
  }

  const stores = {};
  for (const storeName of BACKUP_STORES) {
    const encoded = raw.stores[storeName] ?? [];
    if (!Array.isArray(encoded)) throw new TypeError(`Backup store ${storeName} is invalid`);
    if (encoded.length > 100000) throw new RangeError(`Backup store ${storeName} contains too many records`);
    stores[storeName] = decodeValue(encoded);
  }
  return { header: raw, stores };
}

function validateMetadata(record) {
  return record && typeof record === "object" && typeof record.key === "string" && record.key
    ? { valid: true, errors: [] }
    : { valid: false, errors: ["Metadata key is missing"] };
}

const VALIDATORS = Object.freeze({
  [STORES.PROFILES]: validateProfile,
  [STORES.KEY_GRANTS]: validateKeyGrant,
  [STORES.KEY_ACCESS]: validateActivityAccess,
  [STORES.ARTEFACTS]: validateArtefact,
  [STORES.ARTEFACT_VERSIONS]: validateArtefactVersion,
  [STORES.PLANET_RESPONSES]: validatePlanetResponse,
  [STORES.ACTIVITY_STATE]: validateActivityState,
  [STORES.METADATA]: validateMetadata,
});

async function inspectDecodedBackup(parsed) {
  const accepted = {};
  const rejected = [];
  const existingProfiles = await getAllRecords(STORES.PROFILES);
  const knownProfiles = new Set([
    ...existingProfiles.filter((profile) => validateProfile(profile).valid).map((profile) => profile.id),
    ...parsed.stores[STORES.PROFILES]
      .filter((profile) => validateProfile(profile).valid)
      .map((profile) => profile.id),
  ].filter(Boolean));

  for (const storeName of BACKUP_STORES) {
    accepted[storeName] = [];
    const seenKeys = new Set();
    for (const record of parsed.stores[storeName]) {
      const validation = VALIDATORS[storeName](record);
      const recordKey = record?.[KEY_PATHS[storeName]];
      if (!validation.valid) {
        rejected.push({ storeName, recordKey: recordKey ?? null, reasons: validation.errors });
        continue;
      }
      if (seenKeys.has(recordKey)) {
        rejected.push({ storeName, recordKey, reasons: ["Duplicate record key in backup"] });
        continue;
      }
      if (storeName !== STORES.PROFILES && storeName !== STORES.METADATA
        && record.profileId && !knownProfiles.has(record.profileId)) {
        rejected.push({ storeName, recordKey, reasons: ["Referenced learner profile is missing"] });
        continue;
      }
      seenKeys.add(recordKey);
      accepted[storeName].push(record);
    }
  }

  const knownArtefacts = new Set([
    ...(await getAllRecords(STORES.ARTEFACTS)).map((record) => record.id),
    ...accepted[STORES.ARTEFACTS].map((record) => record.id),
  ]);
  accepted[STORES.ARTEFACT_VERSIONS] = accepted[STORES.ARTEFACT_VERSIONS].filter((record) => {
    if (knownArtefacts.has(record.artefactId)) return true;
    rejected.push({
      storeName: STORES.ARTEFACT_VERSIONS,
      recordKey: record.id,
      reasons: ["Referenced artefact is missing"],
    });
    return false;
  });

  return { accepted, rejected };
}

export async function inspectBackup(source) {
  const parsed = await parseBackup(source);
  const inspection = await inspectDecodedBackup(parsed);
  return {
    formatVersion: parsed.header.formatVersion,
    databaseSchemaVersion: parsed.header.databaseSchemaVersion,
    appVersion: parsed.header.appVersion,
    exportedAt: parsed.header.exportedAt,
    counts: Object.fromEntries(BACKUP_STORES.map((storeName) => [
      storeName,
      inspection.accepted[storeName].length,
    ])),
    rejected: inspection.rejected,
    canReplaceSafely: inspection.rejected.length === 0,
  };
}

function recordDate(record) {
  for (const field of ["updatedAt", "lastUsedAt", "lastVisitedAt", "grantedAt", "createdAt"]) {
    const value = Date.parse(record?.[field]);
    if (!Number.isNaN(value)) return value;
  }
  return 0;
}

function chooseMergedRecord(existing, incoming, strategy) {
  if (!existing) return incoming;
  if (strategy === "imported-wins") return incoming;
  if (strategy === "existing-wins") return existing;
  return recordDate(incoming) > recordDate(existing) ? incoming : existing;
}

/**
 * Import safely. `merge` is non-destructive and the default. `replace` requires
 * explicit confirmation and, unless allowPartial is set, a completely valid file.
 */
export async function importBackup(source, {
  mode = "merge",
  conflictStrategy = "newer-wins",
  confirm = false,
  allowPartial = false,
} = {}) {
  if (!new Set(["merge", "replace"]).has(mode)) throw new TypeError("Backup import mode is invalid");
  if (!new Set(["newer-wins", "imported-wins", "existing-wins"]).has(conflictStrategy)) {
    throw new TypeError("Backup conflict strategy is invalid");
  }
  if (mode === "replace" && !confirm) {
    throw new Error("Replacing all local data requires explicit confirmation");
  }

  const parsed = await parseBackup(source);
  const { accepted, rejected } = await inspectDecodedBackup(parsed);
  if (mode === "replace") {
    const importedProfileIds = new Set(accepted[STORES.PROFILES].map((record) => record.id));
    for (const storeName of BACKUP_STORES.filter((name) => name !== STORES.PROFILES && name !== STORES.METADATA)) {
      accepted[storeName] = accepted[storeName].filter((record) => {
        if (!record.profileId || importedProfileIds.has(record.profileId)) return true;
        rejected.push({
          storeName,
          recordKey: record[KEY_PATHS[storeName]],
          reasons: ["Referenced learner profile is not present in the replacement backup"],
        });
        return false;
      });
    }
    const importedArtefactIds = new Set(accepted[STORES.ARTEFACTS].map((record) => record.id));
    accepted[STORES.ARTEFACT_VERSIONS] = accepted[STORES.ARTEFACT_VERSIONS].filter((record) => {
      if (importedArtefactIds.has(record.artefactId)) return true;
      rejected.push({
        storeName: STORES.ARTEFACT_VERSIONS,
        recordKey: record.id,
        reasons: ["Referenced artefact is not present in the replacement backup"],
      });
      return false;
    });
  }
  if (mode === "replace" && rejected.length > 0 && !allowPartial) {
    throw new Error("The backup contains invalid records, so local data was not replaced");
  }

  const importedCounts = Object.fromEntries(BACKUP_STORES.map((storeName) => [storeName, 0]));
  await runTransaction(BACKUP_STORES, "readwrite", async (transaction) => {
    if (mode === "replace") {
      for (const storeName of BACKUP_STORES) await transaction.clear(storeName);
    }
    for (const storeName of BACKUP_STORES) {
      const keyPath = KEY_PATHS[storeName];
      for (const incoming of accepted[storeName]) {
        const key = incoming[keyPath];
        const existing = mode === "merge" ? await transaction.get(storeName, key) : null;
        const selected = chooseMergedRecord(existing, incoming, conflictStrategy);
        if (selected !== existing || mode === "replace") {
          await transaction.put(storeName, selected);
          importedCounts[storeName] += 1;
        }
      }
    }
    await transaction.put(STORES.METADATA, {
      key: "schema",
      value: { version: DATABASE_VERSION, restoredFromBackup: true },
      updatedAt: new Date().toISOString(),
    });
    await transaction.put(STORES.METADATA, {
      key: "lastBackupImport",
      value: {
        importedAt: new Date().toISOString(),
        sourceExportedAt: parsed.header.exportedAt,
        mode,
      },
      updatedAt: new Date().toISOString(),
    });
  });

  return {
    mode,
    importedCounts,
    rejected,
    partial: rejected.length > 0,
    sourceExportedAt: parsed.header.exportedAt,
  };
}

export async function downloadBackup(options = {}) {
  const blob = await exportBackup(options);
  const date = new Date().toISOString().slice(0, 10);
  const filename = options.filename || `our-planet-backup-${date}.json`;
  if (typeof document === "undefined" || typeof URL === "undefined") return { blob, filename, downloaded: false };
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    return { blob, filename, downloaded: true };
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function clearAllLocalData({ confirm = false } = {}) {
  if (!confirm) throw new Error("Clearing all local profiles and work requires explicit confirmation");
  await runTransaction(BACKUP_STORES, "readwrite", async (transaction) => {
    for (const storeName of BACKUP_STORES) await transaction.clear(storeName);
    await transaction.put(STORES.METADATA, {
      key: "schema",
      value: { version: DATABASE_VERSION, clearedAt: new Date().toISOString() },
      updatedAt: new Date().toISOString(),
    });
  });
  return true;
}

export const restoreBackup = importBackup;
export const previewBackup = inspectBackup;
