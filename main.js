import Map from 'ol/Map.js';
import View from 'ol/View.js';
import VectorTileSource from 'ol/source/VectorTile';
import VectorTile from 'ol/layer/VectorTile';
//import {Circle, Fill, Stroke, Style} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import MVT from 'ol/format/MVT';
import { createLayer } from './Layer/createLayer';
import { styleLayer } from './Layer/styleLayer';
import {Circle, Fill, Stroke, Style} from 'ol/style';
import {createXYZ} from 'ol/tilegrid';




//fichier de style PLAN IGN
let standard = 'https://wxs.ign.fr/static/vectorTiles/styles/PLAN.IGN/essentiels/standard.json';

//fond de carte
let plan_ign = createLayer('https://wxs.ign.fr/essentiels/geoportail/tms/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf', standard, 'plan_ign', new MVT());


function createAddressStyle(feature) {
  return new Style({
    text: new Text({
      text: feature.get('label'),
      offsetY: -15,
      font: '12px sans-serif',
      fill: new Fill({color: '#000'}),
      stroke: new Stroke({color: '#fff', width: 3}),
      backgroundFill: new Fill({color: 'rgba(255, 255, 255, 0.7)'}),
    }),
    image: new Circle({
      radius: 5,
      fill: new Fill({color: 'rgba(255, 0, 0, 0.7)'}),
      stroke: new Stroke({color: '#fff', width: 1}),
    }),
  });
}




let vectorTileSource = new VectorTileSource({
  url: 'https://plateforme.adresse.data.gouv.fr/tiles/ban/{z}/{x}/{y}.pbf',
  format: new MVT(),
  maxZoom: 14
});

let vectorTileLayer = new VectorTile({
  source: vectorTileSource,
  declutter: true,

  visible: true,
  style: createAddressStyle
});

//tableau de couches
let layers = [plan_ign];


//création de la carte
var map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    maxZoom: 25,
    center: fromLonLat([1.8883335, 46.603354]),
    zoom: 5  })
});

styleLayer(map.getLayers().array_)

//map.addLayer(vectorTileLayer)


function viewFeatureAndCenterMap(feature) {

  let view = map.getView()

  view.animate({
    center: fromLonLat(feature.geometry.coordinates),
    zoom: 13,
    duration: 500
  })
  
}

const input = document.getElementById("adress")
const proposition = document.getElementById("proposition");
let ul = document.getElementById('proposition-container');

function createMarker(element) {
  /*let newVectorLayer = new VectorTileLayer({
    source: [element]
  })*/

  return element
}





function displayProposition(response) {
  if (Object.keys(response.features).length > 0) {
      proposition.style.display = "block";
      
      
      ul.innerHTML = ""
      
      response.features.forEach( (element) => {
          let li = document.createElement('li');
          let ligneAdresse = document.createElement('span');
          let infosAdresse = document.createTextNode(element.properties.postcode + ' ' + element.properties.city);
          ligneAdresse.innerHTML = element.properties.name;
          //li.onclick = function () { propositionAdresse(element); };
          li.appendChild(ligneAdresse);
          li.appendChild(infosAdresse);
          ul.appendChild(li);

          li.addEventListener('click', () => {
            
            viewFeatureAndCenterMap(element)
            ul.innerHTML = ""
            input.innerHTML = ""

            /*let layer = new VectorTileLayer({
              source
            })*/
            //map.addLayer(newVectorLayer)
            //console.log(feature);
          })

      });
  } else {
      proposition.style.display = "none";
  }
}

function getFeaturesAndAutocomplete() {
  input.addEventListener('input', () =>{
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${input.value}&autocomplete=1`)
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          //console.log(data);
          displayProposition(data)
        })
      }
    }).catch((error) => {
      return "Aucune adresse"
    })
    })
  
}

//getFeaturesAndAutocomplete()

async function processLocalCsvFile(csvFilePath) {
  // Charger le fichier CSV local
  const response = await fetch(csvFilePath);
  const csvContent = await response.text();

  // Envoyer les données à l'API de la BAN pour effectuer un géocodage de masse
  const formData = new FormData();
  const csvBlob = new Blob([csvContent], { type: "text/csv" });

  formData.append("data", csvBlob);
  formData.append("columns", "nom");
  formData.append("columns", "adresse");
  formData.append("columns", "postcode");
  formData.append("columns", "city");

  const url = "https://api-adresse.data.gouv.fr/search/csv/";
  const geocodeResponse = await fetch(url, {
    method: "POST",
    body: formData
  });

  // Traiter les résultats et afficher les adresses sur la carte OpenLayers
  const resultText = await geocodeResponse.text();
  const resultRows = resultText.split("\n").slice(1); // Ignorer la première ligne (en-têtes)

  console.log(resultText);

  const geocodedAddresses = resultRows.map((row) => {
    const columns = row.split(";");
    const lat = parseFloat(columns[11]);
    const lng = parseFloat(columns[12]);
    const address = columns[0] + ', ' + columns[1];
    return { lat, lng, address };
  });


  /*for (const { lat, lng, address } of geocodedAddresses) {
    if (!isNaN(lat) && !isNaN(lng)) {
      const coordinates = ol.proj.fromLonLat([lng, lat]);
      addMarker(coordinates, address);
    } else {
      console.warn(`Adresse non trouvée : ${address}`);
    }
  }*/
}

const csvFilePath = "./search.csv";
console.log(processLocalCsvFile(csvFilePath));;