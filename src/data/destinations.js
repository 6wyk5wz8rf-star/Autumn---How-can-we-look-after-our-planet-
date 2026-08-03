/**
 * Permanent destination registry for the ten-build product.
 *
 * A registered destination is not necessarily child-facing. Consumers must use
 * `active` (or `getActiveDestinations`) rather than rendering every record.
 * Destination IDs and ordinals are persistence contracts and must not be
 * repurposed in later builds.
 */

export const DESTINATION_STATUS = Object.freeze({
  ACTIVE: 'active',
  REGISTERED: 'registered',
});

export const DESTINATIONS = Object.freeze([
  {
    id: 'planet-atlas',
    ordinal: 1,
    title: 'Planet Atlas',
    shortTitle: 'Atlas',
    route: '#/atlas',
    status: DESTINATION_STATUS.ACTIVE,
    active: true,
    activationBuild: 1,
    curriculumDomains: ['geography'],
    homeWorldLandmark: 'coastline-observatory',
  },
  {
    id: 'number-expedition',
    ordinal: 2,
    title: 'Number Expedition',
    shortTitle: 'Numbers',
    route: '#/numbers',
    status: DESTINATION_STATUS.ACTIVE,
    active: true,
    activationBuild: 2,
    curriculumDomains: ['mathematics'],
    homeWorldLandmark: 'measuring-stones',
  },
  {
    id: 'living-things-observatory',
    ordinal: 3,
    title: 'Living Things Observatory',
    shortTitle: 'Observatory',
    route: '/living-things-observatory',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 3,
    curriculumDomains: ['science'],
    homeWorldLandmark: 'distant-observation-hide',
  },
  {
    id: 'climate-laboratory',
    ordinal: 4,
    title: 'Climate Laboratory',
    shortTitle: 'Climate',
    route: '/climate-laboratory',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 4,
    curriculumDomains: ['geography', 'science', 'mathematics'],
    homeWorldLandmark: 'weather-instruments',
  },
  {
    id: 'materials-river',
    ordinal: 5,
    title: 'Materials River',
    shortTitle: 'Materials',
    route: '/materials-river',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 5,
    curriculumDomains: ['science', 'geography'],
    homeWorldLandmark: 'river-bend',
  },
  {
    id: 'story-theatre',
    ordinal: 6,
    title: 'Story Theatre',
    shortTitle: 'Stories',
    route: '/story-theatre',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 6,
    curriculumDomains: ['english'],
    homeWorldLandmark: 'paper-stage',
  },
  {
    id: 'word-workshop',
    ordinal: 7,
    title: 'Word Workshop',
    shortTitle: 'Words',
    route: '/word-workshop',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 7,
    curriculumDomains: ['english'],
    homeWorldLandmark: 'letterpress-shed',
  },
  {
    id: 'biography-mosaic',
    ordinal: 8,
    title: 'Biography Mosaic',
    shortTitle: 'Biography',
    route: '/biography-mosaic',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 8,
    curriculumDomains: ['english', 'geography'],
    homeWorldLandmark: 'mosaic-wall',
  },
  {
    id: 'community-garden',
    ordinal: 9,
    title: 'Community Garden',
    shortTitle: 'Community',
    route: '/community-garden',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 9,
    curriculumDomains: ['pshe'],
    homeWorldLandmark: 'garden-gate',
  },
  {
    id: 'tides-of-change-studio',
    ordinal: 10,
    title: 'Tides of Change Studio',
    shortTitle: 'Art Studio',
    route: '/tides-of-change-studio',
    status: DESTINATION_STATUS.REGISTERED,
    active: false,
    activationBuild: 10,
    curriculumDomains: ['art-and-design'],
    homeWorldLandmark: 'cliffside-studio',
  },
]);

/** Return a destination by its permanent ID, or null when absent. */
export function getDestinationById(id, destinations = DESTINATIONS) {
  return destinations.find((destination) => destination.id === id) ?? null;
}

/** Child-facing destinations for the current build. */
export function getActiveDestinations(destinations = DESTINATIONS) {
  return destinations.filter((destination) => destination.active);
}

export default DESTINATIONS;
