# ur2cute 公開成果物

語彙クエストの本番URL: https://ur2cuter2.github.io/ur2cute/vocab-quest.html

語彙クエストの開発ソースは既存Privateリポジトリの `vocab-quest/src` で管理します。このリポジトリの語彙クエスト成果物を直接編集せず、Private側の `tools/publish.py` で許可リストに従って同期してください。

公開対象は本番HTML、ボスHTML、語彙CSV、画像6点です。テストHTML・開発ツールはPrivate側で管理します。ゲームロジック、保存キー、本番の相対パスは今回の分離で変更していません。他アプリの公開ファイルは維持します。

同期はdry-runがデフォルトで、手編集を検出すると停止します。ローカル同期からcommit/pushや本番公開は自動実行しません。
