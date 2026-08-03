/** Strict, canonical Roman numerals for the Year 4 range 1–100. */

export const ROMAN_SYMBOL_VALUES = Object.freeze({ I: 1, V: 5, X: 10, L: 50, C: 100 });
const ALLOWED_SUBTRACTIVE_PAIRS = new Set(['IV', 'IX', 'XL', 'XC']);
const ROMAN_TOKENS = Object.freeze([
  ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10],
  ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
]);

function assertArabicValue(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new RangeError('Roman numerals in Number Expedition represent whole numbers from 1 to 100.');
  }
}
export function arabicToRoman(value) {
  assertArabicValue(value);
  let remainder = value;
  let numeral = '';
  for (const [token, tokenValue] of ROMAN_TOKENS) {
    while (remainder >= tokenValue) {
      numeral += token;
      remainder -= tokenValue;
    }
  }
  return numeral;
}

function looseSubtractiveValue(numeral) {
  let value = 0;
  for (let index = 0; index < numeral.length; index += 1) {
    const current = ROMAN_SYMBOL_VALUES[numeral[index]];
    const next = ROMAN_SYMBOL_VALUES[numeral[index + 1]] ?? 0;
    value += current < next ? -current : current;
  }
  return value;
}

function additiveValue(numeral) {
  return [...numeral].reduce((total, symbol) => total + ROMAN_SYMBOL_VALUES[symbol], 0);
}

function diagnose(numeral) {
  const issues = [];
  if (/V{2,}|L{2,}/.test(numeral)) issues.push('five-symbol-repeated');
  if (/I{4,}|X{4,}|C{2,}/.test(numeral)) issues.push('too-many-repeats');
  for (let index = 0; index < numeral.length - 1; index += 1) {
    const pair = numeral.slice(index, index + 2);
    const left = ROMAN_SYMBOL_VALUES[pair[0]];
    const right = ROMAN_SYMBOL_VALUES[pair[1]];
    if (left < right && !ALLOWED_SUBTRACTIVE_PAIRS.has(pair)) {
      issues.push('invalid-subtractive-pair');
      break;
    }
  }
  if (!issues.length) issues.push('non-canonical-order');
  return [...new Set(issues)];
}

/**
 * Parse only canonical forms. Whitespace and letter case are input concerns;
 * the mathematical syntax is validated against the unique canonical form.
 */
export function parseRomanNumeral(input) {
  if (typeof input !== 'string') {
    return Object.freeze({ valid: false, value: null, canonical: null, normalised: '', issues: Object.freeze(['not-text']) });
  }
  const normalised = input.trim().toUpperCase();
  if (!normalised) {
    return Object.freeze({ valid: false, value: null, canonical: null, normalised, issues: Object.freeze(['empty']) });
  }
  if (!/^[IVXLC]+$/.test(normalised)) {
    return Object.freeze({ valid: false, value: null, canonical: null, normalised, issues: Object.freeze(['invalid-symbol']) });
  }

  const value = looseSubtractiveValue(normalised);
  const inRange = value >= 1 && value <= 100;
  const canonical = inRange ? arabicToRoman(value) : null;
  const valid = canonical === normalised;
  return Object.freeze({
    valid,
    value: valid ? value : null,
    inferredValue: inRange ? value : null,
    canonical,
    normalised,
    issues: Object.freeze(valid ? [] : inRange ? diagnose(normalised) : ['out-of-range']),
  });
}

export function romanToArabic(input) {
  const parsed = parseRomanNumeral(input);
  if (!parsed.valid) {
    throw new SyntaxError(`“${parsed.normalised || String(input)}” is not a valid Roman numeral from I to C.`);
  }
  return parsed.value;
}

/**
 * Suggest an explicit repair without pretending the child's intent is known.
 * With no stated intended value, the primary suggestion follows the marks as a
 * loose subtractive expression; a distinct additive reading is also retained.
 */
export function repairRomanNumeral(input, { intendedValue = null } = {}) {
  const parsed = parseRomanNumeral(input);
  if (parsed.valid) {
    return Object.freeze({
      repairable: true,
      changed: false,
      original: parsed.normalised,
      inferredValue: parsed.value,
      canonical: parsed.canonical,
      strategy: 'already-canonical',
      alternatives: Object.freeze([]),
      issues: parsed.issues,
    });
  }

  if (intendedValue !== null) {
    try {
      assertArabicValue(intendedValue);
      return Object.freeze({
        repairable: true,
        changed: parsed.normalised !== arabicToRoman(intendedValue),
        original: parsed.normalised,
        inferredValue: intendedValue,
        canonical: arabicToRoman(intendedValue),
        strategy: 'stated-intended-value',
        alternatives: Object.freeze([]),
        issues: parsed.issues,
      });
    } catch {
      return Object.freeze({
        repairable: false,
        changed: false,
        original: parsed.normalised,
        inferredValue: null,
        canonical: null,
        strategy: null,
        alternatives: Object.freeze([]),
        issues: Object.freeze([...parsed.issues, 'intended-value-out-of-range']),
      });
    }
  }

  if (!/^[IVXLC]+$/.test(parsed.normalised)) {
    return Object.freeze({
      repairable: false,
      changed: false,
      original: parsed.normalised,
      inferredValue: null,
      canonical: null,
      strategy: null,
      alternatives: Object.freeze([]),
      issues: parsed.issues,
    });
  }

  const inferredValue = looseSubtractiveValue(parsed.normalised);
  if (inferredValue < 1 || inferredValue > 100) {
    return Object.freeze({
      repairable: false,
      changed: false,
      original: parsed.normalised,
      inferredValue: null,
      canonical: null,
      strategy: null,
      alternatives: Object.freeze([]),
      issues: parsed.issues,
    });
  }

  const additive = additiveValue(parsed.normalised);
  const alternatives = [];
  if (additive !== inferredValue && additive <= 100) {
    alternatives.push(Object.freeze({
      value: additive,
      canonical: arabicToRoman(additive),
      strategy: 'additive-reading',
    }));
  }
  return Object.freeze({
    repairable: true,
    changed: true,
    original: parsed.normalised,
    inferredValue,
    canonical: arabicToRoman(inferredValue),
    strategy: 'subtractive-intent',
    alternatives: Object.freeze(alternatives),
    issues: parsed.issues,
  });
}
