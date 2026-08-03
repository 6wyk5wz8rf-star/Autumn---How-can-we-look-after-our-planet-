import {
  PLACE_VALUE_PLACES,
  canonicalPlaceCounts,
  comparePlaceValue,
  formatMathsNumber,
} from './placeValue.js';
import { getRoundingBounds } from './rounding.js';

function countPhrase(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}
export function placeValueFeedback(value) {
  const counts = canonicalPlaceCounts(value);
  const phrases = [
    countPhrase(counts.thousands, 'thousand', 'thousands'),
    countPhrase(counts.hundreds, 'hundred', 'hundreds'),
    countPhrase(counts.tens, 'ten', 'tens'),
    countPhrase(counts.ones, 'one', 'ones'),
  ];
  return `You built ${phrases.slice(0, -1).join(', ')} and ${phrases.at(-1)}. This represents ${formatMathsNumber(value)}.`;
}

export function comparisonFeedback(left, right) {
  const comparison = comparePlaceValue(left, right);
  if (comparison.relation === '=') {
    return `Both representations have the same value: ${formatMathsNumber(left)}.`;
  }
  const earlierPlaces = PLACE_VALUE_PLACES
    .slice(0, PLACE_VALUE_PLACES.findIndex(({ key }) => key === comparison.decidingPlace))
    .map(({ key, label }) => `${label.toLowerCase()} (${canonicalPlaceCounts(left)[key]})`);
  const shared = earlierPlaces.length ? `The ${earlierPlaces.join(' and ')} match. ` : '';
  const relationWord = comparison.relation === '>' ? 'greater than' : 'less than';
  return `${shared}The ${comparison.decidingPlace} column decides the comparison: ${formatMathsNumber(left)} is ${relationWord} ${formatMathsNumber(right)}.`;
}

export function partitionFeedback(validation) {
  if (!validation || typeof validation.feedback !== 'string') {
    throw new TypeError('Partition feedback needs a partition-validation result.');
  }
  return validation.feedback;
}

export function roundingFeedback(value, unit, answer = null) {
  const bounds = getRoundingBounds(value, unit);
  if (answer === bounds.rounded) {
    if (bounds.isMidpoint) {
      return `${formatMathsNumber(value)} is exactly halfway between ${formatMathsNumber(bounds.lower)} and ${formatMathsNumber(bounds.upper)}, so it rounds up to ${formatMathsNumber(bounds.upper)}.`;
    }
    if (bounds.isExactMultiple) return `${formatMathsNumber(value)} is already a multiple of ${formatMathsNumber(unit)}.`;
    return `${formatMathsNumber(value)} is nearer to ${formatMathsNumber(bounds.rounded)}: the distances are ${formatMathsNumber(bounds.distanceToLower)} and ${formatMathsNumber(bounds.distanceToUpper)}.`;
  }
  return `Place ${formatMathsNumber(value)} between ${formatMathsNumber(bounds.lower)} and ${formatMathsNumber(bounds.upper)}. The midpoint is ${formatMathsNumber(bounds.midpoint)}; compare the distances before choosing.`;
}

export function additionExchangeFeedback(trace) {
  if (!trace || trace.operation !== 'addition') throw new TypeError('Addition feedback needs an addition trace.');
  if (!trace.exchangeCount) {
    return `Each column totals fewer than 10, so ${trace.formatted} needs no exchange.`;
  }
  const places = trace.exchangePlaces.join(', ');
  const totalNote = trace.createsFiveDigitTotal ? ` The final exchange creates the five-digit total ${formatMathsNumber(trace.total)}.` : '';
  return `${trace.exchangeCount} exchange${trace.exchangeCount === 1 ? '' : 's'} occur${trace.exchangeCount === 1 ? 's' : ''}, from the ${places} column${trace.exchangeCount === 1 ? '' : 's'}.${totalNote}`;
}

export function subtractionExchangeFeedback(trace) {
  if (!trace || trace.operation !== 'subtraction') throw new TypeError('Subtraction feedback needs a subtraction trace.');
  if (!trace.exchangeCount) return `${trace.formatted} can be completed without an exchange.`;
  if (trace.crossesZero) {
    const unavailable = trace.unavailablePlaces.join(' and ');
    return `The ${unavailable} column${trace.unavailablePlaces.length === 1 ? ' is' : 's are'} empty, so the exchange must travel through ${trace.exchangeCount} place-value columns before subtracting.`;
  }
  return `${trace.exchangeCount} place-value exchange${trace.exchangeCount === 1 ? '' : 's'} make enough in the ${trace.exchangeTargetPlaces.join(' and ')} column${trace.exchangeTargetPlaces.length === 1 ? '' : 's'} to subtract.`;
}

export function estimateReasonablenessFeedback({ estimate, exact, tolerance }) {
  for (const [label, value] of Object.entries({ estimate, exact, tolerance })) {
    if (!Number.isFinite(value) || (label === 'tolerance' && value < 0)) {
      throw new TypeError(`${label} must be ${label === 'tolerance' ? 'a non-negative' : 'a'} finite number.`);
    }
  }
  const difference = Math.abs(estimate - exact);
  const reasonable = difference <= tolerance;
  return Object.freeze({
    reasonable,
    difference,
    feedback: reasonable
      ? `The estimate ${formatMathsNumber(Math.round(estimate))} is close to the exact answer ${formatMathsNumber(Math.round(exact))}; they differ by ${formatMathsNumber(Math.round(difference))}.`
      : `The estimate suggests an answer near ${formatMathsNumber(Math.round(estimate))}, but the exact answer is ${formatMathsNumber(Math.round(exact))}. Check the place-value magnitude and the chosen operation.`,
  });
}

export function reasoningEvidenceFeedback(kind) {
  const messages = {
    example: 'This example supports the statement, but one example cannot prove that it is always true.',
    'several-examples': 'Several examples strengthen the pattern, but they do not rule out a counterexample.',
    counterexample: 'This counterexample is enough to disprove a statement that claims to be always true.',
    proof: 'The reasoning covers every case described by the statement, so it is a general proof.',
  };
  if (!messages[kind]) throw new TypeError('Evidence must be an example, several examples, a counterexample or a proof.');
  return messages[kind];
}
