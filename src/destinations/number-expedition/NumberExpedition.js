import { escapeAttr, escapeHTML } from '../../utils/dom.js';
import {
  NUMBER_REGIONS,
  NUMBER_TOOLS,
  getNumberTool,
} from '../../data/numberExpedition.js';
import {
  PLACE_VALUE_PLACES,
  comparePlaceValue,
  createLinkedRepresentations,
  exchangePlaceValue,
  formatMathsNumber,
  numberToWords,
} from '../../maths/placeValue.js';
import { validatePartition } from '../../maths/partitions.js';
import { getRoundingBounds } from '../../maths/rounding.js';
import { arabicToRoman, parseRomanNumeral, repairRomanNumeral } from '../../maths/romanNumerals.js';
import { traceAddition, traceSubtraction } from '../../maths/operations.js';
import { generateNumberTask } from '../../maths/taskGenerator.js';

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
const integer = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback;
const clone = (value) => JSON.parse(JSON.stringify(value));

const ACTIVITY_STARTS = Object.freeze({
  'build-four-digit-number': { value: 4382 },
  'ten-hundreds-thousand': { value: 1000, sourceCounts: { thousands: 0, hundreds: 10, tens: 0, ones: 0 } },
  'break-number-apart': { value: 4052 },
  'partition-another-way': { value: 4362, partitionTerms: [3000, 1300, 50, 12] },
  'step-more-less': { value: 2990, step: 10 },
  'which-number-greater': { left: 6382, right: 6319 },
  'place-on-line': { lower: 4000, upper: 5000, target: 4380, position: 4380 },
  'estimate-position': { lower: 2500, upper: 3500, target: 3175, position: 3000 },
  'nearest-ten': { value: 4385, roundingUnit: 10 },
  'nearest-hundred': { value: 4052, roundingUnit: 100 },
  'nearest-thousand': { value: 9500, roundingUnit: 1000 },
  'estimate-before-calculate': { left: 2948, right: 3026, operation: 'addition' },
  'travel-through-zero': { start: 4, end: -3 },
  'temperature-difference': { start: -6, end: 5 },
  'roman-to-fifty': { romanValue: 47, romanInput: 'XLVII', romanLimit: 50 },
  'roman-to-hundred': { romanValue: 94, romanInput: 'XCIV', romanLimit: 100 },
  'addition-no-exchange': { left: 2341, right: 3126 },
  'addition-one-exchange': { left: 2437, right: 3125 },
  'addition-several-exchanges': { left: 3687, right: 4756 },
  'five-digit-total': { left: 6847, right: 5296 },
  'subtraction-no-exchange': { left: 7865, right: 2431 },
  'subtraction-one-exchange': { left: 6752, right: 2438 },
  'exchange-across-zero': { left: 4002, right: 1786 },
  'choose-efficient-method': { left: 5002, right: 4998, operation: 'subtraction' },
  'use-inverse': { left: 3482, right: 2156 },
  'solve-one-step': { left: 2648, right: 1735, operation: 'addition', problemSteps: 1 },
  'plan-two-step': { left: 6250, right: 1875, third: 950, operation: 'subtraction', problemSteps: 2 },
  'prove-disprove': { statementIndex: 0 },
});

const MODE_STARTS = Object.freeze({
  'place-value': { value: 4382 },
  partition: { value: 4362, partitionTerms: [4000, 300, 60, 2] },
  stepper: { value: 2990, step: 10 },
  compare: { left: 6382, right: 6319 },
  order: { orderValues: [4052, 4520, 4025, 4250] },
  'number-line': { lower: 4000, upper: 5000, target: 4380, position: 4380 },
  rounding: { value: 4385, roundingUnit: 10 },
  estimate: { left: 2948, right: 3026, operation: 'addition' },
  negative: { start: 4, end: -3 },
  roman: { romanValue: 47, romanInput: 'XLVII', romanLimit: 100 },
  addition: { left: 3687, right: 4756 },
  subtraction: { left: 4002, right: 1786 },
  strategy: { left: 5002, right: 4998, operation: 'subtraction' },
  inverse: { left: 3482, right: 2156 },
  problem: { left: 2648, right: 1735, third: 950, operation: 'addition', problemSteps: 1 },
  statement: { statementIndex: 0 },
  challenge: { challengeType: 'missing-number', left: 4382, right: 1250, hiddenPart: 'total' },
});

const STATEMENTS = Object.freeze([
  { text: 'Adding two four-digit numbers always gives a five-digit total.', classification: 'sometimes', examples: ['6,500 + 4,000 = 10,500', '2,100 + 3,200 = 5,300'], counterexample: '2,100 + 3,200 = 5,300' },
  { text: 'Subtracting 1,000 changes only the thousands digit.', classification: 'sometimes', examples: ['7,246 − 1,000 = 6,246'], counterexample: '1,000 − 1,000 = 0, where the zero placeholders matter.' },
  { text: 'A number rounded to the nearest 100 can become smaller.', classification: 'sometimes', examples: ['4,149 rounds to 4,100'], counterexample: '4,151 rounds to 4,200.' },
  { text: 'Ten hundreds have the same value as one thousand.', classification: 'always', examples: ['10 × 100 = 1,000'], counterexample: '' },
]);

export function defaultNumberState(tool, activity = null, saved = null) {
  const start = ACTIVITY_STARTS[activity?.id] || MODE_STARTS[tool.mode] || {};
  const state = {
    schemaVersion: 1,
    generatorSeed: `${activity?.id || tool.id}:1`,
    challengeNumber: 1,
    explanation: '',
    annotation: '',
    inverseMissingRole: 'total',
    inverseAnswer: 0,
    problemUnit: 'items',
    problemUnknown: 'the final amount',
    secondOperation: 'subtraction',
    strategyChoice: '',
    selectedClassification: '',
    roundingChoice: null,
    exampleEvidence: '',
    counterexampleEvidence: '',
    amendedStatement: '',
    challengePrompt: 'Explain how you know and show a check.',
    challengeStatement: 'Adding two four-digit numbers always makes a five-digit total.',
    challengeClassification: 'sometimes',
    childActions: [],
    boardStep: 0,
    labelsVisible: true,
    answerRevealed: false,
    ...clone(start),
    ...(saved && typeof saved === 'object' ? clone(saved) : {}),
    toolId: tool.id,
    mode: tool.mode,
    activityId: activity?.id || null,
  };
  if (!state.partitionTerms) state.partitionTerms = createLinkedRepresentations(clamp(state.value, 0, 9999)).allPlaceTerms;
  return state;
}

function placeValueModel(state) {
  const input = state.sourceCounts || clamp(integer(state.value), 0, 9999);
  try { return createLinkedRepresentations(input); } catch { return createLinkedRepresentations(clamp(integer(state.value), 0, 9999)); }
}

function spokenMathematics(state, tool) {
  const say = (value) => Number.isSafeInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 19998
    ? numberToWords(Number(value))
    : String(value);
  const left = clamp(integer(state.left), 0, 9999);
  const right = clamp(integer(state.right), 0, 9999);
  if (tool.mode === 'roman') {
    const value = clamp(integer(state.romanValue, 1), 1, state.romanLimit || 100);
    return `${say(value)} is ${arabicToRoman(value)} in Roman numerals.`;
  }
  if (tool.mode === 'addition') return `${say(left)} plus ${say(right)} equals ${say(left + right)}.`;
  if (tool.mode === 'subtraction' || tool.mode === 'strategy') return `${say(left)} minus ${say(right)} equals ${say(Math.max(0, left - right))}.`;
  if (tool.mode === 'inverse') return `${say(left)} plus ${say(right)} equals ${say(left + right)}. Subtraction reverses the addition.`;
  if (tool.mode === 'compare') return `${say(left)} compared with ${say(right)}.`;
  if (tool.mode === 'order') return `The numbers are ${(state.orderValues || []).map((value) => say(integer(value))).join(', ')}.`;
  if (tool.mode === 'number-line') return `A number line from ${say(integer(state.lower))} to ${say(integer(state.upper))}, with ${say(integer(state.position))} marked.`;
  if (tool.mode === 'negative') return `Travel from ${state.start} to ${state.end}, an interval of ${Math.abs(integer(state.end) - integer(state.start))}.`;
  if (tool.mode === 'estimate') return `${say(left)} ${state.operation === 'subtraction' ? 'minus' : 'plus'} ${say(right)}.`;
  if (tool.mode === 'problem' || tool.mode === 'challenge') return state.generatedPrompt || `Use ${say(left)} and ${say(right)} to model the unknown.`;
  if (tool.mode === 'statement') return state.generatedTask?.values?.statement || STATEMENTS[integer(state.statementIndex) % STATEMENTS.length].text;
  return placeValueModel(state).spokenLanguage;
}

function renderCounters(count, place) {
  const visible = Math.min(count, 10);
  return `<span class="counter-cluster" aria-label="${count} ${place}">${Array.from({ length: visible }, () => '<i></i>').join('')}${count > visible ? `<b>×${count}</b>` : ''}</span>`;
}

function renderPlaceValue(state, { board = false } = {}) {
  const model = placeValueModel(state);
  const pairs = [
    ['thousands', 'hundreds', 'thousand', 'hundreds'],
    ['hundreds', 'tens', 'hundred', 'tens'],
    ['tens', 'ones', 'ten', 'ones'],
  ];
  return `<div class="linked-number" data-maths-model="place-value">
    <div class="number-hero"><strong>${model.numeral}</strong>${state.labelsVisible ? `<span>${escapeHTML(model.numberName)}</span>` : ''}</div>
    ${board ? '' : `<label class="number-direct-entry no-print"><span>Build a number directly</span><input type="number" min="0" max="9999" value="${model.value}" data-number-field="value" inputmode="numeric" /></label>`}
    <div class="place-grid" role="table" aria-label="Place-value chart for ${escapeAttr(model.numberName)}">
      ${model.placeValueChart.map((column) => `<div class="place-column" role="columnheader">
        <span>${column.label}</span><strong>${column.digit}</strong>
        ${renderCounters(column.sourceCount, column.label.toLowerCase())}
        ${board ? '' : `<div class="place-buttons no-print"><button type="button" data-number-action="place-delta" data-place="${column.place}" data-delta="-1" aria-label="Remove one ${column.label.toLowerCase()}">−</button><button type="button" data-number-action="place-delta" data-place="${column.place}" data-delta="1" aria-label="Add one ${column.label.toLowerCase()}">+</button></div>`}
      </div>`).join('')}
    </div>
    ${board ? '' : `<div class="exchange-controls no-print" aria-label="Exchange without changing the value">${pairs.map(([larger, smaller, largerLabel, smallerLabel]) => `<span><button type="button" data-number-action="exchange" data-from="${larger}" data-to="${smaller}" ${model.sourceCounts[larger] < 1 ? 'disabled' : ''}>1 ${largerLabel} → 10 ${smallerLabel}</button><button type="button" data-number-action="exchange" data-from="${smaller}" data-to="${larger}" ${model.sourceCounts[smaller] < 10 ? 'disabled' : ''}>10 ${smallerLabel} → 1 ${largerLabel}</button></span>`).join('')}</div>`}
    ${state.labelsVisible ? `<div class="representation-strip"><span>${escapeHTML(model.expandedForm)}</span><span>${model.placeValueChart.map((column) => `${column.digit} ${column.label.toLowerCase()}`).join(' · ')}</span></div>` : ''}
  </div>`;
}

function renderPartition(state) {
  const target = clamp(integer(state.value), 0, 9999);
  const terms = (state.partitionTerms || []).map((value) => Math.max(0, integer(value)));
  const check = validatePartition(target, terms);
  return `<div class="partition-workbench">
    <div class="number-hero"><span>Make</span><strong>${formatMathsNumber(target)}</strong></div>
    <div class="partition-equation" aria-label="Partition expression">${terms.map((term, index) => `<label><span class="sr-only">Part ${index + 1}</span><input type="number" min="0" max="9999" step="1" value="${term}" data-number-array="partitionTerms" data-index="${index}" /></label>${index < terms.length - 1 ? '<b>+</b>' : ''}`).join('')}<b>=</b><strong>${formatMathsNumber(terms.reduce((sum, term) => sum + term, 0))}</strong></div>
    <p class="maths-feedback" data-tone="${check.equivalent ? 'success' : 'inspect'}">${escapeHTML(check.feedback)}</p>
    ${renderPlaceValue({ ...state, sourceCounts: null, value: target })}
  </div>`;
}

function numberLineSvg(lower, upper, value, { markerLabel = null, vertical = false } = {}) {
  const safeLower = integer(lower);
  const safeUpper = Math.max(safeLower + 1, integer(upper, safeLower + 1));
  const safeValue = clamp(integer(value, safeLower), safeLower, safeUpper);
  const ratio = (safeValue - safeLower) / (safeUpper - safeLower);
  const x = 70 + ratio * 860;
  const ticks = Array.from({ length: 11 }, (_, index) => ({ x: 70 + index * 86, value: safeLower + ((safeUpper - safeLower) * index / 10) }));
  return `<svg class="scaled-number-line${vertical ? ' vertical-line' : ''}" viewBox="0 0 1000 180" role="img" aria-label="Number line from ${safeLower} to ${safeUpper}; marker at ${safeValue}" data-number-line data-lower="${safeLower}" data-upper="${safeUpper}">
    <line x1="70" y1="92" x2="930" y2="92" />
    ${ticks.map((tick, index) => `<line x1="${tick.x}" y1="${index % 5 === 0 ? 72 : 80}" x2="${tick.x}" y2="108" />${[0, 5, 10].includes(index) ? `<text x="${tick.x}" y="142">${formatMathsNumber(Math.round(tick.value))}</text>` : ''}`).join('')}
    <path class="line-marker" d="M${x} 28l-13 26h26z"/><line class="line-marker" x1="${x}" y1="52" x2="${x}" y2="92"/>
    <text class="marker-label" x="${x}" y="20">${escapeHTML(markerLabel || formatMathsNumber(safeValue))}</text>
  </svg>`;
}

function renderMagnitude(state, mode) {
  if (mode === 'stepper') {
    const value = clamp(integer(state.value), 0, 10000);
    const model = value < 10000 ? createLinkedRepresentations(value) : null;
    const representation = model ? renderPlaceValue({ ...state, value }) : `<div class="linked-number boundary-number"><div class="number-hero"><strong>10,000</strong><span>ten thousand</span></div><div class="place-grid" role="table" aria-label="10 thousands, 0 hundreds, 0 tens and 0 ones">${[['Thousands',10],['Hundreds',0],['Tens',0],['Ones',0]].map(([label, count]) => `<div class="place-column"><span>${label}</span><strong>${count}</strong>${renderCounters(count, label.toLowerCase())}</div>`).join('')}</div><div class="representation-strip"><span>10 × 1,000</span><span>10 thousands · 0 hundreds · 0 tens · 0 ones</span></div></div>`;
    const description = model
      ? model.placeValueChart.map((column) => `${column.digit} ${column.label.toLowerCase()}`).join(', ')
      : '10 thousands, 0 hundreds, 0 tens and 0 ones';
    return `<div class="magnitude-workbench">${representation}<div class="step-controls no-print">${[-1000, -100, -10, 10, 100, 1000].map((delta) => `<button type="button" data-number-action="step" data-delta="${delta}">${delta > 0 ? '+' : '−'}${formatMathsNumber(Math.abs(delta))}</button>`).join('')}</div><p class="maths-feedback">You now have ${description}. Inspect which columns changed at the boundary.</p></div>`;
  }
  if (mode === 'compare') {
    const left = clamp(integer(state.left), 0, 9999); const right = clamp(integer(state.right), 0, 9999);
    const comparison = comparePlaceValue(left, right);
    return `<div class="compare-workbench"><div class="compare-numerals"><label>First number<input type="number" min="0" max="9999" value="${left}" data-number-field="left" /></label><strong>${comparison.relation}</strong><label>Second number<input type="number" min="0" max="9999" value="${right}" data-number-field="right" /></label></div><div class="paired-models">${renderPlaceValue({ ...state, value: left })}${renderPlaceValue({ ...state, value: right })}</div><p class="maths-feedback">${comparison.decidingPlaceLabel ? `Both numbers match until the ${comparison.decidingPlaceLabel.toLowerCase()} column. ${comparison.leftDigit} ${comparison.relation} ${comparison.rightDigit}, so that column decides.` : 'Every place-value column matches, so the numbers are equal.'}</p></div>`;
  }
  if (mode === 'order') {
    const values = state.orderValues || [];
    const sorted = [...values].sort((a, b) => a - b);
    return `<div class="order-workbench"><p class="number-card-row">${values.map((value, index) => `<label class="number-card"><span>Number ${index + 1}</span><input type="number" min="0" max="9999" value="${value}" data-number-array="orderValues" data-index="${index}" /></label>`).join('')}</p><div class="ordered-result"><span>Least</span>${sorted.map((value) => `<strong>${formatMathsNumber(value)}</strong>`).join('<b>‹</b>')}<span>Greatest</span></div><p class="maths-feedback">Compare thousands first. Move to hundreds, tens or ones only when the earlier columns match.</p></div>`;
  }
  const lower = integer(state.lower, 0); const upper = Math.max(lower + 10, integer(state.upper, lower + 1000)); const position = clamp(integer(state.position, state.target), lower, upper);
  return `<div class="line-workbench">${numberLineSvg(lower, upper, position, { markerLabel: state.answerRevealed ? formatMathsNumber(state.target) : '?' })}<label class="line-slider no-print"><span>Move the marker</span><input type="range" min="${lower}" max="${upper}" value="${position}" step="1" data-number-field="position" /></label><div class="line-inputs no-print"><label>Start<input type="number" value="${lower}" data-number-field="lower" /></label><label>End<input type="number" value="${upper}" data-number-field="upper" /></label><label>Target<input type="number" value="${integer(state.target)}" data-number-field="target" /></label></div><p class="maths-feedback">The marker is ${formatMathsNumber(position - lower)} from the start of an interval worth ${formatMathsNumber(upper - lower)}.</p></div>`;
}

function renderRounding(state, estimate = false) {
  if (estimate) {
    const left = clamp(integer(state.left), 0, 9999); const right = clamp(integer(state.right), 0, 9999); const addition = state.operation !== 'subtraction';
    const exact = addition ? left + right : Math.max(left, right) - Math.min(left, right);
    const estimateValue = addition ? Math.round(left / 1000) * 1000 + Math.round(right / 1000) * 1000 : Math.abs(Math.round(left / 1000) * 1000 - Math.round(right / 1000) * 1000);
    return `<div class="estimate-workbench"><div class="calculation-inputs no-print"><input aria-label="First value" type="number" min="0" max="9999" value="${left}" data-number-field="left"/><strong>${addition ? '+' : '−'}</strong><input aria-label="Second value" type="number" min="0" max="9999" value="${right}" data-number-field="right"/></div><div class="estimate-bridge"><div><span>Estimate</span><strong>about ${formatMathsNumber(estimateValue)}</strong></div><div><span>Exact</span><strong>${formatMathsNumber(exact)}</strong></div></div><p class="maths-feedback">The exact answer is ${formatMathsNumber(Math.abs(exact - estimateValue))} from the estimate. ${Math.abs(exact - estimateValue) <= 1000 ? 'That size of difference is reasonable for this estimate.' : 'Inspect the rounding choices before trusting the answer.'}</p></div>`;
  }
  const value = clamp(integer(state.value), 0, 9999); const unit = [10, 100, 1000].includes(integer(state.roundingUnit)) ? integer(state.roundingUnit) : 10;
  const bounds = getRoundingBounds(value, unit);
  const choice = Number(state.roundingChoice);
  const chosen = state.roundingChoice !== null
    && state.roundingChoice !== ''
    && Number.isFinite(choice)
    && [bounds.lower, bounds.upper].includes(choice);
  const correct = chosen && choice === bounds.rounded;
  const feedback = bounds.isExactMultiple
    ? `${formatMathsNumber(value)} is already a multiple of ${formatMathsNumber(unit)}, so it stays the same.`
    : !chosen
      ? 'Compare both distances, then choose the nearest multiple.'
      : correct
        ? `${formatMathsNumber(value)} is ${formatMathsNumber(Math.min(bounds.distanceToLower, bounds.distanceToUpper))} from ${formatMathsNumber(bounds.rounded)}, so it rounds ${bounds.direction}.`
        : `${formatMathsNumber(choice)} is farther away. Compare the two labelled distances and inspect the midpoint.`;
  return `<div class="rounding-workbench"><div class="rounding-controls no-print"><label>Number<input type="number" min="0" max="9999" value="${value}" data-number-field="value"/></label><div class="segmented" role="group" aria-label="Round to nearest"><button type="button" data-number-action="round-unit" data-value="10" aria-pressed="${unit === 10}">10</button><button type="button" data-number-action="round-unit" data-value="100" aria-pressed="${unit === 100}">100</button><button type="button" data-number-action="round-unit" data-value="1000" aria-pressed="${unit === 1000}">1,000</button></div></div>${numberLineSvg(bounds.lower, bounds.upper, value)}<div class="distance-readout"><span>${formatMathsNumber(bounds.lower)}<b>${formatMathsNumber(bounds.distanceToLower)} away</b></span><strong>midpoint ${formatMathsNumber(bounds.midpoint)}</strong><span>${formatMathsNumber(bounds.upper)}<b>${formatMathsNumber(bounds.distanceToUpper)} away</b></span></div>${bounds.isExactMultiple ? '' : `<div class="rounding-choice no-print" role="group" aria-label="Choose the nearest multiple"><button type="button" data-number-action="round-choice" data-value="${bounds.lower}" aria-pressed="${chosen && choice === bounds.lower}">${formatMathsNumber(bounds.lower)}</button><button type="button" data-number-action="round-choice" data-value="${bounds.upper}" aria-pressed="${chosen && choice === bounds.upper}">${formatMathsNumber(bounds.upper)}</button></div>`}<p class="maths-feedback" data-tone="${correct || bounds.isExactMultiple ? 'success' : 'inspect'}">${feedback}</p></div>`;
}

function renderBeyondZero(state, roman = false) {
  if (roman) {
    const value = clamp(integer(state.romanValue, 1), 1, state.romanLimit || 100); const input = String(state.romanInput || ''); const parsed = parseRomanNumeral(input); const repair = parsed.valid ? null : repairRomanNumeral(input, { intendedValue: value });
    const matchesValue = parsed.valid && parsed.value === value;
    const feedback = matchesValue
      ? `${input.toUpperCase()} is canonical and represents ${value}.`
      : parsed.valid
        ? `${input.toUpperCase()} is canonical for ${parsed.value}, not ${value}. Build ${arabicToRoman(value)}.`
        : repair?.repairable
          ? `${input.toUpperCase() || 'This numeral'} is not canonical. For ${value}, build ${arabicToRoman(value)}.`
          : 'Use I, V, X, L and C in a valid order.';
    return `<div class="roman-workbench"><div class="roman-pair"><label>Arabic value<input type="number" min="1" max="${state.romanLimit || 100}" value="${value}" data-number-field="romanValue"/></label><strong>⇄</strong><label>Roman numeral<input type="text" maxlength="12" value="${escapeAttr(input)}" data-number-text="romanInput" autocapitalize="characters"/></label></div><div class="roman-stones" aria-label="Roman numeral symbols">${['I','V','X','L','C'].map((symbol) => `<button type="button" data-number-action="roman-add" data-value="${symbol}">${symbol}<small>${{I:1,V:5,X:10,L:50,C:100}[symbol]}</small></button>`).join('')}</div><p class="roman-answer">${formatMathsNumber(value)} = <strong>${arabicToRoman(value)}</strong></p><p class="maths-feedback" data-tone="${matchesValue ? 'success' : 'inspect'}">${feedback}</p></div>`;
  }
  const start = clamp(integer(state.start), -50, 50); const end = clamp(integer(state.end), -50, 50); const lower = Math.min(-10, start, end) - 2; const upper = Math.max(10, start, end) + 2;
  return `<div class="negative-workbench">${numberLineSvg(lower, upper, start, { markerLabel: `start ${start}` })}${numberLineSvg(lower, upper, end, { markerLabel: `end ${end}` })}<div class="line-inputs no-print"><label>Start<input type="number" min="-50" max="50" value="${start}" data-number-field="start"/></label><label>End<input type="number" min="-50" max="50" value="${end}" data-number-field="end"/></label></div><div class="interval-readout"><strong>${Math.abs(end - start)}</strong><span>steps between ${start} and ${end}</span></div><p class="maths-feedback">${start !== end && ((start < 0) !== (end < 0)) ? `The route crosses zero. Travel ${Math.abs(start)} to zero, then ${Math.abs(end)} more.` : 'A negative value, a decrease and downward movement describe different ideas. Here we are measuring an interval.'}</p></div>`;
}

function columnDigits(value, places = 5) {
  const padded = String(value).padStart(places, ' ');
  return [...padded].map((digit) => `<span>${digit === ' ' ? '' : digit}</span>`).join('');
}

function renderQuantityTray(value, label) {
  if (value > 9999) return `<article class="quantity-tray"><span>${escapeHTML(label)}</span><strong>${formatMathsNumber(value)}</strong><p>10 thousands and ${formatMathsNumber(value - 10000)} more</p></article>`;
  const model = createLinkedRepresentations(value);
  return `<article class="quantity-tray"><span>${escapeHTML(label)}</span><strong>${model.numeral}</strong><div>${model.placeValueChart.map((column) => `<span aria-label="${column.digit} ${column.label.toLowerCase()}"><b>${column.label[0]}</b>${renderCounters(column.digit, column.label.toLowerCase())}</span>`).join('')}</div></article>`;
}

function renderCalculation(state, subtraction = false) {
  let left = clamp(integer(state.left), 0, 9999); let right = clamp(integer(state.right), 0, 9999);
  if (subtraction && right > left) [left, right] = [right, left];
  const trace = subtraction ? traceSubtraction(left, right) : traceAddition(left, right);
  const result = subtraction ? trace.difference : trace.total;
  const steps = subtraction ? trace.exchangeEvents : trace.steps.filter((step) => step.outgoingExchange);
  const visibleSteps = state.answerRevealed ? steps.length : Math.min(state.boardStep, steps.length);
  return `<div class="calculation-workbench"><div class="calculation-inputs no-print"><input aria-label="${subtraction ? 'Minuend' : 'First addend'}" type="number" min="0" max="9999" value="${left}" data-number-field="left"/><strong>${subtraction ? '−' : '+'}</strong><input aria-label="${subtraction ? 'Subtrahend' : 'Second addend'}" type="number" min="0" max="9999" value="${right}" data-number-field="right"/></div><div class="quantity-trays" aria-label="Concrete place-value quantities">${renderQuantityTray(left, subtraction ? 'Start quantity' : 'First addend')}${renderQuantityTray(right, subtraction ? 'Quantity removed' : 'Second addend')}${state.answerRevealed ? renderQuantityTray(result, subtraction ? 'Difference' : 'Combined total') : ''}</div><div class="column-calculation" role="table" aria-label="${escapeAttr(trace.formatted)}"><div class="place-headings"><span>10,000s</span><span>1,000s</span><span>100s</span><span>10s</span><span>1s</span></div><div class="column-row">${columnDigits(left)}</div><div class="column-row operator"><b>${subtraction ? '−' : '+'}</b>${columnDigits(right)}</div><div class="column-rule"></div><div class="column-row result">${state.answerRevealed ? columnDigits(result) : '<span></span><span></span><span>?</span><span>?</span><span>?</span>'}</div></div>${steps.length ? `<div class="calculation-step-controls no-print"><button type="button" data-number-action="board-previous" ${visibleSteps <= 0 ? 'disabled' : ''}>Previous exchange</button><span>${visibleSteps} of ${steps.length} exchange steps shown</span><button type="button" data-number-action="board-next" ${visibleSteps >= steps.length ? 'disabled' : ''}>Perform next exchange</button></div>` : '<p class="maths-feedback">No exchange is needed because every column already contains enough units.</p>'}<div class="exchange-trace">${steps.slice(0, visibleSteps).map((step, index) => `<p><b>${index + 1}</b>${escapeHTML(step.message || `${step.columnTotal} ${step.place} makes ${step.resultDigit} ${step.place}${step.outgoingExchange ? ` and exchanges 1 to ${step.exchangesTo}` : ''}.`)}</p>`).join('') || (steps.length ? '<p>Perform one exchange at a time and watch the correct place-value column.</p>' : '')}</div><p class="maths-feedback">${subtraction ? `${formatMathsNumber(left)} − ${formatMathsNumber(right)} has ${trace.exchangeCount} exchange ${trace.exchangeCount === 1 ? 'step' : 'steps'}${trace.crossesZero ? ', including a chain across zero' : ''}.` : `${formatMathsNumber(left)} + ${formatMathsNumber(right)} is a ${trace.category.replaceAll('-', ' ')} calculation.`}</p></div>`;
}

function efficientStrategy(left, right) {
  const difference = Math.abs(left - right);
  if (difference <= 20) return `Count on from ${formatMathsNumber(Math.min(left, right))}; the numbers are only ${difference} apart.`;
  if (right % 1000 === 0) return 'Use place value mentally; one addend or subtrahend is a whole number of thousands.';
  if (right % 100 === 99 || right % 1000 === 999) return `Subtract ${formatMathsNumber(right + 1)}, then adjust by 1.`;
  if (right % 50 === 0) return 'Partition the friendly hundreds and fifties mentally.';
  return 'A carefully aligned written method is a clear route here; estimate first.';
}

function renderReasoning(state, mode) {
  const left = clamp(integer(state.left), 0, 9999);
  const right = clamp(integer(state.right), 0, 9999);
  if (mode === 'strategy') {
    const suggested = efficientStrategy(left, right);
    return `<div class="strategy-workbench"><div class="calculation-inputs no-print"><input type="number" min="0" max="9999" value="${left}" data-number-field="left" aria-label="First number"/><strong>−</strong><input type="number" min="0" max="9999" value="${right}" data-number-field="right" aria-label="Second number"/></div><div class="strategy-routes"><button type="button" data-number-action="strategy-choice" data-value="mental" aria-pressed="${state.strategyChoice === 'mental'}"><span>Mental or counting-on route</span><strong>${escapeHTML(suggested)}</strong></button><button type="button" data-number-action="strategy-choice" data-value="written" aria-pressed="${state.strategyChoice === 'written'}"><span>Written route</span><strong>Align the places and exchange only where needed.</strong></button></div><p class="maths-feedback">${state.strategyChoice ? `You chose a ${state.strategyChoice} route. Explain why it is efficient for these particular numbers.` : 'Inspect the distance and place-value structure before choosing a method.'}</p></div>`;
  }
  if (mode === 'inverse') {
    const total = left + right;
    const roles = {
      total: { label: 'total', equation: `${formatMathsNumber(left)} + ${formatMathsNumber(right)} = ?`, expected: total },
      addend: { label: 'missing addend', equation: `? + ${formatMathsNumber(right)} = ${formatMathsNumber(total)}`, expected: left },
      minuend: { label: 'minuend', equation: `? − ${formatMathsNumber(right)} = ${formatMathsNumber(left)}`, expected: total },
      subtrahend: { label: 'subtrahend', equation: `${formatMathsNumber(total)} − ? = ${formatMathsNumber(left)}`, expected: right },
      difference: { label: 'difference', equation: `${formatMathsNumber(total)} − ${formatMathsNumber(left)} = ?`, expected: right },
    };
    const role = roles[state.inverseMissingRole] || roles.total;
    const answer = integer(state.inverseAnswer);
    const inspected = answer > 0;
    return `<div class="inverse-workbench"><div class="inverse-controls no-print"><label>Hide a role<select data-number-text="inverseMissingRole">${Object.entries(roles).map(([value, item]) => `<option value="${value}" ${state.inverseMissingRole === value ? 'selected' : ''}>${item.label}</option>`).join('')}</select></label><label>Your missing value<input type="number" min="0" max="19998" value="${answer || ''}" data-number-field="inverseAnswer" /></label></div><p class="missing-equation">${role.equation}</p>${state.answerRevealed ? `<div class="fact-family"><strong>${formatMathsNumber(left)} + ${formatMathsNumber(right)} = ${formatMathsNumber(total)}</strong><span>${formatMathsNumber(right)} + ${formatMathsNumber(left)} = ${formatMathsNumber(total)}</span><span>${formatMathsNumber(total)} − ${formatMathsNumber(left)} = ${formatMathsNumber(right)}</span><span>${formatMathsNumber(total)} − ${formatMathsNumber(right)} = ${formatMathsNumber(left)}</span></div>` : ''}<div class="calculation-inputs no-print"><input type="number" min="0" max="9999" value="${left}" data-number-field="left" aria-label="First addend"/><strong>+</strong><input type="number" min="0" max="9999" value="${right}" data-number-field="right" aria-label="Second addend"/></div><p class="maths-feedback" data-tone="${inspected && answer === role.expected ? 'success' : 'inspect'}">${!inspected ? `Use the inverse relationship to find the ${role.label}.` : answer === role.expected ? `${formatMathsNumber(answer)} completes the equation. The total becomes the minuend in the inverse subtraction.` : `${formatMathsNumber(answer)} does not preserve the equation. Use the connected addition or subtraction fact.`}</p></div>`;
  }
  if (mode === 'problem') {
    const twoStep = integer(state.problemSteps, 1) === 2;
    const third = clamp(integer(state.third), 0, 9999);
    const firstSubtract = state.operation === 'subtraction';
    const secondSubtract = state.secondOperation !== 'addition';
    const firstResult = firstSubtract ? Math.max(left, right) - Math.min(left, right) : left + right;
    const final = !twoStep ? firstResult : secondSubtract ? Math.max(0, firstResult - third) : firstResult + third;
    const unit = String(state.problemUnit || 'items');
    const context = String(state.problemContext || `A record starts with ${formatMathsNumber(left)} ${unit}. Another quantity is ${formatMathsNumber(right)} ${unit}${twoStep ? `, followed by ${formatMathsNumber(third)} ${unit}` : ''}.`);
    return `<div class="problem-workbench"><label class="problem-context no-print"><span>Problem context</span><textarea data-number-text="problemContext">${escapeHTML(context)}</textarea></label><div class="problem-controls no-print"><label>Unit<select data-number-text="problemUnit">${['items','metres','litres','kilograms','degrees'].map((value) => `<option value="${value}" ${unit === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>Unknown<input type="text" value="${escapeAttr(state.problemUnknown || 'the final amount')}" data-number-text="problemUnknown" /></label><div><span>Number of steps</span><button type="button" data-number-action="problem-steps" data-value="1" aria-pressed="${!twoStep}">One</button><button type="button" data-number-action="problem-steps" data-value="2" aria-pressed="${twoStep}">Two</button></div></div><div class="problem-known no-print"><label>Known value 1<input type="number" min="0" max="9999" value="${left}" data-number-field="left"/></label><label>Known value 2<input type="number" min="0" max="9999" value="${right}" data-number-field="right"/></label>${twoStep ? `<label>Known value 3<input type="number" min="0" max="9999" value="${third}" data-number-field="third"/></label>` : ''}</div><div class="operation-choices no-print" role="group" aria-label="Choose the first operation"><button type="button" data-number-action="problem-operation" data-value="addition" aria-pressed="${!firstSubtract}">Combine +</button><button type="button" data-number-action="problem-operation" data-value="subtraction" aria-pressed="${firstSubtract}">Find a difference −</button></div>${twoStep ? `<div class="operation-choices no-print" role="group" aria-label="Choose the second operation"><button type="button" data-number-action="problem-second-operation" data-value="addition" aria-pressed="${!secondSubtract}">Then add</button><button type="button" data-number-action="problem-second-operation" data-value="subtraction" aria-pressed="${secondSubtract}">Then subtract</button></div>` : ''}<div class="problem-strip"><span>Known</span><strong>${formatMathsNumber(left)} ${escapeHTML(unit)}</strong><strong>${formatMathsNumber(right)} ${escapeHTML(unit)}</strong>${twoStep ? `<strong>${formatMathsNumber(third)} ${escapeHTML(unit)}</strong>` : ''}<span>Unknown</span><strong>${escapeHTML(state.problemUnknown || 'the final amount')}</strong></div><div class="operation-plan"><b>1</b><span>${firstSubtract ? 'Compare or remove the first two known quantities.' : 'Combine the first two known quantities.'}</span>${twoStep ? `<b>2</b><span>${secondSubtract ? 'Subtract' : 'Add'} the third known quantity.</span>` : ''}</div><p class="model-equation">${formatMathsNumber(left)} ${firstSubtract ? '−' : '+'} ${formatMathsNumber(right)}${twoStep ? ` ${secondSubtract ? '−' : '+'} ${formatMathsNumber(third)}` : ''} = ${state.answerRevealed ? `${formatMathsNumber(final)} ${escapeHTML(unit)}` : '?'}</p><p class="maths-feedback">The plan follows what is known, what is unknown and how the quantities relate—not one keyword.</p></div>`;
  }
  if (mode === 'statement') {
    const authored = STATEMENTS[integer(state.statementIndex) % STATEMENTS.length];
    const generated = state.generatedTask?.kind === 'truth-statement' ? state.generatedTask : null;
    const statement = generated?.values?.statement || authored.text;
    const classification = generated?.solution?.classification || authored.classification;
    const examples = generated
      ? [generated.solution?.supportingExample].filter(Boolean).map((values) => Array.isArray(values) ? values.map(formatMathsNumber).join(' and ') : String(values))
      : authored.examples;
    const counterexample = generated?.solution?.counterexample
      ? (Array.isArray(generated.solution.counterexample) ? generated.solution.counterexample.map(formatMathsNumber).join(' and ') : String(generated.solution.counterexample))
      : authored.counterexample;
    const chosen = state.selectedClassification;
    return `<div class="statement-workbench"><blockquote>${escapeHTML(statement)}</blockquote><div class="classification-row" role="group" aria-label="Classify the statement">${['always','sometimes','never'].map((value) => `<button type="button" data-number-action="classify" data-value="${value}" aria-pressed="${chosen === value}">${value[0].toUpperCase()}${value.slice(1)}</button>`).join('')}</div><div class="statement-evidence-inputs no-print"><label>My example<input type="text" data-number-text="exampleEvidence" value="${escapeAttr(state.exampleEvidence || '')}" placeholder="Test one case…" /></label><label>My counterexample<input type="text" data-number-text="counterexampleEvidence" value="${escapeAttr(state.counterexampleEvidence || '')}" placeholder="Search for a case that breaks always…" /></label><label>Amend the statement<textarea data-number-text="amendedStatement" placeholder="Change the words so the statement becomes precise.">${escapeHTML(state.amendedStatement || '')}</textarea></label></div>${state.answerRevealed ? `<div class="evidence-cards">${examples.map((example) => `<span>Supporting example · ${escapeHTML(example)}</span>`).join('')}${counterexample ? `<strong>Counterexample · ${escapeHTML(counterexample)}</strong>` : '<strong>A general place-value argument establishes every valid case.</strong>'}</div>` : ''}<p class="maths-feedback" data-tone="${chosen && chosen === classification ? 'success' : 'inspect'}">${!chosen ? 'Choose always, sometimes or never, then test more than one part of the range.' : chosen === classification ? `This statement is ${classification}. ${classification === 'always' ? 'Examples support it, but a general reason is still needed for proof.' : 'A counterexample decides that it cannot be always true.'}` : `Your examples do not yet support “${chosen}”. Search for a counterexample or amend the statement.`}</p></div>`;
  }
  const type = state.challengeType || 'missing-number';
  const challengeBody = type === 'rounding'
    ? `<div class="rounding-challenge"><label>Number to round<input type="number" min="0" max="9999" value="${left}" data-number-field="left" /></label><label>Nearest<select data-number-field="roundingUnit"><option value="10" ${state.roundingUnit === 10 ? 'selected' : ''}>10</option><option value="100" ${state.roundingUnit === 100 ? 'selected' : ''}>100</option><option value="1000" ${state.roundingUnit === 1000 ? 'selected' : ''}>1,000</option></select></label><strong>${formatMathsNumber(left)} rounds to ?</strong></div>`
    : type === 'statement'
      ? `<label>Statement to test<textarea data-number-text="challengeStatement">${escapeHTML(state.challengeStatement || '')}</textarea></label><label>Intended classification<select data-number-text="challengeClassification">${['always','sometimes','never'].map((value) => `<option value="${value}" ${state.challengeClassification === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>`
      : `<div class="calculation-inputs"><input type="number" min="0" max="9999" value="${left}" data-number-field="left" aria-label="First challenge value"/><strong>+</strong><input type="number" min="0" max="9999" value="${right}" data-number-field="right" aria-label="Second challenge value"/><strong>= ?</strong></div>`;
  return `<div class="challenge-workbench"><div class="challenge-sheet"><p class="eyebrow">Challenge for someone else</p><label>Choose the structure<select data-number-text="challengeType"><option value="missing-number" ${type === 'missing-number' ? 'selected' : ''}>Missing number</option><option value="rounding" ${type === 'rounding' ? 'selected' : ''}>Rounding decision</option><option value="statement" ${type === 'statement' ? 'selected' : ''}>Always, sometimes or never</option></select></label>${challengeBody}<label>What should the solver explain?<textarea data-number-text="challengePrompt">${escapeHTML(state.challengePrompt || 'Explain how you know and show a check.')}</textarea></label></div><p class="maths-feedback">This ${type.replaceAll('-', ' ')} challenge has valid values, enough information and a reason to explain.</p></div>`;
}

function renderWorkspaceModel(state, tool, options = {}) {
  switch (tool.mode) {
    case 'place-value': return renderPlaceValue(state, options);
    case 'partition': return renderPartition(state);
    case 'stepper': case 'compare': case 'order': case 'number-line': return renderMagnitude(state, tool.mode);
    case 'rounding': return renderRounding(state);
    case 'estimate': return renderRounding(state, true);
    case 'negative': return renderBeyondZero(state);
    case 'roman': return renderBeyondZero(state, true);
    case 'addition': return renderCalculation(state, false);
    case 'subtraction': return renderCalculation(state, true);
    default: return renderReasoning(state, tool.mode);
  }
}

function renderBoardView(state, tool) {
  return `<section class="board-view" role="dialog" aria-modal="true" aria-labelledby="board-title"><header><div><p>TODAY’S MODEL</p><h1 id="board-title">${escapeHTML(tool.title)}</h1></div><button type="button" data-number-action="close-board" aria-label="Exit Board View">Exit</button></header><main>${renderWorkspaceModel(state, tool, { board: true })}</main><footer><button type="button" data-number-action="board-previous">Previous step</button><button type="button" data-number-action="toggle-labels">${state.labelsVisible ? 'Hide labels' : 'Show labels'}</button><button type="button" data-number-action="board-next">Next step</button><button type="button" data-number-action="toggle-answer">${state.answerRevealed ? 'Hide answer' : 'Reveal answer'}</button><label>Board note<input type="text" maxlength="120" value="${escapeAttr(state.annotation || '')}" data-number-text="annotation"/></label></footer></section>`;
}

function renderExpeditionHome() {
  return `<section class="number-field-station" aria-labelledby="numbers-title"><div class="number-intro"><div><p class="eyebrow">Open exploration · no key needed</p><h1 id="numbers-title">Number Expedition</h1><p class="lede">Build it. Move it. Test what stays true.</p></div><div class="instrument-mark" aria-hidden="true"><span>1</span><span>10</span><span>100</span><span>1,000</span></div></div><div class="region-path">${NUMBER_REGIONS.map((region) => `<section class="number-region" data-accent="${region.accent}"><div class="region-mark" aria-hidden="true">${region.mark}</div><div><h2>${region.title}</h2><p>${region.description}</p></div><div class="region-tools">${NUMBER_TOOLS.filter((tool) => tool.regionId === region.id).map((tool) => `<button type="button" data-route="number-tool" data-route-value="${tool.id}"><span>${tool.title}</span><small>${tool.invitation}</small></button>`).join('')}</div></section>`).join('')}</div></section>`;
}

function mathematicalValues(state = {}) {
  return ['value', 'left', 'right', 'third', 'start', 'end', 'target'].reduce((record, key) => {
    if (state[key] !== undefined) record[key] = state[key];
    return record;
  }, {});
}

function serialisableModel(state, tool, originalState = null) {
  const clean = clone(state);
  delete clean.boardOpen;
  return {
    modelState: clean,
    originalValues: mathematicalValues(originalState || clean),
    values: mathematicalValues(clean),
    childActions: [...(clean.childActions || [])],
    representations: ['concrete', 'pictorial', 'symbolic'],
    answer: clean.answerRevealed ? 'revealed in saved model' : 'kept hidden',
    explanation: clean.explanation || '',
    strategy: tool.mode,
    generatorSeed: clean.generatorSeed,
    steps: clean.boardStep,
  };
}

function applyGeneratedTask(state, task) {
  const values = task.values || {};
  state.generatedTask = clone(task);
  if (values.value !== undefined) state.value = values.value;
  if (values.left !== undefined) state.left = values.left;
  if (values.right !== undefined) state.right = values.right;
  if (values.start !== undefined) state.start = values.start;
  if (values.end !== undefined) state.end = values.end;
  if (values.target !== undefined) {
    state.target = values.target;
    state.position = values.start ?? Math.round(values.target / 100) * 100;
  }
  if (values.unit !== undefined) state.roundingUnit = values.unit;
  if (values.numbers) state.orderValues = [...values.numbers];
  if (values.operation) state.operation = values.operation === '−' || values.operation === '-' ? 'subtraction' : 'addition';
  if (task.kind === 'step') {
    state.value = values.start;
    state.step = Math.abs(values.change);
    state.generatedChange = values.change;
  }
  if (task.kind === 'subtraction') {
    state.left = values.minuend;
    state.right = values.subtrahend;
    state.operation = 'subtraction';
  }
  if (task.kind === 'inverse') {
    state.left = values.firstAddend;
    state.right = values.secondAddend;
  }
  if (task.kind === 'problem') {
    state.left = values.start;
    state.right = values.changeOne;
    state.third = values.changeTwo ?? 0;
    state.problemSteps = values.steps;
    state.operation = task.solution?.operations?.[0] === '−' ? 'subtraction' : 'addition';
  }
  if (values.value && task.kind === 'roman-numeral') {
    state.romanValue = values.value;
    state.romanInput = arabicToRoman(values.value);
  }
  if (values.partition) {
    state.sourceCounts = { ...values.partition };
    state.partitionTerms = PLACE_VALUE_PLACES.map((place) => (values.partition[place.key] || 0) * place.value);
  } else if (state.value !== undefined) {
    state.sourceCounts = null;
    state.partitionTerms = createLinkedRepresentations(clamp(state.value, 0, 9999)).allPlaceTerms;
  }
  if (task.display?.start !== undefined) {
    state.lower = task.display.start;
    state.upper = task.display.end;
  } else if (values.start !== undefined && values.end !== undefined && task.kind === 'number-line') {
    state.lower = values.start;
    state.upper = values.end;
  }
  state.generatedPrompt = task.prompt;
  state.generatorTaskId = task.id;
  state.generatorVersion = task.generatorVersion;
  state.answerRevealed = false;
  state.boardStep = 0;
}

export class NumberExpedition {
  constructor(host, { toolId = null, activity = null, savedState = null, scaffold = 'core', onChange, onSave, onSpeak, onToast } = {}) {
    this.host = host;
    this.activity = activity;
    this.tool = getNumberTool(toolId || activity?.toolId);
    this.scaffold = scaffold;
    this.onChange = onChange;
    this.onSave = onSave;
    this.onSpeak = onSpeak;
    this.onToast = onToast;
    this.state = this.tool ? defaultNumberState(this.tool, activity, savedState) : null;
    this.originalState = this.state ? clone(this.state) : null;
    this.history = [];
    this.future = [];
    this.boardReturnState = null;
    this.onClick = this.handleClick.bind(this);
    this.onChangeEvent = this.handleChange.bind(this);
    this.onInput = this.handleInput.bind(this);
    this.onKeyDown = this.handleKeyDown.bind(this);
    host.addEventListener('click', this.onClick);
    host.addEventListener('change', this.onChangeEvent);
    host.addEventListener('input', this.onInput);
    host.addEventListener('keydown', this.onKeyDown);
    this.render();
  }

  snapshot() { return this.state ? clone(this.state) : null; }

  recordAction(action, detail = {}) {
    if (!this.state || !action) return;
    const actions = Array.isArray(this.state.childActions) ? this.state.childActions : [];
    this.state.childActions = [...actions, { action, ...detail }].slice(-100);
  }

  commit(mutator, { remember = true, notify = true } = {}) {
    if (!this.state) return;
    if (remember) {
      this.history.push(clone(this.state));
      this.history = this.history.slice(-40);
      this.future = [];
    }
    mutator(this.state);
    if (notify) this.onChange?.(this.snapshot());
    this.render();
  }

  handleChange(event) {
    const field = event.target.dataset.numberField;
    const textField = event.target.dataset.numberText;
    const array = event.target.dataset.numberArray;
    if (field) {
      this.recordAction('change-value', { field });
      this.commit((state) => {
        const minimumAttribute = event.target.getAttribute('min');
        const maximumAttribute = event.target.getAttribute('max');
        const minimum = minimumAttribute == null ? -9999 : Number(minimumAttribute);
        const maximum = maximumAttribute == null ? 9999 : Number(maximumAttribute);
        state[field] = clamp(integer(event.target.value), minimum, maximum);
        if (field === 'value') {
          state.sourceCounts = null;
          state.partitionTerms = createLinkedRepresentations(state.value).allPlaceTerms;
          if (this.tool.mode === 'rounding') state.roundingChoice = null;
        }
      });
    }
    if (textField) {
      const boardOnly = this.state?.boardOpen && textField === 'annotation';
      if (!boardOnly) this.recordAction('change-written-response', { field: textField });
      this.commit((state) => { state[textField] = event.target.value; }, {
        remember: !boardOnly,
        notify: !boardOnly,
      });
    }
    if (array) {
      this.recordAction('change-ordered-value', { index: integer(event.target.dataset.index) });
      this.commit((state) => {
        const next = [...(state[array] || [])];
        const minimumAttribute = event.target.getAttribute('min');
        const maximumAttribute = event.target.getAttribute('max');
        const minimum = minimumAttribute == null ? 0 : Number(minimumAttribute);
        const maximum = maximumAttribute == null ? 9999 : Number(maximumAttribute);
        next[integer(event.target.dataset.index)] = clamp(integer(event.target.value), minimum, maximum);
        state[array] = next;
      });
    }
  }

  handleInput() {}

  handleKeyDown(event) {
    if (!this.state?.boardOpen) return;
    const board = this.host.querySelector('.board-view');
    if (!board) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeBoard();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...board.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    if (!focusable.length) return;
    const current = focusable.indexOf(this.host.ownerDocument.activeElement);
    const next = event.shiftKey
      ? (current <= 0 ? focusable.at(-1) : focusable[current - 1])
      : (current === -1 || current === focusable.length - 1 ? focusable[0] : focusable[current + 1]);
    event.preventDefault();
    next.focus({ preventScroll: true });
  }

  openBoard() {
    this.boardReturnState = {
      labelsVisible: this.state.labelsVisible,
      answerRevealed: this.state.answerRevealed,
      boardStep: this.state.boardStep,
      roundingChoice: this.state.roundingChoice,
      selectedClassification: this.state.selectedClassification,
      inverseAnswer: this.state.inverseAnswer,
      strategyChoice: this.state.strategyChoice,
      annotation: this.state.annotation,
    };
    this.commit((state) => {
      state.boardOpen = true;
      state.labelsVisible = false;
      state.answerRevealed = false;
      state.roundingChoice = null;
      state.selectedClassification = '';
      state.inverseAnswer = 0;
      state.strategyChoice = '';
      state.boardStep = 0;
    }, { remember: false, notify: false });
    this.host.querySelector('[data-number-action="close-board"]')?.focus({ preventScroll: true });
  }

  closeBoard() {
    const previous = this.boardReturnState;
    this.boardReturnState = null;
    this.commit((state) => {
      state.boardOpen = false;
      if (previous) Object.assign(state, previous);
    }, { remember: false, notify: false });
    this.host.querySelector('[data-number-action="open-board"]')?.focus({ preventScroll: true });
  }

  handleClick(event) {
    const line = event.target.closest?.('[data-number-line]');
    if (line && this.state && this.tool?.mode === 'number-line') {
      const rect = line.getBoundingClientRect();
      if (rect.width > 0) {
        const viewportRatio = (event.clientX - rect.left) / rect.width;
        const ratio = clamp((viewportRatio - 0.07) / 0.86, 0, 1);
        const lower = integer(line.dataset.lower);
        const upper = integer(line.dataset.upper, lower + 1);
        this.recordAction('place-number-line-marker');
        this.commit((state) => { state.position = Math.round(lower + ratio * (upper - lower)); });
      }
      return;
    }
    const button = event.target.closest('[data-number-action]');
    if (!button || !this.state) return;
    event.preventDefault();
    const action = button.dataset.numberAction;
    if (action === 'undo' && this.history.length) {
      this.future.push(clone(this.state)); this.state = this.history.pop(); this.recordAction('undo'); this.onChange?.(this.snapshot()); this.render(); return;
    }
    if (action === 'redo' && this.future.length) {
      this.history.push(clone(this.state)); this.state = this.future.pop(); this.recordAction('redo'); this.onChange?.(this.snapshot()); this.render(); return;
    }
    const actionNames = {
      'place-delta': 'adjust-place-value',
      exchange: 'exchange-place-value',
      step: 'move-by-place-value-step',
      'round-unit': 'choose-rounding-unit',
      'round-choice': 'choose-nearest-multiple',
      'strategy-choice': 'choose-strategy',
      'problem-steps': 'choose-problem-steps',
      'problem-operation': 'choose-first-operation',
      'problem-second-operation': 'choose-second-operation',
      classify: 'classify-statement',
      'roman-add': 'construct-roman-numeral',
      'new-challenge': 'generate-new-values',
      'toggle-answer': 'change-answer-visibility',
    };
    if (actionNames[action] && !this.state.boardOpen) this.recordAction(actionNames[action]);
    if (action === 'place-delta') this.commit((state) => {
      const place = PLACE_VALUE_PLACES.find((item) => item.key === button.dataset.place);
      state.value = clamp(integer(state.value) + place.value * integer(button.dataset.delta), 0, 9999);
      state.sourceCounts = null;
      state.partitionTerms = createLinkedRepresentations(state.value).allPlaceTerms;
    });
    if (action === 'exchange') this.commit((state) => {
      try {
        const exchanged = exchangePlaceValue(state.sourceCounts || integer(state.value), button.dataset.from, button.dataset.to);
        state.value = exchanged.value;
        state.sourceCounts = { ...exchanged.sourceCounts };
        state.partitionTerms = [...exchanged.allPlaceTerms];
      } catch (error) {
        this.onToast?.(error.message);
      }
    });
    if (action === 'step') this.commit((state) => {
      state.value = clamp(integer(state.value) + integer(button.dataset.delta), 0, 10000);
      state.sourceCounts = null;
    });
    if (action === 'round-unit') this.commit((state) => { state.roundingUnit = integer(button.dataset.value); state.roundingChoice = null; });
    if (action === 'round-choice') this.commit((state) => { state.roundingChoice = integer(button.dataset.value); });
    if (action === 'strategy-choice') this.commit((state) => { state.strategyChoice = button.dataset.value; });
    if (action === 'problem-steps') this.commit((state) => { state.problemSteps = integer(button.dataset.value, 1); });
    if (action === 'problem-operation') this.commit((state) => { state.operation = button.dataset.value; });
    if (action === 'problem-second-operation') this.commit((state) => { state.secondOperation = button.dataset.value; });
    if (action === 'classify') this.commit((state) => { state.selectedClassification = button.dataset.value; });
    if (action === 'roman-add') this.commit((state) => { state.romanInput = `${state.romanInput || ''}${button.dataset.value}`.slice(0, 12); });
    if (action === 'new-challenge') this.commit((state) => {
      state.challengeNumber = integer(state.challengeNumber, 1) + 1;
      state.generatorSeed = `${this.activity?.id || this.tool.id}:${state.challengeNumber}`;
      const generatorMode = this.activity?.id || this.tool.mode;
      const task = generateNumberTask(generatorMode, state.generatorSeed);
      applyGeneratedTask(state, task);
      if (task.kind === 'truth-statement') state.statementIndex = state.challengeNumber % STATEMENTS.length;
    });
    if (action === 'toggle-answer') this.commit((state) => { state.answerRevealed = !state.answerRevealed; }, { remember: false, notify: !this.state.boardOpen });
    if (action === 'toggle-labels') this.commit((state) => { state.labelsVisible = !state.labelsVisible; }, { remember: false, notify: !this.state.boardOpen });
    if (action === 'open-board') { this.openBoard(); return; }
    if (action === 'close-board') { this.closeBoard(); return; }
    if (action === 'board-next') this.commit((state) => {
      if (['addition', 'subtraction'].includes(this.tool.mode)) {
        const left = clamp(integer(state.left), 0, 9999);
        const right = clamp(integer(state.right), 0, 9999);
        const trace = this.tool.mode === 'addition'
          ? traceAddition(left, right)
          : traceSubtraction(Math.max(left, right), Math.min(left, right));
        const limit = this.tool.mode === 'addition'
          ? trace.steps.filter((step) => step.outgoingExchange).length
          : trace.exchangeEvents.length;
        if (state.boardStep < limit) state.boardStep += 1;
        else state.answerRevealed = true;
      } else {
        state.boardStep = Math.min(2, integer(state.boardStep) + 1);
        if (state.boardStep >= 1) state.labelsVisible = true;
        if (state.boardStep >= 2) state.answerRevealed = true;
      }
    }, { remember: false, notify: false });
    if (action === 'board-previous') this.commit((state) => {
      if (state.answerRevealed) state.answerRevealed = false;
      else state.boardStep = Math.max(0, integer(state.boardStep) - 1);
      if (!['addition', 'subtraction'].includes(this.tool.mode) && state.boardStep === 0) state.labelsVisible = false;
    }, { remember: false, notify: false });
    if (action === 'speak-number') this.onSpeak?.(spokenMathematics(this.state, this.tool));
    if (action === 'save') void this.save();
  }

  async save() {
    if (!this.onSave) return;
    const payload = {
      destinationId: 'number-expedition',
      activityId: this.activity?.id || `open-number-${this.tool.id}`,
      keyActivityId: this.activity?.id || null,
      title: this.activity?.title || this.tool.title,
      artefactType: this.activity?.outcome?.artefactTypeId || this.tool.artefactTypeId,
      curriculumTags: this.activity?.curriculumTags || ['mathematics', 'year-4', this.tool.mode],
      conceptTags: this.activity?.conceptTags || ['number-expedition', this.tool.regionId, this.tool.mode],
      structuredContent: {
        ...serialisableModel(this.state, this.tool, this.originalState),
        scaffold: this.scaffold,
        activityId: this.activity?.id || null,
      },
      preview: { type: 'mathematics', label: this.tool.title },
      writtenExplanation: this.state.explanation || '',
      generatorSeed: this.state.generatorSeed,
    };
    await this.onSave(payload, this.snapshot());
  }

  render() {
    if (!this.tool) {
      this.host.innerHTML = renderExpeditionHome();
      return;
    }
    const region = NUMBER_REGIONS.find((item) => item.id === this.tool.regionId);
    this.host.innerHTML = `<section class="number-workspace" data-mode="${this.tool.mode}" aria-labelledby="number-workspace-title">
      <header class="number-workspace-head"><div><p class="eyebrow">${this.activity ? `${region.title} · guided pathway` : `${region.title} · open tool`}</p><h1 id="number-workspace-title">${escapeHTML(this.activity?.title || this.tool.title)}</h1><p class="lede">${escapeHTML(this.activity?.shortInvitation || this.tool.invitation)}</p></div><div class="workspace-actions no-print"><button type="button" class="button secondary" data-route="numbers">All regions</button><button type="button" class="button tonal" data-number-action="open-board">Board View</button></div></header>
      ${this.activity ? `<section class="guided-notice"><span>Notice</span><p>${escapeHTML(this.activity.curriculumObjective)}</p><button type="button" data-action="speak-text" data-speak="${escapeAttr(this.activity.curriculumObjective)}" aria-label="Hear the mathematical invitation">♪</button></section>` : ''}
      ${this.state.generatedPrompt ? `<p class="generated-invitation"><strong>Try this</strong> ${escapeHTML(this.state.generatedPrompt)}</p>` : ''}<div class="maths-instrument-panel">
        <div class="instrument-toolbar no-print"><button type="button" data-number-action="undo" ${this.history.length ? '' : 'disabled'}>Undo</button><button type="button" data-number-action="redo" ${this.future.length ? '' : 'disabled'}>Redo</button><button type="button" data-number-action="new-challenge">New values</button><button type="button" data-number-action="toggle-answer">${this.state.answerRevealed ? 'Hide answer' : 'Reveal'}</button><button type="button" data-number-action="speak-number">Hear number</button></div>
        ${renderWorkspaceModel(this.state, this.tool)}
      </div>
      <section class="make-explain"><div><p class="eyebrow">Make & explain</p><h2>What structure did you use?</h2>${this.activity?.scaffoldBehaviour?.[this.scaffold] ? `<p class="scaffold-cue">${escapeHTML(this.activity.scaffoldBehaviour[this.scaffold])}</p>` : ''}</div><label><span>My mathematical explanation <small>optional</small></span><textarea maxlength="700" data-number-text="explanation" placeholder="I noticed… so I… because…">${escapeHTML(this.state.explanation || '')}</textarea></label><div class="voice-explanation no-print"><button class="button secondary" type="button" data-action="start-voice-response">Record my explanation</button><span class="small muted" data-audio-recorder-status>Voice is optional.</span></div>${this.activity?.keyCheck ? `<details><summary>Key Check <small>optional · unscored</small></summary><p>${escapeHTML(this.activity.keyCheck.prompt)}</p></details>` : ''}<div class="cluster no-print"><button type="button" class="button" data-number-action="save">Save to My Work</button><button type="button" class="button secondary" data-action="print-page">Print</button></div></section>
      ${this.state.boardOpen ? renderBoardView(this.state, this.tool) : ''}
    </section>`;
    const board = this.host.querySelector('.board-view');
    this.host.ownerDocument.documentElement.classList.toggle('board-view-open', Boolean(board));
    if (board) {
      this.host.querySelectorAll('.number-workspace > :not(.board-view)').forEach((element) => element.setAttribute('inert', ''));
      board.querySelector(':scope > main')?.querySelectorAll('input, textarea, select, button').forEach((control) => { control.disabled = true; });
    }
  }

  destroy() {
    this.host.removeEventListener('click', this.onClick);
    this.host.removeEventListener('change', this.onChangeEvent);
    this.host.removeEventListener('input', this.onInput);
    this.host.removeEventListener('keydown', this.onKeyDown);
    this.host.ownerDocument.documentElement.classList.remove('board-view-open');
  }
}

export function renderNumberExpeditionHost({ toolId = null, activityId = null } = {}) {
  return `<div id="number-expedition" data-number-tool-id="${escapeAttr(toolId || '')}" data-number-activity-id="${escapeAttr(activityId || '')}"></div>`;
}

export default NumberExpedition;
