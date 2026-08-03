import { escapeAttr, escapeHTML } from '../../utils/dom.js';

export const ACTIVITY_RHYTHM = ['Notice', 'Explore', 'Make', 'Explain', 'Revisit'];

export function activityKind(activity) {
  const text = `${activity?.id || ''} ${activity?.title || ''}`.toLowerCase();
  if (text.includes('different-form') || text.includes('different form')) return 'forms';
  if (text.includes('locate-africa') || text.includes('locate africa')) return 'africa';
  if (text.includes('equator') || text.includes('climate-pattern')) return 'climate';
  if (text.includes('compare') || text.includes('united-kingdom')) return 'compare';
  if (text.includes('find-the-gambia') || text.includes('find the gambia')) return 'gambia';
  if (text.includes('journey')) return 'journey';
  if (text.includes('portrait')) return 'portrait';
  return 'understanding';
}

export function defaultActivityState(activity) {
  return {
    activityId: activity.id,
    step: 0,
    startedAt: new Date().toISOString(),
    selections: [],
    evidence: [],
    mapState: null,
    route: null,
    observation: '',
    question: '',
    explanation: '',
    recognisable: '',
    changes: '',
    useful: '',
    place: '',
    region: '',
    climate: '',
    feature: '',
    habitat: '',
    numberFact: '',
    action: '',
    mode: 'guided',
    viewPreviews: {},
    scaleTrailVisited: [],
  };
}

export function renderActivityView(activity, state, { savedBefore = false, scaffold = 'core' } = {}) {
  const step = Math.max(0, Math.min(4, state.step || 0));
  const kind = activityKind(activity);
  const content = renderStep(kind, step, state);
  return `<section class="page key-activity-shell" aria-labelledby="activity-title" data-activity-id="${escapeAttr(activity.id)}" data-scaffold-level="${escapeAttr(scaffold)}" data-activity-kind="${kind}">
    <header class="activity-banner">
      <div>
        <p class="eyebrow">Planet Atlas · Key Activity</p>
        <h1 id="activity-title" style="font-size:clamp(2rem,4vw,3.35rem);margin-bottom:.5rem">${escapeHTML(activity.title)}</h1>
        <p class="lede" style="margin-bottom:0">${escapeHTML(activity.shortInvitation || activity.invitation || activity.description || 'Follow this guided pathway, make something and save it for later.')}</p>
      </div>
      <div class="cluster no-print">
        <button class="button secondary" type="button" data-route="atlas">Explore freely</button>
        <button class="icon-button" type="button" data-action="speak-activity-instructions" aria-label="Hear this activity’s instructions">♪</button>
      </div>
    </header>
    <nav class="activity-rhythm no-print" aria-label="Activity rhythm">
      ${ACTIVITY_RHYTHM.map((label, index) => `<button class="rhythm-step" type="button" data-activity-step="${index}" ${index === step ? 'aria-current="step"' : ''}><span class="step-number">${index + 1}</span><span>${label}</span></button>`).join('')}
    </nav>
    <div class="activity-stage">
      <section class="activity-prompt paper-panel" aria-labelledby="stage-title">
        <p class="eyebrow">${ACTIVITY_RHYTHM[step]}</p>
        ${content.prompt}
        <aside class="scaffold-support scaffold-support--strong" aria-label="Extra thinking cue">Take one piece of map evidence at a time. Point to it, name it, then connect it to your idea.</aside>
        <aside class="scaffold-support scaffold-support--intensive" aria-label="Sentence support">You could begin: “I notice … on the map. This may help me explain …”</aside>
      </section>
      <section class="paper-panel atlas-activity-canvas" aria-label="Interactive map workspace">
        <div id="activity-atlas-map" aria-busy="true"></div>
        ${content.overlay || ''}
      </section>
    </div>
    <div class="save-bar no-print">
      <span class="small muted"><span class="status-dot"></span>${savedBefore ? 'An earlier version is safe in My Work.' : 'Your pathway can be saved in My Work.'}</span>
      <div class="cluster">
        ${step > 0 ? '<button class="button secondary" type="button" data-action="previous-activity-step">Back</button>' : ''}
        ${step < 4 ? '<button class="button" type="button" data-action="next-activity-step">Continue</button>' : `<button class="button" type="button" data-action="save-key-activity">${savedBefore ? 'Save a new version' : 'Save to My Work'}</button>`}
      </div>
    </div>
  </section>`;
}

function renderStep(kind, step, state) {
  return EXPERIENCES[kind]?.[step]?.(state) || EXPERIENCES.understanding[step](state);
}

function field(label, name, value, placeholder, { rows = true, required = false } = {}) {
  return `<label class="stack" style="gap:.4rem"><strong>${label}</strong>${rows ? `<textarea data-draft-field="${name}" maxlength="700" ${required ? 'required' : ''} placeholder="${escapeAttr(placeholder)}">${escapeHTML(value || '')}</textarea>` : `<input data-draft-field="${name}" type="text" maxlength="180" value="${escapeAttr(value || '')}" placeholder="${escapeAttr(placeholder)}" ${required ? 'required' : ''} />`}</label>`;
}

function toggles(items, selected = [], fieldName = 'selections') {
  return `<div class="choice-grid">${items.map(([value, title, description]) => `<button class="choice-card" type="button" data-draft-toggle="${fieldName}" data-value="${escapeAttr(value)}" aria-pressed="${selected.includes(value)}"><strong>${escapeHTML(title)}</strong>${description ? `<span>${escapeHTML(description)}</span>` : ''}</button>`).join('')}</div>`;
}

function singleChoices(items, selected, fieldName) {
  return `<div class="choice-grid" role="radiogroup" aria-label="Choose one approach">${items.map(([value, title, description, symbol]) => `<button class="choice-card" type="button" role="radio" data-draft-single="${escapeAttr(fieldName)}" data-value="${escapeAttr(value)}" aria-checked="${selected === value}">${symbol ? `<span class="choice-symbol" aria-hidden="true">${escapeHTML(symbol)}</span>` : ''}<strong>${escapeHTML(title)}</strong>${description ? `<span>${escapeHTML(description)}</span>` : ''}</button>`).join('')}</div>`;
}

function summary(state, labels) {
  const filled = labels.filter(([key]) => state[key]).map(([key, label]) => `<div><p class="eyebrow">${label}</p><p>${escapeHTML(Array.isArray(state[key]) ? state[key].join(' · ') : state[key])}</p></div>`).join('');
  return filled || '<p class="muted">Your map choices and visual work are ready to save. You can reopen this pathway and add words later.</p>';
}

const EXPERIENCES = {
  forms: [
    (state) => ({ prompt: `<h2 id="stage-title">One Earth. Three useful views.</h2><p>Move between a globe, a flat world map and a close atlas view. Look for something you can still recognise.</p>${toggles([['globe','Globe','A curved model shows Earth as a whole.'],['flat','Flat map','A flat view makes the whole world easy to scan.'],['close','Close atlas view','A close view reveals boundaries, rivers and coastlines.']], state.selections)}<div class="feedback-note" style="margin-top:1rem">A flat map changes the curved surface so it can fit on a page or screen. Every flat projection makes choices.</div>`, overlay: '<div class="atlas-overlay-note">Choose a representation. The map will change without changing the planet.</div>' }),
    (state) => ({ prompt: `<h2 id="stage-title">What stays recognisable?</h2><p>Compare coastline shapes, relative position, labels and scale. Select the evidence you are using.</p>${toggles([['coastline','Coastline shape','Some shapes remain recognisable across views.'],['position','Relative position','Places stay north, south, east or west of one another.'],['labels','Names and labels','Labels can be added or removed.'],['scale','Scale changes','Close views show less area and more detail.']], state.evidence, 'evidence')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Make a three-view comparison</h2>${field('Something I can recognise in all three views','recognisable',state.recognisable,'I can still recognise…')}${field('Something that changes','changes',state.changes,'The shape, detail or scale changes because…')}${field('The most useful view for my purpose','useful',state.useful,'I would use the … view when…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Explain a mapmaker’s choice</h2><p>There is no single best representation. Explain what one view helps us see and what it makes harder to see.</p>${field('My explanation','explanation',state.explanation,'A globe helps us see… A flat map helps us…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Your three-view card</h2>${summary(state,[['recognisable','Remains recognisable'],['changes','Changes'],['useful','Useful view'],['explanation','My explanation']])}<p class="feedback-note">Save it now. Reopen it after using a physical globe or atlas and see whether your explanation changes.</p>`, overlay: '' }),
  ],
  africa: [
    (state) => ({ prompt: `<h2 id="stage-title">Start with the whole world</h2><p>Before searching, notice the shapes of the continents and the spaces made by oceans.</p>${toggles([['atlantic','Atlantic Ocean','West of Africa.'],['indian','Indian Ocean','East of Africa.'],['europe','Europe','North of Africa across the Mediterranean.']], state.evidence, 'evidence')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Locate, then check the coastline</h2><p>Choose <strong>Locate on map</strong>, then tap Africa. Labels can be hidden so that your evidence—not memory of a word—guides you.</p><div class="feedback-note">If your marker is in Africa, use the Atlantic and Indian oceans to check both sides of the continent.</div>`, overlay: '<div class="atlas-overlay-note"><button class="button tonal" type="button" data-map-tool="locate-africa">Locate on map</button></div>' }),
    (state) => ({ prompt: `<h2 id="stage-title">Make an annotated location card</h2>${field('What helped me locate Africa','observation',state.observation,'I used the shape of… and the position of…')}${field('A question I now have','question',state.question,'I wonder…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Continent, country or region?</h2><p>Select the accurate description for Africa. Then add a sentence that explains how you know.</p>${toggles([['continent','A continent','A large continuous land area containing many countries.'],['country','A country','A political territory with its own government.'],['region','Only a region','An area grouped because of shared location or features.']], state.selections)}${field('My explanation','explanation',state.explanation,'Africa is… It contains…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Your location card</h2>${summary(state,[['observation','Evidence I used'],['explanation','Continent, country or region'],['question','What I still wonder']])}<p class="feedback-note">Africa is a continent containing 50-plus countries and enormous variation in places, climates, languages and communities.</p>`, overlay: '' }),
  ],
  gambia: [
    (state) => ({ prompt: `<h2 id="stage-title">Keep your bearings as you move closer</h2><p>Follow the scale journey. Do not jump straight to the answer.</p><div class="stack"><button class="choice-card" type="button" data-map-focus-step="world"><strong>1 · Earth</strong><span>Begin with the whole globe.</span></button><button class="choice-card" type="button" data-map-focus-step="africa"><strong>2 · Africa</strong><span>Keep the continent in view.</span></button><button class="choice-card" type="button" data-map-focus-step="west-africa"><strong>3 · West Africa</strong><span>Follow the western coastline.</span></button><button class="choice-card" type="button" data-map-focus-step="gambia"><strong>4 · The Gambia</strong><span>Move to the country without losing orientation.</span></button></div>`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Find the country inside its context</h2><p>The Gambia is a narrow country in West Africa. Most of its land boundary meets Senegal; its western edge meets the Atlantic Ocean.</p><p>Use the River Gambia as another line of evidence. Then locate the country on the map.</p>`, overlay: '<div class="atlas-overlay-note"><button class="button tonal" type="button" data-map-tool="locate-gambia">Place my pin</button></div>' }),
    (state) => ({ prompt: `<h2 id="stage-title">Make a Place Pin</h2><button class="button tonal" type="button" data-action="speak-text" data-speak="The Gambia">Hear “The Gambia”</button>${field('What I notice','observation',state.observation,'I notice that The Gambia…')}${field('A geographical question','question',state.question,'Why does…? How might…?')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Explain its location</h2><p>Use more than one piece of map evidence: continent, region, coastline, neighbouring country or river.</p>${field('My location explanation','explanation',state.explanation,'The Gambia is in… It is beside… The map also shows…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Your Place Pin</h2>${summary(state,[['observation','What I notice'],['explanation','Where it is'],['question','What I wonder']])}<p class="feedback-note">Save the pin now. Return later and add evidence from climate, habitats or community learning.</p>`, overlay: '' }),
  ],
  climate: [
    (state) => ({ prompt: `<h2 id="stage-title">Reveal the equator</h2><p>The equator is an imaginary line around Earth, halfway between the North and South poles. Notice which places are near it and which are farther away.</p>${toggles([['north','North of the equator','In the Northern Hemisphere.'],['south','South of the equator','In the Southern Hemisphere.'],['near','Near the equator','Latitude can influence broad climate patterns.']], state.selections)}`, overlay: '<div class="atlas-overlay-note"><button class="button tonal" type="button" data-map-tool="toggle-equator">Reveal equator</button></div>' }),
    (state) => ({ prompt: `<h2 id="stage-title">Compare patterns—not certainties</h2><p>Climate is influenced by latitude, altitude, distance from oceans, winds and other systems. Choose careful words for an observation.</p>${toggles([['broadly','Broadly','Names a large pattern without claiming it is always true.'],['often','Often','Leaves room for variation.'],['influenced','Influenced by','Shows that more than one factor matters.'],['may','May experience','Avoids turning a pattern into a promise.']], state.evidence, 'evidence')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Make a climate-pattern observation</h2>${field('My careful observation','observation',state.observation,'Places near the equator often… but climate is also influenced by…')}${field('Evidence from the map','useful',state.useful,'I compared…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Explain the limit of the pattern</h2>${field('Why latitude is useful but not enough','explanation',state.explanation,'Latitude helps us… It cannot tell us everything because…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Your climate-pattern observation</h2>${summary(state,[['observation','Broad pattern'],['useful','Map evidence'],['explanation','Important limit']])}`, overlay: '' }),
  ],
  compare: [
    (state) => ({ prompt: `<h2 id="stage-title">Two places in one world</h2><p>Locate the United Kingdom and The Gambia before comparing them. Notice global location and relative scale.</p>${toggles([['location','Global location','Where each place sits on Earth.'],['equator','Relationship to equator','How far north each place lies.'],['coastline','Coastline','How land meets sea.'],['scale','Relative map scale','How country size looks at the same map scale.']], state.evidence, 'evidence')}`, overlay: '<div class="atlas-overlay-note"><button class="button tonal" type="button" data-map-tool="compare-places">Show both places</button></div>' }),
    (state) => ({ prompt: `<h2 id="stage-title">Gather geographical evidence</h2><p>Avoid making one hot/cold comparison do all the work. Use location, coastline, broad climate and physical features.</p>${toggles([['continent','Continents','Europe and Africa.'],['latitude','Latitude','Both are north of the equator, at different distances.'],['water','Water relationships','Both have coastlines; the River Gambia is a major feature.'],['climate','Broad climate','Patterns differ and still vary within each country.']], state.selections)}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Make a two-place panel</h2>${field('A similarity','recognisable',state.recognisable,'Both places…')}${field('A difference shown by the map','changes',state.changes,'The map shows… whereas…')}${field('A fact I would need to verify','question',state.question,'I would need another source to find out…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Explain without stereotypes</h2>${field('My geographical comparison','explanation',state.explanation,'Using the map as evidence…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Your comparison panel</h2>${summary(state,[['recognisable','Similarity'],['changes','Difference'],['explanation','My comparison'],['question','Needs another source']])}`, overlay: '' }),
  ],
  journey: [
    (state) => ({ prompt: `<h2 id="stage-title">A journey is a relationship between places</h2><p>Choose two locations. The shortest line on a globe may look curved when Earth is flattened.</p>${toggles([['uk-gambia','United Kingdom → The Gambia','A journey between the two focus countries.'],['own','Choose my own two places','Place the start and destination yourself.']], state.selections)}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Draw and revise the thread</h2><p>Choose the route tool, then tap an origin and a destination. Inspect direction, approximate distance, continents, oceans and whether the equator is crossed.</p><div class="feedback-note">The distance is approximate. A real journey depends on the mode of travel and route taken.</div>`, overlay: '<div class="atlas-overlay-note"><button class="button tonal" type="button" data-map-tool="journey">Draw my Journey Thread</button></div>' }),
    (state) => ({ prompt: `<h2 id="stage-title">Make the journey meaningful</h2>${field('Origin','region',state.region,'Where does the journey begin?', { rows:false })}${field('Destination','place',state.place,'Where does it end?', { rows:false })}${field('What the map reveals','observation',state.observation,'The route travels… It crosses…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Narrate the journey</h2><p>You may type or record a short explanation. Include map evidence rather than inventing what either place is like.</p>${field('My journey narration','explanation',state.explanation,'From… the route moves… The map shows…')}<button class="button secondary" type="button" data-action="start-voice-response">Record my voice</button><div class="small muted" data-audio-recorder-status>Voice is optional.</div>`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Your Journey Thread</h2>${summary(state,[['region','Origin'],['place','Destination'],['observation','Map evidence'],['explanation','Narration']])}<p class="feedback-note">Save this thread, then revise it later if a new map or source changes your understanding.</p>`, overlay: '' }),
  ],
  portrait: [
    (state) => ({ prompt: `<h2 id="stage-title">A place is more than one fact</h2><p>Choose an approach, then collect a small, connected portrait. You do not need to fill every field.</p>${singleChoices([['guided','Guided mode','Use gentle prompts while you build.','☷'],['open','Open mode','Choose your own evidence and order.','⌖']], state.mode || 'guided', 'mode')}${toggles([['the-gambia','◉ The Gambia','Build from the focus country.'],['united-kingdom','⌖ United Kingdom','Build from the comparison country.'],['open-place','✦ Another place','Choose freely from the map.']], state.selections)}`, overlay: '' }),
    (state) => state.mode === 'open'
      ? ({ prompt: `<h2 id="stage-title">Open evidence tray</h2><p>Choose any symbols that help you build a connected portrait. Use them in any order and leave out those that are not useful.</p>${toggles([['map','⌖ Location','Where the place sits.'],['water','≈ Water','Coast, river or ocean.'],['climate','☼ Climate','A broad, careful pattern.'],['habitat','❋ Habitat','A living-things connection.'],['number','123 Number','Distance, scale or another useful measure.'],['question','? Question','Something worth investigating.']], state.evidence, 'evidence')}`, overlay: '' })
      : ({ prompt: `<h2 id="stage-title">Look across scales · guided mode</h2><p>Move in a helpful order: world position → country or region → physical feature → climate or habitat connection.</p>${toggles([['map','1 · Map position','World, continent and region.'],['physical','2 · Physical feature','Coastline, river or landform.'],['climate','3 · Broad climate','Careful pattern language.'],['habitat','4 · Habitat connection','A question to investigate further.']], state.evidence, 'evidence')}<div class="feedback-note">Each prompt is optional. A strong portrait connects a few useful pieces of evidence rather than collecting every field.</div>`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Build a Place Portrait${state.mode === 'open' ? ' in your own order' : ' with prompts'}</h2>${field('Place','place',state.place,'Name the place', { rows:false })}${field('Country or region','region',state.region,state.mode === 'open' ? 'Add this if it helps' : 'Where is it?', { rows:false })}${field('Broad climate','climate',state.climate,state.mode === 'open' ? 'Optional climate evidence' : 'Broadly…', { rows:false })}${field('Physical feature','feature',state.feature,state.mode === 'open' ? 'Optional physical evidence' : 'A coastline, river or landform', { rows:false })}${field('Habitat or biome connection','habitat',state.habitat,state.mode === 'open' ? 'Optional living-things link' : 'This might connect to…', { rows:false })}${field('A useful number','numberFact',state.numberFact,state.mode === 'open' ? 'Optional number evidence' : 'A distance, temperature range or scale fact', { rows:false })}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Add observation and question</h2>${field('What I notice','observation',state.observation,'The map shows…')}${field('What I wonder','question',state.question,'I wonder…')}${field('My explanation','explanation',state.explanation,'These details connect because…')}<button class="button secondary" type="button" data-action="start-voice-response">Add a voice explanation</button>`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Your Place Portrait</h2>${summary(state,[['place','Place'],['region','Location'],['climate','Broad climate'],['feature','Physical feature'],['habitat','Habitat connection'],['numberFact','Useful number'],['observation','Observation'],['question','Question'],['explanation','Explanation']])}<p class="feedback-note">A portrait can remain unfinished. Save it, print it or reopen it when another lesson gives you evidence.</p>`, overlay: '' }),
  ],
  understanding: [
    (state) => ({ prompt: `<h2 id="stage-title">Would one action suit every place?</h2><p>Choose an action to investigate. None is automatically right or wrong everywhere.</p>${toggles([['mangroves','Restore mangroves','Could protect some coasts and habitats; needs a suitable coastal ecosystem.'],['sea-wall','Build a sea wall','May protect one area while changing water and sediment movement.'],['less-plastic','Reduce single-use plastic','May reduce waste; needs attention to access, alternatives and local systems.'],['shade-trees','Plant shade trees','May cool places and support life; species, water and land use matter.']], state.selections)}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Ask before deciding</h2><p>Select the evidence that would help people make a more informed decision.</p>${toggles([['map','Map evidence','Coastline, settlement, land use and scale.'],['climate','Climate evidence','Rainfall, heat, seasons and change.'],['habitat','Habitat evidence','Living things and ecological relationships.'],['community','Community knowledge','Who is affected, local expertise and priorities.'],['materials','Material evidence','Resources, waste routes and unintended effects.']], state.evidence, 'evidence')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Make an evidence plan</h2>${field('The action I am considering','action',state.action || state.selections[0],'The possible action…', { rows:false })}${field('What we would need to know first','observation',state.observation,'Before deciding, we would need to know…')}${field('Who could be affected','region',state.region,'People, other living things or places…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Explain a careful position</h2>${field('My response','explanation',state.explanation,'This action might help when… It might have a different effect if… The evidence I would use is…')}${field('What information is still missing','question',state.question,'I still need to find out…')}`, overlay: '' }),
    (state) => ({ prompt: `<h2 id="stage-title">Understanding before action</h2>${summary(state,[['action','Possible action'],['observation','What we need to know'],['region','Who could be affected'],['explanation','My careful position'],['question','Information still missing']])}<p class="feedback-note">Looking after the planet requires understanding particular places, environments and communities. Save this response into your Planet Question history as evidence of your thinking.</p>`, overlay: '' }),
  ],
};

export function outcomeTypeForActivity(activity) {
  return ({
    forms: 'three-view-comparison',
    africa: 'annotated-location-card',
    gambia: 'place-pin',
    climate: 'climate-pattern-observation',
    compare: 'two-place-comparison',
    journey: 'journey-thread',
    portrait: 'place-portrait',
    understanding: 'planet-question-response',
  })[activityKind(activity)];
}

export function titleForOutcome(activity, state) {
  const kind = activityKind(activity);
  if (kind === 'portrait' && state.place) return `${state.place} · Place Portrait`;
  if (kind === 'journey' && (state.region || state.place)) return `${state.region || 'Origin'} to ${state.place || 'destination'}`;
  return activity.title;
}
