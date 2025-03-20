# deckgl-react

## 概要

京橋駅(大阪)付近の三次元点群データ表示サンプルのdeck.gl+React版です。  
[loaders.gl](https://loaders.gl) の3D Tilesサンプルを元に作成しています。

- サンプルURL: https://loaders.gl/examples/3d-tiles
- コードURL: https://github.com/visgl/loaders.gl/tree/master/examples/website/3d-tiles

## 注意事項

- PLATEAUの3D Tilesデータの表示が上手く行かないため、建築物レイヤについては、別途GeoJSONレイヤとしても表示しています。

## 開発メモ

### npmパッケージ更新

```sh
cd /path/to/apps/deckgl-react
pnpm update -i -L
# 更新対象パッケージを選択してEnterキーを押下
```
