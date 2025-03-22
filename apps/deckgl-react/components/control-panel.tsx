import React, {ReactNode} from 'react';
import type {Tileset3D} from '@loaders.gl/tiles';
import {MAP_STYLES} from '../constants';
import type {Example, Index} from '../examples';
import type {MapStyles} from '../constants';
import styles from './control-panel.module.css';

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
      <div className={styles.tilesetDropDownContainer}>
        <label className={styles.tilesetDropDownLabel}>3D Tiles:</label>
        <select className={styles.tilesetDropDown}
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
        </select>
      </div>
    );
  };

  const renderMapStyles = () => {
    return (
      <div className={styles.dropDownContainer}>
        <label className={styles.dropDownLabel}>背景地図:</label>
        <select className={styles.dropDown}
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
        </select>
      </div>
    );
  };

  const renderGeoJsonVisibility = () => {
    return (
      <div className={styles.checkBoxContainer}>
        <input type={'checkbox'} className={styles.checkBox}
          checked={geojsonVisibility}
          onChange={(evt) => {
            const checked = evt.target.checked;
            onGeoJsonVisibilityChange({geoJsonVisibility: checked});
          }}
        />
        <label className={styles.checkBoxLabel}>PLATEAU建築物GeoJSON</label>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {renderByCategories()}
      {renderMapStyles()}
      {renderGeoJsonVisibility()}
      {children}
    </div>
  );
};

export default ControlPanel;
