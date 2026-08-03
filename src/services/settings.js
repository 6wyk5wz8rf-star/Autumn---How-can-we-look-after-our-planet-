import {
  STORES,
  getMetadata,
  getRecord,
  removeMetadata,
  runTransaction,
} from "./db.js";

export const SETTINGS_SCHEMA_VERSION = 1;
export const SCAFFOLD_LEVELS = Object.freeze(["light", "core", "strong", "intensive"]);

const DEVICE_STORAGE_KEY = "our-planet:device-settings";
const listeners = new Set();
let memoryDeviceSettings = null;

function systemReducedMotion() {
  try {
    return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
}

function systemHighContrast() {
  try {
    return Boolean(globalThis.matchMedia?.("(prefers-contrast: more)").matches);
  } catch {
    return false;
  }
}

export function defaultSettings() {
  return {
    scaffold: "core",
    textScale: 1,
    spokenInstructions: false,
    placeNameSpeech: true,
    captions: true,
    reducedMotion: systemReducedMotion(),
    reducedComplexity: false,
    highContrast: systemHighContrast(),
    soundVolume: 0.7,
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  };
}

function bounded(value, fallback, minimum, maximum) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

export function sanitiseSettings(value = {}, fallback = defaultSettings()) {
  const scaffold = SCAFFOLD_LEVELS.includes(String(value.scaffold ?? "").toLowerCase())
    ? String(value.scaffold).toLowerCase()
    : fallback.scaffold;
  return {
    scaffold,
    textScale: bounded(value.textScale, fallback.textScale, 0.9, 1.6),
    spokenInstructions: value.spokenInstructions === undefined
      ? fallback.spokenInstructions
      : Boolean(value.spokenInstructions),
    placeNameSpeech: value.placeNameSpeech === undefined
      ? fallback.placeNameSpeech
      : Boolean(value.placeNameSpeech),
    captions: value.captions === undefined ? fallback.captions : Boolean(value.captions),
    reducedMotion: value.reducedMotion === undefined
      ? fallback.reducedMotion
      : Boolean(value.reducedMotion),
    reducedComplexity: value.reducedComplexity === undefined
      ? fallback.reducedComplexity
      : Boolean(value.reducedComplexity),
    highContrast: value.highContrast === undefined ? fallback.highContrast : Boolean(value.highContrast),
    soundVolume: bounded(value.soundVolume, fallback.soundVolume, 0, 1),
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  };
}

function readDeviceStorage() {
  try {
    const raw = globalThis.localStorage?.getItem(DEVICE_STORAGE_KEY);
    if (raw) return sanitiseSettings(JSON.parse(raw));
  } catch {
    // Storage can be disabled in private/embedded contexts.
  }
  return memoryDeviceSettings ? { ...memoryDeviceSettings } : defaultSettings();
}

function writeDeviceStorage(settings) {
  memoryDeviceSettings = { ...settings };
  try {
    globalThis.localStorage?.setItem(DEVICE_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

function emit(detail) {
  listeners.forEach((listener) => {
    try {
      listener(detail);
    } catch {
      // A visual observer cannot interrupt a settings save.
    }
  });
}

export function getDeviceSettings() {
  return Object.freeze(readDeviceStorage());
}

export function updateDeviceSettings(patch = {}) {
  const current = readDeviceStorage();
  const settings = sanitiseSettings({ ...current, ...patch }, current);
  const persistent = writeDeviceStorage(settings);
  emit({ scope: "device", profileId: null, settings, persistent });
  return Object.freeze({ ...settings });
}

export function resetDeviceSettings() {
  memoryDeviceSettings = null;
  try {
    globalThis.localStorage?.removeItem(DEVICE_STORAGE_KEY);
  } catch {
    // Memory defaults still apply.
  }
  const settings = defaultSettings();
  emit({ scope: "device", profileId: null, settings, persistent: false });
  return Object.freeze(settings);
}

function profileMetadataKey(profileId) {
  return `settings:profile:${profileId}`;
}

async function requireProfile(profileId) {
  const id = String(profileId ?? "").trim();
  const profile = id ? await getRecord(STORES.PROFILES, id) : null;
  if (!profile) throw new Error("The learner profile could not be found");
  return profile;
}

/** Device defaults merged with this learner's durable IndexedDB preferences. */
export async function getSettings(profileId = null) {
  const device = readDeviceStorage();
  if (!profileId) return Object.freeze(device);
  const profile = await requireProfile(profileId);
  const saved = await getMetadata(profileMetadataKey(profile.id), {});
  return Object.freeze(sanitiseSettings({
    ...device,
    ...(profile.accessibility || {}),
    ...(saved || {}),
  }, device));
}

export async function updateSettings(patch = {}, { profileId = null } = {}) {
  if (!profileId) return updateDeviceSettings(patch);
  const profile = await requireProfile(profileId);
  const current = await getSettings(profile.id);
  const settings = sanitiseSettings({ ...current, ...patch }, current);
  const timestamp = new Date().toISOString();
  await runTransaction([STORES.PROFILES, STORES.METADATA], "readwrite", async (transaction) => {
    await transaction.put(STORES.METADATA, {
      key: profileMetadataKey(profile.id),
      value: settings,
      updatedAt: timestamp,
    });
    await transaction.put(STORES.PROFILES, {
      ...profile,
      accessibility: {
        scaffold: settings.scaffold,
        textScale: settings.textScale,
        spokenInstructions: settings.spokenInstructions,
        reducedMotion: settings.reducedMotion,
        reducedComplexity: settings.reducedComplexity,
        captions: settings.captions,
        highContrast: settings.highContrast,
      },
      updatedAt: timestamp,
    });
  });
  emit({ scope: "profile", profileId: profile.id, settings, persistent: true });
  return Object.freeze(settings);
}

export async function resetSettings({ profileId = null } = {}) {
  if (!profileId) return resetDeviceSettings();
  const profile = await requireProfile(profileId);
  await removeMetadata(profileMetadataKey(profile.id));
  const settings = sanitiseSettings(readDeviceStorage());
  await runTransaction(STORES.PROFILES, "readwrite", async (transaction) => {
    await transaction.put(STORES.PROFILES, {
      ...profile,
      accessibility: {
        scaffold: settings.scaffold,
        textScale: settings.textScale,
        spokenInstructions: settings.spokenInstructions,
        reducedMotion: settings.reducedMotion,
        reducedComplexity: settings.reducedComplexity,
        captions: settings.captions,
        highContrast: settings.highContrast,
      },
      updatedAt: new Date().toISOString(),
    });
  });
  emit({ scope: "profile", profileId: profile.id, settings, persistent: true });
  return Object.freeze(settings);
}

export function subscribeToSettings(listener) {
  if (typeof listener !== "function") throw new TypeError("A settings listener is required");
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applySettingsToDocument(settings, root = globalThis.document?.documentElement) {
  if (!root) return false;
  const safe = sanitiseSettings(settings);
  root.dataset.scaffold = safe.scaffold;
  root.dataset.reducedMotion = String(safe.reducedMotion);
  root.dataset.reducedComplexity = String(safe.reducedComplexity);
  root.dataset.highContrast = String(safe.highContrast);
  root.style.setProperty("--user-text-scale", String(safe.textScale));
  return true;
}

if (globalThis.addEventListener) {
  globalThis.addEventListener("storage", (event) => {
    if (event.key !== DEVICE_STORAGE_KEY) return;
    memoryDeviceSettings = null;
    emit({ scope: "device", profileId: null, settings: readDeviceStorage(), external: true });
  });
}
