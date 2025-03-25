import CesiumMap from './components/CesiumMap'
import Sidebar from './components/Sidebar'
import Header from './components/Header';
import './App.css'
import "cesium/Build/Cesium/Widgets/widgets.css";

import { ThemeProvider } from '@itwin/itwinui-react';
import '@itwin/itwinui-react/styles.css';

function App() {

  return (
    <>
      <ThemeProvider>
        <Sidebar/>
        <Header/>
        <CesiumMap/>
      </ThemeProvider>
    </>
  )
}

export default App
