import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import Projection from 'ol/proj/Projection';
import MVT from 'ol/format/MVT';
import olms, { applyStyle } from "ol-mapbox-style";

//fonction qui permet de créer des couches
export function createLayer(layerUrl, layerName, format, cacheSize=null, style = null) {
    let newLayer =  new VectorTileLayer({
      source: new VectorTileSource({
        format: format,
        cacheSize : cacheSize,
        url: layerUrl
      }),
      declutter: true,
      projection: new Projection({code:"EPSG:3857"}),
      visible: true,
      renderMode: "vector",
      srcName: layerName,
      style: style, 
      renderBuffer: cacheSize
    });

  
    return newLayer;
    }