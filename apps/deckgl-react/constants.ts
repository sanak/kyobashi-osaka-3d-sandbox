export type MapStyles = {[key: string]: string};
export const MAP_STYLES: MapStyles = {
  'Carto Light': 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
  'Carto Dark': 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
};

export const INITIAL_MAP_STYLE: string = MAP_STYLES['Carto Dark'];
