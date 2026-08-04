# Climate Laboratory technical architecture

## Purpose and boundary

Climate Laboratory helps Year 4 children reason about weather, climate patterns, broad zones, seasonality, biomes and environmental change. It is not a weather forecast, a carbon calculator or a precise Earth-system simulation.

The architecture keeps five layers separate:

1. authoritative source metadata
2. sourced monthly values and child-facing simplifications
3. pure model/generator logic
4. accessible display configuration
5. guided activity and artefact logic

Climate facts are never authoritative when embedded only in a UI template.

## Data schemas

### Source record

Each source record contains:

- permanent `id`
- publisher and title
- direct HTTPS URL
- retrieval date
- published reference period where supplied
- unit where applicable
- a precise statement of how the source is used

The source record for Yakutsk deliberately stores `Source period not supplied`; missing source precision is represented as a limitation rather than silently filled.

### Climate location

Each `CLIMATE_LOCATIONS` record contains:

- permanent local ID and child title
- latitude, longitude and hemisphere
- optional Planet Atlas place ID
- one five-zone framework ID
- twelve monthly mean temperatures
- twelve monthly rainfall/precipitation totals
- biome possibility links
- source IDs, period, units/status note and local-variation caution

Location values are station/city climatologies. A station is not promoted to a national average.

### Climate zone

`CLIMATE_ZONES` uses one five-zone school framework: tropical, dry, temperate, continental and polar. Each record includes a broad pattern, latitude note, non-colour texture and misconceptions/cautions. The map presents boundaries as broad guides rather than exact polygons or political labels.

### Biome link

`BIOMES` provides eight broad teaching possibilities. Each has:

- temperature and yearly rainfall ranges used by the learning model
- supported seasonality patterns
- careful vegetation wording
- permanent Living Things habitat IDs

The ranges are display/model configuration, not a real biome classifier. A result is returned only as one of up to three possibilities.

### Change and response scenarios

Impact scenarios separate observation, possible effects and missing information. Response scenarios store reduce/adapt category, actor scales, possible benefits, resources and one trade-off. They are `simplified-model` components with IPCC context, not measured outcomes or guaranteed predictions.

## Provenance statuses

Every generated or saved data component uses one of:

- `sourced-rounded` — derived directly from a named source with period/units retained
- `simplified-model` — calculated or authored for learning and explicitly non-predictive
- `fictional` — invented learning values, never presented as an observation

A saved artefact can contain more than one component. For example, Weather or Climate? stores a sourced station pattern and a separately labelled fictional one-day event. `dataComponents` preserves those two labels instead of forcing the complete artefact into a false single category.

Source records copied into My Work include URL, publisher, title, period, retrieval date, unit and use note so the artefact remains intelligible after later source-data updates.

## Official-value transformation

For station tables that publish monthly minimum and maximum temperatures but not a monthly mean, Build 4 computes:

\[
T_{mean} = \frac{T_{minimum} + T_{maximum}}{2}
\]

The result is rounded to 0.1°C. Published monthly rainfall or precipitation totals are retained. `tests/build4-climate-data.test.js` pins the Heathrow and Yundum arrays exactly and validates all records, sources, periods, coordinates and units.

## Pure model

`src/climate/model.js` has no DOM or persistence dependency.

### Limits

| Variable | Model range |
|---|---|
| Temperature | −40°C to 40°C |
| Yearly rainfall | 0 to 4,000 mm |
| Seasonality | `spread` or `seasonal` |

`modelScene()` clamps inputs, derives broad water/ground/snow descriptions and asks `possibleBiomes()` for up to three candidate links. A candidate must fit at least two of temperature, rainfall and seasonality. The returned record always carries `status: simplified-model` and the warning that these variables cannot predict one real place or biome.

### Seasonality

`distributeRainfall()` preserves the exact annual total. Spread mode distributes integer millimetres across twelve months. Seasonal mode uses circular distance from a seeded peak month, rounds each month and applies the rounding remainder to the peak. Automated tests verify both arrays have twelve months and sum exactly to the stated total.

### Location comparison

`compareClimateLocations()` calculates rounded annual means/totals, temperature/rainfall differences, shared-zone status and a cautious evidence sentence. It never claims the values describe every day or every part of a country.

## Deterministic generator

`src/climate/generator.js` hashes a serialisable seed and supports:

- fictional one-day weather plus a sourced climate pattern
- two different sourced locations
- fictional equal-total seasonality arrays
- simplified temperature/rainfall/seasonality models
- simplified implication scenarios
- simplified response/trade-off scenarios

The generator never synthesises a “real” station value. Validation rejects unknown status labels, duplicate comparison locations, broken month counts, totals that no longer match and any model labelled sourced. Two thousand seeded outputs are reproduced exactly in the Build 4 suite.

## UI state

Each Climate workspace state contains:

- tool/activity ID, mode and schema-safe seed
- temperature, rainfall and seasonality
- selected left/right locations and zone
- time scale and graph disclosure choices
- selected impact/response scenario
- observed, known, inferred, predicted and uncertain text
- child explanation and recent child actions
- Board View step plus shared Atlas map state when relevant

The default destination tool is `temperature-rainfall-lab`. Only temperature and yearly rainfall are initially visible. More tools and additional evidence/data appear contextually.

Range input and step-button alternatives update the same semantic values. UI colours are derived from normalised numeric CSS variables; information is also present in text, pattern, geometry and units.

## Shared map and domain links

Climate Map mounts `AtlasMap` from Planet Atlas with flat/world focus plus climate/equator guides. The map state is saved in the Climate workspace and destroyed/remounted with destination lifecycle, avoiding a duplicate mapping engine or leaked handlers.

UK and Gambian location comparisons can open their established Atlas place records. Climate-to-living-things uses permanent biome → habitat → organism IDs from the Observatory library. Artefacts retain related Number Expedition tool IDs for negative temperature, value comparison and rounding rather than copying the mathematics engine.

## Guided activities and keys

Fourteen activity records reuse the same open tools. Each retains a stable ID/code, objective, invitation, Explore/Make/Explain flow, unscored Key Check, misconceptions, vocabulary, scaffold behaviour, artefact type, Board suitability and A4 print metadata.

Five collections slice only those permanent activity IDs. Destination key `1457` grants `destination:climate-laboratory:*`; whole-world `7046` already covers current Climate activities through `world:*` materialisation.

## Scaffold behaviour

Light, Core, Strong and Intensive change display support—not the climate objective. They may change visible data amount, location count, highlighted patterns, sentence stems and spoken guidance. Intensive still requires climate reasoning and never reduces the task to unlabelled picture matching.

## My Work contract

Fifteen Climate artefact types require `climateState` and optionally retain:

- location/source records and provenance components
- values, units and period/year
- evidence statements and explanation
- activity ID, scaffold and generator seed
- Atlas, Number and Living Things links
- version history and voice explanation through the shared envelope

Reopening restores the semantic workspace. Keeping a revision appends a version and preserves the original.

## Board View

Board View renders the same tool from a snapshot, removes save/learner identity, adds previous/next, label reveal and reset controls, and restores the exact snapshot on exit. Shared Atlas is remounted in Board mode where needed.

## Print and offline

Climate figures use labelled SVG/HTML rather than inaccessible canvas. Rainfall bars carry diagonal hatching; temperature and warming use distinct lines. Print converts figures to grayscale, retains black outlines, units, period/source labels and evidence headings, and avoids splitting major figures.

Vite lazy-loads the destination and shared Atlas/detailed-geography chunks. The final build script injects those exact hashed assets into the service-worker cache. Offline claims apply after one successful online production load.

## Validation failures

`validateClimateManifest()` and `validateClimateData()` reject:

- duplicate activity IDs or codes
- missing tools, misconceptions or four-digit codes
- missing or unknown sources
- invalid latitude/longitude or hemisphere contradiction
- missing units/period/status
- non-twelve-month arrays or non-numeric values
- missing zones, biomes or Living Things habitats
- reversed model ranges
- missing global-temperature source or unordered years

The central key/artefact validators additionally reject cross-product code collisions, invalid activity references and incompatible artefact schemas.
