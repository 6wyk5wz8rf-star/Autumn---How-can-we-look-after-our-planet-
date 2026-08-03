import {
  PLACE_VALUE_PLACES,
  canonicalPlaceCounts,
  formatMathsNumber,
} from './placeValue.js';

const PLACE_BY_KEY = new Map(PLACE_VALUE_PLACES.map((place) => [place.key, place]));

function assertTarget(target) {
  if (!Number.isSafeInteger(target) || target < 0 || target > 9999) {
    throw new RangeError('A partition target must be a whole number from 0 to 9,999.');
  }
}
function normaliseTerms(partition) {
  if (Array.isArray(partition)) {
    return partition.map((term, index) => {
      if (Number.isSafeInteger(term) && term >= 0) {
        return { kind: 'summand', value: term, sourceIndex: index };
      }
      if (term && typeof term === 'object') {
        const { place, unit = place, count } = term;
        if (!PLACE_BY_KEY.has(unit) || !Number.isSafeInteger(count) || count < 0) {
          throw new TypeError(`Partition term ${index + 1} needs a recognised unit and non-negative whole-number count.`);
        }
        return {
          kind: 'place-count',
          place: unit,
          count,
          value: count * PLACE_BY_KEY.get(unit).value,
          sourceIndex: index,
        };
      }
      throw new TypeError(`Partition term ${index + 1} must be a non-negative summand or place-count term.`);
    });
  }

  if (partition && typeof partition === 'object') {
    const unknown = Object.keys(partition).filter((key) => !PLACE_BY_KEY.has(key));
    if (unknown.length) throw new TypeError(`Unknown partition column: ${unknown.join(', ')}.`);
    return PLACE_VALUE_PLACES.map(({ key, value }, sourceIndex) => {
      const count = partition[key] ?? 0;
      if (!Number.isSafeInteger(count) || count < 0) {
        throw new TypeError(`${key} must have a non-negative whole-number count.`);
      }
      return { kind: 'place-count', place: key, count, value: count * value, sourceIndex };
    });
  }

  throw new TypeError('A partition must be an array of terms or an object of place counts.');
}

function multiset(values) {
  return [...values].filter((value) => value !== 0).sort((a, b) => a - b);
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isStandardPartition(target, terms) {
  const canonical = canonicalPlaceCounts(target);
  if (terms.every(({ kind }) => kind === 'place-count')) {
    const aggregated = Object.fromEntries(PLACE_VALUE_PLACES.map(({ key }) => [key, 0]));
    for (const term of terms) aggregated[term.place] += term.count;
    return PLACE_VALUE_PLACES.every(({ key }) => aggregated[key] === canonical[key]);
  }

  const expected = PLACE_VALUE_PLACES.map(({ key, value }) => canonical[key] * value);
  return arraysEqual(multiset(terms.map(({ value }) => value)), multiset(expected));
}

function partitionFeedback(target, representedValue, status, kind) {
  if (status === 'equivalent') {
    return kind === 'standard'
      ? `The parts recombine to make ${formatMathsNumber(target)} in the standard place-value partition.`
      : `The parts recombine to make ${formatMathsNumber(target)}. This is a valid non-standard partition.`;
  }
  if (status === 'incomplete') {
    return `The parts currently make ${formatMathsNumber(representedValue)}. Another ${formatMathsNumber(target - representedValue)} is needed.`;
  }
  return `The parts make ${formatMathsNumber(representedValue)}, which is ${formatMathsNumber(representedValue - target)} more than ${formatMathsNumber(target)}.`;
}

/**
 * Validate a standard or non-standard partition without silently canonicalising
 * the child's construction.
 */
export function validatePartition(target, partition) {
  assertTarget(target);
  let terms;
  try {
    terms = normaliseTerms(partition);
  } catch (error) {
    return Object.freeze({
      valid: false,
      equivalent: false,
      status: 'invalid',
      kind: null,
      target,
      representedValue: null,
      difference: null,
      terms: Object.freeze([]),
      errors: Object.freeze([error.message]),
      feedback: error.message,
    });
  }

  const representedValue = terms.reduce((sum, { value }) => sum + value, 0);
  const equivalent = representedValue === target;
  const kind = equivalent ? (isStandardPartition(target, terms) ? 'standard' : 'non-standard') : null;
  const status = equivalent ? 'equivalent' : representedValue < target ? 'incomplete' : 'different';

  return Object.freeze({
    valid: true,
    equivalent,
    status,
    kind,
    target,
    representedValue,
    difference: representedValue - target,
    terms: Object.freeze(terms.map((term) => Object.freeze({ ...term }))),
    errors: Object.freeze([]),
    feedback: partitionFeedback(target, representedValue, status, kind),
  });
}

/** Return the visible standard place terms, retaining a meaningful zero column. */
export function standardPartitionTerms(target) {
  assertTarget(target);
  const counts = canonicalPlaceCounts(target);
  return Object.freeze(PLACE_VALUE_PLACES.map(({ key, value }) => Object.freeze({
    place: key,
    count: counts[key],
    value: counts[key] * value,
  })));
}
