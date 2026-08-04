import {
  BIOMES,
  CLIMATE_LOCATIONS,
  CLIMATE_SOURCE_RECORDS,
  CLIMATE_ZONES,
  GLOBAL_TEMPERATURE_ANOMALY,
  getClimateLocation,
} from '../data/climate.js';
import { HABITATS, ORGANISMS } from '../data/organisms.js';

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
const total = (values) => values.reduce((sum, value) => sum + Number(value || 0), 0);
const mean = (values) => total(values) / Math.max(1, values.length);

export const CLIMATE_MODEL_LIMITS = Object.freeze({
  temperatureC: Object.freeze([-40, 40]),
  rainfallMm: Object.freeze([0, 4000]),
  seasonality: Object.freeze(['spread', 'seasonal']),
});

export function climateSummary(locationOrId) {
  const location = typeof locationOrId === 'string' ? getClimateLocation(locationOrId) : locationOrId;
  if (!location) throw new TypeError('A known climate location is required.');
  const temperatures = location.pattern.temperatureC;
  const rainfall = location.pattern.rainfallMm;
  return Object.freeze({
    locationId: location.id,
    meanTemperatureC: Math.round(mean(temperatures) * 10) / 10,
    annualRainfallMm: Math.round(total(rainfall)),
    temperatureRangeC: Math.max(...temperatures) - Math.min(...temperatures),
    wettestMonthIndex: rainfall.indexOf(Math.max(...rainfall)),
    driestMonthIndex: rainfall.indexOf(Math.min(...rainfall)),
    climateZoneId: location.climateZoneId,
    latitude: location.latitude,
    longitude: location.longitude,
    hemisphere: location.hemisphere,
    status: location.status,
    dataPeriod: location.dataPeriod,
    sourceIds: [...location.sourceIds],
    unitNote: location.unitNote,
  });
}

export function possibleBiomes({ temperatureC = 16, rainfallMm = 900, seasonality = 'spread' } = {}) {
  const temperature = clamp(temperatureC, ...CLIMATE_MODEL_LIMITS.temperatureC);
  const rainfall = clamp(rainfallMm, ...CLIMATE_MODEL_LIMITS.rainfallMm);
  const pattern = CLIMATE_MODEL_LIMITS.seasonality.includes(seasonality) ? seasonality : 'spread';
  const candidates = BIOMES.map((biome) => {
    const temperatureFit = temperature >= biome.temperature[0] && temperature <= biome.temperature[1];
    const rainfallFit = rainfall >= biome.rainfall[0] && rainfall <= biome.rainfall[1];
    const seasonalityFit = biome.seasonality.includes(pattern);
    const score = [temperatureFit, rainfallFit, seasonalityFit].filter(Boolean).length;
    return { ...biome, score, temperatureFit, rainfallFit, seasonalityFit };
  }).sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
  return candidates.filter((candidate) => candidate.score >= 2).slice(0, 3);
}

export function modelScene({ temperatureC = 16, rainfallMm = 900, seasonality = 'spread' } = {}) {
  const temperature = clamp(temperatureC, ...CLIMATE_MODEL_LIMITS.temperatureC);
  const rainfall = clamp(rainfallMm, ...CLIMATE_MODEL_LIMITS.rainfallMm);
  const biomes = possibleBiomes({ temperatureC: temperature, rainfallMm: rainfall, seasonality });
  const snow = temperature <= 2 ? 'persistent' : temperature <= 8 ? 'seasonal' : 'unlikely';
  const water = rainfall < 250 ? 'very limited' : rainfall < 700 ? 'limited' : rainfall < 1600 ? 'available' : 'abundant';
  const ground = rainfall < 250 ? 'mostly dry' : rainfall > 2200 ? 'often saturated' : 'varied moisture';
  const vegetation = biomes[0]?.vegetation || 'vegetation would depend on conditions not shown by this model';
  return Object.freeze({
    temperatureC: temperature,
    rainfallMm: rainfall,
    seasonality,
    snow,
    water,
    ground,
    vegetation,
    possibleBiomeIds: biomes.map(({ id }) => id),
    status: 'simplified-model',
    description: `${temperature < 8 ? 'Cool' : temperature > 25 ? 'Warm' : 'Moderate'} conditions with ${water} water may support ${biomes.map(({ title }) => title).join(' or ') || 'several possible habitats'}.`,
    caution: 'This is a broad learning model. Temperature, rainfall and seasonality cannot predict one real place or biome by themselves.',
  });
}

export function distributeRainfall(annualRainfallMm, seasonality = 'spread', peakMonth = 7) {
  const annual = clamp(annualRainfallMm, ...CLIMATE_MODEL_LIMITS.rainfallMm);
  if (seasonality === 'spread') {
    const base = Math.floor(annual / 12);
    return Array.from({ length: 12 }, (_, index) => base + (index < annual - base * 12 ? 1 : 0));
  }
  const weights = Array.from({ length: 12 }, (_, index) => {
    const distance = Math.min(Math.abs(index - peakMonth), 12 - Math.abs(index - peakMonth));
    return Math.max(0.05, 1 - distance / 4);
  });
  const weightTotal = total(weights);
  const values = weights.map((weight) => Math.round((weight / weightTotal) * annual));
  values[peakMonth] += Math.round(annual - total(values));
  return values;
}

export function compareClimateLocations(leftId, rightId) {
  const left = getClimateLocation(leftId);
  const right = getClimateLocation(rightId);
  if (!left || !right) throw new TypeError('Two known climate locations are required.');
  const a = climateSummary(left);
  const b = climateSummary(right);
  return Object.freeze({
    left: a,
    right: b,
    temperatureDifferenceC: Math.round(Math.abs(a.meanTemperatureC - b.meanTemperatureC) * 10) / 10,
    rainfallDifferenceMm: Math.abs(a.annualRainfallMm - b.annualRainfallMm),
    sharedZone: a.climateZoneId === b.climateZoneId,
    evidence: `${left.title} has a rounded annual mean of ${a.meanTemperatureC}°C and ${a.annualRainfallMm} mm rainfall; ${right.title} has ${b.meanTemperatureC}°C and ${b.annualRainfallMm} mm.`,
    caution: 'These rounded averages describe broad patterns. They do not describe every day or every part of either place.',
  });
}

export function validateClimateData() {
  const errors = [];
  const sourceIds = new Set(CLIMATE_SOURCE_RECORDS.map(({ id }) => id));
  const zoneIds = new Set(CLIMATE_ZONES.map(({ id }) => id));
  const biomeIds = new Set(BIOMES.map(({ id }) => id));
  const habitatIds = new Set(HABITATS.map(({ id }) => id));
  const organismIds = new Set(ORGANISMS.map(({ id }) => id));
  const locationIds = new Set();

  for (const location of CLIMATE_LOCATIONS) {
    if (locationIds.has(location.id)) errors.push(`Duplicate climate location ID: ${location.id}.`);
    locationIds.add(location.id);
    if (!zoneIds.has(location.climateZoneId)) errors.push(`${location.id} has an unknown climate zone.`);
    if (!location.sourceIds?.length || !location.sourceIds.every((id) => sourceIds.has(id))) errors.push(`${location.id} has missing climate provenance.`);
    if (!location.dataPeriod || !location.status || !location.unitNote || !location.seasonNote) errors.push(`${location.id} needs a period, provenance status, units and season context.`);
    if (!Number.isFinite(location.latitude) || location.latitude < -90 || location.latitude > 90) errors.push(`${location.id} has an invalid latitude.`);
    if (!Number.isFinite(location.longitude) || location.longitude < -180 || location.longitude > 180) errors.push(`${location.id} has an invalid longitude.`);
    if ((location.latitude < 0 ? 'south' : 'north') !== location.hemisphere) errors.push(`${location.id} contradicts its hemisphere label.`);
    for (const [field, values] of Object.entries(location.pattern || {})) {
      if (!Array.isArray(values) || values.length !== 12 || values.some((value) => !Number.isFinite(Number(value)))) errors.push(`${location.id}.${field} must contain twelve numeric months.`);
    }
    if (location.biomeLinks.some((id) => !biomeIds.has(id))) errors.push(`${location.id} has an unknown biome link.`);
  }
  for (const biome of BIOMES) {
    if (biome.habitatIds.some((id) => !habitatIds.has(id))) errors.push(`${biome.id} has an unknown Living Things habitat link.`);
    if (biome.temperature[0] > biome.temperature[1] || biome.rainfall[0] > biome.rainfall[1]) errors.push(`${biome.id} has reversed model limits.`);
  }
  if (!sourceIds.has(GLOBAL_TEMPERATURE_ANOMALY.sourceId)) errors.push('The warming strip has no source record.');
  if (GLOBAL_TEMPERATURE_ANOMALY.points.some((point, index, points) => index && point.year <= points[index - 1].year)) errors.push('Warming years must be strictly ordered.');
  return { valid: errors.length === 0, errors, checked: { locations: locationIds.size, sources: sourceIds.size, zones: zoneIds.size, biomes: biomeIds.size, organisms: organismIds.size } };
}
