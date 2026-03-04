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
