/**
 * Pure place-value representations for Number Expedition.
 *
 * The engine keeps semantic quantities separate from their eventual visual
 * rendering. A place-value tray, counter chart, spoken description and saved
 * artefact can therefore all be derived from the same verified value.
 */

export const PLACE_VALUE_PLACES = Object.freeze([
  Object.freeze({ key: 'thousands', label: 'Thousands', singular: 'thousand', value: 1000 }),
  Object.freeze({ key: 'hundreds', label: 'Hundreds', singular: 'hundred', value: 100 }),
  Object.freeze({ key: 'tens', label: 'Tens', singular: 'ten', value: 10 }),
  Object.freeze({ key: 'ones', label: 'Ones', singular: 'one', value: 1 }),
]);

export const PLACE_VALUE_KEYS = Object.freeze(PLACE_VALUE_PLACES.map(({ key }) => key));

const PLACE_BY_KEY = new Map(PLACE_VALUE_PLACES.map((place) => [place.key, place]));
const ASCENDING_PLACES = [...PLACE_VALUE_PLACES].reverse();

function assertWholeNumber(value, label = 'value', maximum = 9999) {
  if (!Number.isSafeInteger(value) || value < 0 || value > maximum) {
    throw new RangeError(`${label} must be a whole number from 0 to ${maximum.toLocaleString('en-GB')}.`);
  }
}
function freezeRecord(record) {
  return Object.freeze(record);
}

export function formatMathsNumber(value) {
  if (!Number.isSafeInteger(value)) throw new TypeError('Only whole numbers can be formatted.');
  return value.toLocaleString('en-GB');
}

const ONES_WORDS = Object.freeze([
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
]);

const TENS_WORDS = Object.freeze([
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
]);

function wordsBelowHundred(value) {
  if (value < 20) return ONES_WORDS[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones ? `${TENS_WORDS[tens]}-${ONES_WORDS[ones]}` : TENS_WORDS[tens];
}

function wordsBelowThousand(value) {
  if (value < 100) return wordsBelowHundred(value);
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  return remainder
    ? `${ONES_WORDS[hundreds]} hundred and ${wordsBelowHundred(remainder)}`
    : `${ONES_WORDS[hundreds]} hundred`;
}

/** UK-English number name for values used by four-digit models and totals. */
export function numberToWords(value) {
  assertWholeNumber(value, 'value', 19998);
  if (value < 1000) return wordsBelowThousand(value);

  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  const thousandsWords = thousands < 20
    ? ONES_WORDS[thousands]
    : wordsBelowHundred(thousands);

  if (!remainder) return `${thousandsWords} thousand`;
  const joiner = remainder < 100 ? ' and ' : ' ';
  return `${thousandsWords} thousand${joiner}${wordsBelowThousand(remainder)}`;
}

export function canonicalPlaceCounts(value) {
  assertWholeNumber(value);
  return freezeRecord({
    thousands: Math.floor(value / 1000),
    hundreds: Math.floor(value / 100) % 10,
    tens: Math.floor(value / 10) % 10,
    ones: value % 10,
  });
}

export function normalisePlaceCounts(counts = {}) {
  const unknownKeys = Object.keys(counts).filter((key) => !PLACE_BY_KEY.has(key));
  if (unknownKeys.length) {
    throw new TypeError(`Unknown place-value column${unknownKeys.length === 1 ? '' : 's'}: ${unknownKeys.join(', ')}.`);
  }

  const sourceCounts = {};
  for (const { key } of PLACE_VALUE_PLACES) {
    const count = counts[key] ?? 0;
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new RangeError(`${key} must contain a non-negative whole-number count.`);
    }
    sourceCounts[key] = count;
  }

  const working = { ...sourceCounts };
  const exchanges = [];
  for (const place of ASCENDING_PLACES.slice(0, -1)) {
    const placeIndex = ASCENDING_PLACES.findIndex(({ key }) => key === place.key);
    const nextPlace = ASCENDING_PLACES[placeIndex + 1];
    const groups = Math.floor(working[place.key] / 10);
    if (!groups) continue;
    working[place.key] %= 10;
    working[nextPlace.key] += groups;
    exchanges.push(freezeRecord({
      from: place.key,
      to: nextPlace.key,
      groups,
      quantityMoved: groups * nextPlace.value,
    }));
  }

  const value = PLACE_VALUE_PLACES.reduce(
    (total, place) => total + sourceCounts[place.key] * place.value,
    0,
  );
  assertWholeNumber(value, 'The represented value');

  return freezeRecord({
    value,
    sourceCounts: freezeRecord(sourceCounts),
    canonicalCounts: canonicalPlaceCounts(value),
    exchanges: Object.freeze(exchanges),
  });
}

function inputToNormalised(input) {
  if (Number.isSafeInteger(input)) {
    assertWholeNumber(input);
    const counts = canonicalPlaceCounts(input);
    return freezeRecord({
      value: input,
      sourceCounts: counts,
      canonicalCounts: counts,
      exchanges: Object.freeze([]),
    });
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('A place-value model needs a whole number or a place-count object.');
  }
  return normalisePlaceCounts(input);
}

/**
 * Derive every linked representation from one number or non-canonical set of
 * place counts. Zero placeholders remain explicit in `placeValueChart`.
 */
export function createLinkedRepresentations(input) {
  const normalised = inputToNormalised(input);
  const { value, sourceCounts, canonicalCounts, exchanges } = normalised;
  const placeValueChart = PLACE_VALUE_PLACES.map((place) => freezeRecord({
    place: place.key,
    label: place.label,
    digit: canonicalCounts[place.key],
    sourceCount: sourceCounts[place.key],
    unitValue: place.value,
    representedValue: canonicalCounts[place.key] * place.value,
  }));
  const allPlaceTerms = placeValueChart.map(({ representedValue }) => representedValue);
  const expandedTerms = allPlaceTerms.filter(Boolean);

  return freezeRecord({
    value,
    numeral: formatMathsNumber(value),
    numberName: numberToWords(value),
    spokenLanguage: numberToWords(value),
    sourceCounts,
    digits: canonicalCounts,
    placeValueChart: Object.freeze(placeValueChart),
    manipulatives: Object.freeze(placeValueChart.map((column) => freezeRecord({
      place: column.place,
      unitValue: column.unitValue,
      count: column.digit,
    }))),
    counters: Object.freeze(placeValueChart.map((column) => freezeRecord({
      place: column.place,
      label: column.label,
      count: column.digit,
    }))),
    allPlaceTerms: Object.freeze(allPlaceTerms),
    expandedTerms: Object.freeze(expandedTerms),
    expandedForm: expandedTerms.length
      ? expandedTerms.map(formatMathsNumber).join(' + ')
      : '0',
    standardPartition: freezeRecord({ ...canonicalCounts }),
    normalisationExchanges: exchanges,
  });
}

/** Apply a counter change and return a freshly synchronised model. */
export function changePlaceCount(input, place, change) {
  if (!PLACE_BY_KEY.has(place)) throw new TypeError(`Unknown place-value column: ${place}.`);
  if (!Number.isSafeInteger(change)) throw new TypeError('A place-value change must be a whole number.');
  const linked = createLinkedRepresentations(input);
  const nextCounts = { ...linked.sourceCounts, [place]: linked.sourceCounts[place] + change };
  if (nextCounts[place] < 0) throw new RangeError(`The ${place} column cannot contain fewer than zero counters.`);
  return createLinkedRepresentations(nextCounts);
}

/**
 * Exchange between adjacent columns while preserving the represented value.
 * `groups` is the number of larger-place units being exchanged.
 */
export function exchangePlaceValue(input, from, to, groups = 1) {
  if (!PLACE_BY_KEY.has(from) || !PLACE_BY_KEY.has(to)) {
    throw new TypeError('Both exchange columns must be recognised place-value columns.');
  }
  if (!Number.isSafeInteger(groups) || groups < 1) {
    throw new RangeError('Exchange groups must be a positive whole number.');
  }
  const fromPlace = PLACE_BY_KEY.get(from);
  const toPlace = PLACE_BY_KEY.get(to);
  const ratio = fromPlace.value / toPlace.value;
  if (ratio !== 10 && ratio !== 0.1) {
    throw new RangeError('Only adjacent place-value columns can be exchanged directly.');
  }

  const linked = createLinkedRepresentations(input);
  const counts = { ...linked.sourceCounts };
  if (ratio === 10) {
    if (counts[from] < groups) throw new RangeError(`There are not enough ${from} to exchange.`);
    counts[from] -= groups;
    counts[to] += groups * 10;
  } else {
    const needed = groups * 10;
    if (counts[from] < needed) throw new RangeError(`Ten ${from} are needed for each exchange.`);
    counts[from] -= needed;
    counts[to] += groups;
  }

  return createLinkedRepresentations(counts);
}

/** Compare by the first different place, matching the language taught in Year 4. */
export function comparePlaceValue(a, b) {
  assertWholeNumber(a, 'First number');
  assertWholeNumber(b, 'Second number');
  const left = canonicalPlaceCounts(a);
  const right = canonicalPlaceCounts(b);
  const deciding = PLACE_VALUE_PLACES.find(({ key }) => left[key] !== right[key]) ?? null;
  return freezeRecord({
    left: a,
    right: b,
    relation: a === b ? '=' : a > b ? '>' : '<',
    decidingPlace: deciding?.key ?? null,
    decidingPlaceLabel: deciding?.label ?? null,
    leftDigit: deciding ? left[deciding.key] : null,
    rightDigit: deciding ? right[deciding.key] : null,
  });
}
