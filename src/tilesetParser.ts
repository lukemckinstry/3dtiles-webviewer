export interface LevelOfDetail {
  level: number,
  expanded: boolean,
  selected: boolean,
  tiles: {
    uri: string,
    selected: boolean
  }[]
}

export async function parseTileset(path: string, lods: LevelOfDetail[]): Promise<LevelOfDetail[]> {
  const tilesetJson = await fetch(path).then((response) => response.json());

  for (const child of tilesetJson.root.children) {
    if (child.content.uri.endsWith('.json')) {
      // Read that tileset
      const path = `cesiumStatic/SanFran_Street_level_Ferry_building/${child.content.uri}`;
      lods = await parseTileset(path, lods);
    } else {
      if (child.children && child.children.length > 0) {
        lods = await parseNode(child, lods);
      }
    }
  }

  // console.log(lods);
  return lods;
}

async function parseNode(node: any, lods: LevelOfDetail[]): Promise<LevelOfDetail[]> {
  for (const child of node.children) {
    if (child.content.uri.endsWith('.json')) {
      // Read that tileset
      const path = `cesiumStatic/data/SanFran_Street_level_Ferry_building/${child.content.uri}`;
      lods = await parseTileset(path, lods);
    }

    const uri = child.content.uri;
    const index = Number(uri.split('/')[0]);

    if (!lods[index]) {
      lods[index] = { tiles: [], expanded: true, selected: false, level: index };
    }
    lods[index].tiles.push({ uri, selected: false});

    if (child.children && child.children.length > 0) {
      parseNode(child, lods);
    }
  }
  return lods;
}
