// Creating map object
var myMap = L.map("map", {
  center: [34.0522, -118.2437],
  zoom: 8
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

// used to store the earth quake markers
earthQuakeMarkers = [];

// Use this link to get the geojson data.
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grabbing our GeoJSON data..
d3.json(link, function(data) {
  features = data.features;
  Object.entries(features).forEach(([key, value]) => {
      var properties = value.properties;
      var magnitude = properties.mag;

      // convert to human readable date
      var timeOfEvent = properties.time;
      const dateObject = new Date(timeOfEvent)
      const humanDateFormat = dateObject.toLocaleString()
      
      var geometry = value.geometry;
      var coordinates = geometry.coordinates;
      coordinates.pop(); // take out last element which is the "depth"
      coordinates = coordinates.reverse(); // get the coordinates in longitude then latitude

      L.circle(coordinates, {
        fillOpacity: 1,
        color: "red",
        weight: 0.5,
        fillColor: chooseColor(parseFloat(magnitude)),
        // Setting our circle's radius equal to the output of our markerSize function
        // This will make our marker's size proportionate to its population
        radius: markerSize(magnitude)
      }).bindPopup("Time of Event: " + humanDateFormat+ "</h1> <hr> Magnitude: " + magnitude).addTo(myMap);
  });  
});

function markerSize(magnitude) {
    if( magnitude<0 )
    {
      return 1;
    }
    else
    {
      return magnitude*4000;
    }  
}

function chooseColor(magnitude) {
  if( convertFloat(magnitude) < convertFloat(1.000) ) {
    return "#E1F266";
  }
  else if( convertFloat(magnitude) >= convertFloat(1.000) && convertFloat(magnitude) < convertFloat(2.000) ) { 
    return "#99FF00";
  }
  else if(convertFloat(magnitude) >= convertFloat(2.000) && convertFloat(magnitude) < convertFloat(3.000)){ 
    return "#00FF00";
  }    
  else if(convertFloat(magnitude) >= convertFloat(3.000) && convertFloat(magnitude) < convertFloat(4.000)){ 
    return "#FF9900";
  }
  else if(convertFloat(magnitude) >= convertFloat(4.000) && convertFloat(magnitude) < convertFloat(5.000)){ 
    return "#FF4400";
  }    
  else
  {
    return "#FF0000";
  }  
}

function convertFloat(decimal) {
  return Math.floor(decimal*1000);
}