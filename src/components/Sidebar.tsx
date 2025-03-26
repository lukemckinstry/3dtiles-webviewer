import React, { useMemo } from 'react';
import { Tree } from '@itwin/itwinui-react/bricks';
import { parseTileset, LevelOfDetail } from '../tilesetParser';

const tilesetPath = './cesiumStatic/data/SanFran_Street_level_Ferry_building/tileset.json';
const tilesetData = await parseTileset(tilesetPath, []);
// console.log(tilesetData);

const testData = [
  {
    id: 'Node-0',
    label: 'Node 0',
    selected: false,
    expanded: true,
  },
  {
    id: 'Node-1',
    label: 'Node 1',
    selected: false,
    expanded: true,
    subItems: [{ id: 'Subnode-1', label: 'Subnode 1', selected: false }],
  },
  {
    id: 'Node-2',
    label: 'Node 2',
    selected: false,
    expanded: true,
    subItems: [{ id: 'Subnode-2', label: 'Subnode 2', selected: false }],
  },
];

let Sidebar = () => {
  const [data, setData] = React.useState(tilesetData);

  return (
    <div className='sidebar'>
    <Tree.Root>
      {data.map((item, index, items) => {
        const handleSelection = () => {
          console.log('handleSelection');
        }
        
        const handleExpanded = () => {
          console.log('handleExpanded');
          // const oldExpanded = data[index].expanded;
          // if (oldExpanded === undefined) return;
          // const newData = [...data];
          // newData[index].expanded = !oldExpanded;
          // setData(newData);
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