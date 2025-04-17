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

  return (await parseNode(tilesetJson.root, path, lods));
}

async function parseNode(node: any, path: string, lods: LevelOfDetail[]): Promise<LevelOfDetail[]> {
  if (node.content) {
    if (node.content.uri.endsWith('.json')) {
      // If node is another tileset.json, parse it
      const url = new URL(path, window.location.href);
      const prefix = url.pathname.split('/').slice(0, -1).join('/');
      const newPath = `${prefix}/${node.content.uri}`;
      await parseTileset(newPath, lods);
    } else {
      // Otherwise, add the tile to the lods array for the UI tree
      const level = node.content.uri.split('/')[0];

      if (lods[level]) {
        lods[level].tiles.push({
          uri: node.content.uri,
          selected: false,
        });
      } else {
        lods[level] = {
          level: parseInt(level),
          expanded: false,
          selected: false,
          tiles: [
            {
              uri: node.content.uri,
              selected: false,
            },
          ],
        };
      }

    }
  }

  if (node.children) {
    for (const child of node.children) {
      await parseNode(child, path, lods);
    }
  }

  return lods;
}
