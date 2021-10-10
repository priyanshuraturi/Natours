/* eslint-disable */
export const displayMap = (allLocations) => {
  console.log(allLocations);
  mapboxgl.accessToken =
    'pk.eyJ1IjoicHJpeWFuc2h1cmF0dXJpIiwiYSI6ImNrcmV2Y2c5NTAxcXMycHFuOGEwcHRpZncifQ.HgVaiK1RrE7eHkHG-Rp5Cg';

  var map = new mapboxgl.Map({
    container: 'map',
    style:
      'mapbox://styles/priyanshuraturi/ckrgdeng45ast18q98gct5nff',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
  });

  const bounds = new mapboxgl.LngLatBounds();

  allLocations.forEach((loc) => {
    //Add Marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //add POPup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
