import Outer from './components/outer';
import './App.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { Root } from '@itwin/itwinui-react/bricks';

function App() {
  return (
    <>
      <Root colorScheme='dark' density='medium'>
        <Outer/>
      </Root>
    </>
  );
}

export default App;
