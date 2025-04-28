export interface LevelOfDetail {
  level: number,
  expanded: boolean,
  selected: boolean,
  tiles: Tile[]
}

export interface Tile {
  displayName: string,
  uri: string,
  selected: boolean,
  geometricError?: number,
}

export async function parseTileset(path: string, lods: LevelOfDetail[], buckets: number[], depth: number): Promise<LevelOfDetail[]> {
  const tilesetJson = await fetch(path).then((response) => response.json());

  return (await parseNode(tilesetJson.root, path, lods, buckets, depth));
}

async function parseNode(node: any, path: string, lods: LevelOfDetail[], buckets: number[], depth: number): Promise<LevelOfDetail[]> {
  let newDepth = depth;
  if (node.content) {
    newDepth = depth + 1;

    // Create buckets (lods) based on first node with content
    // if (buckets.length === 0) {
    //   const step = node.geometricError / 4;
    //   for (let i = 1; i < 4; i++) {
    //     buckets.push(node.geometricError - step * i);
    //   }
    //   // console.log("buckets", buckets);
    // }

    // console.log(node.content.uri, "test depth:", depth);

    if (node.content.uri.endsWith('.json')) {
      // If node is another tileset.json, parse it
      const url = new URL(path, window.location.href);
      const prefix = url.pathname.split('/').slice(0, -1).join('/');
      const newPath = `${prefix}/${node.content.uri}`;
      await parseTileset(newPath, lods, buckets, newDepth);
    } else {
      // Otherwise, add the tile to the lods array for the UI tree
      
      const url = new URL(path, window.location.href);
      const prefix = url.pathname.split('/').slice(0, -1).join('/');
      const newPath = `${prefix}/${node.content.uri}`;

      const tile = {
        displayName: node.content.uri,
        uri: newPath,
        selected: false,
        geometricError: node.geometricError,
      }
      let index;

      // Determine level based on buckets, which are based on geometric error
      // if (node.geometricError > buckets[0]) {
      //   index = 0;
      // } else if (node.geometricError > buckets[1]) {
      //   index = 1;
      // } else if (node.geometricError > buckets[2]) {
      //   index = 2;
      // } else {
      //   index = 3;
      // }

      // // Add to actual LODs for UI
      // if (lods[index]) {
      //   lods[index].tiles.push(tile);
      // } else {
      //   lods[index] = {
      //     level: index,
      //     expanded: false,
      //     selected: false,
      //     tiles: [tile],
      //   };
      // }

      // Old "level" based method
      // const level = parseInt(node.content.uri.split('/')[0]);

      // Test - use recursive depth as level
      const level = newDepth;

      if (lods[level]) {
        lods[level].tiles.push(tile);
      } else {
        lods[level] = {
          level: level,
          expanded: false,
          selected: false,
          tiles: [ tile ],
        };
      }
    }
  }

  if (node.children) {
    for (const child of node.children) {
      await parseNode(child, path, lods, buckets, newDepth);
    }
  }

  // return lods;

  // return lods.filter((lod) => lod.tiles.length > 0).map((lod, index) => {
  //   return {
  //     level: index,
  //     expanded: lod.expanded,
  //     selected: lod.selected,
  //     tiles: lod.tiles
  //   };
  // });

  // Remove empty lods
  return lods.filter((lod) => lod.tiles.length > 0);
}
