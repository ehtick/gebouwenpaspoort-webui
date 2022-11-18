import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import "./Map.css";
import { useGeoSearch } from "./useGeoSearch";
import MapGL, { MapRef, Marker } from "react-map-gl";
import { LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AppContext } from "./App";
import { Gebouw } from "./schema";
import { useSearchBox } from "react-instantsearch-hooks-web";

const mapboxToken =
  "pk.eyJ1Ijoiam9lcGlvIiwiYSI6ImNqbTIzanZ1bjBkanQza211anFxbWNiM3IifQ.2iBrlCLHaXU79_tY9SVpXA";

export const mapStartState = {
  latitude: 52.0907,
  longitude: 5.1213,
  zoom: 11,
};

export const startBounds: LngLatBounds = {
  northEast: { lng: 5.213937031523301, lat: 52.15495150795488 },
  southWest: { lng: 5.0036518447552965, lat: 52.03357469016032 },
};

export function Map() {
  const { items, refine } = useGeoSearch();
  const { query } = useSearchBox();
  const { setCurrent, current } = useContext(AppContext);
  const mapRef = useRef<MapRef>();
  const [viewState, setViewState] = React.useState(mapStartState);
  const [prisine, setPristine] = useState(true);

  // If user changed the query, move the bounds to the new items
  useEffect(() => {
    if (!prisine || !mapRef.current) {
      return;
    }
    // Don't set the bounds if there are no items
    if (items.length == 0) {
      return;
    }
    const center = mapRef.current.getMap().getBounds().getCenter();
    let lowLat = center.lat;
    let highLat = center.lat;
    let lowLng = center.lng;
    let highLng = center.lng;
    items.forEach((item) => {
      const { lat, lng } = item._geoloc;

      // For some reason the extend method doesn't work, so we do it manually
      // bounds.extend(item._geoloc);
      if (lat < lowLat) {
        lowLat = lat;
      }
      if (lat > highLat) {
        highLat = lat;
      }
      if (lng < lowLng) {
        lowLng = lng;
      }
      if (lng > highLng) {
        highLng = lng;
      }
    });
    let bounds = new LngLatBounds(
      { lat: highLat, lng: highLng },
      { lat: lowLat, lng: lowLng }
    );

    mapRef.current?.fitBounds(bounds, {
      padding: 250,
    });
  }, [prisine, query]);

  // If the user moves the map, update the query to filter current area
  const updateBoundsQuery = useCallback((evt) => {
    if (!evt.originalEvent) {
      return;
    }
    const bounds = mapRef.current.getMap().getBounds();
    refine({
      northEast: bounds.getNorthEast(),
      southWest: bounds.getSouthWest(),
    });
    setViewState(evt.viewState);
  }, []);

  // Memoize markers to prevent rerendering
  const markers = useMemo(
    () =>
      items.map((item) => {
        const isCurrent = item.id == current?.id;
        return (
          <Marker
            onClick={() => setCurrent(item as unknown as Gebouw)}
            longitude={item._geoloc.lng}
            latitude={item._geoloc.lat}
            anchor="bottom"
            // We need this key to make sure the content re-renders, for some reason color changes don't trigger an update
            key={`${item.id} ${isCurrent}`}
            color={isCurrent ? "#000000" : "#FF0000"}
            style={{
              zIndex: isCurrent ? 100 : 0,
            }}
          ></Marker>
        );
      }),
    [items, current]
  );

  return (
    <MapGL
      initialViewState={viewState}
      mapboxAccessToken={mapboxToken}
      onMoveEnd={updateBoundsQuery}
      style={{ width: "100%", height: "100%", flexBasis: "600px", flex: 1 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      ref={mapRef}
      attributionControl={false}
    >
      {markers}
    </MapGL>
  );
}
