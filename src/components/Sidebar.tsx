import { Matrix4, Model, Math as CesiumMath, HeadingPitchRange, Cesium3DTileset, Cesium3DTile, TileAvailability } from 'cesium';
import React, { useEffect, useMemo } from 'react';
import { Tree } from '@itwin/itwinui-react/bricks';
import { parseTileset, LevelOfDetail } from '../tilesetParser';

const tilesetPath = './cesiumStatic/data/SanFran_Street_level_Ferry_building/tileset.json';
let tilesetLoaded = false;

// const tilesetData: LevelOfDetail[] = await parseTileset(tilesetPath, []);
// for (let i = 0; i < tilesetData.length; i++) {
//   if (!tilesetData[i]) {
//     tilesetData[i] = { tiles: [], expanded: false, selected: false, level: i };
//   }
// }

let Sidebar = (cesiumViewer) => {
  const [data, setData] = React.useState<LevelOfDetail[]>([]);

  useEffect(() => {
    (async function() {
      const { viewer } = cesiumViewer;
      if (!viewer?.scene) {
        return;
      }
      console.log("viewer", viewer)

      const lods: LevelOfDetail[] = [];

      const tileset = await Cesium3DTileset.fromUrl(tilesetPath);
      tileset.skipLevelOfDetail = false;
      tileset.maximumScreenSpaceError = 0;
      tileset.preloadWhenHidden = true;
      tileset.show = false;
      tileset.maximumCacheOverflowBytes = 536870912 * 10;
      console.log("tileset", tileset);

      viewer.scene.primitives.add(tileset);
      viewer.zoomTo(tileset);

      function trackTile(tile: any) {
        const level = parseInt(tile._depth);
        const index = level - 1;
        const uri = tile.content.url.split('/').slice(-2).join('/');
        if (lods[index]) {
          lods[index].tiles.push({
            uri: uri,
            selected: false,
          });
        } else {
          lods[index] = {
            level: level,
            expanded: false,
            selected: false,
            tiles: [
              {
                uri: uri,
                selected: false,
              },
            ],
          };
        }
      }
      tileset.tileLoad.addEventListener(trackTile);

      tileset.allTilesLoaded.addEventListener(() => {
        if (!tilesetLoaded) {
          tileset.tileLoad.removeEventListener(trackTile);
          console.log("all tiles loaded", lods);
          setData(lods);
          tilesetLoaded = true;
        }

        // Weird issue where the tiles recorded with trackTile are not the same as
        // the tiles parsed in tilesetData - trackTile is missing some

        // console.log("comparing with parsed data...");
        // for (let i = 1; i < lods.length; i++) {
        //   if (lods[i + 2] && lods[i + 2].tiles.length !== tilesetData[i].tiles.length) {
        //     console.log("parsed tileset data and event tileset data do not match at level", i);

        //     if (i < 4) {
        //       for (let j = 0; j < tilesetData[i].tiles.length; j++) {
        //         const tile = tilesetData[i].tiles[j];
        //         const found = lods[i + 2].tiles.find((t) => {
        //           const tileUri = t.uri.split('/').slice(-2).join('/');
        //           return tileUri === tile.uri;
        //         });
        //         if (!found) {
        //           console.log("missing tile", tile.uri, "at level", i);
        //         }
        //       }
        //     }
        //   }
        // }
      });
    })()
  }, [cesiumViewer]);

  return (
    <div className='sidebar'>
    <Tree.Root>
      {data.map((item, index, items) => {
        const handleSelection = async () => {
          console.log("tiles", item.tiles);

          const gltfPos = [0.8443837640659682, -0.5357387973460459, 0.0, 0.0, 0.32832660036003297, 0.5174791372742712, 0.7902005985709575, 0.0, -0.42334111834053034, -0.667232555788526, 0.6128482797708588, 0.0, -2703514.1639288412, -4261038.79165873, 3887533.1514879903, 1.0];
          let transformToRoot = Matrix4.unpack(gltfPos);
          const prefix = "./cesiumStatic/data/SanFran_Street_level_Ferry_building/";
          const tNames = item.tiles.map(x => x.uri);
          const { viewer } = cesiumViewer;
          // Clear previous models
          viewer.scene.primitives.removeAll();

          let model;
          for (const tU of tNames) {
            const modelURL = prefix.concat(tU);
            try {
              model = viewer.scene.primitives.add(
                await Model.fromGltfAsync({
                  url: modelURL,
                  modelMatrix: transformToRoot,
                }),
              );
            } catch (error) {
              console.log("error ", error);
            }
          }

          model.readyEvent.addEventListener(() => {
            console.log("model", model);
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
                // onSelectedChange={handleSelection}
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