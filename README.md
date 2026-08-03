# How Can We Look After Our Planet?

An open-world, cross-curricular Year 4 learning environment designed to live beside classroom teaching.

Build 1 establishes the shared product foundation and completes the first environment: **Planet Atlas**.

> The world is open to explore. Keys reveal particularly useful paths through it. Teaching helps children see more whenever they return.

## Build 1 status

Build 1 includes:

- a calm open-world home
- four child destinations: **Our Planet**, **My Keys**, **My Work**, and **Enter a Key**
- separate local learner profiles for shared iPads
- a permanent four-digit Key Activity system
- activity, collection, destination, whole-world, and maintenance key types
- future-compatible destination and world wildcard permissions
- a shared, versioned artefact system
- append-only Planet Question responses
- curriculum, concept-graph, glossary, artist, artwork-rights, and artefact contracts
- accessibility and scaffold preferences stored per learner
- an offline-first installable web app
- a teacher Key Guide generated from the authoritative manifest
- a complete interactive Planet Atlas
- eight guided Planet Atlas Key Activities

The remaining nine environments are registered as inactive product contracts. They are not exposed as dead child-facing destinations.

## Product model

### Everything completed is open

Children do not need a code to explore Planet Atlas. Open exploration includes globe and flat-map views, zoom, pan, labels, equator, oceans, markers, routes, place comparison, questions, and saved snapshots.

### Keys provide direction

A four-digit key opens one carefully designed guided pathway and remembers it in My Keys. Keys are not passwords, assignments, deadlines, scores, or progression gates.

The shared activity rhythm is:

**Notice → Explore → Make → Explain → Revisit**

It is rendered as a continuous experience rather than five compulsory mini-pages.

### One child workspace

All saved investigations, maps, place work, Journey Threads, explanations, reflections, and Planet Question responses live in My Work. Later builds extend the same artefact system rather than creating separate storage silos.

## Ten environments

1. Planet Atlas — active in Build 1
2. Number Expedition
3. Living Things Observatory
4. Climate Laboratory
5. Materials River
6. Story Theatre
7. Word Workshop
8. Biography Mosaic
9. Community Garden
10. Tides of Change Studio

Build 1 registers all ten destinations. `src/data/destinations.js` is the authoritative activation registry.

## Planet Atlas

Planet Atlas uses locally bundled Natural Earth geometry through `world-atlas`. It does not require a live map API.

Open exploration supports:

- rotatable orthographic globe
- flat world map
- pointer, touch, and keyboard movement
- zoom and pan
- visible or hidden labels
- oceans and equator layers
- world, Africa, West Africa, The Gambia, Senegal, and United Kingdom context
- scale-preserving focus transitions
- River Gambia orientation line
- temporary markers
- accessible marker placement alternative
- two-point Journey Threads
- approximate distance and broad direction
- equator-crossing detection
- United Kingdom / The Gambia comparison
- geographical questions
- structured, reopenable exploration snapshots

The eight Key Activities are data-registered in `src/data/activities.js`. Permanent codes are stored only in `src/data/keys.js`; the printable guide reads directly from that manifest.

## Geographical data and accuracy

- Country and coastline geometry: [`world-atlas` countries-110m](https://github.com/topojson/world-atlas), derived from [Natural Earth](https://www.naturalearthdata.com/). Natural Earth data is public domain. A more detailed 50m geometry chunk is loaded only for close country views.
- The River Gambia is a cautious hand-authored orientation line. It is explicitly labelled approximate and is not a legal, survey, or navigational source.
- Climate language is deliberately broad and conditional. Latitude is presented as one influence alongside elevation, oceans, winds, seasons, and local geography.
- Africa is presented as a continent containing many countries, regions, peoples, climates, and communities.
- The Gambia is presented as a specific West African country in relationship with Senegal, its Atlantic coast, and the River Gambia.

Attribution travels with Atlas snapshots.

The complete verification record is in [Geography Sources and Accuracy Notes](docs/GEOGRAPHY-SOURCES.md).

## Local development

Requirements:

- Node.js 22 or newer
- npm

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm test       # contracts, wildcard, profile, persistence, versioning and shell tests
npm run build  # production build plus service-worker asset injection
npm run check  # tests, then production build
npm run preview
```

The application has no runtime server and no cloud database. Vite is used only for development and static bundling.

## Repository structure

```text
src/
  app/                         application controller and route views
  components/                  shell, profile, keypad, print and modal components
  data/                        permanent product contracts and curriculum data
  destinations/planet-atlas/   map engine, geography data and Key Activity experience
  services/                    IndexedDB, keys, artefacts, backup, access and offline services
  styles/                      product, responsive and print styling
  utils/                       routing, safe DOM and formatting helpers
public/                        PWA manifest, icons and service worker
scripts/                       production offline-asset injection
tests/                         contract, service and shell integration tests
docs/                          architecture, testing and Build 2 handover
```

See [Architecture](docs/ARCHITECTURE.md) for data contracts and extension rules.

## Profiles and persistence

Profiles require only:

- first name, nickname, or initials
- a symbol
- a pattern
- a locally generated identifier

No email, password, surname, date of birth, photograph, or online account is used.

IndexedDB schema version 3 contains separate stores for:

- profiles
- key grants
- materialised Key Activity access
- artefacts
- immutable artefact versions
- Planet Question responses
- unfinished activity state
- metadata and recovery records

Migrations are additive. Invalid records are quarantined rather than allowed to break the whole learner space. If IndexedDB is unavailable, the API falls back to memory for the current session and reports that status to callers.

Local storage holds only non-critical device defaults. Learner work and access records remain in IndexedDB.

## Permanent key rules

`src/data/keys.js` is the sole key authority.

Every record includes a stable ID, exactly four digits, type, destination, route, child-facing title, curriculum tags, permissions, active state, saved outcome, and print metadata.

The manifest validator rejects:

- duplicate codes
- malformed codes
- repeated-digit codes
- obvious ascending or descending sequences
- missing destinations or routes
- invalid activity references
- incomplete wildcard contracts

Codes released in Build 1 are persistence contracts and must not be reassigned.

### Wildcards

- `destination:<destination-id>:*` grants all current and future Key Activities in one destination.
- `world:*` grants all current and future Key Activities in the product.

The wildcard itself is stored. Known activities are materialised into My Keys when the registry is synchronised. Later builds therefore appear automatically for a learner who previously entered the whole-world key.

### Maintenance

The maintenance key is separated from the child grant API. It opens a session-scoped adult utility for printing, backups, local-profile inspection, deliberate device-wide key addition, and clearly separated destructive actions.

## My Work and version history

All environments use one shared artefact service. A saved record contains:

- learner profile
- destination and activity
- optional Key Activity
- artefact type
- curriculum and concept tags
- structured content
- preview
- written or voice explanation
- linked artefacts
- optional reflection
- timestamps and schema version

Revising creates an immutable version snapshot before updating the current record. Duplicating creates a separate artefact linked to the original. Deletion requires explicit confirmation and removes the selected artefact’s version history only.

Planet Question responses are separate append-only records. A later response never overwrites an earlier one.

## Accessibility

Build 1 provides:

- concise visible instructions
- local speech synthesis for instructions and place names
- optional MediaRecorder voice responses
- captions and visible alternatives
- scalable text
- high contrast
- reduced motion
- reduced visual complexity
- Light, Core, Strong, and Intensive scaffold settings
- large touch targets
- clear focus states
- keyboard navigation
- pointer and touch interaction
- drag-free marker and route alternatives
- colour-independent outlines and patterns
- portrait and landscape responsive layouts
- no timers or precision-dependent gestures

Scaffold settings change cue strength, modelling, and concurrent choices without changing the intellectual purpose of an activity.

## Offline and installation

The production build injects every generated application asset—including the lazy Planet Atlas geometry chunk—into the service-worker precache list.

Update behaviour:

1. A new worker downloads the complete new build.
2. If an older build controls an open page, the new worker waits.
3. The active session continues using one coherent build.
4. The new worker activates after existing tabs close, or after an explicit update action.
5. Old caches carrying this repository’s dedicated cache prefix are removed only after activation; caches for other GitHub Pages applications on the same origin are untouched.
6. IndexedDB learner data is not part of the cache and is preserved.

Navigation uses a network-first fallback to the cached app shell. Static assets use a cached response immediately while checking the network for a newer copy.

On iPad, open the deployed page in Safari, use **Share**, then **Add to Home Screen**.

## GitHub Pages deployment

`.github/workflows/deploy.yml` runs on every push to `main`:

1. install exact dependencies with `npm ci`
2. run all automated tests
3. build the production application
4. inject the complete offline asset list
5. configure GitHub Pages through Actions
6. upload and deploy the `dist` artefact

The Vite base is relative, so hashed assets, the manifest, service worker, and routes work beneath the repository’s GitHub Pages path.

## Printing

The adult utility opens a Key Guide generated from the central manifest. It contains:

- a quick-use page
- all eight Planet Atlas activity keys
- collection, destination, whole-world, and maintenance keys
- activity purpose, curriculum concepts, useful moments, and saved outcome
- cut-out “Today’s Key” cards

Print CSS uses A4 margins, explicit page breaks, black-and-white-safe rules, large codes, hidden interface controls, and break-inside protection.

Suitable saved artefacts can also be printed from My Work.

## Testing

Automated tests cover:

- destination activation
- all eight activities
- permanent key validation
- exact Gambia code routing
- individual, collection, destination, and world wildcard resolution
- future activity materialisation
- maintenance separation
- curriculum, Tides of Change, rights, concept graph, glossary, and artefact contracts
- profile isolation and active-profile switching
- key accumulation without cross-profile leakage
- artefact versioning and duplication
- append-only Planet Question responses
- unfinished state and settings persistence
- backup inspection and restore
- child-shell profile, key, My Keys, and Planet Question flow

Manual release checks are documented in [Testing](docs/TESTING.md).

## Tides of Change preparation

Build 1 does not expose a partial art activity.

It registers:

- all six curriculum stages
- Turner, Cornelia Parker, Olafur Eliasson, Agnes Denes, and Hokusai metadata contracts
- artwork-rights and reproduction-status contracts
- physical sketchbook photograph support
- artist observation, movement, texture, colour, composition, media experiment, A4 plan, A3 final artwork, influence record, and artist statement artefact types

These contracts remain inactive until Build 10.

## Build 2

Build 2 activates **Number Expedition** using the existing shell, profiles, key manifest, artefact service, curriculum graph, glossary, accessibility system, print system, and offline pipeline.

It must preserve every Build 1 ID, code, schema, profile, grant, artefact, response, draft, and preference.

See [Build 2 Handover](docs/BUILD-2-HANDOVER.md).
