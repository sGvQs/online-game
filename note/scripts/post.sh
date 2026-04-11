#!/bin/bash
# noteに下書き投稿する
# 使い方: bash note/scripts/post.sh "note/02_URLひとつで遊べるゲームを作っている話.md"

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$1" ]; then
  echo "使い方: bash note/scripts/post.sh <mdファイルのパス>"
  exit 1
fi

# python / pip コマンドの解決
PYTHON=$(command -v python3 || command -v python)
PIP=$(command -v pip3 || command -v pip)

if [ -z "$PYTHON" ]; then
  echo "Python が見つかりません。https://www.python.org からインストールしてください。"
  exit 1
fi

# 依存パッケージのインストール
$PIP install -r "$SCRIPT_DIR/requirements.txt" -q

# Playwrightブラウザのインストール（未インストール時のみ）
$PYTHON -m playwright install chromium 2>/dev/null || true

# 投稿スクリプトを実行
$PYTHON "$SCRIPT_DIR/post_draft.py" "$1"
