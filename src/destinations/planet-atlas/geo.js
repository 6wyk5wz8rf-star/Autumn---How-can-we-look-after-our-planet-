import {
  geoCentroid,
  geoContains,
  geoDistance,
  geoInterpolate,
} from 'd3-geo';
import { feature as topologyFeature, mesh as topologyMesh, merge as topologyMerge } from 'topojson-client';
import countriesTopology from 'world-atlas/countries-110m.json';

export const ISO_NUMERIC = Object.freeze({
  GAMBIA: '270',
  SENEGAL: '686',
  UNITED_KINGDOM: '826',
});

const AFRICA_COUNTRY_IDS = [
  12, 24, 72, 108, 120, 132, 140, 148, 174, 178, 180, 204, 226, 231,
  232, 262, 266, 270, 288, 324, 384, 404, 426, 430, 434, 450, 454, 466,
  478, 480, 504, 508, 516, 562, 566, 624, 646, 678, 686, 690, 694, 706,
  710, 716, 728, 729, 732, 748, 768, 788, 800, 818, 834, 854, 894,
].map(String);

const WEST_AFRICA_COUNTRY_IDS = [
  132, 204, 270, 288, 324, 384, 430, 466, 478, 562, 566, 624, 686, 694,
  768, 854,
].map(String);

export const REGION_COUNTRY_IDS = Object.freeze({
  africa: Object.freeze(AFRICA_COUNTRY_IDS),
  westAfrica: Object.freeze(WEST_AFRICA_COUNTRY_IDS),
});

export const MAP_ATTRIBUTION = Object.freeze({
  boundaries:
    'Country and coastline geometry: world-atlas countries-110m with countries-50m detail for close views, derived from Natural Earth. Natural Earth data is public domain.',
  riverGambia:
    'River Gambia is shown as a cautious, hand-authored orientation line for this learning atlas. It is approximate, not a navigational or legal boundary source.',
  climate:
    'Climate descriptions are intentionally broad. Latitude is one influence among elevation, winds, ocean currents, season and local geography.',
});

const normaliseId = (value) => String(Number(value));

const rawCountries = topologyFeature(
  countriesTopology,
  countriesTopology.objects.countries,
);

const COUNTRY_NAME_OVERRIDES = Object.freeze({
  [ISO_NUMERIC.GAMBIA]: 'The Gambia',
  [ISO_NUMERIC.UNITED_KINGDOM]: 'United Kingdom',
});

export const COUNTRY_FEATURES = Object.freeze(
  rawCountries.features.map((country) => {
    const id = normaliseId(country.id);
    const naturalEarthName = country.properties?.name || `Country ${id}`;
    return Object.freeze({
      ...country,
      id,
      properties: Object.freeze({
        ...country.properties,
        isoNumeric: id,
        displayName: COUNTRY_NAME_OVERRIDES[id] || naturalEarthName,
      }),
    });
  }),
);

export const COUNTRIES = Object.freeze({
  type: 'FeatureCollection',
  features: COUNTRY_FEATURES,
});

export const COUNTRY_BORDERS = topologyMesh(
  countriesTopology,
  countriesTopology.objects.countries,
  (left, right) => left !== right,
);

export const LAND = topologyMerge(
  countriesTopology,
  countriesTopology.objects.countries.geometries,
);

export const COUNTRY_BY_ID = new Map(
  COUNTRY_FEATURES.map((country) => [country.id, country]),
);

// This deliberately stops near the eastern edge of The Gambia. It is a calm
// orientation cue rather than a claim of survey-level river geometry.
export const RIVER_GAMBIA = Object.freeze({
  type: 'Feature',
  id: 'river-gambia-approximate',
  properties: Object.freeze({
    name: 'River Gambia',
    accuracy: 'approximate educational orientation',
    attribution: MAP_ATTRIBUTION.riverGambia,
  }),
  geometry: Object.freeze({
    type: 'LineString',
    coordinates: Object.freeze([
      Object.freeze([-16.58, 13.45]),
      Object.freeze([-16.27, 13.39]),
      Object.freeze([-15.95, 13.34]),
      Object.freeze([-15.63, 13.38]),
      Object.freeze([-15.28, 13.45]),
      Object.freeze([-14.92, 13.42]),
      Object.freeze([-14.57, 13.53]),
      Object.freeze([-14.24, 13.55]),
      Object.freeze([-13.91, 13.48]),
      Object.freeze([-13.80, 13.44]),
    ]),
  }),
});

export const PLACE_METADATA = Object.freeze({
  world: Object.freeze({
    id: 'world',
    label: 'Earth',
    kind: 'planet',
    coordinates: Object.freeze([0, 12]),
    zoom: Object.freeze({ globe: 1, flat: 1 }),
    highlightIds: Object.freeze([]),
    invitation: 'Move the globe or map to explore the shape of our planet.',
  }),
  africa: Object.freeze({
    id: 'africa',
    label: 'Africa',
    kind: 'continent',
    coordinates: Object.freeze([19, 4]),
    zoom: Object.freeze({ globe: 1.85, flat: 2.35 }),
    highlightIds: REGION_COUNTRY_IDS.africa,
    invitation:
      'Africa is a continent of many countries, regions, climates and communities.',
  }),
  westAfrica: Object.freeze({
    id: 'westAfrica',
    label: 'West Africa',
    kind: 'region',
    coordinates: Object.freeze([-4, 12]),
    zoom: Object.freeze({ globe: 3.8, flat: 4.1 }),
    highlightIds: REGION_COUNTRY_IDS.westAfrica,
    invitation: 'Use the western coastline to keep your sense of location.',
  }),
  gambia: Object.freeze({
    id: 'gambia',
    label: 'The Gambia',
    spokenLabel: 'The Gambia',
    kind: 'country',
    isoNumeric: ISO_NUMERIC.GAMBIA,
    coordinates: Object.freeze([-15.31, 13.44]),
    zoom: Object.freeze({ globe: 11.5, flat: 13.5 }),
    highlightIds: Object.freeze([ISO_NUMERIC.GAMBIA]),
    contextIds: Object.freeze([ISO_NUMERIC.SENEGAL]),
    continent: 'Africa',
    region: 'West Africa',
    equatorRelation: 'north of the equator',
    coastline: 'Atlantic Ocean coastline',
    broadClimate:
      'Broadly tropical, with a marked wet season and dry season; local conditions vary.',
    physicalFeature:
      'The River Gambia crosses the country from east to west, meeting the Atlantic through a low-lying river valley and estuary.',
    surfaceAreaKm2: 11300,
    scaleEvidence:
      'Its long, narrow outline can almost disappear on a world map, so a close atlas view is useful.',
    invitation:
      'The Gambia is a specific country in West Africa, closely bordered by Senegal and shaped by the River Gambia.',
  }),
  senegal: Object.freeze({
    id: 'senegal',
    label: 'Senegal',
    spokenLabel: 'Senegal',
    kind: 'country',
    isoNumeric: ISO_NUMERIC.SENEGAL,
    coordinates: Object.freeze([-14.46, 14.45]),
    zoom: Object.freeze({ globe: 8, flat: 9 }),
    highlightIds: Object.freeze([ISO_NUMERIC.SENEGAL]),
    contextIds: Object.freeze([ISO_NUMERIC.GAMBIA]),
    continent: 'Africa',
    region: 'West Africa',
  }),
  uk: Object.freeze({
    id: 'uk',
    label: 'United Kingdom',
    spokenLabel: 'United Kingdom',
    kind: 'country',
    isoNumeric: ISO_NUMERIC.UNITED_KINGDOM,
    coordinates: Object.freeze([-3.5, 55]),
    zoom: Object.freeze({ globe: 6.4, flat: 7 }),
    highlightIds: Object.freeze([ISO_NUMERIC.UNITED_KINGDOM]),
    continent: 'Europe',
    region: 'Northern Europe',
    equatorRelation: 'north of the equator',
    coastline: 'Atlantic Ocean and surrounding seas',
    broadClimate:
      'Broadly temperate maritime; conditions vary by season, elevation and location.',
    physicalFeature:
      'An island country with long coastlines; uplands are more extensive in the north and west, with broad lowland areas in the south and east.',
    surfaceAreaKm2: 243610,
    scaleEvidence:
      'Its island outline is recognisable at a broader scale, while close views reveal a varied and deeply indented coastline.',
    invitation:
      'Use location, coastline, latitude and scale as evidence when comparing places.',
  }),
});

export const GAMBIA_FOCUS_SEQUENCE = Object.freeze([
  'world',
  'africa',
  'westAfrica',
  'gambia',
]);

export const OCEAN_LABELS = Object.freeze([
  Object.freeze({ label: 'Atlantic Ocean', coordinates: Object.freeze([-32, 8]) }),
  Object.freeze({ label: 'Pacific Ocean', coordinates: Object.freeze([-145, 4]) }),
  Object.freeze({ label: 'Pacific Ocean', coordinates: Object.freeze([150, 4]) }),
  Object.freeze({ label: 'Indian Ocean', coordinates: Object.freeze([79, -22]) }),
  Object.freeze({ label: 'Arctic Ocean', coordinates: Object.freeze([0, 76]) }),
  Object.freeze({ label: 'Southern Ocean', coordinates: Object.freeze([20, -58]) }),
]);

export const CONTINENT_LABELS = Object.freeze([
  Object.freeze({ id: 'africa', label: 'Africa', coordinates: Object.freeze([20, 3]) }),
  Object.freeze({ id: 'europe', label: 'Europe', coordinates: Object.freeze([16, 52]) }),
  Object.freeze({ id: 'asia', label: 'Asia', coordinates: Object.freeze([88, 42]) }),
  Object.freeze({ id: 'north-america', label: 'North America', coordinates: Object.freeze([-104, 43]) }),
  Object.freeze({ id: 'south-america', label: 'South America', coordinates: Object.freeze([-61, -18]) }),
  Object.freeze({ id: 'oceania', label: 'Oceania', coordinates: Object.freeze([135, -25]) }),
  Object.freeze({ id: 'antarctica', label: 'Antarctica', coordinates: Object.freeze([0, -76]) }),
]);

export function getCountryById(id) {
  return COUNTRY_BY_ID.get(normaliseId(id)) || null;
}

export function getCountryName(id) {
  return getCountryById(id)?.properties?.displayName || null;
}

export function findCountryAt(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
  return COUNTRY_FEATURES.find((country) => geoContains(country, coordinates)) || null;
}

export function placeLabelAt(coordinates) {
  const country = findCountryAt(coordinates);
  if (country) return country.properties.displayName;
  const [longitude, latitude] = coordinates;
  const latitudeLabel = `${Math.abs(latitude).toFixed(1)}\u00b0${latitude >= 0 ? 'N' : 'S'}`;
  const longitudeLabel = `${Math.abs(longitude).toFixed(1)}\u00b0${longitude >= 0 ? 'E' : 'W'}`;
  return `${latitudeLabel}, ${longitudeLabel}`;
}

export function getCountryCentroid(id) {
  const country = getCountryById(id);
  return country ? geoCentroid(country) : null;
}

const EARTH_RADIUS_KM = 6371.0088;

export function journeyDistanceKm(origin, destination) {
  if (!origin || !destination) return 0;
  return geoDistance(origin, destination) * EARTH_RADIUS_KM;
}

export function initialBearing(origin, destination) {
  if (!origin || !destination) return 0;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const toDegrees = (radians) => (radians * 180) / Math.PI;
  const [fromLongitude, fromLatitude] = origin.map(toRadians);
  const [toLongitude, toLatitude] = destination.map(toRadians);
  const longitudeDifference = toLongitude - fromLongitude;

  const y = Math.sin(longitudeDifference) * Math.cos(toLatitude);
  const x =
    Math.cos(fromLatitude) * Math.sin(toLatitude) -
    Math.sin(fromLatitude) *
      Math.cos(toLatitude) *
      Math.cos(longitudeDifference);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function bearingToDirection(bearing) {
  const directions = [
    'north',
    'north-east',
    'east',
    'south-east',
    'south',
    'south-west',
    'west',
    'north-west',
  ];
  return directions[Math.round(bearing / 45) % directions.length];
}

export function journeyCrossesEquator(origin, destination) {
  if (!origin || !destination) return false;
  const interpolate = geoInterpolate(origin, destination);
  let previousLatitude = interpolate(0)[1];
  if (Math.abs(previousLatitude) < 1e-7) return true;

  for (let step = 1; step <= 64; step += 1) {
    const latitude = interpolate(step / 64)[1];
    if (
      Math.abs(latitude) < 1e-7 ||
      Math.sign(latitude) !== Math.sign(previousLatitude)
    ) {
      return true;
    }
    previousLatitude = latitude;
  }
  return false;
}

function broadContinentAt(coordinates) {
  const country = findCountryAt(coordinates);
  const countryId = country?.id;
  if (REGION_COUNTRY_IDS.africa.includes(countryId)) return 'Africa';
  if (countryId === ISO_NUMERIC.UNITED_KINGDOM) return 'Europe';
  const [longitude, latitude] = country ? geoCentroid(country) : coordinates;
  if (latitude < -60) return 'Antarctica';
  if (longitude >= 110 && latitude < 5) return 'Oceania';
  if (longitude >= -90 && longitude <= -30 && latitude < 15) return 'South America';
  if (longitude >= -170 && longitude <= -30 && latitude >= 5) return 'North America';
  if (longitude >= -25 && longitude <= 55 && latitude >= 34) return 'Europe';
  if (longitude >= -20 && longitude <= 55 && latitude >= -36 && latitude < 38) return 'Africa';
  if (longitude >= 25 && longitude <= 180 && latitude >= -10) return 'Asia';
  return null;
}

function broadOceanAt(coordinates) {
  const [longitude, latitude] = coordinates;
  if (latitude >= 66) return 'Arctic Ocean';
  if (latitude <= -50) return 'Southern Ocean';
  if (longitude >= 105 || longitude <= -70) return 'Pacific Ocean';
  if (longitude > 20 && longitude < 105 && latitude < 35) return 'Indian Ocean';
  return 'Atlantic Ocean';
}

export function journeyGeographicalContext(origin, destination) {
  const interpolate = geoInterpolate(origin, destination);
  const continents = [...new Set([broadContinentAt(origin), broadContinentAt(destination)].filter(Boolean))];
  const oceans = new Set();
  for (let step = 0; step <= 40; step += 1) {
    const coordinates = interpolate(step / 40);
    if (!findCountryAt(coordinates)) oceans.add(broadOceanAt(coordinates));
  }
  return {
    continents,
    oceans: [...oceans],
    contextIsBroad: true,
  };
}

export function createJourneySummary(points) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const [originPoint, destinationPoint] = points;
  const origin = originPoint.coordinates || originPoint;
  const destination = destinationPoint.coordinates || destinationPoint;
  const bearing = initialBearing(origin, destination);
  const distanceKm = journeyDistanceKm(origin, destination);
  const context = journeyGeographicalContext(origin, destination);

  return {
    origin: {
      coordinates: [...origin],
      label: originPoint.label || placeLabelAt(origin),
    },
    destination: {
      coordinates: [...destination],
      label: destinationPoint.label || placeLabelAt(destination),
    },
    distanceKm: Math.round(distanceKm),
    distanceIsApproximate: true,
    bearingDegrees: Math.round(bearing),
    direction: bearingToDirection(bearing),
    crossesEquator: journeyCrossesEquator(origin, destination),
    continents: context.continents,
    oceans: context.oceans,
    contextIsBroad: context.contextIsBroad,
  };
}

export function isCoordinateVisibleOnGlobe(coordinates, rotation) {
  const visibleCentre = [-rotation[0], -rotation[1]];
  return geoDistance(visibleCentre, coordinates) <= Math.PI / 2;
}
