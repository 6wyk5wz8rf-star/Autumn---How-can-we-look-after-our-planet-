import { escapeAttr, escapeHTML } from '../utils/dom.js';
import { formatDate, formatDateTime, humanise, truncate } from '../utils/format.js';
import { renderKeypad } from '../components/Keypad.js';
import { profileSymbolIcon } from '../components/ProfileGate.js';

const artefactSymbols = {
  'exploration-snapshot': '◎',
  'three-view-comparison': '◫',
  'annotated-location-card': '⌖',
  'place-pin': '⌖',
  'climate-pattern-observation': '☼',
  'two-place-comparison': '⇄',
  'journey-thread': '⌁',
  'place-portrait': '▱',
  'planet-question-response': '◉',
};

const outcomeTemplatesWithExplanation = new Set([
  'place-pin',
  'climate-pattern-observation',
  'journey-thread',
  'planet-question-response',
]);

function safeSvgDataUrl(markup) {
  const value = String(markup || '').trim();
  if (!value.startsWith('<svg') || value.length > 750_000) return '';
  if (/<(?:script|foreignObject|iframe|object|embed|image|use)\b/i.test(value)) return '';
  if (/\son[a-z]+\s*=|\b(?:href|src)\s*=\s*["'](?!#)/i.test(value)) return '';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
}

function renderSavedPreview(artifact, type) {
  const source = safeSvgDataUrl(artifact.preview?.markup);
  if (source) {
    return `<img class="saved-map-preview" src="${escapeAttr(source)}" alt="Saved ${escapeAttr(artifact.preview?.label || 'map')} view" />`;
  }
  return `<span class="work-preview-symbol" aria-hidden="true">${artefactSymbols[type] || '▱'}</span>${artifact.preview?.label ? `<strong>${escapeHTML(artifact.preview.label)}</strong>` : ''}`;
}

function displayContentEntries(content) {
  const hidden = new Set([
    'activityId', 'mapState', 'viewState', 'route', 'routes', 'markers', 'visibleLayers',
    'comparison', 'attribution', 'startedAt', 'savedAt', 'outcomeSchemaVersion', 'step',
    'workflowVersion',
  ]);
  return Object.entries(content).flatMap(([key, value]) => {
    if (hidden.has(key) || value === '' || value == null) return [];
    if (['string', 'number', 'boolean'].includes(typeof value)) return [[key, String(value)]];
    if (Array.isArray(value) && value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
      return value.length ? [[key, value.join(' · ')]] : [];
    }
    return [];
  });
}

function outcomeField(label, value) {
  if (value == null || value === '' || (Array.isArray(value) && !value.length)) return '';
  const text = Array.isArray(value) ? value.join(' · ') : String(value);
  return `<div><dt class="eyebrow">${escapeHTML(label)}</dt><dd>${escapeHTML(text)}</dd></div>`;
}

function renderOutcomeTemplate(type, content) {
  if (type === 'three-view-comparison') {
    const representations = [
      ['Globe', content.globeView],
      ['Flat world map', content.worldMapView],
      ['Close atlas view', content.atlasView],
    ];
    return `<section class="saved-outcome-template three-view-card" aria-label="Three-view comparison card"><h2>Three useful views</h2><div class="outcome-columns">${representations.map(([label, view]) => {
      const source = safeSvgDataUrl(view?.markup);
      return `<div><strong>${label}</strong>${source ? `<img class="representation-preview" src="${escapeAttr(source)}" alt="Saved ${label.toLowerCase()} representation" />` : '<span>Not captured yet</span>'}</div>`;
    }).join('')}</div><dl>${outcomeField('Remains recognisable', content.recognisable || content.recognisableFeature)}${outcomeField('What changes', content.changes)}${outcomeField('Useful for', content.useful || content.purposeChoice)}</dl></section>`;
  }
  if (type === 'annotated-location-card') {
    return `<section class="saved-outcome-template"><h2>Africa · annotated location</h2><dl>${outcomeField('Map evidence', content.evidenceAnnotations || content.evidence)}${outcomeField('My observation', content.observation)}${outcomeField('My question', content.question)}</dl></section>`;
  }
  if (type === 'place-pin') {
    return `<section class="saved-outcome-template"><h2>The Gambia · Place Pin</h2>${content.scaleTrail?.length ? `<p class="scale-trail">${content.scaleTrail.map((place) => `<span>${escapeHTML(humanise(place))}</span>`).join('<b aria-hidden="true">›</b>')}</p>` : '<p class="muted">The scale trail has not been followed yet.</p>'}<dl>${outcomeField('Pin', content.pinStatus === 'placed-by-learner' ? 'Placed by learner' : 'Not yet placed')}${outcomeField('What I notice', content.observation)}${outcomeField('Where it is', content.explanation)}${outcomeField('What I wonder', content.question)}</dl></section>`;
  }
  if (type === 'climate-pattern-observation') {
    return `<section class="saved-outcome-template"><h2>Broad climate pattern</h2><dl>${outcomeField('Places compared', content.selectedPlaces)}${outcomeField('My careful observation', content.broadPattern || content.observation)}${outcomeField('Important limit', content.caution || content.explanation)}</dl></section>`;
  }
  if (type === 'two-place-comparison') {
    return `<section class="saved-outcome-template"><h2>United Kingdom ⇄ The Gambia</h2><div class="outcome-columns two"><div><strong>United Kingdom</strong><span>Europe · north of the equator · Atlantic coastline</span></div><div><strong>The Gambia</strong><span>West Africa · north of the equator · Atlantic coastline</span></div></div><dl>${outcomeField('Evidence compared', content.evidence)}${outcomeField('Similarity', content.similarity || content.recognisable)}${outcomeField('Difference', content.difference || content.changes)}${outcomeField('Needs another source', content.question)}</dl></section>`;
  }
  if (type === 'journey-thread') {
    return `<section class="saved-outcome-template"><h2>Journey Thread</h2><dl>${outcomeField('Origin', content.origin?.label || content.region)}${outcomeField('Destination', content.destination?.label || content.place)}${outcomeField('Broad direction', content.broadDirection || content.route?.direction)}${outcomeField('Approximate distance', content.approximateDistanceKm ? `${content.approximateDistanceKm.toLocaleString('en-GB')} km` : '')}${outcomeField('Continents', content.continents)}${outcomeField('Oceans', content.oceans)}${outcomeField('My narration', content.explanation)}</dl></section>`;
  }
  if (type === 'place-portrait') {
    return `<section class="saved-outcome-template"><h2>${escapeHTML(content.place || humanise(content.placeId || 'Place'))} · Place Portrait</h2><dl>${outcomeField('Country or region', content.region)}${outcomeField('Broad climate', content.broadClimate || content.climate)}${outcomeField('Physical feature', content.physicalFeature || content.feature)}${outcomeField('Habitat or biome link', content.habitatOrBiome || content.habitat)}${outcomeField('Useful number', content.numericalFact || content.numberFact)}${outcomeField('My observation', content.observation)}${outcomeField('My question', content.question)}</dl></section>`;
  }
  if (type === 'planet-question-response') {
    return `<section class="saved-outcome-template"><h2>Understanding before action</h2><dl>${outcomeField('Possible action', content.action)}${outcomeField('What we need to know', content.observation)}${outcomeField('Who could be affected', content.region)}${outcomeField('My careful position', content.shortSentence || content.explanation)}${outcomeField('Still wondering', content.stillWondering || content.question)}</dl></section>`;
  }
  return '';
}

export function renderHomeView({ profile, recentActivity, workCount = 0 }) {
  const greeting = profile ? `Welcome back, ${escapeHTML(profile.displayName || profile.name)}.` : 'A world for careful looking.';
  return `<section class="page" aria-labelledby="home-title">
    <div class="home-world">
      <svg class="world-skyline" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M0 260 C130 205 250 260 370 226 S610 185 760 230 S1020 185 1200 215 L1200 440 C1070 405 955 435 820 410 S570 440 440 398 S180 430 0 380Z" fill="#9eae92" opacity=".58"/>
        <path d="M0 415 C180 370 265 445 430 410 S735 386 930 430 S1090 408 1200 390 L1200 540 C1010 570 860 516 690 548 S320 520 0 570Z" fill="#829a84" opacity=".42"/>
        <path d="M-80 532 C160 450 335 522 510 487 C684 452 810 525 1280 440" fill="none" stroke="#edf0e9" stroke-width="18" opacity=".6"/>
        <path d="M95 700 C300 610 342 520 520 472 C688 427 710 335 930 287" fill="none" stroke="#c39d72" stroke-width="8" stroke-dasharray="2 17" stroke-linecap="round" opacity=".7"/>
        <path d="M76 258l62-62 66 62M870 263l36-67 40 67M1010 238l48-86 50 86" fill="none" stroke="#536d72" stroke-width="5" opacity=".22"/>
        <g fill="#354f59" opacity=".2">
          <rect x="78" y="286" width="9" height="45"/><circle cx="83" cy="280" r="14"/>
          <rect x="1080" y="284" width="9" height="48"/><circle cx="1085" cy="276" r="16"/>
          <rect x="1018" y="307" width="8" height="37"/><circle cx="1022" cy="300" r="12"/>
        </g>
      </svg>
      <div class="world-intro">
        <p class="eyebrow">${greeting}</p>
        <h1 id="home-title">How can we look after our planet?</h1>
        <p class="lede">Begin with a place. Look closely. Follow what you notice.</p>
        <div class="cluster no-print">
          <button class="button secondary" type="button" data-route="key">Enter today’s key</button>
        </div>
      </div>
      <button class="atlas-landmark" type="button" data-route="atlas" aria-label="Open Planet Atlas">
        <span class="atlas-orb" aria-hidden="true"></span>
        <span class="atlas-label"><strong>Planet Atlas</strong><span>Globe · map · places · journeys</span></span>
      </button>
      <div class="world-question optional-detail">
        <p>“Looking after a place begins with understanding it.”</p>
        ${workCount ? `<span class="small muted">Your workspace holds ${workCount} ${workCount === 1 ? 'idea' : 'ideas'}.</span>` : '<span class="small muted">Your ideas will gather in My Work.</span>'}
      </div>
    </div>
    ${recentActivity ? `<aside class="paper-panel panel-pad" style="margin-top:1rem" aria-label="Continue a recent pathway">
      <div class="spread">
        <div><p class="eyebrow">A path you opened</p><h3 style="margin:0">${escapeHTML(recentActivity.title)}</h3></div>
        <button class="button tonal" type="button" data-route="activity" data-route-value="${escapeAttr(recentActivity.id)}">Revisit</button>
      </div>
    </aside>` : ''}
  </section>`;
}

export function renderAtlasView() {
  return `<section class="page atlas-page" aria-labelledby="atlas-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">Open exploration · no key needed</p>
        <h1 id="atlas-title">Planet Atlas</h1>
        <p class="lede">Turn Earth, move closer and follow what you notice.</p>
      </div>
    </div>
    <div id="atlas-map" aria-busy="true"></div>
    <div class="atlas-save-strip no-print">
      <label for="atlas-question"><strong>What are you wondering?</strong><span class="small muted"> Optional</span></label>
      <textarea id="atlas-question" maxlength="280" rows="2" placeholder="Add a question to this view…"></textarea>
      <button class="button" type="button" data-action="save-atlas-question">Save view</button>
    </div>
  </section>`;
}

export function renderKeysView({ activities = [], access = [], artifacts = [] }) {
  const accessById = new Map(access.map((item) => [item.activityId || item.activity_id || item.id, item]));
  const opened = activities.filter((activity) => accessById.has(activity.id));
  return `<section class="page" aria-labelledby="keys-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">Paths you have opened</p>
        <h1 id="keys-title">My Keys</h1>
        <p class="lede">Choose a pathway to continue or revisit.</p>
      </div>
      <button class="button" type="button" data-route="key">Enter a Key</button>
    </div>
    ${opened.length ? `<div class="key-shelf">
      ${opened.map((activity) => {
        const record = accessById.get(activity.id) || {};
        const saved = artifacts.find((artifact) => artifact.activityId === activity.id || artifact.activity === activity.id);
        return `<article class="shelf-item">
          <div>
            <p class="eyebrow">Planet Atlas · ${escapeHTML(activity.rhythm?.[0] || 'Notice')}</p>
            <h3>${escapeHTML(activity.title)}</h3>
            <p class="muted">${escapeHTML(activity.shortInvitation || activity.invitation || activity.description || '')}</p>
          </div>
          <div class="work-meta">
            <span>First opened ${formatDate(record.firstOpenedAt || record.firstOpened || record.createdAt)}</span>
            ${saved ? '<span><span class="status-dot"></span>Saved work</span>' : ''}
          </div>
          <div class="cluster item-actions">
            <button class="button" type="button" data-route="activity" data-route-value="${escapeAttr(activity.id)}">${saved ? 'Revisit' : 'Open pathway'}</button>
          </div>
        </article>`;
      }).join('')}
    </div>` : `<div class="empty-state">
      <div>
        <div class="display-type" style="font-size:3rem;color:var(--mineral)" aria-hidden="true">⌘</div>
        <h2>Your key shelf is ready</h2>
        <p class="muted">Enter a four-digit key, or explore Planet Atlas freely.</p>
        <div class="cluster" style="justify-content:center"><button class="button" type="button" data-route="key">Enter a Key</button><button class="button secondary" type="button" data-route="atlas">Explore the atlas</button></div>
      </div>
    </div>`}
  </section>`;
}

export function renderKeyEntryView() {
  return `<section class="page" aria-labelledby="key-title">
    <div class="page-head" style="justify-content:center;text-align:center">
      <div>
        <p class="eyebrow">A direct path through an open world</p>
        <h1 id="key-title">Enter a Key</h1>
        <p class="lede" style="margin-inline:auto">The pathway opens after the fourth digit.</p>
      </div>
    </div>
    <div class="paper-panel panel-pad" style="max-width:31rem;margin:0 auto">
      ${renderKeypad()}
    </div>
  </section>`;
}

export function renderWorkView({ artifacts = [], responses = [], activeFilter = 'all' }) {
  const filters = [
    ['all', 'All work'],
    ['map', 'Maps & places'],
    ['journey', 'Journeys'],
    ['explanation', 'Explanations'],
  ];
  const showFilters = artifacts.length >= 6;
  const effectiveFilter = showFilters ? activeFilter : 'all';
  const visible = effectiveFilter === 'all' ? artifacts : artifacts.filter((artifact) => {
    const haystack = [artifact.type, artifact.artefactType, ...(artifact.tags || []), ...(artifact.curriculumTags || [])].join(' ').toLowerCase();
    return haystack.includes(effectiveFilter);
  });
  const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  return `<section class="page" aria-labelledby="work-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">Saved ideas and creations</p>
        <h1 id="work-title">My Work</h1>
        <p class="lede">Open something to revisit it without losing the original.</p>
      </div>
    </div>
    <section class="paper-panel panel-pad" aria-labelledby="planet-question-heading">
      <div class="spread">
        <div>
          <p class="eyebrow">A question that grows with you</p>
          <h2 id="planet-question-heading">How can we look after our planet?</h2>
        </div>
        <button class="button tonal no-print" type="button" data-action="open-planet-question">Add what I think now</button>
      </div>
      ${responses.length ? `<div class="question-history">
        ${responses.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((response, index) => `<article class="question-response">
          <p class="eyebrow">${index === 0 ? 'What I think now' : 'What I thought before'} · ${formatDate(response.createdAt, { year: true })}</p>
          <p>${escapeHTML(response.text || response.response || 'A voice response was saved.')}</p>
          ${response.whatChanged ? `<div><strong>What changed my thinking</strong><p>${escapeHTML(response.whatChanged)}</p></div>` : ''}
          ${response.sourceActivityTitle ? `<p class="small muted">Connected pathway: ${escapeHTML(response.sourceActivityTitle)}</p>` : ''}
          ${response.evidenceUsed ? `<div><strong>Evidence I used</strong><p>${escapeHTML(response.evidenceUsed)}</p></div>` : ''}
          ${response.stillWondering ? `<div><strong>I still wonder</strong><p>${escapeHTML(response.stillWondering)}</p></div>` : ''}
          ${response.voicePlaybackUrl ? `<div class="voice-playback"><audio controls preload="metadata" src="${escapeAttr(response.voicePlaybackUrl)}" aria-label="Play this Planet Question voice response"></audio><p class="small muted">Use the controls to replay or change the volume. Any written idea above is the visible alternative.</p></div>` : ''}
          ${response.evidenceIds?.length ? `<p class="small muted">Evidence linked: ${response.evidenceIds.map((id) => artifactById.get(id)?.title).filter(Boolean).map(escapeHTML).join(' · ') || `${response.evidenceIds.length} saved ${response.evidenceIds.length === 1 ? 'piece' : 'pieces'}`}</p>` : ''}
        </article>`).join('')}
      </div>` : '<p class="muted">There is no expected answer. Add a thought when something has changed, connected or made you wonder.</p>'}
    </section>
    <div class="spread work-shelf-heading">
      ${showFilters ? `<div class="segmented no-print" role="group" aria-label="Filter saved work">${filters.map(([id, label]) => `<button type="button" data-work-filter="${id}" aria-pressed="${effectiveFilter === id}">${label}</button>`).join('')}</div>` : '<span></span>'}
      <span class="small muted">${artifacts.length} saved ${artifacts.length === 1 ? 'piece' : 'pieces'}</span>
    </div>
    ${visible.length ? `<div class="work-shelf">
      ${visible.map(renderArtifactCard).join('')}
    </div>` : `<div class="empty-state"><div><div class="display-type" style="font-size:3rem;color:var(--moss)" aria-hidden="true">▱</div><h2>${artifacts.length ? 'No work in this view yet' : 'Your work will gather here'}</h2><p class="muted">Save a map view, make a Journey Thread or follow a Key Activity. You can always return to the original.</p><button class="button" type="button" data-route="atlas">Explore Planet Atlas</button></div></div>`}
  </section>`;
}

export function renderArtifactCard(artifact) {
  const type = artifact.type || artifact.artefactType || 'saved-work';
  const symbol = artefactSymbols[type] || '▱';
  const title = artifact.title || humanise(type);
  const summary = artifact.summary || artifact.explanation || artifact.content?.observation || artifact.content?.question || '';
  return `<article class="shelf-item" data-artifact-id="${escapeAttr(artifact.id)}">
    <div class="work-preview" aria-hidden="true">
      <span class="work-preview-symbol">${symbol}</span>
      ${artifact.preview?.label ? `<span class="small">${escapeHTML(artifact.preview.label)}</span>` : ''}
    </div>
    <div>
      <p class="eyebrow">${escapeHTML(humanise(type))}</p>
      <h3>${escapeHTML(title)}</h3>
      ${summary ? `<p class="muted">${escapeHTML(truncate(summary, 120))}</p>` : ''}
    </div>
    <div class="work-meta"><span>Saved ${formatDate(artifact.updatedAt || artifact.createdAt, { year: true })}</span><span>${artifact.versions?.length || artifact.versionHistory?.length || 1} ${((artifact.versions?.length || artifact.versionHistory?.length || 1) === 1) ? 'version' : 'versions'}</span></div>
    <div class="cluster item-actions">
      <button class="button" type="button" data-route="work" data-route-value="${escapeAttr(artifact.id)}">Open</button>
    </div>
  </article>`;
}

export function renderWorkDetailView(artifact) {
  if (!artifact) return `<section class="page"><div class="empty-state"><div><h1>That saved piece was not found</h1><button class="button" type="button" data-route="work">Return to My Work</button></div></div></section>`;
  const type = artifact.type || artifact.artefactType || 'saved-work';
  const content = artifact.content || {};
  const versions = artifact.versions || artifact.versionHistory || [];
  const outcomeTemplate = renderOutcomeTemplate(type, content);
  const entries = outcomeTemplate ? [] : displayContentEntries(content);
  return `<article class="page" aria-labelledby="work-detail-title">
    <div class="page-head">
      <div>
        <p class="eyebrow">${escapeHTML(humanise(type))}</p>
        <h1 id="work-detail-title">${escapeHTML(artifact.title || humanise(type))}</h1>
        <p class="muted">Last changed ${formatDateTime(artifact.updatedAt || artifact.createdAt)}</p>
      </div>
      <div class="cluster no-print">
        <button class="button secondary" type="button" data-route="work">Back to My Work</button>
        <button class="button" type="button" data-action="print-artifact">Print</button>
      </div>
    </div>
    <div class="two-column">
      <section class="paper-panel panel-pad stack">
        <div class="work-preview" style="min-height:14rem">
          ${renderSavedPreview(artifact, type)}
        </div>
        ${outcomeTemplate}
        ${entries.length ? `<dl class="stack">${entries.map(([key, value]) => `<div><dt class="eyebrow">${escapeHTML(humanise(key))}</dt><dd style="margin:0">${escapeHTML(value)}</dd></div>`).join('')}</dl>` : '<p class="muted">This piece stores a visual map state. Reopen the activity to explore it again.</p>'}
        ${artifact.explanation && !outcomeTemplatesWithExplanation.has(type) ? `<div><p class="eyebrow">My explanation</p><p>${escapeHTML(artifact.explanation)}</p></div>` : ''}
        ${artifact.voicePlaybackUrl ? `<div class="voice-playback"><p class="eyebrow">My voice explanation</p><audio controls preload="metadata" src="${escapeAttr(artifact.voicePlaybackUrl)}" aria-label="Play my saved voice explanation"></audio><p class="small muted">Use the controls to replay or change the volume. The written explanation remains visible when one was added.</p></div>` : ''}
        ${artifact.reflection ? `<div class="feedback-note"><strong>Reflection</strong><p>${escapeHTML(artifact.reflection)}</p></div>` : ''}
      </section>
      <aside class="paper-panel panel-pad stack no-print">
        <button class="button" type="button" data-action="revise-artifact" data-artifact-id="${escapeAttr(artifact.id)}">Make a new version</button>
        ${versions.length > 1 ? `<button class="button secondary" type="button" data-action="compare-versions" data-artifact-id="${escapeAttr(artifact.id)}">Compare ${versions.length} versions</button>` : ''}
        <details class="work-more-actions">
          <summary>More options</summary>
          <div class="stack">
            <button class="button secondary" type="button" data-action="add-reflection" data-artifact-id="${escapeAttr(artifact.id)}">Add a reflection</button>
            <button class="button secondary" type="button" data-action="duplicate-artifact" data-artifact-id="${escapeAttr(artifact.id)}">Make a separate copy</button>
            <button class="text-button" type="button" data-action="confirm-delete-artifact" data-artifact-id="${escapeAttr(artifact.id)}">Delete this piece…</button>
          </div>
        </details>
      </aside>
    </div>
  </article>`;
}

export function renderSettingsView({ settings }) {
  const scaffold = settings.scaffold || 'core';
  return `<section class="page" aria-labelledby="settings-title">
    <div class="page-head"><div><p class="eyebrow">This learner’s choices</p><h1 id="settings-title">Accessibility & support</h1></div></div>
    <div class="two-column">
      <section class="paper-panel panel-pad">
        ${settingRow('Text size', 'Choose a comfortable reading size.', 'text-size', [['normal', 'Standard'], ['large', 'Large'], ['largest', 'Largest']], settings.textSize || 'normal')}
        ${settingRow('Contrast', 'Strengthen outlines and text.', 'contrast', [['normal', 'Calm'], ['high', 'High']], settings.contrast || 'normal')}
        ${settingRow('Motion', 'Reduce animated map movement and transitions.', 'motion', [['full', 'Gentle'], ['reduced', 'Reduced']], settings.motion || 'full')}
        ${settingRow('Visual detail', 'Hide optional detail while keeping the main idea.', 'complexity', [['full', 'Full'], ['reduced', 'Reduced']], settings.complexity || 'full')}
        ${settingRow('Scaffold', 'Adjust cues, modelling and how many choices appear together.', 'scaffold', [['light', 'Light'], ['core', 'Core'], ['strong', 'Strong'], ['intensive', 'Intensive']], scaffold)}
      </section>
      <aside class="paper-panel panel-pad stack">
        <div><p class="eyebrow">Spoken support</p><h2 style="font-size:1.7rem">Hear instructions and place names</h2><p class="muted">Use the speaker buttons when they appear. Meaningful sound always has a visible alternative.</p></div>
        <button class="button tonal" type="button" data-action="speak-text" data-speak="Planet Atlas. Move from the whole Earth to a particular place. Look carefully at what changes and what stays recognisable.">Hear an example</button>
        <label class="setting-row"><span><strong>Spoken instructions by default</strong><br><span class="small muted">You can still replay them at any time.</span></span><input type="checkbox" data-setting-toggle="spokenInstructions" ${settings.spokenInstructions ? 'checked' : ''} /></label>
        <p class="small muted"><strong>Keyboard:</strong> Tab moves between controls. Enter or Space chooses. Arrow keys move and turn the map when it has focus. Escape closes a panel.</p>
      </aside>
    </div>
  </section>`;
}

function settingRow(title, description, name, choices, current) {
  return `<div class="setting-row"><div><strong>${title}</strong><br><span class="small muted">${description}</span></div><div class="segmented" role="group" aria-label="${title}">${choices.map(([value, label]) => `<button type="button" data-setting="${name}" data-value="${value}" aria-pressed="${current === value}">${label}</button>`).join('')}</div></div>`;
}

export function renderMaintenanceView({ profiles = [] }) {
  return `<section class="page" aria-labelledby="maintenance-title">
    <div class="page-head"><div><p class="eyebrow">Adult utility · this device</p><h1 id="maintenance-title">Prepare, print & protect</h1><p class="lede">Print keys and protect work on this iPad.</p></div></div>
    <div class="content-grid">
      <section class="paper-panel panel-pad stack"><div><p class="eyebrow">Keys</p><h2 style="font-size:1.6rem">Teacher Key Guide</h2></div><button class="button" type="button" data-route="print" data-route-value="key-guide">Open printable guide</button><button class="button secondary" type="button" data-action="add-key-to-all">Add one key to all ${profiles.length} local ${profiles.length === 1 ? 'profile' : 'profiles'}</button></section>
      <section class="paper-panel panel-pad stack"><div><p class="eyebrow">Backup</p><h2 style="font-size:1.6rem">Protect local work</h2></div><button class="button" type="button" data-action="export-backup">Export backup</button><button class="button secondary" type="button" data-action="choose-backup-file">Import backup</button><input class="sr-only" id="backup-file" type="file" accept="application/json,.json" tabindex="-1" /></section>
      <section class="paper-panel panel-pad stack"><div><p class="eyebrow">This device</p><h2 style="font-size:1.6rem">Learner spaces</h2></div>${profiles.map((profile) => `<div class="spread"><span><span aria-hidden="true">${escapeHTML(profileSymbolIcon(profile.symbol))}</span> ${escapeHTML(profile.displayName || profile.name)}</span><button class="text-button" type="button" data-action="profile-tools" data-profile-id="${escapeAttr(profile.id)}">Manage…</button></div>`).join('') || '<p class="muted">No profiles yet.</p>'}<details class="work-more-actions"><summary>Device data options</summary><div class="stack"><p class="small muted">This action explains exactly what it removes and asks again.</p><button class="button danger" type="button" data-action="confirm-clear-all">Clear every local profile and piece of work…</button></div></details></section>
    </div>
  </section>`;
}

export function renderGlossary(glossary = []) {
  return `<aside class="glossary-popover" role="dialog" aria-modal="false" aria-labelledby="glossary-title">
    <div class="spread"><div><p class="eyebrow">Words for looking closely</p><h2 id="glossary-title" style="font-size:1.6rem">Visual glossary</h2></div><button class="icon-button" type="button" data-action="close-glossary" aria-label="Close glossary">×</button></div>
    <label class="sr-only" for="glossary-search">Search the glossary</label><input id="glossary-search" type="search" placeholder="Find a word…" data-glossary-search />
    <div class="stack" style="margin-top:1rem" data-glossary-results>
      ${glossary.filter((entry) => entry.active !== false && (!entry.future || entry.available)).map((entry) => `<article data-glossary-entry="${escapeAttr(entry.term)}"><div class="spread"><h3 style="margin:0">${escapeHTML(entry.term)}</h3><button class="icon-button" style="width:40px;height:40px;min-width:40px" type="button" data-action="speak-text" data-speak="${escapeAttr(entry.pronunciationText || entry.term)}" aria-label="Hear ${escapeAttr(entry.term)}">♪</button></div><p>${escapeHTML(entry.definition || entry.childDefinition || '')}</p>${entry.example ? `<p class="small muted">${escapeHTML(entry.example)}</p>` : ''}</article>`).join('')}
    </div>
  </aside>`;
}

export function renderPlanetQuestionModal({ artifacts = [] }) {
  return `<div class="modal-backdrop" data-modal="planet-question"><section class="modal wide" role="dialog" aria-modal="true" aria-labelledby="planet-response-title"><div class="modal-head"><div><p class="eyebrow">What I think now</p><h2 id="planet-response-title">How can we look after our planet?</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><form class="modal-body stack" id="planet-question-form"><p class="muted">Use a sentence, your voice, or both. There is no single expected answer.</p><label class="stack" style="gap:.4rem"><strong>My idea</strong><textarea name="text" maxlength="700" placeholder="I think… because…"></textarea></label><div class="cluster"><button class="button secondary" type="button" data-action="start-voice-response">Record my voice</button><span data-audio-recorder-status class="small muted">Optional</span></div><details class="response-evidence"><summary>Add what changed, a question or evidence <span class="small muted">optional</span></summary><div class="stack"><div class="two-field-grid"><label class="stack" style="gap:.4rem"><strong>What changed my thinking</strong><textarea name="whatChanged" maxlength="500" placeholder="A map, discussion or piece of work helped me notice…"></textarea></label><label class="stack" style="gap:.4rem"><strong>What I still wonder</strong><textarea name="stillWondering" maxlength="500" placeholder="I still wonder…"></textarea></label></div><fieldset class="stack"><legend><strong>Evidence from My Work</strong></legend>${artifacts.length ? `<div class="choice-grid">${artifacts.slice(0, 8).map((artifact) => `<label class="choice-card" style="min-height:auto"><input type="checkbox" name="evidence" value="${escapeAttr(artifact.id)}" /> <strong>${escapeHTML(artifact.title || humanise(artifact.type))}</strong></label>`).join('')}</div>` : '<p class="small muted">No saved work yet. Your response can stand on its own.</p>'}</fieldset></div></details><button class="button" type="submit">Save what I think now</button></form></section></div>`;
}

export function renderEditArtifactModal(artifact, mode = 'revise') {
  return `<div class="modal-backdrop" data-modal="edit-artifact"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-artifact-title"><div class="modal-head"><div><p class="eyebrow">${mode === 'reflection' ? 'Notice your thinking' : 'Preserve the original'}</p><h2 id="edit-artifact-title">${mode === 'reflection' ? 'Add a reflection' : 'Make a new version'}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><form class="modal-body stack" id="edit-artifact-form" data-artifact-id="${escapeAttr(artifact.id)}" data-edit-mode="${escapeAttr(mode)}">${mode === 'reflection' ? `<div class="choice-grid">${['I noticed something new.','I changed my idea.','I found another way.','I can explain this now.','This connects to something else.','I still have a question.'].map((reflection) => `<button class="choice-card" style="min-height:auto" type="button" data-reflection-choice="${escapeAttr(reflection)}"><strong>${reflection}</strong></button>`).join('')}</div><label class="stack"><strong>My reflection</strong><textarea name="reflection" maxlength="400" required></textarea></label>` : `<label class="stack"><strong>Title</strong><input name="title" type="text" maxlength="80" value="${escapeAttr(artifact.title || '')}" required /></label><label class="stack"><strong>What I want to change or explain</strong><textarea name="explanation" maxlength="700">${escapeHTML(artifact.explanation || '')}</textarea></label>`}<button class="button" type="submit">Save ${mode === 'reflection' ? 'reflection' : 'new version'}</button></form></section></div>`;
}

export function renderVersionCompareModal(artifact) {
  const versions = artifact.versions || artifact.versionHistory || [];
  return `<div class="modal-backdrop" data-modal="versions"><section class="modal wide" role="dialog" aria-modal="true" aria-labelledby="versions-title"><div class="modal-head"><div><p class="eyebrow">Earlier thinking remains visible</p><h2 id="versions-title">Compare versions</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body version-compare-grid">${versions.map((version, index) => {
    const type = version.artefactType || version.artefactTypeId || artifact.type || artifact.artefactType;
    const content = version.content || version.structuredContent || {};
    const outcomeTemplate = renderOutcomeTemplate(type, content);
    const entries = outcomeTemplate ? [] : displayContentEntries(content).slice(0, 8);
    const explanation = version.explanation || version.writtenExplanation;
    return `<article class="paper-panel panel-pad stack"><div><p class="eyebrow">Version ${index + 1} · ${formatDate(version.createdAt || version.timestamp, { year: true })}</p><h3>${escapeHTML(version.title || artifact.title)}</h3></div><div class="work-preview version-preview">${renderSavedPreview(version, type)}</div>${outcomeTemplate}${entries.length ? `<dl class="version-fields">${entries.map(([key, value]) => outcomeField(humanise(key), value)).join('')}</dl>` : ''}${explanation && !outcomeTemplatesWithExplanation.has(type) ? `<div><p class="eyebrow">Explanation at this point</p><p>${escapeHTML(explanation)}</p></div>` : ''}${version.voiceExplanation ? '<p class="small muted">A voice explanation is preserved in this version. Reopen the version to listen in full.</p>' : ''}</article>`;
  }).join('')}</div></section></div>`;
}
