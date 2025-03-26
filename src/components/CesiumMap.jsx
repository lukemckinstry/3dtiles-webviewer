import React, { useEffect, useRef } from 'react';
import { Viewer as CesiumViewer, Entity, TerrainProvider } from "cesium";

const CESIUM_CONTAINER_ID = "cesiumContainer";

const CesiumMap = ({ cesiumViewer, setCesiumViewer }) => {
  const viewerContainer = useRef(null);
  //const [cesiumViewer, setCesiumViewer] = useState();

  useEffect(() => {

    const initializeGlobe = () => {
      const viewer = new CesiumViewer(CESIUM_CONTAINER_ID);
      setCesiumViewer(viewer) 
    }
    if (!cesiumViewer ) {
      initializeGlobe()
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
