# ディレクトリ構造仕様書

## 概要
このドキュメントは、プロジェクトのディレクトリ構造と各フォルダの責務を定義する仕様書です。

---

## ルート構造

```
src/
├── app/          # Next.js App Router（ページ・ルーティング）
├── components/   # UIコンポーネント
├── constants/    # ゲーム固有の定数
├── hooks/        # カスタムフック
├── lib/          # フロントエンド専用ライブラリ（Context等）
├── server/       # サーバーサイドロジック
├── types/        # 型定義
├── utils/        # ユーティリティ関数
├── logHelper.ts  # ログユーティリティ
└── proxy.ts      # Next.js ミドルウェア
```

---

## `/src/app` - Next.js App Router

```
app/
├── api/                        # API Routes
├── auth/
│   └── callback/               # 認証コールバック
├── game/
│   └── [roomId]/
│       ├── error-hunter/       # Error Hunter ゲーム
│       ├── null-hand/          # Null Hand ゲーム
│       └── star-shield/        # Star Shield ゲーム
│           ├── ranking/        # ランキング画面
│           ├── settings/       # 設定画面
│           └── skill/          # スキル・ショップ画面
├── home/                       # ホーム（ダッシュボード）
├── login/                      # ログインページ
├── privacy/                    # プライバシーポリシー
├── ranking/                    # 世界ランキング
├── room/
│   ├── [id]/                   # ルーム詳細
│   └── search/                 # ルーム検索
├── terms/                      # 利用規約
├── globals.css
├── layout.tsx
└── page.tsx
```

### ルール
- 各ページは `page.tsx` で実装
- **Prismaの直接呼び出し禁止** — 必ず Server Actions 経由
- Client Components は `@/components/` から import
- Server Actions は `@/server/actions/` を使用

---

## `/src/server` - サーバーサイドロジック

```
server/
├── actions/
│   ├── _helpers/               # 内部ヘルパー（外部非公開）
│   │   └── getAuthenticatedUser.ts
│   ├── auth/                   # 認証関連
│   ├── game/                   # ゲームロジック
│   │   ├── errorHunterActions.ts
│   │   ├── nullHandActions.ts
│   │   ├── rankingActions.ts
│   │   ├── starShieldActions.ts
│   │   ├── starShieldProgressionActions.ts
│   │   └── starShieldRankingActions.ts
│   ├── home/                   # ホーム関連
│   ├── room/                   # ルーム関連
│   ├── user/                   # ユーザー関連
│   └── index.ts                # 一括エクスポート
└── lib/
    ├── prisma.ts               # Prismaクライアント
    └── supabase/               # Supabase Admin クライアント
```

### Server Actions ルール
- 必ず `'use server'` ディレクティブを使用
- Prisma操作は必ずここに集約
- 認証済みユーザー取得は `_helpers/getAuthenticatedUser` を使用
- クライアントからは `@/server/actions` を import

---

## `/src/components` - UIコンポーネント

```
components/
├── auth/         # 認証コンポーネント
├── common/       # 汎用共有コンポーネント
├── decorations/  # 装飾系コンポーネント
├── game/         # ゲーム関連コンポーネント
│   ├── layout/   # ゲームレイアウト（orchestrator）
│   ├── phases/   # フェーズ別UI
│   └── common/   # ゲーム固有の共有UI
├── home/         # ホーム画面コンポーネント
├── legal/        # 法的文書コンポーネント
├── login/        # ログインコンポーネント
├── lp/           # ランディングページ
├── ranking/      # ランキングコンポーネント
├── room/         # ルーム関連コンポーネント
└── ui/           # 汎用UIパーツ
```

### game/ の構造パターン

```
game/
├── layout/{gameName}/    # app から呼ばれる orchestrator
├── phases/{gameName}/    # 各フェーズのUI
└── common/{gameName}/    # ゲーム固有の共有コンポーネント
```

各コンポーネントフォルダは `index.tsx` + `styles.ts` で構成（`coding-conventions.md` 参照）。

---

## `/src/types` - 型定義

```
types/
├── index.ts          # 一括エクスポート
├── prisma/           # Prismaモデルベースの型（game, room, user）
└── starShieldGame/   # Star Shield 固有の型
```

---

## `/src/lib` - フロントエンド専用ライブラリ

```
lib/
├── *-context.tsx     # React Context（home, loading, sound等）
├── sound-context.tsx
└── utils.ts
```

---

## `/src/constants` と `/src/utils`

```
constants/
├── starShieldGame/   # Star Shield 定数（gameConfig, techniques, shopConfig等）
├── nullHandGame/     # Null Hand 定数
└── errorHunterGame/  # Error Hunter 定数

utils/
└── starShieldGame/   # Star Shield ユーティリティ（collision, physics等）
```

### ルール
- ゲーム固有の定数・ユーティリティはそれぞれのフォルダに配置
- コンポーネントフォルダ内に `constants.ts` / `utils.ts` を置かない

---

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| コンポーネント（export） | PascalCase | `export function RoomCard` |
| ファイル・ディレクトリ | camelCase（先頭小文字） | `roomCard.tsx`, `starShieldGame/` |
| スタイルファイル | `styles.ts` | `styles.ts` |
| Server Actions | camelCase | `createRoom` |
| 型定義ファイル | camelCase | `room.ts` |
