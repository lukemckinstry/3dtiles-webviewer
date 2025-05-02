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

export async function parseTileset(tilesetPath: string, lods: LevelOfDetail[], buckets: number[], depth: number): Promise<LevelOfDetail[]> {
  const response = await fetch(tilesetPath);
  const tilesetJson = await response.json();

  let absoluteUrl: URL;
  if (tilesetPath.indexOf('://') > 0 || tilesetPath.indexOf('//') === 0) {
    absoluteUrl = new URL(tilesetPath);
  } else {
    absoluteUrl = new URL(tilesetPath, window.location.href);
  }
  // Remove tileset.json from the URL to get the base path
  // TODO preserve query string, e.g. for SAS URLs from the mesh export API
  const basePath = absoluteUrl.href.split('/').slice(0, -1).join('/') + '/';

  return (await parseNode(tilesetJson.root, basePath, lods, buckets, depth));
}

async function parseNode(node: any, basePath: string, lods: LevelOfDetail[], buckets: number[], depth: number): Promise<LevelOfDetail[]> {
  let newDepth = depth;

  if (node.content) {
    newDepth = depth + 1;
    const tilePath = (new URL(node.content.uri, basePath)).href;

    if (node.content.uri.endsWith('.json')) {
      // If node is another tileset.json, parse it
      await parseTileset(tilePath, lods, buckets, newDepth);
    } else {
      // Otherwise, add the tile to the lods array for the UI tree
      const tile = {
        displayName: node.content.uri,
        uri: tilePath,
        selected: false,
        geometricError: node.geometricError,
      }

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
      await parseNode(child, basePath, lods, buckets, newDepth);
    }
  }

  // Remove empty lods
  return lods.filter((lod) => lod.tiles.length > 0);
}
