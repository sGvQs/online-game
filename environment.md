# 環境仕様書 (environment.md)

## 1. ローカル環境と商用環境の違い

このプロジェクトでは、開発環境（ローカル）と本番環境（商用）で以下のような構成の違いがあります。

### ローカル環境 (Local Development)
- **インフラ**: 個人のPC上で Docker を使用して再現します。
- **データベース & バックエンド**: `Supabase CLI` が Docker コンテナとして一式（PostgreSQL, Auth, Realtime, Storage, Studio など）を立ち上げます。
- **フロントエンド**: `npm run dev` で Next.js の開発サーバーを起動します。
- **データ**: ローカルにある一時的なデータです。Docker をリセットすると消えます。
- **目的**: 機能実装、デバッグ、動作検証。

### 商用環境 (Production)
- **インフラ**: クラウドサービスを利用します。
- **データベース & バックエンド**: **Supabase Cloud** (マネージドサービス) を利用します。
- **フロントエンド**: **Vercel** にデプロイされ、世界中のCDNから配信されます。
- **データ**: 実際のユーザーデータが保存される永続的なデータです。
- **目的**: エンドユーザーへのサービス提供。

---

## 2. ローカル開発手順 (初心者向け)

開発経験がない方でも環境構築ができるよう、ステップバイステップで説明します。

### 事前準備 (以下のツールをインストールしてください)
1.  **Node.js**: JavaScriptを実行するエンジンです。公式サイトから推奨版（LTS）をインストールしてください。
2.  **Docker Desktop**: データベースなどを動かすために必要です。インストールして起動しておいてください。
3.  **VS Code**: プログラムを書くためのエディタです。
4.  **Git**: ソースコードの履歴を管理するツールです。

### 手順

#### 1. プロジェクトの準備
ターミナル（VS CodeのターミナルでOK）を開き、以下のコマンドを入力します。
```bash
# パッケージ（ライブラリ）のインストール
npm install
```

#### 2. Supabase（バックエンド）の起動
データベースや認証サーバーを立ち上げます。**Docker Desktopが起動していることを確認してください。**
```bash
npx supabase start
```
*初回はイメージのダウンロードに時間がかかります。完了すると、`http://127.0.0.1:54323` (Studio) などのURLが表示されます。*

#### 3. データベースのセットアップ（マイグレーション）
テーブルを作成したり、トリガーを設定したりします。
```bash

npx prisma migrate reset
npx prisma migrate dev
```

#### 4. アプリ開発サーバーの起動
Next.js を起動します。
```bash
npm run dev
```

#### 5. ブラウザで確認
Chrome などのブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

---

## 3. ファイル・構成についての解説

### `scripts/` ディレクトリと `trigger.sql` について

このプロジェクトでは、**認証（Authentication）**と**ユーザーデータ（User Data）**を同期させる仕組みを取り入れています。

-   **課題**: Supabase Auth (認証機能) は `auth.users` という隠蔽された特別なテーブルにユーザーを作りますが、アプリ上では名前やアイコンなどを管理する `public.users` テーブルを使いたいという要件がよくあります。
-   **解決策**: ユーザーがサインアップした瞬間、データベースが自動的に「トリガー」を発動し、`public.users` にもデータをコピーするようにします。
-   **`trigger.sql`**: その「トリガー機能」そのものを定義した SQL ファイルです。
-   **`scripts/setup_trigger.ts`**: この SQL をデータベースに流し込み、トリガーを有効化するためのプログラムです。手動でSQLを打つ手間を省くために用意されています。

### なぜ `docker-compose.yml` がないのか？

通常、Docker で PostgeSQL などを立ち上げる際は `docker-compose.yml` という設定ファイルを書きますが、このプロジェクトにはありません。なぜなら **Supabase CLI** がその役割を担っているからです。

-   **Supabase CLI の役割**: `npx supabase start` コマンドを打つだけで、Supabase チームが最適化した構成で Docker コンテナ群（DB, Auth, Realtime, API Gateway, Studio GUIなど）を自動的に裏側で立ち上げてくれます。
-   **メリット**:
    -   設定ファイルを自分で書く必要がない（間違いが減る）。
    -   本番環境（Supabase Cloud）とほぼ同じ構成がローカルで簡単に再現できる。
    -   GUIツール（Studio）も付いてくるので、ブラウザで簡単にデータを閲覧・編集できる。

つまり、**「Supabase CLI が docker-compose.yml の代わりを全自動でやってくれている」**と考えてください。

---

## 4. Google認証 (OAuth) の設定情報

Google Cloud Console で「認証情報 (Credentials)」を作成する際、**「承認済みのリダイレクト URI (Authorized redirect URIs)」** に設定すべき値は環境によって異なります。

### ローカル環境 (Local Development)
Supabase CLI が立ち上げる Auth サーバーのアドレスを指定します。
- **Redirect URI**: `http://127.0.0.1:54321/auth/v1/callback`

> **注意**: `http://localhost:3000/auth/callback` ではありません。Supabaseを経由させる必要があります。

### 商用環境 (Production)
Supabase Cloud (本番プロジェクト) の URL を使用します。

1. **Supabase ダッシュボード**を開きます。
2. 左メニューの **Settings (設定)** > **API** を選択します。
3. **Project URL** (例: `https://xxxxxxxxxxxx.supabase.co`) をコピーします。
4. この URL の後ろに `/auth/v1/callback` を付けたものが設定値です。

- **Redirect URI**: `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`

Google Cloud Console にはこの **Supabase の URL** を登録してください。アプリケーション（Vercelなど）の URL ではありません。
