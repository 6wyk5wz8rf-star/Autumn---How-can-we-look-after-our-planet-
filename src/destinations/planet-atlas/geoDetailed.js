import { geoContains } from 'd3-geo';
import { feature as topologyFeature, mesh as topologyMesh, merge as topologyMerge } from 'topojson-client';
import countriesTopology from 'world-atlas/countries-50m.json';

const normaliseId = (value) => String(Number(value));
const nameOverrides = Object.freeze({
  270: 'The Gambia',
  826: 'United Kingdom',
});

const rawCountries = topologyFeature(countriesTopology, countriesTopology.objects.countries);

export const COUNTRY_FEATURES = Object.freeze(rawCountries.features.map((country) => {
  const id = normaliseId(country.id);
  return Object.freeze({
    ...country,
    id,
    properties: Object.freeze({
      ...country.properties,
      isoNumeric: id,
      displayName: nameOverrides[id] || country.properties?.name || `Country ${id}`,
    }),
  });
}));

export const COUNTRIES = Object.freeze({ type: 'FeatureCollection', features: COUNTRY_FEATURES });
export const COUNTRY_BORDERS = topologyMesh(
  countriesTopology,
  countriesTopology.objects.countries,
  (left, right) => left !== right,
);
export const LAND = topologyMerge(countriesTopology, countriesTopology.objects.countries.geometries);

export function findCountryAt(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
  return COUNTRY_FEATURES.find((country) => geoContains(country, coordinates)) || null;
}

export default Object.freeze({ COUNTRIES, COUNTRY_BORDERS, LAND, findCountryAt });
