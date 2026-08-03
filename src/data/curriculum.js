import { NUMBER_CURRICULUM_RECORDS } from './numberExpedition.js';
import { SCIENCE_CURRICULUM_RECORDS } from './livingThings.js';

/**
 * Central curriculum contract for the complete ten-build product.
 *
 * Records register accurate intent and extension points; registration does not
 * activate a child-facing destination. In Build 1 only Planet Atlas curriculum
 * experiences are active.
 */

export const CURRICULUM_RECORD_SCHEMA = Object.freeze({
  required: [
    'id',
    'subject',
    'destinationIds',
    'objectives',
    'concepts',
    'vocabulary',
    'likelyMisconceptions',
    'relatedConcepts',
    'untaughtFriendlyEntry',
    'supportedResponseModes',
    'accessibilitySupports',
    'possibleKeyCheck',
    'savedArtefactTypeIds',
    'crossCurricularConnections',
  ],
});

const curriculumRecord = (record) => Object.freeze({
  status: 'registered',
  activeInBuild1: false,
  supportedResponseModes: ['touch', 'visual', 'voice', 'short-text'],
  accessibilitySupports: ['spoken-guidance', 'large-touch-targets', 'drag-alternative', 'scaffold-levels'],
  possibleKeyCheck: null,
  savedArtefactTypeIds: [],
  crossCurricularConnections: [],
  ...record,
});

export const ARTIST_METADATA_SCHEMA = Object.freeze({
  required: ['id', 'name', 'lifeDates', 'placesConnected', 'focusConcepts', 'pronunciationText'],
  optional: ['contextNote', 'verifiedSourceRefs'],
  safeguard: 'Artist context must be concise, relevant and separated from assumptions about place or identity.',
});

export const ARTWORK_RIGHTS_SCHEMA = Object.freeze({
  required: [
    'id',
    'artistId',
    'title',
    'dateOrPeriod',
    'rightsStatus',
    'sourceName',
    'sourceUrl',
    'licenceOrPermission',
    'creditLine',
    'verifiedAt',
    'displayApproved',
  ],
  optional: ['expiryDate', 'territory', 'allowedUses', 'assetHash', 'altText', 'notes'],
  rules: [
    'No artwork image is displayed until source and usage rights are recorded and approved.',
    'Public-domain artwork and a digital reproduction of it may have different source terms.',
    'A title or artist reference never implies permission to reproduce an image.',
    'Store the smallest suitable, accessible asset and its credit beside the rights record.',
  ],
});

export const ARTISTS = Object.freeze([
  {
    id: 'jmw-turner',
    name: 'J. M. W. Turner',
    lifeDates: '1775–1851',
    placesConnected: ['Britain', 'the River Thames'],
    focusConcepts: ['storms', 'light', 'blurred-edges', 'contrast', 'movement', 'natural-power'],
    pronunciationText: 'J. M. W. Turner',
    contextNote: 'Used light, colour and energetic marks to make weather and water feel active and powerful.',
  },
  {
    id: 'cornelia-parker',
    name: 'Cornelia Parker',
    lifeDates: 'born 1956',
    placesConnected: ['Britain'],
    focusConcepts: ['destruction', 'fragments', 'human-impact', 'scars', 'damage', 'suspended-objects'],
    pronunciationText: 'Cornelia Parker',
    contextNote: 'Transforms and rearranges materials so viewers reconsider objects, events and traces of damage.',
  },
  {
    id: 'olafur-eliasson',
    name: 'Olafur Eliasson',
    lifeDates: 'born 1967',
    placesConnected: ['Iceland', 'Denmark'],
    focusConcepts: ['colour', 'light', 'ice', 'water', 'atmosphere', 'climate-response'],
    pronunciationText: 'Olafur Eliasson',
    contextNote: 'Creates experiences with light, colour, weather and natural materials that make perception part of the work.',
  },
  {
    id: 'agnes-denes',
    name: 'Agnes Denes',
    lifeDates: 'born 1931',
    placesConnected: ['Hungary', 'Sweden', 'United States'],
    focusConcepts: ['juxtaposition', 'nature', 'human-environments', 'collision', 'visual-contrast'],
    pronunciationText: 'Agnes Denes',
    contextNote: 'Uses land, systems and striking contrasts to question how people organise and value the world.',
  },
  {
    id: 'katsushika-hokusai',
    name: 'Katsushika Hokusai',
    lifeDates: '1760–1849',
    placesConnected: ['Japan'],
    focusConcepts: ['scale', 'pattern', 'rhythm', 'drama', 'natural-power'],
    pronunciationText: 'Katsushika Hokusai',
    contextNote: 'Used strong shapes, repeated curves and changes of scale to make nature feel immense beside people.',
  },
]);

/**
 * Artwork references contain metadata only. Build 10 must create a completed
 * `ARTWORK_RIGHTS_SCHEMA` record before attaching any reproduction.
 */
export const ARTWORK_REFERENCES = Object.freeze([
  {
    id: 'turner-storm-and-thames-reference-set',
    artistId: 'jmw-turner',
    titles: ['Selected storm, sea and River Thames works'],
    focus: ['light', 'blurred edges', 'contrast', 'movement'],
    artworkImageIncluded: false,
    rightsAction: 'Select authoritative, accessible public-collection reproductions and verify each source licence in Build 10.',
  },
  {
    id: 'parker-cold-dark-matter',
    artistId: 'cornelia-parker',
    titles: ['Cold Dark Matter: An Exploded View'],
    focus: ['destruction', 'fragments', 'human impact', 'damage'],
    artworkImageIncluded: false,
    rightsAction: 'Contemporary copyrighted work: obtain or link to an approved source under recorded terms before display.',
  },
  {
    id: 'eliasson-weather-and-ice',
    artistId: 'olafur-eliasson',
    titles: ['The Weather Project', 'Ice Watch'],
    focus: ['colour', 'light', 'ice', 'water', 'atmosphere', 'climate response'],
    artworkImageIncluded: false,
    rightsAction: 'Contemporary copyrighted works: obtain or link to approved sources under recorded terms before display.',
  },
  {
    id: 'denes-wheatfield',
    artistId: 'agnes-denes',
    titles: ['Wheatfield — A Confrontation'],
    focus: ['juxtaposition', 'nature', 'human environments', 'visual contrast'],
    artworkImageIncluded: false,
    rightsAction: 'Contemporary copyrighted work: obtain or link to an approved source under recorded terms before display.',
  },
  {
    id: 'hokusai-great-wave',
    artistId: 'katsushika-hokusai',
    titles: ['The Great Wave off Kanagawa'],
    focus: ['scale', 'pattern', 'rhythm', 'drama', 'nature beside people'],
    artworkImageIncluded: false,
    rightsAction: 'Select an authoritative public-domain source reproduction and record that source’s reuse terms before display.',
  },
]);

export const TIDES_OF_CHANGE_STAGES = Object.freeze([
  {
    id: 'tides-stage-1-nature-as-power',
    order: 1,
    title: 'Nature as Power',
    artistIds: ['jmw-turner'],
    artworkReferenceIds: ['turner-storm-and-thames-reference-set'],
    artistFocus: ['storms', 'the Thames', 'light', 'blurred edges', 'contrast', 'movement'],
    physicalExploration: ['charcoal', 'swirling lines', 'smudging', 'waves', 'skies', 'trees', 'force', 'power', 'movement'],
    sketchbookOutcome: 'Storm and sea studies with labelled observations',
    artefactTypeIds: ['artist-observation', 'movement-study', 'physical-sketchbook-photograph'],
  },
  {
    id: 'tides-stage-2-human-impact-marks',
    order: 2,
    title: 'Human Impact Marks',
    artistIds: ['cornelia-parker'],
    artworkReferenceIds: ['parker-cold-dark-matter'],
    artistFocus: ['destruction', 'fragments', 'human impact', 'scars', 'damage'],
    physicalExploration: ['texture rubbings', 'brick', 'fence', 'tarmac', 'foil', 'litter', 'ink splatters', 'smears'],
    sketchbookOutcome: 'Human Marks on the Planet',
    artefactTypeIds: ['artist-observation', 'texture-study', 'physical-sketchbook-photograph'],
  },
  {
    id: 'tides-stage-3-colour-as-meaning',
    order: 3,
    title: 'Colour as Meaning',
    artistIds: ['olafur-eliasson'],
    artworkReferenceIds: ['eliasson-weather-and-ice'],
    artistFocus: ['colour', 'light', 'ice', 'water', 'atmosphere', 'climate response'],
    physicalExploration: [
      'blue-to-white gradients',
      'orange-to-black-or-brown gradients',
      'calm',
      'fragility',
      'heat',
      'danger',
      'pollution',
    ],
    sketchbookOutcome: 'Moods of the Planet',
    artefactTypeIds: ['artist-observation', 'colour-study', 'physical-sketchbook-photograph'],
  },
  {
    id: 'tides-stage-4-composing-a-clash',
    order: 4,
    title: 'Composing a Clash',
    artistIds: ['agnes-denes'],
    artworkReferenceIds: ['denes-wheatfield'],
    artistFocus: ['juxtaposition', 'nature', 'human environments', 'collision', 'visual contrast'],
    physicalExploration: ['diagonal composition', 'top-and-bottom division', 'overlapping layers', 'thumbnail planning', 'annotation'],
    sketchbookOutcome: 'Three compositions and one preferred composition with a reason',
    artefactTypeIds: ['artist-observation', 'composition-thumbnail', 'physical-sketchbook-photograph'],
  },
  {
    id: 'tides-stage-5-preparing-final-work',
    order: 5,
    title: 'Preparing Final Work',
    artistIds: ['katsushika-hokusai'],
    artworkReferenceIds: ['hokusai-great-wave'],
    artistFocus: ['scale', 'pattern', 'rhythm', 'drama', 'nature appearing powerful beside people'],
    physicalExploration: ['A4 plan', 'background wash', 'natural force', 'human impact', 'media choices', 'composition choices'],
    sketchbookOutcome: 'An annotated A4 plan that keeps artist influences visible',
    artefactTypeIds: ['artist-observation', 'media-experiment', 'a4-plan', 'artist-influence-record', 'physical-sketchbook-photograph'],
  },
  {
    id: 'tides-stage-6-final-artwork',
    order: 6,
    title: 'Final Artwork',
    artistIds: ['jmw-turner', 'cornelia-parker', 'olafur-eliasson', 'agnes-denes', 'katsushika-hokusai'],
    artworkReferenceIds: [],
    artistFocus: ['visible influence', 'meaningful relationship or clash', 'pupil voice'],
    physicalExploration: ['paint', 'drawing', 'pastel', 'charcoal', 'collage', 'texture', 'layered media'],
    sketchbookOutcome: 'An individual A3 mixed-media artwork and an artist statement',
    finalConstraints: {
      physicalFormat: 'A3',
      media: 'mixed media',
      relationship: 'a meaningful relationship or clash between nature and human impact',
      artistStatementFrame: 'My work is inspired by ____. It shows ____. My message is ____.',
    },
    artefactTypeIds: ['final-artwork', 'artist-statement', 'artist-influence-record', 'physical-sketchbook-photograph'],
  },
]);

const geographyRecords = [
  curriculumRecord({
    id: 'geo-maps-atlases-globes',
    subject: 'geography',
    destinationIds: ['planet-atlas'],
    activeInBuild1: true,
    objectives: [
      'Use maps, atlases, globes and digital mapping to locate countries and describe studied features.',
      'Compare how a spherical Earth, flat map and close atlas view represent place and scale.',
    ],
    concepts: ['earth', 'representation', 'globe', 'map', 'atlas', 'continent', 'country'],
    vocabulary: ['Earth', 'planet', 'globe', 'map', 'atlas', 'continent', 'country', 'region', 'ocean'],
    likelyMisconceptions: [
      'A flat map is an undistorted copy of a globe.',
      'A continent, country and region are interchangeable.',
      'A closer map shows a bigger real place rather than more detail at a different scale.',
    ],
    relatedConcepts: ['map-scale', 'coastline', 'border', 'digital-mapping'],
    untaughtFriendlyEntry: 'Rotate, switch and align the same recognisable coastline in three representations.',
    possibleKeyCheck: 'Choose a representation for a purpose and explain the choice.',
    savedArtefactTypeIds: ['exploration-snapshot', 'three-view-comparison'],
    crossCurricularConnections: ['mathematical-scale', 'visual-representation'],
  }),
  curriculumRecord({
    id: 'geo-locate-africa-gambia',
    subject: 'geography',
    destinationIds: ['planet-atlas'],
    activeInBuild1: true,
    objectives: [
      'Locate Africa, West Africa and The Gambia within a world context.',
      'Use oceans, coastlines, neighbouring countries and scale transitions as location evidence.',
    ],
    concepts: ['africa', 'west-africa', 'the-gambia', 'senegal', 'river-gambia', 'location'],
    vocabulary: ['Africa', 'West Africa', 'The Gambia', 'Senegal', 'Atlantic Ocean', 'River Gambia', 'coastline', 'border'],
    likelyMisconceptions: [
      'Africa is one country or has one climate and culture.',
      'The Gambia is a region rather than a country.',
      'The Gambia is wholly enclosed by Senegal; it also has an Atlantic coast.',
    ],
    relatedConcepts: ['continent', 'country', 'region', 'map-scale', 'coastline'],
    untaughtFriendlyEntry: 'Follow a visible scale trail while stable coast and continent anchors remain on screen.',
    possibleKeyCheck: 'Reconstruct the scale trail and locate The Gambia from the West African coastline.',
    savedArtefactTypeIds: ['annotated-location-card', 'place-pin'],
    crossCurricularConnections: ['community', 'isatou-ceesay', 'materials', 'biography'],
  }),
  curriculumRecord({
    id: 'geo-scale-direction',
    subject: 'geography',
    destinationIds: ['planet-atlas'],
    activeInBuild1: true,
    objectives: ['Use compass directions, map scale and approximate distance to describe location and journeys.'],
    concepts: ['map-scale', 'direction', 'distance', 'route', 'journey'],
    vocabulary: ['scale', 'compass', 'north', 'south', 'east', 'west', 'origin', 'destination', 'distance'],
    likelyMisconceptions: ['A drawn route is an exact travel path.', 'Up always means north in every representation.', 'A longer line on screen always means a longer real-world distance.'],
    relatedConcepts: ['equator', 'continent', 'ocean', 'digital-mapping'],
    untaughtFriendlyEntry: 'Draw between familiar places and watch direction and approximate distance respond.',
    possibleKeyCheck: 'Choose the broad direction from an origin to a destination.',
    savedArtefactTypeIds: ['journey-thread'],
    crossCurricularConnections: ['measurement', 'estimation', 'number-lines'],
  }),
  curriculumRecord({
    id: 'geo-digital-mapping',
    subject: 'geography',
    destinationIds: ['planet-atlas'],
    activeInBuild1: true,
    objectives: ['Use digital mapping purposefully to zoom, pan, layer, mark, compare and ask geographical questions.'],
    concepts: ['digital-mapping', 'layer', 'marker', 'route', 'map-evidence'],
    vocabulary: ['zoom', 'pan', 'layer', 'marker', 'route', 'label', 'scale'],
    likelyMisconceptions: ['Digital map labels are complete and neutral.', 'Zooming creates new geographical evidence rather than changing detail and scale.'],
    relatedConcepts: ['representation', 'source', 'evidence'],
    untaughtFriendlyEntry: 'Make one reversible change at a time and describe what the map now shows.',
    possibleKeyCheck: 'Select the layer and scale most useful for a stated question.',
    savedArtefactTypeIds: ['exploration-snapshot', 'journey-thread', 'place-portrait'],
    crossCurricularConnections: ['data-literacy', 'spoken-explanation'],
  }),
  curriculumRecord({
    id: 'geo-climate-zones-biomes',
    subject: 'geography',
    destinationIds: ['planet-atlas', 'climate-laboratory', 'living-things-observatory'],
    activeInBuild1: true,
    objectives: ['Describe broad climate-zone patterns and connect climate with selected biomes and habitats.'],
    concepts: ['equator', 'latitude', 'climate', 'climate-zone', 'biome', 'habitat'],
    vocabulary: ['equator', 'hemisphere', 'climate', 'climate zone', 'biome', 'habitat', 'latitude'],
    likelyMisconceptions: ['Latitude alone determines climate.', 'Every place near the equator has identical weather.', 'Climate and daily weather mean the same thing.'],
    relatedConcepts: ['temperature', 'rainfall', 'altitude', 'ocean-current', 'living-things'],
    untaughtFriendlyEntry: 'Reveal patterned broad zones, compare exceptions and keep other influences visible.',
    possibleKeyCheck: 'Pair a broad observation with language that preserves uncertainty and other influences.',
    savedArtefactTypeIds: ['climate-pattern-observation', 'place-portrait'],
    crossCurricularConnections: ['negative-numbers', 'habitats', 'environmental-change'],
  }),
  curriculumRecord({
    id: 'geo-place-comparison',
    subject: 'geography',
    destinationIds: ['planet-atlas'],
    activeInBuild1: true,
    objectives: ['Compare the United Kingdom and The Gambia using mapped location, scale, coast, broad climate and selected physical features.'],
    concepts: ['place', 'comparison', 'map-evidence', 'similarity', 'difference'],
    vocabulary: ['location', 'continent', 'equator', 'coastline', 'climate', 'physical feature', 'scale'],
    likelyMisconceptions: ['A whole place can be described by one contrast such as hot/cold.', 'Maps support claims about wealth, modernity or people’s lives without other evidence.'],
    relatedConcepts: ['united-kingdom', 'the-gambia', 'source', 'evidence'],
    untaughtFriendlyEntry: 'Inspect matched-scale views and select only statements supported by the visible evidence.',
    possibleKeyCheck: 'Separate map-supported claims from claims needing a different source.',
    savedArtefactTypeIds: ['two-place-comparison', 'place-portrait'],
    crossCurricularConnections: ['comparison-language', 'evidence-selection'],
  }),
  curriculumRecord({
    id: 'geo-environmental-change',
    subject: 'geography',
    destinationIds: ['planet-atlas', 'climate-laboratory', 'materials-river', 'community-garden'],
    activeInBuild1: true,
    objectives: ['Investigate global warming and other environmental changes, their implications, and how actions may affect places differently.'],
    concepts: ['global-warming', 'environmental-change', 'place', 'community', 'benefit', 'unintended-consequence'],
    vocabulary: ['environmental change', 'global warming', 'evidence', 'implication', 'community', 'consequence'],
    likelyMisconceptions: ['One action suits every place.', 'Environmental decisions have only benefits or only harms.', 'Children are personally responsible for solving systemic problems.'],
    relatedConcepts: ['climate', 'habitat', 'materials', 'community-action'],
    untaughtFriendlyEntry: 'Inspect a proposed action and ask what must be known about the particular place first.',
    possibleKeyCheck: 'Choose information needed before judging an environmental action.',
    savedArtefactTypeIds: ['planet-question-response'],
    crossCurricularConnections: ['science-environmental-change', 'pshe-community', 'mathematical-evidence'],
  }),
];

const legacyScienceRecords = [
  curriculumRecord({
    id: 'sci-grouping-living-things',
    subject: 'science',
    destinationIds: ['living-things-observatory'],
    objectives: ['Recognise that living things can be grouped in different ways, including useful vertebrate and invertebrate groupings.'],
    concepts: ['living-things', 'grouping', 'vertebrate', 'invertebrate', 'observable-feature'],
    vocabulary: ['organism', 'group', 'feature', 'vertebrate', 'invertebrate'],
    likelyMisconceptions: ['There is only one valid way to group living things.', 'All invertebrates are insects.', 'Size or habitat alone identifies a vertebrate.'],
    relatedConcepts: ['classification', 'habitat', 'adaptation'],
    untaughtFriendlyEntry: 'Sort visible organisms by a feature the child can point to, then compare grouping rules.',
    possibleKeyCheck: 'Explain and test one grouping rule against a new organism.',
    savedArtefactTypeIds: ['scientific-classification'],
    crossCurricularConnections: ['biomes', 'data-grouping', 'explanation'],
  }),
  curriculumRecord({
    id: 'sci-classification-keys',
    subject: 'science',
    destinationIds: ['living-things-observatory'],
    objectives: ['Explore and use classification keys to identify and group living things in local and wider environments.'],
    concepts: ['classification-key', 'question', 'observable-feature', 'branch'],
    vocabulary: ['classification key', 'identify', 'feature', 'branch', 'yes', 'no'],
    likelyMisconceptions: ['A classification key asks opinion questions.', 'A key proves every possible fact about an organism.'],
    relatedConcepts: ['grouping', 'logic', 'evidence'],
    untaughtFriendlyEntry: 'Choose between two visible features and follow the branch to see what the question separates.',
    possibleKeyCheck: 'Repair a branch whose question does not separate the organisms.',
    savedArtefactTypeIds: ['classification-key'],
    crossCurricularConnections: ['logical-reasoning', 'question-marks'],
  }),
  curriculumRecord({
    id: 'sci-habitats-environmental-change',
    subject: 'science',
    destinationIds: ['living-things-observatory', 'climate-laboratory'],
    objectives: ['Recognise that environments can change and that this can sometimes pose dangers to living things.'],
    concepts: ['habitat', 'environmental-change', 'living-things', 'danger', 'interdependence'],
    vocabulary: ['habitat', 'environment', 'change', 'danger', 'depend', 'survive'],
    likelyMisconceptions: ['Every environmental change is caused by people.', 'Every change affects every organism in the same way.', 'A habitat is only an animal’s shelter.'],
    relatedConcepts: ['biome', 'climate', 'material', 'food', 'shelter'],
    untaughtFriendlyEntry: 'Change one environmental condition and observe several organisms’ differing needs.',
    possibleKeyCheck: 'Link a change to evidence of one possible effect without claiming certainty.',
    savedArtefactTypeIds: ['habitat-change-investigation'],
    crossCurricularConnections: ['climate-zones', 'materials', 'cause-and-effect'],
  }),
];

const scienceRecords = SCIENCE_CURRICULUM_RECORDS.map(curriculumRecord);

const mathematicsRecords = NUMBER_CURRICULUM_RECORDS.map(curriculumRecord);

const englishRecords = [
  curriculumRecord({
    id: 'eng-visual-and-written-retelling',
    subject: 'english',
    destinationIds: ['story-theatre'],
    objectives: ['Sequence visual events, retell orally, and develop a coherent written retelling.'],
    concepts: ['sequence', 'chronology', 'oral-retelling', 'written-retelling', 'viewpoint'],
    vocabulary: ['sequence', 'event', 'before', 'after', 'meanwhile', 'retell'],
    likelyMisconceptions: ['A retelling must include every visible detail.', 'Chronology and page order are always identical.'],
    relatedConcepts: ['story', 'cause-and-effect', 'punctuation'],
    untaughtFriendlyEntry: 'Arrange images and narrate what changed between them.',
    possibleKeyCheck: 'Repair a sequence and explain the evidence for the order.',
    savedArtefactTypeIds: ['visual-storyboard', 'oral-retelling', 'written-retelling'],
    crossCurricularConnections: ['materials-journey', 'environmental-change'],
  }),
  curriculumRecord({
    id: 'eng-environmental-non-fiction',
    subject: 'english',
    destinationIds: ['word-workshop', 'story-theatre'],
    objectives: [
      'Read and create age-appropriate environmental non-fiction.',
      'Use question marks, exclamation marks, capital letters, full stops and commas with purpose.',
      'Plan, draft, edit and publish for a reader.',
    ],
    concepts: ['non-fiction', 'purpose', 'audience', 'sentence', 'punctuation', 'drafting', 'editing'],
    vocabulary: ['question mark', 'exclamation mark', 'capital letter', 'full stop', 'comma', 'draft', 'edit', 'publish'],
    likelyMisconceptions: ['Every forceful sentence needs an exclamation mark.', 'Editing means copying neatly.', 'Environmental non-fiction must tell the reader what to believe.'],
    relatedConcepts: ['evidence', 'explanation', 'persuasion', 'question'],
    untaughtFriendlyEntry: 'Move visual punctuation and hear how meaning changes before naming the rule.',
    possibleKeyCheck: 'Choose and explain punctuation for meaning in one sentence.',
    savedArtefactTypeIds: ['non-fiction-draft', 'published-non-fiction'],
    crossCurricularConnections: ['geographical-question', 'scientific-explanation'],
  }),
  curriculumRecord({
    id: 'eng-biography-autobiography',
    subject: 'english',
    destinationIds: ['biography-mosaic'],
    objectives: ['Distinguish biography and autobiography; organise chronology with subheadings; plan, draft, edit and publish.'],
    concepts: ['biography', 'autobiography', 'chronology', 'subheading', 'source', 'perspective'],
    vocabulary: ['biography', 'autobiography', 'chronology', 'subheading', 'source', 'draft', 'edit'],
    likelyMisconceptions: ['Biography and autobiography differ only in title.', 'A life story contains every event.', 'One source gives a complete neutral account.'],
    relatedConcepts: ['timeline', 'evidence', 'community-action', 'isatou-ceesay'],
    untaughtFriendlyEntry: 'Arrange evidence fragments on a life timeline and choose helpful group headings.',
    possibleKeyCheck: 'Identify whether a short passage’s viewpoint is biographical or autobiographical and explain the clue.',
    savedArtefactTypeIds: ['biography-timeline', 'biography-draft', 'published-biography'],
    crossCurricularConnections: ['the-gambia', 'community', 'materials'],
  }),
  curriculumRecord({
    id: 'eng-poetry-word-knowledge',
    subject: 'english',
    destinationIds: ['word-workshop', 'story-theatre'],
    objectives: [
      'Read, compose and perform poetry with attention to voice, rhythm and meaning.',
      'Distinguish relevant homophones.',
      'Use prefixes in-, il-, im-, ir-, sub- and inter-.',
      'Rehearse curriculum challenge words in meaningful contexts.',
    ],
    concepts: ['poetry', 'performance', 'homophone', 'prefix', 'word-meaning', 'spelling'],
    vocabulary: ['poem', 'performance', 'rhythm', 'homophone', 'prefix', 'root word'],
    likelyMisconceptions: ['A prefix can be added to any root.', 'Homophones have the same spelling.', 'Performance quality is mainly volume or speed.'],
    relatedConcepts: ['mood', 'voice', 'meaning', 'editing'],
    untaughtFriendlyEntry: 'Hear, move and recombine words in a meaningful visual or spoken context.',
    possibleKeyCheck: 'Select a word form that fits both meaning and sentence context.',
    savedArtefactTypeIds: ['poem-draft', 'poetry-performance'],
    crossCurricularConnections: ['art-mood', 'environmental-language'],
  }),
];

const psheRecords = [
  curriculumRecord({
    id: 'pshe-belonging-groups',
    subject: 'pshe',
    destinationIds: ['community-garden'],
    objectives: ['Explore belonging, recognise different groups, and consider contribution, volunteering and shared interests.'],
    concepts: ['belonging', 'community', 'group', 'contribution', 'volunteering', 'shared-interest'],
    vocabulary: ['belonging', 'community', 'group', 'contribute', 'volunteer', 'shared interest'],
    likelyMisconceptions: ['Belonging requires everyone to be the same.', 'Contribution is valuable only when it is large or public.'],
    relatedConcepts: ['mutual-respect', 'environmental-action', 'place'],
    untaughtFriendlyEntry: 'Arrange overlapping group connections and notice the many ways one person may belong.',
    possibleKeyCheck: 'Choose a contribution that responds respectfully to a stated community need.',
    savedArtefactTypeIds: ['community-connection-map'],
    crossCurricularConnections: ['the-gambia', 'community-action', 'biography'],
  }),
  curriculumRecord({
    id: 'pshe-relationships-support',
    subject: 'pshe',
    destinationIds: ['community-garden'],
    objectives: ['Explore compassion, friendship, trust, mutual respect, loneliness, exclusion and ways to seek support.'],
    concepts: ['compassion', 'friendship', 'trust', 'mutual-respect', 'loneliness', 'exclusion', 'support'],
    vocabulary: ['compassion', 'trust', 'respect', 'loneliness', 'exclusion', 'support'],
    likelyMisconceptions: ['Seeking support is a failure.', 'One kind act automatically repairs exclusion.', 'Friends must always agree.'],
    relatedConcepts: ['belonging', 'community', 'safe-adult', 'boundary'],
    untaughtFriendlyEntry: 'Inspect low-stakes illustrated situations and identify feelings, needs and possible sources of support.',
    possibleKeyCheck: 'Select more than one safe support route for a scenario.',
    savedArtefactTypeIds: ['support-pathway'],
    crossCurricularConnections: ['pupil-voice', 'community'],
  }),
];

const artRecords = TIDES_OF_CHANGE_STAGES.map((stage) => curriculumRecord({
  id: stage.id,
  subject: 'art-and-design',
  destinationIds: ['tides-of-change-studio'],
  activationBuild: 10,
  childFacingInBuild1: false,
  objectives: [
    `Study ${stage.title.toLowerCase()} through purposeful artist observation, physical experimentation and reflection.`,
    stage.sketchbookOutcome,
  ],
  concepts: [...stage.artistFocus],
  vocabulary: [...new Set(['artist', 'artwork', 'media', ...stage.artistFocus])],
  likelyMisconceptions: [
    'Artist influence means copying the source image.',
    'The digital environment replaces physical media or the physical sketchbook.',
    'A finished-looking page is more important than visible investigation and choices.',
  ],
  relatedConcepts: ['natural-power', 'human-impact', 'climate-response', 'pupil-voice'],
  untaughtFriendlyEntry: 'Begin with close visual noticing and a physical material experiment rather than a long artist biography.',
  supportedResponseModes: ['physical-media', 'sketchbook', 'photograph-record', 'voice', 'annotation', 'short-text'],
  accessibilitySupports: ['spoken-artist-context', 'visual-demonstration', 'adapted-material-tools', 'choice-of-mark-making', 'voice-annotation'],
  possibleKeyCheck: 'Select visible evidence of an artist influence and explain how it changed a material or composition choice.',
  savedArtefactTypeIds: stage.artefactTypeIds,
  crossCurricularConnections: ['environmental-change', 'climate', 'materials', 'spoken-explanation'],
  physicalMediaBoundary: 'The application records, revisits and connects physical work; it does not replace making with physical media.',
}));

export const CURRICULUM_RECORDS = Object.freeze([
  ...geographyRecords,
  ...scienceRecords,
  ...mathematicsRecords,
  ...englishRecords,
  ...psheRecords,
  ...artRecords,
]);

export const CLASS_TEXT_REFERENCES = Object.freeze([
  'Stuff',
  'A Place for Plastic',
  'One Plastic Bag',
  'Ossiri and the Bala Mengro',
  'Africa, Amazing Africa',
  'Give and Take',
].map((title) => ({
  title,
  contentIncluded: false,
  use: 'bibliographic curriculum connection only',
  copyrightSafeguard: 'Do not reproduce complete books, illustrations or substantial extracts.',
})));

export const CURRICULUM_MANIFEST = Object.freeze({
  schemaVersion: 1,
  productTitle: 'How Can We Look After Our Planet?',
  centralEnquiry: 'How can we look after our planet?',
  learningMovement: ['encounter', 'explore', 'recognise', 'use', 'connect'],
  records: CURRICULUM_RECORDS,
  artists: ARTISTS,
  artworkReferences: ARTWORK_REFERENCES,
  tidesOfChangeStages: TIDES_OF_CHANGE_STAGES,
  classTextReferences: CLASS_TEXT_REFERENCES,
  safeguards: [
    'The central enquiry has no single pre-selected answer.',
    'Do not use guilt, points or simplistic environmental rules as curriculum.',
    'Registered future curriculum does not create a child-facing unfinished destination.',
    'Do not reproduce copyrighted books or contemporary artwork without recorded permission.',
  ],
});

export function getCurriculumRecordById(id, records = CURRICULUM_RECORDS) {
  return records.find((record) => record.id === id) ?? null;
}

/** Pure shape validation; useful before accepting later-build manifest changes. */
export function validateCurriculumManifest(records = CURRICULUM_RECORDS) {
  const errors = [];
  const ids = new Set();
  for (const [index, record] of records.entries()) {
    const label = record?.id ?? `entry ${index}`;
    if (!record?.id) errors.push(`Curriculum record ${label} needs an ID.`);
    if (ids.has(record?.id)) errors.push(`Duplicate curriculum record ID: ${record.id}.`);
    ids.add(record?.id);
    for (const field of CURRICULUM_RECORD_SCHEMA.required) {
      if (!(field in (record ?? {}))) errors.push(`Curriculum record ${label} is missing ${field}.`);
    }
    for (const field of ['destinationIds', 'objectives', 'concepts', 'vocabulary', 'likelyMisconceptions']) {
      if (!Array.isArray(record?.[field]) || record[field].length === 0) {
        errors.push(`Curriculum record ${label} needs a non-empty ${field} array.`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export default CURRICULUM_MANIFEST;
