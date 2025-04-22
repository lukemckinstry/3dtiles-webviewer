import CesiumMap from './CesiumMap';
import Sidebar from './Sidebar';
import React, { useState } from 'react';

function Outer() {
  const [cesiumViewer, setCesiumViewer] = useState();
  
  return (
    <>
      <Sidebar viewer={cesiumViewer} />
      <CesiumMap viewer={cesiumViewer} setCesiumViewer={setCesiumViewer} />
    </>
  )
}

export default Outer;
