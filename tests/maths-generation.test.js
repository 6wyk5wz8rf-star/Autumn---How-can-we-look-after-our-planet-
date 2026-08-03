import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateNumberTask,
  generateNumberTaskBatch,
  validateGeneratedNumberTask,
} from '../src/maths/index.js';

const ACTIVITY_MODES = [
  'build-a-four-digit-number',
  'ten-hundreds-make-a-thousand',
  'break-the-number-apart',
  'partition-it-another-way',
  'step-by-10-100-or-1000',
  'which-number-is-greater',
  'place-it-on-the-line',
  'estimate-the-position',
  'nearest-ten',
  'nearest-hundred',
  'nearest-thousand',
  'estimate-before-you-calculate',
  'travel-through-zero',
  'find-the-temperature-difference',
  'roman-numerals-to-fifty',
  'roman-numerals-to-one-hundred',
  'addition-without-exchange',
  'one-addition-exchange',
  'several-exchanges',
  'build-a-five-digit-total',
  'subtraction-without-exchange',
  'one-subtraction-exchange',
  'exchange-across-zero',
  'choose-an-efficient-method',
  'use-the-inverse',
  'solve-a-one-step-problem',
  'plan-a-two-step-solution',
  'prove-it-or-disprove-it',
];

test('the single generator API recognises and validates all 28 activity pathways', () => {
  const tasks = ACTIVITY_MODES.map((mode, index) => generateNumberTask(mode, `activity-${index}`));
  assert.equal(tasks.length, 28);
  for (const task of tasks) {
    const validation = validateGeneratedNumberTask(task);
    assert.equal(validation.valid, true, `${task.kind}: ${validation.errors.join(' ')}`);
    assert.ok(task.id.startsWith(`number-task-${task.kind}-`));
    assert.ok(task.prompt.length > 20);
    assert.ok(task.explanation.length > 20);
    assert.ok(task.curriculumTags.length > 1);
  }
});

test('the generator also accepts the registered runtime IDs and open-tool modes', () => {
  const runtimeIds = [
    'build-four-digit-number', 'ten-hundreds-thousand', 'break-number-apart',
    'partition-another-way', 'step-more-less', 'which-number-greater',
    'place-on-line', 'estimate-position', 'estimate-before-calculate',
    'temperature-difference', 'roman-to-fifty', 'roman-to-hundred',
    'addition-no-exchange', 'addition-one-exchange', 'addition-several-exchanges',
    'five-digit-total', 'subtraction-no-exchange', 'subtraction-one-exchange',
    'choose-efficient-method', 'use-inverse', 'solve-one-step', 'plan-two-step',
    'prove-disprove', 'stepper', 'compare', 'order', 'negative', 'roman',
    'strategy', 'statement', 'challenge',
  ];
  for (const [index, runtimeId] of runtimeIds.entries()) {
    const task = generateNumberTask(runtimeId, `runtime-${index}`);
    assert.equal(validateGeneratedNumberTask(task).valid, true, runtimeId);
  }
  assert.equal(generateNumberTask('order', 'order-seed').solution.ascending.length, 4);
});

test('the same seed and options reproduce the exact same semantic task', () => {
  for (const mode of ACTIVITY_MODES) {
    const first = generateNumberTask(mode, 'reproducible-seed');
    const replay = generateNumberTask(mode, 'reproducible-seed');
    assert.deepEqual(replay, first, mode);
  }
  assert.notDeepEqual(
    generateNumberTask('nearest-hundred', 'seed-a'),
    generateNumberTask('nearest-hundred', 'seed-b'),
  );
  assert.deepEqual(
    generateNumberTask('Nearest Hundred', 'title-seed'),
    generateNumberTask('Nearest Hundred', 'title-seed'),
  );
  assert.notEqual(
    generateNumberTask('nearest-ten', 'shared-seed').id,
    generateNumberTask('nearest-hundred', 'shared-seed').id,
  );
});

test('generated operation categories match the selected exchange pathway', () => {
  const categories = {
    'addition-without-exchange': 'no-exchange',
    'one-addition-exchange': 'one-exchange',
    'several-exchanges': 'multiple-exchanges',
    'build-a-five-digit-total': 'five-digit-total',
    'subtraction-without-exchange': 'no-exchange',
    'one-subtraction-exchange': 'one-exchange',
    'exchange-across-zero': 'exchange-across-zero',
  };
  for (const [mode, category] of Object.entries(categories)) {
    const tasks = generateNumberTaskBatch(mode, 'exchange-batch', 100);
    assert.equal(tasks.every(({ solution }) => solution.category === category), true, mode);
  }
});

test('rounding generation deliberately covers exact, midpoint and near-10,000 cases', () => {
  assert.equal(generateNumberTask('rounding', 'exact-case', { unit: 1000, case: 'exact' }).solution.isExactMultiple, true);
  assert.equal(generateNumberTask('rounding', 'midpoint-case', { unit: 100, case: 'midpoint' }).solution.isMidpoint, true);
  assert.equal(generateNumberTask('rounding', 'below-case', { unit: 10, case: 'just-below' }).solution.direction, 'down');
  assert.equal(generateNumberTask('rounding', 'above-case', { unit: 10, case: 'just-above' }).solution.direction, 'up');
  const nearTop = generateNumberTaskBatch('rounding', 'top-range', 500, { unit: 1000 });
  assert.equal(nearTop.some(({ values }) => values.value >= 9000), true);
  assert.equal(nearTop.every(({ values }) => values.value <= 9999), true);
});

test('thousands of seeded tasks pass their domain validators', () => {
  const batchModes = [
    'place-value', 'partition', 'comparison', 'ordering', 'number-line', 'rounding',
    'roman-numeral', 'addition', 'subtraction', 'inverse', 'truth-statement',
  ];
  let checked = 0;
  for (const mode of batchModes) {
    const tasks = generateNumberTaskBatch(mode, 'large-validation-run', 250);
    for (const task of tasks) {
      const validation = validateGeneratedNumberTask(task);
      assert.equal(validation.valid, true, `${task.id}: ${validation.errors.join(' ')}`);
      checked += 1;
    }
  }
  assert.equal(checked, 2750);
});

test('generator rejects unknown modes and unbounded batch sizes clearly', () => {
  assert.throws(() => generateNumberTask('arcade-quiz', 1), /Unknown Number Expedition task mode/);
  assert.throws(() => generateNumberTaskBatch('rounding', 1, 0), /from 1 to 10,000/);
  assert.throws(() => generateNumberTaskBatch('rounding', 1, 10001), /from 1 to 10,000/);
});
