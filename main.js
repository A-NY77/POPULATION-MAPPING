// Initialize the map
let map = L.map("map", {
    center: [-0.1, 36.5], // Kenya region
    zoom: 7,
});

// OpenStreetMap Tile Layer
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// ESRI Imagery Tile Layer (Fixed HTTPS issue)
let esriImagery = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: `Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community`,
    }
);

// Base Maps for Layer Control
let baseMaps = {
    "OpenStreetMap": osm,
    "ESRI World Imagery": esriImagery,
};

// Add Layer Control to Map
L.control.layers(baseMaps).addTo(map);

// Define color breaks for population density
let breaks = [-Infinity, 34, 132, 330, 507, Infinity];
let colors = ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'];

// Function to assign colors based on population density
const population_color = (d) => { 
    for (let i = 0; i < breaks.length - 1; i++) { 
        if (d >= breaks[i] && d < breaks[i + 1]) { 
            return colors[i]; 
        } 
    } 
    return colors[colors.length - 1]; // Default to highest color if exceeds last break
};

// Styling function for the population GeoJSON layer
const population_style = (feature) => { 
    return { 
        fillColor: population_color(feature.properties.density), 
        color: "black", 
        opacity: 1, 
        fillOpacity: 0.7, 
        weight: 0.5, 
    }; 
};

// Load GeoJSON data (Make sure your GeoJSON file is correct)
fetch("population.geojson")
    .then((response) => response.json())
    .then((data) => {
        let population = L.geoJSON(data, {
            style: population_style, // Apply style
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`Population: ${feature.properties.population}`);
            }
        }).addTo(map);
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));

// Legend with title, color, and population ranges
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function() {
    let div = L.DomUtil.create('div', 'legend');
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.border = '2px solid #ccc'; // Add border around the legend

    // Title for the legend
    div.innerHTML = "<strong>Population Density (people per km²)</strong><br>";

    let labels = [];
    for (let i = 0; i < breaks.length - 1; i++) {
        // Color box with population range
        labels.push(
            `<i style="background:${colors[i]}"></i> ${breaks[i]} - ${breaks[i+1]} people/km²`
        );
    }
    div.innerHTML += labels.join('<br>');
    return div;
};

// Add the legend to the map
legend.addTo(map);
