# Null Hand ゲーム仕様書

## 1. 概要

「Null Hand」は、ホスト（親）1人に対して複数人のゲスト（子）が挑む、非対称型の心理じゃんけんゲームです。参加ユーザー全員が1回ずつホストを経験するまでを「1試合（Match）」とし、最終的な獲得ポイントで勝敗（順位）を競います。

---

## 2. UI/UXデザイン

- **カラースキーム**: 純黒（`#000000`）と純白（`#FFFFFF`）のハイコントラスト。アクセントにシアン（`#44FFFF`）と赤（`#FF4444`）のみ
- **デザイン言語**: PlayStationの『I.Q』のような冷徹で無機質なソリッドデザイン。サイバーパンク感や過剰なネオンはNG
- **フォント**: 等幅フォント（Monospace）を用いたシステムログ表現
- **3D演出（R3F）**: 手のモデルは発光させず、純白のワイヤーフレームか陰影の強いソリッドなマットホワイト

---

## 3. ゲームフロー

全員が1回ずつホストを担当するまで、CHOICE → BATTLE → RESULT のターンを繰り返します。

```
TITLE
  ↓ 全員READY → ホストがSTART
CHOICE（ホストがSTAY/REVERSEを選択）
  ↓
BATTLE（ゲスト全員が手を選択）
  ↓
RESULT（ターン結果とポイント集計）
  ↓ 全員がホストを経験したら
GAME_OVER（最終結果発表）
  ↓ 終了ボタン
TITLE
```

> **注**: `DEAL` フェーズはDBスキーマ上に存在するが、現在の実装では使用されていない（CHOICE から開始）。

### 各フェーズの詳細

#### TITLE（待機・マッチ開始）
- タイトル画面で全員が「READY」を押して待機
- 世界ランキングの順位とポイントを表示
- 全員の準備完了後、ルームホストが「START」を押してゲーム開始

#### CHOICE（ホストの意思決定）
- システムが「本当の手（REAL）」と「嘘の手（BLUFF）」を自動生成
  - **必ず `REAL` は `BLUFF` に勝つ関係**（例: REAL=グー、BLUFF=チョキ）
- ホストは **STAY**（REALをそのまま出す）か **REVERSE**（BLUFFに変える）かを選択
- ゲスト画面には「ホストの過去の REVERSE RATE（反転確率）」が表示される

#### BATTLE（ゲストの手選択）
- 公開された2つの手（REAL/BLUFF）とホストの REVERSE RATE を参考に、ゲスト全員が手を選択

#### RESULT（ターン結果）
- ホストの最終手と各ゲストの手を公開し、勝敗を表示
- ポイントを集計後、次のホストに交代して CHOICE へ戻る

#### GAME_OVER（最終結果発表）
- 試合の最終ランキングを表示
- 終了ボタンで TITLE に戻る

---

## 4. Binary Reverseシステム

```
システム生成:
  systemRealHand  → 必ず systemBluffHand に勝つ手
  systemBluffHand → 必ず systemRealHand に負ける手

ホストの選択:
  STAY    → finalHostHand = systemRealHand（ゲストに勝てる可能性あり）
  REVERSE → finalHostHand = systemBluffHand（必ずゲストに負ける）

ゲスト参照情報:
  reverseRate: ホストの過去50試合における REVERSE 選択率（%）
```

---

## 5. スコア計算ロジック

> ※ これは**実装に基づく**スコアルールです。

| 状況 | 対象 | 獲得ポイント | 判定条件 |
|------|------|------------|--------|
| **Null Hand（あいこ）** | ホスト | **+5 pt** | `guestCount > 1` かつ**全ゲストがホストと同じ手** |
| **ゲスト勝利** | 勝利した各ゲスト | **+3 pt** | ホストに勝ったゲストが1人以上（人数問わず全員同額） |
| **ホスト完全勝利** | ホスト | **+3 pt** | `guestCount > 1` かつゲスト全員が負けまたはあいこ |
| その他（ゲスト1人のNullHandなど） | — | 0 pt | 上記いずれにも該当しない |

### ポイントの保存先
- **試合内ポイント**: `match_scores` テーブル（MatchScore）に累積
- **世界ランキング**: `monthly_rankings` テーブル（MonthlyRanking）に年月別で加算
- **履歴**: `point_logs` テーブル（PointLog）に記録

---

## 6. DBスキーマ

### JankenEvent（1ターン = 1レコード）

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | UUID | |
| `matchId` | UUID | |
| `currentHostId` | UUID | 今ターンのホストID |
| `turnNumber` | Int | |
| `phase` | String | `CHOICE` / `BATTLE` / `RESULT` / `GAME_OVER` |
| `systemRealHand` | String | `ROCK` / `SCISSORS` / `PAPER` |
| `systemBluffHand` | String | 必ずREALに負ける手 |
| `hostChoice` | String | `STAY` / `REVERSE` |
| `finalHostHand` | String | 実際に出した手（計算結果） |

### GuestHand（ゲストの手 / 1人1レコード）

| カラム | 型 | 説明 |
|--------|-----|------|
| `jankenEventId` | UUID | |
| `userId` | UUID | |
| `hand` | String | `ROCK` / `SCISSORS` / `PAPER` |
| `isConfirmed` | Boolean | |

### JankenLog（統計用）

| カラム | 型 | 説明 |
|--------|-----|------|
| `userId` | UUID | |
| `isHost` | Boolean | |
| `hostChoice` | String | `STAY` / `REVERSE` |
| `isWinning` | Boolean | |
| `matchId` / `jankenEventId` | UUID | |

### その他

| テーブル | 用途 |
|----------|------|
| `null_hand_matches` | マッチ進行状態（currentTurnIndex, totalTurns） |
| `match_scores` | 試合内の個人ポイント累計 |
| `monthly_rankings` | 世界ランキング（年月別） |
| `point_logs` | ポイント変動履歴 |

---

## 7. アーキテクチャ

### Supabase Realtimeの監視構造

```typescript
// janken_events テーブルの INSERT/UPDATE を監視（フェーズ変更検知）
supabase.channel(`null_hand_events_${matchId}`)
  .on("postgres_changes", { event: "INSERT|UPDATE", table: "janken_events" }, handler)

// matches テーブルの INSERT を監視（新しいマッチ開始検知）
supabase.channel(`null_hand_matches_${roomId}`)
  .on("postgres_changes", { event: "INSERT", table: "matches" }, handler)
```

### Server Actions

| 関数 | 説明 |
|------|------|
| `startJankenMatch()` | Match + NullHandMatch + MatchScore初期化 + 最初のJankenEvent（CHOICE）作成 |
| `setHostChoice()` | CHOICE → BATTLE フェーズへ遷移 |
| `setGuestHand()` | ゲスト手入力。全員入力完了で `judgeRound()` 呼び出し |
| `judgeRound()` | スコア付与 + JankenLog記録 + RESULT フェーズへ |
| `markNextRoundReady()` | 全員Ready時に `startNextTurn()` でターン進行 |
| `finishJanken()` | Match終了 + MonthlyRanking更新 + PointLog記録 |
| `getLatestJankenEventWithStats()` | イベント + ホスト統計を一度に取得（Realtime受信後に呼び出し） |

### ファイル構成

```
src/
├── hooks/useNullHand.ts
├── server/actions/game/nullHandActions.ts
├── components/game/
│   ├── layout/nullHandGame/
│   ├── phases/nullHandGame/
│   │   ├── choicePhase/
│   │   ├── battlePhase/
│   │   ├── resultPhase/
│   │   └── gameOverPhase/
│   └── common/nullHand/
├── constants/nullHandGame/index.ts    # カラーパレット定義
└── types/prisma/game.ts
```
