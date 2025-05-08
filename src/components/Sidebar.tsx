import { Matrix4, Model, Math as CesiumMath, HeadingPitchRange, Cesium3DTileset, Matrix3 } from 'cesium';
import React from 'react';
import { Tooltip, Tree, Button, Label, TextBox, Text } from '@itwin/itwinui-react/bricks';
import { parseTileset, LevelOfDetail } from '../tilesetParser';
import { SvgStatusSuccess } from '@itwin/itwinui-icons-color-react';

let Sidebar = (cesiumViewer) => {
  const [data, setData] = React.useState<LevelOfDetail[]>([]);
  // Format for selectedLodIndices is [lod index, tile index]
  // If tile index is -1, it means no tile was selected, just entire LOD
  // If LOD index is also -1, it means no LOD selected, and entire tileset is loaded normally
  const [selectedLodIndices, setSelectedLodIndices] = React.useState<number[] | undefined>();
  const [tilesetUrl, setTilesetUrl] = React.useState<string | undefined>();
  const [tilesetTransform, setTilesetTransform] = React.useState<Matrix4 | undefined>();
  const [entireTilesetLoaded, setEntireTilesetLoaded] = React.useState(false);

  /**
   * Zoom in on a model. camera.lookAt might restrict camera panning
   */
  function zoomToModel(model, viewer) {
    const camera = viewer.camera;

    const controller = viewer.scene.screenSpaceCameraController;
    const r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
    controller.minimumZoomDistance = r * 0.5;

    const center = model.boundingSphere.center;
    const heading = CesiumMath.toRadians(230.0);
    const pitch = CesiumMath.toRadians(-20.0);
    camera.lookAt(center, new HeadingPitchRange(heading, pitch, r * 7.0));
  }

  /**
   * Reset the previously selected LOD and tile to an unselected state, based on the index in selectedLodIndices
   */
  function resetSelection() {
    const newData = [...data];
    if (selectedLodIndices && selectedLodIndices[0] !== -1) {
      const lodIndex = selectedLodIndices[0];
      newData[lodIndex].selected = false;
      const tileIndex = selectedLodIndices[1];
      if (tileIndex !== -1) {
        newData[lodIndex].tiles[tileIndex].selected = false;
      }
    }
  }

  /**
   * Called when the 'Load entire tileset' button is clicked
   */
  async function handleLoadEntireTileset() {
    if (tilesetUrl) {
      await loadEntireTileset(tilesetUrl);
    } else {
      console.log('No tileset URL provided');
    }
  }

  /**
   * Load the entire tileset from the URL. The tileset is loaded in the standard way through a Cesium3DTileset object,
   * not as glTF models like the LODs and individual tiles.
   * This function also sets the transform matrix in the tilesetTransform state variable, which is later applied to
   * individual glTF models when they are loaded.
   */
  async function loadEntireTileset(url: string) {
    console.log('Loading entire tileset');

    if (selectedLodIndices && selectedLodIndices[0] === -1) {
      console.log('Entire tileset already loaded');
      return;
    }

    try {
      const { viewer } = cesiumViewer;
      const tileset = await Cesium3DTileset.fromUrl(url);
      viewer.scene.primitives.add(tileset);
      viewer.zoomTo(tileset);

      const rotationMatrix = Matrix3.fromRotationZ(CesiumMath.toRadians(-90));
      const rotationMatrix4x4 = Matrix4.fromRotationTranslation(rotationMatrix);
      const transform = Matrix4.multiply(tileset.root.transform, rotationMatrix4x4, new Matrix4());
      setTilesetTransform(transform);

      resetSelection();

      setSelectedLodIndices([-1, -1]);
      setEntireTilesetLoaded(true);
    } catch (error) {
      console.error(`Error creating tileset: ${error}`);
    }
  }

  return (
    <div className='sidebar'>
      <div style={{ height: '140px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '12px' }}>
          <Label>Tileset URL</Label>
          <TextBox.Root>
            <TextBox.Input id={'tilesetUrlInput'} />
          </TextBox.Root>
          <Button
            onClick={async (e) => {
              console.log('Load tileset button clicked');
              const url = (document.getElementById('tilesetUrlInput') as HTMLInputElement).value;
              if (!url) {
                console.log('No url provided');
                return;
              }
              console.log('Loading from url', url);

              let absoluteUrl: string;
              if (url.indexOf('://') > 0 || url.indexOf('//') === 0) {
                absoluteUrl = url;
              } else {
                absoluteUrl = new URL(url, window.location.href).href;
              }

              // No need to reload tileset if URL is the same
              if (absoluteUrl === tilesetUrl) {
                console.log('Url is the same, not reloading tileset');
                return;
              }
              setTilesetUrl(absoluteUrl);

              let tilesetData: LevelOfDetail[] = [];
              if (absoluteUrl) {
                try {
                  tilesetData = await parseTileset(absoluteUrl, [], [], 0);
                  // Load tileset to get transform
                  await loadEntireTileset(absoluteUrl);
                } catch (error) {
                  console.error('Error parsing tileset:', error);
                  return;
                }
                
                setData(tilesetData);
              }
              console.log('Lods:', tilesetData);
            }}
          >
            Load
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '12px' }}>
          <Button onClick={handleLoadEntireTileset} disabled={entireTilesetLoaded}>
            {entireTilesetLoaded ? 'Entire tileset loaded' : 'Load entire tileset'}
          </Button>
          <div className='status-icon' style={entireTilesetLoaded ? {display: 'block'} : { display: 'none' }}>
            <SvgStatusSuccess />
          </div>
        </div>
        <Text variant='body-sm' style={{ padding: '12px' }}>
          Or select a level of detail or tile to view:
        </Text>
      </div>
      <Tree.Root style={{ backgroundColor: 'var(--ids-color-bg-neutral-base)', height: 'calc(100vh - 140px)' }}>
        {data.map((item, index, items) => {
          const handleSelection = async () => {
            console.log('handleSelection', item);
            
            if (!item.expanded) {
              handleExpanded();
            }

            if (!item.selected) {
              resetSelection();
              setSelectedLodIndices([index, -1]);
              setEntireTilesetLoaded(false);

              const newData = [...data];
              newData[index].selected = true;
              setData(newData);
            }

            const { viewer } = cesiumViewer;
            // Clear previous models
            viewer.scene.primitives.removeAll();

            let model;
            for (const tile of item.tiles) {
              try {
                model = viewer.scene.primitives.add(
                  await Model.fromGltfAsync({
                    url: tile.uri,
                    modelMatrix: tilesetTransform,
                  }),
                );
              } catch (error) {
                console.log('error', error);
              }
            }

            model.readyEvent.addEventListener(() => {
              zoomToModel(model, viewer);
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

                  if (!child.selected || (item.selected && child.selected)) {
                    resetSelection();
                    setSelectedLodIndices([index, childIndex]);
                    setEntireTilesetLoaded(false);

                    const newData = [...data];
                    newData[index].tiles[childIndex].selected = true;
                    setData(newData);
                  }

                  const { viewer } = cesiumViewer;
                  // Clear previous models
                  viewer.scene.primitives.removeAll();

                  try {
                    const model = viewer.scene.primitives.add(
                      await Model.fromGltfAsync({
                        url: child.uri,
                        modelMatrix: tilesetTransform,
                      }),
                    );
                    model.readyEvent.addEventListener(() => {
                      zoomToModel(model, viewer);
                    })
                  } catch (error) {
                    console.log('error', error)
                  }
                };

                const tooltipContent = `Filename: ${child.uri}\nGeometric error: ${child.geometricError}`;

                return <Tooltip content={tooltipContent} style={{ wordBreak: 'break-word', maxWidth: '500px', whiteSpace: 'pre-wrap' }} key={child.uri}>
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