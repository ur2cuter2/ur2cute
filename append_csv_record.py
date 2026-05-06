#!/usr/bin/env python3
"""指定したCSVファイルの末尾に新しいレコードを追加するスクリプト。"""

import argparse
import csv
import io
import re
from pathlib import Path

ID_PATTERN = re.compile(r"^w(\d+)$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "指定のCSVファイルの最後に新しいレコードを追加します。"
            "\nA列ID(w001形式)はCSV末尾のID+1で自動採番されます。"
        )
    )
    parser.add_argument("csv_path", nargs="?", help="追記対象のCSVファイルパス")
    parser.add_argument("--record", nargs="+", help="追加するレコードの値（列順）")
    parser.add_argument(
        "--record-csv",
        help="追加するレコードを1行CSV文字列で指定（例: 'w120,愛くるしい,...'）",
    )
    parser.add_argument("--encoding", default="utf-8", help="CSVの文字コード")
    parser.add_argument("--select-file", action="store_true", help="GUIでCSVを選択")
    parser.add_argument("--interactive", action="store_true", help="対話形式で入力")
    return parser.parse_args()


def choose_file_with_dialog() -> Path:
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(title="追記するCSVを選択", filetypes=[("CSV", "*.csv")])
    root.destroy()
    if not file_path:
        raise ValueError("CSVファイルが選択されませんでした。")
    return Path(file_path)


def parse_record_csv_line(line: str) -> list[str]:
    return next(csv.reader(io.StringIO(line)))


def extract_row_fields(row: list[str]) -> list[str]:
    # 通常CSVは複数列、特殊形式では1列にCSV1行が格納されているため両対応
    if len(row) == 1 and "," in row[0]:
        return parse_record_csv_line(row[0])
    return row


def next_id_from_rows(rows: list[list[str]]) -> str:
    for row in reversed(rows):
        fields = extract_row_fields(row)
        if not fields:
            continue
        m = ID_PATTERN.match(fields[0].strip())
        if m:
            return f"w{int(m.group(1)) + 1}"
    raise ValueError("末尾ID(w数字)を読み取れませんでした。")


def main() -> None:
    args = parse_args()

    if args.select_file:
        csv_path = choose_file_with_dialog()
    elif args.csv_path:
        csv_path = Path(args.csv_path)
    elif args.interactive:
        csv_path = Path(input("追記対象のCSVファイルパス: ").strip())
    else:
        raise ValueError("CSVファイルが未指定です。")

    if not csv_path.exists():
        raise FileNotFoundError(f"CSVファイルが見つかりません: {csv_path}")

    with csv_path.open("r", newline="", encoding=args.encoding) as f:
        rows = list(csv.reader(f))

    if args.record_csv:
        record = parse_record_csv_line(args.record_csv)
    elif args.record:
        record = args.record
    elif args.interactive:
        record = parse_record_csv_line(input("追加レコードをCSV形式で入力: ").strip())
    else:
        raise ValueError("追加するレコードが未指定です。")

    expected_columns = len(extract_row_fields(rows[0])) if rows else len(record)
    if len(record) != expected_columns:
        raise ValueError(f"列数が一致しません。期待値: {expected_columns}, 入力値: {len(record)}")

    new_id = next_id_from_rows(rows) if rows else "w1"
    record[0] = new_id  # 先頭IDは入力値を無視して自動採番

    with csv_path.open("rb+") as raw:
        raw.seek(0, 2)
        if raw.tell() > 0:
            raw.seek(-1, 2)
            if raw.read(1) not in (b"\n", b"\r"):
                raw.write(b"\n")

    with csv_path.open("a", newline="", encoding=args.encoding) as f:
        writer = csv.writer(f)
        # 既存が1列埋め込み形式なら同形式で追記
        if rows and len(rows[0]) == 1 and "," in rows[0][0]:
            writer.writerow([",".join(record)])
        else:
            writer.writerow(record)

    print(f"レコードを追加しました: {csv_path} (新ID: {new_id})")


if __name__ == "__main__":
    main()
