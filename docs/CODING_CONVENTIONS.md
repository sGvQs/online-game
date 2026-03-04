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
