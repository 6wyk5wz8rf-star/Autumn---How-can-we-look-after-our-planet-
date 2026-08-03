import { escapeAttr, escapeHTML } from '../utils/dom.js';
import { formatDate, formatDateTime, humanise, truncate } from '../utils/format.js';
import { renderKeypad } from '../components/Keypad.js';
import { profileSymbolIcon } from '../components/ProfileGate.js';
import {
  arabicToRoman,
  createLinkedRepresentations,
  formatMathsNumber,
  getRoundingBounds,
  traceAddition,
  traceSubtraction,
} from '../maths/index.js';
import { getOrganism } from '../data/organisms.js';
import { renderOrganismIllustration } from '../science/illustrations.js';

const artefactSymbols = {
  'exploration-snapshot': '◎',
  'three-view-comparison': '◫',
  'annotated-location-card': '⌖',
  'place-pin': '⌖',
  'climate-pattern-observation': '☼',
  'two-place-comparison': '⇄',
  'journey-thread': '⌁',
  'place-portrait': '▱',
  'planet-question-response': '◉',
  'four-digit-model': '▦',
  'partition-card': '≡',
  'comparison-explanation': '↔',
  'ordered-number-set': '‹',
  'number-line-estimate': '—',
  'rounding-explanation': '⌒',
  'estimate-comparison': '≈',
  'negative-number-route': '±',
  'roman-numeral': 'Ⅹ',
  'addition-model': '+',
  'subtraction-model': '−',
  'strategy-comparison': '◇',
  'inverse-family': '⇄',
  'problem-model': '?',
  proof: '∴',
  counterexample: '≠',
  'child-created-challenge': '✎',
  'organism-observation': '◉',
  'organism-comparison': '⇄',
  'free-sorting-board': '∩',
  'tested-grouping-rule': '✓',
  'backbone-classification': '⌇',
  'vertebrate-group-comparison': '⌇',
  'invertebrate-diversity-panel': '✣',
  'classification-key-route': '⑂',
  'classification-question-analysis': '?',
  'branching-classification-key': '⑂',
  'repaired-key': '↻',
  'mystery-organism-trail': '◌',
  'habitat-needs-map': '▧',
  'microhabitat-observation': '⌕',
  'habitat-model': '▧',
  'environmental-change-chain': '⇢',
  'environmental-response-comparison': '⇄',
  'survey-record': '≋',
  'child-created-science-challenge': '✎',
};

const NUMBER_ARTEFACT_TYPES = new Set([
  'four-digit-model', 'partition-card', 'comparison-explanation', 'ordered-number-set',
  'number-line-estimate', 'rounding-explanation', 'estimate-comparison',
  'negative-number-route', 'roman-numeral', 'addition-model', 'subtraction-model',
  'strategy-comparison', 'inverse-family', 'problem-model', 'proof', 'counterexample',
  'child-created-challenge',
]);

const SCIENCE_ARTEFACT_TYPES = new Set([
  'organism-observation', 'organism-comparison', 'free-sorting-board', 'grouping-rule',
  'tested-grouping-rule', 'backbone-classification', 'vertebrate-group-comparison',
  'invertebrate-diversity-panel', 'classification-key-route', 'classification-question-analysis',
  'branching-classification-key', 'repaired-key', 'mystery-organism-trail',
  'habitat-needs-map', 'microhabitat-observation', 'habitat-model',
  'environmental-change-chain', 'environmental-response-comparison', 'survey-record',
  'child-created-science-challenge',
]);

const outcomeTemplatesWithExplanation = new Set([
  'place-pin',
  'climate-pattern-observation',
  'journey-thread',
  'planet-question-response',
]);

function safeSvgDataUrl(markup) {
  const value = String(markup || '').trim();
  if (!value.startsWith('<svg') || value.length > 750_000) return '';
  if (/<(?:script|foreignObject|iframe|object|embed|image|use)\b/i.test(value)) return '';
  if (/\son[a-z]+\s*=|\b(?:href|src)\s*=\s*["'](?!#)/i.test(value)) return '';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
}

function renderSavedPreview(artifact, type) {
  const source = safeSvgDataUrl(artifact.preview?.markup);
  if (source) {
    return `<img class="saved-map-preview" src="${escapeAttr(source)}" alt="Saved ${escapeAttr(artifact.preview?.label || 'map')} view" />`;
  }
  if (NUMBER_ARTEFACT_TYPES.has(type)) {
    const state = artifact.content?.modelState || artifact.structuredContent?.modelState || {};
    const values = [state.value, state.left, state.right, state.target].filter((value) => Number.isFinite(Number(value))).slice(0, 3);
    return `<span class="work-preview-symbol maths-symbol" aria-hidden="true">${artefactSymbols[type] || '◇'}</span>${values.length ? `<strong class="maths-preview-values">${values.map((value) => Number(value).toLocaleString('en-GB')).join(' · ')}</strong>` : `<strong>${escapeHTML(artifact.preview?.label || humanise(type))}</strong>`}`;
  }
  if (SCIENCE_ARTEFACT_TYPES.has(type)) {
    const organismIds = artifact.content?.organismIds || artifact.structuredContent?.organismIds || artifact.preview?.organismIds || [];
    const organisms = organismIds.map(getOrganism).filter(Boolean).slice(0, 3);
    return `<span class="work-preview-symbol science-symbol" aria-hidden="true">${artefactSymbols[type] || '◉'}</span>${organisms.length ? `<span class="science-preview-names">${organisms.map((organism) => escapeHTML(organism.commonName)).join(' · ')}</span>` : `<strong>${escapeHTML(artifact.preview?.label || humanise(type))}</strong>`}`;
  }
  return `<span class="work-preview-symbol" aria-hidden="true">${artefactSymbols[type] || '▱'}</span>${artifact.preview?.label ? `<strong>${escapeHTML(artifact.preview.label)}</strong>` : ''}`;
}

function displayContentEntries(content) {
  const hidden = new Set([
    'activityId', 'mapState', 'viewState', 'route', 'routes', 'markers', 'visibleLayers',
    'comparison', 'attribution', 'startedAt', 'savedAt', 'outcomeSchemaVersion', 'step',
    'workflowVersion',
  ]);
  return Object.entries(content).flatMap(([key, value]) => {
    if (hidden.has(key) || value === '' || value == null) return [];
    if (['string', 'number', 'boolean'].includes(typeof value)) return [[key, String(value)]];
    if (Array.isArray(value) && value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
      return value.length ? [[key, value.join(' · ')]] : [];
    }
    return [];
  });
}

function outcomeField(label, value) {
  if (value == null || value === '' || (Array.isArray(value) && !value.length)) return '';
  const text = Array.isArray(value) ? value.join(' · ') : String(value);
  return `<div><dt class="eyebrow">${escapeHTML(label)}</dt><dd>${escapeHTML(text)}</dd></div>`;
}

function savedColumnDigits(value) {
  return [...String(value).padStart(5, ' ')].map((digit) => `<span>${digit === ' ' ? '' : digit}</span>`).join('');
}

function savedNumberLine(lower, upper, value, label = '') {
  const start = Number(lower);
  const end = Math.max(start + 1, Number(upper));
  const point = Math.min(end, Math.max(start, Number(value)));
  const x = 70 + ((point - start) / (end - start)) * 860;
  return `<svg class="scaled-number-line" viewBox="0 0 1000 180" role="img" aria-label="Saved number line from ${start} to ${end}; marker at ${point}"><line x1="70" y1="92" x2="930" y2="92"/>${Array.from({ length: 11 }, (_, index) => { const tickX = 70 + index * 86; const tickValue = start + ((end - start) * index / 10); return `<line x1="${tickX}" y1="${index % 5 === 0 ? 72 : 80}" x2="${tickX}" y2="108"/>${[0, 5, 10].includes(index) ? `<text x="${tickX}" y="142">${formatMathsNumber(Math.round(tickValue))}</text>` : ''}`; }).join('')}<path class="line-marker" d="M${x} 28l-13 26h26z"/><line class="line-marker" x1="${x}" y1="52" x2="${x}" y2="92"/><text class="marker-label" x="${x}" y="20">${escapeHTML(label || formatMathsNumber(point))}</text></svg>`;
}

function savedFormalCalculation(leftValue, rightValue, subtraction, reveal = true) {
  let left = Math.min(9999, Math.max(0, Number(leftValue) || 0));
  let right = Math.min(9999, Math.max(0, Number(rightValue) || 0));
  if (subtraction && right > left) [left, right] = [right, left];
  const trace = subtraction ? traceSubtraction(left, right) : traceAddition(left, right);
  const result = subtraction ? trace.difference : trace.total;
  const steps = subtraction ? trace.exchangeEvents : trace.steps.filter((step) => step.outgoingExchange);
  return `<div class="column-calculation" role="table" aria-label="${escapeAttr(trace.formatted)}"><div class="place-headings"><span>10,000s</span><span>1,000s</span><span>100s</span><span>10s</span><span>1s</span></div><div class="column-row">${savedColumnDigits(left)}</div><div class="column-row operator"><b>${subtraction ? '−' : '+'}</b>${savedColumnDigits(right)}</div><div class="column-rule"></div><div class="column-row result">${reveal ? savedColumnDigits(result) : '<span></span><span></span><span>?</span><span>?</span><span>?</span>'}</div></div>${steps.length ? `<div class="exchange-trace">${steps.map((step, index) => `<p><b>${index + 1}</b>${escapeHTML(step.message || `Exchange from ${step.place} to ${step.exchangesTo}.`)}</p>`).join('')}</div>` : '<p>No exchange was needed.</p>'}`;
}

function renderMathsOutcome(type, content) {
  const state = content.modelState || {};
  const explanation = outcomeField('My explanation', content.explanation || state.explanation);
  let model = '';
  if (['four-digit-model', 'partition-card'].includes(type)) {
    let linked;
    try { linked = createLinkedRepresentations(state.sourceCounts || Math.min(9999, Math.max(0, Number(state.value) || 0))); } catch { linked = createLinkedRepresentations(0); }
    model = `<div class="number-hero"><strong>${linked.numeral}</strong><span>${escapeHTML(linked.numberName)}</span></div><div class="place-grid">${linked.placeValueChart.map((column) => `<div class="place-column"><span>${column.label}</span><strong>${column.digit}</strong><small>${formatMathsNumber(column.representedValue)}</small></div>`).join('')}</div><p class="representation-strip">${escapeHTML(linked.expandedForm)}</p>${type === 'partition-card' ? `<p class="model-equation">${(state.partitionTerms || linked.allPlaceTerms).map((term) => formatMathsNumber(Number(term) || 0)).join(' + ')} = ${linked.numeral}</p>` : ''}`;
  } else if (type === 'number-line-estimate') {
    model = savedNumberLine(state.lower, state.upper, state.position ?? state.target, state.answerRevealed ? formatMathsNumber(Number(state.target)) : 'estimated position');
  } else if (type === 'rounding-explanation') {
    const value = Math.min(9999, Math.max(0, Number(state.value) || 0));
    const unit = [10, 100, 1000].includes(Number(state.roundingUnit)) ? Number(state.roundingUnit) : 10;
    const bounds = getRoundingBounds(value, unit);
    model = `${savedNumberLine(bounds.lower, bounds.upper, value)}<p class="model-equation">${formatMathsNumber(value)} → ${formatMathsNumber(bounds.rounded)} to the nearest ${formatMathsNumber(unit)}</p>`;
  } else if (['addition-model', 'subtraction-model'].includes(type)) {
    model = savedFormalCalculation(state.left, state.right, type === 'subtraction-model', true);
  } else if (type === 'negative-number-route') {
    const lower = Math.min(-10, Number(state.start) || 0, Number(state.end) || 0) - 2;
    const upper = Math.max(10, Number(state.start) || 0, Number(state.end) || 0) + 2;
    model = `${savedNumberLine(lower, upper, state.start, `start ${state.start}`)}${savedNumberLine(lower, upper, state.end, `end ${state.end}`)}<p class="model-equation">Difference: ${Math.abs((Number(state.end) || 0) - (Number(state.start) || 0))}</p>`;
  } else if (type === 'roman-numeral') {
    const value = Math.min(100, Math.max(1, Number(state.romanValue) || 1));
    model = `<p class="roman-answer">${formatMathsNumber(value)} = <strong>${escapeHTML(state.romanInput || arabicToRoman(value))}</strong></p>`;
  } else if (type === 'ordered-number-set') {
    model = `<p class="ordered-result">${[...(state.orderValues || [])].sort((a, b) => a - b).map((value) => `<strong>${formatMathsNumber(Number(value) || 0)}</strong>`).join('<b>‹</b>')}</p>`;
  } else if (type === 'comparison-explanation') {
    model = `<p class="model-equation">${formatMathsNumber(Number(state.left ?? state.value) || 0)} ${state.mode === 'stepper' ? '→' : Number(state.left) === Number(state.right) ? '=' : Number(state.left) > Number(state.right) ? '>' : '<'} ${formatMathsNumber(Number(state.right ?? state.value) || 0)}</p>`;
  } else if (type === 'estimate-comparison') {
    const left = Number(state.left) || 0; const right = Number(state.right) || 0; const subtraction = state.operation === 'subtraction';
    model = `<p class="model-equation">${formatMathsNumber(left)} ${subtraction ? '−' : '+'} ${formatMathsNumber(right)} = ${formatMathsNumber(subtraction ? Math.abs(left - right) : left + right)}</p>`;
  } else {
    model = `<dl>${outcomeField('Values', [state.left, state.right, state.third].filter((value) => Number.isFinite(Number(value))).map((value) => formatMathsNumber(Number(value))))}${outcomeField('Strategy', state.strategyChoice || content.strategy)}${outcomeField('Unit', state.problemUnit)}${outcomeField('Unknown', state.problemUnknown)}${outcomeField('Classification', state.selectedClassification || state.challengeClassification)}${outcomeField('Example', state.exampleEvidence)}${outcomeField('Counterexample', state.counterexampleEvidence)}${outcomeField('Amended statement', state.amendedStatement || state.challengeStatement)}</dl>`;
  }
  return `<section class="saved-outcome-template maths-outcome" data-maths-print><div class="maths-outcome-mark" aria-hidden="true">${artefactSymbols[type] || '◇'}</div><div><h2>${escapeHTML(humanise(type))}</h2>${model}<dl>${explanation}</dl></div></section>`;
}

function renderSavedScienceTree(node, depth = 0) {
  if (!node || depth > 12) return '<span>Incomplete branch</span>';
  if (node.type === 'result') {
    const organism = getOrganism(node.organismId);
    return `<span class="saved-science-result">${escapeHTML(organism?.commonName || 'Unresolved organisms')}</span>`;
  }
  return `<div class="saved-science-branch"><strong>${escapeHTML(node.label || node.questionId || 'Question')}</strong><div><span>Yes</span>${renderSavedScienceTree(node.yes, depth + 1)}</div><div><span>No</span>${renderSavedScienceTree(node.no, depth + 1)}</div></div>`;
}

function renderScienceOutcome(type, content) {
  const state = content.scienceState || {};
  const organisms = (content.organismIds || state.organismIds || []).map(getOrganism).filter(Boolean).slice(0, 12);
  const specimens = organisms.length
    ? `<div class="saved-specimen-grid">${organisms.map((organism) => renderOrganismIllustration(organism, { compact: true })).join('')}</div>`
    : '<p class="muted">Reopen this record to inspect its organism set.</p>';
  let model = specimens;
  if (content.groupMemberships?.length) {
    model += `<div class="saved-science-groups">${content.groupMemberships.map((group) => `<section><h3>${escapeHTML(group.title || 'Group')}</h3><p>${(group.organismIds || []).map((id) => escapeHTML(getOrganism(id)?.commonName || id)).join(' · ') || 'No organisms placed'}</p></section>`).join('')}</div>`;
  }
  if (content.branchLogic) model += `<div class="saved-science-tree" aria-label="Saved branching classification key">${renderSavedScienceTree(content.branchLogic)}</div>`;
  if (content.questionHistory?.length) {
    model += `<ol class="saved-question-history">${content.questionHistory.map((item) => `<li><strong>${escapeHTML(item.label || item.questionId)}</strong> <span>${item.answer === true ? 'Yes' : item.answer === false ? 'No' : ''}</span></li>`).join('')}</ol>`;
  }
  const habitat = content.habitatData || {};
  const change = content.changeScenario || {};
  const surveyRows = content.surveyRows || [];
  return `<section class="saved-outcome-template science-outcome" data-science-print>
    <div class="science-outcome-mark" aria-hidden="true">${artefactSymbols[type] || '◉'}</div>
    <div><h2>${escapeHTML(humanise(type))}</h2>${model}<dl>
      ${outcomeField('Grouping rule', content.groupingRule)}
      ${outcomeField('Habitat', habitat.habitatId)}
      ${outcomeField('Microhabitat', habitat.microhabitatId)}
      ${outcomeField('We observed', change.evidence)}
      ${outcomeField('We know', change.known)}
      ${outcomeField('We predict', change.prediction)}
      ${outcomeField('We are unsure', change.uncertain)}
      ${surveyRows.length ? outcomeField('Survey records', surveyRows.map((row) => `${getOrganism(row.organismId)?.commonName || row.organismId}: ${row.count ?? row.tally ?? 0}`)) : ''}
      ${outcomeField('Generator seed', content.generatorSeed)}
    </dl></div>
  </section>`;
}

function renderOutcomeTemplate(type, content) {
  if (SCIENCE_ARTEFACT_TYPES.has(type)) return renderScienceOutcome(type, content);
  if (NUMBER_ARTEFACT_TYPES.has(type)) {
    return renderMathsOutcome(type, content);
  }
  if (type === 'three-view-comparison') {
    const representations = [
      ['Globe', content.globeView],
      ['Flat world map', content.worldMapView],
      ['Close atlas view', content.atlasView],
    ];
    return `<section class="saved-outcome-template three-view-card" aria-label="Three-view comparison card"><h2>Three useful views</h2><div class="outcome-columns">${representations.map(([label, view]) => {
      const source = safeSvgDataUrl(view?.markup);
      return `<div><strong>${label}</strong>${source ? `<img class="representation-preview" src="${escapeAttr(source)}" alt="Saved ${label.toLowerCase()} representation" />` : '<span>Not captured yet</span>'}</div>`;
    }).join('')}</div><dl>${outcomeField('Remains recognisable', content.recognisable || content.recognisableFeature)}${outcomeField('What changes', content.changes)}${outcomeField('Useful for', content.useful || content.purposeChoice)}</dl></section>`;
  }
  if (type === 'annotated-location-card') {
    return `<section class="saved-outcome-template"><h2>Africa · annotated location</h2><dl>${outcomeField('Map evidence', content.evidenceAnnotations || content.evidence)}${outcomeField('My observation', content.observation)}${outcomeField('My question', content.question)}</dl></section>`;
  }
  if (type === 'place-pin') {
    return `<section class="saved-outcome-template"><h2>The Gambia · Place Pin</h2>${content.scaleTrail?.length ? `<p class="scale-trail">${content.scaleTrail.map((place) => `<span>${escapeHTML(humanise(place))}</span>`).join('<b aria-hidden="true">›</b>')}</p>` : '<p class="muted">The scale trail has not been followed yet.</p>'}<dl>${outcomeField('Pin', content.pinStatus === 'placed-by-learner' ? 'Placed by learner' : 'Not yet placed')}${outcomeField('What I notice', content.observation)}${outcomeField('Where it is', content.explanation)}${outcomeField('What I wonder', content.question)}</dl></section>`;
  }
  if (type === 'climate-pattern-observation') {
    return `<section class="saved-outcome-template"><h2>Broad climate pattern</h2><dl>${outcomeField('Places compared', content.selectedPlaces)}${outcomeField('My careful observation', content.broadPattern || content.observation)}${outcomeField('Important limit', content.caution || content.explanation)}</dl></section>`;
  }
  if (type === 'two-place-comparison') {
    return `<section class="saved-outcome-template"><h2>United Kingdom ⇄ The Gambia</h2><div class="outcome-columns two"><div><strong>United Kingdom</strong><span>Europe · north of the equator · Atlantic coastline</span></div><div><strong>The Gambia</strong><span>West Africa · north of the equator · Atlantic coastline</span></div></div><dl>${outcomeField('Evidence compared', content.evidence)}${outcomeField('Similarity', content.similarity || content.recognisable)}${outcomeField('Difference', content.difference || content.changes)}${outcomeField('Needs another source', content.question)}</dl></section>`;
  }
  if (type === 'journey-thread') {
    return `<section class="saved-outcome-template"><h2>Journey Thread</h2><dl>${outcomeField('Origin', content.origin?.label || content.region)}${outcomeField('Destination', content.destination?.label || content.place)}${outcomeField('Broad direction', content.broadDirection || content.route?.direction)}${outcomeField('Approximate distance', content.approximateDistanceKm ? `${content.approximateDistanceKm.toLocaleString('en-GB')} km` : '')}${outcomeField('Continents', content.continents)}${outcomeField('Oceans', content.oceans)}${outcomeField('My narration', content.explanation)}</dl></section>`;
  }
  if (type === 'place-portrait') {
    return `<section class="saved-outcome-template"><h2>${escapeHTML(content.place || humanise(content.placeId || 'Place'))} · Place Portrait</h2><dl>${outcomeField('Country or region', content.region)}${outcomeField('Broad climate', content.broadClimate || content.climate)}${outcomeField('Physical feature', content.physicalFeature || content.feature)}${outcomeField('Habitat or biome link', content.habitatOrBiome || content.habitat)}${outcomeField('Useful number', content.numericalFact || content.numberFact)}${outcomeField('My observation', content.observation)}${outcomeField('My question', content.question)}</dl></section>`;
  }
  if (type === 'planet-question-response') {
    return `<section class="saved-outcome-template"><h2>Understanding before action</h2><dl>${outcomeField('Possible action', content.action)}${outcomeField('What we need to know', content.observation)}${outcomeField('Who could be affected', content.region)}${outcomeField('My careful position', content.shortSentence || content.explanation)}${outcomeField('Still wondering', content.stillWondering || content.question)}</dl></section>`;
  }
  return '';
}

export function renderHomeView({ profile, recentActivity, workCount = 0 }) {
  const greeting = profile ? `Welcome back, ${escapeHTML(profile.displayName || profile.name)}.` : 'A world for careful looking.';
  return `<section class="page" aria-labelledby="home-title">
    <div class="home-world">
      <svg class="world-skyline" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M0 260 C130 205 250 260 370 226 S610 185 760 230 S1020 185 1200 215 L1200 440 C1070 405 955 435 820 410 S570 440 440 398 S180 430 0 380Z" fill="#9eae92" opacity=".58"/>
        <path d="M0 415 C180 370 265 445 430 410 S735 386 930 430 S1090 408 1200 390 L1200 540 C1010 570 860 516 690 548 S320 520 0 570Z" fill="#829a84" opacity=".42"/>
        <path d="M-80 532 C160 450 335 522 510 487 C684 452 810 525 1280 440" fill="none" stroke="#edf0e9" stroke-width="18" opacity=".6"/>
        <path d="M95 700 C300 610 342 520 520 472 C688 427 710 335 930 287" fill="none" stroke="#c39d72" stroke-width="8" stroke-dasharray="2 17" stroke-linecap="round" opacity=".7"/>
        <path d="M76 258l62-62 66 62M870 263l36-67 40 67M1010 238l48-86 50 86" fill="none" stroke="#536d72" stroke-width="5" opacity=".22"/>
        <g fill="#354f59" opacity=".2">
          <rect x="78" y="286" width="9" height="45"/><circle cx="83" cy="280" r="14"/>
          <rect x="1080" y="284" width="9" height="48"/><circle cx="1085" cy="276" r="16"/>
          <rect x="1018" y="307" width="8" height="37"/><circle cx="1022" cy="300" r="12"/>
        </g>
      </svg>
      <div class="world-intro">
        <p class="eyebrow">${greeting}</p>
        <h1 id="home-title">How can we look after our planet?</h1>
        <p class="lede">Begin anywhere. Look closely. Follow what the evidence reveals.</p>
      </div>
      <aside class="home-key-station no-print" aria-labelledby="home-key-title"><p class="eyebrow">One direct path</p><h2 id="home-key-title">Today’s Key</h2>${renderKeypad()}</aside>
      <button class="atlas-landmark" type="button" data-route="atlas" aria-label="Open Planet Atlas">
        <span class="atlas-orb" aria-hidden="true"></span>
        <span class="atlas-label"><strong>Planet Atlas</strong><span>Globe · map · places · journeys</span></span>
      </button>
      <button class="number-landmark" type="button" data-route="numbers" aria-label="Open Number Expedition"><span class="number-cairn" aria-hidden="true"><i>1</i><i>10</i><i>100</i><i>1,000</i></span><span class="atlas-label"><strong>Number Expedition</strong><span>Build · move · compare · prove</span></span></button>
      <button class="science-landmark" type="button" data-route="living-things" aria-label="Open Living Things Observatory"><span class="science-lens" aria-hidden="true"><i></i><b></b><em></em></span><span class="atlas-label"><strong>Living Things Observatory</strong><span>Observe · group · classify · connect</span></span></button>
    </div>
    ${recentActivity ? `<aside class="paper-panel panel-pad" style="margin-top:1rem" aria-label="Continue a recent pathway">
      <div class="spread">
        <div><p class="eyebrow">A path you opened</p><h3 style="margin:0">${escapeHTML(recentActivity.title)}</h3></div>
        <button class="button tonal" type="button" data-route="activity" data-route-value="${escapeAttr(recentActivity.id)}">Revisit</button>
      </div>
    </aside>` : ''}
  </section>`;
}

export function renderLivingThingsHost({ toolId = null, activityId = null } = {}) {
  return `<div id="living-things-observatory" data-science-tool-id="${escapeAttr(toolId || '')}" data-science-activity-id="${escapeAttr(activityId || '')}"></div>`;
}

export function renderAtlasView() {
  return `<section class="page atlas-page" aria-labelledby="atlas-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">Open exploration · no key needed</p>
        <h1 id="atlas-title">Planet Atlas</h1>
        <p class="lede">Turn Earth, move closer and follow what you notice.</p>
      </div>
    </div>
    <div id="atlas-map" aria-busy="true"></div>
    <div class="atlas-save-strip no-print">
      <label for="atlas-question"><strong>What are you wondering?</strong><span class="small muted"> Optional</span></label>
      <textarea id="atlas-question" maxlength="280" rows="2" placeholder="Add a question to this view…"></textarea>
      <button class="button" type="button" data-action="save-atlas-question">Save view</button>
    </div>
  </section>`;
}

export function renderKeysView({ activities = [], access = [], artifacts = [] }) {
  const accessById = new Map(access.map((item) => [item.activityId || item.activity_id || item.id, item]));
  const opened = activities.filter((activity) => accessById.has(activity.id));
  return `<section class="page" aria-labelledby="keys-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">Paths you have opened</p>
        <h1 id="keys-title">My Keys</h1>
        <p class="lede">Choose a pathway to continue or revisit.</p>
      </div>
      <button class="button" type="button" data-route="key">Enter a Key</button>
    </div>
    ${opened.length ? `<div class="key-environments">
      ${[['planet-atlas', 'Planet Atlas'], ['number-expedition', 'Number Expedition'], ['living-things-observatory', 'Living Things Observatory']].map(([destinationId, destinationTitle]) => {
        const destinationActivities = opened.filter((activity) => activity.destinationId === destinationId);
        if (!destinationActivities.length) return '';
        return `<section class="key-environment"><div class="spread"><div><p class="eyebrow">Open pathways</p><h2>${destinationTitle}</h2></div><span class="small muted">${destinationActivities.length} ${destinationActivities.length === 1 ? 'pathway' : 'pathways'}</span></div><div class="key-path-list">${destinationActivities.map((activity) => {
        const record = accessById.get(activity.id) || {};
        const saved = artifacts.find((artifact) => artifact.activityId === activity.id || artifact.activity === activity.id);
        return `<article class="key-path-row"><div><p class="eyebrow">${escapeHTML(activity.regionId ? humanise(activity.regionId) : activity.rhythm?.[0] || 'Notice')}</p><h3>${escapeHTML(activity.title)}</h3><p>${escapeHTML(activity.shortInvitation || activity.invitation || '')}</p></div><div class="key-row-meta"><span>${saved ? 'Saved work' : `Opened ${formatDate(record.firstOpenedAt || record.createdAt)}`}</span><button class="button" type="button" data-route="activity" data-route-value="${escapeAttr(activity.id)}">${saved ? 'Revisit' : 'Open'}</button></div></article>`;
      }).join('')}</div></section>`;
      }).join('')}
    </div>` : `<div class="empty-state">
      <div>
        <div class="display-type" style="font-size:3rem;color:var(--mineral)" aria-hidden="true">⌘</div>
        <h2>Your key shelf is ready</h2>
        <p class="muted">Enter a four-digit key, or explore either open environment.</p>
        <div class="cluster" style="justify-content:center"><button class="button" type="button" data-route="key">Enter a Key</button><button class="button secondary" type="button" data-route="numbers">Explore numbers</button></div>
      </div>
    </div>`}
  </section>`;
}

export function renderCollectionView({ key, activities = [], artifacts = [] }) {
  if (!key || key.type !== 'collection') {
    return `<section class="page"><div class="empty-state"><div><h1>That collection was not found</h1><button class="button" type="button" data-route="keys">Return to My Keys</button></div></div></section>`;
  }
  const activityIds = new Set(key.activityIds || []);
  const included = activities.filter((activity) => activityIds.has(activity.id));
  return `<section class="page" aria-labelledby="collection-title">
    <div class="page-head">
      <div><p class="eyebrow">Key Collection · ${escapeHTML(key.destinationTitle || humanise(key.destinationId || 'pathways'))}</p><h1 id="collection-title">${escapeHTML(key.childFacingTitle || key.title)}</h1><p class="lede">${escapeHTML(key.description || 'Explore these connected pathways in any order.')}</p></div>
      <button class="button secondary" type="button" data-route="keys">All My Keys</button>
    </div>
    <div class="key-path-list">${included.map((activity) => {
      const saved = artifacts.some((artifact) => artifact.activityId === activity.id || artifact.activity === activity.id);
      return `<article class="key-path-row"><div><p class="eyebrow">${escapeHTML(activity.regionId ? humanise(activity.regionId) : 'Connected pathway')}</p><h2>${escapeHTML(activity.title)}</h2><p>${escapeHTML(activity.shortInvitation || activity.invitation || '')}</p></div><div class="key-row-meta"><span>${saved ? 'Saved work' : 'Ready to explore'}</span><button class="button" type="button" data-route="activity" data-route-value="${escapeAttr(activity.id)}">${saved ? 'Revisit' : 'Open'}</button></div></article>`;
    }).join('')}</div>
  </section>`;
}

export function renderKeyEntryView() {
  return `<section class="page" aria-labelledby="key-title">
    <div class="page-head" style="justify-content:center;text-align:center">
      <div>
        <p class="eyebrow">A direct path through an open world</p>
        <h1 id="key-title">Enter a Key</h1>
        <p class="lede" style="margin-inline:auto">The pathway opens after the fourth digit.</p>
      </div>
    </div>
    <div class="paper-panel panel-pad" style="max-width:31rem;margin:0 auto">
      ${renderKeypad()}
    </div>
  </section>`;
}

export function renderWorkView({ artifacts = [], responses = [], activeFilter = 'all' }) {
  const filters = [
    ['all', 'All work'],
    ['planet-atlas', 'Atlas'],
    ['number-expedition', 'Numbers'],
    ['living-things-observatory', 'Living Things'],
    ['explanation', 'Explanations'],
  ];
  const showFilters = artifacts.length >= 6;
  const effectiveFilter = showFilters ? activeFilter : 'all';
  const visible = effectiveFilter === 'all' ? artifacts : artifacts.filter((artifact) => {
    const haystack = [artifact.destinationId, artifact.destination, artifact.type, artifact.artefactType, ...(artifact.tags || []), ...(artifact.curriculumTags || [])].join(' ').toLowerCase();
    return haystack.includes(effectiveFilter);
  });
  const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  return `<section class="page" aria-labelledby="work-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">Saved ideas and creations</p>
        <h1 id="work-title">My Work</h1>
        <p class="lede">Open something to revisit it without losing the original.</p>
      </div>
    </div>
    <section class="paper-panel panel-pad" aria-labelledby="planet-question-heading">
      <div class="spread">
        <div>
          <p class="eyebrow">A question that grows with you</p>
          <h2 id="planet-question-heading">How can we look after our planet?</h2>
        </div>
        <button class="button tonal no-print" type="button" data-action="open-planet-question">Add what I think now</button>
      </div>
      ${responses.length ? `<div class="question-history">
        ${responses.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((response, index) => `<article class="question-response">
          <p class="eyebrow">${index === 0 ? 'What I think now' : 'What I thought before'} · ${formatDate(response.createdAt, { year: true })}</p>
          <p>${escapeHTML(response.text || response.response || 'A voice response was saved.')}</p>
          ${response.whatChanged ? `<div><strong>What changed my thinking</strong><p>${escapeHTML(response.whatChanged)}</p></div>` : ''}
          ${response.sourceActivityTitle ? `<p class="small muted">Connected pathway: ${escapeHTML(response.sourceActivityTitle)}</p>` : ''}
          ${response.evidenceUsed ? `<div><strong>Evidence I used</strong><p>${escapeHTML(response.evidenceUsed)}</p></div>` : ''}
          ${response.stillWondering ? `<div><strong>I still wonder</strong><p>${escapeHTML(response.stillWondering)}</p></div>` : ''}
          ${response.voicePlaybackUrl ? `<div class="voice-playback"><audio controls preload="metadata" src="${escapeAttr(response.voicePlaybackUrl)}" aria-label="Play this Planet Question voice response"></audio><p class="small muted">Use the controls to replay or change the volume. Any written idea above is the visible alternative.</p></div>` : ''}
          ${response.evidenceIds?.length ? `<p class="small muted">Evidence linked: ${response.evidenceIds.map((id) => artifactById.get(id)?.title).filter(Boolean).map(escapeHTML).join(' · ') || `${response.evidenceIds.length} saved ${response.evidenceIds.length === 1 ? 'piece' : 'pieces'}`}</p>` : ''}
        </article>`).join('')}
      </div>` : '<p class="muted">There is no expected answer. Add a thought when something has changed, connected or made you wonder.</p>'}
    </section>
    <div class="spread work-shelf-heading">
      ${showFilters ? `<div class="segmented no-print" role="group" aria-label="Filter saved work">${filters.map(([id, label]) => `<button type="button" data-work-filter="${id}" aria-pressed="${effectiveFilter === id}">${label}</button>`).join('')}</div>` : '<span></span>'}
      <span class="small muted">${artifacts.length} saved ${artifacts.length === 1 ? 'piece' : 'pieces'}</span>
    </div>
    ${visible.length ? `<div class="work-shelf">
      ${visible.map(renderArtifactCard).join('')}
    </div>` : `<div class="empty-state"><div><div class="display-type" style="font-size:3rem;color:var(--moss)" aria-hidden="true">▱</div><h2>${artifacts.length ? 'No work in this view yet' : 'Your work will gather here'}</h2><p class="muted">Save a map view, mathematical model, scientific record or guided pathway. You can always return to the original.</p><div class="cluster" style="justify-content:center"><button class="button" type="button" data-route="atlas">Explore the atlas</button><button class="button secondary" type="button" data-route="numbers">Explore numbers</button><button class="button secondary" type="button" data-route="living-things">Explore living things</button></div></div></div>`}
  </section>`;
}

export function renderArtifactCard(artifact) {
  const type = artifact.type || artifact.artefactType || 'saved-work';
  const symbol = artefactSymbols[type] || '▱';
  const title = artifact.title || humanise(type);
  const summary = artifact.summary || artifact.explanation || artifact.content?.observation || artifact.content?.question || '';
  return `<article class="shelf-item" data-artifact-id="${escapeAttr(artifact.id)}">
    <div class="work-preview" aria-hidden="true">
      <span class="work-preview-symbol">${symbol}</span>
      ${artifact.preview?.label ? `<span class="small">${escapeHTML(artifact.preview.label)}</span>` : ''}
    </div>
    <div>
      <p class="eyebrow">${escapeHTML(humanise(type))}</p>
      <h3>${escapeHTML(title)}</h3>
      ${summary ? `<p class="muted">${escapeHTML(truncate(summary, 120))}</p>` : ''}
    </div>
    <div class="work-meta"><span>Saved ${formatDate(artifact.updatedAt || artifact.createdAt, { year: true })}</span><span>${artifact.versions?.length || artifact.versionHistory?.length || 1} ${((artifact.versions?.length || artifact.versionHistory?.length || 1) === 1) ? 'version' : 'versions'}</span></div>
    <div class="cluster item-actions">
      <button class="button" type="button" data-route="work" data-route-value="${escapeAttr(artifact.id)}">Open</button>
    </div>
  </article>`;
}

export function renderWorkDetailView(artifact) {
  if (!artifact) return `<section class="page"><div class="empty-state"><div><h1>That saved piece was not found</h1><button class="button" type="button" data-route="work">Return to My Work</button></div></div></section>`;
  const type = artifact.type || artifact.artefactType || 'saved-work';
  const content = artifact.content || {};
  const versions = artifact.versions || artifact.versionHistory || [];
  const outcomeTemplate = renderOutcomeTemplate(type, content);
  const entries = outcomeTemplate ? [] : displayContentEntries(content);
  return `<article class="page" aria-labelledby="work-detail-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">${escapeHTML(humanise(type))}</p>
        <h1 id="work-detail-title">${escapeHTML(artifact.title || humanise(type))}</h1>
        <p class="muted">Last changed ${formatDateTime(artifact.updatedAt || artifact.createdAt)}</p>
      </div>
      <div class="cluster no-print">
        <button class="button secondary" type="button" data-route="work">Back to My Work</button>
        <button class="button" type="button" data-action="print-artifact">Print</button>
      </div>
    </div>
    <div class="two-column">
      <section class="paper-panel panel-pad stack">
        <div class="work-preview" style="min-height:14rem">
          ${renderSavedPreview(artifact, type)}
        </div>
        ${outcomeTemplate}
        ${entries.length ? `<dl class="stack">${entries.map(([key, value]) => `<div><dt class="eyebrow">${escapeHTML(humanise(key))}</dt><dd style="margin:0">${escapeHTML(value)}</dd></div>`).join('')}</dl>` : outcomeTemplate ? '' : '<p class="muted">This piece stores a visual map state. Reopen the activity to explore it again.</p>'}
        ${artifact.explanation && !outcomeTemplatesWithExplanation.has(type) ? `<div><p class="eyebrow">My explanation</p><p>${escapeHTML(artifact.explanation)}</p></div>` : ''}
        ${artifact.voicePlaybackUrl ? `<div class="voice-playback"><p class="eyebrow">My voice explanation</p><audio controls preload="metadata" src="${escapeAttr(artifact.voicePlaybackUrl)}" aria-label="Play my saved voice explanation"></audio><p class="small muted">Use the controls to replay or change the volume. The written explanation remains visible when one was added.</p></div>` : ''}
        ${artifact.reflection ? `<div class="feedback-note"><strong>Reflection</strong><p>${escapeHTML(artifact.reflection)}</p></div>` : ''}
      </section>
      <aside class="paper-panel panel-pad stack no-print">
        <button class="button" type="button" data-action="revise-artifact" data-artifact-id="${escapeAttr(artifact.id)}">Make a new version</button>
        ${versions.length > 1 ? `<button class="button secondary" type="button" data-action="compare-versions" data-artifact-id="${escapeAttr(artifact.id)}">Compare ${versions.length} versions</button>` : ''}
        <details class="work-more-actions">
          <summary>More options</summary>
          <div class="stack">
            <button class="button secondary" type="button" data-action="add-reflection" data-artifact-id="${escapeAttr(artifact.id)}">Add a reflection</button>
            <button class="button secondary" type="button" data-action="duplicate-artifact" data-artifact-id="${escapeAttr(artifact.id)}">Make a separate copy</button>
            <button class="text-button" type="button" data-action="confirm-delete-artifact" data-artifact-id="${escapeAttr(artifact.id)}">Delete this piece…</button>
          </div>
        </details>
      </aside>
    </div>
  </article>`;
}

export function renderSettingsView({ settings }) {
  const scaffold = settings.scaffold || 'core';
  return `<section class="page" aria-labelledby="settings-title">
    <div class="page-head"><div><p class="eyebrow">This learner’s choices</p><h1 id="settings-title">Accessibility & support</h1></div></div>
    <div class="two-column">
      <section class="paper-panel panel-pad">
        ${settingRow('Text size', 'Choose a comfortable reading size.', 'text-size', [['normal', 'Standard'], ['large', 'Large'], ['largest', 'Largest']], settings.textSize || 'normal')}
        ${settingRow('Contrast', 'Strengthen outlines and text.', 'contrast', [['normal', 'Calm'], ['high', 'High']], settings.contrast || 'normal')}
        ${settingRow('Motion', 'Reduce animated map movement and transitions.', 'motion', [['full', 'Gentle'], ['reduced', 'Reduced']], settings.motion || 'full')}
        ${settingRow('Visual detail', 'Hide optional detail while keeping the main idea.', 'complexity', [['full', 'Full'], ['reduced', 'Reduced']], settings.complexity || 'full')}
        ${settingRow('Scaffold', 'Adjust cues, modelling and how many choices appear together.', 'scaffold', [['light', 'Light'], ['core', 'Core'], ['strong', 'Strong'], ['intensive', 'Intensive']], scaffold)}
      </section>
      <aside class="paper-panel panel-pad stack">
        <div><p class="eyebrow">Spoken support</p><h2 style="font-size:1.7rem">Hear instructions and place names</h2><p class="muted">Use the speaker buttons when they appear. Meaningful sound always has a visible alternative.</p></div>
        <button class="button tonal" type="button" data-action="speak-text" data-speak="Planet Atlas. Move from the whole Earth to a particular place. Look carefully at what changes and what stays recognisable.">Hear an example</button>
        <label class="setting-row"><span><strong>Spoken instructions by default</strong><br><span class="small muted">You can still replay them at any time.</span></span><input type="checkbox" data-setting-toggle="spokenInstructions" ${settings.spokenInstructions ? 'checked' : ''} /></label>
        <p class="small muted"><strong>Keyboard:</strong> Tab moves between controls. Enter or Space chooses. Arrow keys move and turn the map when it has focus. Escape closes a panel.</p>
      </aside>
    </div>
  </section>`;
}

function settingRow(title, description, name, choices, current) {
  return `<div class="setting-row"><div><strong>${title}</strong><br><span class="small muted">${description}</span></div><div class="segmented" role="group" aria-label="${title}">${choices.map(([value, label]) => `<button type="button" data-setting="${name}" data-value="${value}" aria-pressed="${current === value}">${label}</button>`).join('')}</div></div>`;
}

export function renderMaintenanceView({ profiles = [] }) {
  return `<section class="page" aria-labelledby="maintenance-title">
    <div class="page-head"><div><p class="eyebrow">Adult utility · this device</p><h1 id="maintenance-title">Prepare, print & protect</h1><p class="lede">Print keys and protect work on this iPad.</p></div></div>
    <div class="content-grid">
      <section class="paper-panel panel-pad stack"><div><p class="eyebrow">Keys</p><h2 style="font-size:1.6rem">Teacher Key Guide</h2></div><button class="button" type="button" data-route="print" data-route-value="key-guide">Open printable guide</button><button class="button secondary" type="button" data-action="add-key-to-all">Add one key to all ${profiles.length} local ${profiles.length === 1 ? 'profile' : 'profiles'}</button></section>
      <section class="paper-panel panel-pad stack"><div><p class="eyebrow">Backup</p><h2 style="font-size:1.6rem">Protect local work</h2></div><button class="button" type="button" data-action="export-backup">Export backup</button><button class="button secondary" type="button" data-action="choose-backup-file">Import backup</button><input class="sr-only" id="backup-file" type="file" accept="application/json,.json" tabindex="-1" /></section>
      <section class="paper-panel panel-pad stack"><div><p class="eyebrow">This device</p><h2 style="font-size:1.6rem">Learner spaces</h2></div>${profiles.map((profile) => `<div class="spread"><span><span aria-hidden="true">${escapeHTML(profileSymbolIcon(profile.symbol))}</span> ${escapeHTML(profile.displayName || profile.name)}</span><button class="text-button" type="button" data-action="profile-tools" data-profile-id="${escapeAttr(profile.id)}">Manage…</button></div>`).join('') || '<p class="muted">No profiles yet.</p>'}<details class="work-more-actions"><summary>Device data options</summary><div class="stack"><p class="small muted">This action explains exactly what it removes and asks again.</p><button class="button danger" type="button" data-action="confirm-clear-all">Clear every local profile and piece of work…</button></div></details></section>
    </div>
  </section>`;
}

export function renderGlossary(glossary = []) {
  return `<aside class="glossary-popover" role="dialog" aria-modal="false" aria-labelledby="glossary-title">
    <div class="spread"><div><p class="eyebrow">Words for looking closely</p><h2 id="glossary-title" style="font-size:1.6rem">Visual glossary</h2></div><button class="icon-button" type="button" data-action="close-glossary" aria-label="Close glossary">×</button></div>
    <label class="sr-only" for="glossary-search">Search the glossary</label><input id="glossary-search" type="search" placeholder="Find a word…" data-glossary-search />
    <div class="stack" style="margin-top:1rem" data-glossary-results>
      ${glossary.filter((entry) => entry.active !== false && (!entry.future || entry.available)).map((entry) => `<article data-glossary-entry="${escapeAttr(entry.term)}"><div class="spread"><h3 style="margin:0">${escapeHTML(entry.term)}</h3><button class="icon-button" style="width:40px;height:40px;min-width:40px" type="button" data-action="speak-text" data-speak="${escapeAttr(entry.pronunciationText || entry.term)}" aria-label="Hear ${escapeAttr(entry.term)}">♪</button></div><p>${escapeHTML(entry.definition || entry.childDefinition || '')}</p>${entry.example ? `<p class="small muted">${escapeHTML(entry.example)}</p>` : ''}</article>`).join('')}
    </div>
  </aside>`;
}

export function renderPlanetQuestionModal({ artifacts = [] }) {
  return `<div class="modal-backdrop" data-modal="planet-question"><section class="modal wide" role="dialog" aria-modal="true" aria-labelledby="planet-response-title"><div class="modal-head"><div><p class="eyebrow">What I think now</p><h2 id="planet-response-title">How can we look after our planet?</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><form class="modal-body stack" id="planet-question-form"><p class="muted">Use a sentence, your voice, or both. There is no single expected answer.</p><label class="stack" style="gap:.4rem"><strong>My idea</strong><textarea name="text" maxlength="700" placeholder="I think… because…"></textarea></label><div class="cluster"><button class="button secondary" type="button" data-action="start-voice-response">Record my voice</button><span data-audio-recorder-status class="small muted">Optional</span></div><details class="response-evidence"><summary>Add what changed, a question or evidence <span class="small muted">optional</span></summary><div class="stack"><div class="two-field-grid"><label class="stack" style="gap:.4rem"><strong>What changed my thinking</strong><textarea name="whatChanged" maxlength="500" placeholder="A map, discussion or piece of work helped me notice…"></textarea></label><label class="stack" style="gap:.4rem"><strong>What I still wonder</strong><textarea name="stillWondering" maxlength="500" placeholder="I still wonder…"></textarea></label></div><fieldset class="stack"><legend><strong>Evidence from My Work</strong></legend>${artifacts.length ? `<div class="choice-grid">${artifacts.slice(0, 8).map((artifact) => `<label class="choice-card" style="min-height:auto"><input type="checkbox" name="evidence" value="${escapeAttr(artifact.id)}" /> <strong>${escapeHTML(artifact.title || humanise(artifact.type))}</strong></label>`).join('')}</div>` : '<p class="small muted">No saved work yet. Your response can stand on its own.</p>'}</fieldset></div></details><button class="button" type="submit">Save what I think now</button></form></section></div>`;
}

export function renderEditArtifactModal(artifact, mode = 'revise') {
  return `<div class="modal-backdrop" data-modal="edit-artifact"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-artifact-title"><div class="modal-head"><div><p class="eyebrow">${mode === 'reflection' ? 'Notice your thinking' : 'Preserve the original'}</p><h2 id="edit-artifact-title">${mode === 'reflection' ? 'Add a reflection' : 'Make a new version'}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><form class="modal-body stack" id="edit-artifact-form" data-artifact-id="${escapeAttr(artifact.id)}" data-edit-mode="${escapeAttr(mode)}">${mode === 'reflection' ? `<div class="choice-grid">${['I noticed something new.','I changed my idea.','I found another way.','I can explain this now.','This connects to something else.','I still have a question.'].map((reflection) => `<button class="choice-card" style="min-height:auto" type="button" data-reflection-choice="${escapeAttr(reflection)}"><strong>${reflection}</strong></button>`).join('')}</div><label class="stack"><strong>My reflection</strong><textarea name="reflection" maxlength="400" required></textarea></label>` : `<label class="stack"><strong>Title</strong><input name="title" type="text" maxlength="80" value="${escapeAttr(artifact.title || '')}" required /></label><label class="stack"><strong>What I want to change or explain</strong><textarea name="explanation" maxlength="700">${escapeHTML(artifact.explanation || '')}</textarea></label>`}<button class="button" type="submit">Save ${mode === 'reflection' ? 'reflection' : 'new version'}</button></form></section></div>`;
}

export function renderVersionCompareModal(artifact) {
  const versions = artifact.versions || artifact.versionHistory || [];
  return `<div class="modal-backdrop" data-modal="versions"><section class="modal wide" role="dialog" aria-modal="true" aria-labelledby="versions-title"><div class="modal-head"><div><p class="eyebrow">Earlier thinking remains visible</p><h2 id="versions-title">Compare versions</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body version-compare-grid">${versions.map((version, index) => {
    const type = version.artefactType || version.artefactTypeId || artifact.type || artifact.artefactType;
    const content = version.content || version.structuredContent || {};
    const outcomeTemplate = renderOutcomeTemplate(type, content);
    const entries = outcomeTemplate ? [] : displayContentEntries(content).slice(0, 8);
    const explanation = version.explanation || version.writtenExplanation;
    return `<article class="paper-panel panel-pad stack"><div><p class="eyebrow">Version ${index + 1} · ${formatDate(version.createdAt || version.timestamp, { year: true })}</p><h3>${escapeHTML(version.title || artifact.title)}</h3></div><div class="work-preview version-preview">${renderSavedPreview(version, type)}</div>${outcomeTemplate}${entries.length ? `<dl class="version-fields">${entries.map(([key, value]) => outcomeField(humanise(key), value)).join('')}</dl>` : ''}${explanation && !outcomeTemplatesWithExplanation.has(type) ? `<div><p class="eyebrow">Explanation at this point</p><p>${escapeHTML(explanation)}</p></div>` : ''}${version.voiceExplanation ? '<p class="small muted">A voice explanation is preserved in this version. Reopen the version to listen in full.</p>' : ''}</article>`;
  }).join('')}</div></section></div>`;
}
