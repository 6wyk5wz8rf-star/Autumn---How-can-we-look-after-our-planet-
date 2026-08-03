/**
 * Shared visual glossary.
 *
 * `speechText` is safe input for local/browser text-to-speech; `guide` is a
 * readable pronunciation hint. Visual examples are original diagram briefs so
 * the glossary does not depend on remote or unlicensed imagery.
 */

const glossaryEntry = ({
  id,
  term,
  domain,
  guide,
  definition,
  visual,
  example,
  related,
  deeper = null,
  activeInBuild1 = domain === 'geography',
  active = activeInBuild1,
  activationBuild = domain === 'art' ? 10 : 1,
}) => Object.freeze({
  id,
  term,
  domain,
  active,
  future: !active,
  available: active,
  activeInBuild1,
  activationBuild,
  pronunciationText: term,
  spokenPronunciation: { speechText: term, guide },
  definition,
  visualExample: { kind: 'original-diagram', description: visual },
  example,
  contextualExample: example,
  relatedConceptIds: related,
  deeperExplanation: deeper,
});

const geographyEntries = [
  glossaryEntry({
    id: 'earth', term: 'Earth', domain: 'geography', guide: 'URTH',
    definition: 'The planet we live on.',
    visual: 'A simple globe with land, ocean and one small location marker.',
    example: 'Earth can be represented as a globe or on a flat map.', related: ['planet', 'globe', 'maps-and-globes'],
    deeper: 'Earth is almost spherical, so every flat world map changes some shapes, sizes, distances or directions.',
  }),
  glossaryEntry({
    id: 'planet', term: 'planet', domain: 'geography', guide: 'PLAN-it',
    definition: 'A large, nearly round object that travels around a star.',
    visual: 'Earth travelling on a curved path around the Sun.',
    example: 'Earth is one of the planets that travels around the Sun.', related: ['earth'],
  }),
  glossaryEntry({
    id: 'globe', term: 'globe', domain: 'geography', guide: 'GLOHB',
    definition: 'A round model of Earth.',
    visual: 'A rotatable round Earth beside the outline of the same continent on a map.',
    example: 'The globe keeps Earth curved while we rotate to find Africa.', related: ['earth', 'maps-and-globes', 'map-scale'],
  }),
  glossaryEntry({
    id: 'map', term: 'map', domain: 'geography', guide: 'MAP',
    definition: 'A representation of a place that helps us locate and compare features.',
    visual: 'A coastline, river, border, scale and compass shown with simple symbols.',
    example: 'This map shows The Gambia within the surrounding outline of Senegal.', related: ['maps-and-globes', 'place', 'map-scale'],
    deeper: 'Maps are made for purposes. What they select, label and leave out affects what they help us see.',
  }),
  glossaryEntry({
    id: 'atlas', term: 'atlas', domain: 'geography', guide: 'AT-lus',
    definition: 'A collection of maps organised to help us investigate places.',
    visual: 'Several linked map pages moving from a world view to a country view.',
    example: 'An atlas can help us move from Africa to West Africa and then The Gambia.', related: ['map', 'maps-and-globes', 'map-scale'],
  }),
  glossaryEntry({
    id: 'continent', term: 'continent', domain: 'geography', guide: 'KON-tih-nent',
    definition: 'One of Earth’s very large areas of land, containing many countries and places.',
    visual: 'Africa highlighted within a world map, with several country borders faintly visible inside it.',
    example: 'Africa is a continent; The Gambia is one country within it.', related: ['africa', 'country', 'region'],
  }),
  glossaryEntry({
    id: 'country', term: 'country', domain: 'geography', guide: 'KUN-tree',
    definition: 'A place with recognised borders and its own system of government.',
    visual: 'One country boundary highlighted inside a wider continent.',
    example: 'The Gambia and Senegal are neighbouring countries in West Africa.', related: ['the-gambia', 'senegal', 'border', 'continent'],
  }),
  glossaryEntry({
    id: 'region', term: 'region', domain: 'geography', guide: 'REE-jun',
    definition: 'An area grouped because of its location or shared features; it may include parts of several countries.',
    visual: 'A softly shaded area crossing or containing several country boundaries.',
    example: 'West Africa is a region containing many countries, including The Gambia.', related: ['west-africa', 'country', 'place'],
  }),
  glossaryEntry({
    id: 'ocean', term: 'ocean', domain: 'geography', guide: 'OH-shun',
    definition: 'One of the enormous connected areas of salty water covering much of Earth.',
    visual: 'A world map with ocean areas labelled around the continents.',
    example: 'The Atlantic Ocean lies west of Africa and meets The Gambia’s coast.', related: ['earth', 'coastline', 'africa'],
  }),
  glossaryEntry({
    id: 'equator', term: 'equator', domain: 'geography', guide: 'ee-KWAY-tuh',
    definition: 'An imaginary line around Earth, halfway between the North and South Poles.',
    visual: 'A line circling the widest part of a globe.',
    example: 'The United Kingdom and The Gambia are both north of the equator, but at different distances from it.', related: ['earth', 'hemisphere', 'climate-zone'],
    deeper: 'Distance from the equator can help reveal broad climate patterns, but altitude, oceans, winds and landforms also influence climate.',
  }),
  glossaryEntry({
    id: 'hemisphere', term: 'hemisphere', domain: 'geography', guide: 'HEM-ih-sfeer',
    definition: 'One half of Earth.',
    visual: 'A globe divided into northern and southern halves by the equator.',
    example: 'A place north of the equator is in the Northern Hemisphere.', related: ['earth', 'equator'],
  }),
  glossaryEntry({
    id: 'climate', term: 'climate', domain: 'geography', guide: 'KLY-mit',
    definition: 'The usual pattern of weather in a place over a long time.',
    visual: 'Several years of temperature, rain and season symbols grouped together.',
    example: 'A place’s climate cannot be decided from today’s weather.', related: ['climate-zone', 'temperature', 'biome'],
    deeper: 'Climate describes long-term patterns and variation, not a promise about the weather on a particular day.',
  }),
  glossaryEntry({
    id: 'climate-zone', term: 'climate zone', domain: 'geography', guide: 'KLY-mit zohn',
    definition: 'A broad area with some similar long-term climate patterns.',
    visual: 'Patterned, overlapping bands on a world map with a note that boundaries are broad.',
    example: 'Climate zones help us compare broad patterns, not label every place as identical.', related: ['climate', 'equator', 'biome'],
  }),
  glossaryEntry({
    id: 'biome', term: 'biome', domain: 'geography', guide: 'BY-ohm',
    definition: 'A very large ecological area linked to climate and typical plants and animals.',
    visual: 'A broad landscape band containing several different local habitats.',
    example: 'One biome can contain forests, rivers, soils and many smaller habitats.', related: ['climate-zone', 'habitat', 'living-things'],
  }),
  glossaryEntry({
    id: 'habitat', term: 'habitat', domain: 'geography', guide: 'HAB-ih-tat',
    definition: 'The place and conditions in which a living thing lives.',
    visual: 'An organism connected to water, food, shelter and space in one place.',
    example: 'A river habitat provides particular conditions for the living things within it.', related: ['biome', 'living-things', 'environmental-change'],
  }),
  glossaryEntry({
    id: 'coastline', term: 'coastline', domain: 'geography', guide: 'KOHST-line',
    definition: 'The line or area where land meets the sea or ocean.',
    visual: 'Land and ocean meeting along an irregular edge.',
    example: 'The Gambia has a short Atlantic coastline on the western side of Africa.', related: ['ocean', 'map', 'the-gambia'],
  }),
  glossaryEntry({
    id: 'border', term: 'border', domain: 'geography', guide: 'BOR-duh',
    definition: 'A boundary between countries or other areas.',
    visual: 'Two neighbouring areas separated by a line, with a river crossing the line.',
    example: 'The Gambia shares its land border with Senegal.', related: ['country', 'the-gambia', 'senegal'],
    deeper: 'Borders are human geographical features. They may follow physical features in some places but do not have to.',
  }),
  glossaryEntry({
    id: 'map-scale', term: 'scale', domain: 'geography', guide: 'SKAYL',
    definition: 'The relationship between distance on a map and distance in the real world.',
    visual: 'The same route beside a scale bar in a world view and a closer view.',
    example: 'Changing map scale lets us see a coastline in more detail without making the real country larger.', related: ['maps-and-globes', 'measurement', 'place'],
  }),
  glossaryEntry({
    id: 'compass', term: 'compass', domain: 'geography', guide: 'KUM-pus',
    definition: 'A tool or map symbol that shows direction.',
    visual: 'A simple compass rose with north, south, east and west.',
    example: 'Use the compass to describe The Gambia as west of Mali.', related: ['north', 'south', 'east', 'west'],
  }),
  glossaryEntry({
    id: 'north', term: 'north', domain: 'geography', guide: 'NORTH',
    definition: 'The direction towards Earth’s North Pole.',
    visual: 'An upward-pointing compass arrow labelled N, while noting maps can rotate.',
    example: 'On a north-up map, Europe is north of Africa.', related: ['compass', 'south', 'east', 'west'],
  }),
  glossaryEntry({
    id: 'south', term: 'south', domain: 'geography', guide: 'SOWTH',
    definition: 'The direction towards Earth’s South Pole.',
    visual: 'A downward-pointing compass arrow labelled S, while noting maps can rotate.',
    example: 'The South Atlantic lies south of the equator.', related: ['compass', 'north', 'east', 'west'],
  }),
  glossaryEntry({
    id: 'east', term: 'east', domain: 'geography', guide: 'EEST',
    definition: 'The direction to your right when facing north.',
    visual: 'A right-pointing compass arrow labelled E.',
    example: 'The River Gambia flows broadly westwards towards the Atlantic, from land further east.', related: ['compass', 'north', 'south', 'west'],
  }),
  glossaryEntry({
    id: 'west', term: 'west', domain: 'geography', guide: 'WEST',
    definition: 'The direction to your left when facing north.',
    visual: 'A left-pointing compass arrow labelled W.',
    example: 'The Atlantic coast of The Gambia is on its western side.', related: ['compass', 'north', 'south', 'east'],
  }),
  glossaryEntry({
    id: 'africa', term: 'Africa', domain: 'geography', guide: 'AF-rih-kuh',
    definition: 'A continent containing many countries, regions, peoples, climates and landscapes.',
    visual: 'Africa highlighted on a globe with country borders visible but not dominant.',
    example: 'The Gambia is one of the countries in Africa.', related: ['continent', 'west-africa', 'the-gambia'],
  }),
  glossaryEntry({
    id: 'west-africa', term: 'West Africa', domain: 'geography', guide: 'WEST AF-rih-kuh',
    definition: 'A geographical region in the western part of Africa.',
    visual: 'West Africa gently highlighted while the complete continent remains visible.',
    example: 'The Gambia and Senegal are countries in West Africa.', related: ['africa', 'region', 'the-gambia', 'senegal'],
  }),
  glossaryEntry({
    id: 'the-gambia', term: 'The Gambia', domain: 'geography', guide: 'thuh GAM-bee-uh',
    definition: 'A country in West Africa, shaped closely around the River Gambia.',
    visual: 'The country highlighted with Senegal, its Atlantic coast and the River Gambia retained for context.',
    example: 'The Gambia reaches the Atlantic Ocean and is otherwise surrounded by Senegal.', related: ['west-africa', 'senegal', 'river-gambia'],
  }),
  glossaryEntry({
    id: 'senegal', term: 'Senegal', domain: 'geography', guide: 'SEN-ih-gawl',
    definition: 'A country in West Africa that neighbours and surrounds The Gambia’s land borders.',
    visual: 'Senegal and The Gambia shown together without losing the West African coastline.',
    example: 'To understand The Gambia’s shape, it helps to keep Senegal visible.', related: ['the-gambia', 'west-africa', 'border'],
  }),
  glossaryEntry({
    id: 'river-gambia', term: 'River Gambia', domain: 'geography', guide: 'RIV-uh GAM-bee-uh',
    definition: 'A major West African river that flows through The Gambia to the Atlantic Ocean.',
    visual: 'A river line followed from inland through The Gambia to its Atlantic mouth.',
    example: 'The country extends along both sides of much of the River Gambia.', related: ['the-gambia', 'coastline', 'habitat'],
  }),
];

const mathematicsEntry = ({ id, term, guide, definition, visual, example, related, deeper = null }) => glossaryEntry({
  id,
  term,
  domain: 'mathematics',
  guide,
  definition,
  visual,
  example,
  related,
  deeper,
  activeInBuild1: true,
  activationBuild: 2,
});

const mathematicsEntries = [
  mathematicsEntry({ id: 'digit', term: 'digit', guide: 'DIJ-it', definition: 'One of the symbols 0 to 9 used to write numbers.', visual: 'The digit 5 shown in different place-value columns with a different value each time.', example: 'In 5,203, the digit 5 has a value of five thousand.', related: ['place-value', 'value'] }),
  mathematicsEntry({ id: 'value', term: 'value', guide: 'VAL-yoo', definition: 'How much a number, digit or expression represents.', visual: 'A digit, counters and an expanded part joined because they have the same value.', example: 'Ten hundreds and one thousand have the same value.', related: ['digit', 'place-value', 'equivalence'] }),
  mathematicsEntry({ id: 'place-value', term: 'place value', guide: 'PLAYS VAL-yoo', definition: 'The value of a digit because of its position in a number.', visual: 'Thousands, hundreds, tens and ones columns aligned from left to right.', example: 'The zero in 4,052 keeps the hundreds place visible.', related: ['digit', 'value', 'partition'] }),
  mathematicsEntry({ id: 'thousand', term: 'thousand', guide: 'THOW-zund', definition: 'A quantity equal to ten hundreds or 1,000 ones.', visual: 'Ten hundred flats grouped into one thousand crate.', example: 'Ten hundreds can be exchanged for one thousand without changing the value.', related: ['place-value', 'exchange', 'equivalence'] }),
  mathematicsEntry({ id: 'partition', term: 'partition', guide: 'par-TISH-un', definition: 'To split a number into parts whose values still make the whole.', visual: '4,362 connected to 4,000 + 300 + 60 + 2 and to a different equivalent partition.', example: '4,362 can be partitioned as 3,000 + 1,300 + 50 + 12.', related: ['place-value', 'equivalence', 'sum'] }),
  mathematicsEntry({ id: 'exchange', term: 'exchange', guide: 'eks-CHAYNJ', definition: 'To regroup an amount into an equivalent number of smaller or larger place-value units.', visual: 'Ten tens replaced by one hundred while the total remains unchanged.', example: 'In subtraction, one hundred can be exchanged for ten tens.', related: ['place-value', 'equivalence', 'partition'], deeper: 'Exchange changes the representation, not the value.' }),
  mathematicsEntry({ id: 'equivalence', term: 'equivalent', guide: 'ee-KWIV-uh-lunt', definition: 'Having the same value even when written or represented differently.', visual: 'Two different place-value models balanced at the same height.', example: '43 hundreds + 6 tens + 2 ones is equivalent to 4,362.', related: ['value', 'exchange', 'partition'] }),
  mathematicsEntry({ id: 'magnitude', term: 'magnitude', guide: 'MAG-nih-tyood', definition: 'The size of a number or quantity.', visual: 'Two numbers positioned on one accurately scaled line.', example: 'Compare thousands first because that place may decide the greater magnitude.', related: ['comparison', 'number-line', 'place-value'] }),
  mathematicsEntry({ id: 'comparison', term: 'compare', guide: 'kum-PAIR', definition: 'To examine values to decide whether one is greater, less or equal.', visual: 'Two place-value charts beside the symbols less than, greater than and equal to.', example: 'Both numbers have 6 thousands, so the hundreds column decides the comparison.', related: ['magnitude', 'place-value', 'difference'] }),
  mathematicsEntry({ id: 'number-line', term: 'number line', guide: 'NUM-buh LINE', definition: 'A line on which positions represent numbers using a consistent scale.', visual: 'A labelled interval with a midpoint and one estimated point.', example: 'A point halfway from 4,000 to 5,000 represents 4,500.', related: ['interval', 'magnitude', 'estimate'] }),
  mathematicsEntry({ id: 'interval', term: 'interval', guide: 'IN-tuh-vul', definition: 'The numerical distance between two values or marks.', visual: 'Two neighbouring ticks joined and labelled with their difference.', example: 'If each interval is 100, five intervals represent 500.', related: ['number-line', 'difference', 'scale-mathematics'] }),
  mathematicsEntry({ id: 'estimate', term: 'estimate', guide: 'ES-tih-mayt', definition: 'A sensible approximate value based on mathematical evidence.', visual: 'An exact position and a nearby rounded position compared on a line.', example: 'Rounding both addends gives an estimate near 6,000.', related: ['rounding', 'magnitude', 'reasonableness'] }),
  mathematicsEntry({ id: 'rounding', term: 'round', guide: 'ROWND', definition: 'To replace a value with the nearest chosen multiple.', visual: 'A number placed between a lower multiple, midpoint and upper multiple.', example: '4,349 rounds to 4,300 to the nearest hundred because it is before the midpoint.', related: ['estimate', 'number-line', 'nearest'] }),
  mathematicsEntry({ id: 'nearest', term: 'nearest', guide: 'NEER-ist', definition: 'Having the smallest numerical distance from a value.', visual: 'Two distances from one point compared with labelled spans.', example: 'At the midpoint, the nearest ten is the higher multiple by convention.', related: ['rounding', 'difference', 'number-line'] }),
  mathematicsEntry({ id: 'negative-numbers', term: 'negative number', guide: 'NEG-uh-tiv NUM-buh', definition: 'A number less than zero.', visual: 'A vertical line crossing zero with values above and below.', example: '−4 is less than −1, even though 4 is the larger digit.', related: ['temperature', 'number-line', 'difference'] }),
  mathematicsEntry({ id: 'roman-numeral', term: 'Roman numeral', guide: 'ROH-mun NYOO-muh-rul', definition: 'A number representation built from symbols such as I, V, X, L and C.', visual: 'The value 49 connected to the canonical form XLIX.', example: 'XL means 40 because X placed before L subtracts ten.', related: ['representation', 'value'] }),
  mathematicsEntry({ id: 'sum', term: 'sum', guide: 'SUM', definition: 'The result of adding two or more values.', visual: 'Two addends combining into one aligned total.', example: 'The sum of 3,482 and 2,156 is 5,638.', related: ['total', 'addition', 'inverse'] }),
  mathematicsEntry({ id: 'total', term: 'total', guide: 'TOH-tul', definition: 'The complete amount after quantities have been combined.', visual: 'Several parts connected to one whole bar.', example: 'Four-digit addends can produce a five-digit total.', related: ['sum', 'addition', 'part-whole'] }),
  mathematicsEntry({ id: 'difference', term: 'difference', guide: 'DIF-ruhns', definition: 'The numerical distance between two values.', visual: 'Two positions joined on a line with the gap highlighted.', example: 'Counting on can efficiently find the difference between 4,998 and 5,002.', related: ['subtraction', 'interval', 'comparison'] }),
  mathematicsEntry({ id: 'inverse', term: 'inverse', guide: 'IN-vurs', definition: 'An operation that reverses the effect of another operation.', visual: 'An addition equation connected to its two related subtraction equations.', example: 'Subtraction can check an addition because the operations are inverse.', related: ['addition', 'subtraction', 'equation-family'] }),
  mathematicsEntry({ id: 'efficient', term: 'efficient', guide: 'ih-FISH-unt', definition: 'Reaching a correct result with a method well suited to the numbers.', visual: 'A short counting-on route beside a longer column calculation.', example: 'Counting on is efficient for 5,002 − 4,998.', related: ['strategy', 'difference', 'reasonableness'] }),
  mathematicsEntry({ id: 'strategy', term: 'strategy', guide: 'STRAT-uh-jee', definition: 'A chosen mathematical method or plan.', visual: 'Mental, number-line and column methods pointing to one calculation.', example: 'Inspect the numbers before choosing a subtraction strategy.', related: ['efficient', 'operation-plan', 'reasonableness'] }),
  mathematicsEntry({ id: 'counterexample', term: 'counterexample', guide: 'KOWN-tuh-rig-ZAM-pul', definition: 'An example that proves a general statement is not always true.', visual: 'One test case breaking an “always” statement.', example: 'A single counterexample is enough to disprove an always statement.', related: ['proof', 'evidence', 'statement'] }),
  mathematicsEntry({ id: 'proof', term: 'proof', guide: 'PROOF', definition: 'A complete mathematical reason showing why a statement must be true.', visual: 'A general structure linked to every allowed case, not only one example.', example: 'Several examples may support an idea, but a proof explains why it always works.', related: ['evidence', 'counterexample', 'statement'] }),
];

const scienceEntry = ([id, term, guide, definition, visual, example, related]) => glossaryEntry({
  id: `science-${id}`,
  term,
  domain: 'science',
  guide,
  definition,
  visual,
  example,
  related,
  activeInBuild1: false,
  active: true,
  activationBuild: 3,
});

const scienceEntries = [
  ['living-thing', 'living thing', 'LIV-ing THING', 'An organism that carries out life processes.', 'An animal, a plant and a magnified moss shoot beside one another.', 'Plants and animals are living things.', ['organism', 'habitat']],
  ['organism', 'organism', 'OR-guh-niz-um', 'An individual living thing.', 'One specimen card selected from a larger group.', 'A robin is one organism in the bird group.', ['living-things', 'classification']],
  ['observe', 'observe', 'ub-ZURV', 'To look or use another sense carefully to gather information.', 'An eye and magnifying lens directed at visible legs.', 'Observe the number of legs before naming the group.', ['observation', 'evidence']],
  ['observation', 'observation', 'ob-zur-VAY-shun', 'Information noticed directly using senses or measuring tools.', 'A statement card reading “It has six legs.”', '“It has six legs” is an observation.', ['observe', 'inference']],
  ['evidence', 'evidence', 'EV-ih-duns', 'Information used to support, challenge or refine an idea.', 'A visible feature connected to a scientific claim.', 'Feathers are evidence that the animal is a bird.', ['observation', 'prediction']],
  ['inference', 'inference', 'IN-fuh-runs', 'An idea reached by reasoning from observations and knowledge.', 'An observation arrow leading to a possible explanation.', '“It may use its wings to move between plants” is an inference.', ['observation', 'evidence']],
  ['characteristic', 'characteristic', 'kar-ik-tuh-RIS-tik', 'A feature or quality used to describe and compare an organism.', 'Several organisms with one shared feature highlighted.', 'Feathers are a characteristic of birds.', ['feature', 'classification']],
  ['feature', 'feature', 'FEE-chuh', 'A part or characteristic that can be noticed or known.', 'A shell, wing, leg and leaf shown as evidence icons.', 'A visible shell can be a useful feature in a key.', ['characteristic', 'observe']],
  ['group', 'group', 'GROOP', 'A set of things placed together because they follow a stated rule.', 'Three trays with a clear rule label above each.', 'One group may contain organisms with visible wings.', ['classify', 'rule']],
  ['classify', 'classify', 'KLAS-ih-fy', 'To arrange living things into groups using agreed characteristics.', 'A mixed drawer connected to labelled groups.', 'Scientists classify animals using more than habitat alone.', ['classification', 'group']],
  ['classification', 'classification', 'klas-ih-fih-KAY-shun', 'The process or system of grouping living things using characteristics.', 'Groups nested inside a larger living-things cabinet.', 'Vertebrate and invertebrate are broad classification groups.', ['classify', 'classification-key']],
  ['classification-key', 'classification key', 'klas-ih-fih-KAY-shun KEE', 'A series of questions that narrows possibilities to identify an organism.', 'A question splitting into two labelled branches.', 'A useful key question sends organisms down two clear routes.', ['branching-key', 'question']],
  ['branching-key', 'branching key', 'BRAN-ching KEE', 'A classification key whose two answers lead to later questions or a result.', 'A root question with yes and no branches ending in organisms.', 'Follow one branch at a time and keep the route visible.', ['classification-key', 'branch']],
  ['question', 'question', 'KWES-chun', 'A sentence used to ask for information; in a key it needs two clear outcomes.', 'A question card above yes and no trays.', '“Does it have feathers?” is a clear binary question.', ['branch', 'outcome']],
  ['branch', 'branch', 'BRANCH', 'One route from a question to another question or result.', 'One dark line leading from “yes” to a smaller group.', 'The yes branch contains every organism with feathers.', ['classification-key', 'outcome']],
  ['outcome', 'outcome', 'OWT-kum', 'The result reached after following a question or sequence.', 'A route ending at one named organism.', 'A complete key ends with one organism at each outcome.', ['branch', 'identify']],
  ['identify', 'identify', 'eye-DEN-tih-fy', 'To determine what an organism is using evidence.', 'A mystery silhouette revealed after a completed route.', 'The key helped identify the garden snail.', ['evidence', 'classification-key']],
  ['vertebrate', 'vertebrate', 'VUR-tih-brayt', 'An animal with an internal backbone.', 'A restrained internal backbone shown inside a familiar body outline.', 'Mammals, birds, fish, reptiles and amphibians are vertebrates.', ['backbone', 'invertebrate']],
  ['invertebrate', 'invertebrate', 'in-VUR-tih-brayt', 'An animal without a backbone.', 'A bee, spider, snail, worm and crab beside one another.', 'Invertebrates include many very different body forms.', ['vertebrate', 'backbone']],
  ['backbone', 'backbone', 'BAK-bohn', 'The linked internal bones forming the main support along a vertebrate’s back.', 'An internal line of vertebrae contrasted with an external shell.', 'A backbone is internal and may not be visible in a photograph.', ['vertebrate', 'skeleton']],
  ['mammal', 'mammal', 'MAM-ul', 'A vertebrate with hair or fur at some life stage whose young are fed milk.', 'A bat, dolphin and fox linked by group characteristics.', 'A dolphin is a mammal even though it lives in water.', ['vertebrate', 'hair']],
  ['bird', 'bird', 'BURD', 'A feathered vertebrate with a beak; birds lay eggs.', 'A robin, penguin and ostrich beside a feather symbol.', 'Not every bird flies, but every bird has feathers.', ['vertebrate', 'feathers']],
  ['fish', 'fish', 'FISH', 'A water-living vertebrate that uses gills and generally has fins.', 'Several different fish shapes beside gills and fins.', 'A dolphin lives in water but is not a fish.', ['vertebrate', 'gills']],
  ['reptile', 'reptile', 'REP-tile', 'An air-breathing vertebrate with dry scales.', 'A snake, turtle and crocodile beside a scale texture.', 'Reptiles live in varied places, not only hot deserts.', ['vertebrate', 'scales']],
  ['amphibian', 'amphibian', 'am-FIB-ee-un', 'A vertebrate group whose lives are linked to water and land in varied ways; familiar examples have moist skin.', 'A frog and newt beside land and water edges.', 'A newt is an amphibian that keeps its tail as an adult.', ['vertebrate', 'moist-skin']],
  ['insect', 'insect', 'IN-sekt', 'An invertebrate with six legs and three main body sections in the adult stage.', 'Six legs counted around three linked body sections.', 'A bee is an insect; a spider is not.', ['invertebrate', 'arachnid']],
  ['arachnid', 'arachnid', 'uh-RAK-nid', 'An invertebrate group whose familiar adult members have eight legs.', 'A spider, scorpion, harvestman and tick with eight legs marked.', 'Spiders and ticks are arachnids, not insects.', ['invertebrate', 'insect']],
  ['mollusc', 'mollusc', 'MOL-usk', 'A varied group of soft-bodied invertebrates; some have shells.', 'A snail, mussel, slug and octopus together.', 'A slug and an octopus are molluscs without visible external shells.', ['invertebrate', 'shell']],
  ['annelid', 'annelid', 'AN-uh-lid', 'A group of segmented worms.', 'An earthworm with repeated ring-like segments.', 'Earthworms and leeches are annelids.', ['invertebrate', 'segment']],
  ['crustacean', 'crustacean', 'krus-TAY-shun', 'A varied arthropod group usually with a hard exoskeleton and several pairs of limbs.', 'A crab, prawn and land-living woodlouse together.', 'A woodlouse is a land-living crustacean.', ['invertebrate', 'exoskeleton']],
  ['myriapod', 'myriapod', 'MIR-ee-uh-pod', 'An invertebrate with many body segments and many legs.', 'A centipede and millipede with different leg patterns.', 'Centipedes and millipedes are different myriapod groups.', ['invertebrate', 'segment']],
  ['habitat', 'habitat', 'HAB-ih-tat', 'The place and conditions in which an organism lives.', 'One window containing food, water, shelter, space and conditions.', 'A woodland contains many habitats and microhabitats.', ['microhabitat', 'resource']],
  ['microhabitat', 'microhabitat', 'MY-kroh HAB-ih-tat', 'A small habitat with particular local conditions.', 'A woodland view magnified to the damp space beneath a log.', 'Beneath a log can be a cool, damp microhabitat.', ['habitat', 'condition']],
  ['resource', 'resource', 'REE-sors', 'Something an organism can use, such as food, water, shelter or space.', 'Food, water and shelter symbols connected to one habitat.', 'A flowering plant may provide food for an insect.', ['habitat', 'shelter']],
  ['shelter', 'shelter', 'SHEL-tuh', 'A place or structure that offers protection.', 'A tree hole, leaf layer and stone crack.', 'A crack in a wall may provide shelter.', ['resource', 'habitat']],
  ['condition', 'condition', 'kun-DISH-un', 'A feature of an environment such as temperature, light or moisture.', 'Three measured strips for light, moisture and temperature.', 'Shade changes light and may change soil moisture.', ['environment', 'measurement']],
  ['environment', 'environment', 'en-VY-run-ment', 'The surroundings and conditions in which living things exist.', 'Organisms connected to air, water, ground and other living things.', 'An environment includes conditions and relationships, not only scenery.', ['habitat', 'environmental-change']],
  ['environmental-change', 'environmental change', 'en-VY-run-MEN-tul CHAYNJ', 'A change to conditions or resources in an environment.', 'A before-and-after habitat with one condition altered.', 'Environmental change can happen naturally or through human activity.', ['environment', 'effect']],
  ['danger', 'danger', 'DAYN-juh', 'Something that may cause harm.', 'A caution marker linked to evidence rather than a dramatic image.', 'Reduced shelter could create a danger for some organisms.', ['effect', 'prediction']],
  ['effect', 'effect', 'ih-FEKT', 'A change that happens because of another change or influence.', 'A condition arrow leading to a possible organism response.', 'Less water may have a different effect on a frog and a fox.', ['environmental-change', 'prediction']],
  ['prediction', 'prediction', 'prih-DIK-shun', 'A statement about what may happen based on evidence and knowledge.', 'Observed and known cards leading to a “may” statement.', 'The evidence suggests the soil may become drier.', ['evidence', 'uncertain']],
  ['uncertain', 'uncertain', 'un-SUR-tun', 'Not known well enough to make a definite claim.', 'A question mark beside missing information.', 'We are uncertain because we do not know how long the change lasts.', ['prediction', 'evidence']],
  ['survey', 'survey', 'SUR-vay', 'A planned way to collect observations or counts.', 'A repeated route with tally marks and a broad location label.', 'A playground survey can record organisms without precise location data.', ['tally', 'observation']],
  ['tally', 'tally', 'TAL-ee', 'A counting mark system usually grouped in fives.', 'Four upright marks crossed by a fifth.', 'The tally converts to a total count.', ['survey', 'count']],
  ['specimen', 'specimen', 'SPES-ih-men', 'An organism or example studied closely; in this app it is a digital record, not a collected living thing.', 'A labelled observation tray with a diagram and source card.', 'Open a specimen drawer to inspect one organism record.', ['organism', 'observe']],
].map(scienceEntry);

const artEntries = [
  glossaryEntry({ id: 'artist', term: 'artist', domain: 'art', guide: 'AR-tist', definition: 'A person who develops and communicates ideas through creative choices.', visual: 'A hand, eye, materials and idea connected around a work in progress.', example: 'An artist experiments, notices effects and decides what serves the idea.', related: ['artist-influence', 'artist-statement'] }),
  glossaryEntry({ id: 'artwork', term: 'artwork', domain: 'art', guide: 'ART-wurk', definition: 'A work created through artistic ideas, materials and choices.', visual: 'A physical work beside notes showing choices and influences.', example: 'The final artwork combines a natural force with signs of human impact.', related: ['artist', 'media', 'composition'] }),
  glossaryEntry({ id: 'media', term: 'media', domain: 'art', guide: 'MEE-dee-uh', definition: 'The materials and methods used to make art.', visual: 'Charcoal, paint, pastel and paper samples arranged as a material set.', example: 'Choosing rough charcoal instead of smooth paint changes the effect.', related: ['charcoal', 'pastel', 'collage', 'mixed-media'] }),
  glossaryEntry({ id: 'charcoal', term: 'charcoal', domain: 'art', guide: 'CHAR-kohl', definition: 'A dark drawing material that can make sharp, soft or smudged marks.', visual: 'One charcoal stick making thin, broad and smudged marks.', example: 'Swirled and smudged charcoal can suggest the force of a storm.', related: ['media', 'movement', 'texture'] }),
  glossaryEntry({ id: 'pastel', term: 'pastel', domain: 'art', guide: 'PAS-tul', definition: 'A coloured drawing stick made from pigment and a binder.', visual: 'Layered pastel marks with one area blended and one left textured.', example: 'Pastel can add intense colour over a painted wash.', related: ['media', 'colour', 'texture'] }),
  glossaryEntry({ id: 'collage', term: 'collage', domain: 'art', guide: 'kuh-LAHZH', definition: 'Artwork made by attaching and arranging pieces of material or images.', visual: 'Overlapping paper and texture pieces forming one composition.', example: 'Fragments of printed packaging can become evidence of human impact in a collage.', related: ['media', 'fragments', 'composition'] }),
  glossaryEntry({ id: 'mixed-media', term: 'mixed media', domain: 'art', guide: 'MIKST MEE-dee-uh', definition: 'Using more than one art material or method in a work.', visual: 'Paint, charcoal, pastel and collage layers labelled in one sample.', example: 'The A3 final work is mixed media because its layers use several materials.', related: ['media', 'collage', 'texture'] }),
  glossaryEntry({ id: 'wash', term: 'wash', domain: 'art', guide: 'WOSH', definition: 'A thin, watery layer of paint or ink.', visual: 'A translucent brush stroke through which the paper can still be seen.', example: 'A pale background wash can establish atmosphere before darker marks are added.', related: ['media', 'colour', 'gradient'] }),
  glossaryEntry({ id: 'texture', term: 'texture', domain: 'art', guide: 'TEKS-chuh', definition: 'How a surface feels, or appears as if it might feel.', visual: 'Rubbings from brick, foil, fence and tarmac shown side by side.', example: 'A fence rubbing leaves a repeated texture that can suggest a human mark.', related: ['media', 'collage', 'human-impact'] }),
  glossaryEntry({ id: 'contrast', term: 'contrast', domain: 'art', guide: 'KON-trast', definition: 'A noticeable difference between visual elements.', visual: 'A pale soft mark beside a dark hard-edged mark.', example: 'Turner used contrasts of light and dark to intensify weather and movement.', related: ['colour', 'juxtaposition', 'mood'] }),
  glossaryEntry({ id: 'movement', term: 'movement', domain: 'art', guide: 'MOOV-ment', definition: 'The sense or path of motion in an artwork.', visual: 'Curving lines leading the eye around a central force.', example: 'Swirling lines can make the viewer’s eye move like wind or water.', related: ['line', 'rhythm', 'natural-power'] }),
  glossaryEntry({ id: 'composition', term: 'composition', domain: 'art', guide: 'kom-puh-ZISH-un', definition: 'The way parts of an artwork are arranged.', visual: 'Three thumbnails using diagonal, divided and overlapping arrangements.', example: 'A diagonal composition can make two forces seem to collide.', related: ['juxtaposition', 'scale-art', 'artist-influence'] }),
  glossaryEntry({ id: 'juxtaposition', term: 'juxtaposition', domain: 'art', guide: 'juk-stuh-puh-ZISH-un', definition: 'Placing contrasting things together so their relationship becomes striking.', visual: 'A natural field placed directly beside a dense human-built environment.', example: 'Agnes Denes used juxtaposition to make land use and human choices visible.', related: ['contrast', 'composition', 'agnes-denes'] }),
  glossaryEntry({ id: 'scale-art', term: 'scale', domain: 'art', guide: 'SKAYL', definition: 'The size of one element, especially in relation to another.', visual: 'A huge wave shape towering over a tiny boat shape.', example: 'Hokusai’s change of scale makes the wave feel powerful beside people.', related: ['composition', 'natural-power', 'hokusai'] }),
  glossaryEntry({ id: 'pattern', term: 'pattern', domain: 'art', guide: 'PAT-un', definition: 'Shapes, lines or colours repeated or organised in a recognisable way.', visual: 'Repeated curved marks becoming a wave-like structure.', example: 'Repeated curves can connect foam, claws and smaller waves.', related: ['rhythm', 'line', 'hokusai'] }),
  glossaryEntry({ id: 'rhythm', term: 'rhythm', domain: 'art', guide: 'RITH-um', definition: 'A repeated visual movement that guides the eye.', visual: 'Marks repeating with changing gaps and sizes across a page.', example: 'A rhythm of curved lines can create the feeling of rolling water.', related: ['pattern', 'movement', 'composition'] }),
  glossaryEntry({ id: 'gradient', term: 'gradient', domain: 'art', guide: 'GRAY-dee-unt', definition: 'A gradual change from one colour or tone to another.', visual: 'Blue changing step by step to white, and orange changing to dark brown.', example: 'A blue-to-white gradient may communicate calm or fragility.', related: ['colour', 'mood', 'wash'] }),
  glossaryEntry({ id: 'mood', term: 'mood', domain: 'art', guide: 'MOOD', definition: 'The feeling or atmosphere created by an artwork.', visual: 'The same shape shown with two contrasting colour and texture choices.', example: 'Colour, light and texture work together to create mood.', related: ['colour', 'gradient', 'contrast'] }),
  glossaryEntry({ id: 'artist-influence', term: 'influence', domain: 'art', guide: 'IN-floo-uns', definition: 'An idea or approach from another artist that helps develop your own choices.', visual: 'An observed curved line transformed into a different pupil composition.', example: 'An influence should remain visible without copying the original artwork.', related: ['artist', 'artist-statement', 'composition'] }),
  glossaryEntry({ id: 'artist-statement', term: 'artist statement', domain: 'art', guide: 'AR-tist STAYT-ment', definition: 'A short explanation of what inspired an artwork, what it shows and its message.', visual: 'Three linked prompts: inspired by, shows, message.', example: 'My work is inspired by ____. It shows ____. My message is ____.', related: ['artist', 'artist-influence', 'artwork'] }),
];

export const GLOSSARY = Object.freeze([...geographyEntries, ...mathematicsEntries, ...scienceEntries, ...artEntries]);

export const REQUIRED_ATLAS_TERMS = Object.freeze([
  'Earth', 'planet', 'globe', 'map', 'atlas', 'continent', 'country', 'region', 'ocean',
  'equator', 'hemisphere', 'climate', 'climate zone', 'biome', 'habitat', 'coastline',
  'border', 'scale', 'compass', 'north', 'south', 'east', 'west',
]);

export const REQUIRED_ART_TERMS = Object.freeze([
  'artist', 'artwork', 'media', 'charcoal', 'pastel', 'collage', 'mixed media', 'wash',
  'texture', 'contrast', 'movement', 'composition', 'juxtaposition', 'scale', 'pattern',
  'rhythm', 'gradient', 'mood', 'influence', 'artist statement',
]);

export const REQUIRED_MATHEMATICS_TERMS = Object.freeze([
  'digit', 'value', 'place value', 'thousand', 'partition', 'exchange', 'equivalent',
  'magnitude', 'compare', 'number line', 'interval', 'estimate', 'round', 'nearest',
  'negative number', 'Roman numeral', 'sum', 'total', 'difference', 'inverse',
  'efficient', 'strategy', 'counterexample', 'proof',
]);

export const REQUIRED_SCIENCE_TERMS = Object.freeze([
  'living thing', 'organism', 'observe', 'observation', 'evidence', 'inference',
  'characteristic', 'feature', 'group', 'classify', 'classification', 'classification key',
  'branching key', 'question', 'branch', 'outcome', 'identify', 'vertebrate',
  'invertebrate', 'backbone', 'mammal', 'bird', 'fish', 'reptile', 'amphibian',
  'insect', 'arachnid', 'mollusc', 'annelid', 'crustacean', 'myriapod', 'habitat',
  'microhabitat', 'resource', 'shelter', 'condition', 'environment', 'environmental change',
  'danger', 'effect', 'prediction', 'uncertain', 'survey', 'tally', 'specimen',
]);

export function getGlossaryEntryById(id, entries = GLOSSARY) {
  return entries.find((entry) => entry.id === id) ?? null;
}

/** A term may deliberately have more than one domain-specific sense (for example, scale). */
export function getGlossaryEntriesByTerm(term, entries = GLOSSARY) {
  const query = String(term ?? '').trim().toLocaleLowerCase('en-GB');
  return entries.filter((entry) => entry.term.toLocaleLowerCase('en-GB') === query);
}

export function validateGlossary(entries = GLOSSARY) {
  const errors = [];
  const ids = new Set();
  for (const [index, entry] of entries.entries()) {
    const label = entry?.id ?? `entry ${index}`;
    if (!entry?.id) errors.push(`Glossary entry ${label} needs an ID.`);
    if (ids.has(entry?.id)) errors.push(`Duplicate glossary ID: ${entry.id}.`);
    ids.add(entry?.id);
    for (const field of ['term', 'domain', 'spokenPronunciation', 'definition', 'visualExample', 'contextualExample', 'relatedConceptIds']) {
      if (entry?.[field] == null) errors.push(`Glossary entry ${label} is missing ${field}.`);
    }
    if (!Array.isArray(entry?.relatedConceptIds)) errors.push(`Glossary entry ${label} needs related concept IDs.`);
  }
  return { valid: errors.length === 0, errors };
}

export default GLOSSARY;
