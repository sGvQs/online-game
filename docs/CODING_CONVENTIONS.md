# コーディング規約

## ファイル・ディレクトリ名

- **画面コンポーネントは index.tsx と styles.ts**: 画面に関するファイルは、`index.tsx`（コンポーネント）と `styles.ts`（スタイル）に統一する。ユニーク性はディレクトリ名で保つ（例: `currentScores/index.tsx`, `currentScores/styles.ts`）
- **先頭は小文字**: ファイル名・ディレクトリ名は camelCase とし、先頭を小文字にする
- 例: `button.tsx`, `gameScreen.tsx`, `starShieldGame/`, `nullHandGame/`, `hand3D/`（common 内）
- 例外: `README.md` 等の慣例的に大文字のものはそのまま

## ディレクトリ構造

game/ 直下は役割ディレクトリのみ:

- **layout/** : app から呼ばれる orchestrator。hooks と連携し phase を切り替える。配置: `layout/{gameName}/`
- **phases/** : 各 phase の UI。配置: `phases/{gameName}/`
- **common/** : 上記以外（ゲーム固有の共有コンポーネント）
  - `common/{gameName}/`: ゲーム固有の共有UI
  - `common/errorHunter/`: Win95 風 UI（win95Button, win95Dialog 等）と ProgressPanel
- **Prisma 型**: `types/prisma/` に集約（game, room, user）

## インポート

- パスは実際のファイル名・ディレクトリ名と大文字小文字を一致させる（case-sensitive 対応）
- barrel は必要に応じて使用（例: `shared.ts` で re-export）

## コンポーネント名

- コンポーネント自体（`export function Button`）は PascalCase のまま

## コンポーネント配置

- **layout**: app から呼ばれる orchestrator は `game/layout/{gameName}/` に配置
- **phases**: フェーズ画面は `game/phases/{gameName}/` に集約
- **common**: 共有コンポーネントは `game/common/` に配置
  - ゲーム固有: `common/{gameName}/`（例: `common/nullHand/hand3D/`, `common/starShield/starVisual/`, `common/errorHunter/win95Dialog/`）

## スタイル

- **ローカル styles のみ**: game 配下の各コンポーネントは、自フォルダ内の `styles.ts` のみを参照する
- **遠隔参照禁止**: 他コンポーネント・他ディレクトリの styles を import しない
- **必須**: 各コンポーネントフォルダには `styles.ts` を配置する（tailwind-variants の tv を使用）
- **インライン style 禁止**: `style={{ color: 'red' }}` 等の直接スタイル指定は禁止
- **例外**: props/state 由来の動的値を CSS に渡す場合のみ、CSS カスタムプロパティの形で許可: `style={{ ['--user-color']: userColor }}`。値の注入のみ可、その他のプロパティ指定は禁止
- **移行先**: 静的スタイルは className および styles.ts の tv で記述。動的値は CSS 変数で受け取り、styles.ts で `var(--xxx)` を用いる

## 定数とユーティリティの配置

- ゲーム固有の定数は `src/constants/{gameName}/` に配置する（例: `src/constants/nullHandGame/`）
- ゲーム固有のユーティリティは `src/utils/{gameName}/` に配置する（例: `src/utils/nullHandGame/`）
- コンポーネントフォルダ内に constants.ts や utils.ts を置かない

## 非ゲーム系コンポーネントのスタイル規約

`auth/`, `dashboard/`, `room/`, `ui/`, `lp/`, `common/`, `decorations/` 配下のコンポーネントも同様に styles が必須。

### ファイル構成方針

- **フォルダ型コンポーネント**（ゲーム系の慣例）: `componentName/index.tsx` + `componentName/styles.ts`
- **フラット型コンポーネント**（非ゲーム系の現状）: `componentName.tsx` + `componentName.styles.ts`（コロケーション）

いずれの場合も `tailwind-variants` の `tv()` でスタイルを定義し、JSX 内の className 文字列は styles からのみ参照する。

### Tailwind v4 canonical class 記法

以下の旧記法・非推奨記法を禁止し、canonical 記法に統一する:

| 旧記法 | canonical |
|---|---|
| `[font-family:var(--font-dot-gothic-16)]` | `font-dot-gothic-16` |
| `[font-family:var(--font-cherry-bomb-one)]` | `font-cherry-bomb-one` |
| `[font-family:var(--font-rubik-puddles)]` | `font-rubik-puddles` |
| `style={{ fontFamily: 'var(--font-xxx)' }}` | 上記 Tailwind クラスに置換 |
| `bg-gradient-to-*` | `bg-linear-to-*` |
| `bg-white/[0.0x]` | `bg-white/x`（例: `bg-white/[0.02]` → `bg-white/2`） |
| `border-white/[0.0x]` | `border-white/x` |

### インライン style の扱い

- **禁止**: 静的な CSS 値の直接記述（例: `style={{ color: 'var(--brand-900)' }}`）
- **禁止**: JS の hover ハンドラ（`onMouseEnter`/`onMouseLeave`）でのスタイル書き換え → Tailwind `hover:` クラスへ移行
- **許可**: props/state 由来の動的値を CSS カスタムプロパティとして注入する場合のみ: `style={{ '--user-color': userColor } as React.CSSProperties}`
