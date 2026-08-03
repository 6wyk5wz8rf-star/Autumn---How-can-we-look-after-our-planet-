/**
 * Living Things Observatory organism and habitat library.
 *
 * The records are deliberately compact enough to inspect and validate. Images
 * are original diagrammatic SVGs rendered from `illustrationKey`; they are not
 * photographs and never claim to show scale. Scientific names and broad
 * classifications were checked against GBIF's backbone taxonomy on 2026-08-03.
 */

export const SCIENCE_LIBRARY_VERSION = 1;
export const SCIENCE_VERIFIED_AT = '2026-08-03';

export const SCIENCE_SOURCES = Object.freeze({
  nationalCurriculum: Object.freeze({
    id: 'source-national-curriculum-science-ks1-2',
    label: 'Department for Education · Science programmes of study: key stages 1 and 2',
    url: 'https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['year-4-curriculum', 'grouping', 'classification-keys', 'environmental-change'],
  }),
  gbif: Object.freeze({
    id: 'source-gbif-backbone',
    label: 'GBIF Backbone Taxonomy',
    url: 'https://www.gbif.org/species/search',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['scientific-name', 'kingdom', 'broad-classification'],
  }),
  nhm: Object.freeze({
    id: 'source-natural-history-museum',
    label: 'Natural History Museum · Identify nature',
    url: 'https://www.nhm.ac.uk/take-part/identify-nature.html',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['observable-features', 'uk-organisms', 'invertebrate-diversity'],
  }),
  kew: Object.freeze({
    id: 'source-kew-plants',
    label: 'Royal Botanic Gardens, Kew · Plants and fungi',
    url: 'https://www.kew.org/science/collections-and-resources/data-and-digital',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['plant-classification', 'plant-features', 'habitats'],
  }),
  rspbGambia: Object.freeze({
    id: 'source-rspb-gambia',
    label: 'RSPB · The Gambia conservation partnership',
    url: 'https://www.rspb.org.uk/helping-nature/what-we-do/influence-government-and-business/international/the-gambia',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['the-gambia', 'birds', 'habitat-context'],
  }),
  cmsManatee: Object.freeze({
    id: 'source-cms-west-african-manatee',
    label: 'Convention on Migratory Species · West African manatee',
    url: 'https://www.cms.int/aquatic-mammals/en/species/trichechus-senegalensis',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['west-african-manatee', 'west-african-rivers', 'occurrence'],
  }),
  birdlifeGambia: Object.freeze({
    id: 'source-birdlife-gambia',
    label: 'BirdLife DataZone · Gambia country factsheet',
    url: 'https://datazone.birdlife.org/country/factsheet/gambia',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['the-gambia', 'osprey', 'hooded-vulture', 'bird-occurrence'],
  }),
  ramsarGambia: Object.freeze({
    id: 'source-ramsar-gambia-wetlands',
    label: 'Ramsar Sites Information Service · Annotated list for The Gambia',
    url: 'https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-Gambia.pdf',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['the-gambia', 'wetlands', 'mangroves', 'river-gambia'],
  }),
  reptileDatabaseCrocodile: Object.freeze({
    id: 'source-reptile-database-crocodylus-suchus',
    label: 'The Reptile Database · Crocodylus suchus',
    url: 'https://reptile-database.reptarium.cz/Crocodylus/suchus',
    retrievedAt: SCIENCE_VERIFIED_AT,
    supports: ['west-african-crocodile', 'the-gambia', 'reptile-occurrence'],
  }),
});

const ORIGINAL_IMAGE_RIGHTS = Object.freeze({
  kind: 'original-diagrammatic-svg',
  creator: 'How Can We Look After Our Planet? project',
  licence: 'Original in-product illustration · all rights reserved for this product',
  attribution: 'Original diagrammatic illustration created for this product',
  verifiedAt: SCIENCE_VERIFIED_AT,
  caution: 'Diagrammatic view, not to scale. Use the feature labels as the scientific evidence.',
});

const gbifNameSource = (scientificName) => Object.freeze({
  sourceId: 'source-gbif-backbone',
  label: `GBIF name match · ${scientificName}`,
  url: `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`,
  retrievedAt: SCIENCE_VERIFIED_AT,
  supports: ['scientific-name', 'broad-classification'],
});

const sourceRefs = (scientificName, extra = []) => Object.freeze([
  gbifNameSource(scientificName),
  ...extra.map((id) => {
    const source = Object.values(SCIENCE_SOURCES).find((item) => item.id === id);
    return Object.freeze(source ? { sourceId: id, label: source.label, url: source.url, retrievedAt: source.retrievedAt, supports: source.supports } : { sourceId: id });
  }),
]);

const animal = ({
  id, commonName, scientificName, broadGroup, subgroup = broadGroup,
  backbone, covering, limbs, wings = false, shell = false, exoskeleton = false,
  segmented = false, movement, habitats, occurrence = 'Wider world',
  uk = false, gambia = false, food = 'Uses food resources within its habitat.',
  description, teacherNote = '', pronunciation, illustrationKey,
  binaryFeatures = [], misconceptions = [], extraSources = [],
}) => Object.freeze({
  id,
  commonName,
  scientificName,
  kingdom: 'animal',
  broadCategory: 'animal',
  backbone,
  broadGroup,
  subgroup,
  observableCharacteristics: Object.freeze([
    covering,
    Number.isInteger(limbs) ? `${limbs} visible limbs in the familiar adult view` : String(limbs),
    wings ? 'visible wings' : 'no visible wings in the shown view',
    shell ? 'a visible shell' : exoskeleton ? 'an external supporting covering' : 'no visible shell',
  ]),
  features: Object.freeze({
    bodyCovering: covering,
    visibleLimbs: limbs,
    wings,
    shell,
    exoskeleton,
    segmented,
    movement,
  }),
  binaryFeatures: Object.freeze([
    'animal',
    backbone === 'vertebrate' ? 'backbone' : 'no-backbone',
    wings ? 'visible-wings' : 'no-visible-wings',
    shell ? 'shell' : 'no-shell',
    exoskeleton ? 'exoskeleton' : 'no-exoskeleton',
    segmented ? 'segmented-body' : 'not-clearly-segmented',
    ...(limbs === 0 ? ['no-visible-legs'] : []),
    ...(limbs === 6 ? ['six-legs'] : []),
    ...(limbs === 8 ? ['eight-legs'] : []),
    ...(typeof limbs === 'number' && limbs > 8 ? ['more-than-eight-legs'] : []),
    ...binaryFeatures,
  ]),
  movement,
  habitatIds: Object.freeze(habitats),
  foodRelationship: food,
  climateLinks: Object.freeze([]),
  occurrence: Object.freeze({ uk, gambia, summary: occurrence }),
  pronunciation: Object.freeze({ text: commonName, guide: pronunciation || commonName }),
  childDescription: description,
  teacherNotes: teacherNote || `Use several characteristics together when classifying ${commonName}; one visible feature alone may not identify the group.`,
  classificationKeyCompatibility: true,
  misconceptionWarnings: Object.freeze(misconceptions),
  curriculumTags: Object.freeze(['living-things', 'classification', broadGroup, subgroup]),
  illustrationKey,
  imageRights: ORIGINAL_IMAGE_RIGHTS,
  sources: sourceRefs(scientificName, extraSources),
});

const plant = ({
  id, commonName, scientificName, group, covering, habitats,
  occurrence = 'Wider world', uk = false, gambia = false, description,
  teacherNote = '', pronunciation, illustrationKey, binaryFeatures = [], extraSources = [],
}) => Object.freeze({
  id,
  commonName,
  scientificName,
  kingdom: 'plant',
  broadCategory: 'plant',
  backbone: null,
  broadGroup: 'plant',
  subgroup: group,
  observableCharacteristics: Object.freeze([covering, 'leaves or leaf-like structures', 'no visible limbs']),
  features: Object.freeze({
    bodyCovering: covering,
    visibleLimbs: 0,
    wings: false,
    shell: false,
    exoskeleton: false,
    segmented: false,
    movement: 'growth and responses rather than locomotion',
  }),
  binaryFeatures: Object.freeze(['plant', 'no-visible-legs', 'no-visible-wings', 'no-shell', ...binaryFeatures]),
  movement: 'growth and responses rather than locomotion',
  habitatIds: Object.freeze(habitats),
  foodRelationship: 'Makes sugars using light, carbon dioxide and water; may also provide food and shelter for animals.',
  climateLinks: Object.freeze([]),
  occurrence: Object.freeze({ uk, gambia, summary: occurrence }),
  pronunciation: Object.freeze({ text: commonName, guide: pronunciation || commonName }),
  childDescription: description,
  teacherNotes: teacherNote || `${commonName} supports comparison between plants and animals without introducing advanced plant taxonomy.`,
  classificationKeyCompatibility: true,
  misconceptionWarnings: Object.freeze(['Plants are living things even though they do not move from place to place like animals.']),
  curriculumTags: Object.freeze(['living-things', 'classification', 'plant', group]),
  illustrationKey,
  imageRights: ORIGINAL_IMAGE_RIGHTS,
  sources: sourceRefs(scientificName, ['source-kew-plants', ...extraSources]),
});

export const ORGANISMS = Object.freeze([
  // Mammals
  animal({ id: 'red-fox', commonName: 'Red fox', scientificName: 'Vulpes vulpes', broadGroup: 'mammal', backbone: 'vertebrate', covering: 'fur', limbs: 4, movement: 'walks, runs and jumps', habitats: ['woodland', 'grassland', 'urban', 'garden-park'], uk: true, occurrence: 'United Kingdom, Europe, Asia, North Africa and North America', description: 'A fur-covered vertebrate with four limbs and a long bushy tail.', illustrationKey: 'fox', binaryFeatures: ['fur', 'four-limbs', 'bushy-tail', 'pointed-ears'] }),
  animal({ id: 'european-hedgehog', commonName: 'European hedgehog', scientificName: 'Erinaceus europaeus', broadGroup: 'mammal', backbone: 'vertebrate', covering: 'spines and fur', limbs: 4, movement: 'walks and curls into a ball', habitats: ['woodland', 'grassland', 'urban', 'garden-park'], uk: true, occurrence: 'United Kingdom and parts of Europe', description: 'A small mammal whose back is covered with stiff spines.', illustrationKey: 'hedgehog', binaryFeatures: ['fur', 'four-limbs', 'spines'] }),
  animal({ id: 'common-pipistrelle', commonName: 'Common pipistrelle', scientificName: 'Pipistrellus pipistrellus', broadGroup: 'mammal', backbone: 'vertebrate', covering: 'fur with skin wings', limbs: 4, wings: true, movement: 'flies using forelimbs modified as wings', habitats: ['woodland', 'urban', 'garden-park'], uk: true, occurrence: 'United Kingdom, Europe and parts of western Asia', description: 'A small mammal with fur and wings made from skin stretched over long finger bones.', teacherNote: 'A bat is a mammal even though it flies.', illustrationKey: 'bat', binaryFeatures: ['fur', 'four-limbs', 'skin-wings'] }),
  animal({ id: 'bottlenose-dolphin', commonName: 'Bottlenose dolphin', scientificName: 'Tursiops truncatus', broadGroup: 'mammal', backbone: 'vertebrate', covering: 'smooth skin', limbs: 2, movement: 'swims with flippers and tail flukes', habitats: ['ocean', 'coast-estuary'], uk: true, occurrence: 'Temperate and tropical seas in many regions', description: 'An air-breathing marine mammal with flippers and horizontal tail flukes.', teacherNote: 'Living in water does not make an animal a fish.', illustrationKey: 'dolphin', binaryFeatures: ['flippers', 'horizontal-tail-flukes', 'breathes-air'] }),
  animal({ id: 'african-elephant', commonName: 'African savanna elephant', scientificName: 'Loxodonta africana', broadGroup: 'mammal', backbone: 'vertebrate', covering: 'sparse hair and thick skin', limbs: 4, movement: 'walks', habitats: ['grassland', 'woodland'], occurrence: 'Parts of sub-Saharan Africa; not presented as occurring throughout Africa', description: 'A very large mammal with four pillar-like limbs, large ears and a trunk.', illustrationKey: 'elephant', binaryFeatures: ['four-limbs', 'trunk', 'large-ears', 'tusks'] }),
  animal({ id: 'west-african-manatee', commonName: 'West African manatee', scientificName: 'Trichechus senegalensis', broadGroup: 'mammal', backbone: 'vertebrate', covering: 'thick, sparsely haired skin', limbs: 2, movement: 'swims with flippers and a paddle-shaped tail', habitats: ['freshwater', 'coast-estuary'], gambia: true, occurrence: 'Coastal and inland waters of western Africa, including the River Gambia system', description: 'A slow-moving aquatic mammal with two flippers and a broad paddle-shaped tail.', illustrationKey: 'manatee', binaryFeatures: ['flippers', 'paddle-tail', 'breathes-air'], extraSources: ['source-cms-west-african-manatee'] }),

  // Birds
  animal({ id: 'european-robin', commonName: 'European robin', scientificName: 'Erithacus rubecula', broadGroup: 'bird', backbone: 'vertebrate', covering: 'feathers', limbs: 2, wings: true, movement: 'flies, hops and walks', habitats: ['woodland', 'urban', 'garden-park'], uk: true, occurrence: 'United Kingdom, Europe and nearby regions', description: 'A small feathered vertebrate with a beak, wings and two legs.', illustrationKey: 'bird', binaryFeatures: ['feathers', 'beak', 'two-legs', 'red-breast'] }),
  animal({ id: 'mallard', commonName: 'Mallard', scientificName: 'Anas platyrhynchos', broadGroup: 'bird', backbone: 'vertebrate', covering: 'water-resistant feathers', limbs: 2, wings: true, movement: 'swims, walks and flies', habitats: ['freshwater', 'coast-estuary', 'urban', 'garden-park'], uk: true, occurrence: 'Wetlands across much of the Northern Hemisphere and introduced elsewhere', description: 'A water bird with feathers, a broad bill and webbed feet.', illustrationKey: 'duck', binaryFeatures: ['feathers', 'beak', 'two-legs', 'webbed-feet', 'broad-bill'] }),
  animal({ id: 'emperor-penguin', commonName: 'Emperor penguin', scientificName: 'Aptenodytes forsteri', broadGroup: 'bird', backbone: 'vertebrate', covering: 'dense feathers', limbs: 2, wings: true, movement: 'walks, slides and swims; does not fly', habitats: ['polar-tundra', 'ocean'], occurrence: 'Antarctica and surrounding ocean', description: 'A feathered bird whose wings are adapted as flippers for swimming.', teacherNote: 'Feathers identify a bird more reliably than flight.', illustrationKey: 'penguin', binaryFeatures: ['feathers', 'beak', 'two-legs', 'flipper-like-wings', 'does-not-fly'] }),
  animal({ id: 'common-ostrich', commonName: 'Common ostrich', scientificName: 'Struthio camelus', broadGroup: 'bird', backbone: 'vertebrate', covering: 'feathers', limbs: 2, wings: true, movement: 'runs; does not fly', habitats: ['grassland', 'desert'], occurrence: 'Open and dry habitats in parts of Africa; not throughout the continent', description: 'A very large bird with feathers, two long legs and wings that do not provide flight.', illustrationKey: 'ostrich', binaryFeatures: ['feathers', 'beak', 'two-legs', 'long-neck', 'does-not-fly'] }),
  animal({ id: 'osprey', commonName: 'Osprey', scientificName: 'Pandion haliaetus', broadGroup: 'bird', backbone: 'vertebrate', covering: 'feathers', limbs: 2, wings: true, movement: 'flies and dives feet-first for fish', habitats: ['freshwater', 'coast-estuary', 'ocean'], uk: true, gambia: true, occurrence: 'Near water on several continents, including seasonal presence in the UK and The Gambia', description: 'A large bird with long wings, a hooked beak and strong curved talons.', illustrationKey: 'raptor', binaryFeatures: ['feathers', 'beak', 'two-legs', 'hooked-beak', 'talons'], extraSources: ['source-birdlife-gambia'] }),
  animal({ id: 'hooded-vulture', commonName: 'Hooded vulture', scientificName: 'Necrosyrtes monachus', broadGroup: 'bird', backbone: 'vertebrate', covering: 'feathers with a mostly bare face', limbs: 2, wings: true, movement: 'walks, soars and flies', habitats: ['grassland', 'woodland', 'urban'], gambia: true, occurrence: 'Sub-Saharan Africa, with records in The Gambia', description: 'A feathered scavenging bird with broad wings and a mostly bare face.', illustrationKey: 'vulture', binaryFeatures: ['feathers', 'beak', 'two-legs', 'hooked-beak', 'bare-face'], extraSources: ['source-birdlife-gambia'] }),

  // Fish
  animal({ id: 'atlantic-salmon', commonName: 'Atlantic salmon', scientificName: 'Salmo salar', broadGroup: 'fish', backbone: 'vertebrate', covering: 'scales and mucus', limbs: 0, movement: 'swims with fins and tail', habitats: ['freshwater', 'coast-estuary', 'ocean'], uk: true, occurrence: 'North Atlantic Ocean and connected rivers', description: 'A vertebrate with gills and fins that uses both rivers and the ocean during its life.', illustrationKey: 'fish', binaryFeatures: ['gills', 'fins', 'scales'] }),
  animal({ id: 'european-eel', commonName: 'European eel', scientificName: 'Anguilla anguilla', broadGroup: 'fish', backbone: 'vertebrate', covering: 'smooth-looking skin with tiny scales', limbs: 0, movement: 'swims with a long flexible body', habitats: ['freshwater', 'coast-estuary', 'ocean'], uk: true, occurrence: 'European and North African waters with an oceanic life-cycle connection', description: 'A long-bodied fish with gills and continuous fins.', illustrationKey: 'eel', binaryFeatures: ['gills', 'fins', 'long-body'] }),
  animal({ id: 'common-clownfish', commonName: 'Common clownfish', scientificName: 'Amphiprion ocellaris', broadGroup: 'fish', backbone: 'vertebrate', covering: 'scales and mucus', limbs: 0, movement: 'swims with fins and tail', habitats: ['ocean'], occurrence: 'Warm shallow seas of the Indo-Pacific', description: 'A small reef fish with gills, fins and pale bands across an orange body.', illustrationKey: 'clownfish', binaryFeatures: ['gills', 'fins', 'scales', 'body-bands'] }),
  animal({ id: 'great-white-shark', commonName: 'Great white shark', scientificName: 'Carcharodon carcharias', broadGroup: 'fish', subgroup: 'cartilaginous-fish', backbone: 'vertebrate', covering: 'tooth-like placoid scales', limbs: 0, movement: 'swims with fins and tail', habitats: ['ocean', 'coast-estuary'], occurrence: 'Coastal and open oceans in several temperate and subtropical regions', description: 'A large cartilaginous fish with gills, fins and a streamlined body.', illustrationKey: 'shark', binaryFeatures: ['gills', 'fins', 'pointed-dorsal-fin', 'cartilage-skeleton'] }),
  animal({ id: 'long-snouted-seahorse', commonName: 'Long-snouted seahorse', scientificName: 'Hippocampus guttulatus', broadGroup: 'fish', backbone: 'vertebrate', covering: 'bony plates', limbs: 0, movement: 'swims upright using small fins and grips with its tail', habitats: ['ocean', 'coast-estuary'], uk: true, occurrence: 'North-east Atlantic and Mediterranean coastal waters', description: 'An upright-swimming fish with gills, small fins and a curled gripping tail.', illustrationKey: 'seahorse', binaryFeatures: ['gills', 'fins', 'upright-body', 'curled-tail'] }),

  // Reptiles
  animal({ id: 'green-sea-turtle', commonName: 'Green sea turtle', scientificName: 'Chelonia mydas', broadGroup: 'reptile', backbone: 'vertebrate', covering: 'dry scales and a bony shell', limbs: 4, shell: true, movement: 'swims with flippers and moves on land to nest', habitats: ['ocean', 'coast-estuary'], occurrence: 'Tropical and subtropical seas in many regions', description: 'An air-breathing reptile with scales, four flippers and a shell.', illustrationKey: 'turtle', binaryFeatures: ['dry-scales', 'four-limbs', 'flippers', 'breathes-air'] }),
  animal({ id: 'grass-snake', commonName: 'Grass snake', scientificName: 'Natrix helvetica', broadGroup: 'reptile', backbone: 'vertebrate', covering: 'dry scales', limbs: 0, movement: 'slithers and swims', habitats: ['grassland', 'freshwater', 'woodland', 'garden-park'], uk: true, occurrence: 'Britain and parts of western Europe', description: 'A legless reptile with dry scales and a flexible body.', illustrationKey: 'snake', binaryFeatures: ['dry-scales', 'long-body', 'forked-tongue'] }),
  animal({ id: 'west-african-crocodile', commonName: 'West African crocodile', scientificName: 'Crocodylus suchus', broadGroup: 'reptile', backbone: 'vertebrate', covering: 'dry scales and bony plates', limbs: 4, movement: 'walks, crawls and swims', habitats: ['freshwater', 'coast-estuary'], gambia: true, occurrence: 'Freshwater and wetland habitats in parts of western and central Africa, including The Gambia', description: 'A large scaled reptile with four short limbs, a long snout and a powerful tail.', illustrationKey: 'crocodile', binaryFeatures: ['dry-scales', 'four-limbs', 'long-snout', 'armoured-plates'], extraSources: ['source-reptile-database-crocodylus-suchus'] }),
  animal({ id: 'leopard-gecko', commonName: 'Leopard gecko', scientificName: 'Eublepharis macularius', broadGroup: 'reptile', backbone: 'vertebrate', covering: 'dry, bumpy scales', limbs: 4, movement: 'walks and climbs over ground', habitats: ['desert', 'grassland'], occurrence: 'Dry rocky and grassland regions of parts of South and Central Asia', description: 'A small four-legged reptile with dry scales, eyelids and a thick tail.', illustrationKey: 'lizard', binaryFeatures: ['dry-scales', 'four-limbs', 'thick-tail', 'eyelids'] }),
  animal({ id: 'hermanns-tortoise', commonName: 'Hermann’s tortoise', scientificName: 'Testudo hermanni', broadGroup: 'reptile', backbone: 'vertebrate', covering: 'dry scales and a bony shell', limbs: 4, shell: true, movement: 'walks on land', habitats: ['grassland', 'woodland'], occurrence: 'Mediterranean scrub, grassland and open woodland', description: 'A land-living reptile with four sturdy limbs and a domed shell.', illustrationKey: 'tortoise', binaryFeatures: ['dry-scales', 'four-limbs', 'domed-shell'] }),

  // Amphibians
  animal({ id: 'common-frog', commonName: 'Common frog', scientificName: 'Rana temporaria', broadGroup: 'amphibian', backbone: 'vertebrate', covering: 'moist skin', limbs: 4, movement: 'jumps, walks and swims', habitats: ['freshwater', 'grassland', 'woodland', 'garden-park'], uk: true, occurrence: 'United Kingdom and much of Europe', description: 'A moist-skinned vertebrate with long hind limbs; familiar life stages use water and land.', illustrationKey: 'frog', binaryFeatures: ['moist-skin', 'four-limbs', 'long-hind-legs'] }),
  animal({ id: 'common-toad', commonName: 'Common toad', scientificName: 'Bufo bufo', broadGroup: 'amphibian', backbone: 'vertebrate', covering: 'glandular, relatively dry-looking skin', limbs: 4, movement: 'usually walks or makes short hops and swims', habitats: ['freshwater', 'grassland', 'woodland', 'garden-park'], uk: true, occurrence: 'United Kingdom and much of Europe', description: 'A stout amphibian with four limbs and bumpy glandular skin.', teacherNote: '“Moist skin” is a useful broad amphibian characteristic, but familiar species vary in how wet the surface appears.', illustrationKey: 'toad', binaryFeatures: ['moist-skin', 'four-limbs', 'bumpy-skin', 'short-hops'] }),
  animal({ id: 'smooth-newt', commonName: 'Smooth newt', scientificName: 'Lissotriton vulgaris', broadGroup: 'amphibian', backbone: 'vertebrate', covering: 'smooth, moist skin', limbs: 4, movement: 'walks and swims with its tail', habitats: ['freshwater', 'woodland', 'grassland', 'garden-park'], uk: true, occurrence: 'United Kingdom and much of Europe', description: 'A small amphibian with four limbs and a long tail throughout adulthood.', illustrationKey: 'newt', binaryFeatures: ['moist-skin', 'four-limbs', 'adult-tail'] }),
  animal({ id: 'african-clawed-frog', commonName: 'African clawed frog', scientificName: 'Xenopus laevis', broadGroup: 'amphibian', backbone: 'vertebrate', covering: 'smooth, slippery skin', limbs: 4, movement: 'swims and spends most of its life in water', habitats: ['freshwater'], occurrence: 'Freshwater habitats in parts of southern Africa and introduced elsewhere', description: 'A mostly aquatic amphibian with flattened body, webbed hind feet and small claws.', illustrationKey: 'clawed-frog', binaryFeatures: ['moist-skin', 'four-limbs', 'webbed-feet', 'small-claws'] }),

  // Insects
  animal({ id: 'western-honey-bee', commonName: 'Western honey bee', scientificName: 'Apis mellifera', broadGroup: 'invertebrate', subgroup: 'insect', backbone: 'invertebrate', covering: 'exoskeleton with hairs', limbs: 6, wings: true, exoskeleton: true, segmented: true, movement: 'walks and flies', habitats: ['grassland', 'woodland', 'urban', 'garden-park'], uk: true, gambia: true, occurrence: 'Native to Europe, Africa and western Asia and managed or introduced more widely', description: 'An insect with six legs, antennae and two pairs of wings.', illustrationKey: 'bee', binaryFeatures: ['antennae', 'three-body-sections', 'hairy-body'] }),
  animal({ id: 'seven-spot-ladybird', commonName: 'Seven-spot ladybird', scientificName: 'Coccinella septempunctata', broadGroup: 'invertebrate', subgroup: 'insect', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 6, wings: true, exoskeleton: true, segmented: true, movement: 'walks and flies', habitats: ['grassland', 'woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe, Asia and North Africa, with introductions elsewhere', description: 'A beetle with six legs, hardened forewings and usually seven dark spots.', illustrationKey: 'ladybird', binaryFeatures: ['antennae', 'three-body-sections', 'hard-forewings', 'spots'] }),
  animal({ id: 'peacock-butterfly', commonName: 'Peacock butterfly', scientificName: 'Aglais io', broadGroup: 'invertebrate', subgroup: 'insect', backbone: 'invertebrate', covering: 'exoskeleton with tiny wing scales', limbs: 6, wings: true, exoskeleton: true, segmented: true, movement: 'walks and flies', habitats: ['grassland', 'woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and temperate Asia', description: 'An insect with six legs, antennae and broad scale-covered wings with eye-like markings.', illustrationKey: 'butterfly', binaryFeatures: ['antennae', 'three-body-sections', 'broad-wings', 'eye-spots'] }),
  animal({ id: 'common-darter', commonName: 'Common darter dragonfly', scientificName: 'Sympetrum striolatum', broadGroup: 'invertebrate', subgroup: 'insect', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 6, wings: true, exoskeleton: true, segmented: true, movement: 'walks, perches and flies', habitats: ['freshwater', 'grassland', 'garden-park'], uk: true, occurrence: 'Europe, North Africa and parts of Asia', description: 'An insect with six legs, a long segmented abdomen and two pairs of clear wings.', illustrationKey: 'dragonfly', binaryFeatures: ['antennae', 'three-body-sections', 'long-abdomen', 'two-pairs-clear-wings'] }),
  animal({ id: 'field-grasshopper', commonName: 'Field grasshopper', scientificName: 'Chorthippus brunneus', broadGroup: 'invertebrate', subgroup: 'insect', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 6, wings: true, exoskeleton: true, segmented: true, movement: 'walks, jumps and may fly', habitats: ['grassland', 'garden-park'], uk: true, occurrence: 'Europe and temperate Asia', description: 'An insect with six legs and enlarged hind legs for jumping.', illustrationKey: 'grasshopper', binaryFeatures: ['antennae', 'three-body-sections', 'large-hind-legs'] }),
  animal({ id: 'black-garden-ant', commonName: 'Black garden ant', scientificName: 'Lasius niger', broadGroup: 'invertebrate', subgroup: 'insect', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 6, wings: false, exoskeleton: true, segmented: true, movement: 'walks; reproductive adults may fly', habitats: ['grassland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and parts of Asia and North America', description: 'A familiar worker insect with six legs, bent antennae and a narrow waist.', teacherNote: 'The shown worker has no wings; some adult reproductive ants have wings.', illustrationKey: 'ant', binaryFeatures: ['antennae', 'three-body-sections', 'narrow-waist', 'bent-antennae'] }),
  animal({ id: 'indian-stick-insect', commonName: 'Indian stick insect', scientificName: 'Carausius morosus', broadGroup: 'invertebrate', subgroup: 'insect', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 6, wings: false, exoskeleton: true, segmented: true, movement: 'walks and sways', habitats: ['tropical-forest'], occurrence: 'Native to parts of southern India and kept widely in captivity', description: 'A long narrow insect with six legs and a body resembling a twig.', illustrationKey: 'stick-insect', binaryFeatures: ['antennae', 'three-body-sections', 'twig-like-body', 'long-legs'] }),

  // Arachnids
  animal({ id: 'garden-cross-spider', commonName: 'Garden cross spider', scientificName: 'Araneus diadematus', broadGroup: 'invertebrate', subgroup: 'arachnid', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 8, exoskeleton: true, segmented: true, movement: 'walks and climbs on silk', habitats: ['woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and parts of North America and Asia', description: 'An arachnid with eight legs and two main body regions.', illustrationKey: 'spider', binaryFeatures: ['two-main-body-regions', 'spinnerets'] }),
  animal({ id: 'emperor-scorpion', commonName: 'Emperor scorpion', scientificName: 'Pandinus imperator', broadGroup: 'invertebrate', subgroup: 'arachnid', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 8, exoskeleton: true, segmented: true, movement: 'walks', habitats: ['tropical-forest'], occurrence: 'Humid forests of western Africa', description: 'A large arachnid with eight walking legs, two pincers and a segmented tail.', illustrationKey: 'scorpion', binaryFeatures: ['pincers', 'segmented-tail', 'stinger'] }),
  animal({ id: 'harvestman', commonName: 'Harvestman', scientificName: 'Phalangium opilio', broadGroup: 'invertebrate', subgroup: 'arachnid', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 8, exoskeleton: true, segmented: true, movement: 'walks on long legs', habitats: ['grassland', 'woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and introduced in several other regions', description: 'An arachnid with eight very long legs and a broadly joined-looking body.', teacherNote: 'Harvestmen are arachnids but are not spiders.', illustrationKey: 'harvestman', binaryFeatures: ['very-long-legs', 'joined-looking-body'] }),
  animal({ id: 'castor-bean-tick', commonName: 'Castor bean tick', scientificName: 'Ixodes ricinus', broadGroup: 'invertebrate', subgroup: 'arachnid', backbone: 'invertebrate', covering: 'exoskeleton', limbs: 8, exoskeleton: true, segmented: false, movement: 'walks and clings', habitats: ['grassland', 'woodland', 'garden-park'], uk: true, occurrence: 'Europe and nearby regions', description: 'A small arachnid whose adult stage has eight legs and a compact body.', illustrationKey: 'tick', binaryFeatures: ['compact-body', 'piercing-mouthparts'] }),

  // Molluscs
  animal({ id: 'garden-snail', commonName: 'Garden snail', scientificName: 'Cornu aspersum', broadGroup: 'invertebrate', subgroup: 'mollusc', backbone: 'invertebrate', covering: 'soft body and coiled shell', limbs: 0, shell: true, movement: 'glides on a muscular foot', habitats: ['grassland', 'urban', 'garden-park'], uk: true, occurrence: 'Western Europe and Mediterranean region, introduced widely', description: 'A soft-bodied mollusc with a coiled external shell and tentacles.', illustrationKey: 'snail', binaryFeatures: ['soft-body', 'coiled-shell', 'tentacles', 'muscular-foot'] }),
  animal({ id: 'large-red-slug', commonName: 'Large red slug', scientificName: 'Arion rufus', broadGroup: 'invertebrate', subgroup: 'mollusc', backbone: 'invertebrate', covering: 'soft moist body', limbs: 0, movement: 'glides on a muscular foot', habitats: ['grassland', 'woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Western and central Europe', description: 'A soft-bodied mollusc without a visible external shell.', illustrationKey: 'slug', binaryFeatures: ['soft-body', 'tentacles', 'muscular-foot'] }),
  animal({ id: 'common-octopus', commonName: 'Common octopus', scientificName: 'Octopus vulgaris', broadGroup: 'invertebrate', subgroup: 'mollusc', backbone: 'invertebrate', covering: 'soft skin', limbs: 8, movement: 'crawls with arms and swims by jet propulsion', habitats: ['ocean', 'coast-estuary'], occurrence: 'Tropical, subtropical and temperate seas in several regions', description: 'A marine mollusc with a soft body, eight sucker-bearing arms and no external shell.', illustrationKey: 'octopus', binaryFeatures: ['soft-body', 'eight-arms', 'suckers', 'jet-propulsion'] }),
  animal({ id: 'blue-mussel', commonName: 'Blue mussel', scientificName: 'Mytilus edulis', broadGroup: 'invertebrate', subgroup: 'mollusc', backbone: 'invertebrate', covering: 'two-part shell', limbs: 0, shell: true, movement: 'usually attaches to a surface; larvae move in water', habitats: ['coast-estuary', 'ocean'], uk: true, occurrence: 'North Atlantic coasts', description: 'A soft-bodied mollusc protected by two hinged shell valves.', illustrationKey: 'mussel', binaryFeatures: ['soft-body', 'two-part-shell', 'hinge'] }),

  // Annelids
  animal({ id: 'common-earthworm', commonName: 'Common earthworm', scientificName: 'Lumbricus terrestris', broadGroup: 'invertebrate', subgroup: 'annelid', backbone: 'invertebrate', covering: 'moist skin', limbs: 0, segmented: true, movement: 'contracts body segments and grips soil with tiny bristles', habitats: ['grassland', 'woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and introduced widely', description: 'A legless annelid with many visible ring-like body segments.', illustrationKey: 'earthworm', binaryFeatures: ['many-ring-segments', 'long-body', 'moist-skin'] }),
  animal({ id: 'medicinal-leech', commonName: 'Medicinal leech', scientificName: 'Hirudo medicinalis', broadGroup: 'invertebrate', subgroup: 'annelid', backbone: 'invertebrate', covering: 'smooth moist skin', limbs: 0, segmented: true, movement: 'swims and attaches using suckers', habitats: ['freshwater'], uk: true, occurrence: 'Freshwater sites in parts of Europe', description: 'A flattened segmented annelid with a sucker at each end.', illustrationKey: 'leech', binaryFeatures: ['flattened-body', 'suckers', 'many-ring-segments'] }),

  // Crustaceans
  animal({ id: 'common-shore-crab', commonName: 'Common shore crab', scientificName: 'Carcinus maenas', broadGroup: 'invertebrate', subgroup: 'crustacean', backbone: 'invertebrate', covering: 'hard exoskeleton', limbs: 10, exoskeleton: true, segmented: true, movement: 'walks sideways and swims short distances', habitats: ['coast-estuary', 'ocean'], uk: true, occurrence: 'North-east Atlantic coasts and introduced elsewhere', description: 'A crustacean with a broad shell, five pairs of legs and two claws.', illustrationKey: 'crab', binaryFeatures: ['pincers', 'broad-carapace', 'ten-limbs'] }),
  animal({ id: 'common-rough-woodlouse', commonName: 'Common rough woodlouse', scientificName: 'Porcellio scaber', broadGroup: 'invertebrate', subgroup: 'crustacean', backbone: 'invertebrate', covering: 'segmented exoskeleton', limbs: 14, exoskeleton: true, segmented: true, movement: 'walks', habitats: ['woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and introduced widely', description: 'A land-living crustacean with a flattened segmented body and seven pairs of walking legs.', illustrationKey: 'woodlouse', binaryFeatures: ['flattened-body', 'many-plates', 'fourteen-limbs'] }),
  animal({ id: 'common-prawn', commonName: 'Common prawn', scientificName: 'Palaemon serratus', broadGroup: 'invertebrate', subgroup: 'crustacean', backbone: 'invertebrate', covering: 'transparent exoskeleton', limbs: 10, exoskeleton: true, segmented: true, movement: 'walks and swims', habitats: ['coast-estuary', 'ocean'], uk: true, occurrence: 'North-east Atlantic and Mediterranean coastal waters', description: 'A slender crustacean with a segmented abdomen, antennae and several pairs of limbs.', illustrationKey: 'prawn', binaryFeatures: ['long-antennae', 'segmented-abdomen', 'ten-limbs'] }),

  // Myriapods
  animal({ id: 'brown-centipede', commonName: 'Brown centipede', scientificName: 'Lithobius forficatus', broadGroup: 'invertebrate', subgroup: 'myriapod', backbone: 'invertebrate', covering: 'segmented exoskeleton', limbs: 30, exoskeleton: true, segmented: true, movement: 'runs using one pair of legs on most body segments', habitats: ['woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and introduced elsewhere', description: 'A flattened myriapod with one pair of legs on most body segments.', illustrationKey: 'centipede', binaryFeatures: ['many-ring-segments', 'one-leg-pair-per-segment', 'flattened-body'] }),
  animal({ id: 'white-legged-snake-millipede', commonName: 'White-legged snake millipede', scientificName: 'Tachypodoiulus niger', broadGroup: 'invertebrate', subgroup: 'myriapod', backbone: 'invertebrate', covering: 'segmented exoskeleton', limbs: 80, exoskeleton: true, segmented: true, movement: 'walks using two pairs of legs on most apparent body rings', habitats: ['woodland', 'urban', 'garden-park'], uk: true, occurrence: 'Western Europe', description: 'A rounded myriapod with many segments and two pairs of legs on most apparent body rings.', illustrationKey: 'millipede', binaryFeatures: ['many-ring-segments', 'two-leg-pairs-per-ring', 'rounded-body'] }),

  // Echinoderms
  animal({ id: 'common-starfish', commonName: 'Common starfish', scientificName: 'Asterias rubens', broadGroup: 'invertebrate', subgroup: 'echinoderm', backbone: 'invertebrate', covering: 'spiny skin over internal plates', limbs: 5, movement: 'moves slowly using tube feet', habitats: ['coast-estuary', 'ocean'], uk: true, occurrence: 'North-east Atlantic coasts', description: 'A marine invertebrate with a central disc and usually five radiating arms.', illustrationKey: 'starfish', binaryFeatures: ['five-part-radial-body', 'tube-feet', 'spiny-skin'] }),
  animal({ id: 'edible-sea-urchin', commonName: 'Edible sea urchin', scientificName: 'Echinus esculentus', broadGroup: 'invertebrate', subgroup: 'echinoderm', backbone: 'invertebrate', covering: 'movable spines over a hard internal test', limbs: 0, movement: 'moves slowly using tube feet and spines', habitats: ['ocean', 'coast-estuary'], uk: true, occurrence: 'North-east Atlantic coasts', description: 'A rounded marine invertebrate with many movable spines and five-part body organisation.', illustrationKey: 'urchin', binaryFeatures: ['five-part-radial-body', 'tube-feet', 'many-spines', 'rounded-body'] }),

  // Plants
  plant({ id: 'english-oak', commonName: 'English oak', scientificName: 'Quercus robur', group: 'flowering-plant', covering: 'bark, leaves and seasonal flowers', habitats: ['woodland', 'grassland', 'urban', 'garden-park'], uk: true, occurrence: 'Europe and parts of western Asia, planted more widely', description: 'A woody flowering plant with a trunk, lobed leaves and acorns.', illustrationKey: 'oak', binaryFeatures: ['woody-stem', 'broad-leaves', 'acorns'] }),
  plant({ id: 'common-dandelion', commonName: 'Common dandelion', scientificName: 'Taraxacum officinale', group: 'flowering-plant', covering: 'leaves, flowers and seed heads', habitats: ['grassland', 'urban', 'garden-park'], uk: true, occurrence: 'Temperate regions and introduced widely', description: 'A low flowering plant with toothed leaves, yellow flower heads and wind-carried seeds.', illustrationKey: 'dandelion', binaryFeatures: ['flowers', 'toothed-leaves', 'seed-head'] }),
  plant({ id: 'bracken', commonName: 'Bracken', scientificName: 'Pteridium aquilinum', group: 'fern', covering: 'divided fronds', habitats: ['woodland', 'grassland'], uk: true, occurrence: 'Very widespread in suitable habitats around the world', description: 'A fern with large divided fronds; it reproduces using spores rather than flowers.', illustrationKey: 'fern', binaryFeatures: ['fronds', 'spores', 'no-flowers'] }),
  plant({ id: 'common-haircap-moss', commonName: 'Common haircap moss', scientificName: 'Polytrichum commune', group: 'moss', covering: 'small leaf-like shoots', habitats: ['woodland', 'freshwater'], uk: true, occurrence: 'Moist habitats across many regions', description: 'A small non-flowering plant that forms cushions of upright shoots and reproduces by spores.', illustrationKey: 'moss', binaryFeatures: ['small-leaf-like-shoots', 'spores', 'no-flowers'] }),
  plant({ id: 'red-mangrove', commonName: 'Red mangrove', scientificName: 'Rhizophora mangle', group: 'flowering-plant', covering: 'bark, leathery leaves and flowers', habitats: ['coast-estuary', 'tropical-forest'], gambia: true, occurrence: 'Tropical Atlantic coasts, including mangrove systems in West Africa and The Gambia', description: 'A salt-tolerant tree with arching support roots in tidal habitats.', teacherNote: 'A country contains many habitats; mangroves are one important Gambian coastal and river-edge habitat, not the whole country.', illustrationKey: 'mangrove', binaryFeatures: ['woody-stem', 'broad-leaves', 'prop-roots', 'flowers'], extraSources: ['source-ramsar-gambia-wetlands'] }),
  plant({ id: 'common-eelgrass', commonName: 'Common eelgrass', scientificName: 'Zostera marina', group: 'flowering-plant', covering: 'long ribbon-like leaves', habitats: ['coast-estuary', 'ocean'], uk: true, occurrence: 'Shallow coastal waters of the Northern Hemisphere', description: 'A flowering plant that grows submerged in seawater and forms seagrass beds.', teacherNote: 'Seagrass is a flowering plant, not a seaweed.', illustrationKey: 'seagrass', binaryFeatures: ['flowers', 'ribbon-leaves', 'submerged-plant'] }),
]);

export const HABITATS = Object.freeze([
  { id: 'woodland', title: 'Woodland', scale: 'habitat', atlasLinks: ['uk'], conditions: ['layered plant cover', 'variable light', 'leaf litter', 'seasonal moisture'], resources: ['leaves, seeds and other food', 'water', 'tree holes and ground shelter', 'soil and dead wood'], description: 'A habitat shaped by trees, other plants, soil, dead material and changing light.' },
  { id: 'grassland', title: 'Grassland', scale: 'habitat', atlasLinks: ['uk', 'gambia'], conditions: ['open light', 'grass-dominated cover', 'seasonal moisture', 'exposed ground'], resources: ['grasses and seeds', 'insects and other food', 'soil burrows', 'open space'], description: 'An open habitat dominated by grasses; its species and conditions vary greatly between places.' },
  { id: 'freshwater', title: 'Freshwater', scale: 'habitat', atlasLinks: ['uk', 'gambia', 'river-gambia'], conditions: ['low-salt water', 'flowing or still water', 'oxygen that varies', 'wet edges'], resources: ['water', 'aquatic plants', 'prey and plant food', 'mud, stones and bank shelter'], description: 'Rivers, ponds, lakes and wetlands whose conditions differ in flow, depth, temperature and vegetation.' },
  { id: 'coast-estuary', title: 'Coast & estuary', scale: 'habitat', atlasLinks: ['uk', 'gambia', 'river-gambia'], conditions: ['tides', 'changing salinity', 'wind and waves', 'mud, sand, rock or mangrove roots'], resources: ['shallow water', 'sediment and surfaces', 'plant and animal food', 'sheltered creeks'], description: 'A meeting zone between land and water; an estuary may mix fresh and salt water.' },
  { id: 'ocean', title: 'Ocean', scale: 'habitat', atlasLinks: ['atlantic-ocean'], conditions: ['salt water', 'depth zones', 'currents', 'light decreases with depth'], resources: ['dissolved oxygen', 'plankton and other food', 'reefs, seabed or open water', 'large connected space'], description: 'A vast salt-water habitat containing many distinct zones rather than one uniform place.' },
  { id: 'desert', title: 'Desert', scale: 'habitat', atlasLinks: [], conditions: ['very low rainfall', 'large temperature changes in some deserts', 'open ground', 'limited surface water'], resources: ['scattered food', 'burrows and shade', 'brief or stored water', 'space'], description: 'A dry habitat defined by low rainfall; deserts are not all hot.' },
  { id: 'tropical-forest', title: 'Tropical forest', scale: 'habitat', atlasLinks: ['gambia'], conditions: ['warm conditions', 'layered vegetation', 'high or seasonal rainfall depending on forest type', 'shaded ground'], resources: ['plant and animal food', 'water', 'tree and leaf shelter', 'many surfaces'], description: 'A broad family of warm forest habitats. The Gambia is not represented as one continuous tropical forest.' },
  { id: 'polar-tundra', title: 'Polar & tundra', scale: 'habitat', atlasLinks: [], conditions: ['low temperatures', 'strong seasonality', 'ice, snow or frozen ground', 'short growing periods'], resources: ['seasonal food', 'sea ice, coast or low vegetation', 'sheltered breeding places', 'ocean connections'], description: 'Cold high-latitude habitats whose land, coast and ocean conditions differ.' },
  { id: 'urban', title: 'Urban habitat', scale: 'habitat', atlasLinks: ['uk', 'gambia'], conditions: ['buildings and hard surfaces', 'small green patches', 'artificial light and disturbance', 'warmer sheltered spaces in places'], resources: ['food from plants or human activity', 'water in drains or ponds', 'roof, wall and gap shelter', 'connected parks and verges'], description: 'Towns and cities contain many habitats, from walls and roofs to parks, drains and vacant ground.' },
  { id: 'garden-park', title: 'Garden & park', scale: 'habitat', atlasLinks: ['uk', 'gambia'], conditions: ['managed vegetation', 'patches of shade and sun', 'soil and hard surfaces', 'variable disturbance'], resources: ['flowers, leaves, seeds and prey', 'ponds or containers of water', 'hedges, logs and soil shelter', 'nesting spaces'], description: 'A managed green space that may contain several microhabitats close together.' },
]);

export const MICROHABITATS = Object.freeze([
  { id: 'beneath-log', title: 'Beneath a log', parentHabitatIds: ['woodland', 'garden-park'], conditions: ['darker', 'often damper', 'less wind', 'decaying wood'], likelyOrganismIds: ['common-rough-woodlouse', 'common-earthworm', 'brown-centipede', 'large-red-slug'] },
  { id: 'leaf-litter', title: 'Leaf litter', parentHabitatIds: ['woodland', 'garden-park'], conditions: ['layered dead leaves', 'changing moisture', 'food for decomposers', 'small gaps'], likelyOrganismIds: ['common-rough-woodlouse', 'common-earthworm', 'brown-centipede'] },
  { id: 'pond-edge', title: 'Pond edge', parentHabitatIds: ['freshwater', 'garden-park'], conditions: ['shallow water', 'wet soil', 'emergent plants', 'changing water level'], likelyOrganismIds: ['common-frog', 'smooth-newt', 'common-darter'] },
  { id: 'tree-bark', title: 'Tree bark', parentHabitatIds: ['woodland', 'garden-park', 'urban'], conditions: ['rough surface', 'crevices', 'sun and shade patches', 'variable moisture'], likelyOrganismIds: ['garden-cross-spider', 'seven-spot-ladybird', 'black-garden-ant'] },
  { id: 'stone-wall', title: 'Stone wall', parentHabitatIds: ['urban', 'garden-park'], conditions: ['cracks', 'stored warmth', 'dry faces and damp gaps', 'vertical surfaces'], likelyOrganismIds: ['garden-snail', 'garden-cross-spider', 'black-garden-ant'] },
  { id: 'compost', title: 'Compost', parentHabitatIds: ['garden-park'], conditions: ['decaying material', 'warmth that varies', 'moist pockets', 'little light inside'], likelyOrganismIds: ['common-earthworm', 'common-rough-woodlouse', 'brown-centipede'] },
  { id: 'pavement-crack', title: 'Crack in pavement', parentHabitatIds: ['urban'], conditions: ['little soil', 'runoff water', 'heat from hard surfaces', 'disturbance'], likelyOrganismIds: ['common-dandelion', 'black-garden-ant', 'garden-cross-spider'] },
  { id: 'shaded-soil', title: 'Shaded soil', parentHabitatIds: ['woodland', 'garden-park'], conditions: ['lower light', 'cooler surface', 'moisture retained longer', 'roots and soil pores'], likelyOrganismIds: ['common-haircap-moss', 'common-earthworm', 'large-red-slug'] },
]);

export function getOrganism(id) {
  return ORGANISMS.find((organism) => organism.id === id) || null;
}

export function getHabitat(id) {
  return HABITATS.find((habitat) => habitat.id === id) || null;
}

export function organismsForHabitat(habitatId) {
  return ORGANISMS.filter((organism) => organism.habitatIds.includes(habitatId));
}

export function validateOrganismLibrary({ organisms = ORGANISMS, habitats = HABITATS } = {}) {
  const errors = [];
  const ids = new Set();
  const habitatIds = new Set(habitats.map((habitat) => habitat.id));
  const allowedBackbone = new Set(['vertebrate', 'invertebrate', null]);
  const vertebrateGroups = new Set(['mammal', 'bird', 'fish', 'reptile', 'amphibian']);
  for (const organism of organisms) {
    if (!organism.id || ids.has(organism.id)) errors.push(`Organism ID must be unique: ${organism.id || 'missing'}.`);
    ids.add(organism.id);
    for (const field of ['commonName', 'scientificName', 'kingdom', 'broadGroup', 'illustrationKey']) {
      if (!organism[field]) errors.push(`${organism.id || 'Unknown organism'} is missing ${field}.`);
    }
    if (!allowedBackbone.has(organism.backbone)) errors.push(`${organism.id} has invalid backbone status.`);
    if (organism.kingdom === 'animal' && organism.backbone === null) errors.push(`${organism.id} needs animal backbone status.`);
    if (organism.kingdom === 'plant' && organism.backbone !== null) errors.push(`${organism.id} cannot be labelled vertebrate or invertebrate.`);
    if (vertebrateGroups.has(organism.broadGroup) && organism.backbone !== 'vertebrate') errors.push(`${organism.id} contradicts its vertebrate group.`);
    if (organism.subgroup === 'insect' && organism.features.visibleLimbs !== 6) errors.push(`${organism.id} is labelled insect without six adult legs.`);
    if (organism.subgroup === 'arachnid' && organism.features.visibleLimbs !== 8) errors.push(`${organism.id} is labelled arachnid without eight adult legs.`);
    if (organism.id === 'bottlenose-dolphin' && organism.broadGroup === 'fish') errors.push('Dolphin cannot be labelled as fish.');
    if (!organism.imageRights?.licence || !organism.imageRights?.attribution) errors.push(`${organism.id} lacks illustration rights metadata.`);
    if (!Array.isArray(organism.sources) || organism.sources.length === 0) errors.push(`${organism.id} lacks source metadata.`);
    if (!Array.isArray(organism.habitatIds) || organism.habitatIds.length === 0) errors.push(`${organism.id} needs at least one habitat reference.`);
    for (const habitatId of organism.habitatIds || []) if (!habitatIds.has(habitatId)) errors.push(`${organism.id} refers to missing habitat ${habitatId}.`);
    if (!Array.isArray(organism.binaryFeatures) || organism.binaryFeatures.length < 3) errors.push(`${organism.id} needs classification features.`);
  }
  return { valid: errors.length === 0, errors };
}

export default ORGANISMS;
