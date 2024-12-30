// loaders.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {Map} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import styled from 'styled-components';

// import {luma} from '@luma.gl/core';
import DeckGL from '@deck.gl/react';
import {MapController, FlyToInterpolator} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {StatsWidget} from '@probe.gl/stats-widget';

// To manage dependencies and bundle size, the app must decide which supporting loaders to bring in
import {Tiles3DLoader} from '@loaders.gl/3d-tiles';

import type {MapViewState, ViewStateChangeParameters} from '@deck.gl/core';
import type {Tileset3D} from '@loaders.gl/tiles';

import ControlPanel from './components/control-panel';
import {
  loadExampleIndex,
  INITIAL_EXAMPLE_CATEGORY,
  INITIAL_EXAMPLE_NAME,
  PLATEAU_BUILDING_GEOJSON
} from './examples';
import type {Example, Index} from './examples';
import {INITIAL_MAP_STYLE} from './constants';
import {Stats} from '@probe.gl/stats';
import {GeoJsonLayer} from '@deck.gl/layers';
import {Feature} from 'geojson';

const TRANSITION_DURAITON = 2000;
const EXAMPLES_VIEWSTATE = {
  latitude: 34.697368,
  longitude: 135.533355
};

const INITIAL_VIEW_STATE: MapViewState = {
  ...EXAMPLES_VIEWSTATE,
  pitch: 45,
  maxPitch: 85,
  bearing: 0,
  minZoom: 2,
  maxZoom: 30,
  zoom: 15
};

const StatsWidgetContainer = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  max-width: 270px;
  color: #fff;
  display: flex;
  flex-direction: column;

  > div {
    position: unset !important;
    z-index: 1 !important;
  }

  @media (max-width: 610px) {
    display: none;
  }
`;

const App = () => {
  // CURRENT VIEW POINT / CAMERA POSITION
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  // current tileset
  const [tileset, setTileset] = useState<Tileset3D | null>(null);
  // MAP STATE
  const [selectedMapStyle, setSelectedMapStyle] = useState<string>(INITIAL_MAP_STYLE);
  // EXAMPLE STATE
  const [examplesByCategory, setExamplesByCategory] = useState<Index | null>(null);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [category, setCategory] = useState<string>(INITIAL_EXAMPLE_CATEGORY);
  const [name, setName] = useState<string>(INITIAL_EXAMPLE_NAME);
  // GeoJSON Visibility
  const [geoJsonVisibility, setGeoJsonVisibility] = useState<boolean>(true);

  const statsWidgetContainerRef = useRef<HTMLDivElement | null>(null);
  // const memWidgetRef = useRef<StatsWidget | null>(null);
  const tilesetStatsWidgetRef = useRef<StatsWidget | null>(null);

  useEffect(() => {
    const container = statsWidgetContainerRef.current;
    /*
    // TODO: wait for luma v9 memory stats support
    memWidgetRef.current = new StatsWidget(luma.stats.get('Memory Usage'), {
      framesPerUpdate: 1,
      formatters: {
        'GPU Memory': 'memory',
        'Buffer Memory': 'memory',
        'Renderbuffer Memory': 'memory',
        'Texture Memory': 'memory'
      },
      container: container ? container : undefined,
    });
    */
    if (container && !tilesetStatsWidgetRef.current) {
      tilesetStatsWidgetRef.current = new StatsWidget(new Stats({id: 'tileset-stats'}), {
        container: container ? container : undefined,
        css: {'line-break': 'anywhere'}
      });
    }

    // load the index file that lists example tilesets
    const _loadExampleIndex = async () => {
      const examplesByCategory: Index = await loadExampleIndex();
      setExamplesByCategory(examplesByCategory);

      // if not, select the default example tileset
      const selectedExample =
        examplesByCategory[INITIAL_EXAMPLE_CATEGORY].examples[INITIAL_EXAMPLE_NAME];
      setSelectedExample(selectedExample);
    };
    _loadExampleIndex();

    // Check if a tileset is specified in the query params
    if (selectTilesetFromQueryParams()) {
      return;
    }
    return () => {
      // memWidgetRef.current?.remove();
      tilesetStatsWidgetRef.current?.remove();
      // memWidgetRef.current = null;
      tilesetStatsWidgetRef.current = null;
    };
  }, []);

  // Check URL query params and select the "custom example" if appropriate
  const selectTilesetFromQueryParams = (): boolean => {
    const parsedUrl = new URL(window.location.href);

    const tilesetUrl = parsedUrl.searchParams.get('tileset');
    if (tilesetUrl) {
      setSelectedExample({
        name: 'URL Tileset',
        tilesetUrl
      });
      setCategory('custom');
      setName('URL Tileset');
      return true;
    }

    return false;
  };

  // Updates stats, called every frame
  const updateStatWidgets = useCallback(() => {
    // memWidgetRef.current?.update();
    tilesetStatsWidgetRef.current?.update();
  }, []);

  // Called by ControlPanel when user selects a new example
  const onSelectExample = useCallback(
    ({example, category, name}: {example: Example; category: string; name: string}) => {
      setSelectedExample(example);
      setCategory(category);
      setName(name);
    },
    []
  );

  // Called by ControlPanel when user selects a new map style
  const onSelectMapStyle = useCallback(({selectedMapStyle}: {selectedMapStyle: string}) => {
    setSelectedMapStyle(selectedMapStyle);
  }, []);

  // Called by ControlPanel when user changes GeoJSON layer visibility
  const onGeoJsonVisibility = useCallback(({geoJsonVisibility}: {geoJsonVisibility: boolean}) => {
    setGeoJsonVisibility(geoJsonVisibility);
  }, []);

  // Recenter view to cover the new tileset, with a fly-to transition
  const centerViewOnTileset = useCallback(
    (tileset: Tileset3D) => {
      const {cartographicCenter, zoom} = tileset;
      if (!cartographicCenter || !zoom) {
        return;
      }
      setViewState({
        ...viewState,

        // Update deck.gl viewState, moving the camera to the new tileset
        longitude: cartographicCenter[0],
        latitude: cartographicCenter[1],
        zoom: zoom + 3, // TODO - remove adjustment when Tileset3D calculates correct zoom
        bearing: INITIAL_VIEW_STATE.bearing,
        pitch: INITIAL_VIEW_STATE.pitch,

        // Tells deck.gl to animate the camera move to the new tileset
        transitionDuration: TRANSITION_DURAITON,
        transitionInterpolator: new FlyToInterpolator()
      });
    },
    [viewState]
  );

  // Called by Tile3DLayer when a new tileset is loaded
  const onTilesetLoad = useCallback(
    (tileset: Tileset3D) => {
      setTileset(tileset);
      tilesetStatsWidgetRef.current?.setStats(tileset.stats);
      centerViewOnTileset(tileset);
    },
    [centerViewOnTileset]
  );

  // Called by Tile3DLayer whenever an individual tile in the current tileset is load or unload
  const onTilesetChange = useCallback(
    (/*tileHeader: Tile3D*/) => {
      updateStatWidgets();
    },
    [updateStatWidgets]
  );

  // Called by DeckGL when user interacts with the map
  const onViewStateChange = useCallback((viewState: MapViewState) => {
    setViewState(viewState);
  }, []);

  const renderControlPanel = () => {
    if (!examplesByCategory) {
      return null;
    }

    return (
      <ControlPanel
        data={examplesByCategory}
        category={category}
        name={name}
        tileset={tileset}
        onMapStyleChange={onSelectMapStyle}
        onExampleChange={onSelectExample}
        selectedMapStyle={selectedMapStyle}
        geojsonVisibility={geoJsonVisibility}
        onGeoJsonVisibilityChange={onGeoJsonVisibility}
      >
        <div style={{textAlign: 'center'}}>
          long/lat: {viewState.longitude.toFixed(5)},{viewState.latitude.toFixed(5)}, zoom:{' '}
          {viewState.zoom.toFixed(2)}
        </div>
      </ControlPanel>
    );
  };

  const geoJsonLayer: GeoJsonLayer | null = useMemo(() => {
    if (!geoJsonVisibility) {
      return null;
    }
    return new GeoJsonLayer({
      id: 'geojson-layer',
      data: PLATEAU_BUILDING_GEOJSON,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getFillColor: [255, 255, 255, 10],
      getLineColor: [200, 200, 200, 255],
      // 3D Options
      extruded: true,
      wireframe: true,
      getElevation: (f: Feature) => f.properties?.measuredHeight,
      positionFormat: 'XY'
      // positionFormat: 'XYZ',
      // _full3d: true
    });
  }, [geoJsonVisibility]);

  const tile3DLayer: Tile3DLayer | null =
    selectedExample && selectedExample.tilesetUrl
      ? new Tile3DLayer({
          id: 'tile-3d-layer',
          data: selectedExample.tilesetUrl,
          loader: Tiles3DLoader,
          loadOptions: {
            '3d-tiles': {
              loadGLTF: true,
              decodeQuantizedPositions: false
            }
          },
          pickable: true,
          pointSize: 2,
          getPointColor: [115, 112, 202],
          onTilesetLoad: onTilesetLoad,
          onTileLoad: onTilesetChange,
          onTileUnload: onTilesetChange,
          onTileError: onTilesetChange
        })
      : null;

  return (
    <div style={{position: 'relative', height: '100%'}}>
      <StatsWidgetContainer ref={statsWidgetContainerRef} />
      {renderControlPanel()}
      <DeckGL
        layers={[tile3DLayer, geoJsonLayer]}
        viewState={viewState}
        onViewStateChange={(v: ViewStateChangeParameters) => onViewStateChange(v.viewState)}
        controller={{type: MapController, inertia: true}}
        onAfterRender={updateStatWidgets}
      >
        <Map reuseMaps mapLib={maplibregl} mapStyle={selectedMapStyle} styleDiffing maxPitch={85} />
      </DeckGL>
    </div>
  );
};

export default App;
