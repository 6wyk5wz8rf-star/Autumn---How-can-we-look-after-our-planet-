import { formatMathsNumber } from './placeValue.js';

const COLUMN_PLACES = Object.freeze(['ones', 'tens', 'hundreds', 'thousands']);
const EXTENDED_PLACES = Object.freeze([...COLUMN_PLACES, 'ten-thousands']);

function assertOperand(value, label) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 9999) {
    throw new RangeError(`${label} must be a whole number from 0 to 9,999.`);
  }
}

function digitsAscending(value, length = 4) {
  return Array.from({ length }, (_, index) => Math.floor(value / (10 ** index)) % 10);
}

export function traceAddition(left, right) {
  assertOperand(left, 'The first addend');
  assertOperand(right, 'The second addend');
  const leftDigits = digitsAscending(left);
  const rightDigits = digitsAscending(right);
  const resultDigits = [];
  const steps = [];
  let incomingExchange = 0;

  for (let index = 0; index < COLUMN_PLACES.length; index += 1) {
    const columnTotal = leftDigits[index] + rightDigits[index] + incomingExchange;
    const resultDigit = columnTotal % 10;
    const outgoingExchange = Math.floor(columnTotal / 10);
    resultDigits.push(resultDigit);
    steps.push(Object.freeze({
      place: COLUMN_PLACES[index],
      placeIndex: index,
      leftDigit: leftDigits[index],
      rightDigit: rightDigits[index],
      incomingExchange,
      columnTotal,
      resultDigit,
      outgoingExchange,
      exchangesTo: outgoingExchange ? EXTENDED_PLACES[index + 1] : null,
    }));
    incomingExchange = outgoingExchange;
  }
  if (incomingExchange) resultDigits.push(incomingExchange);
  const total = left + right;
  const reconstructed = resultDigits.reduce((sum, digit, index) => sum + digit * (10 ** index), 0);
  if (reconstructed !== total) throw new Error('Addition trace failed its internal arithmetic check.');

  const exchangePlaces = steps.filter(({ outgoingExchange }) => outgoingExchange).map(({ place }) => place);
  const exchangeIndexes = steps.filter(({ outgoingExchange }) => outgoingExchange).map(({ placeIndex }) => placeIndex);
  const consecutive = exchangeIndexes.length > 1
    && exchangeIndexes.every((index, position) => position === 0 || index === exchangeIndexes[position - 1] + 1);
  const createsFiveDigitTotal = total >= 10000;
  const category = createsFiveDigitTotal
    ? 'five-digit-total'
    : exchangePlaces.length === 0
      ? 'no-exchange'
      : exchangePlaces.length === 1
        ? 'one-exchange'
        : 'multiple-exchanges';

  return Object.freeze({
    operation: 'addition',
    left,
    right,
    total,
    formatted: `${formatMathsNumber(left)} + ${formatMathsNumber(right)} = ${formatMathsNumber(total)}`,
    steps: Object.freeze(steps),
    resultDigits: Object.freeze(resultDigits),
    exchangeCount: exchangePlaces.length,
    exchangePlaces: Object.freeze(exchangePlaces),
    consecutiveExchanges: consecutive,
    createsFiveDigitTotal,
    category,
  });
}

export function classifyAdditionExchanges(left, right) {
  const trace = traceAddition(left, right);
  return Object.freeze({
    total: trace.total,
    category: trace.category,
    exchangeCount: trace.exchangeCount,
    exchangePlaces: trace.exchangePlaces,
    consecutive: trace.consecutiveExchanges,
    createsFiveDigitTotal: trace.createsFiveDigitTotal,
  });
}

function singularPlace(place) {
  return ({
    ones: 'one',
    tens: 'ten',
    hundreds: 'hundred',
    thousands: 'thousand',
    'ten-thousands': 'ten thousand',
  })[place] ?? place.replace('-', ' ');
}

function exchangeMessage(from, to) {
  return `1 ${singularPlace(from)} becomes 10 ${to.replace('-', ' ')}`;
}

/**
 * Trace formal subtraction, including every link in an exchange across zeros.
 * The working digits are snapshots so Board View can replay without recomputing.
 */
export function traceSubtraction(minuend, subtrahend) {
  assertOperand(minuend, 'The minuend');
  assertOperand(subtrahend, 'The subtrahend');
  if (subtrahend > minuend) {
    throw new RangeError('This formal subtraction trace requires the minuend to be at least the subtrahend.');
  }

  const working = digitsAscending(minuend);
  const subtractDigits = digitsAscending(subtrahend);
  const resultDigits = [];
  const steps = [];
  const exchangeEvents = [];
  const unavailablePlaces = [];

  for (let index = 0; index < COLUMN_PLACES.length; index += 1) {
    const place = COLUMN_PLACES[index];
    const beforeColumn = working[index];
    const needed = subtractDigits[index];
    const chain = [];
    const unavailable = [];

    if (working[index] < needed) {
      let donor = index + 1;
      while (donor < working.length && working[donor] === 0) {
        unavailable.push(COLUMN_PLACES[donor]);
        unavailablePlaces.push(COLUMN_PLACES[donor]);
        donor += 1;
      }
      if (donor >= working.length) throw new Error('Subtraction exchange could not find a donor column.');

      for (let high = donor; high > index; high -= 1) {
        const low = high - 1;
        const before = Object.freeze([...working]);
        working[high] -= 1;
        working[low] += 10;
        const event = Object.freeze({
          from: COLUMN_PLACES[high],
          to: COLUMN_PLACES[low],
          fromBefore: before[high],
          fromAfter: working[high],
          toBefore: before[low],
          toAfter: working[low],
          message: exchangeMessage(COLUMN_PLACES[high], COLUMN_PLACES[low]),
          workingDigits: Object.freeze([...working]),
        });
        chain.push(event);
        exchangeEvents.push(event);
      }
    }

    const available = working[index];
    const resultDigit = available - needed;
    working[index] = resultDigit;
    resultDigits.push(resultDigit);
    steps.push(Object.freeze({
      place,
      placeIndex: index,
      beforeColumn,
      subtrahendDigit: needed,
      unavailablePlaces: Object.freeze(unavailable),
      exchangeChain: Object.freeze(chain),
      availableAfterExchange: available,
      resultDigit,
      workingDigits: Object.freeze([...working]),
    }));
  }

  const difference = minuend - subtrahend;
  const reconstructed = resultDigits.reduce((sum, digit, index) => sum + digit * (10 ** index), 0);
  if (reconstructed !== difference) throw new Error('Subtraction trace failed its internal arithmetic check.');

  const exchangeTargetPlaces = steps.filter(({ exchangeChain }) => exchangeChain.length).map(({ place }) => place);
  const crossesZero = steps.some(({ exchangeChain }) => exchangeChain.length > 1);
  const category = crossesZero
    ? 'exchange-across-zero'
    : exchangeEvents.length === 0
      ? 'no-exchange'
      : exchangeEvents.length === 1
        ? 'one-exchange'
        : 'multiple-exchanges';

  return Object.freeze({
    operation: 'subtraction',
    minuend,
    subtrahend,
    difference,
    formatted: `${formatMathsNumber(minuend)} − ${formatMathsNumber(subtrahend)} = ${formatMathsNumber(difference)}`,
    steps: Object.freeze(steps),
    resultDigits: Object.freeze(resultDigits),
    exchangeEvents: Object.freeze(exchangeEvents),
    exchangeCount: exchangeEvents.length,
    exchangeTargetPlaces: Object.freeze(exchangeTargetPlaces),
    unavailablePlaces: Object.freeze([...new Set(unavailablePlaces)]),
    crossesZero,
    category,
  });
}

export function classifySubtractionExchanges(minuend, subtrahend) {
  const trace = traceSubtraction(minuend, subtrahend);
  return Object.freeze({
    difference: trace.difference,
    category: trace.category,
    exchangeCount: trace.exchangeCount,
    exchangeTargetPlaces: trace.exchangeTargetPlaces,
    unavailablePlaces: trace.unavailablePlaces,
    crossesZero: trace.crossesZero,
  });
}
