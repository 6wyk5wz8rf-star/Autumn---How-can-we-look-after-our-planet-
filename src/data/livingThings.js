/** Build 3 curriculum, interaction and permanent-key contracts. */

export const SCIENCE_REGIONS = Object.freeze([
  { id: 'observation-tables', title: 'Observation Tables', mark: '◉', description: 'Look closely before naming or explaining.', accent: 'mineral' },
  { id: 'sorting-meadow', title: 'Sorting Meadow', mark: '∩', description: 'Create groups, state the rule and test it.', accent: 'moss' },
  { id: 'backbone-gallery', title: 'Backbone Gallery', mark: '⌇', description: 'Investigate vertebrates and invertebrate diversity.', accent: 'clay' },
  { id: 'classification-key-workshop', title: 'Classification Key Workshop', mark: '⑂', description: 'Follow, build, test and repair branching keys.', accent: 'indigo' },
  { id: 'habitat-windows', title: 'Habitat Windows', mark: '▧', description: 'Connect conditions and resources to organism needs.', accent: 'moss' },
  { id: 'change-laboratory', title: 'Change Laboratory', mark: '⇢', description: 'Separate evidence from careful predictions about change.', accent: 'amber' },
]);

export const SCIENCE_TOOLS = Object.freeze([
  { id: 'organism-browser', title: 'Organism Browser', regionId: 'observation-tables', mode: 'browser', artefactTypeId: 'organism-observation', invitation: 'Open a specimen drawer and inspect a living thing without needing a key.' },
  { id: 'observation-lens', title: 'Observation Lens', regionId: 'observation-tables', mode: 'observation', artefactTypeId: 'organism-observation', invitation: 'Mark what can be observed, then separate inference and opinion.' },
  { id: 'compare-organisms', title: 'Compare Organisms', regionId: 'observation-tables', mode: 'compare', artefactTypeId: 'organism-comparison', invitation: 'Place two or three organisms together and select precise evidence.' },
  { id: 'free-sorting', title: 'Free Sorting', regionId: 'sorting-meadow', mode: 'sorting', artefactTypeId: 'free-sorting-board', invitation: 'Make your own groups before seeing a formal scientific answer.' },
  { id: 'group-rule-tester', title: 'Group Rule Tester', regionId: 'sorting-meadow', mode: 'rule-test', artefactTypeId: 'tested-grouping-rule', invitation: 'Add a new organism and see whether your rule remains clear and useful.' },
  { id: 'backbone-explorer', title: 'Backbone Explorer', regionId: 'backbone-gallery', mode: 'backbone', artefactTypeId: 'backbone-classification', invitation: 'Use known internal structure as well as surface appearance.' },
  { id: 'vertebrate-gallery', title: 'Vertebrate Group Gallery', regionId: 'backbone-gallery', mode: 'vertebrates', artefactTypeId: 'vertebrate-group-comparison', invitation: 'Compare mammals, birds, fish, reptiles and amphibians without simplistic rules.' },
  { id: 'invertebrate-gallery', title: 'Invertebrate Diversity Gallery', regionId: 'backbone-gallery', mode: 'invertebrates', artefactTypeId: 'invertebrate-diversity-panel', invitation: 'Compare insects, arachnids, molluscs, annelids, crustaceans and more.' },
  { id: 'follow-classification-key', title: 'Follow a Classification Key', regionId: 'classification-key-workshop', mode: 'follow-key', artefactTypeId: 'classification-key-route', invitation: 'Answer one clear question at a time and keep the route visible.' },
  { id: 'build-classification-key', title: 'Build a Classification Key', regionId: 'classification-key-workshop', mode: 'build-key', artefactTypeId: 'branching-classification-key', invitation: 'Choose questions that send organisms down both branches.' },
  { id: 'repair-broken-key', title: 'Repair a Broken Key', regionId: 'classification-key-workshop', mode: 'broken-key', artefactTypeId: 'repaired-key', invitation: 'Find where a route fails, repair it and retest every organism.' },
  { id: 'mystery-organism', title: 'Mystery Organism', regionId: 'classification-key-workshop', mode: 'mystery', artefactTypeId: 'mystery-organism-trail', invitation: 'Use binary questions to narrow a visible set thoughtfully.' },
  { id: 'habitat-windows', title: 'Habitat Windows', regionId: 'habitat-windows', mode: 'habitat', artefactTypeId: 'habitat-needs-map', invitation: 'Inspect what a habitat may provide without assigning one permanent home.' },
  { id: 'microhabitat-lens', title: 'Microhabitat Lens', regionId: 'habitat-windows', mode: 'microhabitat', artefactTypeId: 'microhabitat-observation', invitation: 'Move closer and compare conditions over a small distance.' },
  { id: 'habitat-builder', title: 'Habitat Builder', regionId: 'habitat-windows', mode: 'habitat-builder', artefactTypeId: 'habitat-model', invitation: 'Build a simplified place, then identify what it supports and what may be missing.' },
  { id: 'change-laboratory', title: 'Change Laboratory', regionId: 'change-laboratory', mode: 'change', artefactTypeId: 'environmental-change-chain', invitation: 'Change one condition and build a cautious evidence-linked prediction.' },
  { id: 'survey-builder', title: 'Survey Builder', regionId: 'change-laboratory', mode: 'survey', artefactTypeId: 'survey-record', invitation: 'Record local or fictional tallies without sending data or precise location anywhere.' },
  { id: 'create-science-challenge', title: 'Create a Scientific Challenge', regionId: 'change-laboratory', mode: 'challenge', artefactTypeId: 'child-created-science-challenge', invitation: 'Choose organisms, evidence and a solvable scientific structure for someone else.' },
]);

const ACTIVITY_DEFINITIONS = Object.freeze([
  ['look-like-scientist', 'Look Like a Scientist', 'Observe one organism closely and distinguish observation from inference.', 'observation-tables', 'observation-lens', 'organism-observation', '5427', 'Observation'],
  ['compare-two-living-things', 'Compare Two Living Things', 'Identify precise similarities and differences using visible evidence.', 'observation-tables', 'compare-organisms', 'organism-comparison', '8164', 'Observation'],
  ['make-your-own-groups', 'Make Your Own Groups', 'Create and explain a child-designed grouping rule.', 'sorting-meadow', 'free-sorting', 'free-sorting-board', '2935', 'Grouping'],
  ['test-grouping-rule', 'Test the Grouping Rule', 'Add new organisms and investigate whether a grouping rule remains useful.', 'sorting-meadow', 'group-rule-tester', 'tested-grouping-rule', '6702', 'Grouping'],
  ['backbone-or-no-backbone', 'Backbone or No Backbone?', 'Distinguish vertebrates and invertebrates using accurate evidence.', 'backbone-gallery', 'backbone-explorer', 'backbone-classification', '4396', 'Vertebrates'],
  ['meet-vertebrate-groups', 'Meet the Vertebrate Groups', 'Compare mammals, birds, fish, reptiles and amphibians using useful broad characteristics.', 'backbone-gallery', 'vertebrate-gallery', 'vertebrate-group-comparison', '1852', 'Vertebrates'],
  ['invertebrates-not-one-shape', 'Invertebrates Are Not One Shape', 'Compare varied invertebrates and identify useful distinctions.', 'backbone-gallery', 'invertebrate-gallery', 'invertebrate-diversity-panel', '7249', 'Invertebrates'],
  ['follow-classification-key', 'Follow a Classification Key', 'Use a branching key to identify organisms.', 'classification-key-workshop', 'follow-classification-key', 'classification-key-route', '3516', 'Classification Keys'],
  ['choose-useful-question', 'Choose a Useful Question', 'Compare possible first questions and decide which creates clear branches.', 'classification-key-workshop', 'build-classification-key', 'classification-question-analysis', '9083', 'Classification Keys'],
  ['build-classification-key', 'Build a Classification Key', 'Construct and test a complete branching classification key.', 'classification-key-workshop', 'build-classification-key', 'branching-classification-key', '4671', 'Classification Keys'],
  ['repair-broken-key', 'Repair the Broken Key', 'Identify and correct faults in a classification key.', 'classification-key-workshop', 'repair-broken-key', 'repaired-key', '6325', 'Classification Keys'],
  ['solve-mystery-organism', 'Solve the Mystery Organism', 'Use binary questions and evidence to identify one organism.', 'classification-key-workshop', 'mystery-organism', 'mystery-organism-trail', '2594', 'Classification Keys'],
  ['what-habitat-provides', 'What Does a Habitat Provide?', 'Connect habitat conditions and resources to organism needs.', 'habitat-windows', 'habitat-windows', 'habitat-needs-map', '7816', 'Habitats'],
  ['look-closer-microhabitat', 'Look Closer at a Microhabitat', 'Investigate conditions within a small habitat.', 'habitat-windows', 'microhabitat-lens', 'microhabitat-observation', '5149', 'Habitats'],
  ['when-environment-changes', 'When an Environment Changes', 'Predict possible effects of one environmental change using evidence and careful language.', 'change-laboratory', 'change-laboratory', 'environmental-change-chain', '8362', 'Environmental Change'],
  ['different-living-things-effects', 'Different Living Things, Different Effects', 'Compare how one environmental change could affect several organisms differently.', 'change-laboratory', 'change-laboratory', 'environmental-response-comparison', '1946', 'Environmental Change'],
]);

const MISCONCEPTIONS = Object.freeze({
  'observation-tables': ['An opinion is the same as an observation.', 'A name is more important than visible evidence.', 'A prediction is something directly seen.'],
  'sorting-meadow': ['There is only one valid grouping.', 'A group needs no stated rule.', 'Habitat is the basis of every scientific group.'],
  'backbone-gallery': ['A backbone must be visible in a photograph.', 'All animals are vertebrates.', 'All invertebrates are insects.', 'Spiders are insects.', 'Dolphins are fish because they live in water.', 'Every bird flies.'],
  'classification-key-workshop': ['A key uses open-ended or opinion questions.', 'Big and small are clear without a measurement.', 'A useful question may send every organism down one branch.', 'Two organisms may share one final endpoint in a complete key.'],
  'habitat-windows': ['A habitat is only a backdrop or shelter.', 'Each organism has exactly one habitat.', 'A country is a habitat.', 'A species shown in a biome lives everywhere in that biome.'],
  'change-laboratory': ['Every environmental change is caused by people.', 'Every change harms every organism.', 'A plausible prediction is a confirmed fact.', 'One action has the same effect in every place.'],
});

const VOCABULARY = Object.freeze({
  'observation-tables': ['organism', 'observe', 'observation', 'evidence', 'inference', 'feature', 'characteristic'],
  'sorting-meadow': ['group', 'rule', 'feature', 'classify', 'evidence'],
  'backbone-gallery': ['vertebrate', 'invertebrate', 'backbone', 'mammal', 'bird', 'fish', 'reptile', 'amphibian', 'insect', 'arachnid'],
  'classification-key-workshop': ['classification key', 'branching key', 'question', 'branch', 'outcome', 'identify', 'binary'],
  'habitat-windows': ['habitat', 'microhabitat', 'resource', 'shelter', 'condition', 'environment'],
  'change-laboratory': ['environmental change', 'effect', 'prediction', 'uncertain', 'survey', 'tally', 'evidence'],
});

export const LIVING_THINGS_ACTIVITIES = Object.freeze(ACTIVITY_DEFINITIONS.map((definition, index) => {
  const [id, title, objective, regionId, toolId, artefactTypeId, code, strand] = definition;
  const tool = SCIENCE_TOOLS.find((entry) => entry.id === toolId);
  return Object.freeze({
    id,
    order: index + 1,
    title,
    shortInvitation: tool.invitation,
    invitation: tool.invitation,
    route: `#/activity/${id}`,
    destinationId: 'living-things-observatory',
    regionId,
    toolId,
    mode: tool.mode,
    active: true,
    interactionModel: 'continuous-scientific-workbench',
    rhythm: ['Notice', 'Explore', 'Make', 'Explain'],
    curriculumObjective: objective,
    curriculumRefs: [`science-living-things-${String(index + 1).padStart(2, '0')}`],
    curriculumTags: ['science', 'year-4', 'living-things', regionId, strand.toLowerCase().replaceAll(' ', '-')],
    curriculumStrand: strand,
    conceptTags: ['living-things', 'classification', regionId],
    vocabulary: VOCABULARY[regionId],
    likelyMisconceptions: MISCONCEPTIONS[regionId],
    flow: {
      notice: { prompt: objective, encounter: [tool.mode] },
      explore: { prompt: tool.invitation, actions: ['select-organisms', 'inspect-evidence', 'undo', 'try-another'] },
      make: { product: `Create and save a ${artefactTypeId.replaceAll('-', ' ')}.` },
      explain: { prompt: regionId === 'change-laboratory' ? 'Use may, could or depends on, and name the evidence link.' : 'Name the feature or evidence another scientist could check.' },
    },
    keyCheck: {
      unscored: true,
      prompt: ({
        'observation-tables': 'Which statement is an observation and which is an inference?',
        'sorting-meadow': 'Does every organism in the group follow the stated rule?',
        'backbone-gallery': 'Which evidence distinguishes the broad group?',
        'classification-key-workshop': 'Does the question create two clear branches?',
        'habitat-windows': 'Which condition or resource supports the organism need?',
        'change-laboratory': 'Which statement is observed, known, predicted or still uncertain?',
      })[regionId],
    },
    outcome: { artefactTypeId, titleTemplate: title, printable: true },
    supportedResponseModes: ['touch', 'keyboard', 'visual', 'voice', 'short-text', 'diagram-construction'],
    scaffoldBehaviour: {
      light: 'Open organism set with minimal prompts.',
      core: 'Linked feature labels, evidence and explanation.',
      strong: 'Fewer organisms, highlighted characteristics and a sentence stem.',
      intensive: 'Four organisms, supplied question cards and one decision at a time; the scientific objective is unchanged.',
    },
    printMetadata: { format: 'A4', blackAndWhite: true, preserveBranchLines: true },
    boardViewSuitable: true,
    approximateMinutes: [12, 15, 18, 15, 12, 18, 18, 12, 12, 25, 18, 15, 18, 15, 20, 20][index],
    keyCode: code,
  });
}));

export const SCIENCE_COLLECTIONS = Object.freeze([
  ['observe-compare', 'Observe and Compare', 1, 2, '6284'],
  ['group-living-things', 'Group Living Things', 3, 7, '9735'],
  ['classification-keys', 'Classification Keys', 8, 12, '4068'],
  ['habitats-needs', 'Habitats and Needs', 13, 14, '7512'],
  ['environmental-change', 'Environmental Change', 15, 16, '2849'],
].map(([id, title, from, to, code]) => Object.freeze({
  id: `science-collection-${id}`,
  title,
  code,
  activityIds: LIVING_THINGS_ACTIVITIES.slice(from - 1, to).map((activity) => activity.id),
  description: `Open the connected science pathways from ${LIVING_THINGS_ACTIVITIES[from - 1].title} to ${LIVING_THINGS_ACTIVITIES[to - 1].title}.`,
})));

export const SCIENCE_DESTINATION_KEY = Object.freeze({
  id: 'key-destination-living-things-observatory',
  code: '6193',
  title: 'Every Living Things Observatory Pathway',
  description: 'Add every current and future Living Things Observatory Key Activity to My Keys.',
});

export const SCIENCE_CURRICULUM_RECORDS = Object.freeze(LIVING_THINGS_ACTIVITIES.map((activity) => ({
  id: activity.curriculumRefs[0],
  subject: 'science',
  destinationIds: ['living-things-observatory'],
  activeInBuild1: false,
  activeInBuild2: false,
  activeInBuild3: true,
  activationBuild: 3,
  objectives: [activity.curriculumObjective],
  concepts: activity.conceptTags,
  vocabulary: activity.vocabulary,
  likelyMisconceptions: activity.likelyMisconceptions,
  relatedConcepts: ['living-things', 'classification', 'habitat', 'environmental-change'],
  untaughtFriendlyEntry: activity.shortInvitation,
  supportedResponseModes: activity.supportedResponseModes,
  accessibilitySupports: ['spoken-name', 'zoom', 'tap-to-place', 'drag-alternative', 'stable-organism-position', 'one-branch-at-a-time'],
  possibleKeyCheck: activity.keyCheck.prompt,
  savedArtefactTypeIds: [activity.outcome.artefactTypeId],
  crossCurricularConnections: ['planet-atlas', 'number-expedition', 'evidence', 'explanation'],
})));

export function getScienceTool(id) {
  return SCIENCE_TOOLS.find((tool) => tool.id === id) || null;
}

export function getScienceActivity(id) {
  return LIVING_THINGS_ACTIVITIES.find((activity) => activity.id === id) || null;
}

export function validateLivingThingsManifest() {
  const errors = [];
  if (LIVING_THINGS_ACTIVITIES.length !== 16) errors.push('Living Things Observatory must contain exactly 16 activities.');
  if (SCIENCE_REGIONS.length !== 6) errors.push('Living Things Observatory must contain exactly six regions.');
  if (SCIENCE_COLLECTIONS.length < 5) errors.push('Living Things Observatory needs at least five collections.');
  if (SCIENCE_TOOLS.length !== 18) errors.push('Living Things Observatory must contain 18 open scientific tools.');
  const ids = new Set();
  const codes = new Set();
  for (const activity of LIVING_THINGS_ACTIVITIES) {
    if (ids.has(activity.id)) errors.push(`Duplicate science activity ID: ${activity.id}.`);
    ids.add(activity.id);
    if (!/^\d{4}$/.test(activity.keyCode)) errors.push(`Activity ${activity.id} needs a four-digit key.`);
    if (codes.has(activity.keyCode)) errors.push(`Duplicate science key: ${activity.keyCode}.`);
    codes.add(activity.keyCode);
    if (!getScienceTool(activity.toolId)) errors.push(`Activity ${activity.id} refers to missing tool ${activity.toolId}.`);
    if (!activity.likelyMisconceptions?.length) errors.push(`Activity ${activity.id} needs misconception metadata.`);
  }
  for (const collection of SCIENCE_COLLECTIONS) {
    if (codes.has(collection.code)) errors.push(`Duplicate science key: ${collection.code}.`);
    codes.add(collection.code);
    for (const id of collection.activityIds) if (!ids.has(id)) errors.push(`Collection ${collection.id} refers to missing activity ${id}.`);
  }
  if (codes.has(SCIENCE_DESTINATION_KEY.code)) errors.push(`Duplicate science key: ${SCIENCE_DESTINATION_KEY.code}.`);
  return { valid: errors.length === 0, errors };
}

export default LIVING_THINGS_ACTIVITIES;
