/** Functional, deterministic 32-bit random state for reproducible local tasks. */

function hashString(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
export function seedToUint32(seed) {
  if (typeof seed === 'number') {
    if (!Number.isFinite(seed)) throw new TypeError('A numeric seed must be finite.');
    return Math.trunc(seed) >>> 0;
  }
  if (typeof seed === 'string') return hashString(seed);
  if (typeof seed === 'bigint') return Number(BigInt.asUintN(32, seed));
  throw new TypeError('A seed must be a string, number or bigint.');
}

export function createRandomState(seed) {
  return Object.freeze({ seed: seedToUint32(seed), state: seedToUint32(seed), draws: 0 });
}

/** Mulberry32 expressed as a state transition rather than hidden mutation. */
export function nextRandom(randomState) {
  if (!randomState || !Number.isInteger(randomState.state)) {
    throw new TypeError('A valid random state is required.');
  }
  const state = (randomState.state + 0x6D2B79F5) >>> 0;
  let valueBits = state;
  valueBits = Math.imul(valueBits ^ (valueBits >>> 15), valueBits | 1);
  valueBits ^= valueBits + Math.imul(valueBits ^ (valueBits >>> 7), valueBits | 61);
  const value = ((valueBits ^ (valueBits >>> 14)) >>> 0) / 4294967296;
  return Object.freeze({
    value,
    randomState: Object.freeze({
      seed: randomState.seed >>> 0,
      state,
      draws: (randomState.draws ?? 0) + 1,
    }),
  });
}

export function randomInteger(randomState, minimum, maximum) {
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || maximum < minimum) {
    throw new RangeError('Random integer bounds must be whole numbers with maximum at least minimum.');
  }
  const next = nextRandom(randomState);
  return Object.freeze({
    value: minimum + Math.floor(next.value * (maximum - minimum + 1)),
    randomState: next.randomState,
  });
}

export function randomChoice(randomState, choices) {
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new RangeError('Random choice needs at least one option.');
  }
  const selected = randomInteger(randomState, 0, choices.length - 1);
  return Object.freeze({ value: choices[selected.value], randomState: selected.randomState });
}

export function shuffleDeterministically(randomState, values) {
  if (!Array.isArray(values)) throw new TypeError('Only an array can be shuffled.');
  const result = [...values];
  let state = randomState;
  for (let index = result.length - 1; index > 0; index -= 1) {
    const selected = randomInteger(state, 0, index);
    state = selected.randomState;
    [result[index], result[selected.value]] = [result[selected.value], result[index]];
  }
  return Object.freeze({ value: Object.freeze(result), randomState: state });
}
