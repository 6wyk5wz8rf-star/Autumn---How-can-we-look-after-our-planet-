import { roundToNearest } from './rounding.js';
import { arabicToRoman } from './romanNumerals.js';

export const TRUTH_CLASSIFICATIONS = Object.freeze(['always', 'sometimes', 'never']);

const fixtures = [
  {
    id: 'rounded-result-is-target-multiple',
    statement: 'A whole number rounded to the nearest 100 is a multiple of 100.',
    classification: 'always',
    domain: Object.freeze(Array.from({ length: 10000 }, (_, value) => value)),
    predicate: (value) => roundToNearest(value, 100) % 100 === 0,
    supportingExample: 4382,
    counterexample: null,
    explanation: 'Rounding to the nearest 100 selects one of the neighbouring multiples of 100.',
  },
  {
    id: 'rounding-makes-number-larger',
    statement: 'Rounding a number to the nearest 100 makes it larger.',
    classification: 'sometimes',
    domain: Object.freeze(Array.from({ length: 10000 }, (_, value) => value)),
    predicate: (value) => roundToNearest(value, 100) > value,
    supportingExample: 4382,
    counterexample: 4321,
    explanation: 'Values above a midpoint round up, while values below it round down and exact multiples stay equal.',
  },
  {
    id: 'two-four-digit-addends-five-digit-total',
    statement: 'Adding two four-digit numbers gives a five-digit total.',
    classification: 'sometimes',
    domain: Object.freeze([
      Object.freeze([1000, 1000]),
      Object.freeze([4827, 3186]),
      Object.freeze([6000, 5000]),
      Object.freeze([9999, 9999]),
    ]),
    predicate: ([left, right]) => left + right >= 10000,
    supportingExample: Object.freeze([6000, 5000]),
    counterexample: Object.freeze([1000, 1000]),
    explanation: 'The total has five digits only when the two addends combine to at least 10,000.',
  },
  {
    id: 'roman-four-written-iiii',
    statement: 'The number 4 is written IIII in canonical Roman numerals.',
    classification: 'never',
    domain: Object.freeze([4]),
    predicate: (value) => arabicToRoman(value) === 'IIII',
    supportingExample: null,
    counterexample: 4,
    explanation: 'Canonical Roman notation uses IV: one before five represents four.',
  },
];

export const TRUTH_FIXTURES = Object.freeze(fixtures.map((fixture) => Object.freeze({ ...fixture })));

export function getTruthFixture(id) {
  return TRUTH_FIXTURES.find((fixture) => fixture.id === id) ?? null;
}

/** Verify that the stored witnesses agree with the declared classification. */
export function validateTruthFixture(fixture) {
  const errors = [];
  if (!fixture || typeof fixture !== 'object') {
    return Object.freeze({ valid: false, errors: Object.freeze(['A truth fixture must be an object.']) });
  }
  if (!TRUTH_CLASSIFICATIONS.includes(fixture.classification)) errors.push('Unknown truth classification.');
  if (typeof fixture.predicate !== 'function') errors.push('A truth fixture needs a predicate.');
  if (!Array.isArray(fixture.domain) || fixture.domain.length === 0) errors.push('A truth fixture needs a finite validation domain.');
  if (errors.length) return Object.freeze({ valid: false, errors: Object.freeze(errors) });

  const outcomes = fixture.domain.map((value) => Boolean(fixture.predicate(value)));
  const hasTrue = outcomes.includes(true);
  const hasFalse = outcomes.includes(false);
  if (fixture.classification === 'always' && hasFalse) errors.push('An “always” fixture has a false case.');
  if (fixture.classification === 'never' && hasTrue) errors.push('A “never” fixture has a true case.');
  if (fixture.classification === 'sometimes' && (!hasTrue || !hasFalse)) {
    errors.push('A “sometimes” fixture needs both a supporting example and a counterexample.');
  }
  if (fixture.supportingExample !== null && !fixture.predicate(fixture.supportingExample)) {
    errors.push('The supporting example does not support the statement.');
  }
  if (fixture.counterexample !== null && fixture.predicate(fixture.counterexample)) {
    errors.push('The counterexample does not challenge the statement.');
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    outcomes: Object.freeze({ hasTrue, hasFalse, testedCases: outcomes.length }),
  });
}

export function validateTruthFixtureLibrary(fixturesToTest = TRUTH_FIXTURES) {
  const errors = [];
  const ids = new Set();
  for (const fixture of fixturesToTest) {
    if (ids.has(fixture.id)) errors.push(`Duplicate truth fixture ID: ${fixture.id}.`);
    ids.add(fixture.id);
    const validation = validateTruthFixture(fixture);
    errors.push(...validation.errors.map((error) => `${fixture.id}: ${error}`));
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}
