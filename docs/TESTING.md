# Testing and release checks

## Automated suite

Run:

```bash
npm run check
```

This executes all Node tests and then builds the exact production bundle.

The tests cover contract validation, future wildcards, profile separation, persistence, artefact versioning, Planet Question history, backup restore, settings, and a child-shell integration flow.

## Manual device matrix

The release candidate must be checked in all of these conditions:

| Context | Minimum check |
|---|---|
| iPad Safari landscape | home, Atlas map, activity split view, My Work, key keypad |
| iPad Safari portrait | bottom navigation, modals, map controls, activity rhythm, print preview |
| iPad Home Screen | launch, standalone safe areas, offline reopen |
| Desktop Safari or Chrome | keyboard, print, backup download/import |
| Narrow fallback | 320 px width, largest text, no horizontal page overflow |
| Enlarged text | 130% app setting plus browser zoom |
| Reduced motion | map focus, globe/flat switch, activity navigation |
| High contrast / forced colours | focus, countries, selected states, equator and routes |

## Foundation checklist

- Create a first profile.
- Create a second profile.
- Switch between them.
- Confirm names, symbols, settings, keys, work, drafts, and Planet Question responses remain separate.
- Refresh and reopen the browser.
- Confirm the active profile returns.
- Confirm no surname, email, password, photograph, or date-of-birth request exists.

## Open-world checklist

- Open Planet Atlas without entering a key.
- Move the globe with pointer and touch.
- Move it with keyboard arrows.
- Switch to flat map.
- Zoom and pan.
- Hide and reveal labels.
- Hide and reveal oceans and equator.
- Focus Earth, Africa, West Africa, The Gambia, and the United Kingdom.
- Run the full Gambia focus sequence and check spatial orientation.
- Place and clear temporary markers.
- Use the non-drag placement alternative.
- Draw and revise a two-point Journey Thread.
- Confirm approximate distance, direction, and equator crossing.
- Compare the United Kingdom and The Gambia.
- Add a geographical question.
- Save a snapshot.
- Reopen it from My Work.

## Key checklist

Use the generated Key Guide, not copied documentation.

- Enter every individual activity key.
- Confirm each opens the exact activity after the fourth digit.
- Confirm each remains in My Keys after refresh.
- Enter both collection keys on separate profiles.
- Confirm each adds only its expected coherent set.
- Enter the Planet Atlas destination key.
- Confirm all eight Atlas pathways appear.
- Enter the world key.
- Add a temporary future activity in a test registry and confirm it materialises.
- Enter a non-existent code.
- Confirm there is no red flash, shake, alarm, lockout, or penalty.
- Repeat an invalid code and confirm the adult-check suggestion appears.
- Confirm one learner’s key does not appear for another learner.
- Use the adult device-wide action and confirm it adds the chosen key to every profile only after the explicit action.

## Eight Key Activities

For each activity:

- move freely between Notice, Explore, Make, Explain, and Revisit
- confirm text and map state survive moving between stages
- refresh mid-activity and confirm the unfinished state returns
- test touch and keyboard alternatives
- test spoken instructions
- save the outcome
- reopen it
- revise and save a new version
- confirm the earlier version remains
- duplicate and confirm the copy is separate
- print where suitable

Activity-specific checks:

1. Earth in Different Forms — globe, flat, and close views remain meaningfully distinct.
2. Locate Africa — labels can reduce; feedback describes evidence rather than merely marking right/wrong.
3. Find The Gambia — world → Africa → West Africa → country sequence retains orientation; Senegal, Atlantic coast, and River Gambia remain in context.
4. Equator and Broad Climate Patterns — language stays conditional and never makes latitude the only climate cause.
5. Compare UK and The Gambia — evidence is geographical and avoids cultural stereotypes.
6. Journey Thread — origin, destination, distance, direction, continents, oceans, and equator status are coherent.
7. Place Portrait — optional fields remain optional; guided and open responses can be saved.
8. Understanding Before Action — no option is presented as universally correct; evidence and affected communities remain central.

## My Work checklist

- Save open Atlas exploration.
- Save each guided outcome type.
- Rename or revise a saved piece.
- Confirm version count increases.
- Compare versions.
- Duplicate.
- Add each optional reflection type.
- Print.
- Delete and cancel at the confirmation.
- Delete after confirmation.
- Confirm no unrelated item disappears.

## Planet Question checklist

- Add a short text response.
- Add a voice response where supported.
- Link saved evidence.
- Add a later response.
- Confirm the earlier one remains.
- Confirm responses are not scored, ranked, or morally labelled.
- Confirm no response is demanded on entry.

## Backup and recovery checklist

- Export a backup with two profiles, keys, versions, a voice Blob, and Planet Question responses.
- Import using merge mode on a second browser profile.
- Confirm both profiles and binary audio survive.
- Import a malformed file and confirm nothing is replaced.
- Test a record with an invalid schema and confirm it is quarantined without breaking valid data.
- Confirm destructive replace and clear actions require explicit confirmation.

## Accessibility checklist

- Tab through every active control.
- Confirm focus is always visible.
- Operate keypad with number keys, Backspace, and Escape.
- Operate map with keyboard.
- Use marker and route alternatives without dragging.
- Confirm all touch targets are at least 44 CSS pixels and primary learning controls are generally 48 or larger.
- Turn on largest text and inspect every route for clipping.
- Turn on reduced complexity and confirm optional detail hides without removing the core enquiry.
- Turn on reduced motion and confirm focus changes remain understandable.
- Turn on high contrast and confirm selected states do not rely on colour alone.
- Disable microphone permission and confirm short text remains available.
- Disable speech synthesis and confirm visible text remains complete.

## Offline checklist

1. Clear site data.
2. Load the production site online and wait for the service worker to become ready.
3. Close and reopen once online so the active worker controls the app.
4. Turn network access off.
5. Launch from the iPad home screen.
6. Open Planet Atlas even if it was not opened during installation.
7. Open each route, profile, saved artefact, glossary, and Key Activity.
8. Save and refresh while offline.
9. Restore the network and confirm the app checks for an update.
10. Deploy a new cache version while an old page remains open; confirm the old session stays coherent and the new build activates after reopening.

## Print checklist

From iPad Safari and desktop print preview:

- Key Guide quick-use page
- activity table
- collection and larger keys
- all cut-out cards
- black and white
- A4 portrait
- page breaks
- no clipped codes or rows
- no navigation, buttons, or sticky save bars
- saved comparison
- Place Portrait
- Journey Thread

## Release evidence

Record for the final handover:

- production commit SHA
- automated test count
- GitHub Actions result
- live Pages URL
- iPad portrait result
- iPad landscape result
- offline cold-launch result
- print-preview result
- known limitations, if any
