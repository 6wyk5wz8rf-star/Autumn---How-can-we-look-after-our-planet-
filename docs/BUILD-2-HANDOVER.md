# Build 2 Handover · Number Expedition

Build 2 activates **Number Expedition** without weakening or replacing Build 1.

## Preserve unchanged

- repository and GitHub Pages workflow
- four child navigation destinations
- every released Build 1 key code and stable ID
- destination IDs and activation logic
- IndexedDB name, existing stores, records, and schema meaning
- profile separation
- stored wildcards
- shared artefact and version services
- Planet Question response history
- accessibility and scaffold settings
- backup format compatibility
- print architecture
- service-worker safe-update behaviour
- Planet Atlas routes, data, interactions, and saved work

## Number Expedition destination

Activate `number-expedition` only when its open exploration and guided pathways are complete. Until that point, it remains an inactive registry record with no child-facing control.

It should feel like a manipulable mathematical landscape, not a quiz list or worksheet website.

Open exploration should prepare for:

- manipulable thousands, hundreds, tens, and ones
- concrete, pictorial, and symbolic representations
- four-digit number construction
- standard and non-standard partitioning
- 10, 100, and 1,000 more or less
- comparison and ordering
- `<`, `>`, and `=` relationships
- blank number lines
- interval and difference
- estimation
- rounding to 10, 100, and 1,000
- counting through zero and negative numbers
- Roman numerals to 100
- explanation and proof
- meaningful connections with Atlas distance, scale, temperature, and population data

## Interaction principles

- Begin with quantities and relationships before answer entry.
- Let children encounter representations before formal teaching.
- Keep every completed mathematical tool open without a key.
- Use keys to frame strong guided investigations.
- Make dragging optional; provide tap-to-place, increment controls, and keyboard alternatives.
- Preserve non-standard constructions rather than snapping everything into canonical form.
- Use feedback that describes the model and invites inspection.
- Do not add timers, points, streaks, scores, levels, or speed comparisons.
- Typing must not be the only route to explanation.

## Data extension

Add Number Expedition activities to `src/data/activities.js` or a destination-specific module re-exported by the central registry.

Every new activity needs:

- globally unique stable ID
- `destinationId: 'number-expedition'`
- title, enquiry, route, order
- curriculum references
- concept and vocabulary tags
- misconception notes
- supported response modes
- scaffold behavior
- optional unscored Key Check
- shared artefact outcome

## Key extension

Add new keys only to `src/data/keys.js`.

Required tests:

- every code is unique and non-obvious
- every activity key resolves exactly one activity
- collections resolve intended coherent sets
- Number Expedition destination wildcard receives all its activities
- the Build 1 world key automatically receives every new Build 2 activity
- existing profiles retain prior My Keys and work

Never change a Build 1 code to make room for a new one.

## Mathematical artefacts

Reuse the shared service for types such as:

- place-value construction
- representation comparison
- partitioning model
- comparison proof
- number-line estimate
- rounding justification
- negative-number journey
- Roman-numeral representation
- mathematical explanation

Structured mathematical content should remain semantic—for example quantities, partitions, intervals, labels, and representation choices—not only a screenshot.

This lets children reopen and manipulate a saved model, lets print views remain sharp, and allows later cross-environment connections.

## Atlas connections

Use a small, reviewed set of geographical numbers whose source, date, unit, and precision are recorded. Do not turn all place exploration into arithmetic.

Possible connections:

- compare approximate Journey Thread distances
- place distances on number lines
- round scale-appropriate measures
- examine temperatures above and below zero
- discuss whether rounding is sensible for the claim being made

Numbers should deepen the environmental enquiry, not become decorative “planet-themed” questions.

## Migration

Prefer adding no new store. Use existing artefact and activity-state stores unless a genuinely different persistence behavior is required.

If a schema change is necessary:

1. increment the database version
2. create an additive migration
3. leave existing stores and records intact
4. add tolerant defaults for old records
5. test migration from Build 1
6. import a Build 1 backup into Build 2
7. confirm profile, grants, work, versions, responses, and settings all survive

## UI extension

Number Expedition should be dynamically imported. The home-world landscape may expand to reveal the destination naturally; do not add a generic app card grid.

Keep the four principal navigation items unchanged.

My Work may add a mathematical filter, but mathematics must remain inside the same workspace.

The shared glossary should activate only the mathematical vocabulary that is genuinely available in Build 2.

## Print

Generate new key pages from manifest metadata. Extend artefact print layouts for:

- models with clear place-value alignment
- black-and-white pattern alternatives
- A4 portrait and landscape
- pupil explanation space
- preserved scale and page breaks

## Build 2 release gate

Build 2 is ready only when:

- Number Expedition is genuinely rich without a key
- guided activities are substantial and save meaningful outcomes
- all current and earlier keys pass validation
- the Build 1 world wildcard receives Build 2 activities
- two profiles remain separate
- Build 1 work reopens unchanged
- Build 1 backups import successfully
- Number Expedition works offline after installation
- iPad portrait and landscape layouts have no clipping
- largest text, keyboard, reduced motion, and drag alternatives work
- print output is inspected in Safari
- no child-facing inactive destination or developer language appears
