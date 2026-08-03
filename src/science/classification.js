import { ORGANISMS, getOrganism } from '../data/organisms.js';

const question = (id, label, featureId, options = {}) => Object.freeze({
  id,
  label,
  featureId,
  observable: options.observable !== false,
  knownInformation: options.knownInformation === true,
  caution: options.caution || '',
});

export const CLASSIFICATION_QUESTIONS = Object.freeze([
  question('is-plant', 'Is it a plant?', 'plant', { knownInformation: true }),
  question('has-backbone', 'Does it have an internal backbone?', 'backbone', { observable: false, knownInformation: true, caution: 'A backbone may not be visible in the illustration; use the information card.' }),
  question('has-fur', 'Does it have hair or fur?', 'fur'),
  question('has-feathers', 'Does it have feathers?', 'feathers'),
  question('has-gills', 'Does it use gills in the shown adult stage?', 'gills', { observable: false, knownInformation: true }),
  question('has-dry-scales', 'Does it have dry scales?', 'dry-scales'),
  question('has-moist-skin', 'Does it have moist skin?', 'moist-skin'),
  question('has-six-legs', 'Does the shown adult have six legs?', 'six-legs'),
  question('has-eight-legs', 'Does the shown adult have eight legs?', 'eight-legs'),
  question('has-more-eight-legs', 'Does it have more than eight visible legs?', 'more-than-eight-legs'),
  question('has-shell', 'Does it have a visible shell?', 'shell'),
  question('has-visible-wings', 'Does the shown organism have visible wings?', 'visible-wings'),
  question('segmented-body', 'Is its body visibly divided into repeated segments?', 'segmented-body'),
  question('has-pincers', 'Does it have visible pincers?', 'pincers'),
  question('five-part-body', 'Does its body have a five-part radial pattern?', 'five-part-radial-body'),
  question('long-body', 'Does it have a long narrow body without visible legs?', 'long-body'),
  question('has-flippers', 'Does it have flippers?', 'flippers'),
  question('has-four-limbs', 'Does the shown adult have four limbs?', 'four-limbs'),
  question('has-beak', 'Does it have a beak?', 'beak'),
  question('webbed-feet', 'Does it have visibly webbed feet?', 'webbed-feet'),
  question('does-not-fly', 'Is it a bird in the set that does not fly?', 'does-not-fly', { observable: false, knownInformation: true }),
  question('has-tentacles', 'Does it have visible tentacles?', 'tentacles'),
  question('has-suckers', 'Does it have visible suckers?', 'suckers'),
  question('one-leg-pair', 'Does it have one pair of legs on most body segments?', 'one-leg-pair-per-segment'),
  question('two-leg-pairs', 'Does it have two pairs of legs on most apparent body rings?', 'two-leg-pairs-per-ring'),
  question('woody-stem', 'Does it have a woody stem or trunk?', 'woody-stem'),
  question('has-flowers', 'Does this plant produce flowers?', 'flowers', { observable: false, knownInformation: true }),
  question('has-fronds', 'Does it have divided fronds?', 'fronds'),
  question('small-shoots', 'Does it form small leaf-like shoots?', 'small-leaf-like-shoots'),
  question('has-prop-roots', 'Does it have arching support roots?', 'prop-roots'),
  question('submerged-plant', 'Does it normally grow submerged in water?', 'submerged-plant', { observable: false, knownInformation: true }),
  question('has-trunk', 'Does it have a long flexible trunk?', 'trunk'),
  question('has-spines', 'Is its back covered with stiff spines?', 'spines'),
  question('has-bushy-tail', 'Does it have a long bushy tail?', 'bushy-tail'),
  question('has-body-bands', 'Does it have bold bands across its body?', 'body-bands'),
  question('upright-fish', 'Does it swim with an upright body shape?', 'upright-body'),
  question('red-breast', 'Does it have a red-orange breast in the shown adult view?', 'red-breast'),
  question('broad-bill', 'Does it have a broad, flattened bill?', 'broad-bill'),
  question('flipper-wings', 'Are its wings shaped as swimming flippers?', 'flipper-like-wings'),
  question('long-neck', 'Does it have a very long neck and long running legs?', 'long-neck'),
  question('talons', 'Does it have strong curved talons for catching prey?', 'talons'),
  question('bare-face', 'Does it have a mostly bare face?', 'bare-face'),
  question('has-domed-shell', 'Does it have a strongly domed shell?', 'domed-shell'),
  question('adult-tail', 'Does the adult amphibian keep a long tail?', 'adult-tail'),
  question('broad-wings', 'Does it have broad scale-covered wings?', 'broad-wings'),
  question('long-clear-wings', 'Does it have two pairs of long clear wings?', 'two-pairs-clear-wings'),
  question('large-hind-legs', 'Does it have enlarged hind legs for jumping?', 'large-hind-legs'),
  question('twig-like', 'Does its body resemble a twig?', 'twig-like-body'),
  question('segmented-tail', 'Does it have a segmented tail ending in a sting?', 'segmented-tail'),
  question('very-long-legs', 'Are its legs very long compared with its body?', 'very-long-legs'),
  question('two-part-shell', 'Does its shell have two hinged parts?', 'two-part-shell'),
  question('many-spines', 'Is its rounded body covered in many movable spines?', 'many-spines'),
  question('acorns', 'Does it produce acorns?', 'acorns', { observable: false, knownInformation: true }),
  question('toothed-leaves', 'Does it have a low rosette of toothed leaves?', 'toothed-leaves'),
]);

export const CLASSIFICATION_SETS = Object.freeze([
  { id: 'mixed-eight', title: 'Living things: a mixed set', organismIds: ['red-fox', 'european-robin', 'atlantic-salmon', 'green-sea-turtle', 'common-frog', 'western-honey-bee', 'garden-cross-spider', 'garden-snail'] },
  { id: 'invertebrate-seven', title: 'Invertebrates are not one shape', organismIds: ['western-honey-bee', 'garden-cross-spider', 'garden-snail', 'common-earthworm', 'common-shore-crab', 'brown-centipede', 'common-starfish'] },
  { id: 'garden-eight', title: 'Garden and park observations', organismIds: ['european-hedgehog', 'european-robin', 'common-frog', 'western-honey-bee', 'garden-cross-spider', 'garden-snail', 'common-earthworm', 'common-dandelion'] },
  { id: 'vertebrate-groups', title: 'Five vertebrate groups', organismIds: ['red-fox', 'mallard', 'atlantic-salmon', 'grass-snake', 'smooth-newt'] },
  { id: 'bird-counterexamples', title: 'Birds: useful characteristics', organismIds: ['european-robin', 'mallard', 'emperor-penguin', 'common-ostrich', 'osprey', 'hooded-vulture'] },
  { id: 'water-not-a-group', title: 'Lives in water is not a scientific group', organismIds: ['bottlenose-dolphin', 'atlantic-salmon', 'green-sea-turtle', 'common-frog', 'common-octopus', 'common-eelgrass'] },
  { id: 'many-legs', title: 'Six, eight and many legs', organismIds: ['western-honey-bee', 'garden-cross-spider', 'common-shore-crab', 'common-rough-woodlouse', 'brown-centipede', 'white-legged-snake-millipede'] },
  { id: 'shells', title: 'Different kinds of visible shell', organismIds: ['green-sea-turtle', 'hermanns-tortoise', 'garden-snail', 'blue-mussel', 'common-shore-crab', 'edible-sea-urchin'] },
  { id: 'plants-six', title: 'Plant features', organismIds: ['english-oak', 'common-dandelion', 'bracken', 'common-haircap-moss', 'red-mangrove', 'common-eelgrass'] },
  { id: 'gambia-connections', title: 'Selected researched Gambian connections', organismIds: ['west-african-manatee', 'osprey', 'hooded-vulture', 'west-african-crocodile', 'western-honey-bee', 'red-mangrove'] },
]);

export function getClassificationQuestion(id) {
  return CLASSIFICATION_QUESTIONS.find((item) => item.id === id) || null;
}

export function getClassificationSet(id) {
  return CLASSIFICATION_SETS.find((item) => item.id === id) || null;
}

export function questionAnswer(organism, questionRecord) {
  if (!organism || !questionRecord) return null;
  return organism.binaryFeatures.includes(questionRecord.featureId);
}

export function validateBinaryQuestion(questionRecord, organismIds, { organisms = ORGANISMS } = {}) {
  const records = organismIds.map((id) => organisms.find((item) => item.id === id)).filter(Boolean);
  const errors = [];
  if (!questionRecord?.id || !questionRecord?.label || !questionRecord?.featureId) errors.push('The question needs a stable ID, wording and feature.');
  if (!records.length) errors.push('A question needs at least one organism.');
  const yesIds = records.filter((organism) => questionAnswer(organism, questionRecord)).map((organism) => organism.id);
  const noIds = records.filter((organism) => !questionAnswer(organism, questionRecord)).map((organism) => organism.id);
  if (records.length > 1 && !yesIds.length) errors.push('This question sends every organism to “no”.');
  if (records.length > 1 && !noIds.length) errors.push('This question sends every organism to “yes”.');
  return { valid: errors.length === 0, errors, yesIds, noIds, usefulness: Math.min(yesIds.length, noIds.length) };
}

function candidateScore(validation) {
  const total = validation.yesIds.length + validation.noIds.length;
  return Math.min(validation.yesIds.length, validation.noIds.length) * 10 - Math.abs(validation.yesIds.length - validation.noIds.length) / Math.max(1, total);
}

export function chooseUsefulQuestion(organismIds, questionIds = CLASSIFICATION_QUESTIONS.map((item) => item.id), usedQuestionIds = []) {
  const used = new Set(usedQuestionIds);
  return questionIds
    .map(getClassificationQuestion)
    .filter(Boolean)
    .filter((item) => !used.has(item.id))
    .map((item) => ({ question: item, validation: validateBinaryQuestion(item, organismIds) }))
    .filter((item) => item.validation.valid)
    .sort((left, right) => candidateScore(right.validation) - candidateScore(left.validation) || left.question.id.localeCompare(right.question.id))[0] || null;
}

export function buildClassificationTree(organismIds, { questionIds = CLASSIFICATION_QUESTIONS.map((item) => item.id) } = {}) {
  const records = [...new Set(organismIds)].map(getOrganism).filter(Boolean);
  let nodeNumber = 0;
  const build = (ids, used = []) => {
    if (ids.length === 1) return Object.freeze({ id: `result-${ids[0]}`, type: 'result', organismId: ids[0], organismIds: Object.freeze(ids), complete: true });
    const selected = chooseUsefulQuestion(ids, questionIds, used);
    if (!selected) return Object.freeze({ id: `incomplete-${nodeNumber += 1}`, type: 'result', organismId: null, organismIds: Object.freeze(ids), complete: false });
    const id = `question-${nodeNumber += 1}`;
    const nextUsed = [...used, selected.question.id];
    return Object.freeze({
      id,
      type: 'question',
      questionId: selected.question.id,
      label: selected.question.label,
      organismIds: Object.freeze(ids),
      yes: build(selected.validation.yesIds, nextUsed),
      no: build(selected.validation.noIds, nextUsed),
    });
  };
  return build(records.map((item) => item.id));
}

export function validateClassificationTree(tree, organismIds) {
  const errors = [];
  const expected = new Set(organismIds);
  const endpoints = [];
  const seenNodes = new Set();
  const visit = (node, path = []) => {
    if (!node || typeof node !== 'object') {
      errors.push('A branch has no destination.');
      return;
    }
    if (seenNodes.has(node)) {
      errors.push('The key contains a loop.');
      return;
    }
    seenNodes.add(node);
    if (node.type === 'result') {
      if (!node.complete || node.organismIds?.length !== 1 || !node.organismId) errors.push(`Endpoint ${node.id} contains more than one organism.`);
      else endpoints.push(node.organismId);
      return;
    }
    const q = getClassificationQuestion(node.questionId);
    if (!q) errors.push(`Unknown question ${node.questionId}.`);
    if (!node.yes || !node.no) errors.push(`Question ${node.id} needs two defined branches.`);
    const validation = q ? validateBinaryQuestion(q, node.organismIds || []) : { valid: false, errors: [] };
    if (!validation.valid) errors.push(...validation.errors.map((error) => `${node.id}: ${error}`));
    visit(node.yes, [...path, `${node.id}:yes`]);
    visit(node.no, [...path, `${node.id}:no`]);
  };
  visit(tree);
  for (const id of endpoints) if (!expected.has(id)) errors.push(`Unexpected endpoint ${id}.`);
  for (const id of expected) if (!endpoints.includes(id)) errors.push(`Organism ${id} is missing from a unique endpoint.`);
  if (new Set(endpoints).size !== endpoints.length) errors.push('An organism appears at more than one endpoint.');
  return { valid: errors.length === 0, errors, endpoints };
}

export function followClassificationTree(tree, organismId) {
  const organism = getOrganism(organismId);
  if (!organism) return { result: null, history: [], valid: false };
  const history = [];
  let node = tree;
  while (node?.type === 'question') {
    const q = getClassificationQuestion(node.questionId);
    const answer = questionAnswer(organism, q);
    history.push({ nodeId: node.id, questionId: q.id, label: q.label, answer });
    node = answer ? node.yes : node.no;
  }
  return { result: node?.organismId || null, history, valid: node?.organismId === organismId };
}

export function analyseCustomQuestion(text, organismIds = []) {
  const value = String(text || '').trim();
  const errors = [];
  if (!value) errors.push('Add a question another scientist can read.');
  if (value && !value.endsWith('?')) errors.push('Write the question with a question mark.');
  if (/\b(big|small|large|fast|slow|nice|dangerous|scary|strange|unusual)\b/i.test(value)) errors.push('This wording needs a measurement or uses an opinion. Choose a feature another observer could check.');
  if (!/^(does|is|has|can)\b/i.test(value)) errors.push('Use a clear binary form such as “Does it have…?” or “Is it…?”.');
  return { valid: errors.length === 0, errors, organismIds: [...organismIds] };
}

export default CLASSIFICATION_QUESTIONS;
