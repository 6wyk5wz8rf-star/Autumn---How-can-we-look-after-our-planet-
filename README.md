# How Can We Look After Our Planet?

An open-world, cross-curricular Year 4 learning environment designed to live beside classroom teaching.

Build 2 preserves the complete Planet Atlas foundation and activates the second environment: **Number Expedition**.

> The world is open to explore. Keys reveal particularly useful paths through it. Teaching helps children see more whenever they return.

## Current release

The current product contains:

- a calm open-world home with **Planet Atlas** and **Number Expedition**
- four stable child destinations: **Our Planet**, **My Keys**, **My Work**, and **Enter a Key**
- separate local learner profiles for shared iPads
- open exploration without a code
- a permanent four-digit key system for guided pathways
- a shared, versioned My Work service
- append-only Planet Question responses
- a central curriculum, concept-graph, glossary, artist-rights, and artefact architecture
- Light, Core, Strong, and Intensive scaffold settings
- offline installation through a web app manifest and service worker
- a manifest-generated Teacher Key Room and printable Key Guide
- the complete interactive Planet Atlas and its eight guided pathways
- the complete Year 4 Autumn 1 Number Expedition: 28 guided pathways, seven regions, and 17 open tools

Build 1.1 also removed competing Atlas routes and grouped the five-part learning rhythm into three coherent child-facing stages: **Look & explore**, **Make & explain**, and **Save & revisit**. The underlying rhythm remains **Notice → Explore → Make → Explain → Revisit**.

## Product model

### Completed environments are open

Children may enter Planet Atlas or Number Expedition without a code. A key is never permission to encounter the curriculum.

Open Planet Atlas includes globe and flat-map views, zoom, pan, labels, equator, oceans, markers, routes, place comparison, questions, and saved snapshots.

Open Number Expedition includes all 17 mathematical tools. Children may supply and manipulate their own valid values, save semantic models, reopen them, and use the same instruments before, during, or after formal teaching.

### Keys provide direction

A four-digit key opens one deliberate guided pathway and remembers it in My Keys. Keys are not passwords, assignments, deadlines, scores, ability levels, or progression gates.

Key scales are:

- **Activity** — one guided pathway
- **Collection** — one coherent group of pathways
- **Environment** — every current and future pathway in one environment
- **Whole World** — every current and future pathway in the product

The fourth digit resolves immediately. Activity keys open the exact guided pathway; Collection keys grant their connected pathways and open a collection overview; Environment keys open the freely explorable destination after remembering every current pathway; the Whole World key returns to the open home after synchronising all active pathways.

### One child workspace

Atlas investigations and mathematical models use the same My Work service. Later builds extend this workspace rather than creating subject-specific storage silos.

## Ten environments

| Build | Environment | Current state |
|---:|---|---|
| 1 | Planet Atlas | Active |
| 2 | Number Expedition | Active |
| 3 | Living Things Observatory | Registered, inactive |
| 4 | Climate Laboratory | Registered, inactive |
| 5 | Materials River | Registered, inactive |
| 6 | Story Theatre | Registered, inactive |
| 7 | Word Workshop | Registered, inactive |
| 8 | Biography Mosaic | Registered, inactive |
| 9 | Community Garden | Registered, inactive |
| 10 | Tides of Change Studio | Registered, inactive |

`src/data/destinations.js` is the authoritative activation registry. Inactive destinations do not produce dead child-facing controls.

## Number Expedition

Number Expedition is a calm mathematical field station. It uses linked concrete, pictorial, and symbolic representations rather than a quiz or lesson-card interface.

### Seven regions

| Region | Objectives | Mathematical focus |
|---|---:|---|
| Number Base Camp | 1–4 | Four-digit construction, exchange, standard and non-standard partitioning |
| Magnitude Trail | 5–8 | More or less, comparison, ordering, and true-scale number lines |
| Rounding Ridge | 9–12 | Nearest 10, 100, and 1,000; distance and estimation |
| Beyond Zero Station | 13–16 | Negative-number intervals and Roman numerals to 100 |
| Addition Workshop | 17–20 | No exchange, one exchange, several exchanges, and five-digit totals |
| Subtraction Workshop | 21–24 | No exchange, one exchange, exchange across zero, and efficient strategy choice |
| Reasoning Observatory | 25–28 | Inverse, one- and two-step problems, proof, and counterexamples |

### Seventeen open tools

These tools require no key:

1. Build a Number
2. Partition a Number
3. More or Less Stepper
4. Compare Numbers
5. Order Numbers
6. Open Number Line
7. Rounding Tool
8. Estimate a Calculation
9. Negative Number Line
10. Roman Numeral Builder
11. Addition Model
12. Subtraction Model
13. Strategy Comparator
14. Inverse Builder
15. Problem Modeller
16. Statement Tester
17. Create a Challenge

`src/data/numberExpedition.js` is the authoritative record for the regions, tools, 28 activities, seven collections, and Number Expedition destination key.

### Twenty-eight objectives and Activity keys

| # | Activity | Permanent key | Objective |
|---:|---|:---:|---|
| 1 | Build a Four-Digit Number | `4827` | Represent and identify four-digit numbers using concrete manipulatives. |
| 2 | Ten Hundreds Make a Thousand | `6158` | Understand that 1,000 is ten times the size of 100. |
| 3 | Break the Number Apart | `9074` | Partition four-digit numbers into thousands, hundreds, tens, and ones. |
| 4 | Partition It Another Way | `2538` | Partition four-digit numbers in non-standard ways. |
| 5 | Step by 10, 100 or 1,000 | `6941` | Find 10, 100, or 1,000 more or less. |
| 6 | Which Number Is Greater? | `8307` | Compare and order numbers to 10,000 using `<`, `>`, and `=`. |
| 7 | Place It on the Line | `4176` | Position four-digit numbers on blank number lines. |
| 8 | Estimate the Position | `9624` | Estimate positions on number lines with changing scales. |
| 9 | Nearest Ten | `3758` | Round to the nearest 10. |
| 10 | Nearest Hundred | `5269` | Round to the nearest 100. |
| 11 | Nearest Thousand | `1836` | Round to the nearest 1,000. |
| 12 | Estimate Before You Calculate | `7492` | Use rounding to estimate answers. |
| 13 | Travel Through Zero | `3057` | Count backwards through zero. |
| 14 | Find the Temperature Difference | `6814` | Find intervals and differences involving negative numbers. |
| 15 | Roman Numerals to Fifty | `9347` | Read and write Roman numerals to 50. |
| 16 | Roman Numerals to One Hundred | `2685` | Read and write Roman numerals to 100. |
| 17 | Addition Without Exchange | `5731` | Add two four-digit numbers without exchange. |
| 18 | One Addition Exchange | `8406` | Add with one exchange. |
| 19 | Several Exchanges | `1974` | Add with multiple exchanges. |
| 20 | Build a Five-Digit Total | `6253` | Create five-digit totals from four-digit addends. |
| 21 | Subtraction Without Exchange | `4387` | Subtract without exchange. |
| 22 | One Subtraction Exchange | `7605` | Subtract with one exchange. |
| 23 | Exchange Across Zero | `2196` | Subtract with exchange across zero. |
| 24 | Choose an Efficient Method | `5847` | Choose efficient mental or written subtraction strategies. |
| 25 | Use the Inverse | `9062` | Use inverse operations and solve missing-number equations. |
| 26 | Solve a One-Step Problem | `3527` | Solve one-step addition and subtraction problems. |
| 27 | Plan a Two-Step Solution | `6489` | Solve two-step problems and identify the operations. |
| 28 | Prove It or Disprove It | `1753` | Prove and disprove mathematical statements. |

Each activity record contains its stable ID, invitation, objective, Notice / Explore / Make / Explain flow, optional unscored Key Check, misconception metadata, vocabulary, scaffold behaviour, My Work outcome, and print metadata.

### Collection and Environment keys

| Scale | Pathway | Permanent key | Includes |
|---|---|:---:|---|
| Collection | Four-Digit Foundations | `1847` | Activities 1–4 |
| Collection | Compare and Position | `6208` | Activities 5–8 |
| Collection | Rounding and Estimation | `9531` | Activities 9–12 |
| Collection | Beyond Familiar Numbers | `4715` | Activities 13–16 |
| Collection | Formal Addition | `8063` | Activities 17–20 |
| Collection | Formal Subtraction | `2395` | Activities 21–24 |
| Collection | Additive Reasoning | `7159` | Activities 25–28 |
| Environment | Every Number Expedition Pathway | `3648` | Every current and future Number Expedition activity |

### Shared mathematics and validation engine

The mathematical domain layer lives in `src/maths/` and is independent of the destination UI. It provides:

- linked place-value models with visible zero placeholders and UK number language
- standard and non-standard partition validation
- exact rounding bounds, midpoints, distances, and target-unit behaviour
- canonical Roman numerals from 1 to 100, strict parsing, and deliberate repair
- column-aligned addition and subtraction traces with classified exchange patterns
- explicit exchange chains across zero
- true-scale number-line construction and placement validation
- inverse families and missing-role solving
- evidence-aware feedback for examples, counterexamples, and proof
- deterministic seeded random state and reproducible task metadata

`src/maths/taskGenerator.js` exposes one seeded generator for all 28 pathways and the open-tool modes. Generated tasks carry a stable task ID, seed, generator version, curriculum tags, semantic values, solution, and explanation. Each task is validated against its domain before use.

## Permanent key architecture

`src/data/keys.js` is the sole released key authority for child routing, My Keys, the Teacher Key Room, and printing.

The Build 2 manifest contains 50 records:

- 36 Activity keys: eight Planet Atlas and 28 Number Expedition
- nine Collection keys: two Planet Atlas and seven Number Expedition
- two Environment keys
- one Whole World key
- two adult-only records: the permanent `8584` entrance and hidden `4829` compatibility alias

The Teacher Key Room library contains the 48 active child pathway records. Adult entrances are never listed as child pathways.

### Preserved Build 1 codes

These codes and stable meanings must never change:

| Scale | Planet Atlas pathway | Permanent key |
|---|---|:---:|
| Activity | Earth in Different Forms | `5842` |
| Activity | Locate Africa | `2967` |
| Activity | Find The Gambia | `7318` |
| Activity | The Equator and Broad Climate Patterns | `4139` |
| Activity | Compare the United Kingdom and The Gambia | `8625` |
| Activity | Journey Thread | `3471` |
| Activity | Place Portrait | `9256` |
| Activity | Looking After a Place Begins with Understanding It | `6084` |
| Collection | Map Foundations | `2746` |
| Collection | Places, Journeys and Evidence | `8163` |
| Environment | Every Planet Atlas Pathway | `5392` |
| Whole World | Every Guided Pathway | `7046` |

The Build 1 adult utility code `4829` also remains accepted as a hidden compatibility alias. It must not be printed, advertised, added to My Keys, or reassigned.

### Validation and wildcards

The manifest validators reject duplicate or malformed codes, repeated digits, obvious ascending or descending sequences, missing routes, missing activities or destinations, empty collections, malformed wildcards, inactive production entries, adult-code collisions, and any reassignment of `8584` or `4829`.

- `destination:<destination-id>:*` grants all current and future activities in one environment.
- `world:*` grants all current and future activities in the product.

The wildcard grant itself is stored. Matching active activities are materialised into My Keys when the registry is synchronised, so the Build 1 whole-world key automatically includes Number Expedition and will include later environments.

## Teacher Key Room

Entering **`8584`** in any Today’s Key entry opens the **Teacher Key Room**.

`8584` is permanently reserved. It must never be assigned to a child Activity, Collection, Environment, Whole World pathway, or future utility.

Teacher access is intentionally session-only:

- the code is intercepted before any child grant or persistence call
- no My Keys entry, visit, work record, or learner-history record is created
- the adult state lives only in the current JavaScript app instance
- refresh or app restart closes the room
- leaving consumes the captured return route and restores Children’s View

The room derives its library from the same active central manifest as child routing. It supports search, Environment / Curriculum / Scale filters, local Quick Key favourites, open pathway, copy code, full-screen Today’s Key display, optional title hiding, one-card printing, environment guides, the complete guide, device-wide key addition, backup export/import, destination inspection, and separated reset tools.

Teacher favourites and the show-title preference are stored as device-level IndexedDB metadata, never against a learner profile. They participate in backup and restore, are constrained to active child pathways, and are capped at 12 favourites.

The hidden `4829` alias opens the same session-only adult route solely to preserve Build 1 compatibility. New documentation and classroom use must use `8584`.

## Planet Atlas

Planet Atlas uses locally bundled Natural Earth geometry through `world-atlas`. It does not require a live map API.

Open exploration supports a rotatable globe, flat map, pointer/touch/keyboard movement, zoom and pan, labels, oceans, equator, Africa / West Africa / The Gambia / Senegal / United Kingdom context, scale-preserving focus transitions, River Gambia orientation, temporary markers, drag alternatives, two-point Journey Threads, broad direction and approximate distance, equator-crossing detection, place comparison, geographical questions, and structured snapshots.

The eight Atlas activities remain data-registered in `src/data/activities.js`. Geography provenance and limitations are recorded in [Geography Sources and Accuracy Notes](docs/GEOGRAPHY-SOURCES.md).

## My Work and mathematical artefacts

All environments use one versioned artefact envelope. Number Expedition activates 17 semantic artefact types:

- four-digit model
- partition card
- comparison explanation
- ordered-number set
- number-line estimate
- rounding explanation
- estimate comparison
- negative-number route
- Roman numeral
- addition model
- subtraction model
- strategy comparison
- inverse family
- problem model
- proof
- counterexample
- child-created challenge

A mathematical record stores its original values, final values, recent mathematical actions, representation/model state, answer visibility, explanation, strategy, scaffold setting, activity ID, generator seed, and step state. It is not stored only as a screenshot. Reopening therefore restores a manipulable model.

Revising writes immutable version snapshots before updating the current record. Duplicating creates a separate record linked to the original. Learners can reopen, revise, compare versions, add optional reflection, and print without losing the earlier state.

Planet Question responses remain separate append-only records so later thinking never overwrites an earlier response.

## Board View

Every mathematical workspace can open Board View. It presents the current semantic model in a fixed, classroom-scale surface with:

- large aligned mathematical representations
- one explicit exit
- previous and next step controls
- label hide/reveal
- answer hide/reveal
- a short board annotation

Board state is part of the open workspace state, not a duplicate learner record. Exiting returns to the same mathematical workspace.

The Teacher Key Room has a separate full-screen Today’s Key display. It contains only the code, an optional title, and one return control.

## Profiles, persistence, and compatibility

Profiles require only a first name, nickname, or initials; a symbol; a pattern; and a locally generated ID. No online account is used.

Build 2 deliberately retains IndexedDB database `our-planet` at schema version 3. Number Expedition reuses the existing stores:

- `profiles`
- `keyGrants`
- `keyAccess`
- `artefacts`
- `artefactVersions`
- `planetResponses`
- `activityState`
- `metadata`

No Build 1 store or field meaning is repurposed. Number Expedition state uses existing activity-state and artefact records; teacher favourites use metadata. Existing profiles, Atlas grants and work, Planet Question history, settings, wildcards, and backups remain compatible.

Invalid imported or locally stored records are rejected, repaired where safe, or quarantined so one malformed record cannot break the learner space. If IndexedDB is unavailable, the same API falls back to memory for the current page session and reports that saving is not durable.

## Accessibility and scaffolding

The shared product supports:

- Light, Core, Strong, and Intensive scaffold settings without changing the objective
- concise visible instructions and mathematical invitations
- spoken numbers and instructions through local speech synthesis
- tap-to-hear support and visible alternatives
- keyboard and touch operation
- controls that do not require dragging
- undo and redo in mathematical tools
- stable place-value columns and tabular numerals
- scalable text and high contrast
- colour-independent labels, symbols, patterns, and structure
- reduced motion and reduced visual complexity
- portrait and landscape layouts
- optional written or voice explanation
- no timers, speed scores, or precision-dependent gestures

Scaffold settings change cue strength, modelling, and concurrent choices, not curriculum status or intellectual demand.

## Printing

The Teacher Key Room generates one-card, cut-out card, environment-guide, Quick Key, and complete-guide output directly from manifest metadata.

Number Expedition and My Work printing use semantic HTML and CSS rather than raster captures. Print rules target A4, remove interface controls, switch to monochrome-safe colours, preserve table and card boundaries, retain place-value and column alignment, and keep number-line geometry tied to its mathematical scale.

Important output must still be inspected in iPad Safari print preview before a release; automated CSS contract tests cannot detect every WebKit pagination or clipping issue.

## Offline and installation

The production build injects every generated application asset—including the lazy Atlas and Number Expedition chunks—into the service-worker precache list.

Update behaviour:

1. A new worker downloads the complete new build.
2. If an older build controls an open page, the new worker waits.
3. The active session continues using one coherent build.
4. The new worker activates after existing tabs close, or after an explicit update action.
5. Old caches with this repository’s cache prefix are removed only after activation.
6. IndexedDB learner data remains independent of application caches.

Navigation uses a network-first fallback to the cached shell. Static assets use a cached response while checking for a newer copy. On iPad, open the deployed page in Safari, choose **Share**, then **Add to Home Screen**.

## Local development

Requirements:

- Node.js 22 or newer
- npm

```bash
npm install
npm run dev
```

Release commands:

```bash
npm test       # all Node contract, domain, service, and UI tests
npm run build  # production build plus service-worker asset injection
npm run check  # tests followed by the exact production build
npm run preview
```

The application has no runtime server, cloud database, external AI, or live map dependency. Vite is used only for development and static bundling.

## Repository structure

```text
src/
  app/                                  application controller and route views
  components/                           shell, profile, keypad, print and modal components
  data/                                 permanent product, curriculum, key and Number Expedition contracts
  destinations/planet-atlas/            Atlas engine and guided experience
  destinations/number-expedition/       mathematical field-station UI and Board View
  maths/                                shared mathematics, generator, feedback and validators
  services/                             IndexedDB, profiles, keys, artefacts, backup, settings and offline services
  teacher/                              8584 session, manifest adapter, library, preferences, display and print
  styles/                               product, responsive and shared print styling
  utils/                                routing, safe DOM and formatting helpers
public/                                 PWA manifest, icons and service worker
scripts/                                production offline-asset injection
tests/                                  contracts, services, mathematics, teacher room and UI integration
docs/                                   architecture, testing, geography evidence and Build 3 handover
```

See [Architecture](docs/ARCHITECTURE.md) for contracts and extension rules, [Testing](docs/TESTING.md) for the release matrix, and [Build 3 Handover](docs/BUILD-2-HANDOVER.md) for Living Things Observatory.

## GitHub Pages deployment

`.github/workflows/deploy.yml` runs on pushes to `main`: it installs exact dependencies, runs the test suite, builds the production app, injects offline assets, uploads `dist`, and deploys through GitHub Pages Actions.

The Vite base is relative, so hashed assets, the manifest, worker, and hash routes remain valid beneath the repository’s Pages path.

## Tides of Change preparation

The product still does not expose a partial art activity. It retains the six-stage curriculum, artist and rights contracts, physical sketchbook photograph support, and future art artefact types until Build 10.

## Next build

Build 3 will activate **Living Things Observatory** using the same open-exploration, key, My Work, Teacher Key Room, accessibility, print, and offline architecture.

It must preserve every released Build 1 and Build 2 ID, code, profile, grant, artefact, version, response, draft, preference, and wildcard.

See [Build 3 Handover](docs/BUILD-2-HANDOVER.md).
