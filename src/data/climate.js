/** Build 4 climate, interaction and permanent-key contracts. */

const RETRIEVED_AT = '2026-08-04';

export const CLIMATE_SOURCE_RECORDS = Object.freeze([
  Object.freeze({
    id: 'wmo-climate-normals',
    publisher: 'World Meteorological Organization',
    title: 'WMO Climatological Standard Normals',
    url: 'https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/climate-services/wmo-climatological-normals',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1991–2020',
    use: 'Definition of a 30-year climatological standard normal and the distinction between an isolated event and a long-term pattern.',
  }),
  Object.freeze({
    id: 'met-office-heathrow-climatology',
    publisher: 'Met Office',
    title: 'Heathrow location-specific long-term averages',
    url: 'https://www.metoffice.gov.uk/research/climate/maps-and-data/location-specific-long-term-averages/gcpsvg3nc',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1991–2020',
    unit: 'degrees Celsius and millimetres',
    use: 'Official station monthly maximum temperature, minimum temperature and rainfall. The teaching mean is the displayed maximum and minimum averaged, then rounded to 0.1°C.',
  }),
  Object.freeze({
    id: 'wmo-yundum-climatology',
    publisher: 'World Meteorological Organization and The Gambia Department of Water Resources',
    title: 'Yundum airport climatological information',
    url: 'https://worldweather.wmo.int/en/city.html?cityId=3523',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1991–2020',
    unit: 'degrees Celsius and millimetres',
    use: 'Official station monthly maximum temperature, minimum temperature and rainfall. The teaching mean is the displayed maximum and minimum averaged, then rounded to 0.1°C.',
  }),
  Object.freeze({
    id: 'wmo-manaus-climatology',
    publisher: 'World Meteorological Organization',
    title: 'Manaus climatological information',
    url: 'https://worldweather.wmo.int/en/city.html?cityId=1073',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1961–1990',
    unit: 'degrees Celsius and millimetres',
    use: 'Official monthly maximum temperature, minimum temperature and precipitation. The teaching mean is the displayed maximum and minimum averaged, then rounded to 0.1°C.',
  }),
  Object.freeze({
    id: 'wmo-cairo-climatology',
    publisher: 'World Meteorological Organization',
    title: 'Cairo climatological information',
    url: 'https://worldweather.wmo.int/en/city.html?cityId=248',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1981–2010',
    unit: 'degrees Celsius and millimetres',
    use: 'Official monthly maximum temperature, minimum temperature and precipitation. The teaching mean is the displayed maximum and minimum averaged, then rounded to 0.1°C.',
  }),
  Object.freeze({
    id: 'wmo-yakutsk-climatology',
    publisher: 'World Meteorological Organization',
    title: 'Yakutsk climatological information',
    url: 'https://worldweather.wmo.int/en/city.html?cityId=917',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: 'Source period not supplied',
    unit: 'degrees Celsius and millimetres',
    use: 'Official monthly maximum temperature, minimum temperature and precipitation. The source page does not state the observation period; the product keeps that limitation visible.',
  }),
  Object.freeze({
    id: 'wmo-reykjavik-climatology',
    publisher: 'World Meteorological Organization',
    title: 'Reykjavík climatological information',
    url: 'https://worldweather.wmo.int/en/city.html?cityId=189',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1961–1990',
    unit: 'degrees Celsius and millimetres of precipitation',
    use: 'Official monthly maximum temperature, minimum temperature and precipitation, including rain and snow. The teaching mean is derived and rounded to 0.1°C.',
  }),
  Object.freeze({
    id: 'wmo-cape-town-climatology',
    publisher: 'World Meteorological Organization',
    title: 'Cape Town climatological information',
    url: 'https://worldweather.wmo.int/en/city.html?cityId=138',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1961–1990',
    unit: 'degrees Celsius and millimetres',
    use: 'Official monthly maximum temperature, minimum temperature and precipitation. The teaching mean is the displayed maximum and minimum averaged, then rounded to 0.1°C.',
  }),
  Object.freeze({
    id: 'met-office-climate-zones',
    publisher: 'Met Office',
    title: 'Climate zones',
    url: 'https://weather.metoffice.gov.uk/climate/climate-explained/climate-zones',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: null,
    use: 'One consistent five-zone school framework and cautions about oceans, winds, continents and local geography.',
  }),
  Object.freeze({
    id: 'nasa-global-temperature',
    publisher: 'NASA Goddard Institute for Space Studies',
    title: 'Global Temperature — Earth Indicator',
    url: 'https://science.nasa.gov/earth/explore/earth-indicators/global-temperature/',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: '1880–2025',
    baseline: '1951–1980',
    unit: 'degrees Celsius anomaly',
    use: 'Sourced global change-over-time strip. Annual variation is retained so a trend is not confused with identical change every year.',
  }),
  Object.freeze({
    id: 'ipcc-ar6-impacts-adaptation',
    publisher: 'Intergovernmental Panel on Climate Change',
    title: 'AR6: Impacts, Adaptation and Vulnerability',
    url: 'https://www.ipcc.ch/report/ar6/wg2/',
    retrievedAt: RETRIEVED_AT,
    dataPeriod: 'Sixth Assessment Report',
    use: 'Careful implications, place variation, adaptation, uncertainty and trade-offs.',
  }),
]);

export const CLIMATE_MODES = Object.freeze([
  Object.freeze({ id: 'patterns', title: 'Patterns', mark: '≋', invitation: 'Look across time before naming a climate.' }),
  Object.freeze({ id: 'climate-map', title: 'Climate Map', mark: '◎', invitation: 'Compare broad zones and real places.' }),
  Object.freeze({ id: 'experiment', title: 'Experiment', mark: '⌁', invitation: 'Change one climate variable and inspect the response.' }),
  Object.freeze({ id: 'change', title: 'Change', mark: '↗', invitation: 'Separate evidence, possible effects and uncertainty.' }),
]);

export const CLIMATE_TOOLS = Object.freeze([
  Object.freeze({ id: 'weather-or-climate', title: 'Weather or Climate?', modeId: 'patterns', kind: 'weather-climate', artefactTypeId: 'weather-and-climate-comparison', invitation: 'Compare one short event with a pattern across many years.' }),
  Object.freeze({ id: 'pattern-viewer', title: 'Pattern Viewer', modeId: 'patterns', kind: 'pattern', artefactTypeId: 'climate-pattern-strip', invitation: 'Move from one day to one week, one year and a multi-year pattern.' }),
  Object.freeze({ id: 'seasonal-wheel', title: 'Seasonal Wheel', modeId: 'patterns', kind: 'seasonality', artefactTypeId: 'seasonal-wheel', invitation: 'See when temperature and rainfall change through a year.' }),
  Object.freeze({ id: 'compare-two-years', title: 'Compare Two Years', modeId: 'patterns', kind: 'years', artefactTypeId: 'climate-pattern-strip', invitation: 'Find variation without mistaking one year for the whole climate.' }),
  Object.freeze({ id: 'climate-zone-map', title: 'Climate Zone Map', modeId: 'climate-map', kind: 'zones', artefactTypeId: 'climate-zone-observation', invitation: 'Inspect five broad climate patterns with soft, imperfect boundaries.' }),
  Object.freeze({ id: 'compare-locations', title: 'Compare Locations', modeId: 'climate-map', kind: 'locations', artefactTypeId: 'place-climate-comparison', invitation: 'Compare two places with temperature, rainfall, latitude and seasonality.' }),
  Object.freeze({ id: 'latitude-lens', title: 'Equator and Latitude Lens', modeId: 'climate-map', kind: 'latitude', artefactTypeId: 'latitude-explanation', invitation: 'Notice a broad energy pattern, then add what latitude cannot explain alone.' }),
  Object.freeze({ id: 'place-climate-profile', title: 'Place Climate Profile', modeId: 'climate-map', kind: 'profile', artefactTypeId: 'place-climate-comparison', invitation: 'Build a sourced, dated profile without turning a country into one uniform place.' }),
  Object.freeze({ id: 'temperature-rainfall-lab', title: 'Temperature and Rainfall Lab', modeId: 'experiment', kind: 'model', artefactTypeId: 'child-created-climate-investigation', invitation: 'Move temperature and rainfall. What changes, and what remains uncertain?' }),
  Object.freeze({ id: 'seasonality-lab', title: 'Seasonality Lab', modeId: 'experiment', kind: 'seasonality-model', artefactTypeId: 'seasonality-comparison', invitation: 'Keep the yearly total, but move when the rain arrives.' }),
  Object.freeze({ id: 'climate-to-biome', title: 'Climate to Biome', modeId: 'experiment', kind: 'biome', artefactTypeId: 'climate-to-biome-model', invitation: 'Connect conditions to possible vegetation rather than one guaranteed biome.' }),
  Object.freeze({ id: 'climate-living-things', title: 'Climate and Living Things', modeId: 'experiment', kind: 'organisms', artefactTypeId: 'climate-habitat-connection', invitation: 'Connect climate conditions to habitat resources and organism needs.' }),
  Object.freeze({ id: 'change-over-time', title: 'Change Over Time', modeId: 'change', kind: 'warming', artefactTypeId: 'global-warming-explanation', invitation: 'Inspect a long-term global pattern with year-to-year variation.' }),
  Object.freeze({ id: 'possible-effects', title: 'Possible Effects', modeId: 'change', kind: 'effects', artefactTypeId: 'place-impact-comparison', invitation: 'Compare possible implications in two places without claiming certainty.' }),
  Object.freeze({ id: 'evidence-prediction', title: 'Evidence and Prediction', modeId: 'change', kind: 'evidence', artefactTypeId: 'place-impact-comparison', invitation: 'Sort what is shown, known, inferred, predicted and still uncertain.' }),
  Object.freeze({ id: 'responses-trade-offs', title: 'Responses and Trade-offs', modeId: 'change', kind: 'responses', artefactTypeId: 'climate-response-reasoning', invitation: 'Compare reducing causes and adapting at different scales.' }),
]);

export const CLIMATE_ZONES = Object.freeze([
  Object.freeze({ id: 'tropical', title: 'Tropical', pattern: 'Often warm through the year; rainfall patterns vary greatly.', latitudes: 'Broadly near the equator', texture: 'dots', cautions: ['Not every tropical place is rainforest.', 'Altitude and rainfall can change the local pattern.'] }),
  Object.freeze({ id: 'dry', title: 'Dry', pattern: 'Rainfall is limited compared with water loss; temperatures may vary widely.', latitudes: 'Often, but not only, in subtropical belts', texture: 'diagonal', cautions: ['Dry does not always mean hot.', 'Deserts can be cold, coastal or high-altitude.'] }),
  Object.freeze({ id: 'temperate', title: 'Temperate', pattern: 'Moderate broad temperature patterns with varied rainfall and seasons.', latitudes: 'Middle latitudes', texture: 'waves', cautions: ['Temperate places do not share identical weather.', 'Ocean influence can narrow temperature ranges.'] }),
  Object.freeze({ id: 'continental', title: 'Continental', pattern: 'Often a wider yearly temperature range where ocean influence is weaker.', latitudes: 'Large interiors in middle and higher latitudes', texture: 'grid', cautions: ['Not every inland place is continental.', 'Altitude and winds still matter.'] }),
  Object.freeze({ id: 'polar', title: 'Polar', pattern: 'Very cool broad patterns, with short cool summers or persistent ice.', latitudes: 'High latitudes', texture: 'crosshatch', cautions: ['Polar regions still vary by season and place.', 'Tundra and ice are not the same conditions.'] }),
]);

const pattern = (temperatureC, rainfallMm) => Object.freeze({
  temperatureC: Object.freeze(temperatureC),
  rainfallMm: Object.freeze(rainfallMm),
});

export const CLIMATE_LOCATIONS = Object.freeze([
  Object.freeze({
    id: 'united-kingdom', title: 'Heathrow, United Kingdom', shortTitle: 'UK · Heathrow', latitude: 51.48, longitude: -0.45, atlasPlaceId: 'uk', hemisphere: 'north', climateZoneId: 'temperate',
    pattern: pattern([5.6, 5.8, 7.9, 10.5, 13.7, 16.8, 19.0, 18.7, 15.9, 12.3, 8.4, 5.9], [58.83, 44.96, 38.78, 42.31, 45.91, 47.25, 45.8, 52.78, 49.61, 65.07, 66.63, 57.05]),
    biomeLinks: ['temperate-forest', 'grassland', 'freshwater-coastal'],
    sourceIds: ['met-office-heathrow-climatology'], dataPeriod: '1991–2020', status: 'sourced-rounded', unitNote: 'Monthly mean temperature in °C is derived from the source minimum and maximum; monthly rainfall total is in mm.',
    seasonNote: 'This Northern Hemisphere station has its higher monthly temperatures in June to August; rainfall is present in every month.',
    caution: 'This is one station pattern, not a climate value for every UK place. Coasts, uplands and cities can differ.',
  }),
  Object.freeze({
    id: 'the-gambia', title: 'Yundum airport, The Gambia', shortTitle: 'The Gambia · Yundum', latitude: 13.34, longitude: -16.65, atlasPlaceId: 'gambia', hemisphere: 'north', climateZoneId: 'tropical',
    pattern: pattern([25.2, 26.3, 27.1, 26.7, 27.2, 28.3, 27.9, 27.4, 27.7, 28.1, 27.3, 25.7], [0.4, 0.6, 0, 0, 3.4, 57.8, 226.4, 325.6, 262.8, 64.2, 1.4, 0.2]),
    biomeLinks: ['savanna', 'freshwater-coastal', 'tropical-forest'],
    sourceIds: ['wmo-yundum-climatology'], dataPeriod: '1991–2020', status: 'sourced-rounded', unitNote: 'Monthly mean temperature in °C is derived from the source minimum and maximum; monthly rainfall total is in mm.',
    seasonNote: 'Rainfall is concentrated broadly from June to October; the months from November to May are much drier in this station pattern.',
    caution: 'This is one airport station pattern, not one value for every Gambian place. The coast, River Gambia and inland areas differ.',
  }),
  Object.freeze({
    id: 'manaus-brazil', title: 'Manaus, Brazil', shortTitle: 'Manaus', latitude: -3.1, longitude: -60, atlasPlaceId: null, hemisphere: 'south', climateZoneId: 'tropical',
    pattern: pattern([26.8, 26.8, 26.9, 27.0, 27.1, 27.0, 27.0, 27.8, 28.2, 28.3, 27.9, 27.4], [260.1, 288.3, 313.5, 300.1, 256.3, 113.6, 87.5, 57.9, 83.3, 125.7, 183.0, 216.9]),
    biomeLinks: ['tropical-forest', 'freshwater-coastal'], sourceIds: ['wmo-manaus-climatology'], dataPeriod: '1961–1990', status: 'sourced-rounded', unitNote: 'Monthly mean temperature in °C is derived from the source minimum and maximum; monthly precipitation total is in mm.',
    seasonNote: 'Precipitation is higher broadly from December to May and lower from June to November; temperature varies less than rainfall.',
    caution: 'A location near the equator can have a very different rainfall pattern from another equatorial place.',
  }),
  Object.freeze({
    id: 'cairo-egypt', title: 'Cairo, Egypt', shortTitle: 'Cairo', latitude: 30.0, longitude: 31.2, atlasPlaceId: null, hemisphere: 'north', climateZoneId: 'dry',
    pattern: pattern([14.4, 15.3, 17.9, 21.8, 25.2, 28.0, 28.9, 28.9, 27.4, 24.4, 19.7, 15.7], [4.8, 4.1, 5.7, 1.1, 0.4, 0, 0, 0, 0.1, 0.4, 3.7, 4.5]),
    biomeLinks: ['desert'], sourceIds: ['wmo-cairo-climatology'], dataPeriod: '1981–2010', status: 'sourced-rounded', unitNote: 'Monthly mean temperature in °C is derived from the source minimum and maximum; monthly precipitation total is in mm.',
    seasonNote: 'Precipitation remains very low, while monthly temperatures are higher broadly from May to October; one UK-style season pattern is not enough.',
    caution: 'Dry climates and deserts are varied; the River Nile and urban environment matter locally.',
  }),
  Object.freeze({
    id: 'yakutsk-russia', title: 'Yakutsk, Russia', shortTitle: 'Yakutsk', latitude: 62.0, longitude: 129.7, atlasPlaceId: null, hemisphere: 'north', climateZoneId: 'continental',
    pattern: pattern([-41.0, -35.7, -21.3, -6.4, 6.3, 14.9, 18.3, 14.9, 5.9, -8.7, -29.4, -38.9], [9, 7, 6, 10, 18, 37, 39, 37, 29, 20, 16, 12]),
    biomeLinks: ['temperate-forest', 'tundra'], sourceIds: ['wmo-yakutsk-climatology'], dataPeriod: 'Source period not supplied', status: 'sourced-rounded', unitNote: 'Monthly mean temperature in °C is derived from the source minimum and maximum; monthly precipitation total is in mm.',
    seasonNote: 'The annual temperature range is very large, with the higher monthly means in June to August and very low means from November to March.',
    caution: 'High latitude and inland position help explain the wide annual range. The official source page does not state the data period, so comparisons need care.',
  }),
  Object.freeze({
    id: 'cape-town-south-africa', title: 'Cape Town, South Africa', shortTitle: 'Cape Town', latitude: -33.92, longitude: 18.42, atlasPlaceId: null, hemisphere: 'south', climateZoneId: 'temperate',
    pattern: pattern([20.9, 21.1, 19.8, 17.5, 14.9, 13.0, 12.3, 12.7, 14.0, 16.0, 18.4, 19.9], [15, 17, 20, 41, 69, 93, 82, 77, 40, 30, 14, 17]),
    biomeLinks: ['temperate-forest', 'grassland', 'freshwater-coastal'], sourceIds: ['wmo-cape-town-climatology'], dataPeriod: '1961–1990', status: 'sourced-rounded', unitNote: 'Monthly mean temperature in °C is derived from the source minimum and maximum; monthly precipitation total is in mm.',
    seasonNote: 'In this Southern Hemisphere pattern, December to February are warmer and rainfall is higher broadly from May to August.',
    caution: 'Warm months occur around January and February. This one city pattern does not describe every South African place.',
  }),
  Object.freeze({
    id: 'reykjavik-iceland', title: 'Reykjavík, Iceland', shortTitle: 'Reykjavík', latitude: 64.1, longitude: -21.9, atlasPlaceId: null, hemisphere: 'north', climateZoneId: 'polar',
    pattern: pattern([-0.6, 0.4, 0.6, 3.1, 6.5, 9.2, 10.8, 10.5, 7.6, 4.5, 1.1, -0.3], [75.6, 71.8, 81.8, 58.3, 43.8, 50, 51.8, 61.8, 66.5, 85.6, 72.5, 78.7]),
    biomeLinks: ['tundra', 'freshwater-coastal'], sourceIds: ['wmo-reykjavik-climatology'], dataPeriod: '1961–1990', status: 'sourced-rounded', unitNote: 'Monthly mean temperature in °C is derived from the source minimum and maximum; monthly precipitation in mm includes rain and snow.',
    seasonNote: 'This Northern Hemisphere pattern is milder in June to August, while precipitation occurs in every month and includes rain and snow.',
    caution: 'Despite its high latitude, the nearby ocean moderates the yearly temperature range.',
  }),
]);

export const BIOMES = Object.freeze([
  Object.freeze({ id: 'tropical-forest', title: 'Tropical rainforest', temperature: [20, 34], rainfall: [1800, 5000], seasonality: ['spread', 'seasonal'], vegetation: 'layered evergreen vegetation where moisture remains available', habitatIds: ['tropical-forest'] }),
  Object.freeze({ id: 'savanna', title: 'Savanna or tropical grassland', temperature: [18, 36], rainfall: [500, 1800], seasonality: ['seasonal'], vegetation: 'grasses with scattered trees or shrubs; rainfall timing matters', habitatIds: ['grassland', 'tropical-forest'] }),
  Object.freeze({ id: 'desert', title: 'Desert', temperature: [-5, 45], rainfall: [0, 300], seasonality: ['spread', 'seasonal'], vegetation: 'sparse, drought-adapted vegetation where water is limited', habitatIds: ['desert'] }),
  Object.freeze({ id: 'temperate-forest', title: 'Temperate forest', temperature: [2, 25], rainfall: [500, 2000], seasonality: ['spread', 'seasonal'], vegetation: 'trees and ground plants shaped by moderate temperatures and seasonal change', habitatIds: ['woodland'] }),
  Object.freeze({ id: 'grassland', title: 'Grassland', temperature: [-5, 30], rainfall: [300, 1200], seasonality: ['spread', 'seasonal'], vegetation: 'grasses and herbs where rainfall, fire and grazing limit dense tree cover', habitatIds: ['grassland'] }),
  Object.freeze({ id: 'tundra', title: 'Tundra', temperature: [-35, 12], rainfall: [100, 600], seasonality: ['spread'], vegetation: 'low-growing plants with a short growing season', habitatIds: ['polar-tundra'] }),
  Object.freeze({ id: 'polar-ice', title: 'Polar ice', temperature: [-50, 5], rainfall: [0, 500], seasonality: ['spread'], vegetation: 'little or no land vegetation where persistent ice dominates', habitatIds: ['polar-tundra'] }),
  Object.freeze({ id: 'freshwater-coastal', title: 'Freshwater and coastal systems', temperature: [-5, 35], rainfall: [200, 5000], seasonality: ['spread', 'seasonal'], vegetation: 'varied water-edge vegetation; river flow, tides and salinity also matter', habitatIds: ['freshwater', 'coast-estuary', 'ocean'] }),
]);

export const GLOBAL_TEMPERATURE_ANOMALY = Object.freeze({
  id: 'nasa-giss-teaching-strip',
  sourceId: 'nasa-global-temperature',
  baseline: '1951–1980',
  unit: '°C difference from baseline average',
  status: 'sourced-rounded',
  points: Object.freeze([
    Object.freeze({ year: 1880, value: -0.2 }), Object.freeze({ year: 1900, value: -0.1 }),
    Object.freeze({ year: 1920, value: -0.2 }), Object.freeze({ year: 1940, value: 0.1 }),
    Object.freeze({ year: 1960, value: 0.0 }), Object.freeze({ year: 1980, value: 0.3 }),
    Object.freeze({ year: 2000, value: 0.4 }), Object.freeze({ year: 2010, value: 0.7 }),
    Object.freeze({ year: 2020, value: 1.0 }), Object.freeze({ year: 2024, value: 1.3 }),
    Object.freeze({ year: 2025, value: 1.19 }),
  ]),
  caution: 'This compact strip rounds selected years from the NASA/GISS series. It shows a long-term trend with variation and is not a complete annual dataset.',
});

export const CLIMATE_IMPACT_SCENARIOS = Object.freeze([
  Object.freeze({ id: 'water-timing', title: 'Water arrives at a different time', observation: 'The model moves rainfall into a shorter part of the year.', possibleEffects: ['soil may remain dry for longer', 'short intense rainfall may run off quickly', 'some organisms may lose breeding cues'], uncertainty: 'Water storage, soil, land use and local rainfall intensity are not shown.' }),
  Object.freeze({ id: 'warmer-coast', title: 'A warmer low-lying coast', observation: 'The regional pattern is warmer and sea level is considered separately.', possibleEffects: ['heat may change comfort and water demand', 'coastal flooding risk may change', 'salt water may reach some freshwater areas'], uncertainty: 'Storms, coastal shape, protection and future emissions affect the result.' }),
  Object.freeze({ id: 'less-snow', title: 'Less persistent snow and ice', observation: 'More days in the simplified pattern remain above freezing.', possibleEffects: ['snow cover may last for less time', 'seasonal water timing may shift', 'organisms using snow or ice may lose habitat'], uncertainty: 'Elevation, snowfall, wind and the rate of warming are not fully represented.' }),
  Object.freeze({ id: 'seasonal-timing', title: 'Seasonal timing shifts', observation: 'Warm conditions begin earlier in the model year.', possibleEffects: ['flowering or insect activity may begin earlier', 'linked species may not shift together', 'some growing seasons may lengthen'], uncertainty: 'Species responses, local weather and other habitat pressures vary.' }),
]);

export const CLIMATE_RESPONSE_SCENARIOS = Object.freeze([
  Object.freeze({ id: 'wetland-restoration', title: 'Restore a wetland', category: 'adapt', scales: ['community', 'regional'], mayImprove: ['water storage', 'habitat', 'flood buffering'], needs: ['land', 'local knowledge', 'long-term care'], tradeOff: 'Land and water have existing users, so design and participation matter.' }),
  Object.freeze({ id: 'shade-cooling', title: 'Create shade and cool public spaces', category: 'adapt', scales: ['school', 'community'], mayImprove: ['comfort during heat', 'habitat when planting suits the place'], needs: ['space', 'water', 'maintenance', 'accessible design'], tradeOff: 'Tree species, roots, water use and the needs of different people must be considered.' }),
  Object.freeze({ id: 'clean-electricity', title: 'Use electricity with lower greenhouse-gas emissions', category: 'reduce', scales: ['regional', 'national', 'global'], mayImprove: ['emissions from electricity generation'], needs: ['infrastructure', 'materials', 'planning', 'fair access'], tradeOff: 'Every energy system uses land and materials and must be planned carefully.' }),
  Object.freeze({ id: 'water-storage', title: 'Improve water storage and use', category: 'adapt', scales: ['home', 'community', 'regional'], mayImprove: ['reliability during dry periods'], needs: ['safe storage', 'maintenance', 'fair decisions'], tradeOff: 'Storage helps only when water quality, supply and access are considered together.' }),
  Object.freeze({ id: 'building-efficiency', title: 'Improve how buildings use energy', category: 'reduce', scales: ['home', 'school', 'national'], mayImprove: ['energy demand', 'indoor comfort'], needs: ['materials', 'skills', 'investment'], tradeOff: 'Costs and benefits differ between old buildings, new buildings and climates.' }),
]);

const ACTIVITY_DEFINITIONS = Object.freeze([
  ['weather-today-climate-time', 'Weather Today, Climate Over Time', 'Distinguish a short weather event from a longer climate pattern.', 'patterns', 'weather-or-climate', 'weather-and-climate-comparison', '3759', 'Weather and climate'],
  ['find-climate-pattern', 'Find the Pattern', 'Inspect temperature and rainfall across time and identify repeated features.', 'patterns', 'pattern-viewer', 'climate-pattern-strip', '6417', 'Weather and climate'],
  ['build-seasonal-wheel', 'Build a Seasonal Wheel', 'Represent how conditions change through a year without assuming UK seasons everywhere.', 'patterns', 'seasonal-wheel', 'seasonal-wheel', '9281', 'Weather and climate'],
  ['explore-climate-zones', 'Explore the World’s Climate Zones', 'Locate broad climate zones and explain why their boundaries are not perfect walls.', 'climate-map', 'climate-zone-map', 'climate-zone-observation', '5063', 'Climate around the world'],
  ['latitude-and-climate', 'Latitude and Climate', 'Connect latitude to a broad energy pattern while naming other influences.', 'climate-map', 'latitude-lens', 'latitude-explanation', '1748', 'Climate around the world'],
  ['compare-uk-gambia-climate', 'Compare the United Kingdom and The Gambia', 'Compare two sourced climate patterns without simplistic labels.', 'climate-map', 'compare-locations', 'place-climate-comparison', '8327', 'Climate around the world'],
  ['change-temperature', 'Change the Temperature', 'Alter temperature in a simplified model and record possible environmental responses.', 'experiment', 'temperature-rainfall-lab', 'temperature-experiment', '4591', 'Climate experiments'],
  ['change-rainfall', 'Change the Rainfall', 'Alter rainfall in a simplified model and record possible environmental responses.', 'experiment', 'temperature-rainfall-lab', 'rainfall-experiment', '2168', 'Climate experiments'],
  ['same-total-different-pattern', 'Same Total, Different Pattern', 'Compare similar yearly rainfall totals distributed differently through the year.', 'experiment', 'seasonality-lab', 'seasonality-comparison', '7834', 'Climate experiments'],
  ['from-climate-to-biome', 'From Climate to Biome', 'Connect temperature, rainfall and seasonality to broad biome possibilities.', 'experiment', 'climate-to-biome', 'climate-to-biome-model', '3496', 'Climate, biomes and living things'],
  ['climate-habitat-living-things', 'Climate, Habitat and Living Things', 'Connect climate conditions to habitat resources and organism needs.', 'experiment', 'climate-living-things', 'climate-habitat-connection', '6951', 'Climate, biomes and living things'],
  ['what-is-global-warming', 'What Is Global Warming?', 'Explain a long-term rise in global average surface temperature using evidence across time.', 'change', 'change-over-time', 'global-warming-explanation', '4287', 'Climate change and response'],
  ['different-places-different-effects', 'Different Places, Different Effects', 'Compare possible implications in different locations with cautious language.', 'change', 'possible-effects', 'place-impact-comparison', '9175', 'Climate change and response'],
  ['responding-climate-change', 'Responding to Climate Change', 'Compare reducing causes, adapting, scales and trade-offs.', 'change', 'responses-trade-offs', 'climate-response-reasoning', '5632', 'Climate change and response'],
]);

const MISCONCEPTIONS = Object.freeze({
  patterns: ['Weather and climate are the same.', 'One unusual day defines a climate.', 'A yearly average means every day is close to the average.', 'Seasons are identical in every place.'],
  'climate-map': ['Every place near the equator is rainforest.', 'Climate-zone boundaries are exact walls.', 'Every country has one climate.', 'Every place in Africa is hot and dry.', 'Latitude explains climate completely.'],
  experiment: ['Rainfall total alone defines climate.', 'One variable explains every habitat.', 'A simplified model predicts a real place.', 'One climate zone always produces one biome.'],
  change: ['One hot day proves global warming.', 'One cold day disproves global warming.', 'Every place warms in the same way.', 'Predictions are guaranteed facts.', 'One response is suitable everywhere.', 'Individual actions alone solve climate change.'],
});

const VOCABULARY = Object.freeze({
  patterns: ['weather', 'climate', 'pattern', 'average', 'range', 'temperature', 'rainfall', 'seasonality', 'variation'],
  'climate-map': ['climate zone', 'tropical', 'dry', 'temperate', 'continental', 'polar', 'latitude', 'equator', 'hemisphere'],
  experiment: ['simplified model', 'variable', 'biome', 'vegetation', 'habitat', 'annual total', 'seasonality', 'prediction', 'uncertainty'],
  change: ['global warming', 'climate change', 'evidence', 'trend', 'variation', 'impact', 'adaptation', 'emissions', 'greenhouse gas', 'trade-off'],
});

export const CLIMATE_ACTIVITIES = Object.freeze(ACTIVITY_DEFINITIONS.map((definition, index) => {
  const [id, title, objective, modeId, toolId, artefactTypeId, keyCode, strand] = definition;
  const tool = CLIMATE_TOOLS.find((entry) => entry.id === toolId);
  return Object.freeze({
    id, order: index + 1, title, keyCode, destinationId: 'climate-laboratory', modeId, toolId,
    mode: tool.kind, active: true, route: `#/activity/${id}`, shortInvitation: tool.invitation, invitation: tool.invitation,
    interactionModel: 'continuous-climate-workbench', rhythm: ['Invitation', 'Explore', 'Make', 'Explain'],
    curriculumObjective: objective, curriculumRefs: [`climate-year-4-${String(index + 1).padStart(2, '0')}`],
    curriculumTags: ['geography', 'science', 'mathematics', 'year-4', 'climate', modeId, strand.toLowerCase().replaceAll(' ', '-')],
    curriculumStrand: strand, conceptTags: ['climate', modeId], vocabulary: VOCABULARY[modeId], likelyMisconceptions: MISCONCEPTIONS[modeId],
    flow: {
      invitation: { prompt: objective },
      explore: { prompt: tool.invitation, actions: ['change-one-variable', 'compare-evidence', 'undo', 'try-another'] },
      make: { product: `Keep a ${artefactTypeId.replaceAll('-', ' ')} in My Work.` },
      explain: { prompt: modeId === 'change' ? 'Name the evidence, use cautious language and state what remains uncertain.' : 'Name the pattern or variable another explorer could check.' },
    },
    keyCheck: { unscored: true, prompt: ({
      patterns: 'Which statement describes weather, and which describes a longer climate pattern?',
      'climate-map': 'Which comparison is supported by the map or monthly pattern?',
      experiment: 'Which variable changed, and what response can the simplified model support?',
      change: 'Which statement is an observation, inference, prediction or uncertainty?',
    })[modeId] },
    outcome: { artefactTypeId, titleTemplate: title, printable: true },
    supportedResponseModes: ['touch', 'keyboard', 'visual', 'voice', 'short-text', 'graph-annotation'],
    scaffoldBehaviour: {
      light: 'Show the complete pattern with minimal prompts.',
      core: 'Keep units, source status and evidence labels visible.',
      strong: 'Compare fewer months or locations and offer a sentence stem.',
      intensive: 'Show one variable at a time and highlight the relevant pattern; the climate objective is unchanged.',
    },
    printMetadata: { format: 'A4', blackAndWhite: true, retainUnits: true, retainSources: true },
    boardViewSuitable: true, approximateMinutes: [12, 15, 18, 18, 15, 20, 15, 15, 18, 20, 20, 18, 20, 22][index],
  });
}));

export const CLIMATE_COLLECTIONS = Object.freeze([
  Object.freeze({ id: 'climate-collection-weather-climate', title: 'Weather and Climate', code: '2469', activityIds: CLIMATE_ACTIVITIES.slice(0, 3).map(({ id }) => id), description: 'Three pathways for short events, long patterns and seasonality.' }),
  Object.freeze({ id: 'climate-collection-around-world', title: 'Climate Around the World', code: '8041', activityIds: CLIMATE_ACTIVITIES.slice(3, 6).map(({ id }) => id), description: 'Three pathways for zones, latitude and place comparison.' }),
  Object.freeze({ id: 'climate-collection-experiments', title: 'Climate Experiments', code: '3572', activityIds: CLIMATE_ACTIVITIES.slice(6, 9).map(({ id }) => id), description: 'Three simplified experiments with temperature, rainfall and seasonality.' }),
  Object.freeze({ id: 'climate-collection-biomes-living-things', title: 'Climate, Biomes and Living Things', code: '6815', activityIds: CLIMATE_ACTIVITIES.slice(9, 11).map(({ id }) => id), description: 'Two pathways connecting climate conditions, biomes, habitats and living things.' }),
  Object.freeze({ id: 'climate-collection-change-response', title: 'Climate Change and Response', code: '7926', activityIds: CLIMATE_ACTIVITIES.slice(11, 14).map(({ id }) => id), description: 'Three pathways for global warming, varied implications and responses.' }),
]);

export const CLIMATE_DESTINATION_KEY = Object.freeze({
  id: 'key-destination-climate-laboratory', code: '1457', title: 'Every Climate Laboratory Pathway',
  description: 'Add every current and future Climate Laboratory Key Activity to My Keys.',
});

export const CLIMATE_CURRICULUM_RECORDS = Object.freeze(CLIMATE_ACTIVITIES.map((activity) => Object.freeze({
  id: activity.curriculumRefs[0], subject: 'geography', destinationIds: ['climate-laboratory'], activationBuild: 4,
  activeInBuild1: false, activeInBuild2: false, activeInBuild3: false, activeInBuild4: true,
  objectives: [activity.curriculumObjective], concepts: activity.conceptTags, vocabulary: activity.vocabulary,
  likelyMisconceptions: activity.likelyMisconceptions, relatedConcepts: ['weather', 'climate', 'biome', 'habitat', 'environmental-change'],
  untaughtFriendlyEntry: activity.shortInvitation, supportedResponseModes: activity.supportedResponseModes,
  accessibilitySupports: ['spoken-data', 'pattern-plus-colour', 'stepper-alternative', 'one-variable-at-a-time', 'persistent-units'],
  possibleKeyCheck: activity.keyCheck.prompt, savedArtefactTypeIds: [activity.outcome.artefactTypeId],
  crossCurricularConnections: ['planet-atlas', 'number-expedition', 'living-things-observatory', 'evidence', 'uncertainty'],
})));

export function getClimateTool(id) {
  return CLIMATE_TOOLS.find((tool) => tool.id === id) || null;
}

export function getClimateActivity(id) {
  return CLIMATE_ACTIVITIES.find((activity) => activity.id === id) || null;
}

export function getClimateLocation(id) {
  return CLIMATE_LOCATIONS.find((location) => location.id === id) || null;
}

export function validateClimateManifest() {
  const errors = [];
  if (CLIMATE_MODES.length !== 4) errors.push('Climate Laboratory must expose exactly four primary modes.');
  if (CLIMATE_TOOLS.length !== 16) errors.push('Climate Laboratory must contain sixteen deep open tools.');
  if (CLIMATE_ACTIVITIES.length !== 14) errors.push('Climate Laboratory must contain exactly fourteen Key Activities.');
  if (CLIMATE_COLLECTIONS.length !== 5) errors.push('Climate Laboratory must contain exactly five collections.');
  const ids = new Set(); const codes = new Set();
  for (const activity of CLIMATE_ACTIVITIES) {
    if (ids.has(activity.id)) errors.push(`Duplicate climate activity ID: ${activity.id}.`); ids.add(activity.id);
    if (!/^\d{4}$/.test(activity.keyCode)) errors.push(`Climate activity ${activity.id} needs a four-digit key.`);
    if (codes.has(activity.keyCode)) errors.push(`Duplicate climate key: ${activity.keyCode}.`); codes.add(activity.keyCode);
    if (!getClimateTool(activity.toolId)) errors.push(`Climate activity ${activity.id} refers to missing tool ${activity.toolId}.`);
    if (!activity.likelyMisconceptions?.length) errors.push(`Climate activity ${activity.id} needs misconception metadata.`);
  }
  for (const collection of CLIMATE_COLLECTIONS) {
    if (codes.has(collection.code)) errors.push(`Duplicate climate key: ${collection.code}.`); codes.add(collection.code);
    for (const activityId of collection.activityIds) if (!ids.has(activityId)) errors.push(`Collection ${collection.id} refers to missing activity ${activityId}.`);
  }
  if (codes.has(CLIMATE_DESTINATION_KEY.code)) errors.push(`Duplicate climate key: ${CLIMATE_DESTINATION_KEY.code}.`);
  const sourceIds = new Set(CLIMATE_SOURCE_RECORDS.map(({ id }) => id));
  for (const location of CLIMATE_LOCATIONS) {
    if (location.pattern.temperatureC.length !== 12 || location.pattern.rainfallMm.length !== 12) errors.push(`Climate location ${location.id} needs twelve monthly values.`);
    if (!location.sourceIds.every((sourceId) => sourceIds.has(sourceId))) errors.push(`Climate location ${location.id} refers to an unknown source.`);
    if (!location.unitNote || !location.dataPeriod || !location.status || !location.seasonNote) errors.push(`Climate location ${location.id} needs units, a period, provenance status and season context.`);
  }
  return { valid: errors.length === 0, errors };
}

export default CLIMATE_ACTIVITIES;
