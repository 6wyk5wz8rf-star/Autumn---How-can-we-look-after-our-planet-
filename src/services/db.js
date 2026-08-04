/**
 * IndexedDB gateway for Our Planet.
 *
 * The rest of the application talks to this small promise-based API rather
 * than opening IndexedDB directly. If IndexedDB is unavailable (private
 * browsing restrictions, an embedded preview, a test runner, or a failed
 * migration), the same API continues in memory for the current page session.
 */

export const DATABASE_NAME = "our-planet";
export const DATABASE_VERSION = 4;

export const STORES = Object.freeze({
  PROFILES: "profiles",
  KEY_GRANTS: "keyGrants",
  KEY_ACCESS: "keyAccess",
  ARTEFACTS: "artefacts",
  ARTEFACT_VERSIONS: "artefactVersions",
  PLANET_RESPONSES: "planetResponses",
  ACTIVITY_STATE: "activityState",
  METADATA: "metadata",
});

const STORE_DEFINITIONS = Object.freeze({
  [STORES.PROFILES]: { keyPath: "id" },
  [STORES.KEY_GRANTS]: { keyPath: "id" },
  [STORES.KEY_ACCESS]: { keyPath: "id" },
  [STORES.ARTEFACTS]: { keyPath: "id" },
  [STORES.ARTEFACT_VERSIONS]: { keyPath: "id" },
  [STORES.PLANET_RESPONSES]: { keyPath: "id" },
  [STORES.ACTIVITY_STATE]: { keyPath: "id" },
  [STORES.METADATA]: { keyPath: "key" },
});

const INDEX_DEFINITIONS = Object.freeze({
  [STORES.PROFILES]: [
    ["updatedAt", "updatedAt"],
  ],
  [STORES.KEY_GRANTS]: [
    ["profileId", "profileId"],
    ["keyId", "keyId"],
    ["profileKey", ["profileId", "keyId"], { unique: true }],
    ["profileGrantedAt", ["profileId", "grantedAt"]],
  ],
  [STORES.KEY_ACCESS]: [
    ["profileId", "profileId"],
    ["activityId", "activityId"],
    ["destinationId", "destinationId"],
    ["profileActivity", ["profileId", "activityId"], { unique: true }],
    ["profileLastVisited", ["profileId", "lastVisitedAt"]],
  ],
  [STORES.ARTEFACTS]: [
    ["profileId", "profileId"],
    ["destinationId", "destinationId"],
    ["activityId", "activityId"],
    ["artefactType", "artefactType"],
    ["profileUpdatedAt", ["profileId", "updatedAt"]],
  ],
  [STORES.ARTEFACT_VERSIONS]: [
    ["profileId", "profileId"],
    ["artefactId", "artefactId"],
    ["artefactVersion", ["artefactId", "version"], { unique: true }],
    ["artefactCreatedAt", ["artefactId", "createdAt"]],
  ],
  [STORES.PLANET_RESPONSES]: [
    ["profileId", "profileId"],
    ["profileCreatedAt", ["profileId", "createdAt"]],
  ],
  [STORES.ACTIVITY_STATE]: [
    ["profileId", "profileId"],
    ["activityId", "activityId"],
    ["profileActivity", ["profileId", "activityId"], { unique: true }],
    ["profileUpdatedAt", ["profileId", "updatedAt"]],
  ],
  [STORES.METADATA]: [],
});

let backendPromise;
let backendMode = "unopened";
let lastOpenError = null;
let openDatabaseName = DATABASE_NAME;
const statusListeners = new Set();

const memoryStores = new Map();

function emitStatus() {
  const status = getDatabaseStatus();
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch {
      // A diagnostic listener must never interrupt persistence.
    }
  });
}

function ensureKnownStore(storeName) {
  if (!Object.hasOwn(STORE_DEFINITIONS, storeName)) {
    throw new TypeError(`Unknown database store: ${String(storeName)}`);
  }
}

function createUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const random = globalThis.crypto?.getRandomValues
    ? globalThis.crypto.getRandomValues(new Uint32Array(4))
    : Array.from({ length: 4 }, () => Math.floor(Math.random() * 0xffffffff));
  return Array.from(random, (part) => part.toString(16).padStart(8, "0")).join("-");
}

function cloneValue(value, seen = new WeakMap()) {
  if (typeof globalThis.structuredClone === "function") {
    try {
      return globalThis.structuredClone(value);
    } catch {
      // Fall through to the conservative clone below for unusual host values.
    }
  }

  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof Blob !== "undefined" && value instanceof Blob) return value.slice(0, value.size, value.type);
  if (value instanceof ArrayBuffer) return value.slice(0);
  if (ArrayBuffer.isView(value)) {
    const buffer = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
    return value instanceof DataView ? new DataView(buffer) : new value.constructor(buffer);
  }
  if (seen.has(value)) throw new TypeError("Circular values cannot be persisted");
  seen.set(value, true);
  if (Array.isArray(value)) return value.map((item) => cloneValue(item, seen));

  const clone = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === "__proto__" || key === "prototype" || key === "constructor") continue;
    clone[key] = cloneValue(item, seen);
  }
  return clone;
}

function getPath(value, keyPath) {
  if (Array.isArray(keyPath)) return keyPath.map((part) => getPath(value, part));
  return String(keyPath)
    .split(".")
    .reduce((current, part) => current?.[part], value);
}

function compareKeys(left, right) {
  const a = Array.isArray(left) ? left : [left];
  const b = Array.isArray(right) ? right : [right];
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if (a[index] === b[index]) continue;
    if (a[index] === undefined) return -1;
    if (b[index] === undefined) return 1;
    if (a[index] instanceof Date || b[index] instanceof Date) {
      return new Date(a[index]).getTime() - new Date(b[index]).getTime();
    }
    return a[index] < b[index] ? -1 : 1;
  }
  return 0;
}

function keyMatchesQuery(key, query) {
  if (query === undefined || query === null) return true;
  if (typeof IDBKeyRange !== "undefined" && query instanceof IDBKeyRange) {
    const lowerOkay = query.lower === undefined
      || compareKeys(key, query.lower) > 0
      || (!query.lowerOpen && compareKeys(key, query.lower) === 0);
    const upperOkay = query.upper === undefined
      || compareKeys(key, query.upper) < 0
      || (!query.upperOpen && compareKeys(key, query.upper) === 0);
    return lowerOkay && upperOkay;
  }
  return compareKeys(key, query) === 0;
}

function memoryStore(storeName) {
  ensureKnownStore(storeName);
  if (!memoryStores.has(storeName)) memoryStores.set(storeName, new Map());
  return memoryStores.get(storeName);
}

function getRecordKey(storeName, value, explicitKey) {
  if (explicitKey !== undefined) return explicitKey;
  const keyPath = STORE_DEFINITIONS[storeName].keyPath;
  const key = getPath(value, keyPath);
  if (key === undefined || key === null || key === "") {
    throw new TypeError(`${storeName} records require ${String(keyPath)}`);
  }
  return key;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction was aborted"));
  });
}

function ensureStore(database, storeName, transaction) {
  if (!database.objectStoreNames.contains(storeName)) {
    return database.createObjectStore(storeName, STORE_DEFINITIONS[storeName]);
  }
  return transaction.objectStore(storeName);
}

function ensureIndexes(store, storeName) {
  for (const [indexName, keyPath, options = {}] of INDEX_DEFINITIONS[storeName]) {
    if (!store.indexNames.contains(indexName)) store.createIndex(indexName, keyPath, options);
  }
}

function migrate(database, transaction, oldVersion) {
  // Migrations are intentionally additive. Existing records are never cleared.
  if (oldVersion < 1) {
    [
      STORES.PROFILES,
      STORES.KEY_GRANTS,
      STORES.KEY_ACCESS,
      STORES.ARTEFACTS,
      STORES.ARTEFACT_VERSIONS,
      STORES.PLANET_RESPONSES,
      STORES.METADATA,
    ].forEach((storeName) => ensureStore(database, storeName, transaction));
  }
  if (oldVersion < 2) ensureStore(database, STORES.ACTIVITY_STATE, transaction);

  // Version 4 keeps the Build 3 stores intact. Flow preferences, recent
  // destination state and climate provenance use additive metadata and the
  // existing versioned artefact/activity stores, so no record is rewritten.

  // Version 3 formalises all query indexes. Creating a missing index is safe for
  // databases produced by early development builds as well as fresh installs.
  for (const storeName of Object.values(STORES)) {
    const store = ensureStore(database, storeName, transaction);
    ensureIndexes(store, storeName);
  }

  const metadata = transaction.objectStore(STORES.METADATA);
  metadata.put({
    key: "schema",
    value: { version: DATABASE_VERSION, migratedFrom: oldVersion },
    updatedAt: new Date().toISOString(),
  });
}

function openIndexedDatabase(name = DATABASE_NAME) {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    let request;
    try {
      request = globalThis.indexedDB.open(name, DATABASE_VERSION);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = (event) => {
      try {
        migrate(request.result, request.transaction, event.oldVersion);
      } catch (error) {
        request.transaction?.abort();
        lastOpenError = error;
      }
    };
    request.onblocked = () => {
      lastOpenError = new Error("A previous tab is blocking the database update");
      emitStatus();
    };
    request.onerror = () => reject(request.error || lastOpenError || new Error("Unable to open IndexedDB"));
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
  });
}

async function getBackend() {
  if (backendPromise) return backendPromise;

  backendPromise = openIndexedDatabase(openDatabaseName)
    .then((database) => {
      backendMode = "indexeddb";
      lastOpenError = null;
      emitStatus();
      return { mode: "indexeddb", database };
    })
    .catch((error) => {
      backendMode = "memory";
      lastOpenError = error instanceof Error ? error : new Error(String(error));
      for (const storeName of Object.values(STORES)) memoryStore(storeName);
      emitStatus();
      return { mode: "memory" };
    });

  return backendPromise;
}

function createIndexedFacade(transaction) {
  const objectStore = (storeName) => {
    ensureKnownStore(storeName);
    return transaction.objectStore(storeName);
  };

  return {
    async get(storeName, key) {
      return requestToPromise(objectStore(storeName).get(key));
    },
    async put(storeName, value, key) {
      const store = objectStore(storeName);
      const request = key === undefined ? store.put(value) : store.put(value, key);
      return requestToPromise(request);
    },
    async add(storeName, value, key) {
      const store = objectStore(storeName);
      const request = key === undefined ? store.add(value) : store.add(value, key);
      return requestToPromise(request);
    },
    async delete(storeName, key) {
      await requestToPromise(objectStore(storeName).delete(key));
    },
    async clear(storeName) {
      await requestToPromise(objectStore(storeName).clear());
    },
    async count(storeName, query, indexName) {
      const source = indexName ? objectStore(storeName).index(indexName) : objectStore(storeName);
      return requestToPromise(source.count(query));
    },
    async getAll(storeName, options = {}) {
      return getAllFromIndexedStore(objectStore(storeName), options);
    },
  };
}

async function getAllFromIndexedStore(store, options = {}) {
  const {
    index: indexName,
    query,
    direction = "next",
    limit = Infinity,
  } = options;
  const source = indexName ? store.index(indexName) : store;
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : Infinity;
  if (safeLimit === 0) return [];

  return new Promise((resolve, reject) => {
    const results = [];
    const request = source.openCursor(query, direction);
    request.onerror = () => reject(request.error || new Error("Unable to read IndexedDB cursor"));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || results.length >= safeLimit) {
        resolve(results);
        return;
      }
      results.push(cursor.value);
      cursor.continue();
    };
  });
}

function createMemoryFacade(storeNames, mode) {
  const snapshots = mode === "readwrite"
    ? new Map(storeNames.map((name) => [name, new Map(memoryStore(name))]))
    : null;

  const facade = {
    async get(storeName, key) {
      const value = memoryStore(storeName).get(key);
      return value === undefined ? undefined : cloneValue(value);
    },
    async put(storeName, value, key) {
      const recordKey = getRecordKey(storeName, value, key);
      memoryStore(storeName).set(recordKey, cloneValue(value));
      return recordKey;
    },
    async add(storeName, value, key) {
      const recordKey = getRecordKey(storeName, value, key);
      if (memoryStore(storeName).has(recordKey)) {
        throw new DOMException("A record with this key already exists", "ConstraintError");
      }
      memoryStore(storeName).set(recordKey, cloneValue(value));
      return recordKey;
    },
    async delete(storeName, key) {
      memoryStore(storeName).delete(key);
    },
    async clear(storeName) {
      memoryStore(storeName).clear();
    },
    async count(storeName, query, indexName) {
      return (await facade.getAll(storeName, { query, index: indexName })).length;
    },
    async getAll(storeName, options = {}) {
      const { index: indexName, query, direction = "next", limit = Infinity } = options;
      let values = Array.from(memoryStore(storeName).values());
      const indexDefinition = indexName
        ? INDEX_DEFINITIONS[storeName].find(([name]) => name === indexName)
        : null;
      if (indexName && !indexDefinition) throw new TypeError(`Unknown ${storeName} index: ${indexName}`);
      const keyPath = indexDefinition?.[1] || STORE_DEFINITIONS[storeName].keyPath;
      values = values
        .filter((value) => keyMatchesQuery(getPath(value, keyPath), query))
        .sort((left, right) => compareKeys(getPath(left, keyPath), getPath(right, keyPath)));
      if (direction.startsWith("prev")) values.reverse();
      const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : values.length;
      return values.slice(0, safeLimit).map((value) => cloneValue(value));
    },
    rollback() {
      if (!snapshots) return;
      snapshots.forEach((snapshot, storeName) => memoryStores.set(storeName, snapshot));
    },
  };
  return facade;
}

/** Open persistence early, or simply let the first operation open it lazily. */
export async function openDatabase() {
  const backend = await getBackend();
  return { mode: backend.mode, persistent: backend.mode === "indexeddb" };
}

/**
 * Run an operation against one or more stores.
 * The callback receives get/put/add/delete/clear/count/getAll methods.
 */
export async function runTransaction(storeNames, mode, operation) {
  const names = Array.isArray(storeNames) ? [...new Set(storeNames)] : [storeNames];
  if (names.length === 0) throw new TypeError("A transaction needs at least one store");
  names.forEach(ensureKnownStore);
  if (mode !== "readonly" && mode !== "readwrite") throw new TypeError("Invalid transaction mode");
  if (typeof operation !== "function") throw new TypeError("A transaction operation is required");

  const backend = await getBackend();
  if (backend.mode === "memory") {
    const facade = createMemoryFacade(names, mode);
    try {
      return await operation(facade);
    } catch (error) {
      facade.rollback();
      throw error;
    }
  }

  const transaction = backend.database.transaction(names, mode);
  const completion = transactionToPromise(transaction);
  let result;
  try {
    result = await operation(createIndexedFacade(transaction));
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      // It may already have completed or aborted.
    }
    try {
      await completion;
    } catch {
      // The original operation error is more useful.
    }
    throw error;
  }
  await completion;
  return result;
}

export function getRecord(storeName, key) {
  return runTransaction(storeName, "readonly", (transaction) => transaction.get(storeName, key));
}

export function putRecord(storeName, value, key) {
  return runTransaction(storeName, "readwrite", (transaction) => transaction.put(storeName, value, key));
}

export function addRecord(storeName, value, key) {
  return runTransaction(storeName, "readwrite", (transaction) => transaction.add(storeName, value, key));
}

export function deleteRecord(storeName, key) {
  return runTransaction(storeName, "readwrite", (transaction) => transaction.delete(storeName, key));
}

export function clearStore(storeName) {
  return runTransaction(storeName, "readwrite", (transaction) => transaction.clear(storeName));
}

export function getAllRecords(storeName, options) {
  return runTransaction(storeName, "readonly", (transaction) => transaction.getAll(storeName, options));
}

export function countRecords(storeName, options = {}) {
  return runTransaction(storeName, "readonly", (transaction) => (
    transaction.count(storeName, options.query, options.index)
  ));
}

export async function getMetadata(key, fallbackValue = null) {
  const record = await getRecord(STORES.METADATA, String(key));
  return record?.value ?? fallbackValue;
}

export async function setMetadata(key, value) {
  const record = { key: String(key), value: cloneValue(value), updatedAt: new Date().toISOString() };
  await putRecord(STORES.METADATA, record);
  return record.value;
}

export async function removeMetadata(key) {
  await deleteRecord(STORES.METADATA, String(key));
}

/** Preserve an invalid record for diagnostics, then optionally remove it. */
export async function quarantineRecord(storeName, key, record, reason, { remove = true } = {}) {
  ensureKnownStore(storeName);
  const quarantineKey = `quarantine:${storeName}:${String(key)}:${Date.now()}:${createUuid()}`;
  const metadata = {
    key: quarantineKey,
    value: {
      storeName,
      recordKey: key,
      reason: String(reason || "Record failed validation"),
      record: cloneValue(record),
      quarantinedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
  const stores = remove && storeName !== STORES.METADATA
    ? [storeName, STORES.METADATA]
    : [STORES.METADATA];
  await runTransaction(stores, "readwrite", async (transaction) => {
    await transaction.put(STORES.METADATA, metadata);
    if (remove && storeName !== STORES.METADATA) await transaction.delete(storeName, key);
  });
  return quarantineKey;
}

export function getDatabaseStatus() {
  return Object.freeze({
    mode: backendMode,
    persistent: backendMode === "indexeddb",
    usingFallback: backendMode === "memory",
    error: lastOpenError,
    databaseName: openDatabaseName,
    schemaVersion: DATABASE_VERSION,
  });
}

export function subscribeToDatabaseStatus(listener) {
  if (typeof listener !== "function") throw new TypeError("A status listener is required");
  statusListeners.add(listener);
  listener(getDatabaseStatus());
  return () => statusListeners.delete(listener);
}

export async function requestPersistentStorage() {
  if (!globalThis.navigator?.storage?.persist) return false;
  try {
    return Boolean(await globalThis.navigator.storage.persist());
  } catch {
    return false;
  }
}

export async function estimateStorage() {
  if (!globalThis.navigator?.storage?.estimate) return { usage: null, quota: null };
  try {
    const { usage = null, quota = null } = await globalThis.navigator.storage.estimate();
    return { usage, quota };
  } catch {
    return { usage: null, quota: null };
  }
}

/**
 * Test/recovery hook. It never deletes persisted data. A different name creates
 * an isolated database; omitting it reconnects to the normal application DB.
 */
export async function resetDatabaseConnection({ databaseName = DATABASE_NAME, clearMemory = false } = {}) {
  if (backendPromise) {
    try {
      const backend = await backendPromise;
      backend.database?.close();
    } catch {
      // Failed opens need no close.
    }
  }
  backendPromise = undefined;
  backendMode = "unopened";
  lastOpenError = null;
  openDatabaseName = String(databaseName || DATABASE_NAME);
  if (clearMemory) memoryStores.clear();
  emitStatus();
}
