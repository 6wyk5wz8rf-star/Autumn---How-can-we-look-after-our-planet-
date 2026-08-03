import { comparePlaceValue, createLinkedRepresentations } from './placeValue.js';
import { validatePartition } from './partitions.js';
import { getRoundingBounds } from './rounding.js';
import { arabicToRoman, parseRomanNumeral } from './romanNumerals.js';
import { createRandomState, randomChoice, randomInteger, seedToUint32 } from './random.js';
import { traceAddition, traceSubtraction } from './operations.js';
import { createNumberLine, validateNumberLine } from './numberLine.js';
import { createInverseFamily } from './inverse.js';
import { TRUTH_FIXTURES, validateTruthFixture } from './truthFixtures.js';

export const NUMBER_TASK_KINDS = Object.freeze([
  'place-value',
  'partition',
  'step',
  'comparison',
  'ordering',
  'number-line',
  'rounding',
  'estimate',
  'negative-number',
  'roman-numeral',
  'addition',
  'subtraction',
  'inverse',
  'problem',
  'truth-statement',
]);

const MODE_ALIASES = Object.freeze({
  'build-a-four-digit-number': { kind: 'place-value' },
  'build-four-digit-number': { kind: 'place-value' },
  'ten-hundreds-make-a-thousand': { kind: 'partition', standard: false },
  'ten-hundreds-thousand': { kind: 'partition', standard: false },
  'break-the-number-apart': { kind: 'partition', standard: true },
  'break-number-apart': { kind: 'partition', standard: true },
  'partition-it-another-way': { kind: 'partition', standard: false },
  'partition-another-way': { kind: 'partition', standard: false },
  'step-by-10-100-or-1000': { kind: 'step' },
  'step-more-less': { kind: 'step' },
  stepper: { kind: 'step' },
  'which-number-is-greater': { kind: 'comparison' },
  'which-number-greater': { kind: 'comparison' },
  compare: { kind: 'comparison' },
  order: { kind: 'ordering' },
  'place-it-on-the-line': { kind: 'number-line', estimate: false },
  'place-on-line': { kind: 'number-line', estimate: false },
  'estimate-the-position': { kind: 'number-line', estimate: true },
  'estimate-position': { kind: 'number-line', estimate: true },
  'nearest-ten': { kind: 'rounding', unit: 10 },
  'nearest-hundred': { kind: 'rounding', unit: 100 },
  'nearest-thousand': { kind: 'rounding', unit: 1000 },
  'estimate-before-you-calculate': { kind: 'estimate' },
  'estimate-before-calculate': { kind: 'estimate' },
  'travel-through-zero': { kind: 'negative-number', context: 'movement' },
  'find-the-temperature-difference': { kind: 'negative-number', context: 'temperature' },
  'temperature-difference': { kind: 'negative-number', context: 'temperature' },
  negative: { kind: 'negative-number', context: 'movement' },
  'roman-numerals-to-fifty': { kind: 'roman-numeral', maximum: 50 },
  'roman-numerals-to-one-hundred': { kind: 'roman-numeral', maximum: 100 },
  'roman-to-fifty': { kind: 'roman-numeral', maximum: 50 },
  'roman-to-hundred': { kind: 'roman-numeral', maximum: 100 },
  roman: { kind: 'roman-numeral', maximum: 100 },
  'addition-without-exchange': { kind: 'addition', pattern: 'no-exchange' },
  'addition-no-exchange': { kind: 'addition', pattern: 'no-exchange' },
  'one-addition-exchange': { kind: 'addition', pattern: 'one-exchange' },
  'addition-one-exchange': { kind: 'addition', pattern: 'one-exchange' },
  'several-exchanges': { kind: 'addition', pattern: 'multiple-exchanges' },
  'addition-several-exchanges': { kind: 'addition', pattern: 'multiple-exchanges' },
  'build-a-five-digit-total': { kind: 'addition', pattern: 'five-digit-total' },
  'five-digit-total': { kind: 'addition', pattern: 'five-digit-total' },
  'subtraction-without-exchange': { kind: 'subtraction', pattern: 'no-exchange' },
  'subtraction-no-exchange': { kind: 'subtraction', pattern: 'no-exchange' },
  'one-subtraction-exchange': { kind: 'subtraction', pattern: 'one-exchange' },
  'subtraction-one-exchange': { kind: 'subtraction', pattern: 'one-exchange' },
  'exchange-across-zero': { kind: 'subtraction', pattern: 'exchange-across-zero' },
  'choose-an-efficient-method': { kind: 'subtraction', strategyChoice: true },
  'choose-efficient-method': { kind: 'subtraction', strategyChoice: true },
  strategy: { kind: 'subtraction', strategyChoice: true },
  'use-the-inverse': { kind: 'inverse' },
  'use-inverse': { kind: 'inverse' },
  'solve-a-one-step-problem': { kind: 'problem', steps: 1 },
  'solve-one-step': { kind: 'problem', steps: 1 },
  'plan-a-two-step-solution': { kind: 'problem', steps: 2 },
  'plan-two-step': { kind: 'problem', steps: 2 },
  'prove-it-or-disprove-it': { kind: 'truth-statement' },
  'prove-disprove': { kind: 'truth-statement' },
  statement: { kind: 'truth-statement' },
  challenge: { kind: 'problem', steps: 1 },
});

function serialisableSeed(seed) {
  return typeof seed === 'bigint' ? seed.toString() : String(seed);
}

function taskId(kind, seed) {
  return `number-task-${kind}-${seedToUint32(seed).toString(16).padStart(8, '0')}`;
}

function taskRecord(kind, seed, record) {
  return Object.freeze({
    id: taskId(kind, seed),
    kind,
    seed: serialisableSeed(seed),
    generatorVersion: 1,
    curriculumTags: Object.freeze(record.curriculumTags ?? [kind]),
    ...record,
  });
}

function takeInteger(context, minimum, maximum) {
  const draw = randomInteger(context.randomState, minimum, maximum);
  return { value: draw.value, context: { ...context, randomState: draw.randomState } };
}

function takeChoice(context, choices) {
  const draw = randomChoice(context.randomState, choices);
  return { value: draw.value, context: { ...context, randomState: draw.randomState } };
}

function placeValueTask(seed, context, options) {
  const valueDraw = takeInteger(context, options.minimum ?? 1000, options.maximum ?? 9999);
  const value = valueDraw.value;
  return taskRecord('place-value', seed, {
    prompt: 'Build this quantity, then connect the model to its numeral and expanded form.',
    values: Object.freeze({ value }),
    solution: createLinkedRepresentations(value),
    explanation: 'Every linked view is derived from the same place-value quantity.',
    curriculumTags: ['place-value', 'four-digit-number', 'representation'],
  });
}

function partitionTask(seed, context, options) {
  let current = context;
  const valueDraw = takeInteger(current, options.minimum ?? 1000, options.maximum ?? 9999);
  current = valueDraw.context;
  const value = valueDraw.value;
  const digits = createLinkedRepresentations(value).digits;
  const counts = { ...digits };
  if (options.standard !== true) {
    const exchangeable = [
      ['thousands', 'hundreds'],
      ['hundreds', 'tens'],
      ['tens', 'ones'],
    ].filter(([place]) => counts[place] > 0);
    const exchangeDraw = takeChoice(current, exchangeable);
    const [from, to] = exchangeDraw.value;
    counts[from] -= 1;
    counts[to] += 10;
  }
  const validation = validatePartition(value, counts);
  if (!validation.equivalent) throw new Error('Generated partition failed equivalence validation.');
  return taskRecord('partition', seed, {
    prompt: options.standard === true ? 'Break the number into its place-value parts.' : 'Partition the number in a different but equivalent way.',
    values: Object.freeze({ value, partition: Object.freeze(counts) }),
    solution: validation,
    explanation: validation.feedback,
    curriculumTags: ['place-value', 'partition', validation.kind],
  });
}

function stepTask(seed, context) {
  let current = context;
  const valueDraw = takeInteger(current, 1000, 8999);
  current = valueDraw.context;
  const magnitudeDraw = takeChoice(current, [10, 100, 1000]);
  current = magnitudeDraw.context;
  const directionDraw = takeChoice(current, [-1, 1]);
  const start = valueDraw.value;
  const change = magnitudeDraw.value * directionDraw.value;
  return taskRecord('step', seed, {
    prompt: `Find ${Math.abs(change).toLocaleString('en-GB')} ${change > 0 ? 'more' : 'less'} and explain which digits change.`,
    values: Object.freeze({ start, change }),
    solution: Object.freeze({ result: start + change, before: createLinkedRepresentations(start), after: createLinkedRepresentations(start + change) }),
    explanation: 'Compare the same place-value columns before and after the step.',
    curriculumTags: ['place-value', 'more-or-less'],
  });
}

function comparisonTask(seed, context) {
  let current = context;
  const leftDraw = takeInteger(current, 1000, 9999);
  current = leftDraw.context;
  const rightDraw = takeInteger(current, 1000, 9999);
  const comparison = comparePlaceValue(leftDraw.value, rightDraw.value);
  return taskRecord('comparison', seed, {
    prompt: 'Compare the numbers. Which place-value column decides?',
    values: Object.freeze({ left: leftDraw.value, right: rightDraw.value }),
    solution: comparison,
    explanation: comparison.decidingPlace ? `The first different column is ${comparison.decidingPlace}.` : 'Every corresponding digit has the same value.',
    curriculumTags: ['comparison', 'place-value'],
  });
}

function orderingTask(seed, context) {
  let current = context;
  const values = [];
  while (values.length < 4) {
    const draw = takeInteger(current, 1000, 9999);
    current = draw.context;
    if (!values.includes(draw.value)) values.push(draw.value);
  }
  const sorted = [...values].sort((left, right) => left - right);
  return taskRecord('ordering', seed, {
    prompt: 'Order the four values from least to greatest and explain the first place that decides each comparison.',
    values: Object.freeze({ numbers: Object.freeze(values) }),
    solution: Object.freeze({ ascending: Object.freeze(sorted), descending: Object.freeze([...sorted].reverse()) }),
    explanation: 'Compare thousands first, moving right only while the earlier place-value digits match.',
    curriculumTags: ['ordering', 'comparison', 'place-value'],
  });
}

function numberLineTask(seed, context, options) {
  let current = context;
  const spanDraw = takeChoice(current, [100, 500, 1000, 2000]);
  current = spanDraw.context;
  const span = spanDraw.value;
  const startStep = span >= 1000 ? 100 : 10;
  const startDraw = takeInteger(current, 0, Math.floor((9999 - span) / startStep));
  current = startDraw.context;
  const start = startDraw.value * startStep;
  const interval = span / 10;
  const line = createNumberLine({ start, end: start + span, interval });
  const targetIndex = takeInteger(current, 1, 9).value;
  const target = start + targetIndex * interval;
  const hiddenTicks = line.ticks.map((tick, index) => Object.freeze({
    ...tick,
    labelled: options.estimate ? index === 0 || index === line.ticks.length - 1 : index % 5 === 0,
  }));
  return taskRecord('number-line', seed, {
    prompt: options.estimate ? 'Estimate where the value belongs on the line.' : 'Place the value at its true position on the line.',
    values: Object.freeze({ start, end: start + span, target }),
    display: Object.freeze({ ...line, ticks: Object.freeze(hiddenTicks) }),
    solution: Object.freeze({ target, ratio: (target - start) / span }),
    explanation: 'The position is determined by the value’s fraction of the complete interval.',
    curriculumTags: ['number-line', options.estimate ? 'estimation' : 'position'],
  });
}

function roundingTask(seed, context, options) {
  let current = context;
  const unitDraw = options.unit
    ? { value: options.unit, context: current }
    : takeChoice(current, [10, 100, 1000]);
  current = unitDraw.context;
  const unit = unitDraw.value;
  const caseDraw = options.case
    ? { value: options.case, context: current }
    : takeChoice(current, ['below-midpoint', 'midpoint', 'above-midpoint', 'ordinary']);
  current = caseDraw.context;
  // The upper bracketing multiple may be 10,000 while the original value stays
  // inside the Year 4 range (for example, 9,999 to the nearest 1,000).
  const maximumBaseIndex = Math.floor(9999 / unit);
  const baseDraw = takeInteger(current, 0, maximumBaseIndex);
  const lower = baseDraw.value * unit;
  let value;
  if (caseDraw.value === 'exact') value = lower;
  else if (['below-midpoint', 'just-below'].includes(caseDraw.value)) value = lower + unit / 2 - 1;
  else if (caseDraw.value === 'midpoint') value = lower + unit / 2;
  else if (['above-midpoint', 'just-above'].includes(caseDraw.value)) value = lower + unit / 2 + 1;
  else value = lower + takeInteger(baseDraw.context, 0, unit - 1).value;
  const bounds = getRoundingBounds(value, unit);
  return taskRecord('rounding', seed, {
    prompt: `Round ${value.toLocaleString('en-GB')} to the nearest ${unit.toLocaleString('en-GB')}.`,
    values: Object.freeze({ value, unit, case: caseDraw.value }),
    solution: bounds,
    explanation: `The midpoint is ${bounds.midpoint.toLocaleString('en-GB')}; compare both distances.`,
    curriculumTags: ['rounding', `nearest-${unit}`],
  });
}

function estimateTask(seed, context) {
  let current = context;
  const leftDraw = takeInteger(current, 1000, 6999);
  current = leftDraw.context;
  const rightDraw = takeInteger(current, 1000, 2999);
  const left = leftDraw.value;
  const right = rightDraw.value;
  const roundedLeft = getRoundingBounds(left, 1000).rounded;
  const roundedRight = getRoundingBounds(right, 1000).rounded;
  return taskRecord('estimate', seed, {
    prompt: 'Estimate the total before calculating exactly. Then compare the two answers.',
    values: Object.freeze({ left, right, operation: '+' }),
    solution: Object.freeze({ estimate: roundedLeft + roundedRight, exact: left + right, roundedOperands: Object.freeze([roundedLeft, roundedRight]) }),
    explanation: 'Rounding both addends to 1,000 gives a quick magnitude check.',
    curriculumTags: ['estimation', 'addition', 'reasonableness'],
  });
}

function negativeNumberTask(seed, context, options) {
  let current = context;
  const startDraw = takeInteger(current, -12, 8);
  current = startDraw.context;
  const endDraw = takeInteger(current, -8, 12);
  const start = startDraw.value;
  const end = endDraw.value === start ? Math.min(12, endDraw.value + 1) : endDraw.value;
  return taskRecord('negative-number', seed, {
    prompt: options.context === 'temperature' ? 'Find the difference between the two temperatures.' : 'Travel from the start value to the end value, crossing zero when needed.',
    values: Object.freeze({ start, end, context: options.context ?? 'movement' }),
    solution: Object.freeze({ change: end - start, difference: Math.abs(end - start), crossesZero: (start < 0 && end >= 0) || (end < 0 && start >= 0) }),
    explanation: 'A value below zero and a movement downwards are related ideas, but they are not the same thing.',
    curriculumTags: ['negative-number', 'difference', options.context ?? 'movement'],
  });
}

function romanTask(seed, context, options) {
  const maximum = Math.min(100, Math.max(1, options.maximum ?? 100));
  const valueDraw = takeInteger(context, 1, maximum);
  const directionDraw = takeChoice(valueDraw.context, ['arabic-to-roman', 'roman-to-arabic']);
  const value = valueDraw.value;
  const roman = arabicToRoman(value);
  return taskRecord('roman-numeral', seed, {
    prompt: directionDraw.value === 'arabic-to-roman' ? `Build ${value} in Roman numerals.` : `What value does ${roman} represent?`,
    values: Object.freeze({ value, roman, direction: directionDraw.value }),
    solution: Object.freeze({ value, roman }),
    explanation: 'The numeral uses the canonical I, V, X, L and C structure.',
    curriculumTags: ['roman-numeral', maximum <= 50 ? 'to-50' : 'to-100'],
  });
}

function matchesAdditionPattern(trace, pattern) {
  return !pattern || trace.category === pattern;
}

function additionTask(seed, context, options) {
  let current = context;
  let trace = null;
  for (let attempt = 0; attempt < 30000; attempt += 1) {
    const leftDraw = takeInteger(current, 1000, 9999);
    current = leftDraw.context;
    const rightDraw = takeInteger(current, 1000, 9999);
    current = rightDraw.context;
    const candidate = traceAddition(leftDraw.value, rightDraw.value);
    if (matchesAdditionPattern(candidate, options.pattern)) {
      trace = candidate;
      break;
    }
  }
  if (!trace) throw new Error(`Could not generate an addition task for pattern “${options.pattern}”.`);
  return taskRecord('addition', seed, {
    prompt: 'Estimate, combine the quantities, exchange where needed, then check with the inverse.',
    values: Object.freeze({ left: trace.left, right: trace.right }),
    solution: trace,
    explanation: `${trace.exchangeCount} place-value exchange${trace.exchangeCount === 1 ? '' : 's'} occur in this calculation.`,
    curriculumTags: ['addition', 'exchange', trace.category],
  });
}

function matchesSubtractionPattern(trace, pattern) {
  return !pattern || trace.category === pattern;
}

const EFFICIENT_SUBTRACTIONS = Object.freeze([
  Object.freeze([5002, 4998, 'count-on']),
  Object.freeze([7600, 2000, 'mental-place-value']),
  Object.freeze([4350, 99, 'subtract-100-adjust']),
  Object.freeze([6004, 3999, 'subtract-4000-adjust']),
  Object.freeze([8500, 250, 'mental-partition']),
]);

function subtractionTask(seed, context, options) {
  if (options.strategyChoice) {
    const chosen = takeChoice(context, EFFICIENT_SUBTRACTIONS).value;
    const trace = traceSubtraction(chosen[0], chosen[1]);
    return taskRecord('subtraction', seed, {
      prompt: 'Choose an efficient method and explain why it suits these numbers.',
      values: Object.freeze({ minuend: chosen[0], subtrahend: chosen[1] }),
      solution: Object.freeze({ ...trace, efficientStrategy: chosen[2] }),
      explanation: 'Efficiency depends on the structure of the numbers, not the length of the written method.',
      curriculumTags: ['subtraction', 'efficient-strategy'],
    });
  }

  let current = context;
  let trace = null;
  for (let attempt = 0; attempt < 50000; attempt += 1) {
    const minuendDraw = takeInteger(current, 1000, 9999);
    current = minuendDraw.context;
    const subtrahendDraw = takeInteger(current, 1000, minuendDraw.value);
    current = subtrahendDraw.context;
    const candidate = traceSubtraction(minuendDraw.value, subtrahendDraw.value);
    if (matchesSubtractionPattern(candidate, options.pattern)) {
      trace = candidate;
      break;
    }
  }
  if (!trace) throw new Error(`Could not generate a subtraction task for pattern “${options.pattern}”.`);
  return taskRecord('subtraction', seed, {
    prompt: 'Model the subtraction, exchange where needed, then check the difference.',
    values: Object.freeze({ minuend: trace.minuend, subtrahend: trace.subtrahend }),
    solution: trace,
    explanation: trace.crossesZero
      ? 'The exchange travels through an empty place-value column.'
      : trace.exchangeCount
        ? `${trace.exchangeCount} place-value exchange${trace.exchangeCount === 1 ? '' : 's'} occur${trace.exchangeCount === 1 ? 's' : ''} before the digits can be subtracted.`
        : 'Every minuend digit already contains enough in its column, so no exchange is needed.',
    curriculumTags: ['subtraction', 'exchange', trace.category],
  });
}

function inverseTask(seed, context) {
  let current = context;
  const firstDraw = takeInteger(current, 1000, 5999);
  current = firstDraw.context;
  const secondDraw = takeInteger(current, 1000, 3999);
  const family = createInverseFamily(firstDraw.value, secondDraw.value);
  return taskRecord('inverse', seed, {
    prompt: 'Build the connected addition and subtraction equations.',
    values: Object.freeze({ firstAddend: firstDraw.value, secondAddend: secondDraw.value }),
    solution: family,
    explanation: 'The total becomes the minuend in each inverse subtraction.',
    curriculumTags: ['inverse', 'missing-number', 'equation-family'],
  });
}

function problemTask(seed, context, options) {
  let current = context;
  const startDraw = takeInteger(current, 1200, 6000);
  current = startDraw.context;
  const changeOneDraw = takeInteger(current, 200, 1900);
  current = changeOneDraw.context;
  const steps = options.steps === 2 ? 2 : 1;
  const changeTwoDraw = takeInteger(current, 100, 900);
  const result = steps === 1
    ? startDraw.value + changeOneDraw.value
    : startDraw.value + changeOneDraw.value - changeTwoDraw.value;
  return taskRecord('problem', seed, {
    prompt: steps === 1 ? 'Identify what is known, choose the operation and model the unknown.' : 'Identify the unknown and plan the two operations before calculating.',
    values: Object.freeze({ start: startDraw.value, changeOne: changeOneDraw.value, changeTwo: steps === 2 ? changeTwoDraw.value : null, steps }),
    solution: Object.freeze({ operations: Object.freeze(steps === 1 ? ['+'] : ['+', '−']), result }),
    explanation: 'The operation plan follows the relationships between known and unknown quantities, not isolated keywords.',
    curriculumTags: ['problem-solving', steps === 1 ? 'one-step' : 'two-step'],
  });
}

function truthTask(seed, context) {
  const fixture = takeChoice(context, TRUTH_FIXTURES).value;
  return taskRecord('truth-statement', seed, {
    prompt: `Is this always, sometimes or never true? ${fixture.statement}`,
    values: Object.freeze({ fixtureId: fixture.id, statement: fixture.statement }),
    solution: Object.freeze({
      classification: fixture.classification,
      supportingExample: fixture.supportingExample,
      counterexample: fixture.counterexample,
    }),
    explanation: fixture.explanation,
    curriculumTags: ['proof', 'counterexample', fixture.classification],
  });
}

const GENERATORS = Object.freeze({
  'place-value': placeValueTask,
  partition: partitionTask,
  step: stepTask,
  comparison: comparisonTask,
  ordering: orderingTask,
  'number-line': numberLineTask,
  rounding: roundingTask,
  estimate: estimateTask,
  'negative-number': negativeNumberTask,
  'roman-numeral': romanTask,
  addition: additionTask,
  subtraction: subtractionTask,
  inverse: inverseTask,
  problem: problemTask,
  'truth-statement': truthTask,
});

function resolveMode(modeOrActivity, options) {
  const normalised = String(modeOrActivity ?? '')
    .trim()
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-');
  const alias = MODE_ALIASES[normalised];
  const kind = alias?.kind ?? normalised;
  if (!GENERATORS[kind]) {
    throw new TypeError(`Unknown Number Expedition task mode: ${modeOrActivity}.`);
  }
  return { kind, options: { ...alias, ...options } };
}

/** Deterministic entry point used by activities, Board View and batch tests. */
export function generateNumberTask(modeOrActivity, seed, options = {}) {
  const resolved = resolveMode(modeOrActivity, options);
  const context = { randomState: createRandomState(seed) };
  const generated = GENERATORS[resolved.kind](seed, context, resolved.options);
  const identitySeed = `${serialisableSeed(seed)}|${resolved.kind}|${JSON.stringify(generated.values)}`;
  const task = Object.freeze({
    ...generated,
    id: taskId(resolved.kind, identitySeed),
    mode: String(modeOrActivity),
  });
  const validation = validateGeneratedNumberTask(task);
  if (!validation.valid) {
    throw new Error(`Generated ${resolved.kind} task failed validation: ${validation.errors.join(' ')}`);
  }
  return task;
}

export function generateNumberTaskBatch(modeOrActivity, seed, count, options = {}) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 10000) {
    throw new RangeError('A task batch must contain from 1 to 10,000 tasks.');
  }
  return Object.freeze(Array.from({ length: count }, (_, index) => (
    generateNumberTask(modeOrActivity, `${serialisableSeed(seed)}:${index}`, options)
  )));
}

export function validateGeneratedNumberTask(task) {
  const errors = [];
  if (!task || typeof task !== 'object') return Object.freeze({ valid: false, errors: Object.freeze(['Task is missing.']) });
  if (!NUMBER_TASK_KINDS.includes(task.kind)) errors.push(`Unknown task kind: ${task.kind}.`);
  if (!task.id || task.seed === undefined || !task.prompt || !task.solution) errors.push('Task metadata is incomplete.');

  try {
    if (task.kind === 'place-value' && createLinkedRepresentations(task.values.value).value !== task.solution.value) {
      errors.push('Place-value solution does not match the value.');
    }
    if (task.kind === 'partition' && !validatePartition(task.values.value, task.values.partition).equivalent) {
      errors.push('Partition is not equivalent to its target.');
    }
    if (task.kind === 'step' && task.solution.result !== task.values.start + task.values.change) {
      errors.push('More-or-less step result is incorrect.');
    }
    if (task.kind === 'comparison') {
      const expected = comparePlaceValue(task.values.left, task.values.right);
      if (expected.relation !== task.solution.relation) errors.push('Comparison relation is incorrect.');
    }
    if (task.kind === 'ordering') {
      const expected = [...task.values.numbers].sort((left, right) => left - right);
      if (JSON.stringify(expected) !== JSON.stringify(task.solution.ascending)) errors.push('Ordered values are incorrect.');
    }
    if (task.kind === 'number-line') {
      const lineValidation = validateNumberLine(task.display);
      if (!lineValidation.valid) errors.push(...lineValidation.errors);
      const expectedRatio = (task.values.target - task.values.start) / (task.values.end - task.values.start);
      if (Math.abs(expectedRatio - task.solution.ratio) > 1e-9) errors.push('Number-line solution ratio is incorrect.');
    }
    if (task.kind === 'rounding' && getRoundingBounds(task.values.value, task.values.unit).rounded !== task.solution.rounded) {
      errors.push('Rounding solution is incorrect.');
    }
    if (task.kind === 'estimate') {
      if (task.solution.exact !== task.values.left + task.values.right) errors.push('Estimate task exact total is incorrect.');
      if (task.solution.estimate !== task.solution.roundedOperands[0] + task.solution.roundedOperands[1]) {
        errors.push('Estimate does not match the rounded operands.');
      }
    }
    if (task.kind === 'negative-number') {
      if (task.solution.change !== task.values.end - task.values.start) errors.push('Negative-number movement is incorrect.');
      if (task.solution.difference !== Math.abs(task.values.end - task.values.start)) errors.push('Negative-number difference is incorrect.');
    }
    if (task.kind === 'roman-numeral') {
      const parsed = parseRomanNumeral(task.values.roman);
      if (!parsed.valid || parsed.value !== task.values.value) errors.push('Roman numeral does not round-trip.');
    }
    if (task.kind === 'addition' && traceAddition(task.values.left, task.values.right).total !== task.solution.total) {
      errors.push('Addition trace total is incorrect.');
    }
    if (task.kind === 'subtraction' && traceSubtraction(task.values.minuend, task.values.subtrahend).difference !== task.solution.difference) {
      errors.push('Subtraction trace difference is incorrect.');
    }
    if (task.kind === 'inverse' && createInverseFamily(task.values.firstAddend, task.values.secondAddend).total !== task.solution.total) {
      errors.push('Inverse family total is incorrect.');
    }
    if (task.kind === 'problem') {
      const expected = task.values.steps === 1
        ? task.values.start + task.values.changeOne
        : task.values.start + task.values.changeOne - task.values.changeTwo;
      if (task.solution.result !== expected) errors.push('Problem solution does not follow its operation plan.');
    }
    if (task.kind === 'truth-statement') {
      const fixture = TRUTH_FIXTURES.find(({ id }) => id === task.values.fixtureId);
      if (!fixture || !validateTruthFixture(fixture).valid || fixture.classification !== task.solution.classification) {
        errors.push('Truth fixture is invalid or misclassified.');
      }
    }
  } catch (error) {
    errors.push(error.message);
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}
