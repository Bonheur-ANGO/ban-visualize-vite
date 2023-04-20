import { applyStyle, stylefunction } from "ol-mapbox-style";

//fonction permettant d'afficher le style
export async function styleLayer(layer, styleUrl) {
    const response = await fetch(styleUrl);
    const styleJson = await response.json();
    const styleFunction = stylefunction(layer, styleJson, 'plan_ign');
    layer.setStyle(styleFunction);
  }