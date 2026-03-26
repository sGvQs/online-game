# Star Shield ショップ・プログレッション 値調整ガイド

スキル解放コストやヒール回復量など、ゲームバランスを変更したいときに参照するドキュメントです。

---

## 1. デバッグモード

**目的**: 開発中に全スキルを解放し、所持状態に関係なくテストできるようにする。

### 設定方法

| 方法 | 説明 |
|------|------|
| `NODE_ENV=development` | 開発サーバー（`npm run dev`）実行時は自動的に有効 |
| `NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true` | 環境変数で本番でも強制的に全スキル解放 |

### 変更箇所

- ファイル: `src/constants/starShieldGame/shopConfig.ts`
- 定数: `PROGRESSION_DEBUG`

```ts
export const PROGRESSION_DEBUG =
    process.env.NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION === 'true' ||
    process.env.NODE_ENV === 'development'
```

### 手順

1. `.env.local` に `NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true` を追加 → 本番ビルドでも全解放
2. 無効にしたい場合は削除または `false` に変更
3. 変更後は dev サーバーを再起動（環境変数はビルド時に埋め込まれるため）

---

## 2. 通常攻撃スキル（技の解放）※ Shooter 用

**目的**: 各通常攻撃を解放するために必要な typing 数を設定する。

### 変更箇所

- ファイル: `src/constants/starShieldGame/shopConfig.ts`
- 定数: `NORMAL_ATTACK_UNLOCK_COSTS`

| スキルID | デフォルト | 説明 |
|----------|------------|------|
| red | 0（初期所持） | 赤い球・散弾 |
| blue | 1000 | 青い球・減速 |
| yellow_beam | 3000 | 黄色いビーム |
| purple | 500 | 紫の球・貫通 |
| orange | 5000 | オレンジの球・連鎖 |

### 手順

1. `shopConfig.ts` を開く
2. `NORMAL_ATTACK_UNLOCK_COSTS` の各値を編集
3. 保存 → HMR で即反映

---

## 3. 通常攻撃 レベル上げ ※ Shooter 用

**目的**: 技ごと・段階ごとのレベルアップコストを設定する。

### 変更箇所

- ファイル: `src/constants/starShieldGame/shopConfig.ts`
- 定数: `NORMAL_ATTACK_LEVEL_UP_COSTS`
- 形式: `createLevelUpCosts(base)` で lv2→3→4→5 の倍率が決まる

### 倍率

- lv2: base × 1
- lv3: base × 2.5
- lv4: base × 5
- lv5: base × 8

### 手順

1. `createLevelUpCosts` の倍率を変更するか、各技の `base` 値を編集
2. 例: `red: createLevelUpCosts(30)` → lv2=30, lv3=75, lv4=150, lv5=240

---

## 4. ヒールスキル ※ Typist 用

**目的**: ヒールの解放コストとレベルアップコストを設定する。

### 変更箇所

- ファイル: `src/constants/starShieldGame/shopConfig.ts`
- 定数: `HEAL_UNLOCK_COST`, `HEAL_LEVEL_UP_COSTS`

| 項目 | デフォルト |
|------|------------|
| 解放（lv1） | 3000 |
| 1→2 | 4000 |
| 2→3 | 8000 |
| 3→4 | 15000 |
| 4→5 | 30000 |
| 5→max | 100000 |

---

## 6. ヒール回復量

**目的**: 各レベルのヒールが回復する HP 量（実数値・加算）を設定する。

### 変更箇所

- ファイル: `src/constants/starShieldGame/shopConfig.ts`
- 定数: `LEVEL_HEAL_RECOVERY`

| レベル | デフォルト | 備考 |
|--------|------------|------|
| 1 | 0.1 | 少し回復 |
| 2 | 0.2 | |
| 3 | 0.4 | |
| 4 | 1.6 | |
| 5 | 1.0 | 全回復 |
| 6（max） | 1.0 | 全回復 + 全破壊 |

---

## 7. 変更の反映

| 変更タイプ | 反映方法 |
|------------|----------|
| 定数値の編集 | 保存後すぐ反映（HMR） |
| 環境変数の変更 | dev サーバー再起動 |
| 新規定数の追加 | 使用箇所で import を追加 |

---

## 8. ファイル一覧

| ファイル | 内容 |
|----------|------|
| `src/constants/starShieldGame/shopConfig.ts` | 上記すべての定数 |
| `src/utils/starShieldGame/techniqueUnlock.ts` | 解放判定ロジック（`PROGRESSION_DEBUG` 使用） |
| `src/server/actions/game/starShieldProgressionActions.ts` | ショップ API（購入・所持状態） |
