import { escapeAttr, escapeHTML } from '../utils/dom.js';
import {
  createTeacherKeyLibrary,
  filterTeacherKeyLibrary,
  getQuickTeacherKeys,
  getTeacherKeyEntry,
  getTeacherKeyFilterOptions,
  groupTeacherKeyLibrary,
} from './teacherKeyLibrary.js';
import { TeacherKeyPreferencesStore } from './teacherKeyPreferences.js';
import {
  FullScreenKeyDisplay,
  copyTeacherKeyCode,
  printTeacherHTML,
  renderPrintableTeacherKeyGuide,
  renderPrintableTodayKeyCard,
  renderPrintableTodayKeyCards,
} from './teacherKeyPresentation.js';

function option(value, title, selected) {
  return `<option value="${escapeAttr(value)}" ${selected === value ? 'selected' : ''}>${escapeHTML(title)}</option>`;
}

function domId(value) {
  return String(value ?? 'group').replace(/[^a-z0-9_-]+/gi, '-');
}

const SCIENCE_TOPICS = Object.freeze([
  ['observation', 'Observation'],
  ['grouping', 'Grouping'],
  ['vertebrates', 'Vertebrates'],
  ['invertebrates', 'Invertebrates'],
  ['classification keys', 'Classification Keys'],
  ['habitats', 'Habitats'],
  ['environmental change', 'Environmental Change'],
]);

const momentLabel = (value) => ({
  encounter: 'first encounter',
  'during-teaching': 'during teaching',
  'after-teaching': 'after teaching',
  revisit: 'revisit',
})[value] || value;

function keyCard(entry, favourites) {
  const favourite = favourites.has(entry.id);
  const openLabel = ({
    activity: 'Open activity',
    collection: 'Open collection',
    environment: 'Open environment',
    world: 'Open whole-world pathway',
  })[entry.scale] || 'Open pathway';
  return `<article class="teacher-key-card" data-teacher-key-id="${escapeAttr(entry.id)}">
    <div class="teacher-key-card__heading">
      <div><div class="teacher-key-card__code">${escapeHTML(entry.code)}</div><p class="teacher-key-card__meta">${escapeHTML(entry.environment.title)} · ${escapeHTML(entry.scaleTitle)}</p></div>
      <button class="teacher-key-card__favourite" type="button" data-teacher-action="favourite" data-key-id="${escapeAttr(entry.id)}" aria-pressed="${favourite}" aria-label="${favourite ? 'Remove' : 'Add'} ${escapeAttr(entry.title)} ${favourite ? 'from' : 'to'} Quick Keys">${favourite ? '★' : '☆'}</button>
    </div>
    <h4>${escapeHTML(entry.title)}</h4>
    <p>${escapeHTML(entry.purpose)}</p>
    <dl class="teacher-key-card__details">
      ${entry.savedOutcome ? `<div><dt>Saved outcome</dt><dd>${escapeHTML(entry.savedOutcome.replaceAll('-', ' '))}</dd></div>` : ''}
      ${entry.usefulMoments.length ? `<div><dt>Suggested use</dt><dd>${escapeHTML(entry.usefulMoments.map(momentLabel).join(' · '))}</dd></div>` : ''}
      <div><dt>Board View</dt><dd>${entry.boardViewSuitable ? 'Suitable' : 'Not designed for Board View'}</dd></div>
      ${entry.approximateMinutes ? `<div><dt>Approximate time</dt><dd>${escapeHTML(entry.approximateMinutes)} minutes</dd></div>` : ''}
    </dl>
    <div class="teacher-key-card__actions">
      <button class="button" type="button" data-teacher-action="open" data-key-id="${escapeAttr(entry.id)}">${escapeHTML(openLabel)}</button>
      <button class="button secondary" type="button" data-teacher-action="display" data-key-id="${escapeAttr(entry.id)}">Display code</button>
      <button class="text-button" type="button" data-teacher-action="copy" data-key-id="${escapeAttr(entry.id)}">Copy code</button>
      <button class="text-button" type="button" data-teacher-action="print-card" data-key-id="${escapeAttr(entry.id)}">Print card</button>
      <button class="text-button" type="button" data-teacher-action="add-all" data-key-id="${escapeAttr(entry.id)}">Add to all profiles</button>
    </div>
  </article>`;
}

function quickKey(entry) {
  return `<button class="teacher-quick-key" type="button" data-teacher-action="display" data-key-id="${escapeAttr(entry.id)}">
    <span>${escapeHTML(entry.code)}</span><strong>${escapeHTML(entry.title)}</strong>
  </button>`;
}

export function renderTeacherKeyResults(entries, favouriteIds = []) {
  if (!entries.length) {
    return '<div class="teacher-key-empty" role="status"><h3>No matching keys</h3><p>Clear one filter or try a curriculum word such as classification, habitat, rounding, exchange or Gambia.</p></div>';
  }
  const favourites = new Set(favouriteIds);
  return groupTeacherKeyLibrary(entries).map((environment) => `<section class="teacher-key-group" aria-labelledby="teacher-key-group-${escapeAttr(domId(environment.id))}">
    <div class="teacher-key-group__heading"><h2 id="teacher-key-group-${escapeAttr(domId(environment.id))}">${escapeHTML(environment.title)}</h2><button class="text-button" type="button" data-teacher-action="print-environment" data-environment-id="${escapeAttr(environment.id)}">Print environment guide</button></div>
    ${environment.strands.map((strand) => `<section class="teacher-key-strand"><h3>${escapeHTML(strand.title)}</h3><div class="teacher-key-grid">${strand.entries.map((entry) => keyCard(entry, favourites)).join('')}</div></section>`).join('')}
  </section>`).join('');
}

export function renderTeacherKeyRoom({
  entries = [],
  favouriteIds = [],
  filters = {},
  showTitleOnBoard = true,
  profileCount = 0,
} = {}) {
  const state = {
    query: '',
    environment: 'all',
    subject: 'all',
    scale: 'all',
    topic: 'all',
    ...filters,
  };
  const options = getTeacherKeyFilterOptions(entries);
  const filtered = filterTeacherKeyLibrary(entries, { ...state, favouriteIds });
  const quick = getQuickTeacherKeys(entries, favouriteIds);
  return `<section class="page teacher-key-room" aria-labelledby="teacher-key-room-title" data-teacher-key-room>
    <header class="teacher-key-room__header">
      <div><p class="eyebrow">Teacher entrance · 8584</p><h1 id="teacher-key-room-title">Teacher Key Room</h1><p class="lede">Find, display or print any current pathway. Leaving returns to children’s view.</p></div>
      <div class="teacher-key-room__header-actions"><button class="button secondary" type="button" data-teacher-action="print-guide">Print full Key Guide</button><button class="button" type="button" data-teacher-action="exit">Return to Children’s View</button></div>
    </header>

    <section class="teacher-key-tools" aria-label="Find a key">
      <label class="teacher-key-search"><span>Search keys</span><input type="search" value="${escapeAttr(state.query)}" placeholder="Rounding, exchange, The Gambia…" data-teacher-filter="query" autocomplete="off" /></label>
      <label><span>Environment</span><select data-teacher-filter="environment">${option('all', 'All environments', state.environment)}${options.environments.map((item) => option(item.id, item.title, state.environment)).join('')}</select></label>
      <label><span>Curriculum</span><select data-teacher-filter="subject">${option('all', 'All curriculum', state.subject)}${options.subjects.map((item) => option(item.id, item.title, state.subject)).join('')}</select></label>
      <label><span>Scale</span><select data-teacher-filter="scale">${option('all', 'Every scale', state.scale)}${options.scales.map((item) => option(item.id, item.title, state.scale)).join('')}</select></label>
      <div class="teacher-science-topics" role="group" aria-label="Science topic filters"><span>Science topics</span>${SCIENCE_TOPICS.map(([value, label]) => `<button type="button" data-teacher-action="topic" data-topic="${escapeAttr(value)}" aria-pressed="${state.topic === value}">${escapeHTML(label)}</button>`).join('')}</div>
      <label class="teacher-key-board-choice"><input type="checkbox" data-teacher-board-title ${showTitleOnBoard ? 'checked' : ''} /> Show the pathway title with the code</label>
    </section>

    ${quick.length ? `<section class="teacher-quick-keys" aria-labelledby="teacher-quick-keys-title"><div class="teacher-key-group__heading"><div><p class="eyebrow">Local favourites</p><h2 id="teacher-quick-keys-title">Quick Keys</h2></div><button class="text-button" type="button" data-teacher-action="print-quick-cards">Print these cards</button></div><div class="teacher-quick-key-grid">${quick.map(quickKey).join('')}</div></section>` : ''}

    <section class="teacher-key-results" aria-label="Key library" data-teacher-key-results>${renderTeacherKeyResults(filtered, favouriteIds)}</section>

    <section class="teacher-key-utilities" aria-labelledby="teacher-key-utilities-title">
      <div><p class="eyebrow">This device</p><h2 id="teacher-key-utilities-title">Protect and prepare</h2><p>Utilities stay separate from learner work. No learner details appear here.</p></div>
      <div class="teacher-key-utility-actions">
        <button class="button secondary" type="button" data-teacher-action="export-backup">Export local backup</button>
        <button class="button secondary" type="button" data-teacher-action="import-backup">Import local backup</button>
        <input class="sr-only" type="file" accept="application/json,.json" data-teacher-backup-file tabindex="-1" />
        <button class="button secondary" type="button" data-teacher-action="inspect-destinations">Inspect destinations</button>
        <button class="text-button" type="button" data-teacher-action="reset-tools">Separated reset tools</button>
      </div>
      <p class="small muted">${profileCount} local ${profileCount === 1 ? 'profile' : 'profiles'} · Teacher access closes on refresh.</p>
    </section>
  </section>`;
}

/**
 * Small controller for the room's own UI. Product-level routing, grants,
 * backups and destructive confirmations remain explicit callbacks owned by the
 * application shell.
 */
export class TeacherKeyRoomController {
  constructor(root, {
    manifest = [],
    destinations = [],
    session = null,
    preferencesStore = null,
    profileCount = 0,
    onExit = null,
    onOpenKey = null,
    onAddKeyToAllProfiles = null,
    onExportBackup = null,
    onImportBackup = null,
    onInspectDestinations = null,
    onOpenResetTools = null,
    onFeedback = null,
    onError = null,
  } = {}) {
    if (!root) throw new TypeError('A Teacher Key Room root is required');
    this.root = root;
    this.manifest = manifest;
    this.destinations = destinations;
    this.entries = createTeacherKeyLibrary(manifest, { destinations });
    this.session = session;
    this.preferencesStore = preferencesStore || new TeacherKeyPreferencesStore({ manifest });
    this.profileCount = profileCount;
    this.onExit = onExit;
    this.onOpenKey = onOpenKey;
    this.onAddKeyToAllProfiles = onAddKeyToAllProfiles;
    this.onExportBackup = onExportBackup;
    this.onImportBackup = onImportBackup;
    this.onInspectDestinations = onInspectDestinations;
    this.onOpenResetTools = onOpenResetTools;
    this.onFeedback = onFeedback;
    this.onError = onError;
    this.preferences = this.preferencesStore.getSnapshot();
    this.filters = { query: '', environment: 'all', subject: 'all', scale: 'all', topic: 'all' };
    this.display = new FullScreenKeyDisplay({ document: root.ownerDocument });
    this.onInput = this.onInput.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  async mount() {
    this.preferences = await this.preferencesStore.load();
    this.render();
    this.root.addEventListener('input', this.onInput);
    this.root.addEventListener('change', this.onChange);
    this.root.addEventListener('click', this.onClick);
    return this;
  }

  render() {
    this.root.innerHTML = renderTeacherKeyRoom({
      entries: this.entries,
      favouriteIds: this.preferences.favouriteKeyIds,
      filters: this.filters,
      showTitleOnBoard: this.preferences.showTitleOnBoard,
      profileCount: this.profileCount,
    });
  }

  renderResults() {
    const results = this.root.querySelector('[data-teacher-key-results]');
    if (!results) return;
    const filtered = filterTeacherKeyLibrary(this.entries, {
      ...this.filters,
      favouriteIds: this.preferences.favouriteKeyIds,
    });
    results.innerHTML = renderTeacherKeyResults(filtered, this.preferences.favouriteKeyIds);
  }

  onInput(event) {
    if (event.target.matches('[data-teacher-filter="query"]')) {
      this.filters.query = event.target.value;
      this.renderResults();
    }
  }

  async onChange(event) {
    const filter = event.target.dataset.teacherFilter;
    if (filter && filter !== 'query') {
      this.filters[filter] = event.target.value;
      this.renderResults();
    }
    if (event.target.matches('[data-teacher-board-title]')) {
      this.preferences = await this.preferencesStore.setShowTitleOnBoard(event.target.checked);
    }
    if (event.target.matches('[data-teacher-backup-file]') && event.target.files?.[0]) {
      await this.call(this.onImportBackup, event.target.files[0]);
      event.target.value = '';
    }
  }

  async onClick(event) {
    const button = event.target.closest('[data-teacher-action]');
    if (!button || !this.root.contains(button)) return;
    const action = button.dataset.teacherAction;
    const entry = getTeacherKeyEntry(button.dataset.keyId, this.entries);
    try {
      if (action === 'topic') {
        this.filters.topic = this.filters.topic === button.dataset.topic ? 'all' : button.dataset.topic;
        this.root.querySelectorAll('[data-teacher-action="topic"]').forEach((topicButton) => {
          topicButton.setAttribute('aria-pressed', String(this.filters.topic === topicButton.dataset.topic));
        });
        this.renderResults();
      }
      if (action === 'exit') {
        const returnLocation = this.session?.close?.() ?? null;
        await this.call(this.onExit, returnLocation);
      }
      if (action === 'open' && entry) await this.call(this.onOpenKey, entry.key, entry);
      if (action === 'display' && entry) await this.display.open(entry, { showTitle: this.preferences.showTitleOnBoard });
      if (action === 'copy' && entry) {
        await copyTeacherKeyCode(entry, { document: this.root.ownerDocument });
        this.feedback(`${entry.code} copied.`);
      }
      if (action === 'print-card' && entry) {
        printTeacherHTML(renderPrintableTodayKeyCard(entry, { showTitle: this.preferences.showTitleOnBoard }), {
          document: this.root.ownerDocument,
          window: this.root.ownerDocument.defaultView,
        });
      }
      if (action === 'favourite' && entry) {
        this.preferences = await this.preferencesStore.toggleFavourite(entry.id);
        this.render();
      }
      if (action === 'add-all' && entry) await this.call(this.onAddKeyToAllProfiles, entry.key, entry);
      if (action === 'print-guide') this.printGuide('all');
      if (action === 'print-environment') this.printGuide(button.dataset.environmentId);
      if (action === 'print-quick-cards') {
        const quick = getQuickTeacherKeys(this.entries, this.preferences.favouriteKeyIds);
        printTeacherHTML(renderPrintableTodayKeyCards(quick, { showTitle: this.preferences.showTitleOnBoard }), {
          document: this.root.ownerDocument,
          window: this.root.ownerDocument.defaultView,
        });
      }
      if (action === 'export-backup') await this.call(this.onExportBackup);
      if (action === 'import-backup') this.root.querySelector('[data-teacher-backup-file]')?.click();
      if (action === 'inspect-destinations') await this.call(this.onInspectDestinations, this.destinations);
      if (action === 'reset-tools') await this.call(this.onOpenResetTools);
    } catch (error) {
      this.onError?.(error);
      if (!this.onError) console.error(error);
    }
  }

  printGuide(environmentId) {
    const environment = this.entries.find((entry) => entry.environment.id === environmentId)?.environment;
    const title = environment ? `${environment.title} Key Guide` : 'Complete Teacher Key Guide';
    printTeacherHTML(renderPrintableTeacherKeyGuide(this.entries, { title, environmentId }), {
      document: this.root.ownerDocument,
      window: this.root.ownerDocument.defaultView,
    });
  }

  feedback(message) {
    this.onFeedback?.(message);
  }

  async call(callback, ...args) {
    if (typeof callback === 'function') return callback(...args);
    return undefined;
  }

  destroy() {
    this.display.close();
    this.root.removeEventListener('input', this.onInput);
    this.root.removeEventListener('change', this.onChange);
    this.root.removeEventListener('click', this.onClick);
  }
}
