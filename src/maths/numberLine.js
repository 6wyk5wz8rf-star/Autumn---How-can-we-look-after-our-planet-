const DEFAULT_EPSILON = 1e-9;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function assertEndpoints(start, end) {
  if (!isFiniteNumber(start) || !isFiniteNumber(end) || end <= start) {
    throw new RangeError('A number line needs finite endpoints with the end greater than the start.');
  }
}

function nearlyEqual(left, right, epsilon = DEFAULT_EPSILON) {
  return Math.abs(left - right) <= epsilon;
}

/** Create ticks whose rendered ratios are mathematically tied to their values. */
export function createNumberLine({ start, end, interval, maxTicks = 101 }) {
  assertEndpoints(start, end);
  if (!isFiniteNumber(interval) || interval <= 0) {
    throw new RangeError('A number-line interval must be a positive finite number.');
  }
  const span = end - start;
  const intervalCount = span / interval;
  if (!nearlyEqual(intervalCount, Math.round(intervalCount))) {
    throw new RangeError('The interval must divide the number-line span exactly.');
  }
  if (Math.round(intervalCount) + 1 > maxTicks) {
    throw new RangeError(`This scale would create more than ${maxTicks} ticks.`);
  }
  const ticks = Array.from({ length: Math.round(intervalCount) + 1 }, (_, index) => Object.freeze({
    value: start + index * interval,
    ratio: index / Math.round(intervalCount),
    labelled: true,
  }));
  return Object.freeze({ start, end, span, interval, ticks: Object.freeze(ticks) });
}

export function positionOnNumberLine(value, start, end, { clamp = false } = {}) {
  assertEndpoints(start, end);
  if (!isFiniteNumber(value)) throw new TypeError('A number-line value must be finite.');
  const ratio = (value - start) / (end - start);
  if (!clamp && (ratio < 0 || ratio > 1)) {
    throw new RangeError('The value lies outside the number-line endpoints.');
  }
  return clamp ? Math.min(1, Math.max(0, ratio)) : ratio;
}

export function valueAtNumberLinePosition(ratio, start, end) {
  assertEndpoints(start, end);
  if (!isFiniteNumber(ratio) || ratio < 0 || ratio > 1) {
    throw new RangeError('A number-line position must be from 0 to 1.');
  }
  return start + ratio * (end - start);
}

function normaliseTick(tick, index, count) {
  if (isFiniteNumber(tick)) {
    return { value: tick, ratio: count === 1 ? 0 : index / (count - 1), labelled: true };
  }
  if (!tick || typeof tick !== 'object') return null;
  const ratio = tick.ratio ?? tick.position;
  return {
    value: tick.value ?? null,
    ratio,
    labelled: tick.labelled ?? tick.value != null,
  };
}

/**
 * Validate both numeric labels and visual positions. This rejects decorative
 * equal-looking marks when their values imply a different scale.
 */
export function validateNumberLine({ start, end, ticks, interval = null }, { epsilon = DEFAULT_EPSILON } = {}) {
  const errors = [];
  try {
    assertEndpoints(start, end);
  } catch (error) {
    errors.push(error.message);
  }
  if (!Array.isArray(ticks) || ticks.length < 2) {
    errors.push('A number line needs at least two ticks.');
  }
  if (errors.length) return Object.freeze({ valid: false, errors: Object.freeze(errors), ticks: Object.freeze([]) });

  const normalised = ticks.map((tick, index) => normaliseTick(tick, index, ticks.length));
  if (normalised.some((tick) => !tick || !isFiniteNumber(tick.ratio))) {
    errors.push('Every tick needs a finite visual ratio.');
  }
  if (normalised.some((tick) => tick && (tick.ratio < 0 || tick.ratio > 1))) {
    errors.push('Tick ratios must lie from 0 to 1.');
  }
  if (normalised.some((tick) => !tick)) {
    return Object.freeze({ valid: false, errors: Object.freeze([...new Set(errors)]), ticks: Object.freeze([]) });
  }
  if (!nearlyEqual(normalised[0].ratio, 0, epsilon) || !nearlyEqual(normalised.at(-1).ratio, 1, epsilon)) {
    errors.push('The first and last ticks must sit at the two endpoints.');
  }
  for (let index = 1; index < normalised.length; index += 1) {
    if (normalised[index].ratio <= normalised[index - 1].ratio) {
      errors.push('Tick positions must increase from left to right.');
      break;
    }
  }

  const labelledTicks = normalised.filter(({ value }) => value !== null);
  if (labelledTicks.length < 2) errors.push('At least two ticks need known values to establish the scale.');
  for (const tick of labelledTicks) {
    if (!isFiniteNumber(tick.value)) {
      errors.push('Every visible tick value must be finite.');
      continue;
    }
    if (tick.value < start || tick.value > end) {
      errors.push(`Tick value ${tick.value} lies outside the endpoints.`);
      continue;
    }
    const expectedRatio = (tick.value - start) / (end - start);
    if (!nearlyEqual(tick.ratio, expectedRatio, epsilon)) {
      errors.push(`Tick value ${tick.value} is not positioned at its true mathematical scale.`);
    }
  }

  const sortedKnown = [...labelledTicks].sort((a, b) => a.ratio - b.ratio);
  for (let index = 1; index < sortedKnown.length; index += 1) {
    if (sortedKnown[index].value <= sortedKnown[index - 1].value) {
      errors.push('Tick values must increase with their positions.');
      break;
    }
  }

  if (interval !== null) {
    if (!isFiniteNumber(interval) || interval <= 0) {
      errors.push('A declared interval must be a positive finite number.');
    } else {
      const spanSteps = (end - start) / interval;
      if (!nearlyEqual(spanSteps, Math.round(spanSteps), epsilon)) {
        errors.push('The declared interval must divide the complete span exactly.');
      }
      for (const { value } of labelledTicks) {
        const steps = (value - start) / interval;
        if (!nearlyEqual(steps, Math.round(steps), epsilon)) {
          errors.push(`Tick value ${value} does not follow the declared interval of ${interval}.`);
        }
      }
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...new Set(errors)]),
    start,
    end,
    span: end - start,
    interval,
    ticks: Object.freeze(normalised.map((tick) => Object.freeze({ ...tick }))),
  });
}

/** Assess a tap/drag estimate in value units, independent of screen width. */
export function validateNumberLinePlacement({ value, actualRatio, start, end, tolerance }) {
  assertEndpoints(start, end);
  if (!isFiniteNumber(value) || value < start || value > end) {
    throw new RangeError('The target value must lie on the number line.');
  }
  if (!isFiniteNumber(actualRatio) || actualRatio < 0 || actualRatio > 1) {
    throw new RangeError('The placed position must be from 0 to 1.');
  }
  if (!isFiniteNumber(tolerance) || tolerance < 0) {
    throw new RangeError('Placement tolerance must be a non-negative value distance.');
  }
  const expectedRatio = positionOnNumberLine(value, start, end);
  const representedValue = valueAtNumberLinePosition(actualRatio, start, end);
  const error = Math.abs(representedValue - value);
  return Object.freeze({
    correct: error <= tolerance,
    targetValue: value,
    representedValue,
    expectedRatio,
    actualRatio,
    error,
    tolerance,
    direction: nearlyEqual(error, 0) ? 'exact' : representedValue < value ? 'too-low' : 'too-high',
  });
}
