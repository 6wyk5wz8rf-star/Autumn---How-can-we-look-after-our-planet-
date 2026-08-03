/**
 * Build 2 curriculum and interaction manifest for Number Expedition.
 *
 * Permanent IDs, authored order and key codes are persistence contracts. The
 * interface consumes this data; it does not duplicate the curriculum in views.
 */

export const NUMBER_REGIONS = Object.freeze([
  { id: 'number-base-camp', title: 'Number Base Camp', mark: '▦', description: 'Build, exchange and partition four-digit numbers.', accent: 'moss' },
  { id: 'magnitude-trail', title: 'Magnitude Trail', mark: '↔', description: 'Compare, step and position numbers with real scale.', accent: 'mineral' },
  { id: 'rounding-ridge', title: 'Rounding Ridge', mark: '⌒', description: 'Judge distance, round and make useful estimates.', accent: 'amber' },
  { id: 'beyond-zero-station', title: 'Beyond Zero Station', mark: '±', description: 'Travel through zero and construct Roman numerals.', accent: 'clay' },
  { id: 'addition-workshop', title: 'Addition Workshop', mark: '+', description: 'Combine quantities and exchange without changing value.', accent: 'indigo' },
  { id: 'subtraction-workshop', title: 'Subtraction Workshop', mark: '−', description: 'Find differences and choose efficient subtraction.', accent: 'graphite' },
  { id: 'reasoning-observatory', title: 'Reasoning Observatory', mark: '◇', description: 'Use inverse, model problems and test statements.', accent: 'mineral' },
]);

export const NUMBER_TOOLS = Object.freeze([
  { id: 'build-number', title: 'Build a Number', regionId: 'number-base-camp', mode: 'place-value', artefactTypeId: 'four-digit-model', invitation: 'Change a digit and every representation changes with it.' },
  { id: 'partition-number', title: 'Partition a Number', regionId: 'number-base-camp', mode: 'partition', artefactTypeId: 'partition-card', invitation: 'Make the same value in more than one way.' },
  { id: 'more-less-stepper', title: 'More or Less Stepper', regionId: 'magnitude-trail', mode: 'stepper', artefactTypeId: 'comparison-explanation', invitation: 'Step by 10, 100 or 1,000 and inspect every changed digit.' },
  { id: 'compare-numbers', title: 'Compare Numbers', regionId: 'magnitude-trail', mode: 'compare', artefactTypeId: 'comparison-explanation', invitation: 'Find the first place-value column that decides.' },
  { id: 'order-numbers', title: 'Order Numbers', regionId: 'magnitude-trail', mode: 'order', artefactTypeId: 'ordered-number-set', invitation: 'Arrange mixed representations by magnitude.' },
  { id: 'open-number-line', title: 'Open Number Line', regionId: 'magnitude-trail', mode: 'number-line', artefactTypeId: 'number-line-estimate', invitation: 'Place a number on a line whose scale can change.' },
  { id: 'rounding-tool', title: 'Rounding Tool', regionId: 'rounding-ridge', mode: 'rounding', artefactTypeId: 'rounding-explanation', invitation: 'Compare both distances before choosing the nearest multiple.' },
  { id: 'estimate-calculation', title: 'Estimate a Calculation', regionId: 'rounding-ridge', mode: 'estimate', artefactTypeId: 'estimate-comparison', invitation: 'Estimate, calculate exactly, then decide whether the answer is reasonable.' },
  { id: 'negative-number-line', title: 'Negative Number Line', regionId: 'beyond-zero-station', mode: 'negative', artefactTypeId: 'negative-number-route', invitation: 'Travel through zero and measure the interval.' },
  { id: 'roman-builder', title: 'Roman Numeral Builder', regionId: 'beyond-zero-station', mode: 'roman', artefactTypeId: 'roman-numeral', invitation: 'Build, convert and repair Roman numerals to 100.' },
  { id: 'addition-model', title: 'Addition Model', regionId: 'addition-workshop', mode: 'addition', artefactTypeId: 'addition-model', invitation: 'Estimate, combine, exchange and check with the inverse.' },
  { id: 'subtraction-model', title: 'Subtraction Model', regionId: 'subtraction-workshop', mode: 'subtraction', artefactTypeId: 'subtraction-model', invitation: 'See each exchange, including across zero.' },
  { id: 'strategy-comparator', title: 'Strategy Comparator', regionId: 'subtraction-workshop', mode: 'strategy', artefactTypeId: 'strategy-comparison', invitation: 'Compare mental and written routes before choosing.' },
  { id: 'inverse-builder', title: 'Inverse Builder', regionId: 'reasoning-observatory', mode: 'inverse', artefactTypeId: 'inverse-family', invitation: 'Connect a calculation family and uncover a missing value.' },
  { id: 'problem-modeller', title: 'Problem Modeller', regionId: 'reasoning-observatory', mode: 'problem', artefactTypeId: 'problem-model', invitation: 'Name what is known, what is unknown and the operation plan.' },
  { id: 'statement-tester', title: 'Statement Tester', regionId: 'reasoning-observatory', mode: 'statement', artefactTypeId: 'proof', invitation: 'Test always, sometimes and never with examples and counterexamples.' },
  { id: 'create-challenge', title: 'Create a Challenge', regionId: 'reasoning-observatory', mode: 'challenge', artefactTypeId: 'child-created-challenge', invitation: 'Choose the structure, values and hidden information for someone else.' },
]);

const OBJECTIVES = [
  ['build-four-digit-number', 'Build a Four-Digit Number', 'Represent and identify four-digit numbers using concrete manipulatives.', 'number-base-camp', 'build-number', 'four-digit-model', '4827'],
  ['ten-hundreds-thousand', 'Ten Hundreds Make a Thousand', 'Understand that 1,000 is ten times the size of 100.', 'number-base-camp', 'build-number', 'four-digit-model', '6158'],
  ['break-number-apart', 'Break the Number Apart', 'Partition four-digit numbers into thousands, hundreds, tens and ones.', 'number-base-camp', 'partition-number', 'partition-card', '9074'],
  ['partition-another-way', 'Partition It Another Way', 'Partition four-digit numbers in non-standard ways.', 'number-base-camp', 'partition-number', 'partition-card', '2538'],
  ['step-more-less', 'Step by 10, 100 or 1,000', 'Find 10, 100 or 1,000 more or less.', 'magnitude-trail', 'more-less-stepper', 'comparison-explanation', '6941'],
  ['which-number-greater', 'Which Number Is Greater?', 'Compare and order numbers to 10,000 using <, > and =.', 'magnitude-trail', 'compare-numbers', 'comparison-explanation', '8307'],
  ['place-on-line', 'Place It on the Line', 'Position four-digit numbers on blank number lines.', 'magnitude-trail', 'open-number-line', 'number-line-estimate', '4176'],
  ['estimate-position', 'Estimate the Position', 'Estimate positions on number lines with changing scales.', 'magnitude-trail', 'open-number-line', 'number-line-estimate', '9624'],
  ['nearest-ten', 'Nearest Ten', 'Round to the nearest 10.', 'rounding-ridge', 'rounding-tool', 'rounding-explanation', '3758'],
  ['nearest-hundred', 'Nearest Hundred', 'Round to the nearest 100.', 'rounding-ridge', 'rounding-tool', 'rounding-explanation', '5269'],
  ['nearest-thousand', 'Nearest Thousand', 'Round to the nearest 1,000.', 'rounding-ridge', 'rounding-tool', 'rounding-explanation', '1836'],
  ['estimate-before-calculate', 'Estimate Before You Calculate', 'Use rounding to estimate answers.', 'rounding-ridge', 'estimate-calculation', 'estimate-comparison', '7492'],
  ['travel-through-zero', 'Travel Through Zero', 'Count backwards through zero.', 'beyond-zero-station', 'negative-number-line', 'negative-number-route', '3057'],
  ['temperature-difference', 'Find the Temperature Difference', 'Find intervals and differences involving negative numbers.', 'beyond-zero-station', 'negative-number-line', 'negative-number-route', '6814'],
  ['roman-to-fifty', 'Roman Numerals to Fifty', 'Read and write Roman numerals to 50.', 'beyond-zero-station', 'roman-builder', 'roman-numeral', '9347'],
  ['roman-to-hundred', 'Roman Numerals to One Hundred', 'Read and write Roman numerals to 100.', 'beyond-zero-station', 'roman-builder', 'roman-numeral', '2685'],
  ['addition-no-exchange', 'Addition Without Exchange', 'Add two four-digit numbers without exchange.', 'addition-workshop', 'addition-model', 'addition-model', '5731'],
  ['addition-one-exchange', 'One Addition Exchange', 'Add with one exchange.', 'addition-workshop', 'addition-model', 'addition-model', '8406'],
  ['addition-several-exchanges', 'Several Exchanges', 'Add with multiple exchanges.', 'addition-workshop', 'addition-model', 'addition-model', '1974'],
  ['five-digit-total', 'Build a Five-Digit Total', 'Create five-digit totals from four-digit addends.', 'addition-workshop', 'addition-model', 'addition-model', '6253'],
  ['subtraction-no-exchange', 'Subtraction Without Exchange', 'Subtract without exchange.', 'subtraction-workshop', 'subtraction-model', 'subtraction-model', '4387'],
  ['subtraction-one-exchange', 'One Subtraction Exchange', 'Subtract with one exchange.', 'subtraction-workshop', 'subtraction-model', 'subtraction-model', '7605'],
  ['exchange-across-zero', 'Exchange Across Zero', 'Subtract with exchange across zero.', 'subtraction-workshop', 'subtraction-model', 'subtraction-model', '2196'],
  ['choose-efficient-method', 'Choose an Efficient Method', 'Choose efficient mental or written subtraction strategies.', 'subtraction-workshop', 'strategy-comparator', 'strategy-comparison', '5847'],
  ['use-inverse', 'Use the Inverse', 'Use inverse operations and solve missing-number equations.', 'reasoning-observatory', 'inverse-builder', 'inverse-family', '9062'],
  ['solve-one-step', 'Solve a One-Step Problem', 'Solve one-step addition and subtraction problems.', 'reasoning-observatory', 'problem-modeller', 'problem-model', '3527'],
  ['plan-two-step', 'Plan a Two-Step Solution', 'Solve two-step problems and identify the operations.', 'reasoning-observatory', 'problem-modeller', 'problem-model', '6489'],
  ['prove-disprove', 'Prove It or Disprove It', 'Prove and disprove mathematical statements.', 'reasoning-observatory', 'statement-tester', 'proof', '1753'],
];

const MISCONCEPTIONS = Object.freeze({
  'number-base-camp': ['A digit has the same value in every position.', 'An exchange changes the total value.', 'A zero placeholder can be omitted.'],
  'magnitude-trail': ['Only one digit changes when stepping across a boundary.', 'The comparison symbol points to the answer.', 'Equal-looking ticks always have the same numerical interval.'],
  'rounding-ridge': ['Rounding always makes a number larger.', 'The same digit decides every kind of rounding.', 'An exact multiple needs to move.'],
  'beyond-zero-station': ['Zero is the smallest number.', 'A decrease is always a negative value.', 'Roman numerals can be arranged in any order.'],
  'addition-workshop': ['Exchange adds extra value.', 'Exchanged values belong above any column.', 'A five-digit total cannot come from four-digit addends.'],
  'subtraction-workshop': ['Exchange removes value.', 'A written column method is always most efficient.', 'A zero has nothing available to exchange.'],
  'reasoning-observatory': ['One example proves an always statement.', 'A keyword chooses the operation.', 'Checking an arithmetic answer proves the model matched the context.'],
});

const VOCABULARY = Object.freeze({
  'number-base-camp': ['thousand', 'hundred', 'ten', 'one', 'digit', 'value', 'place', 'partition', 'exchange', 'equivalent'],
  'magnitude-trail': ['greater than', 'less than', 'equal to', 'interval', 'scale', 'estimate', 'magnitude'],
  'rounding-ridge': ['nearest', 'multiple', 'midpoint', 'distance', 'round', 'estimate', 'reasonable'],
  'beyond-zero-station': ['negative', 'zero', 'interval', 'difference', 'Roman numeral'],
  'addition-workshop': ['addend', 'sum', 'total', 'exchange', 'estimate', 'inverse'],
  'subtraction-workshop': ['minuend', 'subtrahend', 'difference', 'exchange', 'efficient', 'strategy'],
  'reasoning-observatory': ['inverse', 'unknown', 'operation', 'example', 'counterexample', 'always', 'sometimes', 'never', 'proof'],
});

export const NUMBER_EXPEDITION_ACTIVITIES = Object.freeze(OBJECTIVES.map((item, index) => {
  const [id, title, objective, regionId, toolId, artefactTypeId, code] = item;
  const tool = NUMBER_TOOLS.find((entry) => entry.id === toolId);
  const isProof = id === 'prove-disprove';
  return Object.freeze({
    id,
    order: index + 1,
    title,
    shortInvitation: tool.invitation,
    invitation: tool.invitation,
    route: `#/activity/${id}`,
    destinationId: 'number-expedition',
    regionId,
    toolId,
    mode: tool.mode,
    active: true,
    interactionModel: 'continuous-mathematical-workbench',
    rhythm: ['Notice', 'Explore', 'Make', 'Explain'],
    curriculumObjective: objective,
    curriculumRefs: [`math-autumn-1-${String(index + 1).padStart(2, '0')}`],
    curriculumTags: ['mathematics', 'year-4', 'autumn-1', regionId, tool.mode],
    conceptTags: ['number-expedition', regionId, tool.mode],
    vocabulary: VOCABULARY[regionId],
    likelyMisconceptions: MISCONCEPTIONS[regionId],
    flow: {
      notice: { prompt: objective, encounter: [tool.mode] },
      explore: { prompt: tool.invitation, actions: ['change-values', 'inspect-linked-representations', 'undo', 'try-another'] },
      make: { product: `Create and save a ${artefactTypeId.replaceAll('-', ' ')}.` },
      explain: { prompt: isProof ? 'Name the evidence, counterexample or general reason.' : 'Explain the mathematical structure you used.' },
    },
    keyCheck: {
      unscored: true,
      prompt: isProof ? 'Does your evidence prove the whole statement or test only one case?' : 'Change one value and explain what must change with it.',
    },
    outcome: { artefactTypeId, titleTemplate: title, printable: true },
    supportedResponseModes: ['touch', 'keyboard', 'visual', 'voice', 'short-text'],
    scaffoldBehaviour: {
      light: 'Fewer labels and open values.',
      core: 'Linked model, language and symbols.',
      strong: 'Place labels, highlighted structure and a sentence stem.',
      intensive: 'One step at a time with partially built models; the objective is unchanged.',
    },
    printMetadata: { format: 'A4', blackAndWhite: true, preserveAlignment: true },
    keyCode: code,
  });
}));

export const NUMBER_COLLECTIONS = Object.freeze([
  ['four-digit-foundations', 'Four-Digit Foundations', 1, 4, '1847'],
  ['compare-position', 'Compare and Position', 5, 8, '6208'],
  ['rounding-estimation', 'Rounding and Estimation', 9, 12, '9531'],
  ['beyond-familiar-numbers', 'Beyond Familiar Numbers', 13, 16, '4715'],
  ['formal-addition', 'Formal Addition', 17, 20, '8063'],
  ['formal-subtraction', 'Formal Subtraction', 21, 24, '2395'],
  ['additive-reasoning', 'Additive Reasoning', 25, 28, '7159'],
].map(([id, title, from, to, code]) => Object.freeze({
  id: `number-collection-${id}`,
  title,
  code,
  activityIds: NUMBER_EXPEDITION_ACTIVITIES.slice(from - 1, to).map((activity) => activity.id),
  description: `Open the four connected pathways from ${NUMBER_EXPEDITION_ACTIVITIES[from - 1].title} to ${NUMBER_EXPEDITION_ACTIVITIES[to - 1].title}.`,
})));

export const NUMBER_DESTINATION_KEY = Object.freeze({
  id: 'key-destination-number-expedition',
  code: '3648',
  title: 'Every Number Expedition Pathway',
  description: 'Add every current and future Number Expedition Key Activity to My Keys.',
});

export const NUMBER_CURRICULUM_RECORDS = Object.freeze(NUMBER_EXPEDITION_ACTIVITIES.map((activity) => ({
  id: activity.curriculumRefs[0],
  subject: 'mathematics',
  destinationIds: ['number-expedition'],
  activeInBuild1: false,
  activeInBuild2: true,
  activationBuild: 2,
  objectives: [activity.curriculumObjective],
  concepts: activity.conceptTags,
  vocabulary: activity.vocabulary,
  likelyMisconceptions: activity.likelyMisconceptions,
  relatedConcepts: ['place-value', 'magnitude', 'equivalence', activity.mode],
  untaughtFriendlyEntry: activity.shortInvitation,
  supportedResponseModes: activity.supportedResponseModes,
  accessibilitySupports: ['spoken-number', 'tap-to-place', 'drag-alternative', 'stable-columns', 'reduced-motion'],
  possibleKeyCheck: activity.keyCheck.prompt,
  savedArtefactTypeIds: [activity.outcome.artefactTypeId],
  crossCurricularConnections: ['geographical-data', 'measurement', 'environmental-evidence'],
})));

export function getNumberTool(id) {
  return NUMBER_TOOLS.find((tool) => tool.id === id) || null;
}

export function getNumberActivity(id) {
  return NUMBER_EXPEDITION_ACTIVITIES.find((activity) => activity.id === id) || null;
}

export function validateNumberExpeditionManifest() {
  const errors = [];
  if (NUMBER_EXPEDITION_ACTIVITIES.length !== 28) errors.push('Number Expedition must contain exactly 28 activities.');
  if (NUMBER_REGIONS.length !== 7) errors.push('Number Expedition must contain exactly seven regions.');
  if (NUMBER_COLLECTIONS.length !== 7) errors.push('Number Expedition must contain exactly seven collections.');
  const ids = new Set();
  const codes = new Set();
  for (const activity of NUMBER_EXPEDITION_ACTIVITIES) {
    if (ids.has(activity.id)) errors.push(`Duplicate Number Expedition activity ID: ${activity.id}.`);
    ids.add(activity.id);
    if (!/^\d{4}$/.test(activity.keyCode)) errors.push(`Activity ${activity.id} needs a four-digit key.`);
    if (codes.has(activity.keyCode)) errors.push(`Duplicate Number Expedition key: ${activity.keyCode}.`);
    codes.add(activity.keyCode);
    if (!getNumberTool(activity.toolId)) errors.push(`Activity ${activity.id} refers to missing tool ${activity.toolId}.`);
  }
  for (const collection of NUMBER_COLLECTIONS) {
    if (codes.has(collection.code)) errors.push(`Duplicate Number Expedition key: ${collection.code}.`);
    codes.add(collection.code);
    for (const id of collection.activityIds) if (!ids.has(id)) errors.push(`Collection ${collection.id} refers to missing activity ${id}.`);
  }
  if (codes.has(NUMBER_DESTINATION_KEY.code)) errors.push(`Duplicate Number Expedition key: ${NUMBER_DESTINATION_KEY.code}.`);
  return { valid: errors.length === 0, errors };
}

export default NUMBER_EXPEDITION_ACTIVITIES;
