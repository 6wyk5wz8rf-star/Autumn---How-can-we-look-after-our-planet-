import { escapeHTML } from '../utils/dom.js';
import { humanise } from '../utils/format.js';

function keyType(key) {
  return key.type || key.keyType;
}

function codeOf(key) {
  return key.code || key.key;
}

function printInfo(key) {
  return key.printGuide || key.print || {};
}

function activityRows(keys) {
  return keys.filter((key) => ['activity', 'individual'].includes(keyType(key)) && key.destination === 'planet-atlas');
}

export function renderKeyGuide(keys = []) {
  const activities = activityRows(keys);
  const findGambia = activities.find((key) => key.route?.includes('find-the-gambia') || /gambia/i.test(key.title || key.label || ''));
  const quick = [findGambia, ...activities.filter((key) => key !== findGambia).slice(0, 3)].filter(Boolean);
  const larger = keys.filter((key) => ['collection', 'destination', 'world', 'whole-world', 'maintenance'].includes(keyType(key)));
  const displayPages = Array.from({ length: Math.ceil(activities.length / 4) }, (_, index) => activities.slice(index * 4, index * 4 + 4));

  return `<section class="page key-guide" aria-labelledby="key-guide-title">
    <div class="page-head no-print">
      <div><p class="eyebrow">Generated from the permanent key manifest</p><h1 id="key-guide-title">Planet Atlas Key Guide</h1><p class="lede">Keys provide direction through an open world. They are not passwords, assignments or tests.</p></div>
      <div class="cluster"><button class="button secondary" type="button" data-route="maintenance">Back to adult utility</button><button class="button" type="button" data-action="print-page">Print guide</button></div>
    </div>

    <section class="key-guide-page">
      <div class="print-only"><p class="eyebrow">How Can We Look After Our Planet?</p><h1>Planet Atlas · Quick-use keys</h1></div>
      <div class="paper-panel panel-pad">
        <p class="eyebrow">Quick use</p><h2>Four especially useful pathways</h2>
        <div class="print-card-grid content-grid">
          ${quick.map((key) => displayCard(key)).join('')}
        </div>
        <p class="small muted" style="margin-top:1rem">Children can explore Planet Atlas without a key. Entering one opens the exact guided pathway and remembers it in My Keys.</p>
      </div>
    </section>

    <section class="key-guide-page">
      <h1 class="print-only">Planet Atlas · Activity keys</h1>
      <div class="paper-panel panel-pad">
        <p class="eyebrow">Planet Atlas</p><h2>Individual Activity Keys</h2>
        <table class="key-guide-table">
          <thead><tr><th>Code & pathway</th><th>Purpose</th><th>Useful moment</th><th>Saved outcome</th></tr></thead>
          <tbody>${activities.map((key) => `<tr><td><span class="key-guide-code">${escapeHTML(codeOf(key))}</span><br><strong>${escapeHTML(key.title || key.label)}</strong></td><td>${escapeHTML(key.description || printInfo(key).purpose || '')}<br><span class="small muted">${escapeHTML((key.curriculumTags || []).join(' · '))}</span></td><td>${escapeHTML((printInfo(key).usefulMoments || key.usefulMoments || ['encounter', 'during teaching', 'revisit']).map(humanise).join(' · '))}</td><td>${escapeHTML(humanise(key.savedOutcomeType || key.savedOutcome || printInfo(key).expectedOutcome || 'saved work'))}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </section>

    <section class="key-guide-page">
      <h1 class="print-only">Collections and larger keys</h1>
      <div class="paper-panel panel-pad">
        <p class="eyebrow">Collections & adult access</p><h2>Larger keys</h2>
        <table class="key-guide-table"><thead><tr><th>Code</th><th>Type</th><th>What it adds or opens</th></tr></thead><tbody>${larger.map((key) => `<tr><td class="key-guide-code">${escapeHTML(codeOf(key))}</td><td><strong>${escapeHTML(key.title || key.label)}</strong><br><span class="small">${escapeHTML(humanise(keyType(key)))}</span></td><td>${escapeHTML(key.description || printInfo(key).purpose || '')}</td></tr>`).join('')}</tbody></table>
        <div class="feedback-note" style="margin-top:1rem"><strong>Whole-world wildcard:</strong> a learner who enters it now will also receive future Key Activities as new environments are added. It does not unlock ordinary exploration because the world is already open.</div>
      </div>
    </section>

    ${displayPages.map((group, index) => `<section class="key-guide-page">
      <h1 class="print-only">Today’s Key · cut-out cards ${index + 1} of ${displayPages.length}</h1>
      <div class="paper-panel panel-pad">
        <p class="eyebrow">Cut out and display</p><h2>Today’s Key cards${displayPages.length > 1 ? ` · ${index + 1}` : ''}</h2>
        <div class="print-card-grid">${group.map(displayCard).join('')}</div>
      </div>
    </section>`).join('')}
  </section>`;
}

function displayCard(key) {
  return `<article class="display-key-card">
    <div><p class="eyebrow" style="color:inherit">Today’s Key</p><div class="display-key-code">${escapeHTML(codeOf(key))}</div><h3>${escapeHTML(key.title || key.label)}</h3></div>
  </article>`;
}
