# 京橋駅周辺三次元点群データ（令和３年度、令和４年度取得データ_LAS）

## データ諸元

* URL: https://www.geospatial.jp/ckan/dataset/kyoubasiekisyuuhen_las
* ライセンス: [クリエイティブ・コモンズ 表示](http://www.opendefinition.org/licenses/cc-by/)
* 座標参照系: JGD2011 Japan Plane Reactangular CS VI (EPSG:6674)

## 利用した元データ

`pointcloud/org` ディレクトリに元データを配置します。
[三次元点群データ位置図.pdf (プレビュー)](https://www.geospatial.jp/ckan/dataset/kyoubasiekisyuuhen_las/resource/455bd35c-c571-461d-bb56-abfb0a899d8b) より、ファイルサイズが小さめの以下のファイルを使用しています。  
(※GitHubのリポジトリ容量制限(計1GB未満)のため、リポジトリには追加していません。)

* `D-07.las`: 京阪京橋駅とJR大阪環状線京橋駅の連絡路
* `D-03.las`: 京橋公園
* `B-01.las`: 東野田公園

## 座標参照系(CRS)を付与したデータ

`pointcloud/crs` ディレクトリにCRSを付与したデータを配置します。  
(※GitHubのリポジトリ容量制限(計1GB未満)のため、リポジトリには追加していません。)

```sh
pdal translate -i org/D-07.las -o crs/D-07.las --writers.las.a_srs="EPSG:6674"
pdal translate -i org/D-03.las -o crs/D-03.las --writers.las.a_srs="EPSG:6674"
pdal translate -i org/B-01.las -o crs/B-01.las --writers.las.a_srs="EPSG:6674"
```

参考リンク:
* [超強力な「PDAL」おすすめコマンド3選・「メタデータの表示」「CRSの付与」「XY座標の入れ替え」 #PointCloud - Qiita](https://qiita.com/nokonoko_1203/items/fb842d163cc9c3e56a4b#crs%E3%81%AE%E4%BB%98%E4%B8%8E)

## COPC形式に変換したデータ

`pointcloud/copc` ディレクトリにCOPC形式に変換したデータを配置しています。

```sh
pdal translate -i crs/D-07.las -o copc/D-07.copc.laz --writers.copc.forward=all
pdal translate -i crs/D-03.las -o copc/D-03.copc.laz --writers.copc.forward=all
pdal translate -i crs/B-01.las -o copc/B-01.copc.laz --writers.copc.forward=all
```

参考リンク:
* [点群データからCloud Optimized Point Cloud（COPC）を生成する方法 #foss4g - Qiita](https://qiita.com/shi-works/items/c81df65fcf59bc3047d6)

## 3D Tiles形式変換用にXYを入れ替えたデータ

`pointcloud/yx` ディレクトリにXY座標を入れ替えたデータを配置します。  
(※GitHubのリポジトリ容量制限(計1GB未満)のため、リポジトリには追加していません。)

```sh
pdal pipeline ./xy_switch_pipeline.json --readers.las.filename=crs/D-07.las --writers.las.filename=yx/D-07.las
pdal pipeline ./xy_switch_pipeline.json --readers.las.filename=crs/D-03.las --writers.las.filename=yx/D-03.las
pdal pipeline ./xy_switch_pipeline.json --readers.las.filename=crs/B-01.las --writers.las.filename=yx/B-01.las
```

## 3DTiles形式に変換したデータ

`pointcloud/3dtiles` ディレクトリに3DTiles形式に変換したデータを配置しています。

### Ubuntu 24.04 LTS環境での変換手順

```sh
sudo apt install python3 python3-pip python3.12-venv
python3 -m venv venv
source venv/bin/activate
pip install py3dtiles
pip install py3dtiles[las]
py3dtiles convert --srs_in 6674 --srs_out 4978 --out 3dtiles/D-07 yx/D-07.las
py3dtiles convert --srs_in 6674 --srs_out 4978 --out 3dtiles/D-03 yx/D-03.las
py3dtiles convert --srs_in 6674 --srs_out 4978 --out 3dtiles/B-01 yx/B-01.las
deactivate
```

参考リンク:
* [長崎県全域の点群データが自由に使えるらしいからみんなで使っちゃおうぜ！？ #JavaScript - Qiita](https://qiita.com/nokonoko_1203/items/a8d58c12c31faf55a7f5)
* [3次元点群データから3DTilesを生成する方法](https://zenn.dev/shi_works/articles/b01b67be8b4702)
* https://py3dtiles.org/main/install.html
