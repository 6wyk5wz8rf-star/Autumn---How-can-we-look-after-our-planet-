/**
 * Build 1 guided pathways for Planet Atlas.
 *
 * These records describe one continuous Notice -> Explore -> Make -> Explain ->
 * Revisit rhythm. They are intentionally data-only: the open atlas remains
 * available without a key, while a key routes into one of these pathways.
 */

const atlasActivity = (record) => Object.freeze({
  destinationId: 'planet-atlas',
  active: true,
  interactionModel: 'continuous',
  rhythm: ['Notice', 'Explore', 'Make', 'Explain', 'Revisit'],
  invitation: record.shortInvitation,
  supportedResponseModes: ['touch', 'visual', 'voice', 'short-text'],
  ...record,
});

export const PLANET_ATLAS_ACTIVITIES = Object.freeze([
  atlasActivity({
    id: 'earth-in-different-forms',
    order: 1,
    title: 'Earth in Different Forms',
    shortInvitation: 'Turn one planet into three useful views.',
    route: '#/activity/earth-in-different-forms',
    enquiry: 'How does the same Earth change when we represent it in different ways?',
    curriculumRefs: ['geo-maps-atlases-globes', 'geo-scale-direction'],
    conceptTags: ['earth', 'globe', 'map', 'atlas', 'representation', 'map-scale'],
    vocabulary: ['Earth', 'globe', 'map', 'atlas', 'scale'],
    flow: {
      notice: {
        prompt: 'Look at the globe, world map and close atlas view. What remains recognisable?',
        encounter: ['rotatable-globe', 'flat-world-map', 'close-atlas-view'],
      },
      explore: {
        actions: ['rotate', 'switch-view', 'zoom', 'align-landmarks', 'compare-scale'],
        prompts: [
          'Which view keeps the curved shape of Earth?',
          'What can the flat map show all at once?',
          'What becomes visible only when you move closer?',
          'Where does stretching or distortion appear on the flat map?',
        ],
      },
      make: {
        product: 'Arrange three linked views and mark one feature that stays recognisable.',
        choices: ['coastline', 'continent', 'ocean', 'equator'],
      },
      explain: {
        prompt: 'Choose the most useful view for one purpose and explain why.',
        sentenceSupport: 'The ___ view helps me see ___ because ___.',
      },
      revisit: { invitation: 'Change the purpose, then test whether another view becomes more useful.' },
    },
    keyCheck: {
      type: 'representation-choice',
      prompt: 'Which representation would help you see the whole world at once, and which would show a coastline closely?',
      unscored: true,
    },
    outcome: {
      artefactTypeId: 'three-view-comparison',
      titleTemplate: 'My three views of Earth',
      printable: true,
    },
  }),
  atlasActivity({
    id: 'locate-africa',
    order: 2,
    title: 'Locate Africa',
    shortInvitation: 'Use oceans, continents and coastlines as evidence.',
    route: '#/activity/locate-africa',
    enquiry: 'How can we locate a continent even when most labels disappear?',
    curriculumRefs: ['geo-locate-africa-gambia', 'geo-maps-atlases-globes'],
    conceptTags: ['africa', 'continent', 'country', 'region', 'atlantic-ocean', 'indian-ocean'],
    vocabulary: ['Africa', 'continent', 'country', 'region', 'ocean', 'coastline'],
    flow: {
      notice: {
        prompt: 'Find the large land areas and surrounding oceans. What shapes or positions do you recognise?',
        encounter: ['labelled-globe', 'labelled-world-map'],
      },
      explore: {
        actions: ['rotate', 'pan', 'fade-labels', 'place-marker-by-tap', 'use-marker-list-alternative'],
        prompts: [
          'Which ocean is west of Africa?',
          'Which ocean is east of Africa?',
          'Which continents are nearby?',
          'Can you still locate Africa when only coastlines remain?',
        ],
        explicitDistinction: {
          continent: 'a very large area of land containing many countries',
          country: 'an area with its own borders and government',
          region: 'an area grouped because of location or shared features; it may cross borders',
        },
      },
      make: {
        product: 'Place and label a marker, then annotate two pieces of map evidence.',
      },
      explain: {
        prompt: 'Explain how another explorer could find Africa without using its label.',
        sentenceSupport: 'I know this is Africa because ___.',
      },
      revisit: { invitation: 'Reduce the labels again and use different evidence.' },
    },
    keyCheck: {
      type: 'locate-with-evidence',
      prompt: 'Place Africa, then select the coastline or ocean evidence that helped you.',
      unscored: true,
    },
    outcome: {
      artefactTypeId: 'annotated-location-card',
      titleTemplate: 'How I located Africa',
      printable: true,
    },
  }),
  atlasActivity({
    id: 'find-the-gambia',
    order: 3,
    title: 'Find The Gambia',
    shortInvitation: 'Follow a careful trail from Earth to one West African country.',
    route: '#/activity/find-the-gambia',
    enquiry: 'How can scale and nearby features help us locate a small country?',
    curriculumRefs: ['geo-locate-africa-gambia', 'geo-maps-atlases-globes'],
    conceptTags: ['the-gambia', 'west-africa', 'senegal', 'river-gambia', 'coastline', 'map-scale'],
    vocabulary: ['The Gambia', 'Africa', 'West Africa', 'country', 'coastline', 'border', 'scale'],
    flow: {
      notice: {
        prompt: 'Watch the view move from Earth towards western Africa. Which landmarks keep you oriented?',
        encounter: ['world-context', 'africa-outline', 'west-africa-coastline'],
      },
      explore: {
        actions: ['step-zoom', 'zoom-back', 'trace-coastline', 'place-pin', 'choose-location-alternative'],
        orderedScaleTrail: ['Earth', 'Africa', 'West Africa', 'western coastline', 'The Gambia'],
        orientationAnchors: [
          'The Atlantic Ocean remains on the western side.',
          'The outline of Africa stays visible until the regional view is established.',
          'The close view shows The Gambia surrounded by Senegal except at its Atlantic coast.',
          'The River Gambia runs through the country towards the Atlantic Ocean.',
        ],
      },
      make: {
        product: 'Place a pin and keep a world, continent and country context beside it.',
      },
      explain: {
        prompt: 'Say The Gambia, record one observation and ask one geographical question.',
        pronunciationText: 'The Gambia',
        pronunciationGuide: 'thuh GAM-bee-uh',
      },
      revisit: { invitation: 'Return from the close view to the world without losing the location.' },
    },
    keyCheck: {
      type: 'scale-trail-reconstruction',
      prompt: 'Put the scale trail in order, then place The Gambia using the western coastline.',
      unscored: true,
    },
    geographicalSafeguards: [
      'The Gambia is a country in West Africa, not a region or a continent.',
      'The close view retains Senegal, the Atlantic coast and the River Gambia as context.',
    ],
    outcome: {
      artefactTypeId: 'place-pin',
      titleTemplate: 'My place pin: The Gambia',
      printable: true,
    },
  }),
  atlasActivity({
    id: 'equator-climate-patterns',
    order: 4,
    title: 'The Equator and Broad Climate Patterns',
    shortInvitation: 'Look for broad patterns without turning them into rules.',
    route: '#/activity/equator-climate-patterns',
    enquiry: 'What broad climate patterns can latitude help us notice, and what can it not explain alone?',
    curriculumRefs: ['geo-climate-zones-biomes', 'geo-maps-atlases-globes'],
    conceptTags: ['equator', 'latitude', 'climate', 'climate-zone', 'hemisphere', 'biome'],
    vocabulary: ['equator', 'hemisphere', 'climate', 'climate zone', 'biome'],
    flow: {
      notice: {
        prompt: 'Reveal the equator. Which places are near it, north of it and south of it?',
        encounter: ['equator-overlay', 'patterned-climate-bands'],
      },
      explore: {
        actions: ['toggle-equator', 'compare-latitudes', 'inspect-place', 'toggle-patterns'],
        prompts: [
          'What broad pattern do you notice near the equator?',
          'Which places do not fit a simple band?',
          'What else might influence climate besides latitude?',
        ],
        carefulLanguage: ['broadly', 'often', 'generally', 'influenced by', 'may experience'],
        additionalInfluences: ['altitude', 'distance from the sea', 'ocean currents', 'winds', 'landform'],
      },
      make: {
        product: 'Select three places and annotate one broad pattern and one important caution.',
      },
      explain: {
        prompt: 'Describe what the equator helps you predict without claiming that latitude decides everything.',
        sentenceSupport: 'Places near the equator often ___, but climate is also influenced by ___.',
      },
      revisit: { invitation: 'Add another climate influence and check whether your explanation changes.' },
    },
    keyCheck: {
      type: 'evidence-and-caution',
      prompt: 'Choose a supported broad pattern and the statement that keeps it accurate.',
      unscored: true,
    },
    outcome: {
      artefactTypeId: 'climate-pattern-observation',
      titleTemplate: 'A broad climate pattern I noticed',
      printable: true,
    },
  }),
  atlasActivity({
    id: 'compare-uk-gambia',
    order: 5,
    title: 'Compare the United Kingdom and The Gambia',
    shortInvitation: 'Compare two places using map evidence, not stereotypes.',
    route: '#/activity/compare-uk-gambia',
    enquiry: 'What can maps help us compare about the United Kingdom and The Gambia?',
    curriculumRefs: ['geo-place-comparison', 'geo-locate-africa-gambia', 'geo-climate-zones-biomes'],
    conceptTags: ['united-kingdom', 'the-gambia', 'equator', 'coastline', 'climate', 'map-scale'],
    vocabulary: ['country', 'continent', 'equator', 'coastline', 'climate', 'scale', 'physical feature'],
    flow: {
      notice: {
        prompt: 'Place both countries in the same world view. What is immediately visible, and what needs a closer view?',
        encounter: ['linked-world-view', 'matched-scale-country-views'],
      },
      explore: {
        actions: ['link-zoom', 'match-scale', 'toggle-equator', 'compare-evidence'],
        evidenceLenses: [
          'global location',
          'continent',
          'relationship to the equator',
          'coastline',
          'broad climate',
          'selected physical features',
          'relative map scale',
        ],
        safeguards: [
          'Do not reduce the comparison to hot and cold.',
          'Do not use rich/poor or modern/traditional as geographical categories.',
          'State what the selected map can and cannot show.',
        ],
      },
      make: {
        product: 'Build a two-place panel using at least two pieces of visible geographical evidence.',
      },
      explain: {
        prompt: 'Explain one similarity, one difference and the map evidence for each.',
        sentenceSupport: 'Both places ___. They differ because the map shows ___.',
      },
      revisit: { invitation: 'Match the map scale, then check whether your comparison still holds.' },
    },
    keyCheck: {
      type: 'evidence-selection',
      prompt: 'Select the statements supported by the maps and set aside those that need another source.',
      unscored: true,
    },
    outcome: {
      artefactTypeId: 'two-place-comparison',
      titleTemplate: 'The United Kingdom and The Gambia',
      printable: true,
    },
  }),
  atlasActivity({
    id: 'journey-thread',
    order: 6,
    title: 'Journey Thread',
    shortInvitation: 'Draw, inspect and revise a route between two places.',
    route: '#/activity/journey-thread',
    enquiry: 'What does a route reveal about direction, distance and the world between two places?',
    curriculumRefs: ['geo-scale-direction', 'geo-digital-mapping'],
    conceptTags: ['journey', 'route', 'direction', 'distance', 'continent', 'ocean', 'equator'],
    vocabulary: ['origin', 'destination', 'route', 'direction', 'distance', 'equator', 'scale'],
    flow: {
      notice: {
        prompt: 'Choose two places and inspect what lies between them before drawing.',
        encounter: ['world-route-canvas', 'compass', 'scale-readout'],
      },
      explore: {
        actions: ['choose-origin', 'choose-destination', 'draw-route', 'add-waypoint', 'undo', 'use-place-list-alternative'],
        liveEvidence: [
          'origin',
          'destination',
          'broad direction',
          'approximate distance',
          'oceans crossed',
          'continents involved',
          'equator crossing',
        ],
        accuracyNote: 'Distance is explicitly approximate and calculated from the selected route or great-circle comparison.',
      },
      make: {
        product: 'Create a visual route with optional waypoints and a chosen line style.',
      },
      explain: {
        prompt: 'Narrate the journey using direction, distance and geographical features.',
        sentenceSupport: 'My route begins at ___ and travels broadly ___ towards ___.',
      },
      revisit: { invitation: 'Revise one waypoint and compare how the direction or distance changes.' },
    },
    keyCheck: null,
    outcome: {
      artefactTypeId: 'journey-thread',
      titleTemplate: 'Journey from {origin} to {destination}',
      printable: true,
    },
  }),
  atlasActivity({
    id: 'place-portrait',
    order: 7,
    title: 'Place Portrait',
    shortInvitation: 'Gather a careful, revisable portrait of one place.',
    route: '#/activity/place-portrait',
    enquiry: 'Which evidence helps another person begin to understand a place?',
    curriculumRefs: ['geo-place-comparison', 'geo-climate-zones-biomes', 'geo-digital-mapping'],
    conceptTags: ['place', 'country', 'region', 'climate', 'physical-feature', 'habitat', 'biome'],
    vocabulary: ['country', 'region', 'climate', 'physical feature', 'habitat', 'biome', 'observation'],
    flow: {
      notice: {
        prompt: 'Inspect the place at more than one scale. Which details belong in a useful portrait?',
        encounter: ['linked-map-views', 'evidence-tray'],
      },
      explore: {
        actions: ['choose-place', 'inspect-layer', 'collect-evidence', 'remove-evidence', 'switch-guidance'],
        optionalEvidence: [
          'map',
          'country',
          'region',
          'broad climate',
          'selected physical feature',
          'habitat or biome connection',
          'useful numerical fact',
          'observation',
          'question',
        ],
        modes: {
          guided: 'Offers one evidence lens at a time with examples.',
          open: 'Provides the same evidence tools without a fixed order.',
        },
      },
      make: {
        product: 'Compose a visual profile; no field is compulsory simply to make the card look full.',
      },
      explain: {
        prompt: 'Add a voice explanation, symbols or short text to show why your evidence matters.',
      },
      revisit: { invitation: 'Return with a new source or lesson insight and revise the portrait while preserving its earlier version.' },
    },
    keyCheck: null,
    outcome: {
      artefactTypeId: 'place-portrait',
      titleTemplate: 'Place portrait: {place}',
      printable: true,
    },
  }),
  atlasActivity({
    id: 'understand-before-action',
    order: 8,
    title: 'Looking After a Place Begins with Understanding It',
    shortInvitation: 'Test an environmental action against evidence about a real place.',
    route: '#/activity/understand-before-action',
    enquiry: 'What should we understand before deciding how to look after a place?',
    curriculumRefs: ['geo-environmental-change', 'geo-place-comparison', 'pshe-community-contribution'],
    conceptTags: ['place', 'community', 'environmental-action', 'evidence', 'unintended-consequences'],
    vocabulary: ['community', 'environment', 'evidence', 'effect', 'consequence'],
    flow: {
      notice: {
        prompt: 'Look at several possible actions. What assumptions does each action make about the place?',
        encounter: ['action-scenarios', 'place-evidence-map'],
      },
      explore: {
        actions: ['choose-action', 'inspect-place-evidence', 'link-evidence', 'mark-missing-information'],
        questions: [
          'Would this action suit every place?',
          'What would we need to know first?',
          'Who could be affected?',
          'Which map evidence might help?',
          'Could the same action have different effects elsewhere?',
          'What information is still missing?',
        ],
      },
      make: {
        product: 'Create an evidence-and-questions response rather than an environmental checklist.',
      },
      explain: {
        prompt: 'Explain what must be understood before this action is chosen for this place.',
        sentenceSupport: 'Before deciding, I would need to know ___ because ___.',
      },
      revisit: { invitation: 'Link new work or evidence to a later Planet Question response.' },
    },
    keyCheck: {
      type: 'missing-evidence',
      prompt: 'Choose the information that would make one proposed action better informed.',
      unscored: true,
    },
    intendedUnderstanding: 'Looking after the planet requires understanding particular places, environments and communities.',
    outcome: {
      artefactTypeId: 'planet-question-response',
      titleTemplate: 'What I think now',
      printable: true,
      appendOnlyHistory: true,
    },
  }),
]);

/** All currently active Key Activities. Later builds append their own records. */
export const ACTIVITIES = PLANET_ATLAS_ACTIVITIES;

/** Return an activity by permanent ID, or null when absent. */
export function getActivityById(id, activities = ACTIVITIES) {
  return activities.find((activity) => activity.id === id) ?? null;
}

/** Return active activities for a destination in their authored order. */
export function getActivitiesForDestination(destinationId, activities = ACTIVITIES) {
  return activities
    .filter((activity) => activity.destinationId === destinationId && activity.active)
    .sort((a, b) => a.order - b.order);
}

export default ACTIVITIES;
