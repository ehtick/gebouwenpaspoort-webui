import { Layer, Source } from "react-map-gl";
import { LayerI } from "./LayerTypes";
import { BoundsMatrix } from "../bounds";
import { makeMapBoxLayer } from "./LayerStyles";
import { makeWfsUrl, makeWmsUrl } from "./utils";
import { bagLayerId } from "./LayerTypes";
import { boundsNL } from "./constants";

interface LayerSourceProps {
  layer: LayerI;
  bounds: BoundsMatrix | null;
}

export function LayerSource({ layer, bounds = boundsNL }: LayerSourceProps) {
  let mapBoxLayers = makeMapBoxLayer(layer);
  const effectiveBounds = bounds || boundsNL;

  if (layer.type == "raster") {
    return (
      <Source
        type="raster"
        tileSize={1000}
        bounds={effectiveBounds}
        tiles={[makeWmsUrl(layer)]}
        scheme="xyz"
      >
        {mapBoxLayers.map(mapBoxLayer => (
          <Layer {...mapBoxLayer} key={mapBoxLayer.id} beforeId={bagLayerId} />
        ))}
      </Source>
    );
  }

  // For GeoJSON sources, we use the bounds in the WFS URL but don't pass it as a prop
  const wfsUrl = makeWfsUrl(layer, effectiveBounds);

  return (
    <Source id={layer.id} type="geojson" data={wfsUrl}>
      {mapBoxLayers.map(mapBoxLayer => (
        <Layer {...mapBoxLayer} key={mapBoxLayer.id} />
      ))}
    </Source>
  );
}
