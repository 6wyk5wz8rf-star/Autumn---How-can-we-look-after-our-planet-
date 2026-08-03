import { escapeAttr, escapeHTML } from '../../utils/dom.js';
import { HABITATS, MICROHABITATS, ORGANISMS, getHabitat, getOrganism, organismsForHabitat } from '../../data/organisms.js';
import { SCIENCE_REGIONS, SCIENCE_TOOLS, getScienceTool } from '../../data/livingThings.js';
import {
  CLASSIFICATION_QUESTIONS,
  analyseCustomQuestion,
  buildClassificationTree,
  followClassificationTree,
  getClassificationSet,
  getClassificationQuestion,
  questionAnswer,
  validateBinaryQuestion,
  validateClassificationTree,
} from '../../science/classification.js';
import {
  BROKEN_KEY_CASES,
  CHANGE_SCENARIOS,
  evaluateHabitatModel,
  generateScienceTask,
  habitatNeedsFor,
} from '../../science/generator.js';
import { renderOrganismIllustration } from '../../science/illustrations.js';

const clone = (value) => (typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)));
const titleCase = (value) => String(value || '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const atlasRecordId = (value) => ({ 'river-gambia': 'gambia', 'atlantic-ocean': 'world' })[value] || value;
const nowSeed = (toolId) => `${toolId}-${Date.now()}`;

function scaffoldLimit(scaffold) {
  return ({ intensive: 4, strong: 6, core: 8, light: 10 })[scaffold] || 8;
}

function defaultGroups(organismIds) {
  return [
    { id: 'a', title: 'Group A', organismIds: organismIds.filter((_, index) => index % 2 === 0) },
    { id: 'b', title: 'Group B', organismIds: organismIds.filter((_, index) => index % 2 === 1) },
  ];
}

export function defaultScienceState(tool, activity = null, saved = null, scaffold = 'core') {
  if (saved?.toolId === tool.id) return {
    ...clone(saved),
    activityId: activity?.id || saved.activityId || null,
    board: false,
    boardStep: 0,
  };
  const seed = nowSeed(tool.id);
  const task = generateScienceTask(tool.mode, seed, { scaffold });
  const organismIds = (task.organismIds || task.rows?.map((row) => row.organismId) || ORGANISMS.slice(0, scaffoldLimit(scaffold)).map((item) => item.id)).slice(0, scaffoldLimit(scaffold));
  const selected = organismIds[0] || ORGANISMS[0].id;
  return {
    schemaVersion: 1,
    toolId: tool.id,
    mode: tool.mode,
    activityId: activity?.id || null,
    seed,
    task,
    organismIds,
    selectedOrganismId: selected,
    compareOrganismIds: organismIds.slice(0, 2),
    selectedFeatureIds: [],
    hideNames: false,
    silhouette: false,
    zoom: false,
    browserFilter: 'all',
    observationText: '',
    inferenceText: '',
    opinionText: '',
    explanation: '',
    annotation: '',
    groupLayout: 'trays',
    groups: defaultGroups(organismIds),
    selectedSortingOrganismId: selected,
    groupingRule: '',
    groupRuleQuestionId: 'has-visible-wings',
    ruleFeedback: '',
    backboneGuess: '',
    selectedQuestionIds: [],
    customQuestionText: '',
    customQuestionFeedback: '',
    questionHistory: [],
    remainingOrganismIds: [...organismIds],
    routeStep: 0,
    repairQuestionId: '',
    habitatId: task.habitatId || HABITATS[0].id,
    microhabitatId: task.microhabitatId || MICROHABITATS[0].id,
    habitatModel: { water: 'some', vegetation: 'some', shelter: 'some', ground: 'soil', temperature: 'mild', light: 'mixed', disturbance: 'some', space: 'medium' },
    scenarioId: task.scenarioId || CHANGE_SCENARIOS[0].id,
    evidenceStatement: '',
    knownStatement: '',
    predictionStatement: '',
    uncertaintyStatement: '',
    surveyMode: task.mode === 'fictional-learning-data' ? 'fictional-learning-data' : 'child-entered-data',
    surveyLocation: task.locationLabel || 'playground',
    surveyDate: new Date().toISOString().slice(0, 10),
    surveyRows: task.rows ? clone(task.rows) : organismIds.slice(0, 5).map((organismId) => ({ organismId, tally: 0, count: 0 })),
    photoDataUrl: '',
    challengeType: 'mystery',
    challengeFaultId: BROKEN_KEY_CASES[0].id,
    printBlankTemplate: false,
    board: false,
    boardStep: 0,
    childActions: [],
  };
}

function organismName(id) {
  return getOrganism(id)?.commonName || titleCase(id);
}

function selectedOrganism(state) {
  return getOrganism(state.selectedOrganismId) || ORGANISMS[0];
}

function evidenceChips(organism, selected = []) {
  const features = [
    ['covering', organism.features.bodyCovering],
    ['limbs', Number.isInteger(organism.features.visibleLimbs) ? `${organism.features.visibleLimbs} visible limbs` : organism.features.visibleLimbs],
    ['wings', organism.features.wings ? 'visible wings' : 'no visible wings'],
    ['support', organism.features.shell ? 'visible shell' : organism.features.exoskeleton ? 'exoskeleton' : organism.backbone === 'vertebrate' ? 'internal backbone' : 'no backbone'],
    ['movement', organism.movement],
  ];
  return `<div class="science-evidence-chips" aria-label="Observable and known features">${features.map(([id, label]) => `<button type="button" data-science-action="toggle-feature" data-value="${escapeAttr(id)}" aria-pressed="${selected.includes(id)}">${escapeHTML(label)}</button>`).join('')}</div>`;
}

function organismCard(organism, state, { action = 'select-organism', selected = false, hideName = state.hideNames, compact = true } = {}) {
  return `<button class="science-organism-card ${selected ? 'is-selected' : ''}" type="button" data-science-action="${escapeAttr(action)}" data-organism-id="${escapeAttr(organism.id)}" aria-pressed="${selected}">
    ${renderOrganismIllustration(organism, { compact, hideName })}
    <span>${hideName ? 'Mystery organism' : escapeHTML(organism.commonName)}</span>
    ${hideName ? '' : `<small>${escapeHTML(titleCase(organism.subgroup))}</small>`}
  </button>`;
}

function organismDrawer(state, { ids = null, action = 'select-organism', selectedIds = null } = {}) {
  let records = (ids ? ids.map(getOrganism).filter(Boolean) : ORGANISMS);
  if (!ids && state.browserFilter !== 'all') {
    if (state.browserFilter === 'vertebrate' || state.browserFilter === 'invertebrate') records = records.filter((item) => item.backbone === state.browserFilter);
    else if (state.browserFilter === 'plant') records = records.filter((item) => item.kingdom === 'plant');
    else records = records.filter((item) => item.broadGroup === state.browserFilter || item.subgroup === state.browserFilter);
  }
  const selected = new Set(selectedIds || [state.selectedOrganismId]);
  return `<div class="science-organism-grid" role="list">${records.map((organism) => organismCard(organism, state, { action, selected: selected.has(organism.id) })).join('')}</div>`;
}

function renderOrganismBrowser(state, guided = false) {
  const organism = selectedOrganism(state);
  return `<div class="science-workbench science-observation-bench">
    <aside class="science-drawer paper-panel">
      <div class="science-filter-row no-print" role="group" aria-label="Filter organism drawers">${['all', 'vertebrate', 'invertebrate', 'plant', 'mammal', 'bird', 'fish', 'insect', 'arachnid'].map((filter) => `<button type="button" data-science-action="browser-filter" data-value="${filter}" aria-pressed="${state.browserFilter === filter}">${escapeHTML(titleCase(filter))}</button>`).join('')}</div>
      ${organismDrawer(state)}
    </aside>
    <section class="specimen-table ${state.zoom ? 'is-zoomed' : ''} ${state.silhouette ? 'is-silhouette' : ''}">
      <div class="specimen-toolbar no-print"><button class="button secondary" type="button" data-science-action="toggle-name">${state.hideNames ? 'Reveal name' : 'Hide name'}</button><button class="button secondary" type="button" data-science-action="toggle-silhouette" aria-pressed="${state.silhouette}">${state.silhouette ? 'Show diagram' : 'Show silhouette'}</button><button class="button secondary" type="button" data-science-action="toggle-zoom">${state.zoom ? 'Fit view' : 'Magnify'}</button><button class="button secondary" type="button" data-science-action="speak-name" data-speak="${escapeAttr(organism.pronunciation.text)}">Hear name</button></div>
      ${renderOrganismIllustration(organism, { hideName: state.hideNames })}
      <div class="specimen-notes">
        <p class="eyebrow">${escapeHTML(titleCase(organism.kingdom))} · ${escapeHTML(titleCase(organism.broadGroup))}</p>
        <p>${escapeHTML(organism.childDescription)}</p>
        ${evidenceChips(organism, state.selectedFeatureIds)}
        <details><summary>Where might it occur?</summary><p>${escapeHTML(organism.occurrence.summary)}</p><p class="small muted">A country or climate zone never proves that a species occurs everywhere within it.</p></details>
        <details><summary>Source & illustration note</summary><p>${escapeHTML(organism.imageRights.attribution)}. ${escapeHTML(organism.imageRights.caution)}</p><p class="small muted">Scientific name and broad classification checked against ${escapeHTML(organism.sources[0]?.label || 'the stored source record')}.</p></details>
      </div>
      ${guided || state.mode === 'observation' ? `<section class="science-response-panel"><h3>Observation, inference or opinion?</h3><label><span>We observed</span><textarea data-science-field="observationText" maxlength="500" placeholder="It has…">${escapeHTML(state.observationText)}</textarea></label><label><span>We infer</span><textarea data-science-field="inferenceText" maxlength="500" placeholder="It may… because…">${escapeHTML(state.inferenceText)}</textarea></label><label><span>My response or opinion</span><textarea data-science-field="opinionText" maxlength="300" placeholder="It looks…">${escapeHTML(state.opinionText)}</textarea></label><p class="science-feedback">An opinion is allowed; science simply labels it differently from an observation.</p></section>` : ''}
    </section>
  </div>`;
}

function featureComparison(records, hideNames = false) {
  const rows = [
    ['Broad group', (item) => titleCase(item.broadGroup)],
    ['Backbone', (item) => item.backbone ? titleCase(item.backbone) : 'Not an animal'],
    ['Body covering', (item) => item.features.bodyCovering],
    ['Visible limbs', (item) => String(item.features.visibleLimbs)],
    ['Movement', (item) => item.movement],
    ['Habitats in this library', (item) => item.habitatIds.map((id) => getHabitat(id)?.title).filter(Boolean).join(', ')],
  ];
  return `<div class="science-comparison-table" role="table" aria-label="Organism comparison"><div role="row" class="science-comparison-head"><span role="columnheader">Feature</span>${records.map((item,index) => `<span role="columnheader">${hideNames?`Organism ${String.fromCharCode(65+index)}`:escapeHTML(item.commonName)}</span>`).join('')}</div>${rows.map(([label, read]) => `<div role="row"><strong role="rowheader">${label}</strong>${records.map((item) => `<span role="cell">${escapeHTML(read(item))}</span>`).join('')}</div>`).join('')}</div>`;
}

function renderComparison(state) {
  const selectedIds = state.compareOrganismIds.slice(0, 3);
  const records = selectedIds.map(getOrganism).filter(Boolean);
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Comparison Lens</p><h2>Place two or three living things together</h2></div><div class="cluster no-print"><span class="muted">Choose an organism again to remove it.</span><button class="button secondary" type="button" data-science-action="toggle-name">${state.hideNames ? 'Reveal labels' : 'Hide labels'}</button></div></div>${organismDrawer(state, { action: 'toggle-compare', selectedIds })}<div class="science-compare-stage">${records.map((organism) => `<article>${renderOrganismIllustration(organism,{hideName:state.hideNames})}${evidenceChips(organism, state.selectedFeatureIds)}</article>`).join('')}</div>${records.length >= 2 ? featureComparison(records,state.hideNames) : '<p class="science-feedback">Choose at least two organisms.</p>'}<label class="science-explanation"><span>My evidence-based comparison</span><textarea data-science-field="explanation" maxlength="700" placeholder="Both… However… The visible evidence is…">${escapeHTML(state.explanation)}</textarea></label></section>`;
}

function renderSorting(state) {
  const records = state.organismIds.map(getOrganism).filter(Boolean);
  const selected = state.selectedSortingOrganismId;
  const question = getClassificationQuestion(state.groupRuleQuestionId);
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Sorting Meadow</p><h2>Create groups and state the rule</h2></div><div class="cluster no-print"><select data-science-field="groupLayout" aria-label="Grouping layout">${[['trays','Several trays'],['hoops','Two hoops'],['overlap','Overlapping groups'],['table','Simple table'],['branch','First branching decision']].map(([value,label])=>`<option value="${value}" ${state.groupLayout===value?'selected':''}>${label}</option>`).join('')}</select><button class="button secondary" type="button" data-science-action="add-sorting-group" ${state.groups.length>=5?'disabled':''}>Add group</button></div></div><div class="sorting-source">${records.map((organism) => organismCard(organism, state, { action: 'select-sorting-organism', selected: organism.id === selected })).join('')}</div><div class="sorting-board sorting-board--${escapeAttr(state.groupLayout)}">${state.groups.map((group) => `<section class="sorting-zone"><div class="sorting-zone-head"><label><span class="sr-only">Group title</span><input data-group-title="${group.id}" value="${escapeAttr(group.title)}" maxlength="40" /></label>${state.groups.length>2?`<button class="text-button no-print" type="button" data-science-action="remove-sorting-group" data-group-id="${group.id}">Remove group</button>`:''}</div><div>${group.organismIds.map(getOrganism).filter(Boolean).map((organism) => organismCard(organism, state, { action: 'select-sorting-organism', selected: organism.id === selected, hideName: false })).join('') || '<p class="small muted">No organisms yet</p>'}</div><button class="button secondary no-print" type="button" data-science-action="toggle-group-membership" data-group-id="${group.id}">${group.organismIds.includes(selected) ? 'Remove selected' : 'Place selected here'}</button></section>`).join('')}</div><div class="science-rule-panel"><label><span>What rule did you use?</span><input data-science-field="groupingRule" maxlength="180" value="${escapeAttr(state.groupingRule)}" placeholder="Organisms in Group A…" /></label><label><span>Test against a checkable feature</span><select data-science-field="groupRuleQuestionId">${CLASSIFICATION_QUESTIONS.slice(0, 18).map((item) => `<option value="${item.id}" ${item.id===state.groupRuleQuestionId?'selected':''}>${escapeHTML(item.label)}</option>`).join('')}</select></label><button class="button" type="button" data-science-action="test-group-rule">Test this grouping rule</button>${state.ruleFeedback ? `<p class="science-feedback" role="status">${escapeHTML(state.ruleFeedback)}</p>` : `<p class="science-feedback">An organism may belong to more than one informal group. A scientific rule should be clear enough for another person to check.</p>`}</div></section>`;
}

function renderBackbone(state) {
  const animals = ORGANISMS.filter((item) => item.kingdom === 'animal');
  const organism = animals.find((item) => item.id === state.selectedOrganismId) || animals[0];
  const actual = organism.backbone;
  return `<section class="science-workbench"><div class="backbone-model"><div><p class="eyebrow">Internal support</p><h2>Backbone or no backbone?</h2><p>A vertebrate has an internal backbone. You may need information beyond the surface image.</p></div><div class="backbone-diagram" aria-label="Internal backbone compared with external support"><span class="body-outline"><i class="spine-line"></i></span><span class="body-outline shell-outline"></span><small>internal backbone</small><small>external shell or exoskeleton may support some invertebrates</small></div></div><div class="science-split"><div>${organismDrawer(state, { ids: animals.map((item)=>item.id) })}</div><article class="specimen-table">${renderOrganismIllustration(organism)}<div class="binary-choice" role="group" aria-label="Classify the animal"><button type="button" data-science-action="backbone-guess" data-value="vertebrate" aria-pressed="${state.backboneGuess==='vertebrate'}">Vertebrate</button><button type="button" data-science-action="backbone-guess" data-value="invertebrate" aria-pressed="${state.backboneGuess==='invertebrate'}">Invertebrate</button></div>${state.backboneGuess ? `<p class="science-feedback">${state.backboneGuess === actual ? `${organism.commonName} is a ${actual}. You used known internal structure rather than habitat alone.` : `${organism.commonName} is a ${actual}. A backbone is internal, so use the information card as evidence.`}</p>` : ''}</article></div></section>`;
}

function renderGroupGallery(state, vertebrates = true) {
  const groups = vertebrates ? ['mammal','bird','fish','reptile','amphibian'] : ['insect','arachnid','mollusc','annelid','crustacean','myriapod','echinoderm'];
  const records = ORGANISMS.filter((item) => vertebrates ? item.backbone === 'vertebrate' : item.backbone === 'invertebrate');
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">${vertebrates ? 'Five broad vertebrate groups' : 'Invertebrate diversity'}</p><h2>${vertebrates ? 'Use a combination of characteristics' : 'Invertebrate does not mean insect'}</h2></div></div><div class="science-gallery-groups">${groups.map((group) => { const examples=records.filter((item)=>item.broadGroup===group||item.subgroup===group).slice(0,6); return `<section><h3>${escapeHTML(titleCase(group))}</h3><p>${escapeHTML(({mammal:'Hair or fur at some life stage; young are fed milk.',bird:'Feathers and beaks; birds lay eggs, but not all fly.',fish:'Water-living vertebrates using gills and generally fins.',reptile:'Air-breathing vertebrates with dry scales.',amphibian:'Lives linked to water and land in varied ways; familiar examples have moist skin.',insect:'Six legs and three main adult body sections.',arachnid:'Familiar adults have eight legs; not all arachnids are spiders.',mollusc:'Soft-bodied animals; some have shells and some do not.',annelid:'Segmented worms.',crustacean:'A varied arthropod group including crabs, prawns and woodlice.',myriapod:'Many body segments and many legs, with different leg patterns.',echinoderm:'Marine invertebrates with a five-part body plan in adult forms.'})[group])}</p><div>${examples.map((item)=>organismCard(item,state,{selected:item.id===state.selectedOrganismId})).join('')}</div></section>`; }).join('')}</div></section>`;
}

function renderTreeNode(node, { revealNames = true, activeNodeIds = [] } = {}) {
  if (!node) return '';
  if (node.type === 'result') {
    const names = node.organismIds.map(organismName).join(' / ');
    return `<li class="science-tree-result ${node.complete ? '' : 'is-incomplete'}"><span>${revealNames ? escapeHTML(names) : node.complete ? 'One organism' : `${node.organismIds.length} organisms remain`}</span></li>`;
  }
  const active = activeNodeIds.includes(node.id);
  return `<li class="science-tree-question ${active ? 'is-active' : ''}"><span>${escapeHTML(node.label)}</span><ol><li><b>Yes</b><ol>${renderTreeNode(node.yes, { revealNames, activeNodeIds })}</ol></li><li><b>No</b><ol>${renderTreeNode(node.no, { revealNames, activeNodeIds })}</ol></li></ol></li>`;
}

function renderClassificationTree(tree, options = {}) {
  return `<div class="science-tree-wrap"><ol class="science-tree" aria-label="Branching classification key">${renderTreeNode(tree, options)}</ol></div>`;
}

function renderFollowKey(state) {
  const tree = state.task.tree;
  const mysteryId = state.task.mysteryOrganismId;
  const route = followClassificationTree(tree, mysteryId);
  const visibleHistory = route.history.slice(0, state.routeStep);
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Follow a Classification Key</p><h2>One question, two clear routes</h2></div><div class="cluster no-print"><button class="button secondary" type="button" data-science-action="route-previous" ${state.routeStep<=0?'disabled':''}>Previous</button><button class="button" type="button" data-science-action="route-next" ${state.routeStep>=route.history.length?'disabled':''}>Next question</button></div></div><div class="science-key-layout"><aside><p class="muted">Follow the known features of this organism.</p>${renderOrganismIllustration(getOrganism(mysteryId), { hideName: true })}<ol class="question-history">${visibleHistory.map((item) => `<li><strong>${escapeHTML(item.label)}</strong><span>${item.answer ? 'Yes' : 'No'}</span></li>`).join('') || '<li>Begin at the first question.</li>'}</ol>${state.routeStep>=route.history.length?`<p class="science-feedback">The route identifies <strong>${escapeHTML(organismName(route.result))}</strong>.</p>`:''}</aside>${renderClassificationTree(tree,{revealNames:state.routeStep>=route.history.length,activeNodeIds:visibleHistory.map((item)=>item.nodeId)})}</div></section>`;
}

function builderTree(state) {
  const ids = state.organismIds;
  const questionIds = state.selectedQuestionIds.length ? state.selectedQuestionIds : [];
  return questionIds.length ? buildClassificationTree(ids, { questionIds }) : { id: 'unstarted', type: 'result', organismId: null, organismIds: ids, complete: false };
}

function renderBuildKey(state) {
  const tree = builderTree(state);
  const validation = validateClassificationTree(tree, state.organismIds);
  const remainingQuestions = CLASSIFICATION_QUESTIONS.filter((item) => !state.selectedQuestionIds.includes(item.id)).map((item) => ({ item, validation: validateBinaryQuestion(item, state.organismIds) })).sort((a,b)=>Number(b.validation.valid)-Number(a.validation.valid)||b.validation.usefulness-a.validation.usefulness).slice(0, state.selectedQuestionIds.length ? 12 : 16);
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Classification Key Workshop</p><h2>Build, test and improve a key</h2></div><div class="cluster no-print"><button class="button secondary" type="button" data-science-action="show-blank-key">Blank print template</button><button class="button secondary" type="button" data-science-action="clear-builder">Clear questions</button></div></div><div class="science-key-layout"><aside><h3>Organism set</h3>${organismDrawer(state,{ids:state.organismIds})}<h3>Question cards</h3><div class="question-card-list">${remainingQuestions.map(({item,validation})=>`<button type="button" data-science-action="add-builder-question" data-question-id="${item.id}" ${!validation.valid?'class="is-weak"':''}><strong>${escapeHTML(item.label)}</strong><span>${validation.valid?`Creates ${validation.yesIds.length} / ${validation.noIds.length} branches`:escapeHTML(validation.errors[0])}</span></button>`).join('')}</div><h3>Test my own wording</h3><label class="science-custom-question"><span>Write a yes/no question</span><input data-science-field="customQuestionText" value="${escapeAttr(state.customQuestionText)}" maxlength="180" placeholder="Does it have…?" /></label><button class="button secondary" type="button" data-science-action="validate-custom-question">Check this wording</button>${state.customQuestionFeedback?`<p class="science-feedback" role="status">${escapeHTML(state.customQuestionFeedback)}</p>`:''}</aside><div><div class="selected-question-strip">${state.selectedQuestionIds.map((id,index)=>`<span>${index+1}. ${escapeHTML(getClassificationQuestion(id)?.label||id)}</span>`).join('')||'<p>Choose a first question that creates two clear branches.</p>'}</div>${renderClassificationTree(tree)}<p class="science-feedback" role="status">${validation.valid?'Every organism reaches one unique endpoint. Your complete key is ready to test.':escapeHTML(validation.errors[0]||'Add a useful binary question.')}</p><label class="science-explanation"><span>Why was your first question useful?</span><textarea data-science-field="explanation" maxlength="700">${escapeHTML(state.explanation)}</textarea></label></div></div></section>`;
}

function renderBlankKeyTemplate() {
  const outcome = (label) => `<div class="blank-key-outcome"><span>${label}</span><b>Organism:</b><i></i></div>`;
  return `<section class="science-workbench blank-key-sheet"><div class="science-section-head no-print"><div><p class="eyebrow">Teacher print tool</p><h2>Blank branching-key template</h2></div><div class="cluster"><button class="button secondary" type="button" data-science-action="hide-blank-key">Return to key builder</button><button class="button" type="button" data-action="print-page">Print template</button></div></div><header><p>How Can We Look After Our Planet?</p><h2>My branching classification key</h2><label>Name or group: <span></span></label></header><div class="blank-key-root"><div class="blank-key-question"><b>Question 1</b><span></span></div><div class="blank-key-branches"><section><strong>Yes</strong><div class="blank-key-question"><b>Next question</b><span></span></div><div class="blank-key-pair">${outcome('Yes')}${outcome('No')}</div></section><section><strong>No</strong><div class="blank-key-question"><b>Next question</b><span></span></div><div class="blank-key-pair">${outcome('Yes')}${outcome('No')}</div></section></div></div><footer><p>Test every organism. Does each question have two clear outcomes? Does every route finish at one organism?</p></footer></section>`;
}

function renderBrokenKey(state) {
  const fixture = BROKEN_KEY_CASES.find((item)=>item.id===state.task.fixtureId)||BROKEN_KEY_CASES[0];
  const chosen = getClassificationQuestion(state.repairQuestionId);
  const repair = chosen ? validateBinaryQuestion(chosen, fixture ? state.task.organismIds : []) : null;
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Broken Key Laboratory</p><h2>${escapeHTML(fixture.title)}</h2></div></div><div class="broken-key-panel"><div class="fault-card"><p class="eyebrow">Before</p><strong>${escapeHTML(fixture.customFault || getClassificationQuestion(fixture.faultyQuestionId)?.label || 'Incomplete branch')}</strong><p>${escapeHTML(fixture.fault)}</p></div><div class="repair-arrow" aria-hidden="true">→</div><div class="repair-card"><p class="eyebrow">Choose a repair</p>${fixture.repairQuestionIds.map((id)=>{const q=getClassificationQuestion(id);return `<button type="button" data-science-action="choose-repair" data-question-id="${id}" aria-pressed="${state.repairQuestionId===id}">${escapeHTML(q.label)}</button>`;}).join('')}</div></div>${state.repairQuestionId?`<p class="science-feedback">${repair?.valid?`This repair sends organisms down both branches (${repair.yesIds.length} yes / ${repair.noIds.length} no). Retest later branches to finish the whole key.`:escapeHTML(repair?.errors[0]||'This question needs another check.')}</p>`:''}${organismDrawer(state,{ids:state.task.organismIds})}</section>`;
}

function renderMystery(state) {
  const remaining = state.remainingOrganismIds;
  const mystery = getOrganism(state.task.mysteryOrganismId);
  const questions = CLASSIFICATION_QUESTIONS.map((item)=>({item,validation:validateBinaryQuestion(item,remaining)})).filter(({validation})=>validation.valid).sort((a,b)=>b.validation.usefulness-a.validation.usefulness).slice(0,12);
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Mystery Organism</p><h2>Choose questions that narrow the possibilities</h2></div><span class="remaining-count">${remaining.length} remaining</span></div><div class="science-key-layout"><aside>${renderOrganismIllustration(mystery,{hideName:remaining.length>1})}<ol class="question-history">${state.questionHistory.map((item)=>`<li><strong>${escapeHTML(item.label)}</strong><span>${item.answer?'Yes':'No'} · ${item.remaining} remain</span></li>`).join('')||'<li>No questions yet.</li>'}</ol></aside><div><div class="mystery-remaining">${organismDrawer(state,{ids:remaining})}</div>${remaining.length>1?`<div class="question-card-list">${questions.map(({item,validation})=>`<button type="button" data-science-action="ask-mystery-question" data-question-id="${item.id}"><strong>${escapeHTML(item.label)}</strong><span>could divide ${validation.yesIds.length} / ${validation.noIds.length}</span></button>`).join('')}</div>`:`<p class="science-feedback">The evidence identifies ${escapeHTML(mystery.commonName)}. The number of questions is information, not a speed score.</p>`}</div></div></section>`;
}

function renderHabitat(state) {
  const habitat = getHabitat(state.habitatId) || HABITATS[0];
  const possible = organismsForHabitat(habitat.id).slice(0,12);
  const selected = possible.find((item)=>item.id===state.selectedOrganismId) || possible[0];
  const needs = selected ? habitatNeedsFor(selected) : [];
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Habitat Windows</p><h2>What might this place provide?</h2></div><select data-science-field="habitatId" aria-label="Choose habitat">${HABITATS.map((item)=>`<option value="${item.id}" ${item.id===habitat.id?'selected':''}>${escapeHTML(item.title)}</option>`).join('')}</select></div><div class="habitat-window habitat-window--${escapeAttr(habitat.id)}"><div><h3>${escapeHTML(habitat.title)}</h3><p>${escapeHTML(habitat.description)}</p></div><div class="habitat-resource-grid"><section><h4>Conditions</h4>${habitat.conditions.map((item)=>`<span>${escapeHTML(item)}</span>`).join('')}</section><section><h4>Resources</h4>${habitat.resources.map((item)=>`<span>${escapeHTML(item)}</span>`).join('')}</section></div></div><h3>Organisms that may use this habitat</h3><p class="small muted">This is not an exclusive “correct home”. Many organisms use several connected habitats.</p>${organismDrawer(state,{ids:possible.map((item)=>item.id)})}${selected?`<p class="science-feedback"><strong>${escapeHTML(selected.commonName)}</strong> needs ${escapeHTML(needs.slice(0,4).join(', '))}. This habitat records ${escapeHTML(habitat.resources.slice(0,2).join(' and '))}; that is relevant evidence, but it does not prove every need is met.</p>`:''}<label class="science-explanation"><span>Connect a condition or resource to an organism need</span><textarea data-science-field="explanation" maxlength="700" placeholder="This habitat contains… which may help…">${escapeHTML(state.explanation)}</textarea></label><div class="cross-link-strip no-print">${habitat.atlasLinks.length?habitat.atlasLinks.map((placeId)=>`<button type="button" data-route="atlas" data-atlas-focus="${escapeAttr(placeId)}">Open ${escapeHTML(titleCase(placeId))} in Atlas</button>`).join(''):'<button type="button" data-route="atlas">Compare a researched place in Atlas</button>'}<span>A map location is context, not proof that a species is present.</span></div></section>`;
}

function renderMicrohabitat(state) {
  const micro = MICROHABITATS.find((item)=>item.id===state.microhabitatId)||MICROHABITATS[0];
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Look closer</p><h2>One larger habitat contains smaller habitats</h2></div><select data-science-field="microhabitatId">${MICROHABITATS.map((item)=>`<option value="${item.id}" ${item.id===micro.id?'selected':''}>${escapeHTML(item.title)}</option>`).join('')}</select></div><div class="microhabitat-transition"><div class="large-habitat-map"><span>larger habitat</span><i></i></div><div class="magnify-arrow">Look closer →</div><div class="microhabitat-window"><h3>${escapeHTML(micro.title)}</h3>${micro.conditions.map((item)=>`<span>${escapeHTML(item)}</span>`).join('')}</div></div>${organismDrawer(state,{ids:micro.likelyOrganismIds})}<label class="science-explanation"><span>My microhabitat observation</span><textarea data-science-field="observationText" maxlength="700" placeholder="The conditions here differ because…">${escapeHTML(state.observationText)}</textarea></label></section>`;
}

function modelControl(state, field, label, values) {
  return `<label><span>${label}</span><select data-habitat-model="${field}">${values.map(([value,title])=>`<option value="${value}" ${state.habitatModel[field]===value?'selected':''}>${title}</option>`).join('')}</select></label>`;
}

function renderHabitatBuilder(state) {
  const organism = selectedOrganism(state);
  const evaluation = evaluateHabitatModel(state.habitatModel, organism);
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Habitat Builder</p><h2>A simplified model for testing needs</h2></div></div><div class="habitat-builder-grid"><div class="habitat-controls">${modelControl(state,'water','Water',[['none','No visible water'],['some','Some water'],['body','Pond, river or sea water']])}${modelControl(state,'vegetation','Vegetation',[['none','Little vegetation'],['some','Some plant cover'],['dense','Dense plant cover']])}${modelControl(state,'shelter','Shelter',[['none','Little shelter'],['some','Some shelter'],['many','Many shelter spaces']])}${modelControl(state,'ground','Ground',[['soil','Soil'],['rock','Rock or wall'],['sand','Sand'],['mud','Mud']])}${modelControl(state,'temperature','Temperature',[['cold','Cold'],['mild','Mild'],['warm','Warm']])}${modelControl(state,'light','Light',[['dark','Dark'],['mixed','Mixed'],['bright','Bright']])}${modelControl(state,'disturbance','Disturbance',[['low','Low'],['some','Some'],['high','High']])}${modelControl(state,'space','Space',[['small','Small patch'],['medium','Connected patch'],['large','Large connected area']])}</div><div class="built-habitat" data-water="${state.habitatModel.water}" data-vegetation="${state.habitatModel.vegetation}" data-shelter="${state.habitatModel.shelter}"><span class="built-sky"></span><span class="built-ground"></span><span class="built-water"></span><span class="built-plants"></span><span class="built-shelter"></span><div class="selected-built-organism">${renderOrganismIllustration(organism,{compact:true})}</div></div></div><h3>Choose an organism to test</h3>${organismDrawer(state,{ids:state.task.organismIds})}<div class="science-feedback"><strong>Needs to consider:</strong> ${escapeHTML(evaluation.needs.join(', '))}.<br>${escapeHTML(evaluation.statement)}</div><label class="science-explanation"><span>My evidence</span><textarea data-science-field="explanation" maxlength="700">${escapeHTML(state.explanation)}</textarea></label></section>`;
}

function renderChangeLab(state) {
  const scenario = CHANGE_SCENARIOS.find((item)=>item.id===state.scenarioId)||CHANGE_SCENARIOS[0];
  const candidateIds = organismsForHabitat(scenario.habitatId).slice(0,8).map((item)=>item.id);
  const selectedIds = state.compareOrganismIds.filter((id)=>candidateIds.includes(id)).slice(0,3);
  const compareIds = selectedIds.length ? selectedIds : candidateIds.slice(0,state.activityId==='different-living-things-effects'?3:1);
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Change Laboratory</p><h2>Change one condition. Keep certainty in proportion.</h2></div><select data-science-field="scenarioId">${CHANGE_SCENARIOS.map((item)=>`<option value="${item.id}" ${item.id===scenario.id?'selected':''}>${escapeHTML(item.title)}</option>`).join('')}</select></div><div class="change-thread"><span><b>What changed?</b>${escapeHTML(scenario.change)}</span><i>→</i><span><b>Condition</b>${escapeHTML(scenario.condition)}</span><i>→</i><span><b>Resource or need</b>${escapeHTML(scenario.resource)}</span><i>→</i><span><b>Possible response</b>${escapeHTML(scenario.possibleEffects[0])}</span></div><div class="science-evidence-grid"><section><h3>We observed</h3><p>${escapeHTML(scenario.evidence)}</p><textarea data-science-field="evidenceStatement" placeholder="What does the model directly show?">${escapeHTML(state.evidenceStatement)}</textarea></section><section><h3>We know</h3><p>Organism records provide relevant group, feature and habitat information.</p><textarea data-science-field="knownStatement" placeholder="What established information matters?">${escapeHTML(state.knownStatement)}</textarea></section><section><h3>We predict</h3><p>Use may, could, is likely to or depends on.</p><textarea data-science-field="predictionStatement" placeholder="One possible effect may be…">${escapeHTML(state.predictionStatement)}</textarea></section><section><h3>We are unsure</h3><p>${escapeHTML(scenario.uncertainty)}</p><textarea data-science-field="uncertaintyStatement" placeholder="We still need to know…">${escapeHTML(state.uncertaintyStatement)}</textarea></section></div><h3>Compare possible responses</h3>${organismDrawer(state,{ids:candidateIds,action:'toggle-compare',selectedIds:compareIds})}<div class="response-comparison">${compareIds.map((id,index)=>{const organism=getOrganism(id);const needs=habitatNeedsFor(organism);return `<article>${renderOrganismIllustration(organism,{compact:true})}<p><strong>${escapeHTML(organism.commonName)}</strong> may respond differently because ${escapeHTML(needs.slice(0,2).join(' and '))} matter to it. ${escapeHTML(scenario.possibleEffects[index%scenario.possibleEffects.length])}</p><small>This is a plausible prediction linked to recorded needs, not a confirmed outcome.</small></article>`;}).join('')}</div></section>`;
}

function renderSurvey(state) {
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Survey Builder</p><h2>Count locally without sending data away</h2></div><select data-science-field="surveyMode"><option value="child-entered-data" ${state.surveyMode==='child-entered-data'?'selected':''}>Child-entered data</option><option value="fictional-learning-data" ${state.surveyMode==='fictional-learning-data'?'selected':''}>Fictional learning data</option></select></div><div class="survey-meta"><label><span>Broad location label</span><input data-science-field="surveyLocation" maxlength="60" value="${escapeAttr(state.surveyLocation)}" /></label><label><span>Date</span><input type="date" data-science-field="surveyDate" value="${escapeAttr(state.surveyDate)}" /></label><label class="no-print"><span>Optional local photograph</span><input type="file" accept="image/*" capture="environment" data-science-photo /></label></div><p class="small muted">Do not add an address or precise coordinates. Data stays on this device.</p><div class="survey-table" role="table"><div role="row"><b role="columnheader">Organism</b><b role="columnheader">Tally</b><b role="columnheader">Total</b><b class="no-print" role="columnheader">Change</b></div>${state.surveyRows.map((row,index)=>`<div role="row"><span role="cell">${escapeHTML(organismName(row.organismId))}</span><span role="cell" class="tally-marks" aria-label="Tally ${row.count}">${escapeHTML('|||| '.repeat(Math.floor(row.count/5))+'|'.repeat(row.count%5))||'—'}</span><strong role="cell">${row.count}</strong><span class="cluster no-print" role="cell"><button type="button" data-science-action="survey-count" data-index="${index}" data-delta="-1" aria-label="Remove one ${escapeAttr(organismName(row.organismId))}">−</button><button type="button" data-science-action="survey-count" data-index="${index}" data-delta="1" aria-label="Add one ${escapeAttr(organismName(row.organismId))}">+</button></span></div>`).join('')}</div>${state.photoDataUrl?`<img class="survey-photo" src="${escapeAttr(state.photoDataUrl)}" alt="Local survey photograph chosen by the learner" />`:''}<label class="science-explanation"><span>What does the survey show, and what can it not prove?</span><textarea data-science-field="explanation" maxlength="700">${escapeHTML(state.explanation)}</textarea></label><div class="cross-link-strip no-print"><button type="button" data-route="number-tool" data-route-value="compare-numbers">Compare totals in Number Expedition</button><span>These values are clearly labelled ${escapeHTML(state.surveyMode.replaceAll('-', ' '))}.</span></div></section>`;
}

function renderChallenge(state) {
  const contextualControls = state.challengeType === 'broken-key'
    ? `<label class="science-challenge-option"><span>Deliberate fault</span><select data-science-field="challengeFaultId">${BROKEN_KEY_CASES.map((item)=>`<option value="${item.id}" ${state.challengeFaultId===item.id?'selected':''}>${escapeHTML(item.title)}</option>`).join('')}</select></label>`
    : state.challengeType === 'habitat'
      ? `<label class="science-challenge-option"><span>Habitat evidence</span><select data-science-field="habitatId">${HABITATS.map((item)=>`<option value="${item.id}" ${state.habitatId===item.id?'selected':''}>${escapeHTML(item.title)}</option>`).join('')}</select></label>`
      : state.challengeType === 'change'
        ? `<label class="science-challenge-option"><span>Environmental change</span><select data-science-field="scenarioId">${CHANGE_SCENARIOS.map((item)=>`<option value="${item.id}" ${state.scenarioId===item.id?'selected':''}>${escapeHTML(item.title)}</option>`).join('')}</select></label>`
        : '';
  return `<section class="science-workbench"><div class="science-section-head"><div><p class="eyebrow">Create a Scientific Challenge</p><h2>Build something another scientist can test</h2></div></div><div class="challenge-types">${[['comparison','Compare two organisms'],['sorting','Create a sorting set'],['mystery','Mystery Organism'],['key','Branching key'],['broken-key','Broken branch to repair'],['habitat','Habitat-needs puzzle'],['change','Change-and-prediction chain']].map(([id,title])=>`<button type="button" data-science-action="challenge-type" data-value="${id}" aria-pressed="${state.challengeType===id}">${title}</button>`).join('')}</div>${contextualControls}<h3>Choose the visible organism set</h3>${organismDrawer(state,{ids:state.organismIds,action:'toggle-compare',selectedIds:state.compareOrganismIds})}<label class="science-explanation"><span>Instructions and evidence</span><textarea data-science-field="explanation" maxlength="700" placeholder="Use the visible set to…">${escapeHTML(state.explanation)}</textarea></label><p class="science-feedback">The challenge stays on this device. Organism IDs, question routes, habitat or change records, and selected evidence are checked before saving.</p></section>`;
}

function renderToolModel(state, tool, activity = null) {
  if (['browser','observation'].includes(tool.mode)) return renderOrganismBrowser(state, Boolean(activity));
  if (tool.mode === 'compare') return renderComparison(state);
  if (['sorting','rule-test'].includes(tool.mode)) return renderSorting(state);
  if (tool.mode === 'backbone') return renderBackbone(state);
  if (tool.mode === 'vertebrates') return renderGroupGallery(state, true);
  if (tool.mode === 'invertebrates') return renderGroupGallery(state, false);
  if (tool.mode === 'follow-key') return renderFollowKey(state);
  if (tool.mode === 'build-key') return state.printBlankTemplate ? renderBlankKeyTemplate() : renderBuildKey(state);
  if (tool.mode === 'broken-key') return renderBrokenKey(state);
  if (tool.mode === 'mystery') return renderMystery(state);
  if (tool.mode === 'habitat') return renderHabitat(state);
  if (tool.mode === 'microhabitat') return renderMicrohabitat(state);
  if (tool.mode === 'habitat-builder') return renderHabitatBuilder(state);
  if (tool.mode === 'change') return renderChangeLab(state);
  if (tool.mode === 'survey') return renderSurvey(state);
  return renderChallenge(state);
}

function renderGuidedActivityGuide(activity) {
  if (!activity) return '';
  return `<section class="science-guided-guide" aria-label="Guided scientific pathway"><article><p class="eyebrow">Notice</p><p>${escapeHTML(activity.flow.notice.prompt)}</p></article><article><p class="eyebrow">Explore</p><p>${escapeHTML(activity.flow.explore.prompt)}</p></article><article><p class="eyebrow">Make</p><p>${escapeHTML(activity.flow.make.product)}</p></article><article><p class="eyebrow">Explain</p><p>${escapeHTML(activity.flow.explain.prompt)}</p></article><details><summary>Optional Key Check · unscored</summary><p>${escapeHTML(activity.keyCheck.prompt)}</p><p class="small muted">The check names the scientific reasoning. It has no grade, percentage, pass or fail.</p></details></section>`;
}

function renderHome() {
  return `<section class="page living-things-home" aria-labelledby="living-things-title"><header class="science-destination-head"><div><p class="eyebrow">Open exploration · no key needed</p><h1 id="living-things-title">Living Things Observatory</h1><p class="lede">Observe → Evidence → Grouping → Classification → Connection → Change</p><p>Move freely. The regions describe kinds of scientific thinking, not compulsory levels.</p></div><div class="observatory-emblem" aria-hidden="true"><i></i><b></b><em></em></div></header><div class="science-region-map">${SCIENCE_REGIONS.map((region,index)=>`<section class="science-region" data-accent="${region.accent}"><div class="science-region-number">${index+1}</div><div><p class="eyebrow">${region.mark}</p><h2>${escapeHTML(region.title)}</h2><p>${escapeHTML(region.description)}</p></div><div class="science-tool-list">${SCIENCE_TOOLS.filter((tool)=>tool.regionId===region.id).map((tool)=>`<button type="button" data-route="science-tool" data-route-value="${tool.id}"><strong>${escapeHTML(tool.title)}</strong><span>${escapeHTML(tool.invitation)}</span></button>`).join('')}</div></section>`).join('')}</div><footer class="science-open-note"><strong>Everything here is open.</strong><span>Today’s Key simply points towards one especially deliberate pathway.</span></footer></section>`;
}

function scienceStateForSave(state) {
  const safe = clone(state);
  safe.board = false;
  safe.boardStep = 0;
  safe.printBlankTemplate = false;
  if (safe.photoDataUrl?.length > 1_600_000) safe.photoDataUrl = '';
  return safe;
}

function brokenKeyRepairData(state) {
  if (state.mode !== 'broken-key') return null;
  const fixture = BROKEN_KEY_CASES.find((item)=>item.id===state.task.fixtureId) || null;
  const repair = getClassificationQuestion(state.repairQuestionId);
  const validation = repair ? validateBinaryQuestion(repair, state.task.organismIds) : null;
  return {
    fixtureId: fixture?.id || state.task.fixtureId || null,
    before: fixture ? {
      questionId: fixture.faultyQuestionId || null,
      wording: fixture.customFault || getClassificationQuestion(fixture.faultyQuestionId)?.label || 'Incomplete branch',
      fault: fixture.fault,
    } : null,
    after: repair ? {
      questionId: repair.id,
      wording: repair.label,
      validForSelectedSet: Boolean(validation?.valid),
      yesOrganismIds: validation?.yesIds || [],
      noOrganismIds: validation?.noIds || [],
    } : null,
  };
}

function scienceChallengeData(state) {
  const selectedIds = [...new Set(state.compareOrganismIds || [])];
  const errors = [];
  const minimum = ({ comparison: 2, sorting: 4, mystery: 4, key: 4, 'broken-key': 0, habitat: 1, change: 2 })[state.challengeType] ?? 1;
  const records = selectedIds.map(getOrganism).filter(Boolean);
  if (records.length !== selectedIds.length) errors.push('One selected organism record is no longer available.');
  if (selectedIds.length < minimum) errors.push(`Choose at least ${minimum} organism${minimum===1?'':'s'} for this kind of challenge.`);
  if (String(state.explanation || '').trim().length < 8) errors.push('Add clear instructions and the evidence another scientist should use.');

  let branchLogic = null;
  let brokenKey = null;
  if (state.challengeType === 'key' && selectedIds.length >= minimum) {
    branchLogic = buildClassificationTree(selectedIds);
    const validation = validateClassificationTree(branchLogic, selectedIds);
    if (!validation.valid) errors.push(...validation.errors);
  }
  if (state.challengeType === 'mystery' && selectedIds.length >= minimum) {
    branchLogic = buildClassificationTree(selectedIds);
    const validation = validateClassificationTree(branchLogic, selectedIds);
    if (!validation.valid) errors.push(...validation.errors);
  }
  if (state.challengeType === 'broken-key') {
    const fixture = BROKEN_KEY_CASES.find((item)=>item.id===state.challengeFaultId);
    const set = fixture ? getClassificationSet(fixture.setId) : null;
    if (!fixture || !set || !fixture.repairQuestionIds.every(getClassificationQuestion)) errors.push('Choose a complete broken-key case that another scientist can repair.');
    else brokenKey = { ...fixture, organismIds: [...set.organismIds] };
  }
  const habitat = state.challengeType === 'habitat' ? getHabitat(state.habitatId) : null;
  if (state.challengeType === 'habitat' && !habitat) errors.push('Choose a habitat with checked resource evidence.');
  const scenario = state.challengeType === 'change' ? CHANGE_SCENARIOS.find((item)=>item.id===state.scenarioId) : null;
  if (state.challengeType === 'change' && !scenario) errors.push('Choose a complete environmental-change scenario.');

  return {
    valid: errors.length === 0,
    errors,
    type: state.challengeType,
    selectedOrganismIds: state.challengeType === 'broken-key' ? (brokenKey?.organismIds || []) : selectedIds,
    instructions: String(state.explanation || '').trim(),
    mysteryOrganismId: state.challengeType === 'mystery' ? selectedIds[0] || null : null,
    branchLogic,
    brokenKey,
    habitatId: habitat?.id || null,
    habitatEvidence: habitat ? { resources: [...habitat.resources], conditions: [...habitat.conditions] } : null,
    scenarioId: scenario?.id || null,
    scenarioEvidence: scenario ? { change: scenario.change, evidence: scenario.evidence, uncertainty: scenario.uncertainty } : null,
  };
}

function savePayload(state, tool, activity) {
  const title = activity?.title || `${tool.title} · ${state.selectedOrganismId ? organismName(state.selectedOrganismId) : 'Scientific record'}`;
  const artefactType = activity?.outcome?.artefactTypeId || tool.artefactTypeId;
  const challengeData = tool.mode === 'challenge' ? scienceChallengeData(state) : null;
  const referencedOrganismIds = [...new Set([
    ...(state.organismIds || []),
    ...(state.compareOrganismIds || []),
    ...(challengeData?.selectedOrganismIds || []),
  ])];
  const structuredContent = {
    scienceState: scienceStateForSave(state),
    organismIds: referencedOrganismIds,
    selectedFeatures: [...(state.selectedFeatureIds || [])],
    groupingRule: state.groupingRule,
    groupMemberships: state.groups,
    branchLogic: ['build-key','follow-key'].includes(tool.mode) ? (tool.mode==='build-key'?builderTree(state):state.task.tree) : null,
    questionHistory: state.questionHistory,
    habitatData: { habitatId: state.habitatId, microhabitatId: state.microhabitatId, model: state.habitatModel },
    changeScenario: state.scenarioId ? { scenarioId: state.scenarioId, evidence: state.evidenceStatement, known: state.knownStatement, prediction: state.predictionStatement, uncertain: state.uncertaintyStatement } : null,
    surveyRows: state.surveyRows,
    dataProvenance: state.surveyMode,
    generatorSeed: state.seed,
    beforeAfterRepair: brokenKeyRepairData(state),
    challengeData,
    assetReferences: referencedOrganismIds.map((id)=>getOrganism(id)).filter(Boolean).map((organism)=>({ organismId: organism.id, imageId: `illustration-${organism.illustrationKey}`, localPath: `inline-svg:${organism.illustrationKey}`, licence: organism.imageRights.licence, attribution: organism.imageRights.attribution })),
    linkedPlaceIds: (getHabitat(state.habitatId)?.atlasLinks || []).map(atlasRecordId),
    linkedMathematicsToolIds: tool.mode === 'survey' ? ['compare-numbers'] : [],
    savedAt: new Date().toISOString(),
  };
  return {
    destinationId: 'living-things-observatory',
    activityId: activity?.id || `open-science-${tool.id}`,
    keyActivityId: activity?.id || null,
    title,
    artefactType,
    curriculumTags: activity?.curriculumTags || ['science','year-4','living-things',tool.mode],
    conceptTags: activity?.conceptTags || ['living-things','classification',tool.regionId],
    structuredContent,
    preview: { label: title, type: 'science', organismIds: structuredContent.organismIds.slice(0,3) },
    writtenExplanation: state.explanation || state.observationText || state.predictionStatement || '',
  };
}

function renderBoard(state, tool, activity) {
  return `<div class="science-board-view" role="dialog" aria-modal="true" aria-label="Living Things Observatory Board View"><header><div><p class="eyebrow">Board View · anonymous model</p><h1>${escapeHTML(activity?.title || tool.title)}</h1></div><button type="button" data-science-action="close-board">Exit Board View</button></header><main>${renderToolModel(state,tool,activity)}</main><footer><button type="button" data-science-action="board-previous">Previous</button><span>Step ${state.boardStep+1}</span><button type="button" data-science-action="board-next">Next</button><button type="button" data-science-action="board-reset">Reset</button></footer></div>`;
}

export class LivingThingsObservatory {
  constructor(host, { toolId = null, activity = null, savedState = null, scaffold = 'core', onChange, onSave, onSpeak, onRecord, onToast } = {}) {
    if (!host) throw new TypeError('Living Things Observatory needs a host.');
    this.host = host;
    this.tool = getScienceTool(activity?.toolId || toolId);
    this.activity = activity;
    this.scaffold = scaffold;
    this.onChange = onChange;
    this.onSave = onSave;
    this.onSpeak = onSpeak;
    this.onRecord = onRecord;
    this.onToast = onToast;
    this.state = this.tool ? defaultScienceState(this.tool, activity, savedState, scaffold) : null;
    this.boardSnapshot = null;
    this.history = [];
    this.future = [];
    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.host.addEventListener('click', this.handleClick);
    this.host.addEventListener('input', this.handleInput);
    this.host.addEventListener('change', this.handleChange);
    this.host.addEventListener('keydown', this.handleKeyDown);
    this.render();
  }

  snapshot() { return this.state ? clone(this.state) : null; }

  notify(action, detail = {}) {
    if (!this.state || this.state.board) return;
    this.state.childActions = [...(this.state.childActions || []), { action, detail, at: Date.now() }].slice(-80);
    this.onChange?.(this.snapshot());
  }

  update(mutator, action = 'changed-science-model', detail = {}) {
    this.history.push(this.snapshot());
    this.history = this.history.slice(-40);
    this.future = [];
    mutator(this.state);
    this.notify(action, detail);
    this.render();
  }

  handleInput(event) {
    const field = event.target.dataset.scienceField;
    if (field && this.state && field in this.state) {
      this.state[field] = event.target.value;
      this.notify('edited-science-response', { field });
    }
    const groupId = event.target.dataset.groupTitle;
    if (groupId) {
      const group = this.state.groups.find((item)=>item.id===groupId);
      if (group) group.title = event.target.value;
      this.notify('renamed-science-group',{groupId});
    }
  }

  handleChange(event) {
    const field = event.target.dataset.scienceField;
    if (field && this.state && field in this.state) {
      this.state[field] = event.target.value;
      if (field === 'scenarioId') this.state.compareOrganismIds = organismsForHabitat(CHANGE_SCENARIOS.find((item)=>item.id===event.target.value)?.habitatId).slice(0,3).map((item)=>item.id);
      this.notify('changed-science-option', { field, value: event.target.value });
      this.render();
    }
    const modelField = event.target.dataset.habitatModel;
    if (modelField) this.update((state)=>{state.habitatModel[modelField]=event.target.value;},'changed-habitat-condition',{field:modelField});
    if (event.target.matches('[data-science-photo]') && event.target.files?.[0]) this.readPhoto(event.target.files[0]);
  }

  async readPhoto(file) {
    if (!file.type.startsWith('image/') || file.size > 2_000_000) {
      this.onToast?.('Choose an image smaller than 2 MB. No file was saved.');
      return;
    }
    const dataUrl = await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
    this.update((state)=>{state.photoDataUrl=String(dataUrl);},'added-local-survey-photo');
  }

  handleKeyDown(event) {
    if (!this.state?.board) return;
    if (event.key === 'Escape') { event.preventDefault(); this.closeBoard(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); this.state.boardStep += 1; this.render(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); this.state.boardStep = Math.max(0,this.state.boardStep-1); this.render(); }
  }

  handleClick(event) {
    const button = event.target.closest('[data-science-action]');
    if (!button || !this.host.contains(button)) return;
    const action = button.dataset.scienceAction;
    const organismId = button.dataset.organismId;
    if (action === 'back-home') globalThis.location.hash = '#/living-things';
    if (action === 'new-task') this.newTask();
    if (action === 'open-board') this.openBoard();
    if (action === 'close-board') this.closeBoard();
    if (action === 'board-next') { this.state.boardStep += 1; this.render(); }
    if (action === 'board-previous') { this.state.boardStep=Math.max(0,this.state.boardStep-1); this.render(); }
    if (action === 'board-reset') { this.state.boardStep=0; this.render(); }
    if (action === 'save-science') this.save();
    if (action === 'record-science') this.onRecord?.(button);
    if (action === 'speak-name') this.onSpeak?.(button.dataset.speak || organismName(this.state.selectedOrganismId));
    if (action === 'select-organism' && organismId) this.update((state)=>{state.selectedOrganismId=organismId;},'selected-organism',{organismId});
    if (action === 'browser-filter') this.update((state)=>{state.browserFilter=button.dataset.value;},'filtered-organism-drawer',{filter:button.dataset.value});
    if (action === 'toggle-name') this.update((state)=>{state.hideNames=!state.hideNames;},'toggled-organism-name');
    if (action === 'toggle-silhouette') this.update((state)=>{state.silhouette=!state.silhouette;},'toggled-organism-silhouette');
    if (action === 'toggle-zoom') this.update((state)=>{state.zoom=!state.zoom;},'toggled-observation-zoom');
    if (action === 'toggle-feature') this.update((state)=>{const id=button.dataset.value;state.selectedFeatureIds=state.selectedFeatureIds.includes(id)?state.selectedFeatureIds.filter((item)=>item!==id):[...state.selectedFeatureIds,id];},'selected-evidence-feature',{feature:button.dataset.value});
    if (action === 'toggle-compare' && organismId) this.update((state)=>{const limit=state.mode==='challenge'?8:3;state.compareOrganismIds=state.compareOrganismIds.includes(organismId)?state.compareOrganismIds.filter((id)=>id!==organismId):[...state.compareOrganismIds,organismId].slice(-limit);},'changed-comparison-set',{organismId});
    if (action === 'select-sorting-organism' && organismId) this.update((state)=>{state.selectedSortingOrganismId=organismId;},'selected-sorting-organism',{organismId});
    if (action === 'toggle-group-membership') this.update((state)=>{const group=state.groups.find((item)=>item.id===button.dataset.groupId);const id=state.selectedSortingOrganismId;if(group&&id)group.organismIds=group.organismIds.includes(id)?group.organismIds.filter((item)=>item!==id):[...group.organismIds,id];},'changed-group-membership',{groupId:button.dataset.groupId});
    if (action === 'add-sorting-group') this.update((state)=>{if(state.groups.length<5){let number=3;while(state.groups.some((group)=>group.id===`group-${number}`))number+=1;state.groups.push({id:`group-${number}`,title:`Group ${number}`,organismIds:[]});}},'added-science-group');
    if (action === 'remove-sorting-group') this.update((state)=>{if(state.groups.length>2)state.groups=state.groups.filter((group)=>group.id!==button.dataset.groupId);},'removed-science-group',{groupId:button.dataset.groupId});
    if (action === 'test-group-rule') this.testGroupRule();
    if (action === 'backbone-guess') this.update((state)=>{state.backboneGuess=button.dataset.value;},'classified-backbone',{guess:button.dataset.value});
    if (action === 'route-next') this.update((state)=>{state.routeStep=Math.min(followClassificationTree(state.task.tree,state.task.mysteryOrganismId).history.length,state.routeStep+1);},'followed-key-branch');
    if (action === 'route-previous') this.update((state)=>{state.routeStep=Math.max(0,state.routeStep-1);},'revisited-key-branch');
    if (action === 'add-builder-question') this.update((state)=>{state.selectedQuestionIds=[...state.selectedQuestionIds,button.dataset.questionId];},'added-key-question',{questionId:button.dataset.questionId});
    if (action === 'clear-builder') this.update((state)=>{state.selectedQuestionIds=[];},'cleared-key-builder');
    if (action === 'validate-custom-question') this.validateCustomQuestion();
    if (action === 'show-blank-key') this.update((state)=>{state.printBlankTemplate=true;},'opened-blank-key-template');
    if (action === 'hide-blank-key') this.update((state)=>{state.printBlankTemplate=false;},'closed-blank-key-template');
    if (action === 'choose-repair') this.update((state)=>{state.repairQuestionId=button.dataset.questionId;},'repaired-key-question',{questionId:button.dataset.questionId});
    if (action === 'ask-mystery-question') this.askMysteryQuestion(button.dataset.questionId);
    if (action === 'survey-count') this.update((state)=>{const row=state.surveyRows[Number(button.dataset.index)];if(row){row.count=Math.max(0,row.count+Number(button.dataset.delta));row.tally=row.count;}},'changed-survey-tally');
    if (action === 'challenge-type') this.update((state)=>{state.challengeType=button.dataset.value;},'changed-challenge-type');
    if (action === 'undo-science') this.undo();
    if (action === 'redo-science') this.redo();
  }

  validateCustomQuestion() {
    const analysis = analyseCustomQuestion(this.state.customQuestionText, this.state.organismIds);
    this.update((state)=>{state.customQuestionFeedback=analysis.valid
      ? 'This has a clear yes/no form. Match it to a checked feature card before using it in a key.'
      : analysis.errors[0];},'validated-child-question',{valid:analysis.valid});
  }

  undo() {
    const previous = this.history.pop();
    if (!previous) return;
    this.future.push(this.snapshot());
    this.state = previous;
    this.onChange?.(this.snapshot());
    this.render();
  }

  redo() {
    const next = this.future.pop();
    if (!next) return;
    this.history.push(this.snapshot());
    this.state = next;
    this.onChange?.(this.snapshot());
    this.render();
  }

  testGroupRule() {
    const q = getClassificationQuestion(this.state.groupRuleQuestionId);
    const groupA = this.state.groups[0];
    const groupB = this.state.groups[1];
    const wrongA = groupA.organismIds.filter((id)=>!questionAnswer(getOrganism(id),q));
    const wrongB = groupB.organismIds.filter((id)=>questionAnswer(getOrganism(id),q));
    this.update((state)=>{state.ruleFeedback=wrongA.length||wrongB.length?`${[...wrongA,...wrongB].map(organismName).join(', ')} does not follow the selected yes/no rule in its current group. Revise the rule or move the organism.`:`Every organism follows “${q.label}” in the current two-group arrangement. Test it with a new organism next.`;},'tested-group-rule',{questionId:q.id});
  }

  askMysteryQuestion(questionId) {
    const q = getClassificationQuestion(questionId);
    const mystery = getOrganism(this.state.task.mysteryOrganismId);
    const answer = questionAnswer(mystery,q);
    this.update((state)=>{state.remainingOrganismIds=state.remainingOrganismIds.filter((id)=>questionAnswer(getOrganism(id),q)===answer);state.questionHistory=[...state.questionHistory,{questionId:q.id,label:q.label,answer,remaining:state.remainingOrganismIds.length}];},'asked-mystery-question',{questionId,answer});
  }

  newTask() {
    const seed = `${this.tool.id}-${Date.now()}-${(this.state.childActions||[]).length}`;
    const next = defaultScienceState(this.tool,this.activity,null,this.scaffold);
    next.seed=seed;
    next.task=generateScienceTask(this.tool.mode,seed,{scaffold:this.scaffold});
    next.organismIds=(next.task.organismIds||next.task.rows?.map((row)=>row.organismId)||next.organismIds).slice(0,scaffoldLimit(this.scaffold));
    next.selectedOrganismId=next.organismIds[0]||ORGANISMS[0].id;
    next.compareOrganismIds=next.organismIds.slice(0,2);
    next.groups=defaultGroups(next.organismIds);
    next.remainingOrganismIds=[...next.organismIds];
    this.history.push(this.snapshot());
    this.history=this.history.slice(-40);
    this.future=[];
    this.state=next;
    this.notify('generated-new-science-task',{seed});
    this.render();
  }

  openBoard() {
    this.boardSnapshot=this.snapshot();
    this.state.board=true;
    this.state.boardStep=0;
    this.render();
  }

  closeBoard() {
    if(this.boardSnapshot)this.state={...this.boardSnapshot,board:false,boardStep:0};
    else this.state.board=false;
    this.boardSnapshot=null;
    this.render();
  }

  async save() {
    if (!this.onSave) return;
    const payload=savePayload(this.state,this.tool,this.activity);
    if (this.tool.mode === 'challenge' && !payload.structuredContent.challengeData.valid) {
      this.onToast?.(payload.structuredContent.challengeData.errors[0]);
      return;
    }
    await this.onSave(payload,this.snapshot());
  }

  render() {
    if (!this.tool) {
      this.host.innerHTML=renderHome();
      return;
    }
    if (this.state.board) {
      this.host.innerHTML=renderBoard(this.state,this.tool,this.activity);
      return;
    }
    this.host.innerHTML=`<section class="page living-things-tool" aria-labelledby="science-tool-title"><header class="science-tool-head no-print"><button class="text-button" type="button" data-science-action="back-home">← Observatory</button><div><p class="eyebrow">${escapeHTML(this.activity?'Guided Key Activity':'Open scientific tool')}</p><h1 id="science-tool-title">${escapeHTML(this.activity?.title||this.tool.title)}</h1><p>${escapeHTML(this.activity?.shortInvitation||this.tool.invitation)}</p>${this.activity?`<p class="science-objective"><strong>Scientific purpose:</strong> ${escapeHTML(this.activity.curriculumObjective)}</p>`:''}</div><div class="science-tool-actions"><button class="button secondary" type="button" data-science-action="undo-science" ${this.history.length?'':'disabled'}>Undo</button><button class="button secondary" type="button" data-science-action="redo-science" ${this.future.length?'':'disabled'}>Redo</button><button class="button secondary" type="button" data-science-action="new-task">Try another set</button><button class="button secondary" type="button" data-science-action="open-board">Board View</button><button class="button secondary" type="button" data-action="print-page">Print</button></div></header>${renderGuidedActivityGuide(this.activity)}${this.scaffold==='intensive'?'<div class="science-scaffold-note"><strong>One decision at a time.</strong> The organism set is smaller; the scientific objective is unchanged.</div>':''}${renderToolModel(this.state,this.tool,this.activity)}<footer class="science-save-bar no-print"><div><strong>Preserve this thinking</strong><span>Organism IDs, branch logic, source metadata and the generator seed stay with the work.</span></div><button class="button secondary" type="button" data-science-action="record-science">Record voice</button><span data-audio-recorder-status class="small muted">Optional</span><button class="button" type="button" data-science-action="save-science">Save to My Work</button></footer></section>`;
  }

  destroy() {
    this.host.removeEventListener('click',this.handleClick);
    this.host.removeEventListener('input',this.handleInput);
    this.host.removeEventListener('change',this.handleChange);
    this.host.removeEventListener('keydown',this.handleKeyDown);
  }
}

export function renderLivingThingsObservatoryHost({ toolId = null, activityId = null } = {}) {
  return `<div id="living-things-observatory" data-science-tool-id="${escapeAttr(toolId || '')}" data-science-activity-id="${escapeAttr(activityId || '')}"></div>`;
}

export default LivingThingsObservatory;
