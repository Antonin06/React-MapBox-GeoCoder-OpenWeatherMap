import './App.css';
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import React, { useState, useRef, useCallback } from "react";
import ReactMapGL from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW50b25pbjA2IiwiYSI6ImNrcTE5bWx4eTBjajkyc3FycXNrbWxhazEifQ.mnLB0CdJLi7WCb7flAVc6Q";

const api = {
  key: "b51860d2f2812bd91529f76e2b3d3d70",
  base: "https://api.openweathermap.org/data/2.5/"
};
const App = () => {
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });
  const [current, setCurrent] = useState([]);
  const mapRef = useRef();
    const geocoderContainerRef = useRef();

  const handleViewportChange = useCallback(
      (newViewport) => setViewport(newViewport),
      []
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
      (newViewport) => {
        const geocoderDefaultOverrides = { transitionDuration: 1000 };

        return handleViewportChange({
          ...newViewport,
          ...geocoderDefaultOverrides
        });
      },
      [handleViewportChange]
  );

  const handleOnResults = useCallback((result) => {
    fetch(
        `${api.base}weather?lat=${result.result.center[1]}&lon=${result.result.center[0]}&units=metric&APPID=${api.key}`
    )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Une erreur s'est produite");
          }
          return res.json();
        })
        .then((result) => {
          setCurrent(result);
          console.log(result, "current");

          fetch(
              `${api.base}onecall?lat=${result.coord.lat}&lon=${result.coord.lon}&exclude=hourly,minutely,current&units=metric&appid=${api.key}`
          )
              .then((res) => res.json())
              .then((result) => {
                console.log(result, "daily");
              });
        })
        .catch(() => {
          // setError(true);
        });
  },[useCallback]);

  return (
    <div className="App">
      <div style={{ height: "80vh" }}>
          <div
              ref={geocoderContainerRef}
              style={{ position: "absolute", top: 20, left: 20, zIndex: 1 }}
          />
        <ReactMapGL
            ref={mapRef}
            {...viewport}
            width="100%"
            mapStyle="mapbox://styles/mapbox/streets-v11"
            height="100%"
            onViewportChange={handleViewportChange}
            mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <Geocoder
              mapRef={mapRef}
              containerRef={geocoderContainerRef}
              onViewportChange={handleGeocoderViewportChange}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              placeholder="Votre Ville..."
              position="top-left"
              onResult={handleOnResults}
              clearOnBlur
              types={"place"}
          />
        </ReactMapGL>
      </div>
    </div>
  );
}

export default App;
