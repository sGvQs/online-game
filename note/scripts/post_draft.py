"""
noteに下書きとして投稿する
$ python note/scripts/post_draft.py note/02_URLひとつで遊べるゲームを作っている話.md

.env ファイルに以下を設定してください:
NOTE_EMAIL=your@email.com
NOTE_PASSWORD=yourpassword
"""

import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

PROFILE_DIR = Path(__file__).parent / "chrome_profile"
ENV_FILE = Path(__file__).parent.parent.parent / ".env.local"
ARTICLES_MD = Path(__file__).parent.parent / "articles.md"


def load_credentials() -> tuple[str, str]:
    # .env.local から読み込む
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line.startswith("NOTE_EMAIL="):
                os.environ.setdefault("NOTE_EMAIL", line.split("=", 1)[1])
            elif line.startswith("NOTE_PASSWORD="):
                os.environ.setdefault("NOTE_PASSWORD", line.split("=", 1)[1])

    email = os.environ.get("NOTE_EMAIL", "")
    password = os.environ.get("NOTE_PASSWORD", "")

    if not email or not password:
        print("エラー: .env.local に NOTE_EMAIL と NOTE_PASSWORD を設定してください。")
        print("例:")
        print("  NOTE_EMAIL=your@email.com")
        print("  NOTE_PASSWORD=yourpassword")
        sys.exit(1)

    return email, password


def parse_markdown(filepath: str) -> tuple[str, str, list[str]]:
    content = Path(filepath).read_text(encoding="utf-8")
    lines = content.strip().splitlines()

    # タイトル: 最初の # 行
    title = ""
    for line in lines:
        if line.startswith("# "):
            title = line[2:].strip()
            break

    # タグ: 末尾の #タグ 行
    tags = []
    for line in reversed(lines):
        line = line.strip()
        if line.startswith("#") and not line.startswith("##"):
            tags = [t.lstrip("#") for t in line.split() if t.startswith("#")]
            break

    # 本文: タイトル行とタグ行を除いた部分
    body_lines = []
    skip_title = True
    for line in lines:
        if skip_title and line.startswith("# "):
            skip_title = False
            continue
        if line.strip().startswith("#") and "ゲーム制作" in line:
            continue
        if line.strip().startswith("<!--"):
            continue
        if line.strip() == "---":
            body_lines.append("")
            continue
        if line.startswith("## "):
            body_lines.append(line[3:].strip())
            continue
        body_lines.append(line)

    body = "\n".join(body_lines).strip()
    return title, body, tags


def login(page, email: str, password: str) -> None:
    print("ログイン中...")
    # 現在のページ（/login?redirectPath=... など）でそのままログイン
    page.wait_for_load_state("networkidle")

    page.locator("#email").fill(email)
    page.locator("#password").fill(password)

    # 入力後ボタンが有効になるまで少し待つ
    page.wait_for_timeout(1000)
    page.locator("button[data-type='primary']").click()

    # ログイン後にloginページ以外に遷移するまで待つ
    page.wait_for_url(lambda url: "/login" not in url, timeout=15000)
    print("ログイン完了")


def update_articles_md(title: str) -> None:
    """articles.md の該当タイトル行を「ローカル」→「note下書き」セクションに移動する"""
    if not ARTICLES_MD.exists():
        return

    lines = ARTICLES_MD.read_text(encoding="utf-8").splitlines()

    # 対象行を探す（タイトルが一致する行）
    target_line = None
    target_idx = None
    for i, line in enumerate(lines):
        if f"| {title} |" in line and "ローカル" in line:
            target_line = line.replace("| ローカル |", "| note下書き |")
            target_idx = i
            break

    if target_idx is None:
        print(f"articles.md に「{title}」（ローカル）が見つかりませんでした。手動で更新してください。")
        return

    # 元の行を削除
    lines.pop(target_idx)

    # 「## note下書き」セクションのテーブル末尾に挿入
    insert_idx = None
    in_section = False
    for i, line in enumerate(lines):
        if line.strip() == "## note下書き":
            in_section = True
            continue
        if in_section and line.startswith("##"):
            # 次のセクションに入った → その直前の空行の前に挿入
            insert_idx = i - 1
            # 空行をスキップして最後の表行の次を探す
            for j in range(i - 1, -1, -1):
                if lines[j].startswith("|"):
                    insert_idx = j + 1
                    break
            break

    if insert_idx is None:
        print("articles.md の「note下書き」セクションが見つかりませんでした。")
        return

    lines.insert(insert_idx, target_line)
    ARTICLES_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"articles.md を更新しました: 「{title}」→ note下書き")


def post_draft(filepath: str) -> None:
    email, password = load_credentials()
    title, body, tags = parse_markdown(filepath)
    print(f"タイトル: {title}")
    print(f"タグ: {tags}")
    print(f"本文: {len(body)}文字")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            channel="chrome",
            headless=False,
        )
        page = context.new_page()

        # 新規投稿ページへ（未ログインならログインページにリダイレクトされる）
        page.goto("https://note.com/notes/new")
        page.wait_for_load_state("networkidle")

        # ログインが必要な場合は自動で処理（ログイン後はリダイレクトで notes/new に戻る）
        if "/login" in page.url:
            login(page, email, password)
            page.wait_for_load_state("networkidle")

        # エディタが表示されるまで待つ
        page.wait_for_timeout(2000)

        # タイトル入力
        page.locator("[placeholder='記事タイトル']").click()
        page.locator("[placeholder='記事タイトル']").fill(title)

        # 本文入力
        page.locator(".ProseMirror").first.click()
        page.evaluate(
            """(text) => {
                const el = document.querySelector('.ProseMirror');
                el.focus();
                document.execCommand('insertText', false, text);
            }""",
            body,
        )

        # 「公開に進む」でハッシュタグ設定パネルを開く
        page.get_by_role("button", name="公開に進む").click()
        page.wait_for_timeout(2000)

        # ハッシュタグ入力
        if tags:
            tag_input = page.get_by_placeholder("ハッシュタグを追加する")
            for tag in tags:
                tag_input.click()
                tag_input.fill(tag)
                page.keyboard.press("Enter")
                page.wait_for_timeout(400)

        # キャンセルでエディタに戻る
        page.get_by_role("button", name="キャンセル").click()
        page.wait_for_timeout(1000)

        # 下書き保存
        page.get_by_role("button", name="下書き保存").click()
        page.wait_for_timeout(2000)

        print("下書き保存が完了しました。")
        context.close()

    update_articles_md(title)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使い方: python note/scripts/post_draft.py <mdファイルのパス>")
        sys.exit(1)
    post_draft(sys.argv[1])
