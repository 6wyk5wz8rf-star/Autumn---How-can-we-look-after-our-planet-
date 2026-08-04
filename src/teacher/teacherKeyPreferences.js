import { getMetadata, removeMetadata, setMetadata } from '../services/db.js';
import { getProductionTeacherKeys } from './teacherKeyManifest.js';

export const TEACHER_KEY_PREFERENCES_KEY = 'teacher-key-room:device-preferences';
export const TEACHER_KEY_PREFERENCES_SCHEMA_VERSION = 2;
export const MAX_TEACHER_FAVOURITES = 12;

function idOf(key) {
  return String(key?.id ?? key?.stableId ?? key?.keyId ?? '').trim();
}

function defaultFavouriteIds(manifest) {
  const production = getProductionTeacherKeys(manifest);
  const explicit = production.filter((key) => key.teacherQuickUse === true);
  return (explicit.length ? explicit : production.filter((key) => key.printGuide?.quickUse === true))
    .map(idOf)
    .filter(Boolean)
    .slice(0, MAX_TEACHER_FAVOURITES);
}

export function sanitiseTeacherKeyPreferences(value = {}, manifest = []) {
  const allowed = new Set(getProductionTeacherKeys(manifest).map(idOf));
  const supplied = Array.isArray(value.favouriteKeyIds)
    ? value.favouriteKeyIds
    : defaultFavouriteIds(manifest);
  const favouriteKeyIds = [...new Set(supplied.map(String))]
    .filter((id) => allowed.has(id))
    .slice(0, MAX_TEACHER_FAVOURITES);

  const recentDisplayedKeyIds = [...new Set((value.recentDisplayedKeyIds || []).map(String))]
    .filter((id) => allowed.has(id))
    .slice(0, 8);

  return Object.freeze({
    favouriteKeyIds: Object.freeze(favouriteKeyIds),
    recentDisplayedKeyIds: Object.freeze(recentDisplayedKeyIds),
    showTitleOnBoard: value.showTitleOnBoard === undefined ? true : Boolean(value.showTitleOnBoard),
    schemaVersion: TEACHER_KEY_PREFERENCES_SCHEMA_VERSION,
  });
}

/**
 * Device-level preferences backed by metadata, never a learner profile.
 * Metadata already participates in the product's validated backup/import flow.
 */
export class TeacherKeyPreferencesStore {
  constructor({
    manifest = [],
    read = getMetadata,
    write = setMetadata,
    remove = removeMetadata,
    storageKey = TEACHER_KEY_PREFERENCES_KEY,
  } = {}) {
    this.manifest = manifest;
    this.read = read;
    this.write = write;
    this.remove = remove;
    this.storageKey = storageKey;
    this.preferences = sanitiseTeacherKeyPreferences({}, manifest);
  }

  async load() {
    const stored = await this.read(this.storageKey, null);
    this.preferences = sanitiseTeacherKeyPreferences(stored ?? {}, this.manifest);
    return this.getSnapshot();
  }

  getSnapshot() {
    return sanitiseTeacherKeyPreferences(this.preferences, this.manifest);
  }

  isFavourite(keyId) {
    return this.preferences.favouriteKeyIds.includes(String(keyId));
  }

  async setFavourites(ids) {
    this.preferences = sanitiseTeacherKeyPreferences({
      ...this.preferences,
      favouriteKeyIds: ids,
    }, this.manifest);
    await this.write(this.storageKey, this.preferences);
    return this.getSnapshot();
  }

  async toggleFavourite(keyId) {
    const id = String(keyId ?? '');
    const allowed = new Set(getProductionTeacherKeys(this.manifest).map(idOf));
    if (!allowed.has(id)) throw new TypeError('Only an active child pathway can be a teacher favourite');
    const current = [...this.preferences.favouriteKeyIds];
    const index = current.indexOf(id);
    if (index >= 0) current.splice(index, 1);
    else {
      current.push(id);
      if (current.length > MAX_TEACHER_FAVOURITES) current.shift();
    }
    return this.setFavourites(current);
  }

  async setShowTitleOnBoard(showTitleOnBoard) {
    this.preferences = sanitiseTeacherKeyPreferences({
      ...this.preferences,
      showTitleOnBoard,
    }, this.manifest);
    await this.write(this.storageKey, this.preferences);
    return this.getSnapshot();
  }

  async recordDisplayed(keyId) {
    const id = String(keyId ?? '');
    const allowed = new Set(getProductionTeacherKeys(this.manifest).map(idOf));
    if (!allowed.has(id)) return this.getSnapshot();
    this.preferences = sanitiseTeacherKeyPreferences({
      ...this.preferences,
      recentDisplayedKeyIds: [id, ...(this.preferences.recentDisplayedKeyIds || []).filter((item) => item !== id)],
    }, this.manifest);
    await this.write(this.storageKey, this.preferences);
    return this.getSnapshot();
  }

  async reset() {
    await this.remove(this.storageKey);
    this.preferences = sanitiseTeacherKeyPreferences({}, this.manifest);
    return this.getSnapshot();
  }
}
