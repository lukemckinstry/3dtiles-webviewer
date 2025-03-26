import CesiumMap from './components/CesiumMap'
import Sidebar from './components/Sidebar'
import Header from './components/Header';
import './App.css'
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Root } from '@itwin/itwinui-react/bricks';

function App() {

  return (
    <>
      <Root colorScheme='dark' density='medium'>
        <Sidebar/>
        <Header/>
        <CesiumMap/>
      </Root>
    </>
  )
}

export default App
