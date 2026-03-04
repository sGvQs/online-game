# コーディング規約

## ファイル・ディレクトリ名

- **先頭は小文字**: ファイル名・ディレクトリ名は camelCase とし、先頭を小文字にする
- 例: `button.tsx`, `gameScreen.tsx`, `starShieldGame/`, `nullHandGame/`
- 例外: `README.md` 等の慣例的に大文字のものはそのまま

## ディレクトリ構造

- **phases**: ゲームフェーズは `components/game/phases/{gameName}/` に集約
- **shared / common の廃止**: 共通コンポーネントは親ディレクトリにフラット配置
- **Prisma 型**: `types/prisma/` に集約（game, room, user）

## インポート

- パスは実際のファイル名・ディレクトリ名と大文字小文字を一致させる（case-sensitive 対応）
- barrel は必要に応じて使用（例: `shared.ts` で re-export）

## コンポーネント名

- コンポーネント自体（`export function Button`）は PascalCase のまま

## コンポーネント配置

- ゲームコンポーネントは win95Button と同様に、`components/game/{gamePrefix}{ComponentName}/` 形式で game/ 直下に配置する
- ゲーム本体フォルダ（例: nullHandGame）には `index.tsx` と `styles.ts` のみを置き、そのゲーム専用の子コンポーネントは game/ 直下の兄弟フォルダとして外出しする
- 例: `nullHandGame/`（index.tsx, styles.ts）, `nullHandHand3D/`, `nullHandCurrentScores/` など

## 定数とユーティリティの配置

- ゲーム固有の定数は `src/constants/{gameName}/` に配置する（例: `src/constants/nullHandGame/`）
- ゲーム固有のユーティリティは `src/utils/{gameName}/` に配置する（例: `src/utils/nullHandGame/`）
- コンポーネントフォルダ内に constants.ts や utils.ts を置かない
