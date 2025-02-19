# kyobashi-osaka-3d-sandbox

京橋駅(大阪)付近の三次元点群データ表示サンプルです。  
今のところ、deck.gl+React版のみとなりますが、将来的にはCesium＋α版も作成予定です。

## デモサイト

URL: https://sanak.github.io/kyobashi-osaka-3d-sandbox/

## 利用データ

### 京橋駅周辺三次元点群データ（令和３年度、令和４年度取得データ_LAS）

* URL: https://www.geospatial.jp/ckan/dataset/kyoubasiekisyuuhen_las
* ライセンス: [クリエイティブ・コモンズ 表示](http://www.opendefinition.org/licenses/cc-by/)

### 3D都市モデル（Project PLATEAU）大阪市（2022年度）

* URL: https://www.geospatial.jp/ckan/dataset/plateau-27100-osaka-shi-2022
* ライセンス: [クリエイティブ・コモンズ 表示 4.0 国際](https://creativecommons.org/licenses/by/4.0/legalcode.ja)

## 開発環境

動作確認はmacOS環境のみで行っています。 `/data` ディレクトリを `apps/deckgl-react/public` ディレクトリからシンボリックリンクで参照しているため、Windows環境では動作しないかもしれません。

### 開発ツール
- Node.js >= v20
- pnpm >= v9

### インストールと開発サーバ起動

```sh
pnpm install
pnpm run dev
```

### デプロイ用のビルドとプレビュー

```sh
pnpm run build
pnpm run preview
```

## ライセンス

* コード: [MIT](https://opensource.org/license/MIT)
* データ: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode)
