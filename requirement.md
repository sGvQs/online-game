# 1. プロジェクト概要
Next.js (App Router) をベースとし、Supabase Auth/Realtime と Prisma を組み合わせた「スケーラブルなマルチプレイヤー・ボードゲーム」の開発基盤を構築する。

# 2. 技術スタック
### Frontend: Next.js (App Router)

### Database / Realtime: Supabase (PostgreSQL)

### ORM: Prisma

### Authentication: Supabase Auth

### Infrastructure: Vercel (Frontend), Supabase (Backend/DB)

### Local Development: Supabase CLI (Docker)

# 3. データベース設計 (Prisma)
ユーザー情報の整合性とセキュリティを担保するため、認証情報とアプリケーション情報を分離する。

# 3.1. テーブル構成
## UserIDP (User Identity Provider):

Supabase Auth の auth.users とアプリケーション側の User を紐付けるための中間テーブル。

カラム: id (UUID), supabase_uid (UUID / Unique), user_id (UUID / FK to User)

## User:

ゲーム内での名前やアイコン、ステータスを管理するアプリケーション専用テーブル。

カラム: id (UUID), name (String), email (String), created_at (DateTime)

# 3.2. 自動同期 (PostgreSQL Trigger)
Supabase Auth でサインアップが完了した際、データベース側で自動的に User と UserIDP の両方にレコードを挿入するトリガー関数を実装する。

# 4. リアルタイム通信要件
Supabase Realtime を使用し、DBの変更をフロントエンドへ即座にプッシュする。

## Local Testing:

Supabase CLI を使用し、ローカルの Docker 環境で Realtime サーバーを実行する。

開発初期は RLS (Row Level Security) を無効化し、Socket.io のような自由な通信を可能にした状態で検証を行う。

# 5. 認証・認可フロー
## 書き込み:

クライアントから直接 DB を操作せず、Next.js の Server Actions を経由させる。

Server Action 内で Prisma を用いてバリデーション後に DB を更新する。

## 読み取り / 同期:

初期データは Server Component で取得。

更新データは Client Component の useEffect 内で Supabase Realtime を購読して受信する。

# 6. 開発マイルストーン (Phase 1: 基盤構築)
Supabase CLI の初期化とローカルコンテナの起動。

schema.prisma の定義と DB マイグレーションの実施。

Auth トリガーの SQL 実行。

Next.js 上でのサインアップ・ログイン・ログアウト機能の実装。

ブラウザを2枚開き、DB更新がリアルタイムに同期されることの確認。