import { getProductionTeacherKeys } from './teacherKeyManifest.js';

export const TEACHER_KEY_SCALES = Object.freeze({
  activity: 'Activity',
  collection: 'Collection',
  environment: 'Environment',
  world: 'Whole World',
});

const SUBJECT_LABELS = Object.freeze({
  mathematics: 'Mathematics',
  maths: 'Mathematics',
  geography: 'Geography',
  science: 'Science',
  english: 'English',
  pshe: 'PSHE',
  'art-and-design': 'Art and design',
  art: 'Art and design',
  computing: 'Computing',
  history: 'History',
});

function idOf(key) {
  return String(key?.id ?? key?.stableId ?? key?.keyId ?? '').trim();
}

function codeOf(key) {
  return String(key?.code ?? key?.key ?? '').replace(/\s+/g, '');
}

function typeOf(key) {
  return String(key?.type ?? key?.keyType ?? '').toLowerCase();
}

function scaleOf(key) {
  return ({
    activity: 'activity',
    individual: 'activity',
    individual_activity: 'activity',
    collection: 'collection',
    destination: 'environment',
    environment: 'environment',
    world: 'world',
    'whole-world': 'world',
    whole_world: 'world',
  })[typeOf(key)] ?? null;
}

function normaliseSearch(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titleCase(value) {
  return String(value ?? '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function purposeOf(key) {
  return String(key.description ?? key.printGuide?.purpose ?? key.purpose ?? '').trim();
}

function subjectOf(key, destination) {
  const explicit = key.subject ?? key.curriculumSubject ?? key.domain;
  const inferred = explicit || destination?.curriculumDomains?.[0] || '';
  const id = normaliseSearch(inferred).replace(/\s+/g, '-');
  return {
    id: id || 'cross-curricular',
    title: SUBJECT_LABELS[id] || titleCase(inferred || 'Cross-curricular'),
  };
}

function strandOf(key, subject, scale) {
  const explicit = key.curriculumStrand ?? key.strand ?? key.printGuide?.strand;
  if (explicit) return { id: normaliseSearch(explicit).replace(/\s+/g, '-'), title: String(explicit) };
  if (scale !== 'activity') return { id: 'larger-pathways', title: 'Larger pathways' };
  return { id: subject.id, title: subject.title };
}

/** Build the production teacher library directly from the permanent manifest. */
export function createTeacherKeyLibrary(manifest = [], { destinations = [] } = {}) {
  const destinationMap = new Map(destinations.map((destination) => [destination.id, destination]));
  return getProductionTeacherKeys(manifest).map((key, manifestIndex) => {
    const scale = scaleOf(key);
    const destinationId = key.destinationId ?? key.destination ?? '*';
    const destination = destinationMap.get(destinationId);
    const environment = destinationId === '*'
      ? { id: '*', title: 'Whole product', ordinal: Number.MAX_SAFE_INTEGER }
      : {
        id: destinationId,
        title: destination?.title || titleCase(destinationId),
        ordinal: Number.isFinite(destination?.ordinal) ? destination.ordinal : Number.MAX_SAFE_INTEGER - 1,
      };
    const subject = subjectOf(key, destination);
    const strand = strandOf(key, subject, scale);
    const title = String(key.title ?? key.childFacingTitle ?? key.label ?? '').trim();
    const purpose = purposeOf(key);
    const curriculumTags = [...new Set([
      ...(key.curriculumTags ?? []),
      ...(key.conceptTags ?? []),
      ...(key.printGuide?.curriculumTags ?? []),
    ].map(String).filter(Boolean))];
    const entry = {
      id: idOf(key),
      code: codeOf(key),
      title,
      purpose,
      route: String(key.route ?? ''),
      scale,
      scaleTitle: TEACHER_KEY_SCALES[scale],
      environment,
      subject,
      strand,
      curriculumTags,
      activityIds: Object.freeze([...(key.activityIds ?? [])]),
      teacherQuickUse: key.teacherQuickUse === true,
      quickUse: key.teacherQuickUse === true || key.printGuide?.quickUse === true,
      printInfo: Object.freeze({ ...(key.printGuide ?? key.print ?? {}) }),
      manifestIndex,
      key,
    };
    entry.searchText = normaliseSearch([
      entry.code,
      entry.title,
      entry.purpose,
      entry.environment.title,
      entry.subject.title,
      entry.strand.title,
      ...entry.curriculumTags,
    ].join(' '));
    return Object.freeze(entry);
  }).sort(compareEntries);
}

function compareEntries(left, right) {
  return left.environment.ordinal - right.environment.ordinal
    || left.environment.title.localeCompare(right.environment.title, 'en-GB')
    || left.strand.title.localeCompare(right.strand.title, 'en-GB')
    || ['activity', 'collection', 'environment', 'world'].indexOf(left.scale)
      - ['activity', 'collection', 'environment', 'world'].indexOf(right.scale)
    || left.manifestIndex - right.manifestIndex
    || left.title.localeCompare(right.title, 'en-GB');
}

export function filterTeacherKeyLibrary(entries = [], {
  query = '',
  environment = 'all',
  subject = 'all',
  scale = 'all',
  favouriteIds = null,
  favouritesOnly = false,
} = {}) {
  const words = normaliseSearch(query).split(' ').filter(Boolean);
  const favourites = new Set(favouriteIds ?? []);
  return entries.filter((entry) => (
    (environment === 'all' || entry.environment.id === environment)
    && (subject === 'all' || entry.subject.id === subject)
    && (scale === 'all' || entry.scale === scale)
    && (!favouritesOnly || favourites.has(entry.id))
    && words.every((word) => entry.searchText.includes(word))
  ));
}

export function getQuickTeacherKeys(entries = [], favouriteIds = [], { limit = 8 } = {}) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const selected = [];
  for (const id of favouriteIds) {
    const entry = byId.get(id);
    if (entry && !selected.includes(entry)) selected.push(entry);
  }
  const quickCandidates = [
    ...entries.filter((entry) => entry.teacherQuickUse),
    ...entries.filter((entry) => !entry.teacherQuickUse && entry.quickUse),
  ];
  for (const entry of quickCandidates) {
    if (selected.length >= limit) break;
    if (entry.quickUse && !selected.includes(entry)) selected.push(entry);
  }
  return selected.slice(0, limit);
}

export function groupTeacherKeyLibrary(entries = []) {
  const environments = new Map();
  for (const entry of entries) {
    if (!environments.has(entry.environment.id)) {
      environments.set(entry.environment.id, {
        id: entry.environment.id,
        title: entry.environment.title,
        ordinal: entry.environment.ordinal,
        strands: new Map(),
      });
    }
    const environment = environments.get(entry.environment.id);
    if (!environment.strands.has(entry.strand.id)) {
      environment.strands.set(entry.strand.id, {
        id: entry.strand.id,
        title: entry.strand.title,
        entries: [],
      });
    }
    environment.strands.get(entry.strand.id).entries.push(entry);
  }

  return [...environments.values()]
    .sort((left, right) => left.ordinal - right.ordinal || left.title.localeCompare(right.title, 'en-GB'))
    .map((environment) => Object.freeze({
      id: environment.id,
      title: environment.title,
      strands: Object.freeze([...environment.strands.values()].map((strand) => Object.freeze({
        ...strand,
        entries: Object.freeze([...strand.entries]),
      }))),
    }));
}

export function getTeacherKeyFilterOptions(entries = []) {
  const unique = (items) => [...new Map(items.map((item) => [item.id, item])).values()]
    .sort((left, right) => left.title.localeCompare(right.title, 'en-GB'));
  return Object.freeze({
    environments: Object.freeze(unique(entries.map((entry) => entry.environment))),
    subjects: Object.freeze(unique(entries.map((entry) => entry.subject))),
    scales: Object.freeze(unique(entries.map((entry) => ({ id: entry.scale, title: entry.scaleTitle })))),
  });
}

export function getTeacherKeyEntry(reference, entries = []) {
  const value = String(reference ?? '').trim();
  return entries.find((entry) => entry.id === value || entry.code === value) ?? null;
}
