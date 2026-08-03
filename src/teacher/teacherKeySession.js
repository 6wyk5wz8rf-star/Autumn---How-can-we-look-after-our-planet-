import {
  LEGACY_TEACHER_KEY_CODE,
  TEACHER_KEY_CODE,
  getProductionTeacherKeys,
  isAdultEntranceKey,
} from './teacherKeyManifest.js';

function normaliseCode(value) {
  return String(value ?? '').replace(/\s+/g, '');
}

function cloneReturnLocation(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 500);
  if (typeof value !== 'object' || Array.isArray(value)) return null;
  const name = String(value.name ?? '').replace(/[^a-z0-9-]/gi, '').slice(0, 80);
  if (!name) return null;
  const params = {};
  for (const [key, item] of Object.entries(value.params ?? {})) {
    const safeKey = String(key).replace(/[^a-z0-9_-]/gi, '').slice(0, 80);
    if (!safeKey || !['string', 'number', 'boolean'].includes(typeof item)) continue;
    params[safeKey] = String(item).slice(0, 300);
  }
  return Object.freeze({ name, params: Object.freeze(params) });
}

function snapshot(session) {
  return Object.freeze({
    active: session.active,
    openedAt: session.openedAt,
    returnLocation: session.returnLocation,
  });
}

/**
 * Adult access held only in this JavaScript object.
 *
 * No sessionStorage, localStorage, IndexedDB, profile or My Keys record is
 * touched. A document refresh constructs a new controller and therefore closes
 * the teacher room automatically.
 */
export class TeacherKeySessionController {
  constructor({ teacherCode = TEACHER_KEY_CODE, legacyCodes = [LEGACY_TEACHER_KEY_CODE] } = {}) {
    this.teacherCode = normaliseCode(teacherCode);
    this.legacyCodes = new Set(legacyCodes.map(normaliseCode));
    this.active = false;
    this.openedAt = null;
    this.returnLocation = null;
    this.listeners = new Set();
  }

  open({ returnLocation = null } = {}) {
    this.active = true;
    this.openedAt = new Date().toISOString();
    this.returnLocation = cloneReturnLocation(returnLocation);
    this.emit('opened');
    return this.getState();
  }

  close({ consumeReturnLocation = true } = {}) {
    const returnLocation = this.returnLocation;
    this.active = false;
    this.openedAt = null;
    if (consumeReturnLocation) this.returnLocation = null;
    this.emit('closed');
    return returnLocation;
  }

  getState() {
    return snapshot(this);
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('A teacher-session listener is required');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(reason) {
    const detail = Object.freeze({ reason, ...this.getState() });
    for (const listener of this.listeners) {
      try {
        listener(detail);
      } catch {
        // A visual observer must not interrupt an adult session transition.
      }
    }
  }

  /**
   * Resolve a Today’s Key entry before any child grant or persistence call.
   * The caller should route `teacher` directly to the room and only send
   * `pathway.key` to `grantKey`.
   */
  resolve(code, { manifest = [], returnLocation = null } = {}) {
    const normalised = normaliseCode(code);
    if (!/^\d{4}$/.test(normalised)) {
      return Object.freeze({ kind: 'invalid', code: normalised, reason: 'format' });
    }

    if (normalised === this.teacherCode || this.legacyCodes.has(normalised)) {
      const teacherKey = manifest.find((key) => (
        isAdultEntranceKey(key)
        && normaliseCode(key.code ?? key.key) === normalised
        && key.active !== false
      )) ?? null;
      if (!teacherKey) {
        return Object.freeze({ kind: 'invalid', code: normalised, reason: 'teacher-key-unregistered' });
      }
      this.open({ returnLocation });
      return Object.freeze({
        kind: 'teacher',
        code: normalised,
        key: teacherKey,
        canonical: normalised === this.teacherCode,
        legacyAlias: normalised !== this.teacherCode,
        session: this.getState(),
      });
    }

    const key = getProductionTeacherKeys(manifest).find((entry) => normaliseCode(entry.code ?? entry.key) === normalised) ?? null;
    if (!key) return Object.freeze({ kind: 'invalid', code: normalised, reason: 'not-found' });
    return Object.freeze({ kind: 'pathway', code: normalised, key });
  }
}

/** One app-lifetime instance; it is intentionally not durable across refresh. */
export const teacherKeySession = new TeacherKeySessionController();
