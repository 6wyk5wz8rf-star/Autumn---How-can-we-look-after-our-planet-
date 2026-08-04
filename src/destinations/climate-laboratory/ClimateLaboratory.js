import { escapeAttr, escapeHTML } from '../../utils/dom.js';
import {
  BIOMES,
  CLIMATE_IMPACT_SCENARIOS,
  CLIMATE_LOCATIONS,
  CLIMATE_MODES,
  CLIMATE_RESPONSE_SCENARIOS,
  CLIMATE_SOURCE_RECORDS,
  CLIMATE_TOOLS,
  CLIMATE_ZONES,
  GLOBAL_TEMPERATURE_ANOMALY,
  getClimateLocation,
  getClimateTool,
} from '../../data/climate.js';
import { organismsForHabitat } from '../../data/organisms.js';
import {
  climateSummary,
  compareClimateLocations,
  distributeRainfall,
  modelScene,
  possibleBiomes,
} from '../../climate/model.js';
import { generateClimateTask } from '../../climate/generator.js';
import AtlasMap from '../planet-atlas/AtlasMap.js';

const MONTHS = Object.freeze(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const total = (values) => values.reduce((sum, value) => sum + Number(value || 0), 0);

function defaultState(tool, activity = null, saved = null, scaffold = 'core') {
  const taskKind = ({
    locations: 'locations', seasonality: 'seasonality', 'seasonality-model': 'seasonality',
    model: 'model', biome: 'model', organisms: 'model', effects: 'effects', responses: 'responses',
  })[tool.kind] || 'weather-climate';
  const seed = `${activity?.id || tool.id}:1`;
  const generatedTask = generateClimateTask(taskKind, seed, taskKind === 'weather-climate' ? { locationId: 'united-kingdom' } : {});
  const start = {
    schemaVersion: 1,
    toolId: tool.id,
    modeId: tool.modeId,
    activityId: activity?.id || null,
    seed,
    challengeNumber: 1,
    temperatureC: activity?.id === 'change-temperature' ? 12 : 18,
    rainfallMm: activity?.id === 'change-rainfall' ? 400 : 900,
    seasonality: 'spread',
    leftLocationId: activity?.id === 'compare-uk-gambia-climate' ? 'united-kingdom' : 'united-kingdom',
    rightLocationId: activity?.id === 'compare-uk-gambia-climate' ? 'the-gambia' : 'the-gambia',
    timeScale: 'year',
    labelsVisible: true,
    averagesVisible: scaffold !== 'intensive',
    rangeVisible: scaffold === 'light',
    seasonsVisible: scaffold !== 'intensive',
    selectedZoneId: 'temperate',
    selectedBiomeId: 'temperate-forest',
    impactScenarioId: CLIMATE_IMPACT_SCENARIOS[0].id,
    responseScenarioId: CLIMATE_RESPONSE_SCENARIOS[0].id,
    observed: '',
    known: '',
    inferred: '',
    predicted: '',
    uncertain: '',
    explanation: '',
    comparisonDecision: '',
    board: false,
    boardStep: 0,
    generatedTask,
    atlasMapState: null,
    childActions: [],
  };
  return { ...start, ...(saved && typeof saved === 'object' ? clone(saved) : {}), toolId: tool.id, modeId: tool.modeId, activityId: activity?.id || null };
}

function sourceLabel(location) {
  return `${location.status === 'sourced-rounded' ? 'Sourced, rounded pattern' : location.status} · ${location.dataPeriod} · ${location.unitNote}`;
}

function spokenToolSummary(state, tool, activity) {
  const introduction = `${activity?.title || tool.title}. ${activity?.shortInvitation || tool.invitation}`;
  if (tool.modeId === 'experiment') return `${introduction} Current simplified model: ${state.temperatureC} degrees Celsius and ${state.rainfallMm} millimetres yearly rainfall, with a ${state.seasonality} rainfall pattern.`;
  if (tool.kind === 'warming') {
    const latest = GLOBAL_TEMPERATURE_ANOMALY.points.at(-1);
    return `${introduction} The selected NASA strip ends in ${latest.year} at ${latest.value} degrees Celsius above the 1951 to 1980 average. The strip keeps year-to-year variation.`;
  }
  if (tool.modeId === 'change') {
    const scenario = tool.kind === 'responses'
      ? CLIMATE_RESPONSE_SCENARIOS.find(({ id }) => id === state.responseScenarioId)
      : CLIMATE_IMPACT_SCENARIOS.find(({ id }) => id === state.impactScenarioId);
    return `${introduction} Current simplified scenario: ${scenario?.title || 'evidence and prediction'}. Predictions remain uncertain and may vary by place.`;
  }
  const location = getClimateLocation(state.leftLocationId);
  if (!location) return introduction;
  const summary = climateSummary(location);
  return `${introduction} ${location.title}, ${location.dataPeriod}: rounded annual mean ${summary.meanTemperatureC} degrees Celsius and ${summary.annualRainfallMm} millimetres yearly rainfall. ${location.seasonNote}`;
}

function linePath(values, { min, max, width = 620, height = 160 } = {}) {
  const low = Number.isFinite(min) ? min : Math.min(...values);
  const high = Number.isFinite(max) ? max : Math.max(...values);
  const span = Math.max(1, high - low);
  return values.map((value, index) => {
    const x = 30 + (index / Math.max(1, values.length - 1)) * (width - 60);
    const y = 20 + (1 - (value - low) / span) * (height - 45);
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function renderMonthlyGraph(location, state, { compact = false, idSuffix = 'single' } = {}) {
  const temperatures = location.pattern.temperatureC;
  const rainfall = location.pattern.rainfallMm;
  const maxRain = Math.max(100, ...rainfall);
  const summary = climateSummary(location);
  const graphId = `${location.id}-${idSuffix}`;
  const rainPatternId = `rain-pattern-${graphId}`;
  return `<figure class="climate-graph${compact ? ' compact' : ''}" aria-labelledby="graph-${escapeAttr(graphId)}-caption">
    <svg viewBox="0 0 660 240" role="img" aria-labelledby="graph-${escapeAttr(graphId)}-caption graph-${escapeAttr(graphId)}-data">
      <defs><pattern id="${escapeAttr(rainPatternId)}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#dce8eb"/><path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="#385f6c" stroke-width="1.5"/></pattern></defs>
      <g class="rain-bars">${rainfall.map((value, index) => {
        const height = (value / maxRain) * 145;
        const x = 36 + index * 49.5;
        return `<rect x="${x}" y="${170 - height}" width="28" height="${height}" fill="url(#${escapeAttr(rainPatternId)})"/><path d="M${x} ${170 - height}h28"/>`;
      }).join('')}</g>
      <path class="temperature-line" d="${linePath(temperatures, { min: -40, max: 40, width: 660, height: 190 })}"/>
      ${state.labelsVisible ? `<g class="month-labels">${MONTHS.map((month, index) => `<text x="${50 + index * 49.5}" y="205">${month}</text>`).join('')}</g>` : ''}
    </svg>
    <figcaption id="graph-${escapeAttr(graphId)}-caption"><strong>${escapeHTML(location.title)}</strong>${state.averagesVisible ? ` · average ${summary.meanTemperatureC}°C · ${summary.annualRainfallMm.toLocaleString('en-GB')} mm yearly rainfall` : ''}${state.rangeVisible ? ` · temperature range ${summary.temperatureRangeC}°C` : ''}<span>${escapeHTML(sourceLabel(location))}</span></figcaption>
    <p class="sr-only" id="graph-${escapeAttr(graphId)}-data">${escapeHTML(MONTHS.map((month, index) => `${month}: ${temperatures[index]} degrees Celsius and ${rainfall[index]} millimetres`).join('. '))}.</p>
    ${state.seasonsVisible ? `<p class="season-context"><strong>Season context:</strong> ${escapeHTML(location.seasonNote)}</p>` : ''}
  </figure>`;
}

function renderScene(state, { board = false } = {}) {
  const scene = modelScene(state);
  const wetness = Math.round((scene.rainfallMm / 4000) * 100);
  const warmth = Math.round(((scene.temperatureC + 40) / 80) * 100);
  const sceneStyle = [
    `--scene-wet:${wetness}%`,
    `--scene-wet-soft:${Math.round(wetness * .3)}%`,
    `--scene-dry:${100 - wetness}%`,
    `--scene-warm:${warmth}%`,
    `--scene-cold:${100 - warmth}%`,
    `--scene-cloud-alpha:${(.25 + wetness / 160).toFixed(2)}`,
    `--scene-water-height:${Math.max(8, wetness / 5)}%`,
  ].join(';');
  return `<section class="climate-scene" style="${sceneStyle}" aria-label="Simplified climate scene: ${escapeAttr(scene.description)}">
    <div class="scene-sky"><span class="scene-sun" aria-hidden="true"></span><span class="scene-cloud cloud-a" aria-hidden="true"></span><span class="scene-cloud cloud-b" aria-hidden="true"></span></div>
    <div class="scene-mountains" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="scene-ground" aria-hidden="true"><span></span><b></b><em></em></div>
    <div class="scene-reading"><p class="eyebrow">Explore a simplified climate pattern</p><strong>${scene.temperatureC}°C · ${scene.rainfallMm.toLocaleString('en-GB')} mm yearly rainfall</strong><span>${escapeHTML(scene.description)}</span></div>
    ${board ? '' : `<div class="climate-core-controls no-print">
      ${renderVariableControl('temperatureC', 'Temperature', state.temperatureC, -40, 40, 1, '°C', 'Cooler', 'Warmer')}
      ${renderVariableControl('rainfallMm', 'Yearly rainfall', state.rainfallMm, 0, 4000, 50, ' mm', 'Drier', 'Wetter')}
    </div>`}
    <p class="model-caution"><strong>Simplified model:</strong> ${escapeHTML(scene.caution)}</p>
  </section>`;
}

function renderVariableControl(field, label, value, min, max, step, unit, low, high) {
  return `<fieldset class="climate-variable"><legend>${label}</legend><div class="variable-language"><span>${low}</span><output for="climate-${field}">${Number(value).toLocaleString('en-GB')}${unit}</output><span>${high}</span></div><div class="variable-row"><button type="button" data-climate-action="step" data-field="${field}" data-delta="-${step}" aria-label="Decrease ${label.toLowerCase()}">−</button><input id="climate-${field}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-climate-field="${field}" aria-label="${label}"/><button type="button" data-climate-action="step" data-field="${field}" data-delta="${step}" aria-label="Increase ${label.toLowerCase()}">+</button></div></fieldset>`;
}

function renderNumberLinks(state, board) {
  if (board) return '';
  return `<details class="climate-number-links no-print"><summary>Use a Number Expedition tool</summary><div><button type="button" data-route="number-tool" data-route-value="negative-number-line" data-return-to-context="true" data-number-start="${state.temperatureC}" data-number-end="0">Put ${state.temperatureC}°C on the negative number line</button><button type="button" data-route="number-tool" data-route-value="rounding-tool" data-return-to-context="true" data-number-value="${state.rainfallMm}" data-number-rounding-unit="100">Round ${state.rainfallMm.toLocaleString('en-GB')} mm</button></div><p>These open the shared mathematical instruments; Climate Laboratory does not copy their number engines.</p></details>`;
}

function renderTimeScalePattern(location, state) {
  const month = state.generatedTask?.month ?? 6;
  const monthlyTemperature = location.pattern.temperatureC[month];
  const event = state.generatedTask?.weatherEvent || { temperatureC: monthlyTemperature + 2, rainfallMm: 4 };
  if (state.timeScale === 'day') {
    return `<article class="short-pattern-view"><p class="eyebrow">One day · fictional learning event</p><h2>${MONTHS[month]} near ${escapeHTML(location.shortTitle)}</h2><div class="short-pattern-reading"><strong>${event.temperatureC}°C</strong><strong>${event.rainfallMm} mm rain</strong></div><p>This is weather at a short time. It may sit above or below the longer climate pattern.</p></article>`;
  }
  if (state.timeScale === 'week') {
    const temperatures = [-2, 0, 1, -1, 3, 2, 0].map((offset) => monthlyTemperature + offset);
    const rainfall = [0, 2, 0, 8, 4, 1, 0];
    return `<section class="short-pattern-view"><p class="eyebrow">One week · fictional learning pattern</p><div class="weather-week" role="img" aria-label="Fictional seven-day weather pattern">${temperatures.map((temperature, index) => `<article><small>Day ${index + 1}</small><strong>${temperature}°C</strong><span>${rainfall[index]} mm rain</span></article>`).join('')}</div><p>A week shows variation, but it is still too short to describe a place’s climate.</p></section>`;
  }
  if (state.timeScale === 'multi-year') {
    const average = climateSummary(location).meanTemperatureC;
    const variation = [-0.4, 0.2, -0.1, 0.5, 0.1, 0.7, 0.4, 0.8].map((offset) => Number((average + offset).toFixed(1)));
    return `<figure class="multi-year-pattern"><svg viewBox="0 0 620 210" role="img" aria-labelledby="multi-year-caption multi-year-data"><g class="graph-grid">${[0, 1, 2, 3].map((row) => `<line x1="30" y1="${30 + row * 45}" x2="590" y2="${30 + row * 45}"/>`).join('')}</g><path class="temperature-line" d="${linePath(variation, { min: average - 1, max: average + 1, width: 620, height: 190 })}"/>${variation.map((value, index) => `<circle cx="${30 + index / (variation.length - 1) * 560}" cy="${20 + (1 - (value - (average - 1)) / 2) * 145}" r="5"><title>Learning year ${index + 1}: ${value}°C</title></circle>`).join('')}</svg><figcaption id="multi-year-caption"><strong>Many years · simplified learning pattern</strong><span>Year-to-year variation remains visible. This is not a real forecast or sourced time series.</span></figcaption><p class="sr-only" id="multi-year-data">${variation.map((value, index) => `Learning year ${index + 1}: ${value} degrees Celsius`).join('. ')}.</p></figure>`;
  }
  return renderMonthlyGraph(location, state);
}

function renderPatternTool(state, tool) {
  const location = getClimateLocation(state.leftLocationId) || CLIMATE_LOCATIONS[0];
  if (tool.kind === 'weather-climate') {
    const month = state.generatedTask?.month ?? 6;
    const weather = state.generatedTask?.weatherEvent || { temperatureC: location.pattern.temperatureC[month], rainfallMm: 4 };
    return `<div class="weather-climate-contrast"><article><p class="eyebrow">Weather · a short time</p><h2>${MONTHS[month]} today</h2><strong>${weather.temperatureC}°C · ${weather.rainfallMm} mm rain</strong><p><strong>Fictional learning event.</strong> One event can be unusual. It does not define the climate.</p></article><span aria-hidden="true">⇄</span><article><p class="eyebrow">Climate · a long pattern</p><h2>${escapeHTML(location.title)}</h2><strong>Many years of sourced monthly patterns</strong><p>Climate includes averages, ranges and variation—not twelve identical months.</p></article></div>${renderMonthlyGraph(location, state)}`;
  }
  if (['seasonality', 'years'].includes(tool.kind)) {
    const summary = climateSummary(location);
    const second = distributeRainfall(summary.annualRainfallMm, tool.kind === 'years' ? 'seasonal' : state.seasonality, 7);
    return `<section class="seasonality-workbench"><header><div><p class="eyebrow">Same yearly total, different timing</p><h2>${summary.annualRainfallMm.toLocaleString('en-GB')} mm across a year</h2></div><button type="button" class="button secondary no-print" data-climate-action="toggle-seasonality">${state.seasonality === 'spread' ? 'Concentrate the rainfall' : 'Spread the rainfall'}</button></header><div class="seasonal-strips">${[['Sourced place pattern', location.pattern.rainfallMm], [state.seasonality === 'spread' ? 'Spread model' : 'Seasonal model', second]].map(([label, values]) => `<figure><figcaption>${escapeHTML(label)}</figcaption><div class="monthly-bars" role="img" aria-label="${escapeAttr(label)}: ${values.map((value, index) => `${MONTHS[index]} ${value} millimetres`).join(', ')}">${values.map((value, index) => `<span style="--bar:${Math.max(3, value / Math.max(...values) * 100)}%"><i></i><small>${MONTHS[index]}</small></span>`).join('')}</div></figure>`).join('')}</div><p class="science-feedback">A similar yearly total can arrive in a very different pattern. Seasonality matters to water, plants and living things.</p></section>`;
  }
  return `<section class="pattern-viewer"><div class="pattern-scale no-print" role="group" aria-label="Time scale">${[['day', 'One day'], ['week', 'One week'], ['year', 'One year'], ['multi-year', 'Many years']].map(([id, title]) => `<button type="button" data-climate-action="time-scale" data-value="${id}" aria-pressed="${state.timeScale === id}">${title}</button>`).join('')}</div><p class="pattern-message">${({ day: 'One day shows weather at a short time.', week: 'A week reveals change, but it is still a short window.', year: 'A year reveals monthly and seasonal variation.', 'multi-year': 'Many years let us describe a climate pattern while retaining variation.' })[state.timeScale]}</p>${renderTimeScalePattern(location, state)}${state.timeScale === 'year' ? renderDisplayToggles(state) : ''}</section>`;
}

function renderDisplayToggles(state) {
  return `<div class="climate-display-toggles no-print" aria-label="Graph display choices">${[['labelsVisible', 'Labels'], ['averagesVisible', 'Averages'], ['rangeVisible', 'Range'], ['seasonsVisible', 'Seasons']].map(([field, label]) => `<button type="button" data-climate-action="toggle" data-field="${field}" aria-pressed="${state[field]}">${state[field] ? 'Hide' : 'Show'} ${label.toLowerCase()}</button>`).join('')}</div>`;
}

function renderZoneMap(state) {
  return `<section class="zone-map-workbench"><div class="climate-shared-atlas" data-climate-atlas-map aria-label="Planet Atlas with broad latitude and climate guides"></div><p class="map-framework-note"><strong>The shared Planet Atlas map:</strong> patterned latitude guides show one broad influence. Selecting a five-zone category marks sourced example stations; those points are examples, not zone borders. Rainfall and ocean or inland influence also matter.</p><div class="zone-legend">${CLIMATE_ZONES.map((zone) => `<button type="button" data-climate-action="zone" data-value="${zone.id}" aria-pressed="${state.selectedZoneId === zone.id}"><span data-zone="${zone.id}" aria-hidden="true"></span><strong>${zone.title}</strong></button>`).join('')}</div>${(() => { const zone = CLIMATE_ZONES.find(({ id }) => id === state.selectedZoneId); const examples = CLIMATE_LOCATIONS.filter(({ climateZoneId }) => climateZoneId === zone.id); return `<article class="zone-note" aria-live="polite"><h2>${zone.title}</h2><p>${escapeHTML(zone.pattern)}</p><p><strong>Sourced examples marked on the map:</strong> ${escapeHTML(examples.map(({ title }) => title).join('; ') || 'No station in this small comparison set.')}</p><p><strong>Remember:</strong> ${escapeHTML(zone.cautions.join(' '))} Boundaries are broad patterns, not walls.</p></article>`; })()}</section>`;
}

function renderLocationSelectors(state) {
  const options = (selected) => CLIMATE_LOCATIONS.map((location) => `<option value="${location.id}" ${location.id === selected ? 'selected' : ''}>${escapeHTML(location.title)}</option>`).join('');
  return `<div class="location-selectors no-print"><label>First place<select data-climate-field="leftLocationId">${options(state.leftLocationId)}</select></label><span aria-hidden="true">⇄</span><label>Second place<select data-climate-field="rightLocationId">${options(state.rightLocationId)}</select></label></div>`;
}

function renderMapTool(state, tool) {
  if (tool.kind === 'zones') return renderZoneMap(state);
  const left = getClimateLocation(state.leftLocationId) || CLIMATE_LOCATIONS[0];
  const right = getClimateLocation(state.rightLocationId) || CLIMATE_LOCATIONS[1];
  if (tool.kind === 'latitude') {
    return `<section class="latitude-lens">${renderLocationSelectors(state)}<div class="latitude-model"><span class="pole north">North Pole</span><span class="equator-label">Equator · more direct solar energy broadly</span><span class="pole south">South Pole</span>${[left, right].map((location) => `<i style="--latitude:${(90 - location.latitude) / 180 * 100}%"><b>${escapeHTML(location.shortTitle)}</b><small>${Math.abs(location.latitude)}° ${location.latitude < 0 ? 'S' : 'N'}</small></i>`).join('')}</div><p class="careful-statement">Latitude helps explain broad temperature patterns. Oceans, winds, altitude and local geography also matter. Near the equator does not always mean rainforest.</p></section>`;
  }
  const comparison = compareClimateLocations(left.id, right.id);
  const atlasLinks = [left, right].filter(({ atlasPlaceId }) => atlasPlaceId).map((location) => `<button class="button secondary" type="button" data-route="atlas" data-return-to-context="true" data-atlas-focus="${escapeAttr(location.atlasPlaceId)}">Open ${escapeHTML(location.shortTitle)} in Planet Atlas</button>`).join('');
  return `<section class="location-comparison">${renderLocationSelectors(state)}<div class="comparison-graphs">${renderMonthlyGraph(left, state, { compact: true, idSuffix: 'left' })}${renderMonthlyGraph(right, state, { compact: true, idSuffix: 'right' })}</div><div class="comparison-summary"><strong>${comparison.temperatureDifferenceC}°C difference between rounded annual means</strong><strong>${comparison.rainfallDifferenceMm.toLocaleString('en-GB')} mm difference between rounded yearly totals</strong><p>${escapeHTML(comparison.caution)}</p></div>${atlasLinks ? `<div class="linked-destination-actions no-print">${atlasLinks}</div>` : ''}${tool.kind === 'profile' ? `<details open><summary>Source and place notes</summary><p><strong>${escapeHTML(left.title)}:</strong> ${escapeHTML(left.caution)}</p><p><strong>${escapeHTML(right.title)}:</strong> ${escapeHTML(right.caution)}</p></details>` : ''}</section>`;
}

function renderExperimentTool(state, tool, { board = false } = {}) {
  const scene = modelScene(state);
  if (tool.kind === 'seasonality-model') {
    const spread = distributeRainfall(state.rainfallMm, 'spread', 7);
    const seasonal = distributeRainfall(state.rainfallMm, 'seasonal', 7);
    return `<section class="seasonality-workbench">${renderScene(state, { board })}<div class="seasonal-strips">${[['Rain spread through the year', spread], ['Rain concentrated in one part of the year', seasonal]].map(([label, values]) => `<figure><figcaption>${label} · total ${total(values).toLocaleString('en-GB')} mm</figcaption><div class="monthly-bars" role="img" aria-label="${escapeAttr(label)}">${values.map((value, index) => `<span style="--bar:${Math.max(3, value / Math.max(...values) * 100)}%"><i></i><small>${MONTHS[index]}</small></span>`).join('')}</div></figure>`).join('')}</div><p class="careful-statement">The total stayed the same. The timing changed.</p></section>`;
  }
  if (tool.kind === 'biome') {
    const candidates = possibleBiomes(state);
    return `<section class="biome-workbench">${renderScene(state, { board })}<div class="biome-possibilities"><p class="eyebrow">Possible broad biome connections</p>${candidates.map((biome, index) => `<article class="biome-choice" data-fit="${biome.score}"><span>${index + 1}</span><div><h2>${escapeHTML(biome.title)}</h2><p>${escapeHTML(biome.vegetation)}</p><small>${biome.temperatureFit ? 'temperature fits' : 'temperature at an edge'} · ${biome.rainfallFit ? 'rainfall fits' : 'rainfall at an edge'} · ${biome.seasonalityFit ? 'timing fits' : 'timing differs'}</small></div></article>`).join('')}</div><p class="model-caution">These are possibilities, not exact biome borders. Soil, altitude, fire, drainage and people also influence vegetation.</p></section>`;
  }
  if (tool.kind === 'organisms') {
    const habitats = [...new Set(scene.possibleBiomeIds.flatMap((id) => BIOMES.find((biome) => biome.id === id)?.habitatIds || []))];
    const organisms = habitats.flatMap(organismsForHabitat).filter((organism, index, all) => all.findIndex(({ id }) => id === organism.id) === index).slice(0, 6);
    return `<section class="organism-climate-workbench">${renderScene(state, { board })}<h2>Habitat possibilities and living things</h2><p>The model suggests conditions connected with ${habitats.map((id) => id.replaceAll('-', ' ')).join(', ') || 'several habitats'}. An organism still needs food, water, shelter, space and other conditions.</p><div class="climate-organisms">${organisms.map((organism) => `<article><span class="organism-symbol" aria-hidden="true">${organism.kingdom === 'plant' ? '⌇' : '◌'}</span><div><strong>${escapeHTML(organism.commonName)}</strong><small>${escapeHTML(organism.description)}</small></div></article>`).join('') || '<p>No single organism match is guaranteed by these broad model values.</p>'}</div><button class="button secondary no-print" type="button" data-route="science-tool" data-return-to-context="true" data-route-value="habitat-windows">Open linked habitat evidence</button></section>`;
  }
  return `${renderScene(state, { board })}${renderNumberLinks(state, board)}`;
}

function renderWarmingGraph() {
  const values = GLOBAL_TEMPERATURE_ANOMALY.points.map(({ value }) => value);
  return `<figure class="warming-graph"><svg viewBox="0 0 700 260" role="img" aria-labelledby="warming-caption"><g class="graph-grid">${[0, 1, 2, 3, 4].map((row) => `<line x1="45" y1="${30 + row * 45}" x2="665" y2="${30 + row * 45}"/>`).join('')}</g><path class="warming-line" d="${linePath(values, { min: -0.4, max: 1.4, width: 700, height: 230 })}"/>${GLOBAL_TEMPERATURE_ANOMALY.points.map((point, index) => `<circle cx="${30 + index / (GLOBAL_TEMPERATURE_ANOMALY.points.length - 1) * 640}" cy="${20 + (1 - (point.value + 0.4) / 1.8) * 185}" r="5"><title>${point.year}: ${point.value}°C</title></circle>`).join('')}<text x="45" y="245">1880</text><text x="620" y="245">2025</text></svg><figcaption id="warming-caption"><strong>Global surface temperature difference from the 1951–1980 average</strong><span>${escapeHTML(GLOBAL_TEMPERATURE_ANOMALY.caution)}</span></figcaption></figure>`;
}

function renderChangeTool(state, tool) {
  if (tool.kind === 'warming') return `<section class="warming-workbench"><p class="definition-card"><strong>Global warming</strong> is a long-term rise in Earth’s average surface temperature. It is a global pattern found through evidence over time—not one unusually hot day.</p>${renderWarmingGraph()}<div class="observation-prediction"><p><strong>Observation:</strong> the selected years rise overall, with variation between years.</p><p><strong>Not supported:</strong> every year, day or place warms by exactly the same amount.</p></div></section>`;
  if (tool.kind === 'responses') {
    const current = CLIMATE_RESPONSE_SCENARIOS.find(({ id }) => id === state.responseScenarioId) || CLIMATE_RESPONSE_SCENARIOS[0];
    return `<section class="response-workbench"><div class="scenario-choices no-print">${CLIMATE_RESPONSE_SCENARIOS.map((scenario) => `<button type="button" data-climate-action="response" data-value="${scenario.id}" aria-pressed="${current.id === scenario.id}">${escapeHTML(scenario.title)}</button>`).join('')}</div><article class="response-reasoning"><p class="eyebrow">${current.category === 'reduce' ? 'Reducing causes' : 'Adapting'}</p><h2>${escapeHTML(current.title)}</h2><dl><dt>Who could act?</dt><dd>${escapeHTML(current.scales.join(', '))}</dd><dt>What might improve?</dt><dd>${escapeHTML(current.mayImprove.join(', '))}</dd><dt>What would it need?</dt><dd>${escapeHTML(current.needs.join(', '))}</dd><dt>One trade-off</dt><dd>${escapeHTML(current.tradeOff)}</dd></dl></article><p class="careful-statement">No single response works everywhere. Scale, resources, fairness and local evidence matter.</p></section>`;
  }
  const current = CLIMATE_IMPACT_SCENARIOS.find(({ id }) => id === state.impactScenarioId) || CLIMATE_IMPACT_SCENARIOS[0];
  if (tool.kind === 'effects') return `<section class="impact-workbench"><div class="scenario-choices no-print">${CLIMATE_IMPACT_SCENARIOS.map((scenario) => `<button type="button" data-climate-action="impact" data-value="${scenario.id}" aria-pressed="${current.id === scenario.id}">${escapeHTML(scenario.title)}</button>`).join('')}</div><article><p class="eyebrow">One possible implication</p><h2>${escapeHTML(current.title)}</h2><p><strong>What changed:</strong> ${escapeHTML(current.observation)}</p><div class="possible-effect-chain">${current.possibleEffects.map((effect) => `<span>${escapeHTML(effect)}</span>`).join('<i>may lead to</i>')}</div><p><strong>We are unsure:</strong> ${escapeHTML(current.uncertainty)}</p></article></section>`;
  return renderEvidenceEditor(state, current);
}

function renderEvidenceEditor(state, scenario = null) {
  const fields = [
    ['observed', 'We observed', scenario?.observation || 'What the graph, map or model directly shows.'],
    ['known', 'We know', 'Established information supplied by a source or record.'],
    ['inferred', 'We infer', 'An explanation that connects the evidence.'],
    ['predicted', 'We predict', 'One possible future result. Use may, could or depends on.'],
    ['uncertain', 'We are unsure', scenario?.uncertainty || 'Information still needed before making a stronger claim.'],
  ];
  return `<section class="climate-evidence-editor"><div class="climate-evidence-grid">${fields.map(([field, title, prompt]) => `<label><span>${title}</span><small>${escapeHTML(prompt)}</small><textarea data-climate-field="${field}" maxlength="420" placeholder="Add one careful statement…">${escapeHTML(state[field] || '')}</textarea></label>`).join('')}</div></section>`;
}

function renderTool(state, tool, options = {}) {
  if (tool.modeId === 'patterns') return renderPatternTool(state, tool);
  if (tool.modeId === 'climate-map') return renderMapTool(state, tool);
  if (tool.modeId === 'experiment') return renderExperimentTool(state, tool, options);
  return renderChangeTool(state, tool);
}

function guidedPrompt(activity, state) {
  if (!activity) return '';
  return `<section class="climate-guided-prompt"><p><span>Invitation</span>${escapeHTML(activity.flow.invitation.prompt)}</p><p><span>Make or decide</span>${escapeHTML(activity.flow.make.product)}</p><details><summary>Optional Key Check · unscored</summary><p>${escapeHTML(activity.keyCheck.prompt)}</p><small>Feedback names the climate reasoning. There is no grade, pass or fail.</small></details></section>`;
}

function renderHelp(tool) {
  const demonstrations = {
    patterns: 'Compare one day with the monthly strip. One event may sit above or below the longer pattern.',
    'climate-map': 'Choose the UK and The Gambia. Compare the graph shape before describing either place.',
    experiment: 'Change only rainfall by one step. Name what visibly changed and what the model cannot show.',
    change: 'Read the graph first. Put the direct observation before any prediction.',
  };
  return `<details class="show-me no-print"><summary>Show me</summary><div><p><strong>Watch:</strong> ${escapeHTML(demonstrations[tool.modeId])}</p><p><strong>Example:</strong> “The rainfall total is similar, but it arrives at a different time.”</p><p><strong>Your turn:</strong> Make one change or comparison, then return to the workspace and describe it.</p></div></details>`;
}

function savePayload(state, tool, activity, scaffold) {
  const left = getClimateLocation(state.leftLocationId);
  const right = getClimateLocation(state.rightLocationId);
  const selectedLocations = tool.modeId === 'patterns'
    ? [left].filter(Boolean)
    : tool.modeId === 'climate-map' && tool.kind !== 'zones'
      ? [left, right].filter(Boolean)
      : [];
  const sourceIds = [...new Set([
    ...selectedLocations.flatMap((location) => location.sourceIds || []),
    ...(tool.modeId === 'climate-map' ? ['met-office-climate-zones'] : []),
    ...(tool.kind === 'warming' ? [GLOBAL_TEMPERATURE_ANOMALY.sourceId] : []),
    ...(tool.modeId === 'change' && tool.kind !== 'warming' ? ['ipcc-ar6-impacts-adaptation'] : []),
  ])];
  const sourceRecords = CLIMATE_SOURCE_RECORDS
    .filter(({ id }) => sourceIds.includes(id))
    .map(({ id, publisher, title: sourceTitle, url, dataPeriod, retrievedAt, unit, use }) => ({ id, publisher, title: sourceTitle, url, dataPeriod, retrievedAt, unit: unit || null, use }));
  const usesFictionalShortPattern = tool.kind === 'pattern' && ['day', 'week'].includes(state.timeScale);
  const usesSimplifiedMultiYearPattern = tool.kind === 'pattern' && state.timeScale === 'multi-year';
  const usesSimplifiedModel = tool.modeId === 'experiment'
    || ['seasonality', 'years'].includes(tool.kind)
    || usesSimplifiedMultiYearPattern
    || (tool.modeId === 'change' && tool.kind !== 'warming');
  const dataStatus = tool.kind === 'weather-climate' || usesFictionalShortPattern
    ? 'fictional'
    : usesSimplifiedModel
      ? 'simplified-model'
      : 'sourced-rounded';
  const dataComponents = [
    ...(selectedLocations.length ? [{ id: 'location-patterns', status: 'sourced-rounded', sourceIds: selectedLocations.flatMap((location) => location.sourceIds) }] : []),
    ...(tool.kind === 'weather-climate' ? [{ id: 'generated-weather-event', status: 'fictional', sourceIds: [] }] : []),
    ...(usesFictionalShortPattern ? [{ id: 'generated-short-weather-pattern', status: 'fictional', sourceIds: [] }] : []),
    ...(usesSimplifiedModel ? [{ id: usesSimplifiedMultiYearPattern ? 'multi-year-learning-pattern' : 'learning-model-or-scenario', status: 'simplified-model', sourceIds: tool.modeId === 'change' ? ['ipcc-ar6-impacts-adaptation'] : [] }] : []),
    ...(tool.kind === 'warming' ? [{ id: 'global-temperature-strip', status: 'sourced-rounded', sourceIds: [GLOBAL_TEMPERATURE_ANOMALY.sourceId] }] : []),
  ];
  const title = activity?.title || `${tool.title} · Climate investigation`;
  return {
    destinationId: 'climate-laboratory',
    activityId: activity?.id || `open-climate-${tool.id}`,
    keyActivityId: activity?.id || null,
    title,
    artefactType: activity?.outcome?.artefactTypeId || tool.artefactTypeId,
    curriculumTags: activity?.curriculumTags || ['geography', 'science', 'year-4', 'climate', tool.modeId],
    conceptTags: activity?.conceptTags || ['climate', tool.modeId, tool.kind],
    structuredContent: {
      climateState: { ...clone(state), board: false, boardStep: 0 },
      selectedLocationIds: selectedLocations.map(({ id }) => id),
      sourceIds,
      sourceRecords,
      variableValues: { temperatureC: state.temperatureC, rainfallMm: state.rainfallMm, seasonality: state.seasonality },
      units: { temperature: '°C', rainfall: 'mm yearly rainfall' },
      dataStatus,
      dataComponents,
      dataYear: sourceRecords.map(({ dataPeriod }) => dataPeriod).filter(Boolean).join(' / ') || (dataStatus === 'fictional' ? 'Fictional learning event' : 'Simplified learning model'),
      evidence: { observed: state.observed, known: state.known, inferred: state.inferred, predicted: state.predicted, uncertain: state.uncertain },
      generatorSeed: state.seed,
      keyActivityId: activity?.id || null,
      scaffold,
      linkedAtlasPlaceIds: selectedLocations.map(({ atlasPlaceId }) => atlasPlaceId).filter(Boolean),
      linkedNumberToolIds: ['negative-number-line', 'compare-numbers', 'rounding-tool'],
      linkedLivingThingsHabitatIds: modelScene(state).possibleBiomeIds.flatMap((id) => BIOMES.find((biome) => biome.id === id)?.habitatIds || []),
      savedAt: new Date().toISOString(),
    },
    preview: { type: 'climate', label: title, temperatureC: state.temperatureC, rainfallMm: state.rainfallMm, pattern: tool.modeId },
    writtenExplanation: state.explanation || state.predicted || state.observed || '',
    generatorSeed: state.seed,
  };
}

function renderBoard(state, tool, activity) {
  return `<div class="climate-board-view" role="dialog" aria-modal="true" aria-label="Climate Laboratory Board View"><header><div><p class="eyebrow">Board View · no learner information</p><h1>${escapeHTML(activity?.title || tool.title)}</h1></div><button type="button" data-climate-action="close-board">Exit Board View</button></header><main>${renderTool(state, tool, { board: true })}</main><footer><button type="button" data-climate-action="board-previous">Previous</button><span>Step ${state.boardStep + 1}</span><button type="button" data-climate-action="board-next">Next</button><button type="button" data-climate-action="toggle" data-field="labelsVisible">${state.labelsVisible ? 'Hide' : 'Show'} labels</button><button type="button" data-climate-action="board-reset">Reset</button></footer></div>`;
}

export class ClimateLaboratory {
  constructor(host, { toolId = null, activity = null, savedState = null, scaffold = 'core', returnToContext = false, onChange, onSave, onSpeak, onRecord, onToast } = {}) {
    if (!host) throw new TypeError('Climate Laboratory needs a host.');
    this.host = host;
    this.tool = getClimateTool(activity?.toolId || toolId) || CLIMATE_TOOLS.find(({ id }) => id === 'temperature-rainfall-lab');
    this.activity = activity;
    this.scaffold = scaffold;
    this.returnToContext = returnToContext;
    this.onChange = onChange;
    this.onSave = onSave;
    this.onSpeak = onSpeak;
    this.onRecord = onRecord;
    this.onToast = onToast;
    this.state = defaultState(this.tool, activity, savedState, scaffold);
    this.boardSnapshot = null;
    this.atlasMap = null;
    this.history = [];
    this.future = [];
    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.host.addEventListener('click', this.handleClick);
    this.host.addEventListener('input', this.handleInput);
    this.host.addEventListener('change', this.handleChange);
    this.host.addEventListener('keydown', this.handleKeyDown);
    this.render();
  }

  snapshot() { return clone(this.state); }

  notify(action, detail = {}) {
    if (this.state.board) return;
    this.state.childActions = [...(this.state.childActions || []), { action, detail, at: Date.now() }].slice(-80);
    this.onChange?.(this.snapshot());
  }

  update(mutator, action = 'changed-climate-model', detail = {}, { remember = true } = {}) {
    if (remember) {
      this.history.push(this.snapshot());
      this.history = this.history.slice(-40);
      this.future = [];
    }
    mutator(this.state);
    this.notify(action, detail);
    this.render();
  }

  handleInput(event) {
    const field = event.target.dataset.climateField;
    if (!field || !(field in this.state)) return;
    const numeric = ['temperatureC', 'rainfallMm'].includes(field);
    this.state[field] = numeric ? Number(event.target.value) : event.target.value;
    this.notify('edited-climate-field', { field });
    if (event.target.type === 'range') this.render();
  }

  handleChange(event) {
    const field = event.target.dataset.climateField;
    if (!field || !(field in this.state)) return;
    this.state[field] = ['temperatureC', 'rainfallMm'].includes(field) ? Number(event.target.value) : event.target.value;
    this.notify('changed-climate-field', { field });
    this.render();
  }

  handleKeyDown(event) {
    if (!this.state.board) return;
    if (event.key === 'Escape') { event.preventDefault(); this.closeBoard(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); this.update((state) => { state.boardStep += 1; }, 'board-next', {}, { remember: false }); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); this.update((state) => { state.boardStep = Math.max(0, state.boardStep - 1); }, 'board-previous', {}, { remember: false }); }
  }

  handleClick(event) {
    const button = event.target.closest('[data-climate-action]');
    if (!button || !this.host.contains(button)) return;
    const action = button.dataset.climateAction;
    if (action === 'step') this.update((state) => {
      const field = button.dataset.field;
      const limits = field === 'temperatureC' ? [-40, 40] : [0, 4000];
      state[field] = clamp(Number(state[field]) + Number(button.dataset.delta), ...limits);
    }, 'stepped-climate-variable', { field: button.dataset.field });
    if (action === 'toggle') this.update((state) => { state[button.dataset.field] = !state[button.dataset.field]; }, 'toggled-climate-display', { field: button.dataset.field }, { remember: false });
    if (action === 'toggle-seasonality') this.update((state) => { state.seasonality = state.seasonality === 'spread' ? 'seasonal' : 'spread'; }, 'changed-seasonality');
    if (action === 'time-scale') this.update((state) => { state.timeScale = button.dataset.value; }, 'changed-time-scale', { value: button.dataset.value }, { remember: false });
    if (action === 'zone') this.update((state) => { state.selectedZoneId = button.dataset.value; }, 'inspected-climate-zone', { zoneId: button.dataset.value }, { remember: false });
    if (action === 'impact') this.update((state) => { state.impactScenarioId = button.dataset.value; }, 'inspected-impact-scenario', { scenarioId: button.dataset.value }, { remember: false });
    if (action === 'response') this.update((state) => { state.responseScenarioId = button.dataset.value; }, 'inspected-response-scenario', { scenarioId: button.dataset.value }, { remember: false });
    if (action === 'undo') this.undo();
    if (action === 'redo') this.redo();
    if (action === 'new-task') this.newTask();
    if (action === 'open-board') this.openBoard();
    if (action === 'close-board') this.closeBoard();
    if (action === 'board-next') this.update((state) => { state.boardStep += 1; }, 'board-next', {}, { remember: false });
    if (action === 'board-previous') this.update((state) => { state.boardStep = Math.max(0, state.boardStep - 1); }, 'board-previous', {}, { remember: false });
    if (action === 'board-reset') this.update((state) => { state.boardStep = 0; state.labelsVisible = true; }, 'board-reset', {}, { remember: false });
    if (action === 'speak') this.onSpeak?.(spokenToolSummary(this.state, this.tool, this.activity));
    if (action === 'record') this.onRecord?.(button);
    if (action === 'save') void this.onSave?.(savePayload(this.state, this.tool, this.activity, this.scaffold), this.snapshot());
  }

  undo() {
    const previous = this.history.pop();
    if (!previous) return;
    this.future.push(this.snapshot());
    this.state = previous;
    this.onChange?.(this.snapshot());
    this.render();
  }

  redo() {
    const next = this.future.pop();
    if (!next) return;
    this.history.push(this.snapshot());
    this.state = next;
    this.onChange?.(this.snapshot());
    this.render();
  }

  newTask() {
    this.update((state) => {
      state.challengeNumber += 1;
      state.seed = `${this.activity?.id || this.tool.id}:${state.challengeNumber}`;
      const kind = this.tool.kind === 'locations' ? 'locations' : this.tool.kind.includes('seasonality') ? 'seasonality' : this.tool.modeId === 'change' ? 'effects' : this.tool.modeId === 'experiment' ? 'model' : 'weather-climate';
      state.generatedTask = generateClimateTask(kind, state.seed);
      if (state.generatedTask.locationIds) [state.leftLocationId, state.rightLocationId] = state.generatedTask.locationIds;
      if (state.generatedTask.temperatureC !== undefined) state.temperatureC = state.generatedTask.temperatureC;
      if (state.generatedTask.rainfallMm !== undefined) state.rainfallMm = state.generatedTask.rainfallMm;
    }, 'generated-climate-task');
  }

  openBoard() {
    this.boardSnapshot = this.snapshot();
    this.state.board = true;
    this.state.boardStep = 0;
    this.render();
  }

  closeBoard() {
    this.state = this.boardSnapshot ? { ...this.boardSnapshot, board: false, boardStep: 0 } : { ...this.state, board: false, boardStep: 0 };
    this.boardSnapshot = null;
    this.render();
  }

  mountSharedAtlasMap() {
    const mapHost = this.host.querySelector('[data-climate-atlas-map]');
    if (!mapHost) return;
    const initialState = {
      ...(this.state.atlasMapState || {}),
      view: 'flat',
      focus: 'world',
      climate: true,
      equator: true,
      labels: true,
      oceans: true,
      tool: 'explore',
      markers: CLIMATE_LOCATIONS
        .filter(({ climateZoneId }) => climateZoneId === this.state.selectedZoneId)
        .map((location) => ({
          id: `climate-source-${location.id}`,
          coordinates: [location.longitude, location.latitude],
          label: `${location.title} · ${CLIMATE_ZONES.find(({ id }) => id === location.climateZoneId)?.title || 'climate'} example`,
          createdAt: 'climate-source-record',
        })),
    };
    this.atlasMap = new AtlasMap(mapHost, {
      title: 'Climate Map · shared Planet Atlas',
      description: 'The shared Planet Atlas map with patterned latitude guides. These guides are broad influences, not exact climate-zone borders.',
      guided: true,
      state: initialState,
      reducedMotion: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,
      onChange: (mapState, reason) => {
        this.state.atlasMapState = { ...mapState, climate: true, equator: true };
        if (!this.state.board) this.notify('changed-shared-atlas-map', { reason });
      },
    });
  }

  render() {
    this.atlasMap?.destroy();
    this.atlasMap = null;
    if (this.state.board) {
      this.host.innerHTML = renderBoard(this.state, this.tool, this.activity);
      this.host.ownerDocument.documentElement.classList.add('board-view-open');
      this.mountSharedAtlasMap();
      return;
    }
    this.host.ownerDocument.documentElement.classList.remove('board-view-open');
    const currentMode = CLIMATE_MODES.find(({ id }) => id === this.tool.modeId);
    const returnControl = this.activity || this.returnToContext
      ? '<button class="text-button" type="button" data-action="return-from-context">← Back</button>'
      : '<button class="text-button" type="button" data-route="home">← Our Planet</button>';
    this.host.innerHTML = `<section class="page climate-laboratory" data-climate-mode="${escapeAttr(this.tool.modeId)}" aria-labelledby="climate-title">
      <header class="climate-destination-head no-print">${returnControl}<div><p class="eyebrow">${this.activity ? 'Guided Key Activity' : 'Open exploration · no key needed'}</p><h1 id="climate-title">${escapeHTML(this.activity?.title || 'Climate Laboratory')}</h1><p class="lede">${escapeHTML(this.activity?.shortInvitation || 'Move temperature or rainfall. What changes?')}</p></div><div class="climate-quiet-actions"><span class="save-status" role="status">Draft saves quietly</span><button class="button secondary" type="button" data-climate-action="speak">Hear</button><button class="button secondary" type="button" data-climate-action="open-board">Board View</button></div></header>
      <nav class="climate-modes no-print" aria-label="Climate Laboratory modes">${CLIMATE_MODES.map((mode) => {
        const firstTool = CLIMATE_TOOLS.find(({ modeId }) => modeId === mode.id);
        return `<button type="button" data-route="climate-tool" data-route-value="${firstTool.id}" aria-current="${mode.id === currentMode.id ? 'page' : 'false'}"><span aria-hidden="true">${mode.mark}</span><strong>${mode.title}</strong></button>`;
      }).join('')}</nav>
      <div class="climate-workspace-head no-print"><div><p class="eyebrow">${escapeHTML(currentMode.title)}</p><h2>${escapeHTML(this.tool.title)}</h2><p>${escapeHTML(this.tool.invitation)}</p></div><details class="climate-more-tools"><summary>More tools</summary><div>${CLIMATE_TOOLS.filter(({ modeId }) => modeId === this.tool.modeId).map((tool) => `<button type="button" data-route="climate-tool" data-route-value="${tool.id}" aria-current="${tool.id === this.tool.id ? 'true' : 'false'}"><strong>${escapeHTML(tool.title)}</strong><span>${escapeHTML(tool.invitation)}</span></button>`).join('')}</div></details></div>
      ${guidedPrompt(this.activity, this.state)}
      <div class="climate-primary-workspace">${renderTool(this.state, this.tool)}</div>
      ${renderHelp(this.tool)}
      <section class="climate-explain"><div><p class="eyebrow">Explain</p><h2>What does your evidence support?</h2></div><label><span>My climate reasoning <small>optional</small></span><textarea data-climate-field="explanation" maxlength="700" placeholder="I observed… This may mean… I am unsure about…">${escapeHTML(this.state.explanation)}</textarea></label>${this.tool.modeId === 'change' || this.activity ? renderEvidenceEditor(this.state) : ''}</section>
      <footer class="climate-save-bar no-print"><div><strong>Keep this investigation?</strong><span>Values, units, sources, evidence labels and the generator seed stay together.</span></div><button class="button secondary" type="button" data-climate-action="undo" ${this.history.length ? '' : 'disabled'}>Undo</button><button class="button secondary" type="button" data-climate-action="redo" ${this.future.length ? '' : 'disabled'}>Redo</button><button class="button secondary" type="button" data-climate-action="new-task">Try another</button><button class="button secondary" type="button" data-climate-action="record">Record voice</button><span data-audio-recorder-status class="small muted">Optional</span><button class="button" type="button" data-climate-action="save">Keep in My Work</button></footer>
    </section>`;
    this.mountSharedAtlasMap();
  }

  destroy() {
    this.atlasMap?.destroy();
    this.atlasMap = null;
    this.host.removeEventListener('click', this.handleClick);
    this.host.removeEventListener('input', this.handleInput);
    this.host.removeEventListener('change', this.handleChange);
    this.host.removeEventListener('keydown', this.handleKeyDown);
    this.host.ownerDocument.documentElement.classList.remove('board-view-open');
  }
}

export default ClimateLaboratory;
