import React, { useMemo } from 'react';
import { Tree } from '@itwin/itwinui-react/bricks';
import { parseTileset, LevelOfDetail } from '../tilesetParser';

const tilesetPath = './cesiumStatic/data/SanFran_Street_level_Ferry_building/tileset.json';
const tilesetData = await parseTileset(tilesetPath, []);
for (let i = 0; i < tilesetData.length; i++) {
  if (!tilesetData[i]) {
    tilesetData[i] = { tiles: [], expanded: false, selected: false, level: i };
  }
}
// console.log(tilesetData);

let Sidebar = () => {
  const [data, setData] = React.useState(tilesetData);

  return (
    <div className='sidebar'>
    <Tree.Root>
      {data.map((item, index, items) => {
        const handleSelection = () => {
          item
          console.log('handleSelection');
        }
        
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

              const handleSelection = () => {
                console.log('handleSelection');
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