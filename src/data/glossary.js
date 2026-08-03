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
  activationBuild = domain === 'art' ? 10 : 1,
}) => Object.freeze({
  id,
  term,
  domain,
  active: activeInBuild1,
  future: !activeInBuild1,
  available: activeInBuild1,
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

export const GLOSSARY = Object.freeze([...geographyEntries, ...artEntries]);

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
