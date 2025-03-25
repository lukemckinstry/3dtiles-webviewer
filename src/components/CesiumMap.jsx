import React, { useEffect, useState, useRef } from 'react';
import { Viewer as CesiumViewer, Entity, TerrainProvider } from "cesium";


const CesiumMap = () => {
  const viewerContainer = useRef(null);
  const [cesiumViewer, setCesiumViewer] = useState();

  useEffect(() => {

    const initializeGlobe = () => {
      const viewer = new CesiumViewer("cesiumContainer");
      setCesiumViewer(viewer) 
    }
    if (!cesiumViewer ) {
      initializeGlobe()
    }
  }, [cesiumViewer]);

  return (
    <div
      id="cesiumContainer"
      ref={viewerContainer}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default CesiumMap;
