function assertWhole(value, label) {
  if (!Number.isSafeInteger(value)) throw new TypeError(`${label} must be a whole number.`);
}

function equation(left, operator, right, result, role) {
  return Object.freeze({ left, operator, right, result, role });
}

/** A complete addition/subtraction fact family with named mathematical roles. */
export function createInverseFamily(firstAddend, secondAddend) {
  assertWhole(firstAddend, 'The first addend');
  assertWhole(secondAddend, 'The second addend');
  if (firstAddend < 0 || secondAddend < 0) throw new RangeError('Fact-family addends must be non-negative.');
  const total = firstAddend + secondAddend;
  const equations = [
    equation(firstAddend, '+', secondAddend, total, 'combine'),
  ];
  if (firstAddend !== secondAddend) equations.push(equation(secondAddend, '+', firstAddend, total, 'combine-commuted'));
  equations.push(equation(total, '−', firstAddend, secondAddend, 'find-second-addend'));
  if (firstAddend !== secondAddend) {
    equations.push(equation(total, '−', secondAddend, firstAddend, 'find-first-addend'));
  }
  return Object.freeze({
    firstAddend,
    secondAddend,
    total,
    equations: Object.freeze(equations),
    roles: Object.freeze({
      addends: Object.freeze([firstAddend, secondAddend]),
      total,
      minuend: total,
      subtrahends: Object.freeze([firstAddend, secondAddend]),
      differences: Object.freeze([secondAddend, firstAddend]),
    }),
  });
}

/** Solve and name the one missing role in an addition or subtraction equation. */
export function solveMissingNumber({ left, operator, right, result }) {
  const values = { left, right, result };
  const missing = Object.entries(values).filter(([, value]) => value === null || value === undefined);
  if (missing.length !== 1) throw new RangeError('A missing-number equation must contain exactly one missing value.');
  for (const [name, value] of Object.entries(values)) {
    if (value !== null && value !== undefined) assertWhole(value, name);
  }
  if (!['+', '−', '-'].includes(operator)) throw new TypeError('The operation must be addition or subtraction.');

  const missingPosition = missing[0][0];
  let value;
  let role;
  if (operator === '+') {
    if (missingPosition === 'result') {
      value = left + right;
      role = 'total';
    } else {
      value = result - (missingPosition === 'left' ? right : left);
      role = 'addend';
    }
  } else if (missingPosition === 'left') {
    value = result + right;
    role = 'minuend';
  } else if (missingPosition === 'right') {
    value = left - result;
    role = 'subtrahend';
  } else {
    value = left - right;
    role = 'difference';
  }
  if (!Number.isSafeInteger(value)) throw new RangeError('The equation does not produce a whole-number solution.');

  const completed = {
    left: missingPosition === 'left' ? value : left,
    operator: operator === '-' ? '−' : operator,
    right: missingPosition === 'right' ? value : right,
    result: missingPosition === 'result' ? value : result,
  };
  const arithmeticallyValid = completed.operator === '+'
    ? completed.left + completed.right === completed.result
    : completed.left - completed.right === completed.result;
  if (!arithmeticallyValid) throw new Error('The completed equation failed its inverse check.');

  return Object.freeze({
    missingPosition,
    role,
    value,
    completed: Object.freeze(completed),
    inverseOperation: completed.operator === '+' ? '−' : '+',
  });
}
