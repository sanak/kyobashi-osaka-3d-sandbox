import styled from 'styled-components';
import React, {ReactNode} from 'react';
import type {Tileset3D} from '@loaders.gl/tiles';
import {MAP_STYLES} from '../constants';
import type {Example, Index} from '../examples';
import type {MapStyles} from '../constants';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  max-width: 280px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  padding: 12px 24px;
  margin: 20px;
  font-size: 13px;
  line-height: 2;
  outline: none;
  z-index: 100;
  color: #121212;
`;

const DropDownContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DropDownLabel = styled.label`
  width: 60px;
  text-align: right;
`;

const DropDown = styled.select`
  margin-left: 6px;
`;

const TilesetDropDownContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TilesetDropDownLabel = styled.label`
  width: 60px;
  text-align: right;
`;

const TilesetDropDown = styled.select`
  margin-left: 6px;
  /* font-weight: 800; */
  font-size: 14px;
`;

const CheckBoxContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CheckBoxLabel = styled.label`
  width: auto;
  text-align: left;
`;

const CheckBox = styled.input.attrs({type: 'checkbox'})`
  width: 60px;
`;

type ExampleChangeEvent = {
  category: string;
  name: string;
  example: Example;
};

type MapStyleChangeEvent = {
  selectedMapStyle: string;
};

type GeoJsonVisibilityChangeEvent = {
  geoJsonVisibility: boolean;
};

type ControlPanelProps = {
  category: string;
  name: string;
  data: Index;
  tileset?: Tileset3D | null;
  mapStyles?: MapStyles;
  selectedMapStyle?: string;
  geojsonVisibility: boolean;
  onExampleChange: (event: ExampleChangeEvent) => void;
  onMapStyleChange: (event: MapStyleChangeEvent) => void;
  onGeoJsonVisibilityChange: (event: GeoJsonVisibilityChangeEvent) => void;
  children?: ReactNode;
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  category,
  name,
  data,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tileset,
  mapStyles = MAP_STYLES,
  selectedMapStyle = Object.values(MAP_STYLES)[0],
  geojsonVisibility,
  onExampleChange,
  onMapStyleChange,
  onGeoJsonVisibilityChange,
  children
}: ControlPanelProps) => {
  const renderByCategories = () => {
    const categories = Object.keys(data);
    const selectedValue = `${category}.${name}`;

    return (
      <TilesetDropDownContainer>
        <TilesetDropDownLabel>3D Tiles:</TilesetDropDownLabel>
        <TilesetDropDown
          value={selectedValue}
          onChange={(evt) => {
            const selected = evt.target.value;
            const [newCategory, newName] = selected.split('.');
            const categoryExamples = data[newCategory].examples;
            onExampleChange({
              category: newCategory,
              name: newName,
              example: categoryExamples[newName]
            });
          }}
        >
          {categories.map((c, i) => {
            const categoryExamples = data[c].examples;
            return (
              <optgroup key={i} label={data[c].name}>
                {Object.keys(categoryExamples).map((e, j) => {
                  const value = `${c}.${e}`;
                  return (
                    <option key={j} value={value}>
                      {e}
                    </option>
                  );
                })}
              </optgroup>
            );
          })}
        </TilesetDropDown>
      </TilesetDropDownContainer>
    );
  };

  const renderMapStyles = () => {
    return (
      <DropDownContainer>
        <DropDownLabel>背景地図:</DropDownLabel>
        <DropDown
          value={selectedMapStyle}
          onChange={(evt) => {
            const selected = evt.target.value;
            onMapStyleChange({selectedMapStyle: selected});
          }}
        >
          {Object.keys(mapStyles).map((key) => {
            return (
              <option key={key} value={mapStyles[key]}>
                {key}
              </option>
            );
          })}
        </DropDown>
      </DropDownContainer>
    );
  };

  const renderGeoJsonVisibility = () => {
    return (
      <CheckBoxContainer>
        <CheckBox
          checked={geojsonVisibility}
          onChange={(evt) => {
            const checked = evt.target.checked;
            onGeoJsonVisibilityChange({geoJsonVisibility: checked});
          }}
        />
        <CheckBoxLabel>PLATEAU建築物GeoJSON</CheckBoxLabel>
      </CheckBoxContainer>
    );
  };

  return (
    <Container>
      {renderByCategories()}
      {renderMapStyles()}
      {renderGeoJsonVisibility()}
      {children}
    </Container>
  );
};

export default ControlPanel;
