// loaders.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {PureComponent} from 'react';
import {createRoot} from 'react-dom/client';
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

import ControlPanel from './components/control-panel';
import {loadExampleIndex, INITIAL_EXAMPLE_CATEGORY, INITIAL_EXAMPLE_NAME} from './examples';
import {INITIAL_MAP_STYLE} from './constants';

const TRANSITION_DURAITON = 2000;
const EXAMPLES_VIEWSTATE = {
  latitude: 34.697368,
  longitude: 135.533355
};

export const INITIAL_VIEW_STATE = {
  ...EXAMPLES_VIEWSTATE,
  pitch: 45,
  maxPitch: 60,
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

export default class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // CURRENT VIEW POINT / CAMERA POSITIO
      viewState: INITIAL_VIEW_STATE,

      // current tileset
      tileset: null,

      // MAP STATE
      selectedMapStyle: INITIAL_MAP_STYLE,

      // EXAMPLE STATE
      droppedFile: null,
      examplesByCategory: null,
      selectedExample: null,
      category: INITIAL_EXAMPLE_CATEGORY,
      name: INITIAL_EXAMPLE_NAME
    };

    this._deckRef = null;
    this._onTilesetLoad = this._onTilesetLoad.bind(this);
    this._onTilesetChange = this._onTilesetChange.bind(this);
  }

  componentDidMount() {
    const container = this._statsWidgetContainer;
    this._tilesetStatsWidget = new StatsWidget(null, {
      container,
      css: {'line-break': 'anywhere'}
    });

    this._loadExampleIndex();

    // Check if a tileset is specified in the query params
    if (this._selectTilesetFromQueryParams()) {
      return;
    }
  }

  // load the index file that lists example tilesets
  async _loadExampleIndex() {
    const examplesByCategory = await loadExampleIndex();
    this.setState({examplesByCategory});

    // if not, select the default example tileset
    const {category, name} = this.state;
    const selectedExample = examplesByCategory[category].examples[name];
    this.setState({selectedExample});
  }

  // Check URL query params and select the "custom example" if appropriate
  _selectTilesetFromQueryParams() {
    const parsedUrl = new URL(window.location.href);

    const tilesetUrl = parsedUrl.searchParams.get('tileset');
    if (tilesetUrl) {
      this.setState({
        selectedExample: {tilesetUrl},
        category: 'custom',
        name: 'URL Tileset'
      });
      return true;
    }

    return false;
  }

  // Updates stats, called every frame
  _updateStatWidgets() {
    // this._memWidget.update();
    this._tilesetStatsWidget.update();
  }

  // Called by ControlPanel when user selects a new example
  _onSelectExample({example, category, name}) {
    this.setState({selectedExample: example, category, name});
  }

  // Called by ControlPanel when user selects a new map style
  _onSelectMapStyle({selectedMapStyle}) {
    this.setState({selectedMapStyle});
  }

  // Called by Tile3DLayer when a new tileset is loaded
  _onTilesetLoad(tileset) {
    this.setState({tileset});
    this._tilesetStatsWidget.setStats(tileset.stats);
    this._centerViewOnTileset(tileset);
  }

  // Recenter view to cover the new tileset, with a fly-to transition
  _centerViewOnTileset(tileset) {
    const {cartographicCenter, zoom} = tileset;
    this.setState({
      viewState: {
        ...this.state.viewState,

        // Update deck.gl viewState, moving the camera to the new tileset
        longitude: cartographicCenter[0],
        latitude: cartographicCenter[1],
        zoom: zoom + 3, // TODO - remove adjustment when Tileset3D calculates correct zoom
        bearing: INITIAL_VIEW_STATE.bearing,
        pitch: INITIAL_VIEW_STATE.pitch,

        // Tells deck.gl to animate the camera move to the new tileset
        transitionDuration: TRANSITION_DURAITON,
        transitionInterpolator: new FlyToInterpolator()
      }
    });
  }

  // Called by Tile3DLayer whenever an individual tile in the current tileset is load or unload
  _onTilesetChange(tileHeader) {
    this._updateStatWidgets();
  }

  // Called by DeckGL when user interacts with the map
  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _renderControlPanel() {
    const {examplesByCategory, category, name, viewState, tileset, selectedMapStyle} = this.state;
    if (!examplesByCategory) {
      return null;
    }

    return (
      <ControlPanel
        data={examplesByCategory}
        category={category}
        name={name}
        tileset={tileset}
        onMapStyleChange={this._onSelectMapStyle.bind(this)}
        onExampleChange={this._onSelectExample.bind(this)}
        selectedMapStyle={selectedMapStyle}
      >
        <div style={{textAlign: 'center'}}>
          long/lat: {viewState.longitude.toFixed(5)},{viewState.latitude.toFixed(5)}, zoom:{' '}
          {viewState.zoom.toFixed(2)}
        </div>
      </ControlPanel>
    );
  }

  _renderStats() {
    // TODO - too verbose, get more default styling from stats widget?
    return <StatsWidgetContainer ref={(_) => (this._statsWidgetContainer = _)} />;
  }

  _renderTile3DLayer() {
    const {selectedExample} = this.state;
    if (!selectedExample) {
      return null;
    }

    const {maximumScreenSpaceError, tilesetUrl} = selectedExample;
    const dataUrl = tilesetUrl;
    const loadOptions = {
      '3d-tiles': {
        loadGLTF: true,
        decodeQuantizedPositions: false
      }
    };
    if (maximumScreenSpaceError) {
      loadOptions.maximumScreenSpaceError = maximumScreenSpaceError;
    }

    return new Tile3DLayer({
      id: 'tile-3d-layer',
      data: dataUrl,
      loader: Tiles3DLoader,
      loadOptions,
      pickable: true,
      pointSize: 2,
      getPointColor: [115, 112, 202],
      onTilesetLoad: this._onTilesetLoad,
      onTileLoad: this._onTilesetChange,
      onTileUnload: this._onTilesetChange,
      onTileError: this._onTilesetChange
    });
  }

  render() {
    const {viewState, selectedMapStyle} = this.state;
    const tile3DLayer = this._renderTile3DLayer();

    return (
      <div style={{position: 'relative', height: '100%'}}>
        {this._renderStats()}
        {this._renderControlPanel()}
        <DeckGL
          layers={[tile3DLayer]}
          viewState={viewState}
          onViewStateChange={this._onViewStateChange.bind(this)}
          controller={{type: MapController, maxPitch: 85, inertia: true}}
          onAfterRender={() => this._updateStatWidgets()}
        >
          <Map reuseMaps mapLib={maplibregl} mapStyle={selectedMapStyle} preventStyleDiffing />
        </DeckGL>
      </div>
    );
  }
}

export function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);
}
