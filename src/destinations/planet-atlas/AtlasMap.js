import {
  geoGraticule10,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
} from 'd3-geo';
import {
  COUNTRIES,
  CONTINENT_LABELS,
  COUNTRY_BORDERS,
  GAMBIA_FOCUS_SEQUENCE,
  ISO_NUMERIC,
  LAND,
  MAP_ATTRIBUTION,
  OCEAN_LABELS,
  PLACE_METADATA,
  RIVER_GAMBIA,
  createJourneySummary,
  findCountryAt,
  getCountryById,
  getCountryName,
  isCoordinateVisibleOnGlobe,
  journeyDistanceKm,
  placeLabelAt,
} from './geo.js';
import './atlas.css';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWBOX = Object.freeze({ width: 960, height: 620 });
const GLOBE_BASE_SCALE = 264;
const FLAT_BASE_SCALE = 151;
const STATE_VERSION = 1;
const EQUATOR = Object.freeze({
  type: 'LineString',
  coordinates: Array.from({ length: 181 }, (_, index) => [index * 2 - 180, 0]),
});
const latitudeLine = (latitude) => ({
  type: 'LineString',
  coordinates: Array.from({ length: 181 }, (_, index) => [index * 2 - 180, latitude]),
});

// Split each broad latitude band into four modest polygons. This avoids an
// antimeridian-spanning ring while still allowing the projection to curve the
// band edges correctly on both the globe and the flat map.
const latitudeBand = (south, north) => ({
  type: 'FeatureCollection',
  features: [-180, -90, 0, 90].map((west) => {
    const east = west + 90;
    const northEdge = Array.from({ length: 31 }, (_, index) => [west + index * 3, north]);
    const southEdge = Array.from({ length: 31 }, (_, index) => [east - index * 3, south]);
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[west, south], [west, north], ...northEdge.slice(1), [east, south], ...southEdge.slice(1)]],
      },
    };
  }),
});

const CLIMATE_GUIDES = Object.freeze([
  Object.freeze({ latitude: 23.5, kind: 'tropical' }),
  Object.freeze({ latitude: -23.5, kind: 'tropical' }),
  Object.freeze({ latitude: 66.5, kind: 'polar' }),
  Object.freeze({ latitude: -66.5, kind: 'polar' }),
]);
const CLIMATE_BANDS = Object.freeze([
  Object.freeze({ id: 'tropical', geometry: latitudeBand(-23.5, 23.5) }),
  Object.freeze({ id: 'temperate', geometry: latitudeBand(23.5, 66.5) }),
  Object.freeze({ id: 'temperate', geometry: latitudeBand(-66.5, -23.5) }),
  Object.freeze({ id: 'polar', geometry: latitudeBand(66.5, 89.8) }),
  Object.freeze({ id: 'polar', geometry: latitudeBand(-89.8, -66.5) }),
]);
const BIOME_GUIDES = Object.freeze({
  'tropical-forest': Object.freeze({
    id: 'tropical-forest',
    label: 'Tropical forest',
    climateBand: 'tropical',
    description:
      'Tropical forest may develop where warmth and plentiful rainfall persist through much of the year.',
    caution:
      'Not every place near the equator is tropical forest. Rainfall, elevation, soils, seasons and human activity also matter.',
  }),
  savanna: Object.freeze({
    id: 'savanna',
    label: 'Savanna',
    climateBand: 'tropical',
    description:
      'Savanna may develop in warm regions where rainfall is strongly seasonal, supporting grasses with scattered trees.',
    caution:
      'Latitude does not decide this biome on its own. Local rainfall, fire, grazing, soils and land use all influence it.',
  }),
  'temperate-woodland-grassland': Object.freeze({
    id: 'temperate-woodland-grassland',
    label: 'Temperate woodland or grassland',
    climateBand: 'temperate',
    description:
      'Temperate woodland or grassland may occur where seasonal temperatures and available rainfall support trees or grasses.',
    caution:
      'Middle latitudes contain many different biomes. Oceans, elevation, rainfall, soils and land use help shape which are present.',
  }),
  tundra: Object.freeze({
    id: 'tundra',
    label: 'Tundra',
    climateBand: 'polar',
    description:
      'Tundra may occur where cold conditions and a short growing season limit tree growth, often at high latitudes or elevations.',
    caution:
      'A high latitude is a clue, not a guarantee. Elevation, snow cover, moisture and local conditions also influence habitats.',
  }),
});
const PLACE_ALIASES = Object.freeze({
  earth: 'world',
  'west-africa': 'westAfrica',
  'the-gambia': 'gambia',
  'united-kingdom': 'uk',
});

const DEFAULT_STATE = Object.freeze({
  version: STATE_VERSION,
  view: 'globe',
  focus: 'world',
  selectedCountryId: null,
  rotation: Object.freeze([0, -12, 0]),
  flatCenter: Object.freeze([0, 10]),
  flatPan: Object.freeze([0, 0]),
  zoom: 1,
  labels: true,
  equator: true,
  oceans: true,
  climate: false,
  selectedBiome: null,
  tool: 'explore',
  markers: Object.freeze([]),
  journey: Object.freeze({ points: Object.freeze([]), narration: '' }),
  comparison: null,
  question: '',
});

function uniqueId(prefix = 'atlas') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteCoordinate(coordinates) {
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Number.isFinite(Number(coordinates[0])) &&
    Number.isFinite(Number(coordinates[1]))
  );
}

function cleanCoordinate(coordinates) {
  return [
    clamp(Number(coordinates[0]), -180, 180),
    clamp(Number(coordinates[1]), -90, 90),
  ];
}

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) element.setAttribute(key, String(value));
  });
  return element;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function interpolateNumber(start, end, amount) {
  return start + (end - start) * amount;
}

function interpolateArray(start, end, amount) {
  return start.map((value, index) => interpolateNumber(value, end[index], amount));
}

function easeInOutCubic(amount) {
  return amount < 0.5
    ? 4 * amount * amount * amount
    : 1 - Math.pow(-2 * amount + 2, 3) / 2;
}

function roundedScaleDistance(maximumKilometres) {
  if (!Number.isFinite(maximumKilometres) || maximumKilometres <= 0) return 0;
  const magnitude = 10 ** Math.floor(Math.log10(maximumKilometres));
  const normalised = maximumKilometres / magnitude;
  const step = normalised >= 5 ? 5 : normalised >= 2 ? 2 : 1;
  return step * magnitude;
}

function formatKilometres(kilometres) {
  if (kilometres < 10) return kilometres.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return Math.round(kilometres).toLocaleString();
}

function normaliseState(nextState = {}) {
  const state = {
    ...deepClone(DEFAULT_STATE),
    ...deepClone(nextState),
  };

  state.version = STATE_VERSION;
  state.view = state.view === 'flat' ? 'flat' : 'globe';
  state.rotation = Array.isArray(state.rotation)
    ? [
        Number(state.rotation[0]) || 0,
        clamp(Number(state.rotation[1]) || 0, -85, 85),
        0,
      ]
    : [...DEFAULT_STATE.rotation];
  state.flatCenter = finiteCoordinate(state.flatCenter)
    ? cleanCoordinate(state.flatCenter)
    : [...DEFAULT_STATE.flatCenter];
  state.flatPan =
    Array.isArray(state.flatPan) && state.flatPan.length === 2
      ? [Number(state.flatPan[0]) || 0, Number(state.flatPan[1]) || 0]
      : [0, 0];
  state.zoom = clamp(Number(state.zoom) || 1, 0.7, 18);
  state.labels = state.labels !== false;
  state.equator = state.equator !== false;
  state.oceans = state.oceans !== false;
  state.climate = Boolean(state.climate);
  state.selectedBiome = BIOME_GUIDES[state.selectedBiome] ? state.selectedBiome : null;
  state.tool = ['explore', 'marker', 'journey'].includes(state.tool)
    ? state.tool
    : 'explore';
  state.markers = Array.isArray(state.markers)
    ? state.markers
        .filter((marker) => finiteCoordinate(marker.coordinates))
        .map((marker) => ({
          id: marker.id || uniqueId('marker'),
          coordinates: cleanCoordinate(marker.coordinates),
          label: marker.label || placeLabelAt(marker.coordinates),
          createdAt: marker.createdAt || new Date().toISOString(),
        }))
    : [];
  const journeyPoints = Array.isArray(state.journey?.points)
    ? state.journey.points
        .filter((point) => finiteCoordinate(point.coordinates || point))
        .slice(0, 2)
        .map((point) => {
          const coordinates = cleanCoordinate(point.coordinates || point);
          return {
            id: point.id || uniqueId('journey-point'),
            coordinates,
            label: point.label || placeLabelAt(coordinates),
          };
        })
    : [];
  state.journey = {
    points: journeyPoints,
    narration: String(state.journey?.narration || ''),
  };
  state.comparison = Array.isArray(state.comparison)
    ? state.comparison.filter((placeId) => PLACE_METADATA[placeId]).slice(0, 2)
    : null;
  if (state.comparison?.length !== 2) state.comparison = null;
  state.question = String(state.question || '');
  return state;
}

/**
 * Accessible, dependency-light Planet Atlas map.
 *
 * The component owns only the element passed to it. It stores no data itself;
 * callers persist the structured state returned by getState() or snapshots.
 */
export class AtlasMap {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;
    if (!(this.container instanceof Element)) {
      throw new TypeError('AtlasMap requires a container Element or valid selector.');
    }

    this.options = {
      title: 'Planet Atlas',
      description:
        'An interactive globe and flat map for exploring places, routes and scale.',
      onChange: null,
      onSnapshot: null,
      ...options,
    };
    this.state = normaliseState(options.state || options.initialState);
    this._listeners = [];
    this._projection = null;
    this._path = null;
    this._pointer = null;
    this._renderFrame = null;
    this._animationFrame = null;
    this._animationResolve = null;
    this._animationToken = 0;
    this._sequenceToken = 0;
    this._detailedGeometry = null;
    this._detailedGeometryPromise = null;
    this._destroyed = false;
    this._instanceId = uniqueId('planet-atlas');
    this._reducedMotionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.reducedMotion = options.reducedMotion ?? Boolean(this._reducedMotionQuery?.matches);

    this._build();
    this._bind();
    this.render();
    if (this.state.zoom >= 5) void this._ensureDetailedGeometry();
  }

  async _ensureDetailedGeometry() {
    if (this._detailedGeometry) return this._detailedGeometry;
    if (!this._detailedGeometryPromise) {
      this._detailedGeometryPromise = import('./geoDetailed.js')
        .then((module) => {
          this._detailedGeometry = module;
          if (!this._destroyed) this.render();
          return module;
        })
        .catch((error) => {
          this._detailedGeometryPromise = null;
          console.warn('Detailed Atlas geometry could not load; the broad offline map remains available.', error);
          return null;
        });
    }
    return this._detailedGeometryPromise;
  }

  _geometryForCurrentScale() {
    return this.state.zoom >= 5 && this._detailedGeometry
      ? this._detailedGeometry
      : { COUNTRIES, COUNTRY_BORDERS, LAND, findCountryAt };
  }

  _build() {
    const root = document.createElement('section');
    root.className = 'atlas-map';
    root.dataset.view = this.state.view;
    root.innerHTML = `
      <header class="atlas-map__header">
        <div>
          <p class="atlas-map__eyebrow">Our Planet · Geographical studio</p>
          <h2 class="atlas-map__title"></h2>
          <p class="atlas-map__intro"></p>
        </div>
        <button class="atlas-icon-button" type="button" data-action="speak-place" aria-label="Hear the current place name">
          <span aria-hidden="true">◖</span><span>Hear place</span>
        </button>
      </header>

      <nav class="atlas-map__trail" aria-label="Location trail">
        <button type="button" data-focus="world">Earth</button>
        <span aria-hidden="true">›</span>
        <button type="button" data-focus="africa">Africa</button>
        <span aria-hidden="true">›</span>
        <button type="button" data-focus="westAfrica">West Africa</button>
        <span aria-hidden="true">›</span>
        <button type="button" data-focus="gambia">The Gambia</button>
      </nav>

      <div class="atlas-map__controls" aria-label="Map controls">
        <div class="atlas-control-group" role="group" aria-label="Map form">
          <button type="button" data-view="globe">Globe</button>
          <button type="button" data-view="flat">Flat map</button>
        </div>
        <div class="atlas-control-group" role="group" aria-label="Map layers">
          <button type="button" data-action="toggle-labels">Labels</button>
          <button type="button" data-action="toggle-equator">Equator</button>
          <button type="button" data-action="toggle-oceans">Oceans</button>
          <button type="button" data-action="toggle-climate">Climate guides</button>
        </div>
        <div class="atlas-control-group" role="group" aria-label="Map scale">
          <button type="button" data-action="zoom-out" aria-label="Zoom out">−</button>
          <output class="atlas-map__zoom" aria-live="off">1×</output>
          <button type="button" data-action="zoom-in" aria-label="Zoom in">+</button>
          <button type="button" data-action="reset-view">Reset view</button>
        </div>
      </div>

      <div class="atlas-map__tools" role="group" aria-label="Map tool">
        <span class="atlas-map__tools-label">Use the map</span>
        <button type="button" data-tool="explore">Move & inspect</button>
        <button type="button" data-tool="marker">Place markers</button>
        <button type="button" data-tool="journey">Journey Thread</button>
        <button type="button" data-action="compare">Compare UK + The Gambia</button>
      </div>

      <div class="atlas-map__stage-wrap">
        <svg
          class="atlas-map__stage"
          viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}"
          preserveAspectRatio="xMidYMid meet"
          tabindex="0"
          role="application"
          aria-roledescription="interactive map"
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight + - Enter Escape"
        >
          <title id="${this._instanceId}-title"></title>
          <desc id="${this._instanceId}-description"></desc>
          <g class="atlas-map__drawing" aria-hidden="true"></g>
        </svg>
        <div class="atlas-map__crosshair" aria-hidden="true"><span></span></div>
        <output class="atlas-map__scale-guide" data-map-scale aria-live="off">
          <span class="atlas-map__scale-line" aria-hidden="true"></span>
          <span data-map-scale-label></span>
        </output>
        <p class="atlas-map__gesture">Drag or use arrow keys to move · + and − change scale</p>
      </div>

      <aside class="atlas-map__climate-key" data-climate-key hidden aria-label="Broad climate and biome guide">
        <div class="atlas-map__climate-intro">
          <strong>Broad climate patterns</strong>
          <span class="climate-key-item climate-key-item--tropical">Nearer the equator: often warmer patterns</span>
          <span class="climate-key-item climate-key-item--temperate">Middle latitudes: many temperate patterns</span>
          <span class="climate-key-item climate-key-item--polar">High latitudes: often colder patterns</span>
          <p>The patterned bands are clues, not exact borders. Latitude is one influence among elevation, winds, oceans, rainfall and local geography.</p>
        </div>
        <div class="atlas-map__biome-choices" role="group" aria-label="Inspect a possible climate and biome connection">
          <button type="button" data-biome="tropical-forest">
            <span class="atlas-map__biome-symbol climate-key-item--tropical" aria-hidden="true"></span>
            <span>Tropical forest</span>
          </button>
          <button type="button" data-biome="savanna">
            <span class="atlas-map__biome-symbol climate-key-item--tropical" aria-hidden="true"></span>
            <span>Savanna</span>
          </button>
          <button type="button" data-biome="temperate-woodland-grassland">
            <span class="atlas-map__biome-symbol climate-key-item--temperate" aria-hidden="true"></span>
            <span>Temperate woodland or grassland</span>
          </button>
          <button type="button" data-biome="tundra">
            <span class="atlas-map__biome-symbol climate-key-item--polar" aria-hidden="true"></span>
            <span>Tundra</span>
          </button>
        </div>
        <section class="atlas-map__biome-detail" data-biome-detail aria-live="polite">
          <p class="atlas-map__eyebrow">Biome connection</p>
          <h3 data-biome-title>Choose a biome to inspect</h3>
          <p data-biome-description>Compare a biome with the patterned latitude guides, then look for other evidence a map would need.</p>
          <p class="atlas-map__biome-caution" data-biome-caution>No climate band determines one biome by itself.</p>
        </section>
      </aside>

      <div class="atlas-map__status-grid">
        <section class="atlas-place-card" aria-labelledby="${this._instanceId}-place-title">
          <p class="atlas-map__eyebrow">Current view</p>
          <h3 id="${this._instanceId}-place-title" data-place-title></h3>
          <p data-place-description></p>
        </section>
        <section class="atlas-journey-card" data-journey-panel hidden aria-labelledby="${this._instanceId}-journey-title">
          <p class="atlas-map__eyebrow">Journey Thread</p>
          <h3 id="${this._instanceId}-journey-title">A route through the world</h3>
          <p data-journey-instruction></p>
          <dl data-journey-summary></dl>
          <label class="atlas-map__narration">
            <span>What do you notice about this journey?</span>
            <textarea rows="2" data-journey-narration maxlength="320"></textarea>
          </label>
          <button type="button" data-action="clear-journey">Clear Journey Thread</button>
        </section>
        <section class="atlas-compare-card" data-comparison-panel hidden aria-labelledby="${this._instanceId}-compare-title">
          <p class="atlas-map__eyebrow">Place comparison</p>
          <h3 id="${this._instanceId}-compare-title">United Kingdom and The Gambia</h3>
          <div class="atlas-compare-card__content" data-comparison-content></div>
          <button type="button" data-action="close-comparison">Return to place view</button>
        </section>
      </div>

      <details class="atlas-coordinate-tools">
        <summary>Place without dragging</summary>
        <p>Enter a longitude and latitude, or use the centre of the map.</p>
        <div class="atlas-coordinate-tools__fields">
          <label>Longitude <input type="number" min="-180" max="180" step="0.1" value="0" data-coordinate="longitude"></label>
          <label>Latitude <input type="number" min="-90" max="90" step="0.1" value="0" data-coordinate="latitude"></label>
        </div>
        <div class="atlas-coordinate-tools__actions">
          <button type="button" data-action="coordinate-marker">Place marker</button>
          <button type="button" data-action="coordinate-journey">Add Journey point</button>
          <button type="button" data-action="centre-marker">Mark map centre</button>
        </div>
      </details>

      <footer class="atlas-map__footer">
        <p class="atlas-map__attribution"></p>
        <div class="atlas-map__footer-actions">
          <button type="button" data-action="clear-markers">Clear markers</button>
          <button type="button" data-action="snapshot">Save exploration snapshot</button>
        </div>
      </footer>
      <p class="atlas-map__live" aria-live="polite" aria-atomic="true"></p>
    `;

    root.querySelector('.atlas-map__title').textContent = this.options.title;
    root.querySelector('.atlas-map__intro').textContent = this.options.description;
    root.querySelector('.atlas-map__attribution').textContent =
      `${MAP_ATTRIBUTION.boundaries} ${MAP_ATTRIBUTION.riverGambia}`;

    this.container.replaceChildren(root);
    this.root = root;
    this.svg = root.querySelector('.atlas-map__stage');
    this.drawing = root.querySelector('.atlas-map__drawing');
    this.liveRegion = root.querySelector('.atlas-map__live');
  }

  _listen(target, eventName, handler, options) {
    target.addEventListener(eventName, handler, options);
    this._listeners.push(() => target.removeEventListener(eventName, handler, options));
  }

  _bind() {
    this._listen(this.root, 'click', (event) => this._handleControlClick(event));
    this._listen(this.root, 'input', (event) => this._handleInput(event));
    this._listen(this.svg, 'pointerdown', (event) => this._handlePointerDown(event));
    this._listen(this.svg, 'pointermove', (event) => this._handlePointerMove(event));
    this._listen(this.svg, 'pointerup', (event) => this._handlePointerUp(event));
    this._listen(this.svg, 'pointercancel', () => {
      this._pointer = null;
      this.root.classList.remove('is-dragging');
    });
    this._listen(this.svg, 'wheel', (event) => this._handleWheel(event), {
      passive: false,
    });
    this._listen(this.svg, 'keydown', (event) => this._handleKeyDown(event));

    if (this._reducedMotionQuery) {
      this._listen(this._reducedMotionQuery, 'change', (event) => {
        if (this.options.reducedMotion === undefined) this.reducedMotion = event.matches;
      });
    }
  }

  _handleControlClick(event) {
    const biomeButton = event.target.closest('[data-biome]');
    if (biomeButton) {
      this.setBiome(biomeButton.dataset.biome);
      return;
    }

    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      this.setView(viewButton.dataset.view);
      return;
    }

    const focusButton = event.target.closest('[data-focus]');
    if (focusButton) {
      this.focusPlace(focusButton.dataset.focus);
      return;
    }

    const toolButton = event.target.closest('[data-tool]');
    if (toolButton) {
      this.setTool(toolButton.dataset.tool);
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    const actions = {
      'toggle-labels': () => this.setLayer('labels', !this.state.labels),
      'toggle-equator': () => this.setLayer('equator', !this.state.equator),
      'toggle-oceans': () => this.setLayer('oceans', !this.state.oceans),
      'toggle-climate': () => this.setLayer('climate', !this.state.climate),
      'zoom-in': () => this.zoomBy(1.3),
      'zoom-out': () => this.zoomBy(1 / 1.3),
      'reset-view': () => this.focusPlace(this.state.focus || 'world'),
      compare: () => this.comparePlaces('uk', 'gambia'),
      'close-comparison': () => this.clearComparison(),
      'clear-markers': () => this.clearMarkers(),
      'clear-journey': () => this.clearJourney(),
      snapshot: () => this.saveSnapshot(),
      'speak-place': () => this.speakCurrentPlace(),
      'coordinate-marker': () => this._addCoordinateFromInputs('marker'),
      'coordinate-journey': () => this._addCoordinateFromInputs('journey'),
      'centre-marker': () => this._addAtMapCentre('marker'),
    };
    actions[actionButton.dataset.action]?.();
  }

  _handleInput(event) {
    if (event.target.matches('[data-journey-narration]')) {
      this.state.journey.narration = event.target.value;
      this._emitChange('journey-narration');
    }
  }

  _handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    const point = this._eventPoint(event);
    this._cancelAnimation();
    this._pointer = {
      id: event.pointerId,
      start: point,
      rotation: [...this.state.rotation],
      pan: [...this.state.flatPan],
      moved: false,
    };
    this.svg.setPointerCapture?.(event.pointerId);
    this.root.classList.add('is-dragging');
  }

  _handlePointerMove(event) {
    if (!this._pointer || this._pointer.id !== event.pointerId) return;
    const point = this._eventPoint(event);
    const deltaX = point[0] - this._pointer.start[0];
    const deltaY = point[1] - this._pointer.start[1];
    if (Math.hypot(deltaX, deltaY) > 5) this._pointer.moved = true;

    if (!this._pointer.moved) return;
    if (this.state.view === 'globe') {
      const sensitivity = 0.22 / Math.sqrt(this.state.zoom);
      this.state.rotation = [
        this._pointer.rotation[0] + deltaX * sensitivity,
        clamp(this._pointer.rotation[1] - deltaY * sensitivity, -85, 85),
        0,
      ];
    } else {
      this.state.flatPan = [
        this._pointer.pan[0] + deltaX,
        this._pointer.pan[1] + deltaY,
      ];
    }
    this.state.focus = null;
    this.state.comparison = null;
    this._scheduleRender();
  }

  _handlePointerUp(event) {
    if (!this._pointer || this._pointer.id !== event.pointerId) return;
    const pointer = this._pointer;
    this._pointer = null;
    this.root.classList.remove('is-dragging');
    this.svg.releasePointerCapture?.(event.pointerId);

    if (pointer.moved) {
      this._emitChange('map-moved');
      return;
    }

    const mapPoint = this._eventPoint(event);
    if (
      this.state.view === 'globe' &&
      Math.hypot(mapPoint[0] - VIEWBOX.width / 2, mapPoint[1] - VIEWBOX.height / 2) >
        GLOBE_BASE_SCALE * this.state.zoom
    ) {
      this._announce('Choose a point inside the globe.');
      return;
    }
    const coordinates = this._projection?.invert?.(mapPoint);
    if (!finiteCoordinate(coordinates)) return;
    const cleaned = cleanCoordinate(coordinates);
    if (this.state.tool === 'marker') {
      this.addMarker(cleaned);
    } else if (this.state.tool === 'journey') {
      this.addJourneyPoint(cleaned);
    } else {
      this.inspectCoordinate(cleaned);
    }
  }

  _handleWheel(event) {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.0015);
    this.zoomBy(factor, { announce: false });
  }

  _handleKeyDown(event) {
    const key = event.key;
    const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (arrowKeys.includes(key)) {
      event.preventDefault();
      this._cancelAnimation();
      if (this.state.view === 'globe') {
        const step = 5 / Math.sqrt(this.state.zoom);
        if (key === 'ArrowLeft') this.state.rotation[0] -= step;
        if (key === 'ArrowRight') this.state.rotation[0] += step;
        if (key === 'ArrowUp') this.state.rotation[1] = clamp(this.state.rotation[1] + step, -85, 85);
        if (key === 'ArrowDown') this.state.rotation[1] = clamp(this.state.rotation[1] - step, -85, 85);
      } else {
        const step = 34;
        if (key === 'ArrowLeft') this.state.flatPan[0] -= step;
        if (key === 'ArrowRight') this.state.flatPan[0] += step;
        if (key === 'ArrowUp') this.state.flatPan[1] -= step;
        if (key === 'ArrowDown') this.state.flatPan[1] += step;
      }
      this.state.focus = null;
      this.state.comparison = null;
      this.render();
      this._emitChange('keyboard-map-moved');
      return;
    }

    if (key === '+' || key === '=') {
      event.preventDefault();
      this.zoomBy(1.25);
    } else if (key === '-' || key === '_') {
      event.preventDefault();
      this.zoomBy(0.8);
    } else if (key === 'Enter' && this.state.tool !== 'explore') {
      event.preventDefault();
      this._addAtMapCentre(this.state.tool);
    } else if (key === 'Enter') {
      event.preventDefault();
      this._inspectMapCentre();
    } else if (key === 'Escape') {
      event.preventDefault();
      this.setTool('explore');
    } else if (key.toLowerCase() === 'm') {
      this.setTool('marker');
    } else if (key.toLowerCase() === 'j') {
      this.setTool('journey');
    } else if (key.toLowerCase() === 'l') {
      this.setLayer('labels', !this.state.labels);
    } else if (key.toLowerCase() === 'e') {
      this.setLayer('equator', !this.state.equator);
    }
  }

  _eventPoint(event) {
    const rectangle = this.svg.getBoundingClientRect();
    return [
      ((event.clientX - rectangle.left) / rectangle.width) * VIEWBOX.width,
      ((event.clientY - rectangle.top) / rectangle.height) * VIEWBOX.height,
    ];
  }

  _projectionForState() {
    if (this.state.view === 'globe') {
      return geoOrthographic()
        .translate([VIEWBOX.width / 2, VIEWBOX.height / 2])
        .scale(GLOBE_BASE_SCALE * this.state.zoom)
        .rotate(this.state.rotation)
        .clipAngle(90)
        .precision(0.25);
    }

    return geoNaturalEarth1()
      .translate([
        VIEWBOX.width / 2 + this.state.flatPan[0],
        VIEWBOX.height / 2 + this.state.flatPan[1],
      ])
      .scale(FLAT_BASE_SCALE * this.state.zoom)
      .center(this.state.flatCenter)
      .precision(0.25);
  }

  _scheduleRender() {
    if (this._renderFrame || this._destroyed) return;
    this._renderFrame = requestAnimationFrame(() => {
      this._renderFrame = null;
      this.render();
    });
  }

  render() {
    if (this._destroyed) return this;
    this._projection = this._projectionForState();
    this._path = geoPath(this._projection);
    this.root.dataset.view = this.state.view;
    this.root.dataset.tool = this.state.tool;
    this._renderDrawing();
    this._renderControls();
    this._renderStatus();
    return this;
  }

  _renderDrawing() {
    const fragment = document.createDocumentFragment();
    const geometry = this._geometryForCurrentScale();
    const sphere = { type: 'Sphere' };
    const spherePath = this._path(sphere);
    if (spherePath) {
      fragment.append(
        createSvgElement('path', {
          d: spherePath,
          class: 'atlas-map__ocean-shape',
        }),
      );
    }

    const graticulePath = this._path(geoGraticule10());
    if (graticulePath) {
      fragment.append(
        createSvgElement('path', {
          d: graticulePath,
          class: 'atlas-map__graticule',
        }),
      );
    }

    const focusPlace = this.state.focus ? PLACE_METADATA[this.state.focus] : null;
    const highlightIds = new Set(focusPlace?.highlightIds || []);
    const contextIds = new Set(focusPlace?.contextIds || []);
    const comparisonIds = new Set(
      (this.state.comparison || [])
        .map((placeId) => PLACE_METADATA[placeId]?.isoNumeric)
        .filter(Boolean),
    );

    geometry.COUNTRIES.features.forEach((country) => {
      const pathData = this._path(country);
      if (!pathData) return;
      const classNames = ['atlas-map__country'];
      if (highlightIds.has(country.id)) classNames.push('is-highlighted');
      if (contextIds.has(country.id)) classNames.push('is-context');
      if (comparisonIds.has(country.id)) classNames.push('is-compared');
      if (this.state.selectedCountryId === country.id) classNames.push('is-selected');
      fragment.append(
        createSvgElement('path', {
          d: pathData,
          class: classNames.join(' '),
          'data-country-id': country.id,
        }),
      );
    });

    const borderPath = this._path(geometry.COUNTRY_BORDERS);
    if (borderPath) {
      fragment.append(
        createSvgElement('path', {
          d: borderPath,
          class: 'atlas-map__borders',
        }),
      );
    }

    if (this.state.climate) {
      this._renderClimateBands(fragment);
    }

    if (this.state.equator) {
      const equatorPath = this._path(EQUATOR);
      if (equatorPath) {
        fragment.append(
          createSvgElement('path', {
            d: equatorPath,
            class: 'atlas-map__equator',
          }),
        );
      }
    }

    if (
      this.state.focus === 'gambia' ||
      this.state.focus === 'westAfrica' ||
      this.state.zoom >= 6
    ) {
      const riverPath = this._path(RIVER_GAMBIA);
      if (riverPath) {
        fragment.append(
          createSvgElement('path', {
            d: riverPath,
            class: 'atlas-map__river',
          }),
        );
      }
    }

    if (this.state.comparison) {
      const comparisonLine = {
        type: 'LineString',
        coordinates: this.state.comparison.map(
          (placeId) => PLACE_METADATA[placeId].coordinates,
        ),
      };
      const comparisonPath = this._path(comparisonLine);
      if (comparisonPath) {
        fragment.append(
          createSvgElement('path', {
            d: comparisonPath,
            class: 'atlas-map__comparison-line',
          }),
        );
      }
    }

    if (this.state.journey.points.length === 2) {
      const journeyLine = {
        type: 'LineString',
        coordinates: this.state.journey.points.map((point) => point.coordinates),
      };
      const journeyPath = this._path(journeyLine);
      if (journeyPath) {
        fragment.append(
          createSvgElement('path', {
            d: journeyPath,
            class: 'atlas-map__journey-line',
          }),
        );
      }
    }

    this._renderPoints(fragment, this.state.journey.points, 'journey');
    this._renderPoints(fragment, this.state.markers, 'marker');
    this._renderLabels(fragment);
    this.drawing.replaceChildren(fragment);

    const place = this._currentPlace();
    this.svg.querySelector('title').textContent = `${this.options.title}: ${place.label}`;
    this.svg.querySelector('desc').textContent = this._mapDescription(place);
    this.svg.setAttribute(
      'aria-label',
      `${place.label}, ${this.state.view === 'globe' ? 'globe' : 'flat map'} view. ${
        this.state.tool === 'explore'
          ? 'Use arrow keys to move and plus or minus to zoom.'
          : 'Press Enter to use the selected tool at the map centre.'
      }`,
    );
  }

  _renderClimateBands(fragment) {
    const definitions = createSvgElement('defs');
    ['tropical', 'temperate', 'polar'].forEach((kind) => {
      const pattern = createSvgElement('pattern', {
        id: `${this._instanceId}-climate-${kind}`,
        width: 12,
        height: 12,
        patternUnits: 'userSpaceOnUse',
      });
      pattern.append(createSvgElement('rect', {
        width: 12,
        height: 12,
        class: `atlas-map__climate-pattern-bg atlas-map__climate-pattern-bg--${kind}`,
      }));
      if (kind === 'tropical') {
        pattern.append(createSvgElement('path', {
          d: 'M-3 12L12-3M3 15L15 3',
          class: 'atlas-map__climate-pattern-mark atlas-map__climate-pattern-mark--tropical',
        }));
      } else if (kind === 'temperate') {
        pattern.append(
          createSvgElement('circle', {
            cx: 3,
            cy: 3,
            r: 1.5,
            class: 'atlas-map__climate-pattern-dot atlas-map__climate-pattern-dot--temperate',
          }),
          createSvgElement('circle', {
            cx: 9,
            cy: 9,
            r: 1.5,
            class: 'atlas-map__climate-pattern-dot atlas-map__climate-pattern-dot--temperate',
          }),
        );
      } else {
        pattern.append(createSvgElement('path', {
          d: 'M0 3H12M0 9H12',
          class: 'atlas-map__climate-pattern-mark atlas-map__climate-pattern-mark--polar',
        }));
      }
      definitions.append(pattern);
    });
    fragment.append(definitions);

    const selectedBand = BIOME_GUIDES[this.state.selectedBiome]?.climateBand;
    CLIMATE_BANDS.forEach((band) => {
      const pathData = this._path(band.geometry);
      if (!pathData) return;
      const classNames = [
        'atlas-map__climate-band',
        `atlas-map__climate-band--${band.id}`,
      ];
      if (selectedBand === band.id) classNames.push('is-related');
      fragment.append(createSvgElement('path', {
        d: pathData,
        fill: `url(#${this._instanceId}-climate-${band.id})`,
        class: classNames.join(' '),
        'data-climate-band': band.id,
      }));
    });

    CLIMATE_GUIDES.forEach((guide) => {
      const guidePath = this._path(latitudeLine(guide.latitude));
      if (!guidePath) return;
      fragment.append(createSvgElement('path', {
        d: guidePath,
        class: `atlas-map__climate-guide atlas-map__climate-guide--${guide.kind}`,
      }));
    });
  }

  _renderPoints(fragment, points, kind) {
    points.forEach((point, index) => {
      if (!this._coordinateIsVisible(point.coordinates)) return;
      const projected = this._projection(point.coordinates);
      if (!projected) return;
      const group = createSvgElement('g', {
        class: `atlas-map__point atlas-map__point--${kind}`,
        transform: `translate(${projected[0]} ${projected[1]})`,
      });
      group.append(
        createSvgElement('circle', { r: kind === 'journey' ? 10 : 8 }),
        createSvgElement('circle', { r: kind === 'journey' ? 3.5 : 2.8 }),
      );
      const label = createSvgElement('text', { x: 13, y: -11 });
      label.textContent = kind === 'journey' ? `${index + 1}. ${point.label}` : point.label;
      group.append(label);
      fragment.append(group);
    });
  }

  _renderLabels(fragment) {
    if (!this.state.labels) return;
    const labels = [];
    const focus = this.state.focus ? PLACE_METADATA[this.state.focus] : null;
    if (focus && focus.id !== 'world') labels.push(focus);
    if (focus?.contextIds?.includes(ISO_NUMERIC.SENEGAL)) labels.push(PLACE_METADATA.senegal);
    if (this.state.comparison) {
      this.state.comparison.forEach((placeId) => labels.push(PLACE_METADATA[placeId]));
    }
    if (this.state.selectedCountryId) {
      const country = getCountryById(this.state.selectedCountryId);
      if (country) {
        labels.push({
          id: `country-${country.id}`,
          label: country.properties.displayName,
          coordinates: this._countryLabelCoordinate(country),
        });
      }
    }

    const seen = new Set();
    labels.forEach((labelData) => {
      if (!labelData?.coordinates || seen.has(labelData.id)) return;
      seen.add(labelData.id);
      this._appendLabel(fragment, labelData.label, labelData.coordinates, 'place');
    });

    if (this.state.zoom <= 2.2) {
      CONTINENT_LABELS.forEach((continent) => {
        if (seen.has(continent.id)) return;
        this._appendLabel(fragment, continent.label, continent.coordinates, 'continent');
      });
    }

    if (this.state.oceans && this.state.zoom <= 4.5) {
      OCEAN_LABELS.forEach((ocean) => {
        this._appendLabel(fragment, ocean.label, ocean.coordinates, 'ocean');
      });
    }

    if (this.state.equator && this.state.zoom <= 5) {
      this._appendLabel(fragment, 'Equator', [-38, 0], 'equator');
    }

    if (this.state.climate && this.state.zoom <= 3.5) {
      this._appendLabel(fragment, 'Broad tropical pattern', [72, 12], 'climate');
      this._appendLabel(fragment, 'Broad temperate pattern', [72, 44], 'climate');
      this._appendLabel(fragment, 'Broad polar pattern', [35, 70], 'climate');
    }

    if (this.state.focus === 'gambia' || this.state.zoom >= 8) {
      this._appendLabel(fragment, 'River Gambia · approximate', [-15.35, 13.47], 'river');
    }
  }

  _countryLabelCoordinate(country) {
    const pathCentroid = this._path.centroid(country);
    return this._projection.invert(pathCentroid) || [0, 0];
  }

  _appendLabel(fragment, label, coordinates, kind) {
    if (!finiteCoordinate(coordinates)) return;
    if (!this._coordinateIsVisible(coordinates)) return;
    const projected = this._projection(coordinates);
    if (!projected) return;
    if (
      projected[0] < -50 ||
      projected[0] > VIEWBOX.width + 50 ||
      projected[1] < -30 ||
      projected[1] > VIEWBOX.height + 30
    ) {
      return;
    }
    const text = createSvgElement('text', {
      x: projected[0],
      y: projected[1],
      class: `atlas-map__label atlas-map__label--${kind}`,
    });
    text.textContent = label;
    fragment.append(text);
  }

  _coordinateIsVisible(coordinates) {
    return (
      this.state.view !== 'globe' ||
      isCoordinateVisibleOnGlobe(coordinates, this.state.rotation)
    );
  }

  _calculateScaleGuide() {
    const sampleWidth = 144;
    const centre = [VIEWBOX.width / 2, VIEWBOX.height / 2];
    const origin = this._projection?.invert?.([centre[0] - sampleWidth / 2, centre[1]]);
    const destination = this._projection?.invert?.([centre[0] + sampleWidth / 2, centre[1]]);
    if (!finiteCoordinate(origin) || !finiteCoordinate(destination)) return null;
    const sampleDistanceKm = journeyDistanceKm(origin, destination);
    const distanceKm = roundedScaleDistance(sampleDistanceKm);
    if (!distanceKm) return null;
    const widthViewBox = sampleWidth * (distanceKm / sampleDistanceKm);
    return {
      distanceKm,
      widthViewBox,
      widthPercent: clamp((widthViewBox / VIEWBOX.width) * 100, 4.5, 22),
      label: `≈ ${formatKilometres(distanceKm)} km near centre`,
      explanation:
        this.state.view === 'flat'
          ? 'Approximate distance near the centre of this flat map; scale changes across a world map.'
          : 'Approximate distance near the centre of this globe view.',
    };
  }

  _renderControls() {
    this.root.querySelectorAll('[data-view]').forEach((button) => {
      const active = button.dataset.view === this.state.view;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
    this.root.querySelectorAll('[data-tool]').forEach((button) => {
      const active = button.dataset.tool === this.state.tool;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
    this.root.querySelectorAll('[data-focus]').forEach((button) => {
      const active = button.dataset.focus === this.state.focus;
      if (active) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
    const layerState = {
      'toggle-labels': this.state.labels,
      'toggle-equator': this.state.equator,
      'toggle-oceans': this.state.oceans,
      'toggle-climate': this.state.climate,
    };
    Object.entries(layerState).forEach(([action, active]) => {
      const button = this.root.querySelector(`[data-action="${action}"]`);
      button?.setAttribute('aria-pressed', String(active));
      button?.classList.toggle('is-active', active);
    });
    const climateKey = this.root.querySelector('[data-climate-key]');
    if (climateKey) climateKey.hidden = !this.state.climate;
    this.root.querySelectorAll('[data-biome]').forEach((button) => {
      const active = button.dataset.biome === this.state.selectedBiome;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
    const biome = BIOME_GUIDES[this.state.selectedBiome];
    const biomeDetail = this.root.querySelector('[data-biome-detail]');
    if (biomeDetail) {
      biomeDetail.querySelector('[data-biome-title]').textContent =
        biome?.label || 'Choose a biome to inspect';
      biomeDetail.querySelector('[data-biome-description]').textContent =
        biome?.description ||
        'Compare a biome with the patterned latitude guides, then look for other evidence a map would need.';
      biomeDetail.querySelector('[data-biome-caution]').textContent =
        biome?.caution || 'No climate band determines one biome by itself.';
    }
    this.root.querySelector('.atlas-map__zoom').textContent = `${this.state.zoom.toFixed(
      this.state.zoom < 2 ? 1 : 0,
    )}×`;
    const scaleGuide = this._calculateScaleGuide();
    const scaleOutput = this.root.querySelector('[data-map-scale]');
    if (scaleOutput) {
      scaleOutput.hidden = !scaleGuide;
      if (scaleGuide) {
        scaleOutput.style.width = `${scaleGuide.widthPercent}%`;
        scaleOutput.querySelector('[data-map-scale-label]').textContent = scaleGuide.label;
        scaleOutput.setAttribute('aria-label', `Map scale guide. ${scaleGuide.label}. ${scaleGuide.explanation}`);
        scaleOutput.title = scaleGuide.explanation;
      }
    }
    this.root.querySelector('.atlas-map__crosshair').hidden = this.state.tool === 'explore';
  }

  _renderStatus() {
    const place = this._currentPlace();
    this.root.querySelector('[data-place-title]').textContent = place.label;
    this.root.querySelector('[data-place-description]').textContent = place.invitation;

    const journeyPanel = this.root.querySelector('[data-journey-panel]');
    const journeySummary = createJourneySummary(this.state.journey.points);
    journeyPanel.hidden =
      this.state.tool !== 'journey' && this.state.journey.points.length === 0;
    const instruction = journeyPanel.querySelector('[data-journey-instruction]');
    const summaryList = journeyPanel.querySelector('[data-journey-summary]');
    if (this.state.journey.points.length === 0) {
      instruction.textContent = 'Choose an origin on the map.';
      summaryList.replaceChildren();
    } else if (this.state.journey.points.length === 1) {
      instruction.textContent = `${this.state.journey.points[0].label} is your origin. Choose a destination.`;
      summaryList.replaceChildren();
    } else {
      instruction.textContent = 'Your route can be cleared and drawn again.';
      summaryList.innerHTML = `
        <div><dt>From</dt><dd data-summary-origin></dd></div>
        <div><dt>To</dt><dd data-summary-destination></dd></div>
        <div><dt>Direction</dt><dd data-summary-direction></dd></div>
        <div><dt>Distance</dt><dd data-summary-distance></dd></div>
        <div><dt>Continents</dt><dd data-summary-continents></dd></div>
        <div><dt>Oceans</dt><dd data-summary-oceans></dd></div>
        <div><dt>Equator</dt><dd data-summary-equator></dd></div>
        <div><dt>Map note</dt><dd data-summary-context></dd></div>
      `;
      summaryList.querySelector('[data-summary-origin]').textContent = journeySummary.origin.label;
      summaryList.querySelector('[data-summary-destination]').textContent =
        journeySummary.destination.label;
      summaryList.querySelector('[data-summary-direction]').textContent =
        `${journeySummary.direction} · ${journeySummary.bearingDegrees}°`;
      summaryList.querySelector('[data-summary-distance]').textContent =
        `about ${journeySummary.distanceKm.toLocaleString()} km`;
      summaryList.querySelector('[data-summary-continents]').textContent =
        journeySummary.continents.length ? journeySummary.continents.join(' · ') : 'Use a closer map to identify them.';
      summaryList.querySelector('[data-summary-oceans]').textContent =
        journeySummary.oceans.length ? journeySummary.oceans.join(' · ') : 'No broad ocean crossing is shown.';
      summaryList.querySelector('[data-summary-equator]').textContent = journeySummary.crossesEquator
        ? 'This route crosses it.'
        : 'This route does not cross it.';
      summaryList.querySelector('[data-summary-context]').textContent =
        'Continent and ocean names are broad map evidence; a real travel route may differ.';
    }
    const narration = journeyPanel.querySelector('[data-journey-narration]');
    if (narration.value !== this.state.journey.narration) {
      narration.value = this.state.journey.narration;
    }

    const comparisonPanel = this.root.querySelector('[data-comparison-panel]');
    comparisonPanel.hidden = !this.state.comparison;
    if (this.state.comparison) this._renderComparison(comparisonPanel);
  }

  _renderComparison(panel) {
    const [firstId, secondId] = this.state.comparison;
    const first = PLACE_METADATA[firstId];
    const second = PLACE_METADATA[secondId];
    panel.querySelector('h3').textContent = `${first.label} and ${second.label}`;
    const content = panel.querySelector('[data-comparison-content]');
    const rows = [
      ['Continent', first.continent, second.continent],
      ['Equator', first.equatorRelation, second.equatorRelation],
      ['Coastline', first.coastline, second.coastline],
      ['Broad climate', first.broadClimate, second.broadClimate],
      ['Selected physical feature', first.physicalFeature, second.physicalFeature],
      [
        'Approx. surface area',
        first.surfaceAreaKm2 ? `about ${first.surfaceAreaKm2.toLocaleString()} km²` : null,
        second.surfaceAreaKm2 ? `about ${second.surfaceAreaKm2.toLocaleString()} km²` : null,
      ],
      ['Using one map scale', first.scaleEvidence, second.scaleEvidence],
    ];
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Evidence</th><th></th><th></th></tr></thead><tbody></tbody>';
    const headings = table.querySelectorAll('th');
    headings[1].textContent = first.label;
    headings[2].textContent = second.label;
    const body = table.querySelector('tbody');
    rows.forEach(([heading, firstValue, secondValue]) => {
      const row = document.createElement('tr');
      [heading, firstValue, secondValue].forEach((value, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        if (index === 0) cell.scope = 'row';
        cell.textContent = value || 'Explore this evidence';
        row.append(cell);
      });
      body.append(row);
    });
    const comparisonNotes = [];
    if (first.surfaceAreaKm2 && second.surfaceAreaKm2) {
      const [larger, smaller] = [first, second].sort(
        (left, right) => right.surfaceAreaKm2 - left.surfaceAreaKm2,
      );
      const relativeArea = Math.round(larger.surfaceAreaKm2 / smaller.surfaceAreaKm2);
      const scaleNote = document.createElement('p');
      scaleNote.className = 'atlas-compare-card__scale-note';
      scaleNote.textContent =
        `At the same map scale, ${larger.label} covers roughly ${relativeArea} times the surface area of ${smaller.label}. ` +
        'That comparison helps with relative scale, but area alone does not describe either place.';
      comparisonNotes.push(scaleNote);
    }
    const note = document.createElement('p');
    note.className = 'atlas-compare-card__note';
    note.textContent =
      'These are broad geographical clues, not a complete portrait of either place. What else would you need to know?';
    content.replaceChildren(table, ...comparisonNotes, note);
  }

  _currentPlace() {
    if (this.state.comparison) {
      const comparisonLabels = this.state.comparison
        .map((placeId) => PLACE_METADATA[placeId]?.label)
        .filter(Boolean);
      return {
        label: comparisonLabels.join(' and '),
        invitation:
          'Compare geographical evidence without reducing either place to one simple difference.',
      };
    }
    if (this.state.selectedCountryId) {
      const countryName = getCountryName(this.state.selectedCountryId);
      if (countryName) {
        return {
          label: countryName,
          invitation: 'Look at its location, neighbours, coastline and scale. What do you wonder?',
        };
      }
    }
    return PLACE_METADATA[this.state.focus] || {
      label: 'Your map view',
      invitation: 'Keep moving, comparing and asking geographical questions.',
    };
  }

  _mapDescription(place) {
    const markerDescription = `${this.state.markers.length} temporary marker${
      this.state.markers.length === 1 ? '' : 's'
    }.`;
    const journeyDescription =
      this.state.journey.points.length === 2
        ? 'A completed two-point Journey Thread is visible.'
        : this.state.journey.points.length === 1
          ? 'A Journey Thread origin is visible.'
          : 'No Journey Thread is visible.';
    return `${place.invitation} ${markerDescription} ${journeyDescription}`;
  }

  _announce(message) {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = '';
    requestAnimationFrame(() => {
      if (!this._destroyed) this.liveRegion.textContent = message;
    });
  }

  _emitChange(reason) {
    if (this._destroyed || !this.root) return;
    const detail = { reason, state: this.getState() };
    this.options.onChange?.(detail.state, reason);
    this.root.dispatchEvent(new CustomEvent('atlas:change', { detail, bubbles: true }));
  }

  _addCoordinateFromInputs(kind) {
    const longitude = Number(
      this.root.querySelector('[data-coordinate="longitude"]').value,
    );
    const latitude = Number(this.root.querySelector('[data-coordinate="latitude"]').value);
    if (!finiteCoordinate([longitude, latitude])) {
      this._announce('Enter a longitude and latitude using numbers.');
      return;
    }
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      this._announce('Longitude must be between −180 and 180. Latitude must be between −90 and 90.');
      return;
    }
    if (kind === 'journey') this.addJourneyPoint([longitude, latitude]);
    else this.addMarker([longitude, latitude]);
  }

  _addAtMapCentre(kind) {
    const coordinates = this._projection?.invert?.([VIEWBOX.width / 2, VIEWBOX.height / 2]);
    if (!finiteCoordinate(coordinates)) {
      this._announce('Move the map until land or ocean is beneath the centre mark.');
      return;
    }
    if (kind === 'journey') this.addJourneyPoint(coordinates);
    else this.addMarker(coordinates);
  }

  _viewTargetForPlace(placeId) {
    const place = PLACE_METADATA[placeId];
    if (!place) return null;
    const coordinates = place.coordinates;
    if (this.state.view === 'globe') {
      return {
        rotation: [-coordinates[0], -coordinates[1], 0],
        zoom: place.zoom.globe,
      };
    }
    return {
      flatCenter: [...coordinates],
      flatPan: [0, 0],
      zoom: place.zoom.flat,
    };
  }

  _cancelAnimation(cancelSequence = true) {
    if (cancelSequence) this._sequenceToken += 1;
    this._animationToken += 1;
    if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
    this._animationFrame = null;
    if (this._animationResolve) {
      const resolve = this._animationResolve;
      this._animationResolve = null;
      resolve(false);
    }
  }

  _animateView(target, duration = 850) {
    this._cancelAnimation(false);
    const token = this._animationToken;
    if (this.reducedMotion || duration <= 0) {
      Object.assign(this.state, deepClone(target));
      this.render();
      return Promise.resolve(true);
    }

    const start = performance.now();
    const initial = {
      rotation: [...this.state.rotation],
      flatCenter: [...this.state.flatCenter],
      flatPan: [...this.state.flatPan],
      zoom: this.state.zoom,
    };
    return new Promise((resolve) => {
      this._animationResolve = resolve;
      const finish = (completed) => {
        if (this._animationResolve === resolve) this._animationResolve = null;
        this._animationFrame = null;
        resolve(completed);
      };
      const frame = (now) => {
        if (token !== this._animationToken || this._destroyed) {
          finish(false);
          return;
        }
        const amount = clamp((now - start) / duration, 0, 1);
        const eased = easeInOutCubic(amount);
        if (target.rotation) {
          this.state.rotation = interpolateArray(initial.rotation, target.rotation, eased);
        }
        if (target.flatCenter) {
          this.state.flatCenter = interpolateArray(
            initial.flatCenter,
            target.flatCenter,
            eased,
          );
        }
        if (target.flatPan) {
          this.state.flatPan = interpolateArray(initial.flatPan, target.flatPan, eased);
        }
        if (target.zoom !== undefined) {
          this.state.zoom = interpolateNumber(initial.zoom, target.zoom, eased);
        }
        this.render();
        if (amount < 1) {
          this._animationFrame = requestAnimationFrame(frame);
        } else {
          finish(true);
        }
      };
      this._animationFrame = requestAnimationFrame(frame);
    });
  }

  async focusPlace(placeId, options = {}) {
    const resolvedPlaceId = PLACE_ALIASES[placeId] || placeId;
    const place = PLACE_METADATA[resolvedPlaceId];
    if (!place) throw new RangeError(`Unknown Atlas place: ${placeId}`);
    const targetZoom = place.zoom[this.state.view] || 1;
    if (targetZoom >= 5) await this._ensureDetailedGeometry();
    if (!options.inSequence) this._sequenceToken += 1;
    this.state.focus = resolvedPlaceId;
    this.state.selectedCountryId = place.isoNumeric || null;
    this.state.comparison = null;
    const completed = await this._animateView(
      this._viewTargetForPlace(resolvedPlaceId),
      options.animate === false ? 0 : options.duration,
    );
    if (!completed) return this;
    this.render();
    if (options.announce !== false) {
      this._announce(`${place.label}. ${place.invitation}`);
    }
    this._emitChange('focus-place');
    return this;
  }

  async focusSequence(destination = 'gambia', options = {}) {
    const resolvedDestination = PLACE_ALIASES[destination] || destination;
    const sequence =
      resolvedDestination === 'gambia' ? GAMBIA_FOCUS_SEQUENCE : [resolvedDestination];
    // Animation and sequence tokens have separate jobs. Each focus step starts
    // a new animation, so using the animation token as the sequence identity
    // caused the sequence to cancel itself after its first step. Cancel any
    // previous animation, then establish one stable sequence token instead.
    this._cancelAnimation(false);
    const sequenceToken = ++this._sequenceToken;
    for (const placeId of sequence) {
      if (this._destroyed || sequenceToken !== this._sequenceToken) return false;
      await this.focusPlace(placeId, {
        duration: options.stepDuration ?? 760,
        announce: options.announce !== false,
        inSequence: true,
      });
      if (this._destroyed || sequenceToken !== this._sequenceToken) return false;
      if (!this.reducedMotion && placeId !== sequence[sequence.length - 1]) {
        await sleep(options.pause ?? 180);
      }
    }
    return true;
  }

  setView(view, options = {}) {
    const nextView = view === 'flat' ? 'flat' : 'globe';
    if (nextView === this.state.view) return this;
    this._cancelAnimation();
    this.state.view = nextView;
    const target = this.state.focus
      ? this._viewTargetForPlace(this.state.focus)
      : nextView === 'flat'
        ? { flatCenter: [0, 10], flatPan: [0, 0], zoom: 1 }
        : { rotation: [0, -12, 0], zoom: 1 };
    this._animateView(target, options.animate === false ? 0 : 520).then((completed) => {
      if (!completed) return;
      this._announce(nextView === 'flat' ? 'Flat world map.' : 'Globe view.');
      this._emitChange('view-changed');
    });
    return this;
  }

  setTool(tool) {
    if (!['explore', 'marker', 'journey'].includes(tool)) {
      throw new RangeError(`Unknown Atlas tool: ${tool}`);
    }
    this.state.tool = tool;
    this.render();
    const messages = {
      explore: 'Move and inspect. Tap a country to notice its name.',
      marker: 'Place markers. Tap the map, or press Enter to mark the centre.',
      journey: 'Journey Thread. Choose an origin and a destination.',
    };
    this._announce(messages[tool]);
    this._emitChange('tool-changed');
    this.svg.focus({ preventScroll: true });
    return this;
  }

  setLayer(layer, visible) {
    if (!['labels', 'equator', 'oceans', 'climate'].includes(layer)) {
      throw new RangeError(`Unknown Atlas layer: ${layer}`);
    }
    this.state[layer] = Boolean(visible);
    this.render();
    this._announce(
      layer === 'climate' && visible
        ? 'Broad climate pattern guides shown. These are clues, not exact climate borders.'
        : `${layer[0].toUpperCase()}${layer.slice(1)} ${visible ? 'shown' : 'hidden'}.`,
    );
    this._emitChange('layer-changed');
    return this;
  }

  setBiome(biomeId) {
    const biome = BIOME_GUIDES[biomeId];
    if (!biome) throw new RangeError(`Unknown Atlas biome guide: ${biomeId}`);
    this.state.climate = true;
    this.state.selectedBiome = biomeId;
    this.render();
    this._announce(`${biome.label}. ${biome.description} ${biome.caution}`);
    this._emitChange('biome-inspected');
    return this;
  }

  zoomBy(factor, options = {}) {
    this._cancelAnimation();
    this.state.zoom = clamp(this.state.zoom * Number(factor || 1), 0.7, 18);
    if (this.state.zoom >= 5 && !this._detailedGeometry) void this._ensureDetailedGeometry();
    this.render();
    if (options.announce !== false) {
      const scaleGuide = this._calculateScaleGuide();
      this._announce(
        scaleGuide
          ? `Map scale changed. ${scaleGuide.label}.`
          : `Map scale changed to ${this.state.zoom.toFixed(1)} times.`,
      );
    }
    this._emitChange('zoom-changed');
    return this;
  }

  inspectCoordinate(coordinates) {
    if (!finiteCoordinate(coordinates)) return null;
    const country = this._geometryForCurrentScale().findCountryAt(coordinates);
    this.state.selectedCountryId = country?.id || null;
    this.state.focus = null;
    this.state.comparison = null;
    this.render();
    const label = country?.properties?.displayName || 'Ocean';
    this._announce(
      country
        ? `${label}. Look at its neighbours, coastline and position.`
        : 'Ocean. Move towards a coastline or compare the surrounding land.',
    );
    this._emitChange('coordinate-inspected');
    return country;
  }

  _inspectMapCentre() {
    const coordinates = this._projection?.invert?.([VIEWBOX.width / 2, VIEWBOX.height / 2]);
    if (!finiteCoordinate(coordinates)) {
      this._announce('Move the map until a place or ocean is beneath the centre mark.');
      return null;
    }
    return this.inspectCoordinate(cleanCoordinate(coordinates));
  }

  addMarker(coordinates, options = {}) {
    if (!finiteCoordinate(coordinates)) throw new TypeError('Marker coordinates are invalid.');
    const cleaned = cleanCoordinate(coordinates);
    const marker = {
      id: options.id || uniqueId('marker'),
      coordinates: cleaned,
      label: options.label || placeLabelAt(cleaned),
      createdAt: options.createdAt || new Date().toISOString(),
    };
    this.state.markers.push(marker);
    this.render();
    this._announce(`Marker placed: ${marker.label}.`);
    this._emitChange('marker-added');
    return deepClone(marker);
  }

  clearMarkers() {
    if (this.state.markers.length === 0) return this;
    this.state.markers = [];
    this.render();
    this._announce('Temporary markers cleared.');
    this._emitChange('markers-cleared');
    return this;
  }

  addJourneyPoint(coordinates, options = {}) {
    if (!finiteCoordinate(coordinates)) throw new TypeError('Journey coordinates are invalid.');
    const cleaned = cleanCoordinate(coordinates);
    if (this.state.journey.points.length >= 2) {
      this.state.journey.points = [];
      this.state.journey.narration = '';
    }
    const point = {
      id: options.id || uniqueId('journey-point'),
      coordinates: cleaned,
      label: options.label || placeLabelAt(cleaned),
    };
    this.state.journey.points.push(point);
    this.render();
    if (this.state.journey.points.length === 1) {
      this._announce(`${point.label} is the origin. Now choose a destination.`);
    } else {
      const summary = createJourneySummary(this.state.journey.points);
      this._announce(
        `Journey to ${point.label}: about ${summary.distanceKm.toLocaleString()} kilometres ${summary.direction}. ${
          summary.crossesEquator ? 'It crosses the equator.' : 'It does not cross the equator.'
        }`,
      );
    }
    this._emitChange('journey-point-added');
    return deepClone(point);
  }

  setJourney(origin, destination = null, options = {}) {
    const points = [origin, destination]
      .filter(Boolean)
      .map((point) => {
        const coordinates = point.coordinates || point;
        if (!finiteCoordinate(coordinates)) {
          throw new TypeError('Journey coordinates are invalid.');
        }
        const cleaned = cleanCoordinate(coordinates);
        return {
          id: point.id || uniqueId('journey-point'),
          coordinates: cleaned,
          label: point.label || placeLabelAt(cleaned),
        };
      });
    this.state.journey = {
      points,
      narration: String(options.narration || ''),
    };
    this.render();
    this._emitChange('journey-set');
    return this.getJourneySummary();
  }

  setJourneyNarration(narration) {
    this.state.journey.narration = String(narration || '').slice(0, 320);
    this.render();
    this._emitChange('journey-narration');
    return this;
  }

  getJourneySummary() {
    return createJourneySummary(this.state.journey.points);
  }

  clearJourney() {
    this.state.journey = { points: [], narration: '' };
    this.render();
    this._announce('Journey Thread cleared. Choose a new origin when you are ready.');
    this._emitChange('journey-cleared');
    return this;
  }

  comparePlaces(firstPlaceId = 'uk', secondPlaceId = 'gambia', options = {}) {
    const resolvedFirstPlaceId = PLACE_ALIASES[firstPlaceId] || firstPlaceId;
    const resolvedSecondPlaceId = PLACE_ALIASES[secondPlaceId] || secondPlaceId;
    const first = PLACE_METADATA[resolvedFirstPlaceId];
    const second = PLACE_METADATA[resolvedSecondPlaceId];
    if (!first || !second) throw new RangeError('Both comparison places must be registered.');
    this._cancelAnimation();
    this.state.view = 'flat';
    this.state.focus = null;
    this.state.selectedCountryId = null;
    this.state.comparison = [resolvedFirstPlaceId, resolvedSecondPlaceId];
    const target = {
      flatCenter: [
        (first.coordinates[0] + second.coordinates[0]) / 2,
        (first.coordinates[1] + second.coordinates[1]) / 2,
      ],
      flatPan: [0, 0],
      zoom: 2.2,
    };
    this._animateView(target, options.animate === false ? 0 : 720).then((completed) => {
      if (!completed) return;
      this._announce(
        `${first.label} and ${second.label}. Compare location, equator, coastline, broad climate and scale.`,
      );
      this._emitChange('comparison-opened');
    });
    return this;
  }

  clearComparison() {
    this.state.comparison = null;
    this.focusPlace('world');
    return this;
  }

  setQuestion(question) {
    this.state.question = String(question || '').slice(0, 500);
    this._emitChange('question-changed');
    return this;
  }

  speakCurrentPlace() {
    const place = this._currentPlace();
    if (!globalThis.speechSynthesis || !globalThis.SpeechSynthesisUtterance) {
      this._announce(`${place.label}. Spoken names are not available in this browser.`);
      return false;
    }
    globalThis.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(place.spokenLabel || place.label);
    utterance.rate = 0.82;
    utterance.pitch = 1;
    globalThis.speechSynthesis.speak(utterance);
    return true;
  }

  getState() {
    return deepClone(this.state);
  }

  setState(nextState, options = {}) {
    this._cancelAnimation();
    this.state = normaliseState({ ...this.state, ...deepClone(nextState) });
    this.render();
    if (options.emit !== false) this._emitChange('state-set');
    return this;
  }

  _createCompactPreviewMarkup() {
    this.render();
    const geometry = this._geometryForCurrentScale();
    const svg = createSvgElement('svg', {
      xmlns: SVG_NS,
      viewBox: `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`,
      preserveAspectRatio: 'xMidYMid meet',
    });
    svg.append(createSvgElement('rect', {
      width: VIEWBOX.width,
      height: VIEWBOX.height,
      fill: '#cbdfe1',
    }));

    const appendPath = (feature, attributes) => {
      const pathData = this._path(feature);
      if (!pathData) return;
      const compactPath = pathData.replace(/-?\d+\.\d{2,}/g, (number) => String(Math.round(Number(number) * 10) / 10));
      svg.append(createSvgElement('path', { d: compactPath, ...attributes }));
    };

    appendPath({ type: 'Sphere' }, { fill: '#cbdfe1', stroke: '#435276', 'stroke-width': 1.4 });
    appendPath(geometry.LAND, { fill: '#d8d4b6', stroke: '#6d725e', 'stroke-width': 0.8 });

    const focus = this.state.focus ? PLACE_METADATA[this.state.focus] : null;
    const highlightedIds = new Set([
      ...(focus?.highlightIds || []),
      ...((this.state.comparison || []).map((placeId) => PLACE_METADATA[placeId]?.isoNumeric).filter(Boolean)),
      ...(this.state.selectedCountryId ? [this.state.selectedCountryId] : []),
    ]);
    const highlighted = geometry.COUNTRIES.features.filter((country) => highlightedIds.has(country.id));
    if (highlighted.length) {
      appendPath({ type: 'FeatureCollection', features: highlighted }, {
        fill: '#bd8067',
        stroke: '#402d26',
        'stroke-width': 1.8,
        'stroke-dasharray': this.state.comparison ? '7 3' : 'none',
      });
    }
    if (this.state.climate) {
      CLIMATE_GUIDES.forEach((guide) => appendPath(latitudeLine(guide.latitude), {
        fill: 'none',
        stroke: guide.kind === 'tropical' ? '#7a4d33' : '#315b72',
        'stroke-width': 1.6,
        'stroke-dasharray': guide.kind === 'tropical' ? '10 4 2 4' : '3 5',
      }));
    }
    if (this.state.equator) appendPath(EQUATOR, { fill: 'none', stroke: '#8a503b', 'stroke-width': 2, 'stroke-dasharray': '8 7' });
    if (this.state.focus === 'gambia' || this.state.focus === 'westAfrica' || this.state.zoom >= 6) {
      appendPath(RIVER_GAMBIA, { fill: 'none', stroke: '#2d728a', 'stroke-width': 3 });
    }
    if (this.state.journey.points.length === 2) {
      appendPath({ type: 'LineString', coordinates: this.state.journey.points.map((point) => point.coordinates) }, {
        fill: 'none', stroke: '#2f3d61', 'stroke-width': 4, 'stroke-dasharray': '1 9', 'stroke-linecap': 'round',
      });
    }
    [...this.state.journey.points, ...this.state.markers].forEach((point) => {
      if (!this._coordinateIsVisible(point.coordinates)) return;
      const projected = this._projection(point.coordinates);
      if (!projected) return;
      svg.append(createSvgElement('circle', {
        cx: Math.round(projected[0] * 10) / 10,
        cy: Math.round(projected[1] * 10) / 10,
        r: 7,
        fill: '#fbf8f1',
        stroke: '#2f3d61',
        'stroke-width': 3,
      }));
    });
    const title = createSvgElement('text', {
      x: 26,
      y: 40,
      fill: '#24333a',
      'font-family': 'system-ui, sans-serif',
      'font-size': 22,
      'font-weight': 700,
      stroke: '#f5f0e5',
      'stroke-width': 5,
      'paint-order': 'stroke fill',
    });
    title.textContent = `${this._currentPlace().label} · ${this.state.view === 'globe' ? 'globe' : 'flat map'}`;
    svg.append(title);
    return new XMLSerializer().serializeToString(svg);
  }

  createSnapshot(options = {}) {
    this.render();
    return {
      schema: 'planet-atlas-snapshot',
      version: 1,
      id: uniqueId('atlas-snapshot'),
      title: options.title || `${this._currentPlace().label} exploration`,
      createdAt: new Date().toISOString(),
      destination: 'planet-atlas',
      artefactType: 'atlas-exploration-snapshot',
      state: this.getState(),
      journey: this.getJourneySummary(),
      comparison: this.state.comparison
        ? this.state.comparison.map((placeId) => ({ ...PLACE_METADATA[placeId] }))
        : null,
      question: this.state.question,
      attribution: deepClone(MAP_ATTRIBUTION),
      preview: options.includeSvg === false
        ? null
        : {
          type: 'svg',
          mimeType: 'image/svg+xml',
          markup: this._createCompactPreviewMarkup(),
        },
    };
  }

  saveSnapshot(options = {}) {
    const snapshot = this.createSnapshot(options);
    const delivery = {
      handled: false,
      status: 'unhandled',
      via: [],
      result: null,
      error: null,
    };
    // Keep delivery metadata available to the caller without allowing a
    // transient UI status to become part of the persisted snapshot contract.
    Object.defineProperty(snapshot, 'delivery', {
      configurable: false,
      enumerable: false,
      value: delivery,
    });

    if (typeof this.options.onSnapshot === 'function') {
      try {
        const result = this.options.onSnapshot(snapshot, delivery);
        delivery.result = result;
        const declined = result === false || result?.handled === false;
        if (!declined) {
          delivery.handled = true;
          delivery.status = result && typeof result.then === 'function' ? 'pending' : 'accepted';
          delivery.via.push('callback');
        }
        if (result && typeof result.then === 'function') {
          Promise.resolve(result).then((resolved) => {
            if (resolved === false || resolved?.handled === false) {
              delivery.via = delivery.via.filter((source) => source !== 'callback');
              delivery.handled = delivery.via.length > 0;
              delivery.status = delivery.handled ? 'accepted' : 'unhandled';
              if (!delivery.handled) {
                this._announce('The exploration snapshot was created, but it has not been saved to My Work.');
              }
              return;
            }
            delivery.status = 'handled';
          }).catch((error) => {
            delivery.error = error;
            delivery.via = delivery.via.filter((source) => source !== 'callback');
            delivery.handled = delivery.via.length > 0;
            delivery.status = delivery.handled ? 'accepted' : 'failed';
            if (!delivery.handled) {
              this._announce('The exploration snapshot could not be saved to My Work. Try again.');
            }
          });
        }
      } catch (error) {
        delivery.error = error;
        delivery.status = 'failed';
      }
    }

    const eventDetail = {
      snapshot,
      delivery,
      markHandled: () => {
        delivery.handled = true;
        delivery.status = 'accepted';
        if (!delivery.via.includes('event')) delivery.via.push('event');
      },
    };
    this.root.dispatchEvent(
      new CustomEvent('atlas:snapshot', {
        detail: eventDetail,
        bubbles: true,
      }),
    );
    this._announce(delivery.handled
      ? 'The exploration snapshot was handed to My Work to save.'
      : 'The exploration snapshot was created, but it has not been saved to My Work.');
    return snapshot;
  }

  update(options = {}) {
    if ('onChange' in options) this.options.onChange = options.onChange;
    if ('onSnapshot' in options) this.options.onSnapshot = options.onSnapshot;
    if ('title' in options) {
      this.options.title = options.title;
      this.root.querySelector('.atlas-map__title').textContent = options.title;
    }
    if ('description' in options) {
      this.options.description = options.description;
      this.root.querySelector('.atlas-map__intro').textContent = options.description;
    }
    if ('reducedMotion' in options) {
      this.options.reducedMotion = options.reducedMotion;
      this.reducedMotion = Boolean(options.reducedMotion);
    }
    if (options.state) this.setState(options.state, { emit: options.emit !== false });
    else this.render();
    if (options.focus) this.focusPlace(options.focus, { animate: options.animate });
    return this;
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._cancelAnimation();
    if (this._renderFrame) cancelAnimationFrame(this._renderFrame);
    this._listeners.splice(0).forEach((removeListener) => removeListener());
    this.root.remove();
    this.container = null;
    this.root = null;
    this.svg = null;
    this.drawing = null;
    this.liveRegion = null;
  }
}

export default AtlasMap;
