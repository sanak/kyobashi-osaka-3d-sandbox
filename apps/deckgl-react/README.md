# deckgl-react

## 概要

京橋駅(大阪)付近の三次元点群データ表示サンプルのdeck.gl+React版です。  
[loaders.gl](https://loaders.gl) の3D Tilesサンプルを元に作成しています。

- サンプルURL: https://loaders.gl/examples/3d-tiles
- コードURL: https://github.com/visgl/loaders.gl/tree/master/examples/website/3d-tiles

## 注意事項

- TypeScriptで記述していますが、文法エラーが多々発生していて、デプロイ用のビルド時には `tsc` による型チェックをスキップしています。
  - 元のサンプルコードの記載もReactの古い書き方になっているようなので、React Hooksを利用した書き方に変更の予定です。
- PLATEAUの3D Tilesデータの表示が上手く行かないため、建築物レイヤについては、別途GeoJSONレイヤとして表示する予定です。