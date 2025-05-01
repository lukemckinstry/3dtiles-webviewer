import React, { useEffect, useRef } from 'react';
import { Viewer as CesiumViewer, Terrain, Ion } from "cesium";

const CESIUM_CONTAINER_ID = "cesiumContainer";

const CesiumMap = ({ cesiumViewer, setCesiumViewer }) => {
  const viewerContainer = useRef(null);

  useEffect(() => {
    const initializeGlobe = () => {
      const ionToken = import.meta.env.VITE_ION_TOKEN;
      if (ionToken)
        Ion.defaultAccessToken = ionToken;

      const viewer = new CesiumViewer(
        CESIUM_CONTAINER_ID,
        // { terrain: Terrain.fromWorldTerrain() }
      );
      setCesiumViewer(viewer);
    }
    if (!cesiumViewer) {
      initializeGlobe();
    }
  }, [cesiumViewer, setCesiumViewer]);

  return (
    <div
      id={CESIUM_CONTAINER_ID}
      ref={viewerContainer}
    />
  );
};

export default CesiumMap;
