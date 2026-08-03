# Science sources and asset rights

## Scope and review date

Living Things Observatory scientific records and child-facing cautions were reviewed on **3 August 2026**. Source metadata is stored locally so the application remains usable offline. Source URLs are evidence/audit links, not runtime dependencies.

The library deliberately avoids time-sensitive conservation status as a permanent child fact. Where a source page displays current threat categories, the application does not copy that category into the organism card. Occurrence statements describe broad researched context and never imply presence throughout a country, continent, climate zone, or habitat.

## Curriculum and classification sources

| Source | Stored ID | Used for | Important limit |
|---|---|---|---|
| [Department for Education: Science programmes of study, KS1–2](https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study) | `source-national-curriculum-science-ks1-2` | Year 4 grouping, classification-key, habitat, and environmental-change scope | Curriculum wording does not itself verify individual species facts |
| [GBIF species search and backbone](https://www.gbif.org/species/search) | `source-gbif-backbone` | Scientific names, kingdom, and broad classification | A taxonomic name match is not proof of local occurrence |
| [Natural History Museum: Identify nature](https://www.nhm.ac.uk/take-part/identify-nature.html) | `source-natural-history-museum` | Observable features, UK observation context, and invertebrate diversity | Identification resources must be used with the stored record, not a single picture |
| [Royal Botanic Gardens, Kew: data and digital collections](https://www.kew.org/science/collections-and-resources/data-and-digital) | `source-kew-plants` | Plant names, broad features, and scientific collection context | Build 3 intentionally avoids advanced plant taxonomy |

Every organism additionally stores a dated GBIF name-match URL containing its scientific name. This makes the exact lookup reproducible while retaining the common GBIF source authority in the central source manifest.

## United Kingdom and The Gambia

| Source | Stored ID | Used for | Important limit |
|---|---|---|---|
| [RSPB: The Gambia conservation partnership](https://www.rspb.org.uk/helping-nature/what-we-do/influence-government-and-business/international/the-gambia) | `source-rspb-gambia` | Country/habitat context and a check against generic “Africa equals wildlife” framing | Partnership context is not a complete species distribution list |
| [BirdLife DataZone: Gambia country factsheet](https://datazone.birdlife.org/country/factsheet/gambia) | `source-birdlife-gambia` | Osprey and Hooded vulture occurrence in The Gambia | Species presence does not mean every Gambian habitat supports that bird |
| [Ramsar Sites Information Service: annotated list for The Gambia](https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-Gambia.pdf) | `source-ramsar-gambia-wetlands` | Gambian wetlands, estuary, River Gambia, and mangrove context | Wetland descriptions do not represent the whole country |
| [Convention on Migratory Species: West African manatee](https://www.cms.int/aquatic-mammals/en/species/trichechus-senegalensis) | `source-cms-west-african-manatee` | West African manatee identity, western African aquatic range, and River Gambia connection | Range context does not predict a sighting at one selected map point |
| [The Reptile Database: *Crocodylus suchus*](https://reptile-database.reptarium.cz/Crocodylus/suchus) | `source-reptile-database-crocodylus-suchus` | West African crocodile accepted name and Gambian distribution | Distribution is broad context; the activity does not provide population estimates |

The organism library includes researched Gambian connections across mammals, birds, reptiles, insects, and plants, but it does not label every African organism as Gambian. The African savanna elephant and African clawed frog records explicitly use narrower regional language rather than presenting Africa as one habitat.

## Organism fact review

The following fields are required and automatically checked for every record:

- unique stable ID and common/scientific names
- kingdom, broad group, subgroup, and vertebrate status
- body covering, visible adult limbs, wings, shell/exoskeleton, segmentation, and movement
- one or more registered habitats
- binary features used by classification questions
- pronunciation text, child description, teacher note, misconception warnings, and curriculum tags
- illustration reference, creator, licence, attribution, verification date, and anatomical caution
- at least one dated scientific source

The validator rejects contradictory contracts such as a vertebrate/invertebrate mismatch, a six-legged arachnid, an eight-legged insect, a dolphin recorded as a fish, a plant with animal backbone status, a missing habitat, or missing rights/source metadata.

Broad-group language is intentionally cautious:

- Mammals are introduced through vertebrate status, hair/fur at some life stage, and milk; the product does not claim all give live birth.
- Birds use feathers, beaks, and eggs; penguin and ostrich records counter “all birds fly”.
- Fish use water, gills, and generally fins; dolphin, turtle, octopus, and eelgrass records counter “aquatic means fish”.
- Reptiles use vertebrate status, dry scales, and air breathing without being assigned only to hot places.
- Amphibian wording acknowledges varied links to water and land rather than one universal frog life cycle.
- Invertebrate examples include insects, arachnids, molluscs, annelids, crustaceans, myriapods, and echinoderms so the term cannot collapse into “insect”.

## Illustration rights and accuracy

All 56 organism images are original diagrammatic SVGs created for this product in `src/science/illustrations.js`.

Stored rights record:

- kind: `original-diagrammatic-svg`
- creator: `How Can We Look After Our Planet? project`
- licence: `Original in-product illustration · all rights reserved for this product`
- attribution: `Original diagrammatic illustration created for this product`
- verified: `2026-08-03`
- caution: `Diagrammatic view, not to scale. Use the feature labels as the scientific evidence.`

No illustration was scraped, hotlinked, or generated at runtime. The product does not present these diagrams as photographs or exact anatomical plates. The manual review checked recognisable group anatomy, plausible proportions at Year 4 diagram level, visible limb count, wings/shell/exoskeleton where represented, absence of invented decorative features, thumbnail legibility, and enlarged-view suitability.

Because a compact diagram cannot display every internal or life-cycle characteristic, the feature record and teacher note remain the authority. Backbone status is explicitly described as internal knowledge that may not be visible in an image.

## Environmental-change language review

The ten Change Laboratory scenarios were manually checked for:

- one defined condition change
- a visible or measured observation
- a relevant organism need/resource link
- more than one plausible response where appropriate
- explicit uncertainty or missing information
- language using *may*, *could*, *if*, *depends on*, or *more evidence is needed*
- no catastrophe imagery, blame, moral score, or claim that all organisms respond alike

Fictional survey values are always labelled `fictional-learning-data`. Child survey values are labelled `child-entered-data`. Build 3 contains no invented real population statistic, no external citizen-science upload, and no precise-location collection.
