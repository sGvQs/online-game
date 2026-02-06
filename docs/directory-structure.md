# ディレクトリ構造仕様書

## 概要
このドキュメントは、プロジェクトのディレクトリ構造と各フォルダの責務を定義する仕様書です。

---

## ルート構造

```
src/
├── app/                  # Next.js App Router
├── server/              # サーバーサイドロジック
├── components/           # UIコンポーネント
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
- **Prismaの直接呼び出し禁止** - 必ずServer Actions経由
- Client Components は `@/components/` から import
- Server Actions は `@/server/actions/` を使用

---

## `/src/server` - サーバーサイドロジック

### 構造
```
server/
├── actions/              # Server Actions (機能別ディレクトリ)
│   ├── index.ts          # 一括エクスポート
│   ├── _helpers/         # 内部ヘルパー（外部非公開）
│   │   └── getAuthenticatedUser.ts
│   ├── user/             # ユーザー関連
│   │   ├── index.ts
│   │   ├── getCurrentUser.ts
│   │   └── getMe.ts
│   ├── room/             # ルーム関連
│   │   ├── index.ts
│   │   ├── getRooms.ts
│   │   ├── getRoom.ts
│   │   ├── createRoom.ts
│   │   ├── deleteRoom.ts
│   │   ├── joinLeaveRoom.ts
│   │   └── gameActions.ts
│   └── auth/             # 認証関連
│       ├── index.ts
│       ├── syncUser.ts
│       └── signOut.ts
└── lib/                  # バックエンド専用ライブラリ
    ├── prisma.ts         # Prismaクライアント
    └── supabase/         # Supabase Admin クライアント
```

### Server Actions ルール
- 必ず `'use server'` ディレクティブを使用
- Prisma操作は必ずここに集約
- 認証済みユーザー取得は `_helpers/getAuthenticatedUser` を使用
- クライアントからは `@/server/actions` を import

### インポート例
```typescript
// 推奨: index.ts からの一括インポート
import { createRoom, getRooms, getCurrentUser } from '@/server/actions'

// 特定のアクションのみ
import { getRoomWithUsers } from '@/server/actions/room'
```

---

## `/src/components` - UIコンポーネント

### 構造
```
components/
├── auth/             # 認証コンポーネント
├── game/             # ゲーム関連コンポーネント
├── room/             # ルーム関連コンポーネント
├── ui/               # 汎用UIコンポーネント
└── user/             # ユーザー関連コンポーネント
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

---

## 命名規則

| 対象 | 規則 | 例 |
|-----|-----|-----|
| コンポーネント | PascalCase | `RoomCard.tsx` |
| スタイルファイル | `styles.ts` | `styles.ts` |
| Server Actions | camelCase | `createRoom` |
| 型定義ファイル | camelCase | `room.ts` |
| ヘルパー | camelCase | `getAuthenticatedUser.ts` |
