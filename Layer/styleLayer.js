import { applyStyle, stylefunction } from "ol-mapbox-style";

//fonction permettant d'afficher le style
export function styleLayer(mylayers){
  
    for (let i = 0; i < mylayers.length; i++) {
      fetch(mylayers[i].get('styleUrl')).then(function(response){
        response.json().then(function (style){
          stylefunction(mylayers[i], style, Object.keys(style.sources)[0]);
        });
        })
    }
    
    
  }