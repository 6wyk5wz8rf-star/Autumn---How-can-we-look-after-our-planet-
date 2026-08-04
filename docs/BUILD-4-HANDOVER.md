# Build 4 handover

## Release intent

Build 4 is deliberately ordered as:

1. repair the complete shared interaction flow
2. verify all three released destinations and local-data contracts
3. activate Climate Laboratory inside the repaired shell

Climate is not a parallel app. It uses the same destination registry, routes, key manifest, learner profiles, My Keys, My Work, activity drafts, artefact versions, Board View, print and offline systems.

## Product-wide flow delivered

- exactly four child navigation choices
- exactly four active home-world landmarks
- no prominent inactive/future destinations
- one continuation invitation at most
- direct destination entry into Atlas map, Number build, organism observation or Climate scene
- four primary modes per destination
- contextual More tools disclosure in Number, Living Things and Climate
- consistent destination title/return/save status/Show me/Keep in My Work patterns
- simplified My Keys Continue/search/destination grouping
- simplified My Work Recent/By Place/My Planet Thinking views
- immediate four-digit Activity routing
- logical returns for key entry, activities, saved work, Board View and teacher view
- calmer Teacher Key Room initial state with favourites/recent/search/four destination filters
- profile-specific recent-route and library-view preferences

The permanent future-build contract is [Interaction Constitution](INTERACTION-CONSTITUTION.md).

## Climate Laboratory delivered

- four modes and 16 open tools
- direct temperature/rainfall scene with accessible steppers
- weather/climate distinction and time-scale viewer
- sourced monthly/seasonal graphs with patterns as well as colour
- shared Planet Atlas Climate Map
- five-zone school framework with soft-boundary cautions
- latitude plus other-influences explanation
- official station comparisons including Heathrow and Yundum
- simplified temperature/rainfall/seasonality model
- eight broad biome possibilities linked to Living Things habitats
- organism-needs connections using Observatory records
- NASA/GISS global-warming strip
- cautious implications, evidence/uncertainty and response trade-offs
- 14 guided activities, five collections and destination wildcard
- 15 versioned Climate My Work types
- deterministic local generator and source/data validation
- anonymous reversible Board View
- A4/monochrome-safe print rules
- lazy production/offline asset integration

## Permanent Climate codes

Activity codes: `3759`, `6417`, `9281`, `5063`, `1748`, `8327`, `4591`, `2168`, `7834`, `3496`, `6951`, `4287`, `9175`, `5632`.

Collection codes: `2469`, `8041`, `3572`, `6815`, `7926`.

Destination code: `1457`.

Whole-world code `7046` and Teacher Key Room code `8584` are preserved. Hidden adult compatibility alias `4829` is also preserved.

## Released manifest/data counts

| Record | Count |
|---|---:|
| Active destinations | 4 |
| Guided activities | 66 |
| Key manifest | 92 |
| Teacher-visible child keys | 90 |
| Climate sources | 11 |
| Climate locations | 7 |
| Climate zones | 5 |
| Climate biomes | 8 |
| Climate artefact types | 15 |
| All active artefact types | 72 |

All 72 Build 1–3 key ID/code pairs are locked by SHA-256 regression hash `4863631b583f2435250c25513eea37183acb436b164ad2f2fdc3603709909c61`.

## Data migration

IndexedDB schema version is 4. The store set is identical to Build 3. Upgrade ensures missing indexes and adds namespaced metadata only; no existing learner record is rewritten or cleared.

Climate records use existing `activityState`, `artefacts` and `artefactVersions`. Flow preferences use `metadata` key `flow:profile:<profileId>` after verifying the profile exists. Teacher favourites/recent displays remain separate device metadata.

## Source-review outcome

Provisional gridded location arrays were removed before release. Build 4 now uses official named station/city tables with periods and transformations stored alongside values. The generated one-day event is separately labelled fictional; simplified experiments/scenarios cannot be labelled sourced. Mixed artefacts retain component-level status.

See [Climate Sources](CLIMATE-SOURCES.md).

## Release verification

The release candidate passed these checks from one source tree:

- `npm test`: **134/134** tests passed
- deterministic validation: **2,000** climate tasks and **2,000** classification trees
- Vite production build: **209** modules transformed; Climate Laboratory emitted as a lazy **41.48 kB** chunk (**13.53 kB gzip**)
- service worker: **14** production assets injected into cache `fe68e1ebd38f`
- built-output smoke test: `index.html`, `service-worker.js` and every precached URL returned HTTP **200** (**15** unique URLs)
- `npm audit --omit=dev`: **0 vulnerabilities**
- application journey: Climate → shared negative-number-line tool → exact Climate state return
- work journey: activity `4591` saved, reopened and revised with evidence and version history intact
- key scales: collection `2469` and destination `1457` routed and granted the expected Climate pathways
- legacy continuity: all **72** Build 1–3 key ID/code pairs matched the locked SHA-256 fixture

GitHub Pages deployment and the final live-origin journeys are verified against the published revision after the normal `main` push. They are not inferred from the local build.

## Known limitations

- No simplified climate model can predict a real place or organism distribution; the product states this at the interaction point.
- Location climatologies have different published periods; comparisons retain those periods and require caution.
- WMO does not state the Yakutsk table period on its public page.
- The global-temperature strip is selected/rounded teaching data, not the full NASA/GISS annual series.
- Climate zones and biome links are broad teaching frameworks, not exact geospatial boundaries.
- Browser speech/media support varies.
- Physical iPad Safari, home-screen offline cold launch and printer validation cannot be claimed unless completed on that hardware.

## Build 5 preparation: Materials River

Build 5 may build the registered `materials-river` destination around material objects and pathways, continued use, repair, sharing, repurposing, sorting, recycling, landfill, waterways, habitat effects, community systems, quantities and trade-offs.

Available extension seams:

- Number Expedition links for quantities, comparison, totals and estimation
- Living Things links for waterways, habitats and organism needs
- Climate Laboratory evidence/uncertainty and response/trade-off structures
- shared Key Activity, collection, destination and 8584 projection architecture
- shared versioned My Work, Board View, print and offline contracts

Build 5 must not render its registry record until its complete destination passes the Interaction Constitution. It must add no dormant tool menu and must remove or simplify something if its new controls increase child decision load.
