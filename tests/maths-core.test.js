import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TRUTH_FIXTURES,
  additionExchangeFeedback,
  arabicToRoman,
  changePlaceCount,
  classifyAdditionExchanges,
  comparePlaceValue,
  comparisonFeedback,
  createInverseFamily,
  createLinkedRepresentations,
  createNumberLine,
  createRandomState,
  estimateReasonablenessFeedback,
  exchangePlaceValue,
  getRoundingBounds,
  nextRandom,
  numberToWords,
  parseRomanNumeral,
  placeValueFeedback,
  positionOnNumberLine,
  randomInteger,
  reasoningEvidenceFeedback,
  repairRomanNumeral,
  romanToArabic,
  roundToNearest,
  roundingFeedback,
  solveMissingNumber,
  subtractionExchangeFeedback,
  traceAddition,
  traceSubtraction,
  validateNumberLine,
  validateNumberLinePlacement,
  validatePartition,
  validateRoundingAnswer,
  validateTruthFixtureLibrary,
  valueAtNumberLinePosition,
} from '../src/maths/index.js';

test('linked place-value representations preserve zeros and remain synchronised', () => {
  const linked = createLinkedRepresentations(4052);
  assert.equal(linked.numeral, '4,052');
  assert.equal(linked.numberName, 'four thousand and fifty-two');
  assert.deepEqual(linked.digits, { thousands: 4, hundreds: 0, tens: 5, ones: 2 });
  assert.deepEqual(linked.allPlaceTerms, [4000, 0, 50, 2]);
  assert.equal(linked.expandedForm, '4,000 + 50 + 2');
  assert.equal(linked.placeValueChart[1].digit, 0);
  assert.equal(linked.counters[1].count, 0);

  const changed = changePlaceCount(linked.sourceCounts, 'hundreds', 3);
  assert.equal(changed.value, 4352);
  assert.equal(changed.numeral, '4,352');
  assert.equal(changed.expandedForm, '4,000 + 300 + 50 + 2');
});

test('non-canonical place counts normalise through exact exchanges', () => {
  const tenHundreds = createLinkedRepresentations({ hundreds: 10 });
  assert.equal(tenHundreds.value, 1000);
  assert.deepEqual(tenHundreds.sourceCounts, { thousands: 0, hundreds: 10, tens: 0, ones: 0 });
  assert.deepEqual(tenHundreds.digits, { thousands: 1, hundreds: 0, tens: 0, ones: 0 });
  assert.deepEqual(tenHundreds.normalisationExchanges, [{
    from: 'hundreds', to: 'thousands', groups: 1, quantityMoved: 1000,
  }]);

  const exchanged = exchangePlaceValue(1320, 'hundreds', 'tens');
  assert.equal(exchanged.value, 1320);
  assert.deepEqual(exchanged.sourceCounts, { thousands: 1, hundreds: 2, tens: 12, ones: 0 });
  assert.throws(() => exchangePlaceValue(1320, 'thousands', 'tens'), /adjacent/);
});

test('UK number language is stable across zero, hundreds and five-digit totals', () => {
  assert.equal(numberToWords(0), 'zero');
  assert.equal(numberToWords(115), 'one hundred and fifteen');
  assert.equal(numberToWords(1001), 'one thousand and one');
  assert.equal(numberToWords(4382), 'four thousand three hundred and eighty-two');
  assert.equal(numberToWords(19998), 'nineteen thousand nine hundred and ninety-eight');
});

test('partition validation distinguishes standard, non-standard, incomplete and different values', () => {
  const standard = validatePartition(4362, [4000, 300, 60, 2]);
  assert.equal(standard.equivalent, true);
  assert.equal(standard.kind, 'standard');

  const nonStandard = validatePartition(4362, [3000, 1300, 50, 12]);
  assert.equal(nonStandard.equivalent, true);
  assert.equal(nonStandard.kind, 'non-standard');

  const countPartition = validatePartition(4362, { hundreds: 43, tens: 6, ones: 2 });
  assert.equal(countPartition.equivalent, true);
  assert.equal(countPartition.kind, 'non-standard');

  const incomplete = validatePartition(4052, [4000, 50]);
  assert.equal(incomplete.status, 'incomplete');
  assert.equal(incomplete.difference, -2);
  assert.match(incomplete.feedback, /Another 2 is needed/);

  const different = validatePartition(4052, [4000, 100, 50, 2]);
  assert.equal(different.status, 'different');
  assert.equal(different.representedValue, 4152);
  assert.match(different.feedback, /100 more/);

  const malformed = validatePartition(4052, [{ place: 'bundles', count: 4 }]);
  assert.equal(malformed.valid, false);
  assert.equal(malformed.status, 'invalid');
});

test('rounding exposes exact bounds, midpoint behaviour and actual distances', () => {
  assert.deepEqual(getRoundingBounds(4449, 100), {
    value: 4449,
    unit: 100,
    lower: 4400,
    upper: 4500,
    midpoint: 4450,
    distanceToLower: 49,
    distanceToUpper: 51,
    isExactMultiple: false,
    isMidpoint: false,
    rounded: 4400,
    direction: 'down',
  });
  assert.equal(roundToNearest(4450, 100), 4500);
  assert.equal(roundToNearest(4451, 100), 4500);
  assert.equal(roundToNearest(4000, 1000), 4000);
  assert.match(roundingFeedback(4450, 100, 4500), /exactly halfway/);
  assert.equal(validateRoundingAnswer(9999, 1000, 10000).correct, true);
  assert.equal(validateRoundingAnswer(9999, 1000, 9000).correct, false);
});

test('rounding invariants hold for every Year 4 value and target unit', () => {
  for (const unit of [10, 100, 1000]) {
    for (let value = 0; value <= 9999; value += 1) {
      const bounds = getRoundingBounds(value, unit);
      assert.equal(bounds.rounded % unit, 0);
      assert.ok(bounds.lower <= value && value < bounds.upper);
      assert.equal(bounds.midpoint, bounds.lower + unit / 2);
      const expected = bounds.distanceToLower < bounds.distanceToUpper ? bounds.lower : bounds.upper;
      assert.equal(bounds.rounded, bounds.isExactMultiple ? value : expected);
    }
  }
});

test('Roman numerals round-trip canonically from 1 to 100', () => {
  const numerals = new Set();
  for (let value = 1; value <= 100; value += 1) {
    const numeral = arabicToRoman(value);
    numerals.add(numeral);
    assert.equal(parseRomanNumeral(numeral).valid, true);
    assert.equal(romanToArabic(numeral), value);
  }
  assert.equal(numerals.size, 100);
  assert.equal(arabicToRoman(49), 'XLIX');
  assert.equal(arabicToRoman(99), 'XCIX');
  assert.equal(arabicToRoman(100), 'C');
});

test('strict Roman parsing rejects and deliberately repairs common invalid forms', () => {
  for (const invalid of ['IIII', 'VX', 'IL', 'IC']) assert.equal(parseRomanNumeral(invalid).valid, false);
  assert.deepEqual(
    ['IIII', 'VX', 'IL', 'IC'].map((value) => repairRomanNumeral(value).canonical),
    ['IV', 'V', 'XLIX', 'XCIX'],
  );
  assert.deepEqual(repairRomanNumeral('VX').alternatives, [
    { value: 15, canonical: 'XV', strategy: 'additive-reading' },
  ]);
  assert.equal(repairRomanNumeral('VX', { intendedValue: 15 }).canonical, 'XV');
  assert.equal(repairRomanNumeral('hello').repairable, false);
  assert.throws(() => romanToArabic('IL'), /not a valid Roman numeral/);
});

test('functional random states reproduce values without hidden mutation', () => {
  const firstState = createRandomState('same-seed');
  const firstDraw = nextRandom(firstState);
  const replayDraw = nextRandom(createRandomState('same-seed'));
  assert.equal(firstDraw.value, replayDraw.value);
  assert.deepEqual(firstDraw.randomState, replayDraw.randomState);
  assert.equal(firstState.draws, 0);

  let state = createRandomState(42);
  const sequence = [];
  for (let index = 0; index < 50; index += 1) {
    const draw = randomInteger(state, 10, 20);
    state = draw.randomState;
    sequence.push(draw.value);
  }
  assert.deepEqual(sequence, sequence.map((value) => Math.min(20, Math.max(10, value))));
  assert.equal(state.draws, 50);
});

test('addition traces classify exchanges and preserve aligned column arithmetic', () => {
  const none = traceAddition(1234, 4321);
  assert.equal(none.total, 5555);
  assert.equal(none.category, 'no-exchange');

  const one = traceAddition(1235, 4325);
  assert.equal(one.category, 'one-exchange');
  assert.deepEqual(one.exchangePlaces, ['ones']);

  const several = traceAddition(1499, 4869);
  assert.equal(several.category, 'multiple-exchanges');
  assert.equal(several.exchangeCount, 3);
  assert.equal(several.consecutiveExchanges, true);

  const fiveDigit = traceAddition(9999, 1);
  assert.equal(fiveDigit.total, 10000);
  assert.equal(fiveDigit.category, 'five-digit-total');
  assert.deepEqual(fiveDigit.resultDigits, [0, 0, 0, 0, 1]);
  assert.equal(classifyAdditionExchanges(9999, 1).createsFiveDigitTotal, true);
  assert.match(additionExchangeFeedback(fiveDigit), /five-digit total 10,000/);
});

test('subtraction traces every exchange across zero in the correct order', () => {
  const trace = traceSubtraction(4002, 1786);
  assert.equal(trace.difference, 2216);
  assert.equal(trace.category, 'exchange-across-zero');
  assert.equal(trace.crossesZero, true);
  assert.deepEqual(trace.unavailablePlaces, ['tens', 'hundreds']);
  assert.deepEqual(trace.exchangeEvents.map(({ from, to }) => [from, to]), [
    ['thousands', 'hundreds'],
    ['hundreds', 'tens'],
    ['tens', 'ones'],
  ]);
  assert.deepEqual(trace.exchangeEvents.map(({ fromAfter, toAfter }) => [fromAfter, toAfter]), [
    [3, 10],
    [9, 10],
    [9, 12],
  ]);
  assert.deepEqual(trace.resultDigits, [6, 1, 2, 2]);
  assert.match(subtractionExchangeFeedback(trace), /tens and hundreds columns are empty/);

  assert.equal(traceSubtraction(8765, 1234).category, 'no-exchange');
  assert.equal(traceSubtraction(4321, 1112).category, 'one-exchange');
});

test('thousands of formal-operation traces reconstruct the exact arithmetic', () => {
  let state = createRandomState('operation-batch');
  for (let index = 0; index < 5000; index += 1) {
    const leftDraw = randomInteger(state, 0, 9999);
    state = leftDraw.randomState;
    const rightDraw = randomInteger(state, 0, 9999);
    state = rightDraw.randomState;
    const addition = traceAddition(leftDraw.value, rightDraw.value);
    assert.equal(addition.total, leftDraw.value + rightDraw.value);

    const minuend = Math.max(leftDraw.value, rightDraw.value);
    const subtrahend = Math.min(leftDraw.value, rightDraw.value);
    const subtraction = traceSubtraction(minuend, subtrahend);
    assert.equal(subtraction.difference, minuend - subtrahend);
  }
});

test('number-line values and visual ratios share one validated mathematical scale', () => {
  const line = createNumberLine({ start: 4000, end: 5000, interval: 100 });
  assert.equal(line.ticks.length, 11);
  assert.equal(line.ticks[5].value, 4500);
  assert.equal(line.ticks[5].ratio, 0.5);
  assert.equal(validateNumberLine(line).valid, true);
  assert.equal(positionOnNumberLine(4250, 4000, 5000), 0.25);
  assert.equal(valueAtNumberLinePosition(0.75, 4000, 5000), 4750);

  const deceptive = validateNumberLine({
    start: 0,
    end: 100,
    ticks: [
      { value: 0, ratio: 0 },
      { value: 20, ratio: 0.5 },
      { value: 100, ratio: 1 },
    ],
  });
  assert.equal(deceptive.valid, false);
  assert.match(deceptive.errors.join(' '), /true mathematical scale/);
  assert.equal(validateNumberLine({ start: 0, end: 100, ticks: [null, { value: 100, ratio: 1 }] }).valid, false);
  assert.match(validateNumberLine({
    start: 0,
    end: 100,
    interval: 30,
    ticks: [{ value: 0, ratio: 0 }, { value: 100, ratio: 1 }],
  }).errors.join(' '), /divide the complete span/);

  const placement = validateNumberLinePlacement({ value: 4500, actualRatio: 0.52, start: 4000, end: 5000, tolerance: 25 });
  assert.equal(placement.correct, true);
  assert.equal(Math.round(placement.representedValue), 4520);
  assert.equal(placement.direction, 'too-high');
});

test('inverse families and missing roles remain arithmetically connected', () => {
  const family = createInverseFamily(3482, 2156);
  assert.equal(family.total, 5638);
  assert.deepEqual(family.equations.map(({ left, operator, right, result }) => [left, operator, right, result]), [
    [3482, '+', 2156, 5638],
    [2156, '+', 3482, 5638],
    [5638, '−', 3482, 2156],
    [5638, '−', 2156, 3482],
  ]);

  assert.deepEqual(solveMissingNumber({ left: null, operator: '+', right: 2156, result: 5638 }), {
    missingPosition: 'left', role: 'addend', value: 3482,
    completed: { left: 3482, operator: '+', right: 2156, result: 5638 },
    inverseOperation: '−',
  });
  assert.equal(solveMissingNumber({ left: 5638, operator: '−', right: null, result: 3482 }).value, 2156);
  assert.equal(solveMissingNumber({ left: null, operator: '−', right: 2156, result: 3482 }).role, 'minuend');
  assert.equal(createInverseFamily(50, 50).equations.length, 2);
});

test('feedback names the actual mathematical structure rather than generic success', () => {
  assert.equal(
    placeValueFeedback(4382),
    'You built 4 thousands, 3 hundreds, 8 tens and 2 ones. This represents 4,382.',
  );
  assert.equal(comparePlaceValue(6482, 6217).decidingPlace, 'hundreds');
  assert.match(comparisonFeedback(6482, 6217), /hundreds column decides/);
  assert.match(estimateReasonablenessFeedback({ estimate: 6000, exact: 5874, tolerance: 500 }).feedback, /differ by 126/);
  assert.match(estimateReasonablenessFeedback({ estimate: 7000, exact: 742, tolerance: 500 }).feedback, /place-value magnitude/);
  assert.match(reasoningEvidenceFeedback('example'), /one example cannot prove/);
  assert.match(reasoningEvidenceFeedback('counterexample'), /enough to disprove/);
});

test('truth fixtures provide validated always, sometimes and never evidence', () => {
  const validation = validateTruthFixtureLibrary();
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.deepEqual(new Set(TRUTH_FIXTURES.map(({ classification }) => classification)), new Set(['always', 'sometimes', 'never']));
});
