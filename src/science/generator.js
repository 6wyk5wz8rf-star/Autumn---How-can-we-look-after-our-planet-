import { createRandomState, randomChoice, randomInteger, shuffleDeterministically } from '../maths/random.js';
import { HABITATS, MICROHABITATS, ORGANISMS, getHabitat, getOrganism, organismsForHabitat } from '../data/organisms.js';
import {
  CLASSIFICATION_QUESTIONS,
  CLASSIFICATION_SETS,
  buildClassificationTree,
  getClassificationQuestion,
  validateBinaryQuestion,
  validateClassificationTree,
} from './classification.js';

export const SCIENCE_GENERATOR_VERSION = 1;

export const CHANGE_SCENARIOS = Object.freeze([
  { id: 'reduced-water', title: 'Less surface water', habitatId: 'freshwater', change: 'A dry period reduces shallow surface water.', condition: 'water availability', resource: 'water and wet edges', direction: 'reduced', evidence: 'The habitat model shows less shallow water than before.', uncertainty: 'How long the dry period lasts and whether nearby wet places remain.', possibleEffects: ['Organisms needing moist skin may have fewer suitable places.', 'Some plants rooted at the former edge may experience drier soil.', 'A mobile animal may use another nearby water body if one is available.'] },
  { id: 'increased-water', title: 'More frequent flooding', habitatId: 'coast-estuary', change: 'Water covers the mudflat more often.', condition: 'time under water', resource: 'feeding and resting surfaces', direction: 'increased', evidence: 'The model shows less exposed mud between high-water periods.', uncertainty: 'The depth, salinity and length of each flood.', possibleEffects: ['Some aquatic organisms could gain more connected water.', 'Animals feeding on exposed mud may have less time to use it.', 'Plants unable to tolerate longer flooding may grow less well.'] },
  { id: 'temperature-rise', title: 'Warmer conditions', habitatId: 'garden-park', change: 'Average local temperature rises for a sustained period.', condition: 'temperature', resource: 'suitable temperature and seasonal timing', direction: 'increased', evidence: 'Repeated measurements show a higher average, not just one warm day.', uncertainty: 'Rainfall, shade and each species’ tolerance.', possibleEffects: ['Activity or flowering times could change.', 'One organism may benefit while another experiences heat or water pressure.', 'More evidence is needed before predicting population change.'] },
  { id: 'temperature-fall', title: 'Colder spell', habitatId: 'freshwater', change: 'A sustained cold spell lowers water and air temperature.', condition: 'temperature', resource: 'suitable temperature and liquid water', direction: 'reduced', evidence: 'Measurements remain lower over several days.', uncertainty: 'Water depth, ice cover and how organisms are sheltered.', possibleEffects: ['Some activity may slow.', 'Shallow water may change more quickly than deeper water.', 'Different life stages could respond differently.'] },
  { id: 'plant-cover-loss', title: 'Less plant cover', habitatId: 'woodland', change: 'A patch loses much of its low plant cover.', condition: 'vegetation cover', resource: 'food, shade and shelter', direction: 'reduced', evidence: 'The before-and-after view shows more exposed ground.', uncertainty: 'Which plant species remain and whether cover returns.', possibleEffects: ['Ground conditions may become lighter and drier.', 'Some organisms may lose shelter or plant food.', 'Other sun-loving plants could gain space.'] },
  { id: 'litter-increase', title: 'More litter', habitatId: 'urban', change: 'Discarded packaging increases around a green space.', condition: 'surface obstruction and material', resource: 'safe movement, feeding surfaces and water quality', direction: 'increased', evidence: 'A repeatable survey records more litter items in the same area.', uncertainty: 'Material type, amount, duration and whether organisms contact it.', possibleEffects: ['Some movement routes may be obstructed.', 'Water in a nearby drain could carry material elsewhere.', 'A claim of harm needs evidence about contact, amount and organism needs.'] },
  { id: 'development', title: 'Building development', habitatId: 'grassland', change: 'Part of an open grass area becomes buildings and hard surface.', condition: 'space and ground cover', resource: 'soil, vegetation, shelter and connected space', direction: 'changed', evidence: 'The site plan shows less continuous grass and more hard surface.', uncertainty: 'The final planting, drainage and connections to nearby habitats.', possibleEffects: ['Organisms using open soil or grasses may have less space.', 'Buildings may create new ledges, shade or shelter for some species.', 'Connections between remaining green patches may matter.'] },
  { id: 'new-shade', title: 'More shade', habitatId: 'garden-park', change: 'Young trees grow and shade a previously open patch.', condition: 'light and temperature', resource: 'light, cool shelter and soil moisture', direction: 'changed', evidence: 'Light readings are lower beneath the growing canopy.', uncertainty: 'Season, tree density and the needs of each organism.', possibleEffects: ['Shade-tolerant plants could gain suitable conditions.', 'Sun-loving plants may flower less in that patch.', 'Moisture may remain longer after rain.'] },
  { id: 'new-food-source', title: 'New food source', habitatId: 'urban', change: 'People regularly leave food in one place.', condition: 'food availability and gathering behaviour', resource: 'food', direction: 'increased', evidence: 'The food is repeatedly present and some animals are observed using it.', uncertainty: 'Food quality, dependence, disease risk and effects on other species.', possibleEffects: ['Some animals may gather in larger numbers.', 'Predators or competitors could also respond.', 'An increase in visits does not by itself prove a healthy population.'] },
  { id: 'habitat-restoration', title: 'Pond-edge restoration', habitatId: 'freshwater', change: 'A bare pond edge is replanted and protected from frequent disturbance.', condition: 'vegetation and disturbance', resource: 'shelter, breeding places and plant food', direction: 'restored', evidence: 'The model shows more edge vegetation and fewer trampling events.', uncertainty: 'Plant survival, water quality and time for organisms to respond.', possibleEffects: ['Some organisms could gain shelter and attachment surfaces.', 'Dense vegetation could reduce open water used by other organisms.', 'Repeated observations are needed to judge longer-term effects.'] },
]);

export const BROKEN_KEY_CASES = Object.freeze([
  { id: 'all-one-side', title: 'Every organism goes the same way', setId: 'vertebrate-groups', faultyQuestionId: 'has-backbone', repairQuestionIds: ['has-feathers', 'has-gills', 'has-dry-scales'], fault: 'The first question sends every organism to “yes”, so it does not narrow this set.' },
  { id: 'opinion-wording', title: 'An opinion is used as evidence', setId: 'garden-eight', customFault: 'Does it look scary?', repairQuestionIds: ['is-plant', 'has-backbone', 'has-six-legs'], fault: '“Scary” is an opinion another observer cannot check consistently.' },
  { id: 'vague-size', title: 'The measurement is missing', setId: 'invertebrate-seven', customFault: 'Is it big?', repairQuestionIds: ['has-six-legs', 'has-eight-legs', 'has-shell'], fault: '“Big” needs an agreed measurement and comparison.' },
  { id: 'wrong-group', title: 'Water is mistaken for a scientific group', setId: 'water-not-a-group', customFault: 'Does it live in water? Then it is a fish.', repairQuestionIds: ['is-plant', 'has-backbone', 'has-gills'], fault: 'Living in water does not make a dolphin, turtle, octopus or plant a fish.' },
  { id: 'unfinished-endpoint', title: 'Two organisms still finish together', setId: 'many-legs', faultyQuestionId: 'has-more-eight-legs', repairQuestionIds: ['one-leg-pair', 'two-leg-pairs', 'has-pincers'], fault: 'One branch still contains several different organisms and needs another question.' },
]);

function select(state, values) {
  const result = randomChoice(state, values);
  return { value: result.value, state: result.randomState };
}

function selectSet(state, minimum = 4, maximum = 8) {
  const selected = select(state, CLASSIFICATION_SETS.filter((set) => set.organismIds.length >= minimum));
  state = selected.state;
  const upper = Math.min(maximum, selected.value.organismIds.length);
  const countDraw = randomInteger(state, minimum, upper);
  state = countDraw.randomState;
  const shuffled = shuffleDeterministically(state, selected.value.organismIds);
  return { set: selected.value, organismIds: shuffled.value.slice(0, countDraw.value), state: shuffled.randomState };
}

function classificationTask(mode, state) {
  const selected = selectSet(state, mode === 'mystery' ? 6 : 4, mode === 'mystery' ? 8 : 8);
  const tree = buildClassificationTree(selected.organismIds);
  const validation = validateClassificationTree(tree, selected.organismIds);
  if (!validation.valid) throw new Error(`Generated classification set is invalid: ${validation.errors.join(' ')}`);
  let nextState = selected.state;
  const mysteryDraw = randomChoice(nextState, selected.organismIds);
  nextState = mysteryDraw.randomState;
  return {
    state: nextState,
    task: {
      setId: selected.set.id,
      title: selected.set.title,
      organismIds: [...selected.organismIds],
      tree,
      mysteryOrganismId: mysteryDraw.value,
    },
  };
}

function comparisonTask(state) {
  const selected = selectSet(state, 4, 8);
  const countDraw = randomInteger(selected.state, 2, 3);
  return { state: countDraw.randomState, task: { setId: selected.set.id, organismIds: selected.organismIds.slice(0, countDraw.value) } };
}

function habitatTask(state) {
  const habitatDraw = randomChoice(state, HABITATS);
  const candidates = organismsForHabitat(habitatDraw.value.id);
  const shuffled = shuffleDeterministically(habitatDraw.randomState, candidates.map((item) => item.id));
  return { state: shuffled.randomState, task: { habitatId: habitatDraw.value.id, organismIds: shuffled.value.slice(0, 8), evidence: [...habitatDraw.value.resources] } };
}

function microhabitatTask(state) {
  const selected = randomChoice(state, MICROHABITATS);
  return { state: selected.randomState, task: { microhabitatId: selected.value.id, organismIds: [...selected.value.likelyOrganismIds] } };
}

function changeTask(state) {
  const selected = randomChoice(state, CHANGE_SCENARIOS);
  const candidates = organismsForHabitat(selected.value.habitatId).map((item) => item.id);
  const shuffled = shuffleDeterministically(selected.randomState, candidates);
  return { state: shuffled.randomState, task: { scenarioId: selected.value.id, habitatId: selected.value.habitatId, organismIds: shuffled.value.slice(0, 4), evidence: selected.value.evidence, predictions: [...selected.value.possibleEffects] } };
}

function brokenKeyTask(state) {
  const selected = randomChoice(state, BROKEN_KEY_CASES);
  const set = CLASSIFICATION_SETS.find((item) => item.id === selected.value.setId);
  const repairOptions = selected.value.repairQuestionIds.map(getClassificationQuestion).filter(Boolean);
  if (!set || !repairOptions.length) throw new Error('Broken-key fixture is incomplete.');
  const { id: fixtureId, ...fixture } = selected.value;
  return { state: selected.randomState, task: { ...fixture, fixtureId, organismIds: [...set.organismIds], repairOptions } };
}

function surveyTask(state) {
  const locationDraw = randomChoice(state, ['playground', 'garden', 'pond edge', 'park', 'school wall']);
  const selected = selectSet(locationDraw.randomState, 4, 6);
  let nextState = selected.state;
  const rows = selected.organismIds.slice(0, 5).map((organismId) => {
    const countDraw = randomInteger(nextState, 0, 24);
    nextState = countDraw.randomState;
    return { organismId, tally: countDraw.value, count: countDraw.value };
  });
  return { state: nextState, task: { mode: 'fictional-learning-data', locationLabel: locationDraw.value, rows } };
}

export function generateScienceTask(mode, seed, options = {}) {
  let state = createRandomState(seed);
  let generated;
  if (['follow-key', 'build-key', 'mystery', 'sorting', 'rule-test', 'backbone', 'vertebrates', 'invertebrates'].includes(mode)) generated = classificationTask(mode, state);
  else if (['compare', 'observation', 'browser'].includes(mode)) generated = comparisonTask(state);
  else if (['habitat', 'habitat-builder'].includes(mode)) generated = habitatTask(state);
  else if (mode === 'microhabitat') generated = microhabitatTask(state);
  else if (mode === 'change') generated = changeTask(state);
  else if (mode === 'broken-key') generated = brokenKeyTask(state);
  else if (mode === 'survey') generated = surveyTask(state);
  else if (mode === 'challenge') generated = classificationTask('build-key', state);
  else throw new RangeError(`Unknown science task mode: ${mode}.`);
  state = generated.state;
  const task = Object.freeze({
    id: `science-${mode}-${state.seed}-${state.draws}`,
    mode,
    seed,
    generatorVersion: SCIENCE_GENERATOR_VERSION,
    curriculumTags: Object.freeze(['science', 'year-4', 'living-things', mode]),
    ...generated.task,
    options: Object.freeze({ ...options }),
  });
  const validation = validateScienceTask(task);
  if (!validation.valid) throw new Error(`Invalid generated science task: ${validation.errors.join(' ')}`);
  return task;
}

export function validateScienceTask(task) {
  const errors = [];
  if (!task?.id || !task?.mode || task.seed === undefined) errors.push('Generated task needs ID, mode and seed.');
  const organismIds = task?.organismIds || task?.rows?.map((row) => row.organismId) || [];
  if (new Set(organismIds).size !== organismIds.length) errors.push('Generated task contains duplicate organisms.');
  for (const id of organismIds) if (!getOrganism(id)) errors.push(`Generated task refers to missing organism ${id}.`);
  if (task.tree) {
    const treeValidation = validateClassificationTree(task.tree, organismIds);
    if (!treeValidation.valid) errors.push(...treeValidation.errors);
  }
  if (task.habitatId && !getHabitat(task.habitatId)) errors.push(`Generated task refers to missing habitat ${task.habitatId}.`);
  if (task.scenarioId && !CHANGE_SCENARIOS.some((scenario) => scenario.id === task.scenarioId)) errors.push(`Generated task refers to missing change scenario ${task.scenarioId}.`);
  return { valid: errors.length === 0, errors };
}

export function habitatNeedsFor(organism) {
  const needs = ['food', 'water', 'shelter or protection', 'space'];
  if (organism.kingdom === 'plant') needs.push('light', 'a suitable growing surface or soil');
  if (organism.broadGroup === 'fish' || ['common-octopus', 'blue-mussel', 'common-shore-crab', 'common-prawn', 'common-starfish', 'edible-sea-urchin'].includes(organism.id)) needs.push('water with suitable oxygen and salinity');
  if (organism.broadGroup === 'amphibian') needs.push('moist conditions and suitable water or wet places for familiar life stages');
  return [...new Set(needs)];
}

export function evaluateHabitatModel(model, organism) {
  if (!model || !organism) return { supported: [], missing: ['model or organism evidence'], statement: 'More information is needed.' };
  const supported = [];
  const missing = [];
  if (model.water !== 'none') supported.push('water'); else missing.push('water');
  if (model.vegetation !== 'none') supported.push('plant cover and possible food');
  if (model.shelter !== 'none') supported.push('shelter'); else missing.push('shelter');
  if (model.space !== 'small') supported.push('space');
  if (organism.kingdom === 'plant' && model.light === 'dark') missing.push('enough light for this plant');
  const aquatic = organism.habitatIds.some((id) => ['freshwater', 'coast-estuary', 'ocean'].includes(id));
  if (aquatic && model.water !== 'body') missing.push('a suitable body of water');
  const statement = missing.length
    ? `This model provides ${supported.join(', ') || 'some conditions'}, but ${missing.join(', ')} may be missing.`
    : `This model contains several resources the organism may use. It is still a simplified model, not proof of a complete habitat.`;
  return { supported, missing, statement, needs: habitatNeedsFor(organism) };
}

export function validateBrokenKeyCases() {
  const errors = [];
  for (const fixture of BROKEN_KEY_CASES) {
    const set = CLASSIFICATION_SETS.find((item) => item.id === fixture.setId);
    if (!set) errors.push(`${fixture.id} has no organism set.`);
    if (!fixture.fault) errors.push(`${fixture.id} needs an explicit fault.`);
    if (fixture.faultyQuestionId) {
      const faulty = getClassificationQuestion(fixture.faultyQuestionId);
      if (!faulty) errors.push(`${fixture.id} has a missing faulty question.`);
      else if (validateBinaryQuestion(faulty, set.organismIds).valid && fixture.id === 'all-one-side') errors.push(`${fixture.id} no longer demonstrates its intended one-sided fault.`);
    }
    for (const id of fixture.repairQuestionIds) {
      const candidate = getClassificationQuestion(id);
      if (!candidate) errors.push(`${fixture.id} has a missing repair question ${id}.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export default generateScienceTask;
