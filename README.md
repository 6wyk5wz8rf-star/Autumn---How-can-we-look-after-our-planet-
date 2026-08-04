# How Can We Look After Our Planet?

A calm, open-world Year 4 learning environment designed to sit beside classroom teaching.

Build 4 repairs the complete child interaction flow before activating the fourth destination, **Climate Laboratory**. Planet Atlas, Number Expedition and Living Things Observatory remain open and retain their released keys, work and mathematical/scientific engines.

> A powerful product does not reveal everything at once. It gives children one clear thing to notice, one meaningful thing to change and one calm place to keep what they discover.

## Current release

The child shell has exactly four top-level choices:

1. **Our Planet** — the shared world containing completed destinations
2. **My Keys** — remembered guided pathways
3. **My Work** — one library for saved creations
4. **Enter a Key** — immediate four-digit entry

Profile and accessibility controls remain discreet in the shared shell. Destinations use the same return, save-state, Show me and Board View patterns.

Only completed destinations appear in Our Planet:

| Destination | Open entry | Primary modes | Guided activities |
|---|---|---|---:|
| Planet Atlas | Globe/current map | Explore, Compare, Journey, Portrait | 8 |
| Number Expedition | Central number-building workspace | Build, Compare, Calculate, Reason | 28 |
| Living Things Observatory | Observation workbench | Observe, Group, Classify, Habitats | 16 |
| Climate Laboratory | Living climate scene | Patterns, Climate Map, Experiment, Change | 14 |

Future destination records remain registry-only. They do not create disabled cards, padlocks, “coming soon” controls or dormant menus.

## Build 4 flow repair

The product is organised around three child screen types:

- **Our Planet** — choose one completed place or continue one recent item
- **Destination** — enter directly into a useful interactive object
- **Key Activity** — use a focused version of the same destination workspace

My Keys and My Work are libraries, not nested worlds. The repaired interaction contracts are:

- destination entry begins with interaction rather than an introduction or tool-card wall
- no destination exposes more than four primary modes at once
- one learning action has the strongest visual weight
- specialist tools sit behind a restrained **More tools** disclosure
- **Show me** gives one demonstration, one example and one immediate action without leaving the task
- drafts persist quietly; meaningful outcomes use **Keep in My Work**
- logical back context is captured for Key Activities, saved work, Board View and the Teacher Key Room
- My Keys shows one Continue item and a searchable destination-grouped collection without displaying remembered codes
- My Work has only **Recent**, **By Place** and **My Planet Thinking** views
- a valid Activity key opens immediately after digit four; larger keys add their pathways without unnecessary confirmation screens

The permanent rules for later builds are in [Interaction Constitution](docs/INTERACTION-CONSTITUTION.md).

## Climate Laboratory

Climate Laboratory is an open environment, not a forecast application or a climate quiz. Its core scene begins with two large, labelled, keyboard-operable variables:

- temperature in degrees Celsius
- yearly rainfall in millimetres

The scene is explicitly labelled **Explore a simplified climate pattern**. It responds gradually through vegetation, visible water, ground and snow/ice cues while stating that two variables cannot predict one real place.

### Four modes

**Patterns** distinguishes short-term weather from longer climate patterns. Children can inspect one day, one week, one year and multi-year patterns; compare monthly temperature and rainfall; and explore seasonality.

**Climate Map** reuses the Planet Atlas map engine. It adds one documented five-zone school framework—tropical, dry, temperate, continental and polar—without turning boundaries into exact walls. Latitude is presented as one broad influence alongside oceans, winds, altitude and local geography.

**Experiment** connects temperature, rainfall and seasonality to possible vegetation, biomes, habitats and organism needs. Results remain possibilities, not predictions of a real place.

**Change** separates long-term global warming evidence, possible place-specific implications, responses and trade-offs. Child reasoning uses five evidence categories:

- We observed
- We know
- We infer
- We predict
- We are unsure

### Open tools

Each mode contains four deep tools, for 16 open tools in total:

| Mode | Tools |
|---|---|
| Patterns | Weather or Climate?; Pattern Viewer; Seasonal Wheel; Compare Two Years |
| Climate Map | Climate Zone Map; Compare Locations; Equator and Latitude Lens; Place Climate Profile |
| Experiment | Temperature and Rainfall Lab; Seasonality Lab; Climate to Biome; Climate and Living Things |
| Change | Change Over Time; Possible Effects; Evidence and Prediction; Responses and Trade-offs |

### Guided Climate keys

| Activity | Key | Saved outcome |
|---|:---:|---|
| Weather Today, Climate Over Time | `3759` | Weather-and-climate comparison |
| Find the Pattern | `6417` | Annotated climate pattern strip |
| Build a Seasonal Wheel | `9281` | Seasonal climate wheel |
| Explore the World’s Climate Zones | `5063` | Climate-zone map observation |
| Latitude and Climate | `1748` | Latitude explanation |
| Compare the United Kingdom and The Gambia | `8327` | Two-place station-climate comparison |
| Change the Temperature | `4591` | Temperature experiment record |
| Change the Rainfall | `2168` | Rainfall experiment record |
| Same Total, Different Pattern | `7834` | Seasonality comparison |
| From Climate to Biome | `3496` | Climate-to-biome model |
| Climate, Habitat and Living Things | `6951` | Climate-habitat connection |
| What Is Global Warming? | `4287` | Global-warming explanation |
| Different Places, Different Effects | `9175` | Place-impact comparison |
| Responding to Climate Change | `5632` | Climate-response reasoning card |

Collection keys are **Weather and Climate** `2469`, **Climate Around the World** `8041`, **Climate Experiments** `3572`, **Climate, Biomes and Living Things** `6815`, and **Climate Change and Response** `7926`. Climate Laboratory destination key `1457` remembers every current and future Climate pathway. Whole-world key `7046` now covers all 66 current guided activities.

All 72 Build 1–3 key ID/code pairs are locked by an automated SHA-256 regression. No earlier code was changed.

## Climate data and provenance

Real monthly location values are stored in `src/data/climate.js`, outside UI components. Every location record retains coordinates, hemisphere, units, source IDs, source period, retrieval date, transformation note and a place-specific caution.

The comparison set uses official station/city climatologies:

- Heathrow, United Kingdom — Met Office, 1991–2020
- Yundum airport, The Gambia — WMO / The Gambia Department of Water Resources, 1991–2020
- Manaus — WMO, 1961–1990
- Cairo — WMO, 1981–2010
- Yakutsk — WMO; source period is explicitly shown as not supplied
- Reykjavík — WMO, 1961–1990; precipitation includes rain and snow
- Cape Town — WMO, 1961–1990

Monthly mean temperature is derived from the official displayed minimum and maximum and rounded to 0.1°C. Source rainfall/precipitation totals are retained. A station is never described as the climate of an entire country.

The global temperature teaching strip cites NASA/GISS, records the 1951–1980 baseline and retains its simplification note. Implication/adaptation language is grounded in IPCC AR6 and uses cautious terms such as *may*, *could*, *depends on* and *varies by place*.

Generated tasks are deterministic and carry a seed plus one of three status labels: **sourced-rounded**, **simplified-model** or **fictional**. The generator never invents a real-world measurement.

Full records and transformations are documented in [Climate Sources](docs/CLIMATE-SOURCES.md).

## Keys and Teacher Key Room

`src/data/keys.js` remains the sole key authority. Build 4 contains 92 manifest records:

| Type | Count |
|---|---:|
| Activity | 66 |
| Collection | 19 |
| Destination | 4 |
| Whole World | 1 |
| Adult-only | 2 |

Entering permanent code `8584` opens the session-only Teacher Key Room. Hidden compatibility alias `4829` is preserved but is not advertised. The room projects 90 child-facing records from the central manifest; it does not maintain a copied code list.

The initial teacher view contains favourites, recently displayed codes, search and four active destination filters. Selecting a destination reveals its codes. Climate activities, collections and destination key appear automatically through the same manifest projection. Favourites remain device metadata, never learner-profile data.

## My Work and local data

All 72 active artefact types use one versioned envelope. The 15 Climate types retain selected locations, sources, periods, values, units, status, seasonality, evidence statements, activity ID, scaffold, generator seed and linked destination records.

Children can reopen, revise, duplicate, compare versions, add a voice explanation and print suitable work. A revision appends a version; it does not silently erase earlier thinking.

IndexedDB database `our-planet` is schema version 4. The migration is additive: it creates no replacement stores and clears no records. Build 4 uses the existing profile, grant, access, artefact, artefact-version, response, activity-state and metadata stores. Profile-specific flow preferences use namespaced metadata and preserve separate recent destination, My Keys and My Work state on a shared iPad.

If IndexedDB cannot open, the same service interface falls back to memory for the current page and reports that saving is not durable.

## Accessibility, Board View and print

Climate controls provide sliders plus step buttons, keyboard operation, persistent units, touch-sized targets and no precision-drag requirement. Graphs use hatching and line/shape differences in addition to colour. Spoken instructions/data use the shared speech support; reduced-motion removes transitions and animation; information remains available without sound.

Board View is anonymous, protects work from accidental saving, supports hide/reveal and stepping where useful, and returns to the exact prior state.

Print rules target A4, remove controls, preserve units/source periods, keep graphs and evidence groups together, use monochrome-safe patterns and avoid clipped destination work. A physical iPad Safari print preview and physical printer remain manual release checks.

## Offline and performance

Climate Laboratory is lazy-loaded. Its shared Atlas map code, climate data, styles and generated production assets are injected into the versioned service-worker cache. Hidden destination landing pages are not mounted. Persistence is debounced; destination workspaces reuse shared engines rather than duplicating data or map systems.

The detailed design is in [Architecture](docs/ARCHITECTURE.md) and [Climate Architecture](docs/CLIMATE-ARCHITECTURE.md).

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
npm test
npm run build
npm run check
```

`npm run check` is the release gate: it runs the entire regression suite, creates the Vite production bundle and injects the exact hashed asset list into the service worker.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Interaction Constitution](docs/INTERACTION-CONSTITUTION.md)
- [Climate Architecture](docs/CLIMATE-ARCHITECTURE.md)
- [Climate Sources](docs/CLIMATE-SOURCES.md)
- [Testing](docs/TESTING.md)
- [Build 4 handover](docs/BUILD-4-HANDOVER.md)
- [Living Things architecture](docs/SCIENCE-ARCHITECTURE.md)
- [Scientific sources and asset rights](docs/SCIENCE-SOURCES.md)
- [Geography sources](docs/GEOGRAPHY-SOURCES.md)

## Known limitations

- The climate experiment is deliberately a two/three-variable teaching model, not a forecast or complete Earth-system model.
- The selected official climatologies use different published reference periods; the UI preserves those periods and warns against careless comparison.
- The WMO Yakutsk page does not supply its observation period; the product states that limitation instead of guessing.
- Broad climate-zone and biome boundaries are explanatory frameworks, not precise geospatial classifications.
- Speech synthesis voices and media recording availability depend on the browser/device.
- Automated responsive, keyboard, print and offline contracts do not replace physical iPad Safari, home-screen cold-launch and printer testing.

## Build 5 boundary

Materials River is registered only as a future destination with compatible concepts for material objects, pathways, repair, reuse, sharing, repurposing, sorting, recycling, landfill, waterways, habitats, quantities and trade-offs. It has no child-facing landmark, tools, keys or dormant menus in Build 4.
