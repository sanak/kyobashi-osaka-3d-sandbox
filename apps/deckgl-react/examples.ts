import {fetchFile} from '@loaders.gl/core';

export type Example = {
  name: string;
  path?: string;
  tileset?: string;
  files?: string[];
  tilesetUrl?: string;
  maximumScreenSpaceError?: number;
};

export type Category = {
  name: string;
  path: string;
  examples: Record<string, Example>;
};

export type Index = Record<string, Category>;

const DATA_URI = import.meta.env.VITE_DATA_URL;
const EXAMPLE_INDEX_URL = `${DATA_URI}/index.json`;

export const INITIAL_EXAMPLE_CATEGORY: string = 'PointCloud';
export const INITIAL_EXAMPLE_NAME: string = '京橋駅連絡通路';

export async function loadExampleIndex(): Promise<Index> {
  // Load the index file that lists example tilesets (from the loaders.gl github repo)
  const response = await fetchFile(EXAMPLE_INDEX_URL);
  const testExamples: Index = await response.json();

  resolveUrls(testExamples);

  return {
    ...testExamples
  };
}

function resolveUrls(exampleIndex: Index) {
  for (const category of Object.values(exampleIndex)) {
    for (const example of Object.values(category.examples)) {
      example.tilesetUrl = `${DATA_URI}/${example.path}/${example.tileset}`;
    }
  }
}
