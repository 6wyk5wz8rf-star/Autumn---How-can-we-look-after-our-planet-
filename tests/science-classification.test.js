import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CLASSIFICATION_QUESTIONS,
  CLASSIFICATION_SETS,
  analyseCustomQuestion,
  buildClassificationTree,
  followClassificationTree,
  validateBinaryQuestion,
  validateClassificationTree,
} from '../src/science/classification.js';
import {
  BROKEN_KEY_CASES,
  CHANGE_SCENARIOS,
  generateScienceTask,
  validateBrokenKeyCases,
  validateScienceTask,
} from '../src/science/generator.js';

test('every authored classification set has a complete, loop-free binary key', () => {
  assert.ok(CLASSIFICATION_QUESTIONS.length >= 50);
  assert.equal(CLASSIFICATION_SETS.length, 10);
  for (const set of CLASSIFICATION_SETS) {
    const tree = buildClassificationTree(set.organismIds);
    const validation = validateClassificationTree(tree, set.organismIds);
    assert.equal(validation.valid, true, `${set.id}: ${validation.errors.join(' ')}`);
    for (const organismId of set.organismIds) {
      const route = followClassificationTree(tree, organismId);
      assert.equal(route.result, organismId);
      assert.ok(route.history.length >= 1);
      assert.ok(route.history.every(({ answer }) => typeof answer === 'boolean'));
    }
    assert.deepEqual(JSON.parse(JSON.stringify(tree)), tree);
  }
});

test('question validation names weak, vague and one-sided classification questions', () => {
  const vertebrates = CLASSIFICATION_SETS.find(({ id }) => id === 'vertebrate-groups').organismIds;
  const backbone = CLASSIFICATION_QUESTIONS.find(({ id }) => id === 'has-backbone');
  const oneSided = validateBinaryQuestion(backbone, vertebrates);
  assert.equal(oneSided.valid, false);
  assert.match(oneSided.errors.join(' '), /every organism/i);

  assert.equal(analyseCustomQuestion('Is it big?', vertebrates).valid, false);
  assert.match(analyseCustomQuestion('Is it big?', vertebrates).errors.join(' '), /measurement/i);
  assert.equal(analyseCustomQuestion('Does it look dangerous?', vertebrates).valid, false);
  assert.match(analyseCustomQuestion('Does it look dangerous?', vertebrates).errors.join(' '), /opinion/i);
});

test('two thousand seeded classification tasks are deterministic and logically complete', () => {
  for (let index = 0; index < 2000; index += 1) {
    const seed = `science-key-batch-${index}`;
    const first = generateScienceTask('build-key', seed);
    const second = generateScienceTask('build-key', seed);
    assert.deepEqual(second, first);
    const validation = validateScienceTask(first);
    assert.equal(validation.valid, true, `${seed}: ${validation.errors.join(' ')}`);
    assert.equal(validateClassificationTree(first.tree, first.organismIds).valid, true);
  }
});

test('every supported generator mode produces valid, reproducible local work', () => {
  const modes = ['browser', 'observation', 'compare', 'sorting', 'rule-test', 'backbone', 'vertebrates', 'invertebrates', 'follow-key', 'build-key', 'broken-key', 'mystery', 'habitat', 'microhabitat', 'habitat-builder', 'change', 'survey', 'challenge'];
  for (const mode of modes) {
    for (let index = 0; index < 40; index += 1) {
      const seed = `${mode}-${index}`;
      const task = generateScienceTask(mode, seed, { scaffold: index % 2 ? 'core' : 'intensive' });
      assert.equal(validateScienceTask(task).valid, true);
      assert.deepEqual(generateScienceTask(mode, seed, { scaffold: index % 2 ? 'core' : 'intensive' }), task);
    }
  }
});

test('broken keys are deliberate and repairable while change scenarios preserve uncertainty', () => {
  const broken = validateBrokenKeyCases();
  assert.equal(broken.valid, true, broken.errors.join('\n'));
  assert.equal(BROKEN_KEY_CASES.length, 5);
  for (const fixture of BROKEN_KEY_CASES) {
    assert.ok(fixture.fault);
    assert.ok(fixture.repairQuestionIds.length >= 1);
  }
  assert.equal(CHANGE_SCENARIOS.length, 10);
  for (const scenario of CHANGE_SCENARIOS) {
    assert.ok(scenario.evidence);
    assert.ok(scenario.uncertainty);
    assert.ok(scenario.possibleEffects.length >= 2);
    assert.match(scenario.possibleEffects.join(' '), /may|could|need|matter|if|different|some/i);
  }
});
