# Testing and release checks

## Release command

Run the complete source release gate from the repository root:

```bash
npm run check
```

This runs all Node tests and then builds the exact production bundle, including service-worker asset injection.

At the time this Build 2 documentation was updated, `npm test` passed **93/93 tests**. Rerun the suite after any later source change; the recorded count is evidence, not a substitute for a fresh release gate.

## Automated suite

| File | Tests | Main coverage |
|---|---:|---|
| `app-shell.test.js` | 1 | Profile creation, key entry, My Keys, and Planet Question shell flow |
| `atlas-map-sequence.test.js` | 10 | Gambia focus, reduced motion, snapshot delivery, map preview, route evidence, scale, climate, comparison, guided controls |
| `build2-app.test.js` | 8 | All 17 tools, generated-state mapping, boundary feedback, saved model/action reconstruction, Board keyboard and restoration behaviour, mathematical save/reopen, teacher session and non-mutating preview behaviour |
| `manifests.test.js` | 17 | Destinations, 36 activities, 50 keys, curriculum, glossary, graph, rights, and artefact contracts |
| `maths-core.test.js` | 16 | Linked representations, partition, rounding, Roman numerals, operations, number lines, inverse, feedback, proof fixtures |
| `maths-generation.test.js` | 7 | All 28 modes, runtime aliases, reproducibility, exchange categories, boundaries, large batches |
| `number-expedition-contracts.test.js` | 7 | Routes, formal alignment, truthful scale, A4 print, Board View, key cards, structural accessibility |
| `offline-print-contracts.test.js` | 3 | Install manifest, worker update contract, shared print rules |
| `services.test.js` | 7 | Profile separation, grants, versions, settings, backup, repair, quarantine |
| `teacher-key-room.test.js` | 9 | Adult manifest, session, search/filter, metadata favourites, backup, display, print, room privacy |
| `ui-contracts.test.js` | 8 | Keypad, field isolation, import focus, guide pagination, reduced activity flow, canonical actions, draft migration, internal-language removal |
| **Total** | **93** | Build 1, reduction pass, and Build 2 integration |

## Mathematical batch evidence

The suite intentionally validates large domains rather than a few hand-picked examples:

- every whole number from 0 to 9,999 is rounded to 10, 100, and 1,000: 30,000 boundary checks
- every canonical Roman numeral from 1 to 100 round-trips
- `IIII`, `VX`, `IL`, and `IC` are rejected and receive deliberate repair evidence
- 5,000 seeded operand pairs reconstruct both exact addition and subtraction traces
- 100 generated tasks are checked for each of seven formal-operation exchange categories
- 500 generated rounding cases check the upper Year 4 range
- 2,750 seeded tasks across 11 task domains pass their domain validators
- all 28 Activity modes generate valid prompt, values, solution, explanation, curriculum tags, and deterministic IDs
- all registered runtime IDs and open-tool modes resolve through the same generator API
- truth fixtures demonstrate always, sometimes, and never with valid witnesses

The generator batch ceiling is 10,000 tasks per call. Invalid modes and unbounded batch requests fail clearly.

## Manual device matrix

Automated tests cannot establish real iPad safe areas, WebKit print pagination, speech availability, touch comfort, home-screen installation, or a true offline cold launch. The release candidate must be checked manually in all of these conditions:

| Context | Minimum check |
|---|---|
| iPad Safari landscape | Home, both environments, activity workspace, Board View, Teacher Key Room, My Work, print preview |
| iPad Safari portrait | Bottom navigation, keypad, every mathematical region, modal fit, Board View, print preview |
| iPad Home Screen | Standalone launch, safe areas, refresh, offline reopen, update behaviour |
| Classroom display | Full-screen Today’s Key, large models, reveal steps, single-exit behaviour |
| Desktop Safari or Chrome | Keyboard, clipboard, backup download/import, print |
| Narrow fallback | 320 px width, largest text, no horizontal page overflow |
| Enlarged text | 130% application setting plus browser zoom |
| Reduced motion | Atlas focus, Number Expedition updates, Board View, key display |
| High contrast / forced colours | Focus, selected states, counters, number lines, routes, key cards |

Record the browser/OS version and any limitation found.

## Foundation and data compatibility

- Create two local profiles.
- Give each a different symbol, pattern, scaffold setting, and key.
- Save Atlas and Number Expedition work in both profiles.
- Switch repeatedly and confirm names, settings, grants, My Keys, work, drafts, and Planet Question responses remain separate.
- Refresh and reopen; confirm the active profile and durable work return.
- Import a Build 1 backup into Build 2 using merge mode.
- Confirm every Build 1 profile, Atlas grant, wildcard, artefact, version, response, draft, and setting survives.
- Confirm Number Expedition records use the existing schema-version-3 stores.
- Confirm Teacher Key Room favourites restore as device metadata and contain no profile ID.
- Confirm malformed imported records are rejected or quarantined without damaging valid records.
- Force IndexedDB failure and confirm the app remains usable while warning that saving is session-only.

## Open-world checklist

- Open Planet Atlas without entering a key.
- Open Number Expedition without entering a key.
- Confirm neither environment describes itself as assigned, locked, due, incomplete, or a lesson level.
- Confirm Number Expedition exposes seven regions and 17 open tools.
- Open every mathematical tool directly.
- Change values before any guided pathway is granted.
- Save work from an open tool and reopen it from My Work.
- Confirm a key points to a guided pathway but does not change open-environment access.
- Confirm the home world exposes only the two completed environments.
- Confirm the eight future destinations remain absent from child controls.

## Permanent key checklist

Use the central manifest or its generated Teacher Key Guide, not a second copied list.

- Validate all 50 manifest records and 50 unique four-digit codes.
- Confirm 36 Activity, nine Collection, two Environment, one Whole World, and two adult-only records.
- Re-enter every preserved Build 1 code and confirm the original stable meaning.
- Enter all 28 Number Expedition Activity codes.
- Enter all seven Number Expedition Collection codes.
- Enter Number Expedition Environment code `3648`.
- Enter Planet Atlas Environment code `5392`.
- Enter Whole World code `7046`.
- Confirm Activity keys route directly after the fourth digit.
- Confirm Collection keys add exactly four intended activities.
- Confirm Environment keys retain an `includeFuture` destination wildcard.
- Confirm the Whole World key materialises all 36 current activities and retains `world:*`.
- Add a temporary future activity in a test registry and confirm older wildcard grants include it.
- Enter a non-existent code and confirm there is no alarm, lockout, score, or penalty.
- Confirm one learner’s grant never appears for another learner.
- Confirm no inactive activity appears in the production teacher library.
- Confirm validator failure for duplicate codes, duplicate IDs, malformed routes, missing activity references, empty collections, malformed wildcards, obvious sequences, and adult-code collisions.

## Teacher Key Room checklist

### Entry and session boundary

- Enter `8584` from the home Today’s Key.
- Enter `8584` from the Number Expedition route through key entry.
- Enter `8584` after visiting My Keys.
- Enter `8584` after visiting My Work.
- Confirm the Teacher Key Room opens immediately.
- Confirm `8584` creates no child key grant, key-access record, visit, activity state, artefact, or history entry.
- Exit with **Return to Children’s View** and confirm the captured route returns where practical.
- Refresh while the room is open and confirm adult access closes.
- Navigate directly to `#/maintenance` without an active session and confirm it is guarded.

### Hidden compatibility alias

- Enter `4829` and confirm it opens the same session-only adult route.
- Confirm `4829` creates no child data.
- Confirm `4829` is absent from the room library, Quick Keys, printed guide, and full-screen choices.
- Confirm all user-facing teacher documentation prefers `8584`.

### Library and utilities

- Confirm the library contains 48 active child pathway records.
- Search `rounding`, `exchange`, and `The Gambia`.
- Filter to Mathematics, Planet Atlas, Number Expedition, Activity, Collection, Environment, and Whole World.
- Confirm grouping follows environment, strand, and scale.
- Add and remove local favourites; refresh and confirm they persist.
- Attempt to favourite an adult or unknown key and confirm rejection.
- Set more than 12 favourites and confirm sanitisation.
- Hide and reveal the pathway title for board display.
- Copy a code using the Clipboard API and test the fallback path where possible.
- Display a code full-screen and confirm only one return button is present.
- Close with Escape and confirm focus returns to the invoking control.
- Print one card, Quick Key cards, one environment guide, and the complete guide.
- Add one child pathway to all profiles and confirm it happens only after the explicit action.
- Export and import a local backup.
- Inspect active/inactive destinations without exposing learner work.
- Open each separated reset tool and cancel before confirming.
- Confirm there is no ranking, score, comparative attainment, or learner-work surveillance in the room.

## Twenty-eight guided activities

For each Number Expedition Activity:

- enter its permanent code
- confirm the exact title, region, tool, objective, and opening values
- confirm its Notice invitation is concise and speakable
- manipulate the same tool that is available in open exploration
- use **New values** and confirm the generated task validates for that pathway
- move through the Make & Explain opportunity
- open the optional, unscored Key Check
- test the Light, Core, Strong, and Intensive cue
- save the intended artefact type
- reopen the model with its original state and generator seed
- revise, save, and compare its versions
- duplicate it and confirm the copy is independent
- print the result
- confirm the pathway remains in My Keys after refresh

Activity-specific boundary checks:

1. Preserve the zero hundreds in `4,052`.
2. Show ten hundreds as equivalent to one thousand without erasing the original construction.
3. Validate a standard partition.
4. Validate `4,362 = 3,000 + 1,300 + 50 + 12` and `43 hundreds + 6 tens + 2 ones`.
5. Test `2,990 + 10`, `4,005 − 10`, `3,950 + 100`, `9,990 + 10`, and `1,006 − 10`.
6. Ask which place-value column decides a comparison.
7. Position a value on a blank line with truthful scale.
8. Change endpoints and interval while preserving the value/position relationship.
9. Test exact, below-midpoint, midpoint, and above-midpoint nearest-ten cases.
10. Repeat for nearest 100, including zero digits.
11. Repeat for nearest 1,000, including values near 10,000.
12. Compare estimate and exact answer for magnitude reasonableness.
13. Move from positive through zero to negative.
14. Distinguish a negative value, a decrease, and the interval between two values.
15. Convert and construct values to 50.
16. Round-trip every value to 100 and repair `IIII`, `VX`, `IL`, and `IC`.
17. Confirm no exchange.
18. Confirm exactly one addition exchange.
19. Confirm several, including consecutive, addition exchanges.
20. Confirm the final exchange creates a correctly aligned five-digit total.
21. Confirm no subtraction exchange.
22. Confirm exactly one subtraction exchange.
23. Replay `4,002 − 1,786` through thousand → hundred → ten → one.
24. Compare efficient mental and written methods for `5,002 − 4,998`, `7,600 − 2,000`, `4,350 − 99`, `6,004 − 3,999`, and `8,500 − 250`.
25. Build an inverse family and solve missing addend, total, minuend, subtrahend, and difference roles.
26. Identify known, unknown, operation, estimate, exact result, check, and units in a one-step problem.
27. Build and revise a two-operation plan without keyword guessing.
28. Distinguish one example, several examples, a counterexample, and a general proof.

## Open mathematical tools

Check all 17 tools with child-chosen values:

- **Build a Number** — 0 to 9,999, visible zeros, linked representations, hear number
- **Partition a Number** — standard, non-standard, incomplete, different value
- **More or Less Stepper** — ±10, ±100, ±1,000 and boundary changes
- **Compare Numbers** — equality and each deciding place
- **Order Numbers** — least/greatest with repeated leading digits
- **Open Number Line** — endpoints, target, placement, keyboard/range alternative
- **Rounding Tool** — three target units and distance evidence
- **Estimate a Calculation** — addition/subtraction estimate and exact comparison
- **Negative Number Line** — positive, zero, negative, interval
- **Roman Numeral Builder** — input, symbol buttons, conversion, repair
- **Addition Model** — estimate, exchanges, step reveal, inverse check
- **Subtraction Model** — removal/difference and exchange paths
- **Strategy Comparator** — friendly differences, thousands, 99/999, and written method
- **Inverse Builder** — complete equation family
- **Problem Modeller** — one- and two-step plan
- **Statement Tester** — always/sometimes/never evidence
- **Create a Challenge** — valid values, enough information, explanation request

## Board View checklist

- Open Board View from every tool family.
- Confirm no learner name, profile symbol, My Work button, or saved-work identity appears.
- Confirm the current model remains mathematically identical to the workspace.
- Confirm place-value and formal-calculation digits remain aligned at classroom dimensions.
- Confirm number-line scale remains truthful after resizing.
- Use previous and next step.
- Hide and reveal labels.
- Hide and reveal the answer.
- Add a short annotation.
- Exit and confirm the exact workspace state returns.
- Confirm opening or stepping Board View alone does not create or overwrite an artefact.
- Repeat with reduced motion and enlarged text.

## Mathematical feedback checklist

- Change a place count and confirm feedback names the resulting thousands, hundreds, tens, and ones.
- Compare two numbers and confirm feedback names the deciding column.
- Enter incomplete and different-value partitions and confirm the difference is explained.
- Choose a wrong rounded value and confirm lower multiple, upper multiple, midpoint, and distance are available.
- Generate an implausible exact result after estimation and confirm feedback references magnitude.
- Perform an exchange and confirm the named source and target place are correct.
- Test an example in Statement Tester and confirm it is not described as a proof.
- Find a counterexample and confirm the app explains why one counterexample disproves “always”.
- Inspect visible copy for generic `Wrong`, `Failed`, `Nearly`, or unqualified `Try again` messages.

## My Work checklist

- Save every Number Expedition outcome type reachable through the 17 open tools and 28 guided pathways; validate the separate `counterexample` artefact contract even when the saved Statement Tester outcome is a `proof` record containing counterexample evidence.
- Confirm original and final values, recent mathematical actions, `modelState`, representation choices, explanation, scaffold, activity ID, generator seed, and generator version survive.
- Reopen from My Work and manipulate the restored model.
- Revise and confirm immutable version count increases.
- Compare the earlier and current versions.
- Duplicate and confirm the copy has its own ID and version history.
- Add written or voice explanation where supported.
- Add optional reflection.
- Filter to Numbers after enough work exists to expose filters.
- Print selected work.
- Cancel deletion, then confirm deletion removes only the selected item and its versions.
- Confirm Atlas work and Planet Question history remain unchanged.

## Planet Atlas regression checklist

- Rotate globe; switch flat map; zoom and pan with touch and keyboard.
- Hide/reveal labels, oceans, equator, climate patterns, and biome inspection.
- Run Earth → Africa → West Africa → The Gambia focus sequence.
- Confirm Senegal, Atlantic coast, River Gambia, and scale context remain.
- Place markers without dragging.
- Draw/revise a Journey Thread and inspect approximate distance, direction, continents, oceans, and equator crossing.
- Compare the United Kingdom and The Gambia at matched context.
- Save, reopen, revise, duplicate, and print an Atlas outcome.
- Enter all eight Atlas Activity keys, two Collections, and its Environment key.

## Accessibility checklist

- Tab through every active control and confirm visible focus.
- Operate Today’s Key with number keys, Backspace, and Escape.
- Type four digits in an unrelated field and confirm they do not leak into the keypad.
- Use all mathematical native inputs with the keyboard.
- Confirm no essential action requires dragging.
- Confirm primary touch targets are comfortable and no precision gesture is timed.
- Turn on maximum text scale and inspect every route for clipping.
- Turn on reduced complexity and confirm the mathematical objective remains.
- Turn on reduced motion and confirm state changes remain understandable.
- Turn on high contrast / forced colours and confirm states do not rely on colour alone.
- Disable speech synthesis and confirm visible content remains complete.
- Disable microphone permission and confirm short text remains available.
- Confirm Thousands / Hundreds / Tens / Ones locations remain stable in portrait and landscape.
- Confirm zero placeholders and formal alignment survive enlarged text.

## Offline checklist

1. Run a production build.
2. Clear site data.
3. Load the deployed site online and wait for worker readiness.
4. Close and reopen once online so the worker controls the app.
5. Turn network access off.
6. Launch from the iPad Home Screen.
7. Open Planet Atlas even if it was not opened during installation.
8. Open Number Expedition and every region even if not previously opened.
9. Enter a Number Expedition key and open its activity.
10. Open the Teacher Key Room with `8584`.
11. Open profiles, My Keys, My Work, settings, glossary, and saved artefacts.
12. Save and refresh while offline.
13. Restore network and confirm an update check.
14. Deploy a new cache version while an old page is open; confirm the old session stays coherent and the new build activates after reopening.

## Print checklist

Inspect from iPad Safari and desktop print preview:

- one Today’s Key card
- title-hidden Today’s Key card
- Quick Key cut-outs
- Planet Atlas guide
- Number Expedition guide
- complete current guide
- four-digit and partition models
- truthful number line
- rounding explanation
- formal addition with five aligned columns
- formal subtraction across zero
- strategy comparison
- reasoning proof and counterexample
- child-created challenge
- My Work mathematical detail
- Atlas comparison, Place Portrait, and Journey Thread

For every output confirm:

- A4 sizing and correct page breaks
- black-and-white legibility
- no navigation, controls, sticky bars, or learner-private chrome
- no clipped codes, tables, exchange notation, explanations, or number lines
- stable digit and place-value alignment
- repeated table headings where a guide spans pages
- economical ink use

## Release evidence

Record in the final handover:

- production commit SHA
- fresh automated test count
- `npm run check` result
- dependency audit result
- GitHub Actions result
- live Pages URL and deployed asset smoke result
- iPad Safari portrait result
- iPad Safari landscape result
- classroom-display result
- offline cold-launch result
- iPad print-preview result
- Build 1 backup-import result
- known limitations, if any
