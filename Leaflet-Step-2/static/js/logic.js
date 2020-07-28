// Define variables for our base layers
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-streets-v11",
  accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  maxZoom: 18,
  id: "mapbox/light-v9",
  accessToken: API_KEY
});

var outdoorMap =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  maxZoom: 18,
  id: "mapbox/outdoors-v9",
  accessToken: API_KEY
});


// used to store the earth quake markers
earthQuakeMarkers = [];
plateOverlays = [];

var link2 = "static/data/PB2002_plates.json";

d3.json(link2, function(data) {
    // Create a new choropleth layer
    plateOverlays.push(  
      L.choropleth(data, {
        style: {
            color: "red",
            weight: 1,
            fillOpacity: 0.1
        },
        // Binding a pop-up to each layer
        onEachFeature: function(feature, layer) {
          // Set mouse events to change map styling
          layer.on({
              // Mouseover event function, that feature's opacity changes to 90% so that it stands out
              mouseover: function(event) {
                  layer = event.target;
                  layer.setStyle({
                      fillOpacity: 0.4
                  });
              },
              // Mouseover event function, the feature's opacity reverts back to 50%
              mouseout: function(event) {
                  layer = event.target;
                  layer.setStyle({
                      fillOpacity: 0.1
                  });
              }
          });
          layer.bindPopup("<h2>Plate Name: " + feature.properties.PlateName + "</h2>");

      }
      })
    );    
});


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

      earthQuakeMarkers.push(
        L.circle(coordinates, {
          fillOpacity: 1,
          color: "red",
          weight: 0.5,
          bubblingMouseEvents: false,
          fillColor: chooseColor(parseFloat(magnitude)),
          // Setting our circle's radius equal to the output of our markerSize function
          // This will make our marker's size proportionate to its population
          radius: markerSize(magnitude)
        }).bindPopup("Time of Event: " + humanDateFormat+ "</h1> <hr> Magnitude: " + magnitude)
      );
  }); 

  // Create two separate layer groups: one for cities and one for states
  var earthquakes = L.layerGroup(earthQuakeMarkers);
  var plates = L.layerGroup(plateOverlays);

  // Create a baseMaps object
  var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorMap
  };

  // Create an overlay object
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": plates
  };

  // Define a map object
  var myMap = L.map("map", {
    center: [34.0522, -118.2437],
    zoom: 4,
    layers: [satelliteMap, plates, earthquakes]
  })

  // Pass our map layers into our layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


});

function markerSize(magnitude) {
    if( magnitude<0 )
    {
      return 1;
    }
    else
    {
      return magnitude*18000;
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