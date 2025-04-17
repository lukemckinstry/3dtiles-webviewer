import CesiumMap from './CesiumMap'
import Sidebar from './Sidebar'
import Header from './Header';
import React, { useState } from 'react';

function Outer() {
  const [cesiumViewer, setCesiumViewer] = useState();
  
  return (
    <>
      <Sidebar viewer={cesiumViewer} />
      <Header />
      <CesiumMap viewer={cesiumViewer} setCesiumViewer={setCesiumViewer} />
    </>
  )
}

export default Outer;
