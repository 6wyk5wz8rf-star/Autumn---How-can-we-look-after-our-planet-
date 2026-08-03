import { renderShell } from '../components/AppShell.js';
import { renderProfileModal, renderCreateProfileForm, profileSymbolIcon } from '../components/ProfileGate.js';
import { Keypad } from '../components/Keypad.js';
import { renderConfirmModal } from '../components/Modal.js';
import { renderKeyGuide } from '../components/KeyGuide.js';
import {
  renderAtlasView,
  renderCollectionView,
  renderEditArtifactModal,
  renderGlossary,
  renderHomeView,
  renderKeyEntryView,
  renderKeysView,
  renderLivingThingsHost,
  renderPlanetQuestionModal,
  renderSettingsView,
  renderVersionCompareModal,
  renderWorkDetailView,
  renderWorkView,
} from './views.js';
import {
  ACTIVITY_STAGE_COUNT,
  defaultActivityState,
  activityKind,
  outcomeTypeForActivity,
  renderActivityView,
  normaliseActivityState,
  titleForOutcome,
} from '../destinations/planet-atlas/activityExperience.js';
import { ACTIVITIES, getActivityById } from '../data/activities.js';
import { getNumberTool } from '../data/numberExpedition.js';
import { getScienceTool } from '../data/livingThings.js';
import { KEY_MANIFEST, getKeyByCode } from '../data/keys.js';
import { DESTINATIONS } from '../data/destinations.js';
import { GLOSSARY } from '../data/glossary.js';
import { parseRoute, navigate, routeLabel } from '../utils/router.js';
import { escapeAttr, escapeHTML, qsa, setDocumentTitle } from '../utils/dom.js';
import { formatDate } from '../utils/format.js';
import { openDatabase, clearStore, getDatabaseStatus, STORES } from '../services/db.js';
import {
  createProfile,
  deleteProfile,
  getActiveProfile,
  listProfiles,
  setActiveProfile,
} from '../services/profiles.js';
import {
  clearProfileKeyAccess,
  grantKey,
  grantKeyToEveryProfile,
  linkArtefactToActivityAccess,
  listActivityAccess,
  recordActivityVisit,
  syncGrantedActivities,
} from '../services/keyAccess.js';
import {
  addArtefactReflection,
  addPlanetQuestionResponse,
  clearProfileWork,
  createArtefact,
  deleteArtefact,
  duplicateArtefact,
  getActivityState,
  getArtefactVersions,
  listArtefacts,
  listPlanetQuestionResponses,
  saveActivityState,
  updateArtefact,
} from '../services/artefacts.js';
import { downloadBackup, importBackup } from '../services/backup.js';
import { getSettings, updateSettings } from '../services/settings.js';
import { speak } from '../services/speech.js';
import { createAudioObjectUrl, revokeAudioObjectUrl, startAudioRecording } from '../services/audio.js';
import { registerServiceWorker, subscribeToNetworkStatus } from '../services/serviceWorker.js';
import {
  TeacherKeyRoomController,
  teacherKeySession,
} from '../teacher/index.js';

const APP_VERSION = 'build-3.0.0';

function renderNumberExpeditionHost({ toolId = null, activityId = null } = {}) {
  return `<div id="number-expedition" data-number-tool-id="${escapeAttr(toolId || '')}" data-number-activity-id="${escapeAttr(activityId || '')}"></div>`;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normaliseArtefact(record, versions = null) {
  if (!record) return null;
  return {
    ...record,
    type: record.artefactType || record.type,
    content: record.structuredContent || record.content || {},
    explanation: record.writtenExplanation || record.explanation || '',
    activity: record.activityId || record.activity,
    destination: record.destinationId || record.destination,
    versions: versions || record.versions,
  };
}

function normaliseResponse(record) {
  return {
    ...record,
    text: record.shortText || record.text || '',
    evidenceIds: record.linkedArtefactIds || [],
    evidenceUsed: record.evidence || '',
    whatChanged: record.whatChangedMyThinking || '',
    stillWondering: record.stillWondering || '',
    sourceActivityTitle: getActivityById(record.sourceActivityId)?.title || '',
  };
}

function settingsForView(settings) {
  const textSize = settings.textScale >= 1.27 ? 'largest' : settings.textScale >= 1.1 ? 'large' : 'normal';
  return {
    ...settings,
    textSize,
    contrast: settings.highContrast ? 'high' : 'normal',
    motion: settings.reducedMotion ? 'reduced' : 'full',
    complexity: settings.reducedComplexity ? 'reduced' : 'full',
  };
}

function keyActivityIds(key) {
  if (Array.isArray(key.activityIds) && key.activityIds.length) return key.activityIds.filter((id) => id !== '*');
  const ids = [];
  for (const permission of key.permissionsGranted || []) {
    if (String(permission).startsWith('activity:')) ids.push(String(permission).slice('activity:'.length));
  }
  for (const grant of key.grants || []) {
    ids.push(...(grant.activityIds || []).filter((id) => id !== '*'));
  }
  return [...new Set(ids)];
}

function printableProfileName(profile) {
  return profile?.displayName || profile?.name || 'Learner';
}

function placeIdFromState(state) {
  const place = String(state.place || '').trim().toLowerCase();
  if (place.includes('gambia')) return 'gambia';
  if (place.includes('kingdom') || place === 'uk') return 'uk';
  return place.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'chosen-place';
}

function activityOutcomeContent(activity, state, map) {
  const kind = activityKind(activity);
  const mapState = map?.getState?.() || state.mapState || {};
  const route = map?.getJourneySummary?.() || state.route || null;
  const markers = Array.isArray(mapState.markers) ? mapState.markers : [];
  const lastMarker = markers.at(-1) || null;
  const base = { ...state, mapState, route, outcomeSchemaVersion: 1 };

  if (kind === 'forms') return {
    ...base,
    globeView: state.viewPreviews?.globe || null,
    worldMapView: state.viewPreviews?.flat || null,
    atlasView: state.viewPreviews?.close || null,
    recognisableFeature: state.recognisable,
    purposeChoice: state.useful,
  };
  if (kind === 'africa') return {
    ...base,
    placeId: 'africa',
    marker: lastMarker || { coordinates: null, status: 'not-yet-placed' },
    evidenceAnnotations: state.evidence,
  };
  if (kind === 'gambia') return {
    ...base,
    placeId: 'gambia',
    coordinates: lastMarker?.coordinates || null,
    pinStatus: lastMarker ? 'placed-by-learner' : 'not-yet-placed',
    scaleTrail: state.scaleTrailVisited || [],
    contextViews: ['Senegal', 'Atlantic Ocean', 'River Gambia'],
  };
  if (kind === 'climate') return {
    ...base,
    selectedPlaces: state.selections.length ? state.selections : ['north-of-equator', 'south-of-equator', 'near-equator'],
    broadPattern: state.observation || 'A broad latitude pattern inspected on the map.',
    caution: state.explanation,
    additionalInfluences: ['altitude', 'distance from oceans', 'winds'],
  };
  if (kind === 'compare') return {
    ...base,
    leftPlaceId: 'uk',
    rightPlaceId: 'gambia',
    evidence: state.evidence.length ? state.evidence : state.selections,
    similarity: state.recognisable,
    difference: state.changes,
    matchedScale: true,
  };
  if (kind === 'journey') return {
    ...base,
    origin: route?.origin || { label: state.region || 'Origin', coordinates: null },
    destination: route?.destination || { label: state.place || 'Destination', coordinates: null },
    routeGeometry: route ? [route.origin.coordinates, route.destination.coordinates] : [],
    broadDirection: route?.direction || null,
    approximateDistanceKm: route?.distanceKm || null,
    crossesEquator: route?.crossesEquator ?? null,
    continents: route?.continents || [],
    oceans: route?.oceans || [],
  };
  if (kind === 'portrait') return {
    ...base,
    mode: state.mode || 'guided',
    placeId: placeIdFromState(state),
    selectedEvidence: state.evidence.length ? state.evidence : state.selections,
    country: state.place,
    region: state.region,
    broadClimate: state.climate,
    physicalFeature: state.feature,
    habitatOrBiome: state.habitat,
    numericalFact: state.numberFact,
  };
  return {
    ...base,
    responseDate: new Date().toISOString(),
    shortSentence: state.explanation || state.observation,
    linkedArtefactIds: [],
    stillWondering: state.question,
  };
}

export class App {
  constructor(root) {
    this.root = root;
    this.route = parseRoute();
    this.profiles = [];
    this.profile = null;
    this.settings = null;
    this.access = [];
    this.artifacts = [];
    this.responses = [];
    this.activityState = null;
    this.atlasOpenState = null;
    this.pendingAtlasFocus = null;
    this.workFilter = 'all';
    this.profileModalOpen = false;
    this.profileCreateMode = false;
    this.modalHTML = '';
    this.glossaryOpen = false;
    this.glossaryReturnFocus = null;
    this.map = null;
    this.numberExpedition = null;
    this.numberOpenStates = new Map();
    this.numberVoiceExplanation = null;
    this.livingThings = null;
    this.scienceOpenStates = new Map();
    this.scienceVoiceExplanation = null;
    this.teacherRoom = null;
    this.teacherPreviewActivityId = null;
    this.keyEntryOrigin = null;
    this.AtlasMapClass = null;
    this.NumberExpeditionClass = null;
    this.LivingThingsClass = null;
    this.keypad = null;
    this.recording = null;
    this.planetQuestionVoice = null;
    this.revisingArtifactId = null;
    this.persistenceStatus = { persistent: true, usingFallback: false };
    this.audioUrls = [];
    this.modalWasOpen = false;
    this.modalReturnFocus = null;
    this.keyAttempts = 0;
    this.activitySaveTimer = null;
    this.pendingActivitySave = null;
    this.lastRouteSignature = '';
    this.pendingToast = '';
    this.pendingDeleteArtifactId = null;
    this.pendingProfileAction = null;
    this.maintenanceUnlocked = false;
    this.onClick = this.onClick.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPageHide = this.onPageHide.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onRouteChange = this.onRouteChange.bind(this);
  }

  async init() {
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('input', this.onInput);
    this.root.addEventListener('change', this.onChange);
    this.root.addEventListener('submit', this.onSubmit);
    this.root.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('hashchange', this.onRouteChange);
    window.addEventListener('pagehide', this.onPageHide);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    try {
      this.persistenceStatus = await openDatabase();
      this.profiles = await listProfiles();
      this.profile = await getActiveProfile();
      if (!this.profile && this.profiles.length === 1) {
        await setActiveProfile(this.profiles[0].id);
        this.profile = this.profiles[0];
      }
      if (this.profile) await this.loadProfileData();
      else this.profileModalOpen = true;
      await this.prepareRoute();
      await this.render();
      this.registerOfflineSystems();
    } catch (error) {
      console.error(error);
      this.renderFatal(error);
    }
  }

  async registerOfflineSystems() {
    subscribeToNetworkStatus(({ online }) => {
      document.documentElement.dataset.network = online ? 'online' : 'offline';
      if (!online) this.toast('You are offline. The atlas and saved work remain available.');
    });
    const result = await registerServiceWorker({
      updateIntervalMs: 60 * 60 * 1000,
      onUpdateAvailable: () => this.toast('A newer version is ready. It will update safely when you reopen the app.'),
    });
    if (!result.registered && result.error) console.warn('Offline registration:', result.error);
  }

  async onRouteChange() {
    await this.flushActivityStateSave();
    await this.cancelActiveRecording({ clearPlanetVoice: true });
    const nextRoute = parseRoute();
    const continuingNumberVoice = (nextRoute.name === 'number-tool' && this.route.name === 'number-tool' && nextRoute.params?.toolId === this.route.params?.toolId)
      || (nextRoute.name === 'activity' && this.route.name === 'activity' && nextRoute.params?.activityId === this.route.params?.activityId);
    if (!continuingNumberVoice) this.numberVoiceExplanation = null;
    const continuingScienceVoice = (nextRoute.name === 'science-tool' && this.route.name === 'science-tool' && nextRoute.params?.toolId === this.route.params?.toolId)
      || (nextRoute.name === 'activity' && this.route.name === 'activity' && nextRoute.params?.activityId === this.route.params?.activityId);
    if (!continuingScienceVoice) this.scienceVoiceExplanation = null;
    if (nextRoute.name !== 'activity' || nextRoute.params?.activityId !== this.teacherPreviewActivityId) {
      this.teacherPreviewActivityId = null;
    }
    if (this.route.name === 'maintenance' && nextRoute.name !== 'maintenance') {
      if (teacherKeySession.getState().active) teacherKeySession.close();
      this.maintenanceUnlocked = false;
    }
    const revision = this.revisingArtifactId
      ? this.artifacts.find((item) => item.id === this.revisingArtifactId)
      : null;
    const expectedRoute = revision?.activityId === 'open-atlas-exploration'
      ? 'atlas'
      : revision?.activityId?.startsWith('open-science-')
        ? 'science-tool'
        : revision?.activityId
          ? 'activity'
          : null;
    const stillRevising = expectedRoute === nextRoute.name
      && (nextRoute.name !== 'activity' || nextRoute.params.activityId === revision?.activityId)
      && (nextRoute.name !== 'science-tool' || nextRoute.params.toolId === revision?.content?.scienceState?.toolId);
    if (!stillRevising) this.revisingArtifactId = null;
    this.route = nextRoute;
    this.modalHTML = '';
    this.glossaryOpen = false;
    await this.prepareRoute();
    await this.render();
  }

  onPageHide() {
    void this.flushActivityStateSave().catch(() => {});
  }

  onVisibilityChange() {
    if (document.visibilityState === 'hidden') void this.flushActivityStateSave().catch(() => {});
  }

  async prepareRoute() {
    if (!this.profile) return;
    if (this.route.name === 'activity') {
      const activity = getActivityById(this.route.params.activityId);
      if (!activity) {
        this.pendingToast = 'That pathway could not be found.';
        this.route = { name: 'keys', params: {} };
        return;
      }
      const teacherPreview = this.teacherPreviewActivityId === activity.id;
      const allowed = teacherPreview || this.access.some((item) => item.activityId === activity.id);
      if (!allowed) {
        this.pendingToast = 'Enter the four-digit key to remember and open that guided pathway.';
        this.route = { name: 'key', params: {} };
        return;
      }
      const savedDraft = teacherPreview ? null : await getActivityState(this.profile.id, activity.id);
      this.activityState = ['number-expedition', 'living-things-observatory'].includes(activity.destinationId)
        ? (savedDraft?.state || null)
        : normaliseActivityState(activity, savedDraft?.state);
      if (!teacherPreview && this.lastRouteSignature !== `activity:${activity.id}`) {
        await recordActivityVisit(this.profile.id, activity).catch(() => {});
      }
    }
    if (this.route.name === 'work-detail') {
      const artifact = this.artifacts.find((item) => item.id === this.route.params.artifactId);
      if (artifact && !artifact.versions) {
        const versions = await getArtefactVersions(this.profile.id, artifact.id);
        artifact.versions = versions.map((version) => ({
          ...version.snapshot,
          version: version.version,
          createdAt: version.createdAt,
          reason: version.reason,
          explanation: version.snapshot?.writtenExplanation,
        }));
      }
    }
  }

  async loadProfileData() {
    if (!this.profile) return;
    this.settings = await getSettings(this.profile.id);
    this.applySettings();
    await syncGrantedActivities(this.profile.id, ACTIVITIES);
    const [access, artefacts, responses] = await Promise.all([
      listActivityAccess(this.profile.id, { activityRegistry: ACTIVITIES }),
      listArtefacts(this.profile.id),
      listPlanetQuestionResponses(this.profile.id),
    ]);
    this.access = access;
    this.artifacts = artefacts.map((record) => normaliseArtefact(record));
    this.responses = responses.map(normaliseResponse);
  }

  persistenceIsDurable() {
    return getDatabaseStatus().persistent !== false && this.persistenceStatus?.persistent !== false;
  }

  applySettings() {
    if (!this.settings) return;
    const root = document.documentElement;
    const view = settingsForView(this.settings);
    root.dataset.textSize = view.textSize;
    root.dataset.contrast = view.contrast;
    root.dataset.motion = view.motion;
    root.dataset.complexity = view.complexity;
    root.dataset.scaffold = view.scaffold;
    root.style.setProperty('--text-scale', String(view.textScale));
  }

  async render({ preserveFocus = false } = {}) {
    const preservedFocus = preserveFocus ? this.captureFocusTarget(document.activeElement) : null;
    if (this.recording) await this.cancelActiveRecording();
    this.destroyMountedView();
    const route = this.guardedRoute();
    const signature = `${route.name}:${route.params?.activityId || route.params?.artifactId || route.params?.toolId || route.params?.keyId || ''}`;
    const content = this.renderRoute(route);
    let modal = this.modalHTML;
    if (!this.profile || this.profileModalOpen) {
      modal = renderProfileModal(this.profiles, {
        forceCreate: this.profileCreateMode || !this.profiles.length,
        canClose: Boolean(this.profile),
      });
    }
    const willShowModal = Boolean(modal);
    if (willShowModal && !this.modalWasOpen) this.modalReturnFocus = this.captureFocusTarget(document.activeElement);
    this.root.innerHTML = renderShell({
      route,
      profile: this.profile,
      content,
      modal,
      persistenceWarning: !this.persistenceIsDurable(),
    });
    if (this.glossaryOpen) this.mountGlossary();
    await this.mountRoute(route);
    this.setModalState(willShowModal);
    setDocumentTitle(routeLabel(route));
    if (!willShowModal && !preserveFocus && signature !== this.lastRouteSignature) {
      requestAnimationFrame(() => this.root.querySelector('#main-content')?.focus({ preventScroll: true }));
    }
    if (!willShowModal && this.modalWasOpen) this.restoreModalFocus();
    else if (!willShowModal && preservedFocus) this.restoreFocusTarget(preservedFocus);
    this.modalWasOpen = willShowModal;
    this.lastRouteSignature = signature;
    if (this.pendingToast) {
      const message = this.pendingToast;
      this.pendingToast = '';
      this.toast(message);
    }
  }

  guardedRoute() {
    if (['maintenance', 'key-guide'].includes(this.route.name)
      && (!this.maintenanceUnlocked || !teacherKeySession.getState().active)) {
      return { name: 'key', params: {} };
    }
    return this.route;
  }

  renderRoute(route) {
    switch (route.name) {
      case 'atlas': return renderAtlasView();
      case 'numbers': return renderNumberExpeditionHost();
      case 'number-tool': return getNumberTool(route.params.toolId)
        ? renderNumberExpeditionHost({ toolId: route.params.toolId })
        : renderNumberExpeditionHost();
      case 'living-things': return renderLivingThingsHost();
      case 'science-tool': return getScienceTool(route.params.toolId)
        ? renderLivingThingsHost({ toolId: route.params.toolId })
        : renderLivingThingsHost();
      case 'keys': return renderKeysView({ activities: ACTIVITIES, access: this.access, artifacts: this.artifacts });
      case 'collection': {
        const key = KEY_MANIFEST.find((entry) => entry.id === route.params.keyId && entry.type === 'collection');
        return renderCollectionView({ key, activities: ACTIVITIES, artifacts: this.artifacts });
      }
      case 'work': return renderWorkView({
        artifacts: this.artifacts.map((item) => this.withAudioPlayback(item, item.voiceExplanation)),
        responses: this.responses.map((item) => this.withAudioPlayback(item, item.voiceResponse)),
        activeFilter: this.workFilter,
      });
      case 'work-detail': {
        const artifact = this.artifacts.find((item) => item.id === route.params.artifactId);
        return renderWorkDetailView(artifact ? this.withAudioPlayback(artifact, artifact.voiceExplanation) : null);
      }
      case 'key': return renderKeyEntryView();
      case 'settings': return renderSettingsView({ settings: settingsForView(this.settings || {}) });
      case 'maintenance': return '<div id="teacher-key-room-host"></div>';
      case 'key-guide': return renderKeyGuide(KEY_MANIFEST);
      case 'activity': {
        const activity = getActivityById(route.params.activityId);
        const saved = this.artifacts.some((item) => item.activityId === activity?.id);
        if (activity?.destinationId === 'number-expedition') {
          return renderNumberExpeditionHost({ toolId: activity.toolId, activityId: activity.id });
        }
        if (activity?.destinationId === 'living-things-observatory') {
          return renderLivingThingsHost({ toolId: activity.toolId, activityId: activity.id });
        }
        return activity ? renderActivityView(activity, this.activityState || defaultActivityState(activity), {
          savedBefore: saved,
          scaffold: this.settings?.scaffold || 'core',
        }) : renderKeyEntryView();
      }
      case 'home':
      default: {
        const latestAccess = this.access[0];
        const recentActivity = latestAccess ? getActivityById(latestAccess.activityId) : null;
        return renderHomeView({ profile: this.profile, recentActivity, workCount: this.artifacts.length });
      }
    }
  }

  async mountRoute(route) {
    if (route.name === 'key' || route.name === 'home') {
      const root = this.root.querySelector('[data-keypad-root]');
      if (root) this.keypad = new Keypad(root, { onComplete: (code, keypad) => this.handleKey(code, keypad) });
    }
    if (route.name === 'atlas') await this.mountOpenAtlas();
    if (route.name === 'numbers' || route.name === 'number-tool') await this.mountNumberExpedition(route);
    if (route.name === 'living-things' || route.name === 'science-tool') await this.mountLivingThings(route);
    if (route.name === 'activity') {
      const activity = getActivityById(route.params.activityId);
      if (activity?.destinationId === 'number-expedition') await this.mountNumberExpedition(route, activity);
      else if (activity?.destinationId === 'living-things-observatory') await this.mountLivingThings(route, activity);
      else await this.mountActivityAtlas();
    }
    if (route.name === 'maintenance') await this.mountTeacherKeyRoom();
    if (this.root.querySelector('.modal-backdrop')) {
      requestAnimationFrame(() => this.root.querySelector('.modal-backdrop input, .modal-backdrop button')?.focus());
    }
  }

  destroyMountedView() {
    this.keypad?.destroy();
    this.keypad = null;
    this.map?.destroy();
    this.map = null;
    this.numberExpedition?.destroy();
    this.numberExpedition = null;
    this.livingThings?.destroy();
    this.livingThings = null;
    this.teacherRoom?.destroy();
    this.teacherRoom = null;
    this.audioUrls.forEach((url) => revokeAudioObjectUrl(url));
    this.audioUrls = [];
  }

  withAudioPlayback(record, blob) {
    if (!record || typeof Blob === 'undefined' || !(blob instanceof Blob)) return record;
    const voicePlaybackUrl = createAudioObjectUrl(blob);
    if (!voicePlaybackUrl) return record;
    this.audioUrls.push(voicePlaybackUrl);
    return { ...record, voicePlaybackUrl };
  }

  captureFocusTarget(element) {
    if (!(element instanceof Element) || !this.root.contains(element)) return null;
    if (element.id) return { id: element.id };
    const names = [
      'data-action', 'data-route', 'data-route-value',
      'data-work-filter', 'data-setting', 'data-value', 'data-artifact-id',
      'data-profile-id', 'data-reflection-choice',
    ];
    const attributes = names
      .filter((name) => element.hasAttribute(name))
      .map((name) => [name, element.getAttribute(name)]);
    if (attributes.length) return { attributes };
    return null;
  }

  setModalState(open) {
    const header = this.root.querySelector('.app-header');
    const main = this.root.querySelector('#main-content');
    [header, main].forEach((element) => {
      if (element) element.inert = Boolean(open);
    });
  }

  restoreModalFocus() {
    const target = this.modalReturnFocus;
    this.modalReturnFocus = null;
    this.restoreFocusTarget(target, this.root.querySelector('#main-content'));
  }

  restoreFocusTarget(target, fallback = null) {
    requestAnimationFrame(() => {
      let element = target?.id ? document.getElementById(target.id) : null;
      if (!element && target?.attributes?.length) {
        const safe = (value) => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const selector = target.attributes
          .map(([name, value]) => `[${name}="${safe(value)}"]`)
          .join('');
        element = this.root.querySelector(selector);
      }
      (element || fallback)?.focus({ preventScroll: true });
    });
  }

  async closeModal({ clearPlanetVoice = true } = {}) {
    await this.cancelActiveRecording({ clearPlanetVoice });
    this.modalHTML = '';
    if (this.profile) {
      this.profileModalOpen = false;
      this.profileCreateMode = false;
    }
    await this.render({ preserveFocus: true });
  }

  onKeyDown(event) {
    const modal = this.root.querySelector('.modal-backdrop .modal');
    if (event.key === 'Escape') {
      if (modal) {
        if (!this.profile && this.profileModalOpen) return;
        event.preventDefault();
        void this.closeModal();
        return;
      }
      if (this.glossaryOpen) {
        event.preventDefault();
        this.closeGlossary();
      }
      return;
    }
    if (event.key !== 'Tab' || !modal) return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async getAtlasMapClass() {
    if (!this.AtlasMapClass) {
      const module = await import('../destinations/planet-atlas/AtlasMap.js');
      this.AtlasMapClass = module.default;
    }
    return this.AtlasMapClass;
  }

  async getNumberExpeditionClass() {
    if (!this.NumberExpeditionClass) {
      const module = await import('../destinations/number-expedition/NumberExpedition.js');
      this.NumberExpeditionClass = module.default;
    }
    return this.NumberExpeditionClass;
  }

  async getLivingThingsClass() {
    if (!this.LivingThingsClass) {
      const module = await import('../destinations/living-things/LivingThingsObservatory.js');
      this.LivingThingsClass = module.default;
    }
    return this.LivingThingsClass;
  }

  async mountOpenAtlas() {
    const host = this.root.querySelector('#atlas-map');
    if (!host) return;
    const AtlasMap = await this.getAtlasMapClass();
    if (!host.isConnected) return;
    this.map = new AtlasMap(host, {
      state: this.atlasOpenState,
      reducedMotion: this.settings?.reducedMotion,
      onChange: (state) => { this.atlasOpenState = state; },
    });
    host.setAttribute('aria-busy', 'false');
    if (this.pendingAtlasFocus) {
      const focus = this.pendingAtlasFocus;
      this.pendingAtlasFocus = null;
      await this.map.focusPlace(focus, { animate: !this.settings?.reducedMotion }).catch(() => {});
    }
  }

  async mountActivityAtlas() {
    const host = this.root.querySelector('#activity-atlas-map');
    const activity = getActivityById(this.route.params.activityId);
    if (!host || !activity) return;
    const AtlasMap = await this.getAtlasMapClass();
    if (!host.isConnected) return;
    const state = this.activityState || defaultActivityState(activity);
    this.map = new AtlasMap(host, {
      state: state.mapState,
      title: activity.title,
      description: activity.enquiry || activity.description,
      guided: true,
      reducedMotion: this.settings?.reducedMotion,
      onChange: (mapState, reason) => {
        state.mapState = mapState;
        if (activityKind(activity) === 'journey') state.route = this.map?.getJourneySummary();
        this.scheduleActivityStateSave();
        this.describeMapFeedback(activity, mapState, reason);
      },
    });
    host.setAttribute('aria-busy', 'false');
    this.prepareActivityMap(activity, state);
    if (this.settings?.spokenInstructions && this.lastRouteSignature !== `activity:${activity.id}`) {
      setTimeout(() => {
        if (this.route.name === 'activity' && this.route.params.activityId === activity.id) {
          void this.speakActivityInstructions();
        }
      }, 180);
    }
  }

  async mountNumberExpedition(route, activity = null) {
    const host = this.root.querySelector('#number-expedition');
    if (!host) return;
    const NumberExpedition = await this.getNumberExpeditionClass();
    if (!host.isConnected) return;
    const toolId = activity?.toolId || route.params?.toolId || null;
    this.numberExpedition = new NumberExpedition(host, {
      toolId,
      activity,
      savedState: activity ? this.activityState : this.numberOpenStates.get(toolId),
      scaffold: this.settings?.scaffold || 'core',
      onChange: (state) => {
        if (activity && this.teacherPreviewActivityId !== activity.id) {
          this.activityState = state;
          this.scheduleActivityStateSave();
        } else if (activity) {
          this.activityState = state;
        } else {
          this.numberOpenStates.set(toolId, state);
        }
      },
      onSave: (payload, state) => this.saveNumberWork(payload, state),
      onSpeak: (text) => this.speakVisible(text),
      onToast: (message) => this.toast(message),
    });
  }

  async mountLivingThings(route, activity = null) {
    const host = this.root.querySelector('#living-things-observatory');
    if (!host) return;
    const LivingThingsObservatory = await this.getLivingThingsClass();
    if (!host.isConnected) return;
    const toolId = activity?.toolId || route.params?.toolId || null;
    this.livingThings = new LivingThingsObservatory(host, {
      toolId,
      activity,
      savedState: activity ? this.activityState : this.scienceOpenStates.get(toolId),
      scaffold: this.settings?.scaffold || 'core',
      onChange: (state) => {
        if (activity && this.teacherPreviewActivityId !== activity.id) {
          this.activityState = state;
          this.scheduleActivityStateSave();
        } else if (activity) {
          this.activityState = state;
        } else if (toolId) {
          this.scienceOpenStates.set(toolId, state);
        }
      },
      onSave: (payload, state) => this.saveScienceWork(payload, state),
      onSpeak: (text) => this.speakVisible(text),
      onRecord: (button) => this.toggleVoiceRecording(button),
      onToast: (message) => this.toast(message),
    });
  }

  async mountTeacherKeyRoom() {
    const host = this.root.querySelector('#teacher-key-room-host');
    if (!host || !this.maintenanceUnlocked || !teacherKeySession.getState().active) return;
    this.teacherRoom = new TeacherKeyRoomController(host, {
      manifest: KEY_MANIFEST,
      destinations: DESTINATIONS,
      session: teacherKeySession,
      profileCount: this.profiles.length,
      onExit: (returnLocation) => this.exitTeacherKeyRoom(returnLocation),
      onOpenKey: (key) => this.openTeacherKey(key),
      onAddKeyToAllProfiles: (key) => this.addTeacherKeyToAllProfiles(key),
      onExportBackup: () => this.exportBackup(),
      onImportBackup: (file) => this.restoreBackup(file),
      onInspectDestinations: () => this.inspectDestinations(),
      onOpenResetTools: () => this.openTeacherResetTools(),
      onFeedback: (message) => this.toast(message),
      onError: (error) => {
        console.error(error);
        this.toast(error?.message || 'That teacher utility could not complete.');
      },
    });
    await this.teacherRoom.mount();
  }

  prepareActivityMap(activity, state) {
    if (!this.map || state.mapState) return;
    const kind = activityKind(activity);
    const step = state.step || 0;
    if (kind === 'forms') this.map.focusPlace('world', { animate: false });
    if (kind === 'africa') this.map.setView('flat', { animate: false }).focusPlace(step ? 'africa' : 'world', { animate: false });
    if (kind === 'gambia') this.map.focusPlace(step ? 'west-africa' : 'world', { animate: false });
    if (kind === 'climate') {
      this.map.setLayer('equator', true);
      this.map.setLayer('climate', true);
      this.map.focusPlace('world', { animate: false });
    }
    if (kind === 'compare') this.map.comparePlaces('uk', 'gambia', { animate: false });
    if (kind === 'journey') this.map.setView('flat', { animate: false }).focusPlace('world', { animate: false });
    if (kind === 'portrait') this.map.focusPlace('gambia', { animate: false });
    if (kind === 'understanding') this.map.focusPlace('world', { animate: false });
  }

  describeMapFeedback(activity, mapState, reason) {
    if (reason === 'marker-added') {
      const marker = mapState.markers?.at(-1);
      const inspected = marker ? this.map?.inspectCoordinate(marker.coordinates) : null;
      const kind = activityKind(activity);
      if (kind === 'africa') this.toast(inspected ? `You placed a marker on ${inspected.properties?.displayName || 'land'}. Compare it with Africa’s outlined shape and the two oceans.` : 'Your marker is in the ocean. Use Africa’s western and eastern coastlines to test another place.');
      if (kind === 'gambia') this.toast(inspected?.properties?.isoNumeric === '270' ? 'Your Place Pin is in The Gambia.' : 'Use Senegal, the Atlantic coast and the River Gambia to narrow the search.');
    }
    if (reason === 'journey-point-added' && mapState.journey?.points?.length === 2) {
      const summary = this.map?.getJourneySummary();
      if (summary) this.toast(`Your thread is about ${Math.round(summary.distanceKm).toLocaleString('en-GB')} km. The distance is approximate.`);
    }
  }

  async handleKey(code, keypad) {
    const key = getKeyByCode(code);
    if (!key || key.active === false) {
      this.keyAttempts += 1;
      keypad.setMessage(this.keyAttempts >= 3
        ? 'That key did not match a pathway. Ask an adult to check the key with you.'
        : 'That key did not match a pathway. Check the four digits and try again.', 'quiet');
      keypad.reset({ keepMessage: true });
      return;
    }
    this.keyAttempts = 0;
    if (key.type === 'maintenance') {
      const returnLocation = this.keyEntryOrigin || (this.route.name === 'key' ? { name: 'home', params: {} } : this.route);
      teacherKeySession.open({ returnLocation });
      this.maintenanceUnlocked = true;
      this.keyEntryOrigin = null;
      keypad.setMessage('Teacher Key Room is ready.', 'success');
      await delay(320);
      navigate('maintenance');
      return;
    }
    if (!this.profile) return;
    try {
      await grantKey(this.profile.id, key, { activities: ACTIVITIES });
      this.access = await syncGrantedActivities(this.profile.id, ACTIVITIES);
      keypad.setMessage(`${key.childFacingTitle || key.title} is ready.`, 'success');
      await delay(420);
      const activityIds = keyActivityIds(key);
      if (key.type === 'activity' && activityIds[0]) navigate('activity', activityIds[0]);
      else if (key.type === 'collection') navigate('collection', key.id);
      else if (key.type === 'destination' && key.destinationId === 'number-expedition') navigate('numbers');
      else if (key.type === 'destination' && key.destinationId === 'living-things-observatory') navigate('living-things');
      else if (key.type === 'destination' && key.destinationId === 'planet-atlas') navigate('atlas');
      else if (key.type === 'world') navigate('home');
      else {
        this.pendingToast = `${key.childFacingTitle || key.title} has been added to My Keys.`;
        navigate('keys');
      }
    } catch (error) {
      console.error(error);
      keypad.setMessage('The pathway could not be saved just now. Your open atlas is still available.', 'quiet');
      keypad.reset({ keepMessage: true });
    }
  }

  async onClick(event) {
    const routeButton = event.target.closest('[data-route]');
    if (routeButton) {
      event.preventDefault();
      if (routeButton.dataset.route === 'atlas' && routeButton.dataset.atlasFocus) {
        this.pendingAtlasFocus = ({ 'river-gambia': 'gambia', 'atlantic-ocean': 'world' })[routeButton.dataset.atlasFocus]
          || routeButton.dataset.atlasFocus;
      }
      if (routeButton.dataset.route === 'key' && this.route.name !== 'key') {
        this.keyEntryOrigin = { name: this.route.name, params: { ...(this.route.params || {}) } };
      }
      navigate(routeButton.dataset.route, routeButton.dataset.routeValue);
      return;
    }

    const toggle = event.target.closest('[data-draft-toggle]');
    if (toggle) {
      const field = toggle.dataset.draftToggle;
      const value = toggle.dataset.value;
      const list = new Set(this.activityState[field] || []);
      list.has(value) ? list.delete(value) : list.add(value);
      this.activityState[field] = [...list];
      toggle.setAttribute('aria-pressed', String(list.has(value)));
      await this.respondToActivityChoice(value);
      this.scheduleActivityStateSave();
      return;
    }

    const single = event.target.closest('[data-draft-single]');
    if (single) {
      const field = single.dataset.draftSingle;
      this.activityState[field] = single.dataset.value;
      single.closest('[role="radiogroup"]')?.querySelectorAll('[data-draft-single]')
        .forEach((choice) => choice.setAttribute('aria-checked', String(choice === single)));
      this.scheduleActivityStateSave();
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      event.preventDefault();
      await this.handleAction(actionButton.dataset.action, actionButton);
      return;
    }

    const focusButton = event.target.closest('[data-map-focus-step], [data-map-tool], [data-work-filter], [data-setting], [data-reflection-choice]');
    if (focusButton) await this.handleSpecialButton(focusButton);
  }

  async handleSpecialButton(button) {
    if (button.dataset.mapFocusStep) {
      const place = button.dataset.mapFocusStep;
      if (place === 'gambia') {
        await this.map?.focusSequence('gambia');
        this.activityState.scaleTrailVisited = ['world', 'africa', 'west-africa', 'gambia'];
      } else {
        await this.map?.focusPlace(place);
        const trail = new Set(this.activityState.scaleTrailVisited || []);
        trail.add(place);
        this.activityState.scaleTrailVisited = [...trail];
      }
      this.scheduleActivityStateSave();
    }
    if (button.dataset.mapTool) await this.handleMapTool(button.dataset.mapTool);
    if (button.dataset.workFilter) {
      this.workFilter = button.dataset.workFilter;
      await this.render({ preserveFocus: true });
    }
    if (button.dataset.setting) await this.changeSetting(button.dataset.setting, button.dataset.value);
    if (button.dataset.reflectionChoice) {
      const textarea = this.root.querySelector('#edit-artifact-form textarea[name="reflection"]');
      if (textarea) {
        textarea.value = button.dataset.reflectionChoice;
        textarea.focus();
      }
    }
  }

  async handleMapTool(tool) {
    if (!this.map) return;
    if (tool === 'toggle-equator') this.map.setLayer('equator', !this.map.getState().equator);
    if (tool === 'compare-places') this.map.comparePlaces('uk', 'gambia');
    if (tool === 'journey') this.map.setTool('journey');
    if (tool === 'locate-africa') {
      await this.map.focusPlace('africa');
      this.map.setLayer('labels', false).setTool('marker');
    }
    if (tool === 'locate-gambia') {
      await this.map.focusPlace('west-africa');
      this.map.setLayer('labels', false).setTool('marker');
    }
  }

  async respondToActivityChoice(value) {
    if (!this.map) return;
    if (value === 'globe' || value === 'flat' || value === 'close') {
      if (value === 'globe') this.map.setView('globe');
      else this.map.setView('flat');
      await this.map.focusPlace(value === 'close' ? 'gambia' : 'world');
      const snapshot = this.map.createSnapshot({ title: `${value} representation` });
      this.activityState.viewPreviews = {
        ...(this.activityState.viewPreviews || {}),
        [value]: { state: snapshot.state, markup: snapshot.preview?.markup || '' },
      };
      this.scheduleActivityStateSave();
    }
    if (value === 'uk-gambia') this.map.setJourney([-0.1, 51.5], [-15.31, 13.45], { narration: '' });
    if (value === 'the-gambia') this.map.focusPlace('gambia');
    if (value === 'united-kingdom') this.map.focusPlace('uk');
  }

  async handleAction(action, button) {
    const actions = {
      'switch-profile': () => { this.profileModalOpen = true; this.profileCreateMode = false; return this.render(); },
      'close-profile-modal': () => { if (this.profile) return this.closeModal(); },
      'choose-profile': () => this.chooseProfile(button.dataset.profileId),
      'show-create-profile': () => { this.profileCreateMode = true; return this.render(); },
      'back-to-profiles': () => { this.profileCreateMode = false; return this.render(); },
      'choose-symbol': () => this.selectProfileChoice(button, 'symbol'),
      'choose-pattern': () => this.selectProfileChoice(button, 'pattern'),
      'open-glossary': () => {
        this.glossaryReturnFocus = this.captureFocusTarget(button);
        this.glossaryOpen = true;
        this.mountGlossary();
      },
      'close-glossary': () => this.closeGlossary(),
      'close-modal': () => this.closeModal(),
      'speak-text': () => this.speakVisible(button.dataset.speak || ''),
      'speak-activity-instructions': () => this.speakActivityInstructions(),
      'save-atlas-question': async () => {
        try {
          await this.saveAtlasSnapshot(this.root.querySelector('#atlas-question')?.value || '');
        } catch (error) {
          console.error(error);
          this.toast('This map question could not be saved. Your map is still open; try again.');
        }
      },
      'previous-activity-step': () => this.moveActivityStep(-1),
      'next-activity-step': () => this.moveActivityStep(1),
      'save-key-activity': async () => {
        try {
          await this.saveKeyActivity();
        } catch (error) {
          console.error(error);
          this.toast('This version could not be saved just now. Your pathway is still open so you can try again.');
        }
      },
      'open-planet-question': () => {
        this.planetQuestionVoice = null;
        this.modalHTML = renderPlanetQuestionModal({ artifacts: this.artifacts });
        return this.render({ preserveFocus: true });
      },
      'start-voice-response': () => this.toggleVoiceRecording(button),
      'duplicate-artifact': () => this.duplicateSavedWork(button.dataset.artifactId),
      'revise-artifact': () => this.reopenArtifact(button.dataset.artifactId),
      'add-reflection': () => this.openReflection(button.dataset.artifactId),
      'compare-versions': () => this.openVersionCompare(button.dataset.artifactId),
      'confirm-delete-artifact': () => this.confirmDeleteArtifact(button.dataset.artifactId),
      'delete-artifact': () => this.performDeleteArtifact(),
      'print-artifact': () => window.print(),
      'print-page': () => window.print(),
      'export-backup': () => this.exportBackup(),
      'choose-backup-file': () => this.root.querySelector('#backup-file')?.click(),
      'add-key-to-all': () => this.openAllProfilesKeyModal(),
      'profile-tools': () => this.openProfileTools(button.dataset.profileId),
      'reset-profile-keys': () => this.confirmProfileAction(button.dataset.profileId, 'keys'),
      'clear-profile-work': () => this.confirmProfileAction(button.dataset.profileId, 'work'),
      'delete-profile': () => this.confirmProfileAction(button.dataset.profileId, 'profile'),
      'perform-profile-action': () => this.performProfileAction(),
      'confirm-clear-all': () => this.confirmClearAll(),
      'clear-all-data': () => this.clearAllData(),
    };
    return actions[action]?.();
  }

  onInput(event) {
    const field = event.target.closest('[data-draft-field]');
    if (field && this.activityState) {
      this.activityState[field.dataset.draftField] = field.value;
      if (field.dataset.draftField === 'explanation' && this.map && activityKind(getActivityById(this.route.params.activityId)) === 'journey') {
        this.map.setJourneyNarration(field.value);
      }
      this.scheduleActivityStateSave();
    }
    if (event.target.matches('[data-glossary-search]')) this.filterGlossary(event.target.value);
  }

  async onChange(event) {
    if (event.target.matches('[data-setting-toggle]')) {
      await this.changeSetting(event.target.dataset.settingToggle, event.target.checked);
    }
    if (event.target.matches('#backup-file') && event.target.files?.[0]) {
      await this.restoreBackup(event.target.files[0]);
    }
  }

  async onSubmit(event) {
    event.preventDefault();
    if (event.target.id === 'create-profile-form') await this.submitProfile(event.target);
    if (event.target.id === 'planet-question-form') await this.submitPlanetQuestion(event.target);
    if (event.target.id === 'edit-artifact-form') await this.submitArtifactEdit(event.target);
    if (event.target.id === 'all-profiles-key-form') await this.submitAllProfilesKey(event.target);
  }

  selectProfileChoice(button, field) {
    const form = button.closest('form');
    if (!form) return;
    form.querySelectorAll(`[data-action="choose-${field}"]`).forEach((choice) => choice.setAttribute('aria-pressed', String(choice === button)));
    form.elements[field].value = button.dataset.value;
  }

  async submitProfile(form) {
    const data = new FormData(form);
    try {
      const profile = await createProfile({
        displayName: data.get('name'),
        symbol: data.get('symbol'),
        pattern: data.get('pattern'),
      });
      await setActiveProfile(profile.id);
      this.profile = profile;
      this.profiles = await listProfiles();
      this.profileModalOpen = false;
      this.profileCreateMode = false;
      await this.loadProfileData();
      await this.prepareRoute();
      this.pendingToast = `Welcome, ${printableProfileName(profile)}. Your work will stay in this learner space.`;
      await this.render();
    } catch (error) {
      this.toast(error.message || 'The learner space could not be created.');
    }
  }

  async chooseProfile(profileId) {
    await this.flushActivityStateSave();
    await this.cancelActiveRecording({ clearPlanetVoice: true });
    await setActiveProfile(profileId);
    this.profile = this.profiles.find((profile) => profile.id === profileId) || await getActiveProfile();
    this.profileModalOpen = false;
    this.profileCreateMode = false;
    this.activityState = null;
    this.atlasOpenState = null;
    this.numberOpenStates.clear();
    this.numberVoiceExplanation = null;
    this.scienceOpenStates.clear();
    this.scienceVoiceExplanation = null;
    this.revisingArtifactId = null;
    this.planetQuestionVoice = null;
    await this.loadProfileData();
    await this.prepareRoute();
    this.pendingToast = `${printableProfileName(this.profile)}’s learner space is open.`;
    await this.render();
  }

  async changeSetting(name, value) {
    if (!this.profile) return;
    const patch = {};
    if (name === 'text-size') patch.textScale = ({ normal: 1, large: 1.15, largest: 1.3 })[value] || 1;
    else if (name === 'contrast') patch.highContrast = value === 'high';
    else if (name === 'motion') patch.reducedMotion = value === 'reduced';
    else if (name === 'complexity') patch.reducedComplexity = value === 'reduced';
    else if (name === 'scaffold') patch.scaffold = value;
    else patch[name] = value;
    this.settings = await updateSettings(patch, { profileId: this.profile.id });
    this.applySettings();
    await this.render({ preserveFocus: true });
    this.toast('This learner’s support settings were saved.');
  }

  mountGlossary() {
    const layer = this.root.querySelector('#popover-layer');
    if (!layer) return;
    layer.innerHTML = renderGlossary(GLOSSARY);
    requestAnimationFrame(() => layer.querySelector('input')?.focus());
  }

  closeGlossary() {
    this.glossaryOpen = false;
    const layer = this.root.querySelector('#popover-layer');
    if (layer) layer.innerHTML = '';
    const target = this.glossaryReturnFocus;
    this.glossaryReturnFocus = null;
    if (target) this.restoreFocusTarget(target, this.root.querySelector('#main-content'));
  }

  filterGlossary(query) {
    const normal = query.trim().toLowerCase();
    qsa('[data-glossary-entry]', this.root).forEach((entry) => {
      entry.hidden = normal && !entry.dataset.glossaryEntry.toLowerCase().includes(normal) && !entry.textContent.toLowerCase().includes(normal);
    });
  }

  async speakVisible(text) {
    const result = await speak(text, { rate: 0.88, volume: this.settings?.soundVolume ?? 0.7 });
    if (!result.supported) this.toast('Spoken support is not available in this browser. The same words remain visible.');
  }

  speakActivityInstructions() {
    const activity = getActivityById(this.route.params.activityId);
    const prompt = this.root.querySelector('.activity-prompt')?.innerText || activity?.enquiry;
    return this.speakVisible(`${activity?.title}. ${prompt}`);
  }

  async moveActivityStep(amount) {
    if (!this.activityState) return;
    const currentStep = Math.max(0, Math.min(ACTIVITY_STAGE_COUNT - 1, this.activityState.step || 0));
    this.activityState.step = Math.max(0, Math.min(ACTIVITY_STAGE_COUNT - 1, currentStep + amount));
    if (this.teacherPreviewActivityId !== this.activityState.activityId) await this.persistActivityState();
    await this.render({ preserveFocus: true });
  }

  scheduleActivityStateSave() {
    clearTimeout(this.activitySaveTimer);
    if (!this.profile || !this.activityState?.activityId || this.teacherPreviewActivityId === this.activityState.activityId) return;
    this.pendingActivitySave = {
      profileId: this.profile.id,
      activityId: this.activityState.activityId,
      destinationId: getActivityById(this.activityState.activityId)?.destinationId || 'planet-atlas',
      state: typeof structuredClone === 'function'
        ? structuredClone(this.activityState)
        : { ...this.activityState },
    };
    this.activitySaveTimer = setTimeout(() => {
      void this.persistActivityState().catch((error) => {
        console.error(error);
        this.toast('This unfinished pathway could not be saved just now. Keep this page open and try again.');
      });
    }, 350);
  }

  async persistActivityState() {
    clearTimeout(this.activitySaveTimer);
    this.activitySaveTimer = null;
    const pending = this.pendingActivitySave;
    this.pendingActivitySave = null;
    if (!pending && (!this.profile || !this.activityState?.activityId)) return;
    const profileId = pending?.profileId || this.profile.id;
    const activityId = pending?.activityId || this.activityState.activityId;
    const state = pending?.state || this.activityState;
    const destinationId = pending?.destinationId || getActivityById(activityId)?.destinationId || 'planet-atlas';
    await saveActivityState(profileId, activityId, state, { destinationId });
  }

  async flushActivityStateSave() {
    clearTimeout(this.activitySaveTimer);
    this.activitySaveTimer = null;
    const pending = this.pendingActivitySave;
    this.pendingActivitySave = null;
    if (!pending) return;
    await saveActivityState(pending.profileId, pending.activityId, pending.state, { destinationId: pending.destinationId || getActivityById(pending.activityId)?.destinationId || 'planet-atlas' });
  }

  async saveAtlasSnapshot(question = '', suppliedSnapshot = null, context = {}) {
    if (!this.profile || !this.map) return;
    if (context.activityId && context.activityId === this.teacherPreviewActivityId) {
      this.toast('Teacher preview is not attached to a learner. Enter the activity key in Children’s View to save work.');
      return;
    }
    if (question) this.map.setQuestion(question);
    const snapshot = suppliedSnapshot || this.map.createSnapshot();
    const sourceActivityId = context.activityId || null;
    const changes = {
      destinationId: 'planet-atlas',
      activityId: 'open-atlas-exploration',
      keyActivityId: null,
      title: snapshot.title,
      artefactType: 'exploration-snapshot',
      curriculumTags: ['maps-atlases-globes', 'digital-mapping'],
      conceptTags: ['earth', 'map', ...(snapshot.comparison ? ['place-comparison'] : []), ...(snapshot.journey ? ['journey'] : [])],
      structuredContent: {
        viewState: snapshot.state,
        markers: snapshot.state?.markers || [],
        routes: snapshot.journey ? [snapshot.journey] : [],
        visibleLayers: {
          labels: snapshot.state?.labels,
          oceans: snapshot.state?.oceans,
          equator: snapshot.state?.equator,
          climate: snapshot.state?.climate,
        },
        journey: snapshot.journey,
        comparison: snapshot.comparison,
        question: snapshot.question,
        attribution: snapshot.attribution,
        sourceActivityId,
      },
      preview: { label: snapshot.title, type: 'map', markup: snapshot.preview?.markup || '' },
      writtenExplanation: question || snapshot.question || '',
    };
    const revision = this.revisingArtifactId
      ? this.artifacts.find((item) => item.id === this.revisingArtifactId)
      : null;
    const artifact = revision?.artefactType === 'exploration-snapshot'
      ? await updateArtefact(this.profile.id, revision.id, changes, { reason: 'revisited atlas exploration' })
      : await createArtefact(this.profile.id, changes);
    this.revisingArtifactId = null;
    await this.loadProfileData();
    this.pendingToast = this.persistenceIsDurable()
      ? 'This atlas view is safe in My Work.'
      : 'This atlas view is saved for this open session. Export a backup before closing.';
    navigate('work', artifact.id);
  }

  async saveNumberWork(payload, state) {
    if (!this.profile || !payload?.structuredContent?.modelState) return;
    if (payload.keyActivityId && payload.keyActivityId === this.teacherPreviewActivityId) {
      this.toast('Teacher preview is not attached to a learner. Enter the activity key in Children’s View to save work.');
      return;
    }
    const activity = payload.keyActivityId ? getActivityById(payload.keyActivityId) : null;
    const revisionTarget = this.revisingArtifactId
      ? this.artifacts.find((item) => item.id === this.revisingArtifactId && item.destinationId === 'number-expedition')
      : null;
    const existing = revisionTarget || (activity
      ? this.artifacts.find((item) => (
        item.activityId === activity.id
        && item.artefactType === payload.artefactType
        && !item.parentVersionId
      ))
      : null);
    const changes = {
      ...payload,
      voiceExplanation: activity ? this.activityState?.voiceExplanation || null : this.numberVoiceExplanation,
      structuredContent: {
        ...payload.structuredContent,
        modelState: state || payload.structuredContent.modelState,
        savedAt: new Date().toISOString(),
      },
    };
    const record = existing
      ? await updateArtefact(this.profile.id, existing.id, changes, { reason: 'revisited mathematical model' })
      : await createArtefact(this.profile.id, changes);
    if (activity) {
      await linkArtefactToActivityAccess(this.profile.id, activity.id, record.id);
      await recordActivityVisit(this.profile.id, activity, { savedArtefactId: record.id });
    }
    this.revisingArtifactId = null;
    this.numberVoiceExplanation = null;
    await this.loadProfileData();
    this.pendingToast = existing
      ? 'A new mathematical version was saved. The earlier one is still available.'
      : this.persistenceIsDurable()
        ? 'Your mathematical model is safe in My Work.'
        : 'This model is saved for this open session. Export a backup before closing.';
    navigate('work', record.id);
  }

  async saveScienceWork(payload, state) {
    if (!this.profile || !payload?.structuredContent?.scienceState) return;
    if (payload.keyActivityId && payload.keyActivityId === this.teacherPreviewActivityId) {
      this.toast('Teacher preview is not attached to a learner. Enter the activity key in Children’s View to save work.');
      return;
    }
    const activity = payload.keyActivityId ? getActivityById(payload.keyActivityId) : null;
    const revisionTarget = this.revisingArtifactId
      ? this.artifacts.find((item) => item.id === this.revisingArtifactId && item.destinationId === 'living-things-observatory')
      : null;
    const existing = revisionTarget || (activity
      ? this.artifacts.find((item) => (
        item.activityId === activity.id
        && item.artefactType === payload.artefactType
        && !item.parentVersionId
      ))
      : null);
    const changes = {
      ...payload,
      voiceExplanation: activity ? this.activityState?.voiceExplanation || null : this.scienceVoiceExplanation,
      structuredContent: {
        ...payload.structuredContent,
        scienceState: state || payload.structuredContent.scienceState,
        savedAt: new Date().toISOString(),
      },
    };
    const record = existing
      ? await updateArtefact(this.profile.id, existing.id, changes, { reason: 'revisited scientific thinking' })
      : await createArtefact(this.profile.id, changes);
    if (activity) {
      await linkArtefactToActivityAccess(this.profile.id, activity.id, record.id);
      await recordActivityVisit(this.profile.id, activity, { savedArtefactId: record.id });
    }
    this.revisingArtifactId = null;
    this.scienceVoiceExplanation = null;
    await this.loadProfileData();
    this.pendingToast = existing
      ? 'A new scientific version was saved. The earlier thinking is still available.'
      : this.persistenceIsDurable()
        ? 'Your scientific record is safe in My Work.'
        : 'This record is saved for this open session. Export a backup before closing.';
    navigate('work', record.id);
  }

  async saveKeyActivity() {
    if (!this.profile || !this.activityState) return;
    if (this.activityState.activityId === this.teacherPreviewActivityId) {
      this.toast('Teacher preview is not attached to a learner. Enter the activity key in Children’s View to save work.');
      return;
    }
    const activity = getActivityById(this.activityState.activityId);
    if (!activity) return;
    this.activityState.mapState = this.map?.getState() || this.activityState.mapState;
    this.activityState.route = this.map?.getJourneySummary() || this.activityState.route;
    const type = outcomeTypeForActivity(activity);
    const revisionTarget = this.revisingArtifactId
      ? this.artifacts.find((item) => item.id === this.revisingArtifactId && item.activityId === activity.id)
      : null;
    const existing = revisionTarget
      || this.artifacts.find((item) => (
        item.activityId === activity.id
        && item.keyActivityId === activity.id
        && item.artefactType === type
        && !item.parentVersionId
      ));
    let record;
    const content = {
      ...activityOutcomeContent(activity, this.activityState, this.map),
      savedAt: new Date().toISOString(),
    };
    const guidedSnapshot = this.map?.createSnapshot?.({ title: titleForOutcome(activity, this.activityState) });
    const preview = {
      label: activity.title,
      type: 'guided-atlas',
      markup: guidedSnapshot?.preview?.markup || '',
    };
    if (existing) {
      record = await updateArtefact(this.profile.id, existing.id, {
        title: titleForOutcome(activity, this.activityState),
        artefactType: type,
        structuredContent: content,
        preview,
        writtenExplanation: this.activityState.explanation,
        voiceExplanation: this.activityState.voiceExplanation || null,
      }, { reason: 'revisited pathway' });
    } else {
      record = await createArtefact(this.profile.id, {
        destinationId: 'planet-atlas',
        activityId: activity.id,
        keyActivityId: activity.id,
        title: titleForOutcome(activity, this.activityState),
        artefactType: type,
        curriculumTags: activity.curriculumRefs || [],
        conceptTags: activity.conceptTags || [],
        structuredContent: content,
        preview,
        writtenExplanation: this.activityState.explanation,
        voiceExplanation: this.activityState.voiceExplanation || null,
      });
    }
    await linkArtefactToActivityAccess(this.profile.id, activity.id, record.id);
    await recordActivityVisit(this.profile.id, activity, { savedArtefactId: record.id });
    if (activityKind(activity) === 'understanding') {
      await addPlanetQuestionResponse(this.profile.id, {
        shortText: this.activityState.explanation || this.activityState.observation,
        stillWondering: this.activityState.question,
        linkedArtefactIds: [record.id],
        sourceActivityId: activity.id,
        voiceResponse: this.activityState.voiceExplanation || null,
      }).catch(() => {});
    }
    await this.loadProfileData();
    this.revisingArtifactId = null;
    const normal = this.artifacts.find((item) => item.id === record.id);
    this.pendingToast = existing
      ? 'A new version was saved. The earlier one is still available.'
      : this.persistenceIsDurable()
        ? 'Your work is safe in My Work.'
        : 'Your work is saved for this open session. Export a backup before closing.';
    navigate('work', normal?.id || record.id);
  }

  async submitPlanetQuestion(form) {
    if (!this.profile) return;
    const data = new FormData(form);
    const evidence = data.getAll('evidence');
    try {
      await addPlanetQuestionResponse(this.profile.id, {
        shortText: data.get('text'),
        linkedArtefactIds: evidence,
        voiceResponse: this.planetQuestionVoice,
        whatChangedMyThinking: data.get('whatChanged'),
        stillWondering: data.get('stillWondering'),
      });
      this.planetQuestionVoice = null;
      this.modalHTML = '';
      await this.loadProfileData();
      await this.render();
      this.toast('What you think now was saved beside your earlier ideas.');
    } catch (error) {
      this.toast(error.message || 'Add a thought, voice response or piece of evidence before saving.');
    }
  }

  async toggleVoiceRecording(button) {
    const status = this.root.querySelector('[data-audio-recorder-status]');
    const context = button.closest('[data-modal="planet-question"]')
      ? 'planet-question'
      : this.route.name === 'activity'
        ? `activity:${this.route.params.activityId}`
      : this.route.name === 'number-tool'
          ? `number-tool:${this.route.params.toolId}`
          : this.route.name === 'science-tool'
            ? `science-tool:${this.route.params.toolId}`
            : 'unknown';
    if (this.recording) {
      if (this.recording.context !== context || this.recording.profileId !== this.profile?.id) {
        await this.cancelActiveRecording();
        return;
      }
      const activeRecording = this.recording;
      const result = await activeRecording.controller.stop();
      this.recording = null;
      const contextStillActive = activeRecording.profileId === this.profile?.id
        && (activeRecording.context === 'planet-question'
          ? Boolean(this.root.querySelector('[data-modal="planet-question"]'))
          : activeRecording.context.startsWith('activity:')
            ? activeRecording.context === `activity:${this.route.params.activityId}`
            : activeRecording.context.startsWith('science-tool:')
              ? activeRecording.context === `science-tool:${this.route.params.toolId}`
              : activeRecording.context === `number-tool:${this.route.params.toolId}`);
      if (result.status === 'finished' && contextStillActive) {
        if (context === 'planet-question') this.planetQuestionVoice = result.blob;
        if (context.startsWith('activity:') && this.activityState?.activityId === context.slice('activity:'.length)) {
          this.activityState.voiceExplanation = result.blob;
          this.scheduleActivityStateSave();
        }
        if (context.startsWith('number-tool:')) this.numberVoiceExplanation = result.blob;
        if (context.startsWith('science-tool:')) this.scienceVoiceExplanation = result.blob;
        button.textContent = 'Record again';
        if (status) status.textContent = `Voice saved locally · ${Math.max(1, Math.round(result.durationMs / 1000))} seconds`;
      }
      return;
    }
    try {
      const controller = await startAudioRecording({ maxDurationMs: 120000 });
      this.recording = { controller, context, profileId: this.profile?.id };
      button.textContent = 'Stop recording';
      if (status) status.textContent = 'Recording… Tap “Stop recording” when you have finished.';
    } catch (error) {
      if (status) status.textContent = `${error.message}. You can use short text instead.`;
    }
  }

  async cancelActiveRecording({ clearPlanetVoice = false } = {}) {
    const activeRecording = this.recording;
    this.recording = null;
    if (activeRecording) {
      try {
        await activeRecording.controller.cancel();
      } catch {
        // The browser may already have ended the microphone stream.
      }
    }
    if (clearPlanetVoice) this.planetQuestionVoice = null;
  }

  async duplicateSavedWork(artifactId) {
    if (!this.profile) return;
    const copy = await duplicateArtefact(this.profile.id, artifactId);
    await this.loadProfileData();
    this.pendingToast = 'A separate copy was made. The original is unchanged.';
    navigate('work', copy.id);
  }

  async reopenArtifact(artifactId) {
    const artifact = this.artifacts.find((item) => item.id === artifactId);
    if (!artifact) return;
    if (artifact.artefactType === 'exploration-snapshot' && (artifact.content?.viewState || artifact.content?.mapState)) {
      this.revisingArtifactId = artifact.id;
      this.atlasOpenState = artifact.content.viewState || artifact.content.mapState;
      this.pendingToast = 'The saved map has reopened. The original remains safe in My Work.';
      navigate('atlas');
      return;
    }
    const activity = getActivityById(artifact.activityId);
    if (activity) {
      this.revisingArtifactId = artifact.id;
      this.activityState = activity.destinationId === 'number-expedition'
        ? { ...(artifact.content?.modelState || {}), activityId: activity.id, toolId: activity.toolId }
        : activity.destinationId === 'living-things-observatory'
          ? { ...(artifact.content?.scienceState || {}), activityId: activity.id, toolId: activity.toolId }
          : { ...normaliseActivityState(activity, artifact.content), step: 1 };
      await saveActivityState(this.profile.id, activity.id, this.activityState, { destinationId: activity.destinationId });
      this.pendingToast = 'The original is safe. Changes will become a new version when you save.';
      navigate('activity', activity.id);
      return;
    }
    if (artifact.destinationId === 'number-expedition' && artifact.content?.modelState) {
      const toolId = artifact.content.modelState.toolId;
      if (getNumberTool(toolId)) {
        this.revisingArtifactId = artifact.id;
        this.numberOpenStates.set(toolId, artifact.content.modelState);
        this.pendingToast = 'The original is safe. Saving will create a new version.';
        navigate('number-tool', toolId);
        return;
      }
    }
    if (artifact.destinationId === 'living-things-observatory' && artifact.content?.scienceState) {
      const toolId = artifact.content.scienceState.toolId;
      if (getScienceTool(toolId)) {
        this.revisingArtifactId = artifact.id;
        this.scienceOpenStates.set(toolId, artifact.content.scienceState);
        this.pendingToast = 'The original is safe. Saving will create a new scientific version.';
        navigate('science-tool', toolId);
        return;
      }
    }
    if (artifact.content?.viewState || artifact.content?.mapState) {
      this.revisingArtifactId = artifact.id;
      this.atlasOpenState = artifact.content.viewState || artifact.content.mapState;
      this.pendingToast = 'The saved map has reopened. The original remains safe in My Work.';
      navigate('atlas');
      return;
    }
    this.modalHTML = renderEditArtifactModal(artifact, 'revise');
    await this.render({ preserveFocus: true });
  }

  async openReflection(artifactId) {
    const artifact = this.artifacts.find((item) => item.id === artifactId);
    if (!artifact) return;
    this.modalHTML = renderEditArtifactModal(artifact, 'reflection');
    await this.render({ preserveFocus: true });
  }

  async openVersionCompare(artifactId) {
    const artifact = this.artifacts.find((item) => item.id === artifactId);
    if (!artifact) return;
    if (!artifact.versions) {
      const versions = await getArtefactVersions(this.profile.id, artifact.id);
      artifact.versions = versions.map((version) => ({ ...version.snapshot, createdAt: version.createdAt, explanation: version.snapshot?.writtenExplanation }));
    }
    this.modalHTML = renderVersionCompareModal(artifact);
    await this.render({ preserveFocus: true });
  }

  async submitArtifactEdit(form) {
    const artifactId = form.dataset.artifactId;
    const data = new FormData(form);
    if (form.dataset.editMode === 'reflection') {
      await addArtefactReflection(this.profile.id, artifactId, data.get('reflection'));
    } else {
      await updateArtefact(this.profile.id, artifactId, {
        title: data.get('title'),
        writtenExplanation: data.get('explanation'),
      }, { reason: 'renamed and revised' });
    }
    this.modalHTML = '';
    await this.loadProfileData();
    await this.prepareRoute();
    await this.render();
    this.toast('The new version was saved.');
  }

  async confirmDeleteArtifact(artifactId) {
    this.pendingDeleteArtifactId = artifactId;
    this.modalHTML = renderConfirmModal({
      title: 'Delete this saved piece?',
      message: 'This removes the piece and its version history from this learner space. Other saved work will remain.',
      confirmLabel: 'Delete this piece',
      action: 'delete-artifact',
    });
    await this.render({ preserveFocus: true });
  }

  async performDeleteArtifact() {
    if (!this.pendingDeleteArtifactId) return;
    await deleteArtefact(this.profile.id, this.pendingDeleteArtifactId, { confirm: true });
    this.pendingDeleteArtifactId = null;
    this.modalHTML = '';
    await this.loadProfileData();
    this.pendingToast = 'The saved piece was deleted.';
    navigate('work');
  }

  restoreRouteLocation(location) {
    const route = location && typeof location === 'object' ? location : { name: 'home', params: {} };
    if (route.name === 'activity' && route.params?.activityId) navigate('activity', route.params.activityId);
    else if (route.name === 'collection' && route.params?.keyId) navigate('collection', route.params.keyId);
    else if (route.name === 'work-detail' && route.params?.artifactId) navigate('work', route.params.artifactId);
    else if (route.name === 'number-tool' && route.params?.toolId) navigate('number-tool', route.params.toolId);
    else if (route.name === 'science-tool' && route.params?.toolId) navigate('science-tool', route.params.toolId);
    else navigate(route.name || 'home');
  }

  async exitTeacherKeyRoom(returnLocation = null) {
    if (teacherKeySession.getState().active) returnLocation = teacherKeySession.close() || returnLocation;
    this.maintenanceUnlocked = false;
    this.restoreRouteLocation(returnLocation || { name: 'home', params: {} });
  }

  async openTeacherKey(key) {
    if (!key || key.type === 'maintenance') return;
    const activityId = keyActivityIds(key)[0];
    const activity = activityId ? getActivityById(activityId) : null;
    if (teacherKeySession.getState().active) teacherKeySession.close();
    this.maintenanceUnlocked = false;
    if (key.type === 'activity' && activity) {
      this.teacherPreviewActivityId = activity.id;
      navigate('activity', activity.id);
    }
    else if (key.type === 'collection') navigate('collection', key.id);
    else if (key.destinationId === 'number-expedition') navigate('numbers');
    else if (key.destinationId === 'living-things-observatory') navigate('living-things');
    else if (key.destinationId === 'planet-atlas') navigate('atlas');
    else navigate('home');
  }

  async addTeacherKeyToAllProfiles(key) {
    if (!key || key.type === 'maintenance') throw new Error('Teacher entrance codes cannot be added to learner profiles.');
    await grantKeyToEveryProfile(key, { activities: ACTIVITIES, confirm: true });
    if (this.profile) await this.loadProfileData();
    this.toast(`${key.childFacingTitle || key.title} was added to every local profile.`);
  }

  async inspectDestinations() {
    this.modalHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="destination-inspect-title"><div class="modal-head"><div><p class="eyebrow">Product map</p><h2 id="destination-inspect-title">Current destinations</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body stack">${DESTINATIONS.map((destination) => `<div class="spread"><strong>${escapeHTML(destination.title)}</strong><span class="small muted">${destination.active ? 'Available now' : `Registered for Build ${destination.activationBuild}`}</span></div>`).join('')}</div></section></div>`;
    await this.render({ preserveFocus: true });
  }

  async openTeacherResetTools() {
    this.modalHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-tools-title"><div class="modal-head"><div><p class="eyebrow">Separated device actions</p><h2 id="reset-tools-title">Reset tools</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body stack"><p>Choose one learner before removing anything. Every action explains its exact scope and asks again.</p>${this.profiles.map((profile) => `<div class="spread"><span><span aria-hidden="true">${profileSymbolIcon(profile.symbol)}</span> ${escapeHTML(printableProfileName(profile))}</span><button class="button secondary" type="button" data-action="profile-tools" data-profile-id="${escapeAttr(profile.id)}">Manage this learner…</button></div>`).join('') || '<p class="muted">No local learner profiles.</p>'}<details class="work-more-actions"><summary>Whole-device reset</summary><div class="stack"><button class="button danger" type="button" data-action="confirm-clear-all">Clear every local profile and piece of work…</button></div></details></div></section></div>`;
    await this.render({ preserveFocus: true });
  }

  async exportBackup() {
    await downloadBackup({ appVersion: APP_VERSION });
    this.toast('The local backup was prepared. Keep the downloaded file somewhere safe.');
  }

  async restoreBackup(file) {
    try {
      const result = await importBackup(file, { mode: 'merge', conflictStrategy: 'newer-wins' });
      this.profiles = await listProfiles();
      this.profile = await getActiveProfile();
      if (this.profile) await this.loadProfileData();
      await this.render();
      this.toast(`Backup restored safely. ${result.partial ? 'Some invalid records were left out.' : 'Existing work was preserved.'}`);
    } catch (error) {
      this.toast(error.message || 'That backup could not be imported. Nothing was replaced.');
    }
  }

  async openAllProfilesKeyModal() {
    this.modalHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="all-key-title"><div class="modal-head"><div><p class="eyebrow">Intentional device-wide action</p><h2 id="all-key-title">Add one key to every local profile</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><form class="modal-body stack" id="all-profiles-key-form"><p>This is useful when every learner sharing this iPad needs the same pathway. It does not become the default.</p><label class="stack"><strong>Four-digit key</strong><input name="code" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required /></label><button class="button" type="submit">Add to all ${this.profiles.length} profiles</button></form></section></div>`;
    await this.render({ preserveFocus: true });
  }

  async submitAllProfilesKey(form) {
    const key = getKeyByCode(new FormData(form).get('code'));
    if (!key || key.type === 'maintenance') {
      this.toast('That code is not an active child pathway key.');
      return;
    }
    await grantKeyToEveryProfile(key, { activities: ACTIVITIES, confirm: true });
    this.modalHTML = '';
    if (this.profile) await this.loadProfileData();
    await this.render();
    this.toast(`${key.childFacingTitle} was added to every local profile.`);
  }

  async openProfileTools(profileId) {
    const profile = this.profiles.find((item) => item.id === profileId);
    if (!profile) return;
    this.modalHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="profile-tools-title"><div class="modal-head"><div><p class="eyebrow">One local learner space</p><h2 id="profile-tools-title">${escapeHTML(printableProfileName(profile))}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body stack"><p><span aria-hidden="true">${profileSymbolIcon(profile.symbol)}</span> Created ${formatDate(profile.createdAt, { year: true })}</p><button class="button danger" type="button" data-action="reset-profile-keys" data-profile-id="${escapeAttr(profile.id)}">Reset My Keys for this profile…</button><button class="button danger" type="button" data-action="clear-profile-work" data-profile-id="${escapeAttr(profile.id)}">Clear saved work for this profile…</button><button class="button danger" type="button" data-action="delete-profile" data-profile-id="${escapeAttr(profile.id)}">Delete this profile and its local data…</button></div></section></div>`;
    await this.render({ preserveFocus: true });
  }

  async confirmProfileAction(profileId, type) {
    const profile = this.profiles.find((item) => item.id === profileId);
    if (!profile) return;
    this.pendingProfileAction = { profileId, type };
    const copy = {
      keys: ['Reset My Keys for this learner?', 'Saved work will remain. All remembered key pathways will be removed from this profile.', 'Reset this My Keys'],
      work: ['Clear this learner’s saved work?', 'Profiles and remembered keys will remain. Saved artefacts, drafts and Planet Question responses for this learner will be removed.', 'Clear this saved work'],
      profile: ['Delete this learner profile?', 'The profile, its remembered keys, drafts, saved work and Planet Question responses will be removed from this device.', 'Delete this profile'],
    }[type];
    this.modalHTML = renderConfirmModal({ title: copy[0], message: copy[1], confirmLabel: copy[2], action: 'perform-profile-action' });
    await this.render({ preserveFocus: true });
  }

  async performProfileAction() {
    const pending = this.pendingProfileAction;
    if (!pending) return;
    if (pending.type === 'keys') await clearProfileKeyAccess(pending.profileId, { confirm: true });
    if (pending.type === 'work') await clearProfileWork(pending.profileId, { confirm: true });
    if (pending.type === 'profile') await deleteProfile(pending.profileId, { confirm: true, deleteLearnerData: true });
    this.pendingProfileAction = null;
    this.modalHTML = '';
    this.profiles = await listProfiles();
    this.profile = await getActiveProfile();
    if (this.profile) await this.loadProfileData();
    else this.profileModalOpen = true;
    this.route = { name: 'maintenance', params: {} };
    await this.render();
    this.toast('The selected local data was removed.');
  }

  async confirmClearAll() {
    this.modalHTML = renderConfirmModal({ title: 'Clear every local learner space?', message: 'This removes every profile, key, draft, saved piece, version and Planet Question response from this device. Export a backup first if any of it should be kept.', confirmLabel: 'Clear all local data', action: 'clear-all-data' });
    await this.render({ preserveFocus: true });
  }

  async clearAllData() {
    for (const store of Object.values(STORES)) await clearStore(store);
    this.profiles = [];
    this.profile = null;
    this.access = [];
    this.artifacts = [];
    this.responses = [];
    this.activityState = null;
    this.atlasOpenState = null;
    this.numberOpenStates.clear();
    this.numberVoiceExplanation = null;
    this.scienceOpenStates.clear();
    this.scienceVoiceExplanation = null;
    this.modalHTML = '';
    this.profileModalOpen = true;
    this.profileCreateMode = true;
    if (teacherKeySession.getState().active) teacherKeySession.close();
    this.maintenanceUnlocked = false;
    navigate('home');
  }

  toast(message) {
    const region = this.root.querySelector('#toast-region');
    if (!region || !message) {
      this.pendingToast = message;
      return;
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    region.append(toast);
    setTimeout(() => toast.remove(), 4200);
  }

  renderFatal(error) {
    this.root.innerHTML = `<main class="main-content" style="padding-top:3rem"><section class="paper-panel panel-pad"><p class="eyebrow">The world could not open</p><h1>Nothing has been deleted.</h1><p>${escapeHTML(error?.message || 'An unexpected problem occurred.')}</p><button class="button" type="button" onclick="location.reload()">Try opening again</button></section></main>`;
  }
}

export default App;
