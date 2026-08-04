# Climate sources and transformations

Verified 4 August 2026. URLs are stored with the product in `CLIMATE_SOURCE_RECORDS`; saved sourced work copies the relevant source summary, period and retrieval date.

## Climate normal and framework

- **World Meteorological Organization — WMO Climatological Standard Normals.** [Source](https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/climate-services/wmo-climatological-normals). Used to explain why climate is understood through longer patterns rather than one event and why published climatology reference periods matter.
- **Met Office — Climate zones.** [Source](https://weather.metoffice.gov.uk/climate/climate-explained/climate-zones). Used for one consistent five-zone school framework and the warning that latitude, oceans, winds, continents, altitude and local geography interact.

The product does not combine Köppen, biome and school-zone systems into one false classification. Climate zones and biomes remain related but distinct teaching records.

## Official location climatologies

| Product record | Publisher/source | Published period | Stored measurements | Product transformation |
|---|---|---|---|---|
| Heathrow, United Kingdom | [Met Office location-specific long-term averages](https://www.metoffice.gov.uk/research/climate/maps-and-data/location-specific-long-term-averages/gcpsvg3nc) | 1991–2020 | Monthly mean max/min temperature and rainfall | Mean of displayed max/min, rounded to 0.1°C; rainfall retained |
| Yundum airport, The Gambia | [WMO World Weather Information Service](https://worldweather.wmo.int/en/city.html?cityId=3523), data supplied by The Gambia Department of Water Resources | 1991–2020 | Monthly mean max/min temperature and rainfall | Mean of displayed max/min, rounded to 0.1°C; rainfall retained |
| Manaus, Brazil | [WMO World Weather Information Service](https://worldweather.wmo.int/en/city.html?cityId=1073) | 1961–1990 | Monthly mean max/min temperature and precipitation | Mean of displayed max/min, rounded to 0.1°C; precipitation retained |
| Cairo, Egypt | [WMO World Weather Information Service](https://worldweather.wmo.int/en/city.html?cityId=248) | 1981–2010 | Monthly mean max/min temperature and precipitation | Mean of displayed max/min, rounded to 0.1°C; precipitation retained |
| Yakutsk, Russia | [WMO World Weather Information Service](https://worldweather.wmo.int/en/city.html?cityId=917) | **Not stated on the source page** | Monthly mean max/min temperature and precipitation | Mean of displayed max/min, rounded to 0.1°C; unknown period remains explicit |
| Reykjavík, Iceland | [WMO World Weather Information Service](https://worldweather.wmo.int/en/city.html?cityId=189) | 1961–1990 | Monthly mean max/min temperature and precipitation, including rain and snow | Mean of displayed max/min, rounded to 0.1°C; precipitation retained |
| Cape Town, South Africa | [WMO World Weather Information Service](https://worldweather.wmo.int/en/city.html?cityId=138) | 1961–1990 | Monthly mean max/min temperature and precipitation | Mean of displayed max/min, rounded to 0.1°C; precipitation retained |

### Derivation rule

For each month:

\[
T_{mean} = \operatorname{round}_{0.1}\left(\frac{T_{max}+T_{min}}{2}\right)
\]

The source does not necessarily call this derived value its official “mean temperature”; the product therefore states the transformation in every location `unitNote`. No interpolation is used for rainfall/precipitation.

### Comparison cautions

- Heathrow and Yundum are station records, not national averages.
- Published periods differ between locations. The application displays them rather than pretending all records are directly contemporaneous.
- “Rainfall” and “precipitation” are not silently conflated where snow is relevant; Reykjavík explicitly says precipitation includes rain and snow.
- A WMO city page can omit methodological detail. Yakutsk’s missing period is a visible uncertainty and a reason for cautious comparison.
- A country, continent, climate zone, habitat and biome are never treated as interchangeable.

## Global warming strip

- **NASA Goddard Institute for Space Studies — Global Temperature, Earth Indicator.** [Source](https://science.nasa.gov/earth/explore/earth-indicators/global-temperature/). The compact teaching strip stores selected, rounded NASA/GISS annual anomaly values from 1880–2025 relative to the 1951–1980 average.

The strip is not the complete annual series. Its purpose is to show an overall long-term rise with year-to-year variation. It does not imply identical warming in every year, day or place.

## Implications, adaptation and trade-offs

- **Intergovernmental Panel on Climate Change — AR6 Working Group II: Impacts, Adaptation and Vulnerability.** [Source](https://www.ipcc.ch/report/ar6/wg2/). Used as authoritative context for careful implication, adaptation, place variation, uncertainty and trade-off language.

Child scenarios are simplified learning records. They do not quote or calculate a local IPCC projection, and they are stored as `simplified-model`, not `sourced-rounded` measurements.

## Fictional and modelled values

The following values are explicitly not real observations:

- seeded one-day weather events
- equal-total seasonal comparison arrays
- temperature/rainfall/seasonality experiment outputs
- biome possibilities produced from broad model ranges
- authored implication and response scenarios

The generator stores `fictional` or `simplified-model`. When a tool combines a fictional event with a sourced climatology, `dataComponents` keeps both labels and source links separately.

## Source maintenance

When a source page or dataset changes:

1. preserve the source record ID if the authority/series remains the same
2. update retrieval date and reference period explicitly
3. re-verify all twelve displayed values
4. update the pinned data test rather than weakening it
5. keep existing saved artefacts intact because they carry copied provenance
6. add a new source ID when the authority, station or series changes materially

Do not silently update a period, swap a station or extend the NASA strip without a documented content review.
