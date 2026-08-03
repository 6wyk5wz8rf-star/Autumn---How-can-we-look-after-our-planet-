# Planet Atlas · Geography Sources and Accuracy Notes

Last reviewed: 3 August 2026.

Planet Atlas is an educational exploration map, not a navigation, survey, weather-forecast or legal-boundary product. It stores its normal-use geography locally so that children can explore offline without a commercial map API.

## Boundary and coastline geometry

- [Natural Earth](https://www.naturalearthdata.com/) supplies public-domain vector data at 1:110m and 1:50m scales.
- [`world-atlas`](https://github.com/topojson/world-atlas) packages Natural Earth country geometry as TopoJSON. The application uses 110m geometry for a fast world view and loads 50m geometry for close views.
- [Natural Earth Admin 0 notes](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/) explain that the standard dataset depicts de facto country boundaries. Planet Atlas therefore does not present the map as a legal boundary authority.

The build verifies the ISO numeric identifiers used for The Gambia (`270`), Senegal (`686`) and the United Kingdom (`826`). The close view retains neighbouring-country and coastline context.

## The Gambia

- The Government of The Gambia’s [National Transport Policy](https://motwi.gov.gm/wp-content/uploads/2024/02/THE-GAMBIA-NATIONAL-TRANSPORT-POLICY-2018-2027.pdf) describes the country as bounded by Senegal to the north, south and east, with the Atlantic Ocean to the west, and extending along the River Gambia.
- The Government of The Gambia’s [National Land Policy](https://molrg.gov.gm/wp-content/uploads/2025/03/National-Land-Policy.pdf) describes the River Gambia flowing from the Fouta Djallon highlands to the Atlantic and the country as a narrow strip of land surrounded by Senegal.
- The Government of The Gambia’s [National Malaria Policy](https://policies.gov.gm/d/caa64f90-5bad-11ec-9b31-029254d29bb1) describes a tropical climate with rainy and dry seasons.
- The World Bank [Climate Change Knowledge Portal](https://climateknowledgeportal.worldbank.org/country/gambia/climate-data-historical) is the reference for historical seasonal climate context.

The River Gambia line in the application is a hand-authored, approximate orientation cue. It is labelled as approximate in the interface and in saved work. It is not intended for navigation or boundary decisions.

## United Kingdom and broad climate patterns

- The UK Met Office describes the UK as having a [temperate maritime climate](https://weather.metoffice.gov.uk/climate-change/climate-change-in-the-uk), while emphasising changeable weather.
- The Met Office’s [UK regional climate summaries](https://www.metoffice.gov.uk/research/climate/maps-and-data/regional-climates) show why a single national description must retain regional and seasonal variation.
- The Met Office’s [climate-zone explanation](https://weather.metoffice.gov.uk/climate/climate-explained/climate-zones) supports the broad tropical, temperate and polar pattern language.

Planet Atlas deliberately says “broadly”, “often”, “generally”, “influenced by” and “may experience”. Latitude guides investigation but never appears as the sole cause of climate. The interface also names elevation, oceans, winds, currents and landform as other influences.

## Respectful representation checks

The content and interaction review confirms that:

- Africa is named as a continent containing many countries, regions, climates, languages and communities.
- The Gambia is represented as a particular country within West Africa.
- Comparison with the United Kingdom uses mapped location, latitude, coast, broad climate, physical features and relative scale—not wealth, modernity or cultural stereotypes.
- Environmental actions are presented as place-dependent questions with possible benefits, affected groups and unintended effects.
- No full copyrighted text or artwork is reproduced.

## Updating later builds

Later builds must preserve the source record and re-check claims when geography or climate content changes. Replace data only through a documented migration, retain attribution in saved artefacts, and keep broad educational overlays visually distinct from measured scientific datasets.
