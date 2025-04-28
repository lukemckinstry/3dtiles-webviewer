import { Matrix4, Model, Math as CesiumMath, HeadingPitchRange, ITwinPlatform, Cesium3DTileset, ITwinData, Matrix3, Cesium3DTile, TileAvailability, Transforms } from 'cesium';
import React, { useEffect, useMemo } from 'react';
import { Tooltip, Tree } from '@itwin/itwinui-react/bricks';
import { parseTileset, LevelOfDetail } from '../tilesetParser';

const tilesetPath = 'cesiumStatic/data/SanFran_Street_level_Ferry_building/tileset.json';
// const tilesetPath = './cesiumStatic/data/Metrostation.bim-tiles/tileset.json';
// const tilesetPath = './cesiumStatic/data/Stadium-28334163.bim-tiles/tileset.json';

// const tilesetPath = './cesiumStatic/data/04_Plant_Geo.bim-tiles/tileset.json';
// const tilesetPath = './cesiumStatic/data/ClubHouse.bim-tiles/tileset.json';

let tilesetLoaded = false;
let globalTransform;

const tilesetData: LevelOfDetail[] = await parseTileset(tilesetPath, [], [], 0);
console.log("lods:", tilesetData);

let Sidebar = (cesiumViewer) => {
  const [data, setData] = React.useState<LevelOfDetail[]>(tilesetData);

  useEffect(() => {
    (async function() {
      const { viewer } = cesiumViewer;
      if (!viewer?.scene) {
        return;
      }

      const lods: LevelOfDetail[] = [];
      const tileset = await Cesium3DTileset.fromUrl(tilesetPath);

      // ITwinPlatform.apiEndpoint = "https://qa-ims.bentley.com/";
      // ITwinPlatform.defaultAccessToken = "";
      // const tileset = await ITwinData.createTilesetFromIModelId(
      //   "",
      // );

      if (!tileset) {
        return;
      }

      // tileset.skipLevelOfDetail = false;
      // tileset.maximumScreenSpaceError = 0;
      // tileset.preloadWhenHidden = true;
      // tileset.show = false;
      // tileset.maximumCacheOverflowBytes = 536870912 * 10;

      // Combine the transforms
      const rotationMatrix = Matrix3.fromRotationZ(CesiumMath.toRadians(-90));
      const rotationMatrix4x4 = Matrix4.fromRotationTranslation(rotationMatrix);
      globalTransform = Matrix4.multiply(tileset.root.transform, rotationMatrix4x4, new Matrix4());

      // viewer.scene.primitives.add(tileset);
      // viewer.zoomTo(tileset);

      function trackTile(tile: any) {
        const level = parseInt(tile._depth);
        const index = level - 1;
        // Get just tile name, without full URL and query string
        const displayName = tile.content.url.split('/').pop().split('?')[0];
        const tileData = {
          displayName: displayName,
          uri: tile.content.url,
          selected: false,
          geometricError: tile.geometricError,
        };

        if (lods[index]) {
          lods[index].tiles.push(tileData);
        } else {
          lods[index] = {
            level: level,
            expanded: false,
            selected: false,
            tiles: [ tileData ],
          };
        }
      }
      // tileset.tileLoad.addEventListener(trackTile);

      // tileset.allTilesLoaded.addEventListener(() => {
      //   if (!tilesetLoaded) {
      //     tileset.tileLoad.removeEventListener(trackTile);
      //     console.log("all tiles loaded. lods from event listening:", lods);
      //     // setData(lods);
      //     tilesetLoaded = true;
      //   }

      // //   // Weird issue where the tiles recorded with trackTile are not the same as
      // //   // the tiles parsed in tilesetData - trackTile is missing some

      // //   // console.log("comparing with parsed data...");
      // //   // for (let i = 1; i < lods.length; i++) {
      // //   //   if (lods[i + 2] && lods[i + 2].tiles.length !== tilesetData[i].tiles.length) {
      // //   //     console.log("parsed tileset data and event tileset data do not match at level", i);

      // //   //     if (i < 4) {
      // //   //       for (let j = 0; j < tilesetData[i].tiles.length; j++) {
      // //   //         const tile = tilesetData[i].tiles[j];
      // //   //         const found = lods[i + 2].tiles.find((t) => {
      // //   //           const tileUri = t.uri.split('/').slice(-2).join('/');
      // //   //           return tileUri === tile.uri;
      // //   //         });
      // //   //         if (!found) {
      // //   //           console.log("missing tile", tile.uri, "at level", i);
      // //   //         }
      // //   //       }
      // //   //     }
      // //   //   }
      // //   // }

      // });
    })()
  }, [cesiumViewer]);

  return (
    <div className='sidebar'>
    <Tree.Root className='lod-tree' style={{ backgroundColor: 'var(--ids-color-bg-neutral-base)' }}>
      {data.map((item, index, items) => {
        const handleSelection = async () => {
          console.log("handleSelection", item);

          // const oldSelected = data[index].selected;
          // const newData = [...data];
          // newData[index].selected = !oldSelected;
          // setData(newData);
          
          handleExpanded();
          const { viewer } = cesiumViewer;
          // Clear previous models
          viewer.scene.primitives.removeAll();

          let model;
          for (const tile of item.tiles) {
            try {
              model = viewer.scene.primitives.add(
                await Model.fromGltfAsync({
                  url: tile.uri,
                  modelMatrix: globalTransform,
                }),
              );
            } catch (error) {
              console.log("error", error);
            }
          }

          model.readyEvent.addEventListener(() => {
            const camera = viewer.camera;

            // Zoom to model
            const controller = viewer.scene.screenSpaceCameraController;
            const r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
            controller.minimumZoomDistance = r * 0.5;

            const center = model.boundingSphere.center;
            const heading = CesiumMath.toRadians(230.0);
            const pitch = CesiumMath.toRadians(-20.0);
            camera.lookAt(center, new HeadingPitchRange(heading, pitch, r * 7.0));

            // viewer.zoomTo(model);
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
              // Should this label be the tree depth (level) or the index?
              // Index is geneerally same as depth, after empty levels are removed
              label={index}
              selected={item.selected}
              expanded={item.expanded}
              onSelectedChange={handleSelection}
              onExpandedChange={handleExpanded}
            />
            {item.tiles.map((child, childIndex, children) => {
              if (!item.expanded) return null;

              const handleSelection = async () => {
                console.log('handleSelection', child);

                // const oldSelected = data[index].selected;
                // const newData = [...data];
                // newData[index].selected = !oldSelected;
                // setData(newData);

                const { viewer } = cesiumViewer;
                // Clear previous models
                viewer.scene.primitives.removeAll();

                try {
                  const model = viewer.scene.primitives.add(
                    await Model.fromGltfAsync({
                      url: child.uri,
                      modelMatrix: globalTransform,
                    }),
                  );
                  model.readyEvent.addEventListener(() => {
                    const camera = viewer.camera;

                    // Zoom to model
                    const controller = viewer.scene.screenSpaceCameraController;
                    const r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
                    controller.minimumZoomDistance = r * 0.5;

                    const center = model.boundingSphere.center;
                    const heading = CesiumMath.toRadians(230.0);
                    const pitch = CesiumMath.toRadians(-20.0);
                    camera.lookAt(center, new HeadingPitchRange(heading, pitch, r * 7.0));

                    // viewer.zoomTo(model);
                  })
                } catch (error) {
                  console.log("error", error)
                }
              };

              const tooltipContent = `Filename: ${child.uri}\nGeometric error: ${child.geometricError}`;

              return <Tooltip content={tooltipContent} style={{ wordBreak: "break-word", maxWidth: "500px", whiteSpace: "pre-wrap" }} key={child.uri}>
                  <Tree.Item
                    key={child.uri}
                    aria-level={2}
                    aria-posinset={childIndex + 1}
                    aria-setsize={children.length}
                    label={child.displayName}
                    selected={child.selected}
                    onSelectedChange={handleSelection}
                  />
                </Tooltip>
            })}
          </React.Fragment>
        );
      })}
    </Tree.Root>
    </div>
  )
}

export default Sidebar;