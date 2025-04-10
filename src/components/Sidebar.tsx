import { Matrix4, Model, Math as CesiumMath, HeadingPitchRange } from "cesium";
import React, { useMemo } from 'react';
import { Tree } from '@itwin/itwinui-react/bricks';

import { parseTileset, LevelOfDetail } from '../tilesetParser';

const tilesetPath = './cesiumStatic/data/SanFran_Street_level_Ferry_building/tileset.json';
const tilesetData: LevelOfDetail[] = await parseTileset(tilesetPath, []);

for (let i = 0; i < tilesetData.length; i++) {
  if (!tilesetData[i]) {
    tilesetData[i] = { tiles: [], expanded: false, selected: false, level: i };
  }
}

let Sidebar = (cesiumViewer) => {
  const [data, setData] = React.useState(tilesetData);

  return (
    <div className='sidebar'>
    <Tree.Root>
      {data.map((item, index, items) => {
        const handleSelection = async () => {
          console.log("tiles ", item.tiles)
          const gltfPos = [0.8443837640659682, -0.5357387973460459, 0.0, 0.0, 0.32832660036003297, 0.5174791372742712, 0.7902005985709575, 0.0, -0.42334111834053034, -0.667232555788526, 0.6128482797708588, 0.0, -2703514.1639288412, -4261038.79165873, 3887533.1514879903, 1.0];
          let transformToRoot = Matrix4.unpack(gltfPos);
          const prefix = "./cesiumStatic/data/SanFran_Street_level_Ferry_building/";
          const tNames = item.tiles.map(x => x.uri)
          const {viewer} = cesiumViewer;
          console.log("viewer ", viewer)
          let model;
          for (const tU of tNames) {
            const modelURL = prefix.concat(tU)
            try {
              model = viewer.scene.primitives.add(
                await Model.fromGltfAsync({
                  url: modelURL,
                  modelMatrix: transformToRoot,
                }),
              );
            } catch (error) {
              console.log("error ", error)
            }
          }
          model.readyEvent.addEventListener(() => {
            console.log("model ", model  );
            const camera = viewer.camera;

            // Zoom to model
            const controller = viewer.scene.screenSpaceCameraController;
            const r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
            controller.minimumZoomDistance = r * 0.5;

            const center = model.boundingSphere.center;
            const heading = CesiumMath.toRadians(230.0);
            const pitch = CesiumMath.toRadians(-20.0);
            camera.lookAt(center, new HeadingPitchRange(heading, pitch, r * 7.0));
          })
        };
        
        const handleExpanded = () => {
          console.log('handleExpanded');
          const oldExpanded = data[index].expanded;
          if (oldExpanded === undefined) return;
          const newData = [...data];
          newData[index].expanded = !oldExpanded;
          setData(newData);
        }

        return (
          <React.Fragment key={item.level}>
            <Tree.Item
              key={item.level}
              aria-level={1}
              aria-posinset={index + 1}
              aria-setsize={items.length}
              label={item.level}
              selected={item.selected}
              expanded={item.expanded}
              onSelectedChange={handleSelection}
              onExpandedChange={handleExpanded}
            />
            {item.tiles.map((child, childIndex, children) => {
              if (!item.expanded) return null;

              const handleSelection = async () => {
                console.log('handleSelection', child.uri );
                const gltfPos = [0.8443837640659682, -0.5357387973460459, 0.0, 0.0, 0.32832660036003297, 0.5174791372742712, 0.7902005985709575, 0.0, -0.42334111834053034, -0.667232555788526, 0.6128482797708588, 0.0, -2703514.1639288412, -4261038.79165873, 3887533.1514879903, 1.0];
                let transformToRoot = Matrix4.unpack(gltfPos);
                const prefix = "./cesiumStatic/data/SanFran_Street_level_Ferry_building/";
                const modelURL = prefix.concat(child.uri)
                const {viewer} = cesiumViewer;
                console.log("viewer ", viewer)
                try {
                  const model = viewer.scene.primitives.add(
                    await Model.fromGltfAsync({
                      url: modelURL,
                      modelMatrix: transformToRoot,
                    }),
                  );
                  model.readyEvent.addEventListener(() => {
                    console.log("model ", model  );
                    const camera = viewer.camera;

                    // Zoom to model
                    const controller = viewer.scene.screenSpaceCameraController;
                    const r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
                    controller.minimumZoomDistance = r * 0.5;

                    const center = model.boundingSphere.center;
                    const heading = CesiumMath.toRadians(230.0);
                    const pitch = CesiumMath.toRadians(-20.0);
                    camera.lookAt(center, new HeadingPitchRange(heading, pitch, r * 7.0));
                  })
                } catch (error) {
                  console.log("error ", error)
                }
              };

              return <Tree.Item
                key={child.uri}
                aria-level={2}
                aria-posinset={childIndex + 1}
                aria-setsize={children.length}
                label={child.uri}
                selected={child.selected}
                onSelectedChange={handleSelection}
              />
            })}
          </React.Fragment>
        );
      })}
    </Tree.Root>
    </div>
  )
}

export default Sidebar;