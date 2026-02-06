# ディレクトリ構造仕様書

## 概要
このドキュメントは、プロジェクトのディレクトリ構造と各フォルダの責務を定義する仕様書です。

---

## ルート構造

```
src/
├── app/                  # Next.js App Router
├── backend/              # サーバーサイドロジック
├── frontend/             # クライアントサイド
├── shared/               # 共有モジュール
├── proxy.ts              # Next.js ミドルウェア
└── types.ts              # 後方互換性のための再エクスポート（非推奨）
```

---

## `/src/app` - Next.js App Router

Next.js 13+ のApp Routerに準拠したルーティング構造。

```
app/
├── api/                  # API Routes
├── auth/                 # 認証関連ページ
├── dashboard/            # ダッシュボードページ
├── game/                 # ゲーム関連ページ
│   └── [roomId]/
│       └── error-hunter/
├── room/                 # ルーム関連ページ
│   └── [id]/
├── login/                # ログインページ
├── globals.css           # グローバルスタイル
├── layout.tsx            # ルートレイアウト
└── page.tsx              # ホームページ
```

### ルール
- 各ページは `page.tsx` で実装
- Client Components は `components/` から import
- Server Actions は `backend/actions/` を使用

---

## `/src/backend` - サーバーサイドロジック

### 構造
```
backend/
├── actions/              # Server Actions
│   ├── auth.ts           # 認証系アクション
│   ├── room.ts           # ルーム管理アクション
│   └── user.ts           # ユーザー管理アクション
└── lib/                  # バックエンド専用ライブラリ
    ├── prisma.ts         # Prismaクライアント
    └── supabase/         # Supabase Admin クライアント
```

### ルール
- Server Actions は `'use server'` ディレクティブ必須
- Prisma クライアントは必ずここから使用
- クライアントからの直接import禁止

---

## `/src/frontend` - クライアントサイド

### 構造
```
frontend/
├── components/           # UIコンポーネント
│   ├── auth/             # 認証コンポーネント
│   ├── game/             # ゲーム関連コンポーネント
│   ├── room/             # ルーム関連コンポーネント
│   ├── ui/               # 汎用UIコンポーネント
│   └── user/             # ユーザー関連コンポーネント
├── hooks/                # カスタムフック
└── lib/                  # フロントエンド専用ライブラリ
    ├── supabase/         # Supabaseクライアント
    ├── theme-context.tsx # テーマ管理
    └── utils.ts          # ユーティリティ
```

### コンポーネント構造パターン

#### パターンA: フォルダ分離（推奨）
複雑なコンポーネントには以下の構造を使用：
```
ComponentName/
├── index.tsx             # コンポーネント本体
└── styles.ts             # tailwind-variants スタイル
```

#### パターンB: 単一ファイル
シンプルなコンポーネントは単一ファイルで管理：
```
SimpleComponent.tsx
```

### 各フォルダの責務

| フォルダ | 責務 |
|---------|-----|
| `auth/` | ログイン、ログアウト、認証フォーム |
| `game/` | ゲームUI、ホストコントロール、Win95スタイル |
| `room/` | ルームリスト、メンバー管理、ゲーム選択 |
| `ui/` | Button, Card, Input 等の汎用コンポーネント |
| `user/` | ユーザープロフィール |

---

## `/src/shared` - 共有モジュール

フロントエンドとバックエンドの両方で使用する共通コード。

### 構造
```
shared/
└── types/                # 型定義
    ├── index.ts          # 一括エクスポート
    ├── user.ts           # User, UserIDP, UserBasic 等
    ├── room.ts           # Room, RoomUser, RoomStatus 等
    └── game.ts           # Match, ErrorEvent 等
```

### 使用方法
```typescript
// 推奨
import { Room, User, RoomStatus } from '@/shared/types'

// 非推奨（後方互換性のため残存）
import { Room } from '@/types'
```

---

## スタイリング規約

### tailwind-variants の使用
- slots 機能で構成要素を分離
- スタイルは `styles.ts` に集約
- コンポーネントからは `import { xxx } from './styles'`

### 例
```typescript
// styles.ts
import { tv } from 'tailwind-variants'

export const component = tv({
    slots: {
        wrapper: 'flex gap-4',
        title: 'text-xl font-bold',
    },
})

// index.tsx
import { component } from './styles'
const styles = component()

return (
    <div className={styles.wrapper()}>
        <h1 className={styles.title()}>タイトル</h1>
    </div>
)
```

---

## 命名規則

| 対象 | 規則 | 例 |
|-----|-----|-----|
| コンポーネント | PascalCase | `RoomCard.tsx` |
| スタイルファイル | `styles.ts` | `styles.ts` |
| フック | camelCase + use | `useAuth.ts` |
| 型定義ファイル | camelCase | `room.ts` |
| Server Actions | camelCase | `createRoom` |
