# 語彙クエスト / ur2cute

## プロジェクト概要
小学生向けの語彙学習Webアプリです。`vocab-words.csv` の語彙データを読み込み、バトル・ストーリー・よみときミッションを通じて、語彙の学習と復習を行います。

## 主なファイル
- `vocab-quest.html`：本番用の語彙クエスト
- `vocab-quest-test.html`：テスト環境用の語彙クエスト
- `vocab-quest-boss.html`：よみときミッション用
- `vocab-words.csv`：語彙データ
- `append_csv_record.py`：語彙CSV追記用スクリプト

## 本番環境とテスト環境
本番環境とテスト環境では、`localStorage` の保存キーを分離しています。

- 本番
  - `vq_state`
  - `vq_words`
  - `vq_quests`
  - `vq_state_backup_YYYYMMDD_HHMMSS`（インポート前の自動バックアップ）
- テスト
  - `vq_state_test`
  - `vq_words_test`
  - `vq_quests_test`
  - `vq_state_test_backup_YYYYMMDD_HHMMSS`（インポート前の自動バックアップ）

`vocab-quest-test.html` は、本番データを触らないためのテスト環境です。  
`migration`、セーブデータ形式変更、`import/export` 変更、`daily card logic` 変更は、まずテスト環境で確認してください。

## セーブデータ運用
セーブデータは compact v2 形式を使用します。  
CSV由来のマスタ情報（単語本文・意味・文脈・クイズ・ストーリー本文など）はセーブデータに保存せず、進捗情報のみを保存します。

主な短縮キー：
- `v`：形式バージョン
- `w`：単語ごとの進捗
- `day`：今日のカード枠
- `pl`：playLog
- `sl`：submitLog
- `xp`：経験値
- `lv`：レベル
- `st`：現在の連続記録
- `best`：最高連続記録
- `last`：最終プレイ日

## CSV追加方法
`append_csv_record.py` を使って `vocab-words.csv` に追加してください。

ルール：
- IDは既存末尾+1で自動採番する
- 入力CSVレコード先頭のIDは仮IDとして扱い、既存末尾+1のIDで上書きする
- 複数レコードがある場合は、入力順に1行ずつ追加する
- 追加後は差分を確認する
- CSV追加のみのPRでは、原則として `vocab-words.csv` 以外を変更しない

## 開発時の注意
- `vocab-quest.html` を変更した場合、必要に応じて `vocab-quest-test.html` にも同じ変更を反映する
- 本番とテストで `STORAGE_KEYS` が混ざらないようにする
- インポート処理では、失敗時に現在のセーブデータを上書きしない
- セーブデータ変更前にはバックアップを取る
- daily card logic は「新語3枚」と「復習2枚」を独立枠として扱う
- `todaySet.length` による合計5枚制限で新語枠を圧迫しない

## テスト観点
最低限、以下を確認してください。

- 本番とテストの `localStorage` キーが分離されている
- compact v2 セーブデータをインポートできる
- `playLog / submitLog / xp / lv / st / best / last` が復元される
- セーブ→リロード後も進捗が維持される
- 壊れたJSONをインポートしても現在データが壊れない
- 朝に新語0枚・復習2枚、夕方に新語追加した場合、新語3枚が補充される
