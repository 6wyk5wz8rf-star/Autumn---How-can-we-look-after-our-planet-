/**
 * Shared My Work contracts.
 *
 * Every destination stores the same record envelope. Type definitions describe
 * the structured payload and response modes without creating separate storage
 * engines. Binary media belongs in IndexedDB; `mediaRef` stores its local key.
 */

export const ARTEFACT_SCHEMA_VERSION = 1;

export const ARTEFACT_RECORD_SCHEMA = Object.freeze({
  schemaVersion: ARTEFACT_SCHEMA_VERSION,
  required: [
    'id',
    'profileId',
    'destinationId',
    'activityId',
    'title',
    'artefactTypeId',
    'content',
    'createdAt',
    'revisedAt',
  ],
  fields: {
    id: 'locally-generated immutable identifier',
    profileId: 'owner profile identifier',
    destinationId: 'permanent destination identifier',
    activityId: 'open exploration or activity identifier',
    keyActivityId: 'nullable guided-activity identifier',
    title: 'child-editable title',
    artefactTypeId: 'registered artefact type identifier',
    curriculumTags: 'array of stable curriculum tags',
    conceptTags: 'array of concept-graph node identifiers',
    content: 'type-specific structured payload',
    preview: 'small serialisable preview descriptor',
    createdAt: 'ISO date-time',
    revisedAt: 'ISO date-time',
    parentVersionId: 'nullable identifier of the version duplicated or revised',
    versionNumber: 'positive integer',
    versionHistory: 'array of immutable version summaries',
    voiceExplanationRef: 'nullable IndexedDB media reference',
    writtenExplanation: 'optional short child-authored text',
    linkedArtefactIds: 'array of related My Work identifiers',
    reflection: 'nullable registered reflection phrase or child-authored text',
  },
  preservationRules: [
    'A revision appends version history; it never silently overwrites the earlier payload.',
    'Duplicating creates a new ID and records the source as parentVersionId.',
    'Planet Question responses are append-only records, not a mutable singleton.',
    'Deleting requires explicit confirmation and does not cascade to linked work.',
  ],
});

export const OPTIONAL_REFLECTIONS = Object.freeze([
  'I noticed something new.',
  'I changed my idea.',
  'I found another way.',
  'I can explain this now.',
  'This connects to something else.',
  'I still have a question.',
]);

const atlasType = (record) => ({
  destinationIds: ['planet-atlas'],
  active: true,
  versioned: true,
  supportedExplanationModes: ['voice', 'short-text', 'symbols'],
  ...record,
});

const artType = (record) => ({
  destinationIds: ['tides-of-change-studio'],
  active: false,
  activationBuild: 10,
  versioned: true,
  supportsPhysicalWork: true,
  supportedExplanationModes: ['voice', 'short-text', 'annotation'],
  ...record,
});

export const ARTEFACT_TYPES = Object.freeze([
  atlasType({
    id: 'exploration-snapshot',
    label: 'Exploration Snapshot',
    category: 'investigation',
    printable: true,
    requiredContent: ['viewState'],
    optionalContent: ['markers', 'routes', 'visibleLayers', 'question', 'annotation'],
  }),
  atlasType({
    id: 'three-view-comparison',
    label: 'Three-view Comparison',
    category: 'map',
    printable: true,
    requiredContent: ['globeView', 'worldMapView', 'atlasView'],
    optionalContent: ['recognisableFeature', 'purposeChoice', 'explanation'],
  }),
  atlasType({
    id: 'annotated-location-card',
    label: 'Annotated Location Card',
    category: 'map',
    printable: true,
    requiredContent: ['placeId', 'marker'],
    optionalContent: ['evidenceAnnotations', 'observation', 'voiceExplanationRef'],
  }),
  atlasType({
    id: 'place-pin',
    label: 'Place Pin',
    category: 'map',
    printable: true,
    requiredContent: ['placeId', 'coordinates', 'scaleTrail'],
    optionalContent: ['spokenPlaceNameRef', 'observation', 'question', 'contextViews'],
  }),
  atlasType({
    id: 'climate-pattern-observation',
    label: 'Climate-pattern Observation',
    category: 'investigation',
    printable: true,
    requiredContent: ['selectedPlaces', 'broadPattern'],
    optionalContent: ['caution', 'additionalInfluences', 'evidenceLayers'],
  }),
  atlasType({
    id: 'two-place-comparison',
    label: 'Two-place Comparison',
    category: 'comparison',
    printable: true,
    requiredContent: ['leftPlaceId', 'rightPlaceId', 'evidence'],
    optionalContent: ['similarity', 'difference', 'voiceExplanationRef', 'matchedScale'],
  }),
  atlasType({
    id: 'journey-thread',
    label: 'Journey Thread',
    category: 'map',
    printable: true,
    requiredContent: ['origin', 'destination', 'routeGeometry'],
    optionalContent: ['waypoints', 'broadDirection', 'approximateDistanceKm', 'oceans', 'continents', 'crossesEquator', 'narrationRef'],
  }),
  atlasType({
    id: 'place-portrait',
    label: 'Place Portrait',
    category: 'place-profile',
    printable: true,
    requiredContent: ['placeId', 'selectedEvidence'],
    optionalContent: ['mapView', 'country', 'region', 'broadClimate', 'physicalFeature', 'habitatOrBiome', 'numericalFact', 'observation', 'question', 'voiceExplanationRef'],
  }),
  {
    id: 'planet-question-response',
    label: 'Planet Question Response',
    category: 'changing-idea',
    destinationIds: ['shared', 'planet-atlas'],
    active: true,
    printable: true,
    versioned: false,
    appendOnly: true,
    supportedExplanationModes: ['voice', 'short-text', 'visual-ideas', 'linked-work'],
    requiredContent: ['responseDate'],
    optionalContent: ['voiceResponseRef', 'shortSentence', 'visualIdeaIds', 'linkedArtefactIds', 'whatChanged', 'evidenceUsed', 'stillWondering'],
  },

  // Build 10 contracts: registered now so photographs and physical work survive
  // the same My Work lifecycle, but deliberately not exposed in Build 1.
  artType({
    id: 'artist-observation',
    label: 'Artist Observation',
    category: 'physical-sketchbook-record',
    printable: true,
    requiredContent: ['artistId', 'observation'],
    optionalContent: ['artworkId', 'mediaRef', 'labels', 'visualEvidence', 'rightsRecordId'],
  }),
  artType({
    id: 'movement-study',
    label: 'Movement Study',
    category: 'physical-sketchbook-record',
    printable: true,
    requiredContent: ['mediaChoices'],
    optionalContent: ['mediaRef', 'lineNotes', 'forceNotes', 'artistInfluenceIds'],
  }),
  artType({
    id: 'texture-study',
    label: 'Texture Study',
    category: 'physical-sketchbook-record',
    printable: true,
    requiredContent: ['textureSources'],
    optionalContent: ['mediaRef', 'techniques', 'humanImpactNotes', 'artistInfluenceIds'],
  }),
  artType({
    id: 'colour-study',
    label: 'Colour Study',
    category: 'physical-sketchbook-record',
    printable: true,
    requiredContent: ['colourSequence', 'intendedMeaning'],
    optionalContent: ['mediaRef', 'gradientNotes', 'moodWords', 'artistInfluenceIds'],
  }),
  artType({
    id: 'composition-thumbnail',
    label: 'Composition Thumbnail',
    category: 'physical-sketchbook-record',
    printable: true,
    requiredContent: ['compositionMethod'],
    optionalContent: ['mediaRef', 'annotation', 'preferred', 'reason', 'artistInfluenceIds'],
  }),
  artType({
    id: 'media-experiment',
    label: 'Media Experiment',
    category: 'physical-sketchbook-record',
    printable: true,
    requiredContent: ['mediaChoices', 'technique'],
    optionalContent: ['mediaRef', 'effectObserved', 'nextStep', 'artistInfluenceIds'],
  }),
  artType({
    id: 'a4-plan',
    label: 'A4 Final-work Plan',
    category: 'artwork-plan',
    printable: true,
    requiredContent: ['compositionChoice', 'naturalForce', 'humanImpact', 'mediaPlan'],
    optionalContent: ['mediaRef', 'backgroundWash', 'scaleNotes', 'patternNotes', 'artistInfluenceIds'],
  }),
  artType({
    id: 'final-artwork',
    label: 'Final A3 Mixed-media Artwork',
    category: 'physical-artwork-record',
    printable: true,
    requiredContent: ['mediaRef', 'format', 'mediaUsed'],
    optionalContent: ['title', 'artistInfluenceIds', 'artistStatementArtefactId', 'processArtefactIds'],
    fixedConstraints: { format: 'A3', physicalOriginal: true, mixedMedia: true },
  }),
  artType({
    id: 'artist-statement',
    label: 'Artist Statement',
    category: 'pupil-voice',
    printable: true,
    requiredContent: ['inspiredBy', 'shows', 'message'],
    optionalContent: ['voiceExplanationRef', 'linkedFinalArtworkId'],
    childSentenceFrame: 'My work is inspired by ____. It shows ____. My message is ____.',
  }),
  artType({
    id: 'artist-influence-record',
    label: 'Artist Influence Record',
    category: 'art-thinking',
    printable: true,
    requiredContent: ['artistId', 'influenceDescription'],
    optionalContent: ['artworkId', 'visualEvidence', 'rightsRecordId', 'linkedArtefactIds'],
  }),
  artType({
    id: 'physical-sketchbook-photograph',
    label: 'Physical Sketchbook Photograph',
    category: 'physical-sketchbook-record',
    printable: true,
    requiredContent: ['mediaRef', 'capturedAt'],
    optionalContent: ['stageId', 'pagePurpose', 'annotation', 'artistInfluenceIds', 'imageAltText'],
    binaryStorage: 'indexeddb',
  }),
]);

/** Return a type contract by permanent ID, or null when absent. */
export function getArtefactTypeById(id, artefactTypes = ARTEFACT_TYPES) {
  return artefactTypes.find((type) => type.id === id) ?? null;
}

/** Validate the registered type and the stable shape of its structured content. */
export function validateArtefactContent(typeId, content, artefactTypes = ARTEFACT_TYPES) {
  const type = getArtefactTypeById(typeId, artefactTypes);
  if (!type) return { valid: false, errors: [`Unregistered artefact type: ${String(typeId)}.`] };
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return { valid: false, errors: [`${type.label} content must be an object.`] };
  }
  const missing = type.requiredContent.filter((field) => !Object.hasOwn(content, field));
  return {
    valid: missing.length === 0,
    errors: missing.map((field) => `${type.label} content is missing ${field}.`),
  };
}

/** Pure structural validation for migrations and tests. */
export function validateArtefactTypeManifest(artefactTypes = ARTEFACT_TYPES) {
  const errors = [];
  const ids = new Set();
  for (const [index, type] of artefactTypes.entries()) {
    const label = type?.id ?? `entry ${index}`;
    if (!type?.id) errors.push(`Artefact type ${label} needs an ID.`);
    if (ids.has(type?.id)) errors.push(`Duplicate artefact type ID: ${type.id}.`);
    ids.add(type?.id);
    if (!type?.label) errors.push(`Artefact type ${label} needs a label.`);
    if (!Array.isArray(type?.destinationIds) || type.destinationIds.length === 0) {
      errors.push(`Artefact type ${label} needs at least one destination.`);
    }
    if (!Array.isArray(type?.requiredContent)) errors.push(`Artefact type ${label} needs requiredContent.`);
    if (!Array.isArray(type?.optionalContent)) errors.push(`Artefact type ${label} needs optionalContent.`);
  }
  return { valid: errors.length === 0, errors };
}

export default ARTEFACT_TYPES;
