import { formatMathsNumber } from './placeValue.js';

export const ROUNDING_UNITS = Object.freeze([10, 100, 1000]);

function assertRoundingInput(value, unit) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 9999) {
    throw new RangeError('The number to round must be a whole number from 0 to 9,999.');
  }
  if (!ROUNDING_UNITS.includes(unit)) {
    throw new RangeError('The rounding unit must be 10, 100 or 1,000.');
  }
}
/** Bracketing multiples, midpoint, distances and the correctly rounded value. */
export function getRoundingBounds(value, unit) {
  assertRoundingInput(value, unit);
  const lower = Math.floor(value / unit) * unit;
  const upper = lower + unit;
  const midpoint = lower + unit / 2;
  const distanceToLower = value - lower;
  const distanceToUpper = upper - value;
  const isExactMultiple = distanceToLower === 0;
  const isMidpoint = value === midpoint;
  const rounded = isExactMultiple ? value : value < midpoint ? lower : upper;

  return Object.freeze({
    value,
    unit,
    lower,
    upper,
    midpoint,
    distanceToLower,
    distanceToUpper,
    isExactMultiple,
    isMidpoint,
    rounded,
    direction: isExactMultiple ? 'exact' : value < midpoint ? 'down' : 'up',
  });
}

export function roundToNearest(value, unit) {
  return getRoundingBounds(value, unit).rounded;
}

export function validateRoundingAnswer(value, unit, answer) {
  if (!Number.isSafeInteger(answer)) {
    return Object.freeze({ valid: false, correct: false, error: 'The rounded answer must be a whole number.' });
  }
  const bounds = getRoundingBounds(value, unit);
  const correct = answer === bounds.rounded;
  const unitLabel = formatMathsNumber(unit);
  let feedback;
  if (correct && bounds.isExactMultiple) {
    feedback = `${formatMathsNumber(value)} is already a multiple of ${unitLabel}, so it stays the same.`;
  } else if (correct && bounds.isMidpoint) {
    feedback = `${formatMathsNumber(value)} is exactly halfway. At a midpoint, round to ${formatMathsNumber(bounds.upper)}.`;
  } else if (correct) {
    const nearer = bounds.direction === 'down' ? bounds.lower : bounds.upper;
    const distance = Math.min(bounds.distanceToLower, bounds.distanceToUpper);
    feedback = `${formatMathsNumber(value)} is ${formatMathsNumber(distance)} away from ${formatMathsNumber(nearer)}, so it rounds to ${formatMathsNumber(bounds.rounded)}.`;
  } else {
    feedback = `${formatMathsNumber(value)} lies between ${formatMathsNumber(bounds.lower)} and ${formatMathsNumber(bounds.upper)}. The midpoint is ${formatMathsNumber(bounds.midpoint)}; compare the two distances.`;
  }
  return Object.freeze({ valid: true, correct, answer, ...bounds, feedback });
}
