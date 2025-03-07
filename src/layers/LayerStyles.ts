import { AnyLayer, SymbolLayer, RasterLayer } from "react-map-gl";
import { LayerI } from "./LayerTypes";
import { stringToColor } from "./utils";
import { bagLayerId } from "./LayerTypes";

/**
 * We try to find the best way to make MapBox render a layer.
 * https://docs.mapbox.com/style-spec/reference/layers/#type
 *
 * The problem here is that we don't know whether the layer itself will have line, point, polygon data.
 *
 * Right now we create layers for fills, lines and symbols, but that also means our line lines will be filled - which looks bad.
 *
 */
export function makeMapBoxLayer(layer: LayerI): AnyLayer[] {
  if (layer.type === "vector") {
    return [
      {
        id: layer.id,
        source: layer.id,
        type: "fill",
        paint: {
          "fill-color": stringToColor(layer.id),
          "fill-opacity": 0.3,
        },
      },
      {
        id: `${layer.id}-line`,
        source: layer.id,
        type: "line",
        paint: {
          "line-color": "#000000",
          "line-width": 2,
        },
      },
      {
        id: `${layer.id}-symbol`,
        source: layer.id,
        type: "symbol",
        layout: {
          "text-field": ["get", layer.textField || "tekst"],
          "icon-image": "my-marker",
          "icon-size": ["get", "size"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "symbol-sort-key": ["get", "sort-key"],
          "text-size": 12,
          "icon-padding": 1,
          "text-offset": [0, 1.25],
          "text-anchor": "top",
          "text-allow-overlap": false,
          "icon-allow-overlap": true,
          "text-optional": true,
          "icon-optional": false,
        },
        paint: {
          "text-halo-color": "rgba(255,255,255,0.75)",
          "text-halo-width": 1,
          "icon-color": stringToColor(layer.id),
        },
      },
    ];
  }
  return [
    layer.type === "symbol" ? makeSymbolLayer(layer) : makeRasterLayer(layer),
  ];
}

const makeSymbolLayer = (layer: LayerI): SymbolLayer => ({
  id: layer.id,
  source: layer.id,
  type: "symbol",
  layout: {
    "text-field": ["get", layer.textField],
    "icon-image": "my-marker",
    "icon-size": ["get", "size"],
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "symbol-sort-key": ["get", "sort-key"],
    "text-size": 12,
    "icon-padding": 1,
    "text-offset": [0, 1.25],
    "text-anchor": "top",
  },
  paint: {
    "text-halo-color": "rgba(255,255,255,0.75)",
    "text-halo-width": 1,
    "icon-color": ["get", "color"],
  },
});

const makeRasterLayer = (layer: LayerI): RasterLayer => ({
  id: layer.id,
  type: "raster",
  source: "raster-tiles",
  minzoom: 0,
  maxzoom: 22,
});

export const bagLayer: SymbolLayer = {
  id: bagLayerId,
  source: bagLayerId,
  type: "symbol",
  layout: {
    "text-field": ["get", "title"],
    "icon-image": ["get", "icon"],
    "icon-size": ["get", "size"],
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-offset": [0, 1.25],
    "text-anchor": "top",
    "symbol-sort-key": ["get", "sort-key"],
    "text-size": ["get", "text-size"],
    "icon-padding": 1,
  },
  paint: {
    "text-halo-color": "rgba(255,255,255,0.75)",
    "text-halo-width": 1,
    "icon-color": ["get", "color"],
  },
};
