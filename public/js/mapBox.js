/* eslint-disable */
// we are disabling eslint cause it is configured for node.js

console.log('hello from the client-side');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
//container:'map' means it will put  in the element with the id map that is why in the tour section(section-map) we have element with id of map
// you can change the center of map i.e whenever u open a map it will start from that place.Array of two cordinates. mapbox like mongodb so lan and lat oppsite way around and specify the zoom level if doesnot show that point on map
mapboxgl.accessToken =
  'pk.eyJ1IjoiYmlzaGx1IiwiYSI6ImNrYTZudXY4eDAxcWYyeG16dHBrcmFqNXgifQ.sP57BolySBydnCi36njfQg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/bishlu/cka6oeop70r521iphjc2uam6l',
  scrollZoom: false,
  //   center: [25.4651, 65.0121],
  //   zoom: 6,
  // we want to specify our center based on our tourLocation
});
// this bound area will be displayed on the map
// example var llb = new mapboxgl.LngLatBounds(sw, ne);
const bounds = new mapboxgl.LngLatBounds();
// loc has cordinates and by defauly in mapbox it needs to be an array
locations.forEach((loc) => {
  // create  marker to that location
  const el = document.createElement('div');
  el.className = 'marker';
  // it is specified in the css
  // for specifying marker
  // https://docs.mapbox.com/mapbox-gl-js/api/#marker
  /**
   * 
  // Create a new marker, set the longitude and latitude, and add it to the map
new mapboxgl.Marker()
  .setLngLat([-65.017, -16.457])
  .addTo(map);
  THIS IS A DEFAULT MAPBOX WHICH ADDS  LIGHT BLUE DROPLET IF WE DONT DEFINE THE EL AND ITS CLASSNAME
  SO 
  locations.forEach((loc)=>{
      new mapboxgl.Marker().setLnglat(loc.coordinates).addTo(map);
  })
   * 
   */
  // add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom', // it means bottom of the element u can put center also
  })
    .setLngLat(loc.coordinates)
    .addTo(map);
  // create popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}:${loc.description} </p>`)
    .addTo(map);
  // they overlap the marker so we need to set an offset property into the Popup;

  // extends map bound to include current locations
  // specifynign padding to the bound
  bounds.extend(loc.coordinates);
});
// to fit the map  using our bound and will have that padding
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 100,
    left: 100,
    right: 100,
  },
});
