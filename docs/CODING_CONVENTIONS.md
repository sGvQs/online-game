# コーディング規約

## ファイル・ディレクトリ名

- **先頭は小文字**: ファイル名・ディレクトリ名は camelCase とし、先頭を小文字にする
- 例: `button.tsx`, `gameScreen.tsx`, `starShieldGame/`, `nullHandGame/`, `Hand3D/`（common 内）
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
  - ゲーム固有: `common/{gameName}/`（例: `common/nullHand/Hand3D/`, `common/starShield/StarVisual/`, `common/errorHunter/win95Dialog/`）

## 定数とユーティリティの配置

- ゲーム固有の定数は `src/constants/{gameName}/` に配置する（例: `src/constants/nullHandGame/`）
- ゲーム固有のユーティリティは `src/utils/{gameName}/` に配置する（例: `src/utils/nullHandGame/`）
- コンポーネントフォルダ内に constants.ts や utils.ts を置かない
