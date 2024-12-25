import {fetchFile} from '@loaders.gl/core';

const DATA_URI = import.meta.env.VITE_DATA_URL;
const EXAMPLE_INDEX_URL = `${DATA_URI}/index.json`;

export const INITIAL_EXAMPLE_CATEGORY = 'PointCloud';
export const INITIAL_EXAMPLE_NAME = '京橋駅連絡通路';

export async function loadExampleIndex() {
  // Load the index file that lists example tilesets (from the loaders.gl github repo)
  const response = await fetchFile(EXAMPLE_INDEX_URL);
  const testExamples = await response.json();

  resolveUrls(testExamples);

  return {
    ...testExamples
  };
}

function resolveUrls(exampleIndex) {
  for (const category of Object.values(exampleIndex)) {
    for (const example of Object.values(category.examples)) {
      example.tilesetUrl = `${DATA_URI}/${example.path}/${example.tileset}`;
    }
  }
}
