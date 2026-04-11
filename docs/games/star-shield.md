# Star Shield ゲーム仕様書

## 1. 概要

「Star Shield（隕石タイピングゲーム）」は、2人専用の協力型タイピングシューターゲームです。

- **Typist（タイピスト）**: キャラクターのセリフをローマ字で入力。1文字入力するたびに弾が発射され、通貨（typing数）が蓄積される
- **Shooter（シューター）**: 照準を操作して隕石を狙う。Typist の入力に連動して弾が飛ぶ

---

## 2. ゲームルール

### 基本ルール
- 2人専用（Typist 1人 + Shooter 1人）
- 制限時間内に出現する隕石を全て破壊するとクリア
- 隕石がプレイヤーに接触、または時間切れで隕石が残るとゲームオーバー

### 難易度

| 難度 | 隕石スポーン間隔 | 到達時間 | 隕石HP |
|------|----------------|----------|--------|
| EASY | 2000ms | 8000ms | 3 |
| NORMAL | 1500ms | 7000ms | 10 |
| HARD | 800ms | 6000ms | 20 |
| HELL | 200ms | 6000ms | 100 |
| ABYSS | 200ms | 動的 | 100〜（ボスあり） |

**解放条件**:
- HELL: 隕石破壊数 100以上
- ABYSS: 隕石破壊数 500以上

**ABYSS 特殊ルール**:
- ウェーブ制（1ウェーブ=90秒）
- ボス隕石あり（HP: 1000〜指数的増加）
- ボス撃破ごとに +5pt

---

## 3. 役割分担

| 役割 | 操作 | 関連スキル |
|------|------|----------|
| **Typist** | キーボード入力（ローマ字） | ヒール、星のHP |
| **Shooter** | マウス/タッチで照準操作 | 通常攻撃、必殺技 |

---

## 4. 通常攻撃スキル（Shooter用）

1文字入力ごとに発射される弾。Shooter が所持・選択したスキルが使用される。

| スキルID | 名前 | 解放コスト | 特性 |
|----------|------|------------|------|
| `red` | 赤い球 | 0（初期所持） | 散弾（Lvで弾数増加） |
| `blue` | 青い球 | 200 typing | 命中時に隕石を減速 |
| `yellow` | 黄色いビーム | 400 typing | 前方連続30発、高ダメージ |
| `purple` | 紫の球 | 400 typing | 貫通（複数同時攻撃）、Lvでサイズ拡大 |
| `orange` | オレンジの球 | 400 typing | 連鎖攻撃 |
| `pink` | ピンクの球 | 800 typing | 追尾ロケット（二次ベジェ曲線） |

### レベルアップコスト（例）

- 各技ごとに独立したコスト。高級技ほど高額
- 倍率: Lv2×1 / Lv3×2.5 / Lv4×5 / Lv5×8（base値で調整）

---

## 5. 必殺技（Shooter用）

単語完了時（Typist が1単語打ち切った時）に発動。

| スキルID | 説明 | 取得方法 |
|----------|------|----------|
| `spread` | 広範囲散弾（Lv1〜10） | Lv1は自動取得、Lv2以降は購入 |
| `all_destruction` | 360発の全方位攻撃 | ヒール Lv6（max）でのみ自動獲得。ショップでは購入不可 |

### spread レベルアップコスト

| レベル | コスト |
|--------|--------|
| Lv2 | 500 |
| Lv3 | 750 |
| Lv4 | 1,000 |
| ... | ... |
| Lv10 | 5,000 |

---

## 6. ヒールスキル（Typist用）

単語完了時に発動。必殺技と同じタイミングで両方同時に発動する。

**解放コスト**: 500 typing

**回復量（実数値・HPに加算・最大HPでキャップ）**:

| レベル | 回復量 | 備考 |
|--------|--------|------|
| Lv1 | 1 | |
| Lv2 | 2 | |
| Lv3 | 4 | |
| Lv4 | 8 | |
| Lv5 | 100 | 全回復 |
| Lv6（max） | 100 + 全破壊 | 全回復 + all_destruction 獲得 |

**レベルアップコスト**:

| レベル | コスト |
|--------|--------|
| 1→2 | 500 |
| 2→3 | 1,000 |
| 3→4 | 2,000 |
| 4→5 | 3,000 |
| 5→6（max） | 6,000 |

---

## 7. 星のHP（Typist用）

Typist が使用する星（守るべき拠点）の最大HP。レベルで上限が上がる。

| レベル | HP |
|--------|----|
| Lv1 | 15 |
| Lv2 | 20 |
| Lv3 | 26 |
| Lv4 | 34 |
| Lv5 | 45 |

**レベルアップコスト**:

| レベル | コスト |
|--------|--------|
| 1→2 | 500 |
| 2→3 | 1,000 |
| 3→4 | 2,000 |
| 4→5 | 4,000 |

---

## 8. プログレッション・ショップ

### 通貨（typing数）
- **Typist の正解入力1文字 = +1 typing**（他ゲームは干渉しない）
- マッチ終了時に `fireCount` 分を `totalTypingCount` に加算
- userId に紐づく累積値（`star_shield_user_progress.totalTypingCount`）

### ショップURL
- `/game/[roomId]/star-shield/skill`
- タイトル画面（READY/STARTがある画面）から「SKILL」リンクで遷移

### 初期状態（新規ユーザー）

| カテゴリ | 初期値 |
|----------|--------|
| `totalTypingCount` | 0 |
| `starHpLevel` | 1 |
| 通常攻撃 | red Lv1 のみ所持 |
| 必殺技 | spread Lv1 自動取得 |
| ヒール | 未所持 |

### Loadout（装備選択）

ゲーム開始前にSKILL画面で選択。所持スキルのみ選択可能。

| 項目 | 説明 |
|------|------|
| `selectedNormalAttackId` | Shooter が使用する通常攻撃（`red` / `blue` 等） |
| `selectedSpecialAttackId` | Shooter が使用する必殺技（`spread` / `all_destruction`） |
| `selectedHealLevel` | Typist が使用するヒールのレベル（null=使わない） |

---

## 9. DBスキーマ

### プログレッション管理

| テーブル | 説明 | 主要カラム |
|----------|------|----------|
| `star_shield_user_progress` | ユーザーの進行状況 | `totalTypingCount`, `starHpLevel`, `healLevel`, `selectedNormalAttackId`, `selectedSpecialAttackId`, `selectedHealLevel` |
| `star_shield_user_normal_attacks` | 通常攻撃の所持状況 | `techniqueId`（red/blue等）, `level`（1〜5） |
| `star_shield_user_special_attacks` | 必殺技の所持状況 | `specialAttackId`（spread）, `level`（1〜10） |
| `star_shield_purchase_history` | 購入履歴 | `purchaseType`（SKILL_UNLOCK / LEVEL_UP）, `typingCost`, `totalTypingBefore` |

### ゲーム記録

| テーブル | 説明 | 主要カラム |
|----------|------|----------|
| `typing_shoot_matches` | マッチ記録 | `shooterId`, `typistId`, `difficulty`, `isCleared`, `destroyedCount`, `accuracyRate` |
| `star_shield_clear_records` | クリア記録（ランキング・難易度解放判定） | `shooterId`, `typistId`, `destroyedCount`, `difficulty` |

---

## 10. デバッグ・定数変更ガイド

### デバッグモード（全スキル解放）

```typescript
// src/constants/starShieldGame/shopConfig.ts
export const PROGRESSION_DEBUG =
  process.env.NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION === 'true' ||
  process.env.NODE_ENV === 'development'
```

- `NODE_ENV=development`（`npm run dev`）で自動有効
- 本番で有効にする場合: `.env.local` に `NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true` を追加

### 定数ファイル一覧

| ファイル | 内容 |
|----------|------|
| `src/constants/starShieldGame/shopConfig.ts` | スキルコスト、レベルアップコスト、回復量等の全定数 |
| `src/constants/starShieldGame/techniques.ts` | 6種の通常攻撃スキル定義 |
| `src/constants/starShieldGame/gameConfig.ts` | ゲームパラメータ（スポーン間隔、速度等） |
| `src/constants/starShieldGame/dialogues.ts` | 恐竜のセリフ |
| `src/utils/starShieldGame/techniqueUnlock.ts` | スキル所持判定ロジック |
| `src/server/actions/game/starShieldProgressionActions.ts` | ショップAPI（購入・所持状態） |

---

## 11. ファイル構成

```
src/
├── hooks/useStarShield.ts
├── server/actions/game/
│   ├── starShieldActions.ts
│   ├── starShieldProgressionActions.ts
│   └── starShieldRankingActions.ts
├── components/game/
│   ├── layout/starShieldGame/
│   ├── phases/starShieldGame/
│   │   ├── titleScreen/
│   │   ├── roleSelectionScreen/
│   │   ├── skillScreen/           # ショップUI
│   │   ├── playing/
│   │   └── rankingScreen/
│   └── common/starShield/
├── constants/starShieldGame/
└── utils/starShieldGame/
```
