/**
 * Shared, child-readable concept graph.
 *
 * IDs are semantic (never curriculum codes). Edges are deliberately small and
 * explainable so future destinations can reveal meaningful cross-curricular
 * connections without exposing implementation detail.
 */

const node = (id, label, domain, description) => ({ id, label, domain, description });
const edge = (from, to, relation) => ({ from, to, relation });

export const CONCEPT_NODES = Object.freeze([
  node('earth', 'Earth', 'geography', 'The planet we live on.'),
  node('maps-and-globes', 'Maps and globes', 'geography', 'Different representations used to investigate Earth.'),
  node('map-scale', 'Map scale', 'geography', 'The relationship between a map distance and a real distance.'),
  node('africa', 'Africa', 'geography', 'A continent made up of many countries, places, climates and communities.'),
  node('west-africa', 'West Africa', 'geography', 'A geographical region in the western part of Africa.'),
  node('the-gambia', 'The Gambia', 'geography', 'A country in West Africa.'),
  node('senegal', 'Senegal', 'geography', 'The country surrounding The Gambia except at its Atlantic coast.'),
  node('river-gambia', 'River Gambia', 'geography', 'A major river flowing through The Gambia to the Atlantic Ocean.'),
  node('united-kingdom', 'United Kingdom', 'geography', 'A country in north-west Europe.'),
  node('equator', 'Equator', 'geography', 'An imaginary line around Earth midway between the poles.'),
  node('climate', 'Climate', 'geography', 'Long-term patterns of weather in a place.'),
  node('climate-zone', 'Climate zone', 'geography', 'A broad area with some shared long-term climate patterns.'),
  node('biome', 'Biome', 'geography-science', 'A large ecological area linked to climate, plants and animals.'),
  node('habitat', 'Habitat', 'science', 'The place and conditions in which an organism lives.'),
  node('living-things', 'Living things', 'science', 'Organisms including animals, plants and other forms of life.'),
  node('classification', 'Classification', 'science', 'Grouping living things using observable features.'),
  node('scientific-observation', 'Scientific observation', 'science', 'Information gathered directly by looking, listening or measuring.'),
  node('inference', 'Inference', 'science', 'An idea reasoned from observations and relevant knowledge.'),
  node('observable-feature', 'Observable feature', 'science', 'A characteristic another observer can check.'),
  node('vertebrate', 'Vertebrate', 'science', 'An animal with an internal backbone.'),
  node('invertebrate', 'Invertebrate', 'science', 'An animal without a backbone.'),
  node('backbone', 'Backbone', 'science', 'The linked internal bones supporting a vertebrate.'),
  node('classification-key', 'Classification key', 'science', 'A sequence of binary questions used to narrow and identify organisms.'),
  node('microhabitat', 'Microhabitat', 'science', 'A small habitat with particular local conditions.'),
  node('habitat-resource', 'Habitat resource', 'science', 'Food, water, shelter, space or another thing an organism may use.'),
  node('scientific-prediction', 'Scientific prediction', 'science', 'A possible result stated from evidence and relevant knowledge.'),
  node('survey', 'Survey', 'science-mathematics', 'A planned way to collect observations or counts.'),
  node('environmental-change', 'Environmental change', 'science-geography', 'A change to conditions in an environment.'),
  node('global-warming', 'Global warming', 'geography-science', 'The long-term rise in Earth’s average surface temperature.'),
  node('temperature', 'Temperature', 'science-mathematics', 'A measure of how hot or cold something is.'),
  node('negative-numbers', 'Negative numbers', 'mathematics', 'Numbers below zero.'),
  node('measurement', 'Measurement', 'mathematics', 'Using agreed units to describe quantity.'),
  node('place-value', 'Place value', 'mathematics', 'The value of a digit because of its position in a number.'),
  node('equivalence', 'Equivalence', 'mathematics', 'Different representations with exactly the same value.'),
  node('partition', 'Partition', 'mathematics', 'Splitting a number into parts that still compose the whole.'),
  node('exchange', 'Exchange', 'mathematics', 'Regrouping place-value units without changing the total value.'),
  node('magnitude', 'Magnitude', 'mathematics', 'The size of a number or quantity.'),
  node('number-line', 'Number line', 'mathematics', 'A spatial representation whose positions follow a consistent numerical scale.'),
  node('rounding', 'Rounding', 'mathematics', 'Replacing a value with the nearest chosen multiple.'),
  node('estimation', 'Estimation', 'mathematics', 'Finding a useful approximate value from mathematical evidence.'),
  node('roman-numerals', 'Roman numerals', 'mathematics-history', 'A number system using symbols including I, V, X, L and C.'),
  node('addition', 'Addition', 'mathematics', 'Combining quantities or finding a total.'),
  node('subtraction', 'Subtraction', 'mathematics', 'Removing, comparing, finding a missing part or finding a difference.'),
  node('inverse', 'Inverse', 'mathematics', 'An operation that reverses the effect of another operation.'),
  node('efficient-strategy', 'Efficient strategy', 'mathematics', 'A correct method well suited to the structure of the numbers.'),
  node('problem-model', 'Problem model', 'mathematics-shared', 'A representation of known information, an unknown and an operation plan.'),
  node('mathematical-proof', 'Mathematical proof', 'mathematics', 'A complete reason that shows why a statement must be true.'),
  node('counterexample', 'Counterexample', 'mathematics', 'An example that disproves an always statement.'),
  node('evidence', 'Evidence', 'shared', 'Information used to support, challenge or refine an idea.'),
  node('place', 'Place', 'geography', 'A particular part of the world understood through location, features and people.'),
  node('community', 'Community', 'pshe-geography', 'People connected by place, identity, experience or shared interests.'),
  node('isatou-ceesay', 'Isatou Ceesay', 'english-geography', 'A Gambian community activist whose story connects materials, place and collective action.'),
  node('materials', 'Materials', 'science', 'Substances from which objects are made.'),
  node('plastic', 'Plastic', 'science-geography', 'A group of human-made materials with varied uses and afterlives.'),
  node('use', 'Use', 'shared', 'The purpose or way in which something is used.'),
  node('waste', 'Waste', 'shared', 'Material that a person or system discards or no longer intends to use.'),
  node('reuse', 'Reuse', 'shared', 'Using an object or material again, sometimes for a different purpose.'),
  node('community-action', 'Community action', 'pshe-geography', 'People working together in response to a shared concern.'),
  node('environmental-action', 'Environmental action', 'shared', 'An informed action intended to affect an environment.'),
  node('habitat-impact', 'Habitat impact', 'science', 'An effect on the conditions living things need.'),
  node('unintended-consequences', 'Unintended consequences', 'shared', 'Effects that were not part of the original intention.'),
  node('storm', 'Storm', 'geography-art', 'A powerful weather event and a subject artists may interpret.'),
  node('natural-power', 'Natural power', 'art-geography', 'The force, scale or energy of natural processes.'),
  node('turner', 'J. M. W. Turner', 'art', 'An artist studied for light, weather, movement and natural power.'),
  node('movement', 'Movement', 'art', 'The sense or path of motion within an artwork.'),
  node('charcoal', 'Charcoal', 'art', 'A dark drawing material capable of sharp, soft and smudged marks.'),
  node('line', 'Line', 'art', 'A mark whose direction, weight and rhythm can communicate energy.'),
  node('mood', 'Mood', 'art-english', 'A feeling or atmosphere communicated by choices in a work.'),
  node('human-impact', 'Human impact', 'shared', 'Ways human activity affects places, materials and living things.'),
  node('cornelia-parker', 'Cornelia Parker', 'art', 'An artist studied for transformation, fragments and traces of impact.'),
  node('texture', 'Texture', 'art', 'How a surface feels or appears to feel.'),
  node('fragments', 'Fragments', 'art', 'Broken, separated or partial pieces.'),
  node('collage', 'Collage', 'art', 'Artwork made by attaching and arranging materials or images.'),
  node('olafur-eliasson', 'Olafur Eliasson', 'art', 'An artist studied for light, colour, atmosphere and climate response.'),
  node('colour', 'Colour', 'art', 'A visual element that can shape contrast, atmosphere and meaning.'),
  node('gradient', 'Gradient', 'art', 'A gradual change from one colour or tone to another.'),
  node('agnes-denes', 'Agnes Denes', 'art', 'An artist studied for juxtaposing nature and human environments.'),
  node('juxtaposition', 'Juxtaposition', 'art', 'Placing contrasting things together so their relationship becomes noticeable.'),
  node('composition', 'Composition', 'art', 'The arrangement of elements within an artwork.'),
  node('hokusai', 'Katsushika Hokusai', 'art', 'An artist studied for scale, pattern, rhythm and natural power.'),
  node('pattern', 'Pattern', 'art-mathematics', 'Elements repeated or organised in a recognisable way.'),
  node('rhythm', 'Rhythm', 'art-english', 'A repeated visual or sound movement that guides attention.'),
  node('artist-influence', 'Artist influence', 'art', 'A visible idea or approach developed from studying another artist.'),
  node('artist-statement', 'Artist statement', 'art-english', 'A pupil’s explanation of inspiration, subject and message.'),
]);

export const CONCEPT_EDGES = Object.freeze([
  edge('earth', 'maps-and-globes', 'represented-by'),
  edge('maps-and-globes', 'map-scale', 'changes-view-through'),
  edge('maps-and-globes', 'africa', 'helps-locate'),
  edge('africa', 'west-africa', 'contains-region'),
  edge('west-africa', 'the-gambia', 'contains-country'),
  edge('the-gambia', 'senegal', 'shares-border-and-context-with'),
  edge('the-gambia', 'river-gambia', 'is-shaped-by'),
  edge('the-gambia', 'community', 'is-home-to-communities'),
  edge('the-gambia', 'isatou-ceesay', 'connects-to-life-story'),
  edge('west-africa', 'maps-and-globes', 'is-investigated-with'),
  edge('maps-and-globes', 'climate', 'can-show-broad-patterns-of'),
  edge('climate', 'community', 'influences-place-conditions-for'),
  edge('community', 'isatou-ceesay', 'connects-to'),
  edge('isatou-ceesay', 'materials', 'connects-life-story-to'),
  edge('materials', 'environmental-action', 'can-prompt'),
  edge('equator', 'climate-zone', 'helps-investigate-broad-patterns-in'),
  edge('climate', 'climate-zone', 'is-described-broadly-through'),
  edge('climate-zone', 'biome', 'influences'),
  edge('biome', 'habitat', 'contains-many'),
  edge('habitat', 'living-things', 'supports'),
  edge('living-things', 'classification', 'can-be-investigated-through'),
  edge('living-things', 'scientific-observation', 'can-be-investigated-through'),
  edge('scientific-observation', 'observable-feature', 'records'),
  edge('scientific-observation', 'inference', 'can-support'),
  edge('observable-feature', 'classification', 'can-be-used-for'),
  edge('classification', 'vertebrate', 'includes-group'),
  edge('classification', 'invertebrate', 'includes-group'),
  edge('vertebrate', 'backbone', 'has'),
  edge('classification', 'classification-key', 'can-use'),
  edge('habitat', 'microhabitat', 'can-contain'),
  edge('habitat', 'habitat-resource', 'may-provide'),
  edge('environmental-change', 'scientific-prediction', 'can-prompt'),
  edge('scientific-prediction', 'evidence', 'should-use'),
  edge('survey', 'scientific-observation', 'collects'),
  edge('living-things', 'environmental-change', 'can-be-affected-by'),
  edge('environmental-change', 'temperature', 'may-be-measured-through'),
  edge('global-warming', 'environmental-change', 'is-one-form-of'),
  edge('global-warming', 'temperature', 'is-investigated-with-long-term'),
  edge('temperature', 'negative-numbers', 'can-use-values-below-zero'),
  edge('temperature', 'measurement', 'is-a-kind-of'),
  edge('measurement', 'place-value', 'uses'),
  edge('place-value', 'partition', 'can-be-represented-through'),
  edge('partition', 'equivalence', 'preserves'),
  edge('place-value', 'exchange', 'can-be-regrouped-through'),
  edge('exchange', 'equivalence', 'preserves'),
  edge('place-value', 'magnitude', 'helps-compare'),
  edge('magnitude', 'number-line', 'can-be-positioned-on'),
  edge('map-scale', 'number-line', 'shares-consistent-scale-with'),
  edge('number-line', 'rounding', 'reveals-distance-for'),
  edge('rounding', 'estimation', 'can-support'),
  edge('measurement', 'estimation', 'can-use'),
  edge('temperature', 'number-line', 'can-be-positioned-on'),
  edge('negative-numbers', 'number-line', 'can-be-represented-on'),
  edge('place-value', 'addition', 'structures'),
  edge('place-value', 'subtraction', 'structures'),
  edge('addition', 'inverse', 'is-reversed-by'),
  edge('subtraction', 'inverse', 'is-reversed-by'),
  edge('subtraction', 'efficient-strategy', 'requires-choosing'),
  edge('addition', 'problem-model', 'may-be-selected-through'),
  edge('subtraction', 'problem-model', 'may-be-selected-through'),
  edge('evidence', 'mathematical-proof', 'supports'),
  edge('counterexample', 'mathematical-proof', 'can-disprove-a-claim-about'),
  edge('roman-numerals', 'equivalence', 'represent-values-through'),
  edge('plastic', 'materials', 'is-a-kind-of'),
  edge('plastic', 'use', 'is-shaped-for'),
  edge('use', 'waste', 'may-be-followed-by'),
  edge('waste', 'reuse', 'can-be-redirected-through'),
  edge('reuse', 'community-action', 'may-be-organised-as'),
  edge('community-action', 'environmental-action', 'is-a-form-of'),
  edge('plastic', 'habitat-impact', 'may-contribute-to'),
  edge('habitat-impact', 'living-things', 'may-affect'),
  edge('plastic', 'measurement', 'can-be-investigated-with'),
  edge('environmental-action', 'unintended-consequences', 'may-have'),
  edge('place', 'evidence', 'is-understood-through'),
  edge('evidence', 'environmental-action', 'should-inform'),
  edge('storm', 'natural-power', 'can-reveal'),
  edge('storm', 'turner', 'is-interpreted-by'),
  edge('turner', 'movement', 'influences-study-of'),
  edge('movement', 'charcoal', 'can-be-explored-with'),
  edge('charcoal', 'line', 'creates'),
  edge('line', 'mood', 'can-shape'),
  edge('human-impact', 'materials', 'leaves-marks-on'),
  edge('human-impact', 'habitat-impact', 'can-cause'),
  edge('human-impact', 'cornelia-parker', 'is-questioned-through'),
  edge('cornelia-parker', 'texture', 'influences-study-of'),
  edge('texture', 'fragments', 'can-describe'),
  edge('fragments', 'collage', 'can-be-arranged-as'),
  edge('olafur-eliasson', 'colour', 'influences-study-of'),
  edge('colour', 'gradient', 'can-change-through'),
  edge('gradient', 'mood', 'can-communicate'),
  edge('agnes-denes', 'juxtaposition', 'influences-study-of'),
  edge('juxtaposition', 'composition', 'is-created-through'),
  edge('hokusai', 'pattern', 'influences-study-of'),
  edge('pattern', 'rhythm', 'can-create'),
  edge('natural-power', 'hokusai', 'is-interpreted-by'),
  edge('turner', 'artist-influence', 'can-contribute-to'),
  edge('cornelia-parker', 'artist-influence', 'can-contribute-to'),
  edge('olafur-eliasson', 'artist-influence', 'can-contribute-to'),
  edge('agnes-denes', 'artist-influence', 'can-contribute-to'),
  edge('hokusai', 'artist-influence', 'can-contribute-to'),
  edge('artist-influence', 'artist-statement', 'is-explained-in'),
]);

export const CONCEPT_GRAPH = Object.freeze({
  version: 1,
  nodes: CONCEPT_NODES,
  edges: CONCEPT_EDGES,
});

export function getConceptById(id, graph = CONCEPT_GRAPH) {
  return graph.nodes.find((concept) => concept.id === id) ?? null;
}

/** Return immediate connections, optionally respecting edge direction. */
export function getRelatedConcepts(id, { graph = CONCEPT_GRAPH, direction = 'both' } = {}) {
  const related = [];
  for (const connection of graph.edges) {
    if ((direction === 'out' || direction === 'both') && connection.from === id) {
      related.push({ concept: getConceptById(connection.to, graph), relation: connection.relation, direction: 'out' });
    }
    if ((direction === 'in' || direction === 'both') && connection.to === id) {
      related.push({ concept: getConceptById(connection.from, graph), relation: connection.relation, direction: 'in' });
    }
  }
  return related.filter((item) => item.concept);
}

/** Breadth-first path finder for future cross-environment recommendations. */
export function findConceptPath(fromId, toId, { graph = CONCEPT_GRAPH, directed = false } = {}) {
  if (!getConceptById(fromId, graph) || !getConceptById(toId, graph)) return null;
  if (fromId === toId) return [fromId];

  const queue = [[fromId]];
  const visited = new Set([fromId]);
  while (queue.length) {
    const path = queue.shift();
    const current = path.at(-1);
    const neighbours = graph.edges.flatMap((connection) => {
      if (connection.from === current) return [connection.to];
      if (!directed && connection.to === current) return [connection.from];
      return [];
    });

    for (const neighbour of neighbours) {
      if (visited.has(neighbour)) continue;
      const nextPath = [...path, neighbour];
      if (neighbour === toId) return nextPath;
      visited.add(neighbour);
      queue.push(nextPath);
    }
  }
  return null;
}

export function validateConceptGraph(graph = CONCEPT_GRAPH) {
  const errors = [];
  const ids = new Set();
  for (const concept of graph.nodes) {
    if (!concept.id || !concept.label) errors.push('Every concept node needs an ID and child-readable label.');
    if (ids.has(concept.id)) errors.push(`Duplicate concept node: ${concept.id}.`);
    ids.add(concept.id);
  }
  for (const connection of graph.edges) {
    if (!ids.has(connection.from)) errors.push(`Unknown edge source: ${connection.from}.`);
    if (!ids.has(connection.to)) errors.push(`Unknown edge target: ${connection.to}.`);
    if (!connection.relation) errors.push(`Edge ${connection.from} -> ${connection.to} needs a relation.`);
  }
  return { valid: errors.length === 0, errors };
}

export default CONCEPT_GRAPH;
