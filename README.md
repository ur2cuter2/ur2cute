# 語彙クエスト / ur2cute

## プロジェクト概要
小学生向けの語彙学習Webアプリです。`vocab-words.csv` の語彙データを読み込み、バトル・ストーリー・よみときミッションを通じて、語彙の学習と復習を行います。

## セーブデータのインポート仕様（本番・TEST共通）

直近の修正で、セーブデータインポート時の安全性を強化しています。

### 1) インポート前バックアップ
- インポート成功前に、現在の `state` を自動バックアップします。
- バックアップキーは以下です。
  - 本番: `vq_state_backup_YYYYMMDD_HHMMSS`
  - TEST: `vq_state_test_backup_YYYYMMDD_HHMMSS`
- `YYYYMMDD_HHMMSS` は実行時刻から生成されます。

### 2) 反映順序（安全化）
`importSave()` は次の順に処理します。
1. テキスト取得
2. `JSON.parse`
3. 最低限の形式チェック
4. `migrateToCurrentState()` で読込検証
5. バックアップ作成
6. `state / words / quests` を一括反映
7. `saveAll()`
8. UI再描画

### 3) 失敗時の挙動
- JSON解析失敗・形式不正・migration失敗・バックアップ作成失敗時は、インポートを中止します。
- 既存の `state / words / quests / localStorage` は変更されません。

### 4) 成功メッセージ
- 正常インポート成功時は、必ずバックアップキーを含むメッセージを表示します。
  - 例: `セーブデータを復元しました。インポート前のデータは vq_state_test_backup_20260520_231530 にバックアップしました。`

### 5) 互換形式
以下の読み込みに対応しています。
- compact v2 (`v === 2`)
- 旧形式 (`{ state, words, quests }`)
- state単体形式
