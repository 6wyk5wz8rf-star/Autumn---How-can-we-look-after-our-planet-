# Build 3 Handover · Living Things Observatory

This historical path is retained so links from earlier Build 1 releases do not break. Its content now describes the next build after the completed Number Expedition release.

Build 3 activates **Living Things Observatory** without weakening or replacing Planet Atlas, Number Expedition, or the shared product foundation.

## Build 2 baseline

Before Build 3 begins, the product contains:

- two open environments: Planet Atlas and Number Expedition
- eight Atlas and 28 Number Expedition guided pathways
- 36 active Activity keys
- nine Collection keys
- two Environment wildcard keys
- one Whole World wildcard key
- permanent Teacher Key Room entrance `8584`
- hidden Build 1 adult compatibility alias `4829`
- 17 open mathematical tools
- shared profile, key, My Work, version, backup, settings, print, and offline services
- IndexedDB database `our-planet`, schema version 3
- device-level Teacher Key Room favourites in metadata

Run `npm run check` before making changes and preserve the passing baseline.

## Preserve unchanged

- repository and GitHub Pages deployment workflow
- child navigation: Our Planet, My Keys, My Work, Enter a Key
- every released Build 1 and Build 2 stable ID and four-digit code
- `8584` as the only public teacher entrance
- `4829` as a hidden, unadvertised compatibility alias
- destination IDs, ordinals, and activation logic
- profile separation and active-profile restoration
- stored Activity, Environment, and Whole World grants
- future wildcard meaning
- shared artefact envelope and immutable version service
- Planet Question append-only history
- Build 1 Atlas routes, geography, state, and work
- Build 2 mathematics engine, tools, generator seeds, Board View, and work
- accessibility and scaffold settings
- Teacher Key Room search, filters, favourites, display, print, backup, and reset separation
- backup format compatibility
- print architecture
- service-worker safe-update behaviour

Do not rename a released ID, recycle a code, clear a store, or reinterpret an existing field.

## Build 3 mission

Living Things Observatory should become a visual scientific field station where children can:

- inspect observable features
- sort freely and revise a grouping rule
- compare more than one sensible classification
- distinguish vertebrates and invertebrates
- build and follow branching classification keys
- connect organisms with habitats
- test how environmental change may affect living things
- record uncertainty, evidence, and revised thinking
- save scientific artefacts in My Work
- enter one four-digit code to follow a deliberate scientific pathway

It must remain useful before, during, and after direct teaching. It must not become a creature-fact website, flash-card deck, or sequence of image-based multiple-choice quizzes.

## Open exploration remains primary

The completed Observatory must open without a key.

Children should be able to encounter unfamiliar organisms, inspect features, sort, regroup, create a branching question, compare habitats, and test a change scenario before a teacher provides a guided code.

Keys point the class towards a common pathway. They do not lock organisms, habitats, or scientific concepts.

Do not add:

- scheduled releases
- due dates
- assignments
- marking queues
- scores or speed rewards
- completion percentages
- ability-labelled pathways

## Curriculum scope

Build around the Year 4 scientific ideas already registered in the shared curriculum and concept graph:

- recognise that living things can be grouped in a variety of ways
- explore and use classification keys
- identify and name a variety of living things in local and wider environments
- recognise that environments can change
- recognise that environmental change can sometimes endanger living things
- observe carefully and use evidence
- ask relevant questions
- record findings using drawings, labels, keys, tables, and explanations
- report and revise conclusions

Use careful scientific language:

- `organism`
- `living thing`
- `observable feature`
- `group`
- `classification`
- `classification key`
- `vertebrate`
- `invertebrate`
- `habitat`
- `environment`
- `adaptation` only within age-appropriate evidence
- `environmental change`
- `evidence`
- `uncertain`

Do not imply that one superficial feature always defines a taxonomic group. Do not treat “minibeast” as a scientific classification. Do not state that every environmental change is harmful or that one action has the same effect in every habitat.

## Structured organism records

Create a reviewed, local organism dataset. Every record should support:

- stable organism ID
- common name
- optional scientific name where helpful
- pronunciation text
- appropriately licensed local visual or illustration reference
- rights and attribution metadata
- observable features
- vertebrate / invertebrate relationship where appropriate
- more specific broad group where curriculum-valid
- habitat relationships
- geographical context
- evidence notes and uncertainty
- child-safe concise description
- related concept-graph IDs
- active state and dataset version

Observable features must be semantic data rather than prose only. Possible fields include body covering, number/type of limbs, wings, backbone evidence, body sections, shell, antennae, movement, reproduction evidence, and habitat observations.

Avoid records built from stereotypes such as “lives in Africa” or “dangerous animal.” A country or continent is not a habitat.

## Scientific representation engines

Build reusable engines rather than one bespoke interface per activity.

### Observation table

Allow children to inspect one or more organisms and record:

- what is directly visible
- what is inferred
- what is still unknown
- which feature matters to the current question

Keep observation and inference visually distinct.

### Free sorting surface

Children should be able to:

- move or tap organisms into child-named groups
- leave an organism temporarily ungrouped
- create, rename, merge, and revise groups
- state the rule for each group
- test whether every member fits the rule
- place the same organism differently under a new rule
- compare two valid groupings

Do not snap all work into one canonical answer. The scientific value is the stated rule and evidence.

### Classification-key builder

Represent a key as semantic branching data:

- question node
- two or more clearly separated responses where curriculum-appropriate
- branch target
- organism or group outcome
- evidence feature
- unresolved outcome

Validate that every active branch is reachable, each referenced organism exists, no cycle traps the learner, and each completed outcome is distinguishable by the questions asked.

Children should be able to follow, repair, and construct a key. Feedback should identify the branch or feature that caused ambiguity.

### Habitat and change model

Connect organisms to specific habitat evidence. A scenario should separate:

- the starting habitat
- the change
- which conditions are altered
- which organism needs may be affected
- likely consequence
- uncertainty or missing evidence
- possible responses and who may be affected

Scenarios should allow more than one plausible outcome when evidence is incomplete. Environmental action must remain place-specific rather than a universal checklist.

## Guided scientific pathways

Define a coherent set of substantial Build 3 Key Activities only after the open engines work.

Every activity record needs:

- globally unique stable ID
- `destinationId: 'living-things-observatory'`
- child-facing title and concise invitation
- curriculum objective and enquiry
- region or scientific strand
- observable feature / organism / habitat data references
- Notice / Explore / Make / Explain / Revisit flow
- optional unscored Key Check
- likely misconception metadata
- Light / Core / Strong / Intensive scaffold behaviour
- vocabulary
- semantic My Work outcome
- print metadata

Do not organise the child interface by lesson number or week. Do not create one card per curriculum statement before the shared interaction engines are rich enough to support it.

## Key extension

Add all Build 3 Activity, Collection, and Environment keys to the central manifest consumed by child routing, Teacher Key Room, and printing.

Permanent rules:

- exactly four digits
- globally unique and non-obvious
- stable ID and route
- valid active destination
- valid activity references
- complete print metadata
- no repeated four digits
- no ascending or descending sequence
- never use `8584`
- never use or expose `4829`

The Living Things Environment key must store `destination:living-things-observatory:*` with `includeFuture: true`.

The preserved Whole World code `7046` must automatically materialise every new active scientific Activity for profiles that entered it during Build 1 or Build 2. Do not rewrite the stored wildcard.

Entering `8584` must automatically show every new active scientific key through the shared teacher-library projection. Do not add a second teacher list. The hidden `4829` alias must continue to open the same adult session but remain absent from every visible library and print surface.

## Teacher Key Room extension

After Build 3 activation, the room should support:

- search by organism, observable feature, classification, key, habitat, and environmental change
- a Science curriculum filter
- a Living Things Observatory Environment filter
- Activity, Collection, and Environment scales
- full-screen display of any scientific code
- one-card, environment-guide, and complete-guide printing
- locally selected scientific Quick Keys

No scientific learner analytics, attainment comparison, scores, or work surveillance should appear.

## Scientific artefacts

Extend `src/data/artefactTypes.js` with active, versioned Observatory types such as:

- organism observation
- feature comparison
- free-sort arrangement
- grouping-rule card
- classification-key trail
- child-created classification key
- key repair explanation
- habitat portrait
- organism–habitat relationship
- environmental-change model
- scientific evidence card
- uncertainty / further-question record

Every type should use the shared record envelope and semantic content. A free sort should retain group IDs, child labels, rules, organism membership, ungrouped items, and revision state. A classification key should retain nodes, branches, evidence features, outcomes, and validation version. A habitat model should retain the original scenario, selected organisms, changed conditions, claimed effect, evidence, and uncertainty.

Do not save only a screenshot. Children must be able to reopen, duplicate, revise, compare, explain, and print the scientific structure.

## My Work and cross-environment links

Living Things artefacts remain in the existing My Work route. A science filter may appear progressively once enough work exists, but do not create a separate Science Work page.

Useful reviewed links include:

- Atlas place or habitat evidence → organism observation
- climate zone / biome → habitat, with careful limitations
- environmental change → organism need or habitat condition
- Number Expedition sorting counts → scientific grouping summary
- Number Expedition number line → measured environmental variable where the unit and source are valid
- proof / counterexample → testing an overgeneralised classification statement

Cross-environment links should deepen evidence. Do not turn every organism record into a decorative maths question.

## Concept graph and glossary

Extend existing nodes and edges rather than making a science-only graph. Required relationships should include:

`living-things → classification → observable-features → classification-key`

`organism → habitat → environmental-change → consequence → evidence`

`climate-zone → biome → habitat → living-things`

Activate only glossary terms that are genuinely supported by the completed interface. Each needs pronunciation, concise definition, contextual example, visual support, related concepts, and optional deeper explanation.

Children must not see raw National Curriculum codes or data-schema language.

## Data compatibility

Prefer the existing schema-version-3 stores:

- `activityState` for unfinished guided scientific work
- `artefacts` and `artefactVersions` for current and historical creations
- `keyGrants` and `keyAccess` for scientific pathways
- `metadata` for dataset/version or device preferences

Add no new store unless its persistence behaviour is genuinely different.

If a database change is unavoidable:

1. increment the database version
2. create an additive migration
3. leave every existing store and record intact
4. provide tolerant defaults for older records
5. test migration from Build 1 and Build 2
6. import a Build 1 backup and a Build 2 backup
7. confirm profiles, grants, work, versions, responses, drafts, settings, teacher favourites, and wildcards survive

Never use deployment or a service-worker update to clear learner data.

## UI extension

Build Living Things Observatory as a dynamically imported destination module. Expand the home-world landscape naturally; do not add a generic subject-card dashboard.

Keep the map, mathematical instruments, and scientific objects visually related through the existing warm paper, muted indigo, mineral blue, moss, clay, graphite, restrained amber, and tactile field-station language.

Avoid:

- cartoon animal mascots
- roaring sound effects
- bright species badges
- collectible creatures
- cluttered fact cards
- tiny drag targets
- long reading panels
- taxonomic trees too advanced for the enquiry

## Board and print views

Reuse the current presentation principles:

- large scientific objects and branching questions
- hideable labels
- step or branch reveal
- no learner identity
- no accidental editing of saved work
- one clear return

Print should support A4 black-and-white output for observations, grouping rules, sort arrangements, classification keys, habitat models, environmental-change explanations, scientific Key Guides, and Today’s Key cards.

Inspect WebKit pagination manually. Branch lines, organism labels, tables, and evidence must not clip or separate from their related node.

## Accessibility and scaffolding

Every core scientific interaction must support:

- touch and keyboard
- drag alternatives and tap-to-place
- large organism and branch targets
- visible focus
- spoken organism names and instructions
- captions and visible alternatives
- concise persistent instructions
- undo and redo
- reduced motion
- high contrast and colour-independent group patterns
- enlarged text
- portrait and landscape
- voice, short text, symbols, and arrangement as response modes

Scaffold settings may change the number of simultaneous organisms, question stems, visible feature labels, partially built branches, and cue strength. They must not replace the original objective or confine a child to a simpler scientific claim.

## Offline and source integrity

Bundle organism data, approved images/illustrations, pronunciation metadata, and destination assets locally. Avoid a live species, image, mapping, AI, or classification API for ordinary use.

Record provenance, licence, rights decision, version, and review date. Do not assume an image-search result is licensed for redistribution.

Confirm the production worker precaches the lazy scientific chunk and every required asset. Test cold offline opening even when the Observatory was not visited during installation.

## Validation and tests

Add automated tests for:

- destination activation only after completion
- organism record schema and unique IDs
- image and attribution requirements
- observable-feature vocabulary and valid references
- free-sort semantic round trips
- classification-key reachability, branch completeness, ambiguity, cycles, and missing outcomes
- habitat and environmental-change scenario integrity
- all scientific Activity / Collection / Environment keys
- permanent `8584` reservation and hidden `4829` alias
- automatic Teacher Key Room inclusion
- old `7046` wildcard materialisation
- profile separation
- scientific artefact save/reopen/revise/duplicate/print
- Build 1 and Build 2 backup imports
- glossary and concept-graph validation
- keyboard and drag alternatives
- responsive and print contracts
- offline asset injection

Automated checks must be supplemented with child, teacher, iPad, classroom-display, offline, and print walkthroughs.

## Build 3 release gate

Build 3 is ready only when:

- Planet Atlas and all eight pathways still work
- Number Expedition, all 17 tools, and all 28 pathways still work
- every released Build 1 and Build 2 code retains its meaning
- `8584` remains the public Teacher Key Room entrance
- `4829` remains a hidden compatibility alias
- Living Things Observatory is genuinely rich without a key
- scientific pathways save meaningful semantic outcomes
- children can freely sort by more than one stated rule
- children can follow, repair, and build classification keys
- organism and habitat claims are accurate, sourced, and age-appropriate
- the Teacher Key Room discovers every active scientific key automatically
- older Whole World grants receive every new scientific Activity
- existing profiles and work reopen unchanged
- Build 1 and Build 2 backups import successfully
- the Observatory works offline after installation
- iPad portrait and landscape have no clipping
- keyboard, touch, drag alternatives, largest text, high contrast, and reduced motion work
- Board and print outputs are inspected in Safari
- no child-facing inactive destination or developer language appears
- no quiz-first, reward, assignment, or surveillance system has been introduced

## Build 4 preparation

Leave clean extension points for **Climate Laboratory**:

- environmental-variable records
- temperature and weather observations
- time-series evidence
- climate-pattern reasoning
- links from habitat and environmental-change scenarios
- links to Number Expedition negative numbers, scale, rounding, and estimation
- saved scientific/mathematical artefacts
- Climate Key Activities and automatic Teacher Key Room inclusion

Do not build a shallow weather quiz or unfinished Climate Laboratory during Build 3.
