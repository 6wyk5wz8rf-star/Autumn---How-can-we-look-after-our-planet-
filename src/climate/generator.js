import {
  CLIMATE_IMPACT_SCENARIOS,
  CLIMATE_LOCATIONS,
  CLIMATE_RESPONSE_SCENARIOS,
  getClimateLocation,
} from '../data/climate.js';
import { climateSummary, distributeRainfall, modelScene } from './model.js';

function hashSeed(seed) {
  let value = 2166136261;
  for (const character of String(seed || 'climate-default')) {
    value ^= character.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function seededClimateRandom(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (items, random) => items[Math.floor(random() * items.length) % items.length];
const CLIMATE_GENERATOR_KINDS = new Set(['weather-climate', 'locations', 'seasonality', 'model', 'effects', 'responses']);

export function generateClimateTask(kind, seed = `${kind}:1`, { locationId = null } = {}) {
  if (!CLIMATE_GENERATOR_KINDS.has(kind)) throw new RangeError(`Unknown climate generator kind: ${kind}.`);
  const random = seededClimateRandom(seed);
  if (kind === 'locations') {
    const left = pick(CLIMATE_LOCATIONS, random);
    const candidates = CLIMATE_LOCATIONS.filter(({ id }) => id !== left.id);
    const right = pick(candidates, random);
    return { kind, seed, status: 'sourced-rounded', locationIds: [left.id, right.id], summaries: [climateSummary(left), climateSummary(right)] };
  }
  if (kind === 'seasonality') {
    const annualRainfallMm = 600 + Math.round(random() * 1400);
    const peakMonth = Math.floor(random() * 12);
    return {
      kind, seed, status: 'fictional', annualRainfallMm,
      spread: distributeRainfall(annualRainfallMm, 'spread', peakMonth),
      seasonal: distributeRainfall(annualRainfallMm, 'seasonal', peakMonth),
      peakMonth,
    };
  }
  if (kind === 'model') {
    const temperatureC = -10 + Math.round(random() * 44);
    const rainfallMm = Math.round(random() * 3000 / 50) * 50;
    const seasonality = random() > 0.5 ? 'seasonal' : 'spread';
    return { kind, seed, ...modelScene({ temperatureC, rainfallMm, seasonality }) };
  }
  if (kind === 'effects') return { kind, seed, status: 'simplified-model', scenario: pick(CLIMATE_IMPACT_SCENARIOS, random) };
  if (kind === 'responses') return { kind, seed, status: 'simplified-model', scenario: pick(CLIMATE_RESPONSE_SCENARIOS, random) };
  const location = getClimateLocation(locationId) || pick(CLIMATE_LOCATIONS, random);
  const month = Math.floor(random() * 12);
  return {
    kind: 'weather-climate', seed, status: 'fictional', locationId: location.id, month,
    weatherEvent: { status: 'fictional', temperatureC: location.pattern.temperatureC[month] + Math.round(random() * 8 - 4), rainfallMm: Math.max(0, Math.round(random() * 30)) },
    climatePattern: climateSummary(location),
  };
}

export function validateGeneratedClimateTask(task) {
  const errors = [];
  if (!task?.seed || !task.kind || !task.status) errors.push('Generated climate tasks need a kind, seed and provenance status.');
  if (!['fictional', 'simplified-model', 'sourced-rounded'].includes(task?.status)) errors.push('Generated climate tasks need an approved provenance status.');
  if (task.kind === 'locations' && (task.locationIds?.length !== 2 || new Set(task.locationIds).size !== 2)) errors.push('A location task needs two different places.');
  if (task.kind === 'seasonality') {
    if (task.spread?.length !== 12 || task.seasonal?.length !== 12) errors.push('Seasonality patterns need twelve months.');
    if (task.spread?.reduce((sum, value) => sum + value, 0) !== task.annualRainfallMm) errors.push('Spread rainfall does not match its annual total.');
    if (task.seasonal?.reduce((sum, value) => sum + value, 0) !== task.annualRainfallMm) errors.push('Seasonal rainfall does not match its annual total.');
  }
  if (task.status === 'sourced-rounded' && task.kind === 'model') errors.push('Generated model values cannot be labelled sourced.');
  if (task.kind === 'weather-climate') {
    if (task.weatherEvent?.status !== 'fictional') errors.push('A generated one-day weather event must be labelled fictional.');
    if (!getClimateLocation(task.locationId)) errors.push('A weather-and-climate task must refer to a stored climate location.');
    if (task.climatePattern?.locationId !== task.locationId) errors.push('A weather event and its longer climate pattern must refer to the same location.');
  }
  return { valid: errors.length === 0, errors };
}
