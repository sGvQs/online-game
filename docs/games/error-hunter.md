# Error Hunter ゲーム仕様書

## 1. 概要

「Error Hunter（エラーハンター）」は、画面に一斉出現する47個のWindowsエラーモーダルを素早く閉じる、多人数対応の反射神経ゲームです。

- 全員協力で47個のエラーを閉じる「協力型」でありながら、個人の閉じた数で勝敗が決まる「対抗戦」
- 最も多くのエラーを閉じたプレイヤーが勝者
- 参加人数: 2人以上（上限なし）

---

## 2. UI/UXデザイン（Windows 95テーマ）

| 要素 | 仕様 |
|------|------|
| 背景色 | `#008080`（Teal、Win95デスクトップ） |
| UIパーツ背景 | `#c0c0c0`（Win95システムグレー） |
| タイトルバー | `#000080`（濃紺）に白テキスト |
| ボタン | 3D彫刻効果（上左=白ハイライト、右下=グレーシャドウ） |
| フォント | MS Sans Serif / Segoe UI / Tahoma（11px） |

### コンポーネント群

| コンポーネント | 説明 |
|----------------|------|
| `Win95Dialog` | 標準的なWindowsダイアログボックス |
| `Win95Button` | 3D風立体ボタン（押下時に枠線反転） |
| `Win95TitleBarButton` | タイトルバーの×ボタン（赤丸） |
| `Win95ProgressBar` | スキャンライン付きプログレスバー |

---

## 3. ゲームフロー

```
TITLE（ロビー）
  ↓ 全員「準備完了」→ ホストが「ゲーム開始」
WAITING（スキャン待機 / 10〜11秒ランダム）
  ↓ 時刻到達、エラー音（"error"）再生
APPEARING（エラー猛烈ゲーム）
  ↓ 47個全て閉じる
RESULT（勝敗表示）
  ↓ 終了ボタン
TITLE
```

### 各フェーズの詳細

#### TITLE（ロビー）
- ASCII ART で "ERROR HUNTER" を大きく表示
- 各プレイヤーの準備状況を表示（例: 「3/4」）
- 「What's ERROR HUNTER」でゲーム説明を表示
- 全員「準備完了」後、ホストのみ「ゲーム開始」ボタンが有効化

#### WAITING（スキャン待機）
- "System Monitor" ダイアログ風UI
- "Scanning for errors..." + ループするプログレスバー（0→200%）
- 待機時間: ランダム10〜11秒（`startGame` アクションで計算）

#### APPEARING（エラー闘技場）
- 画面上に47個のエラーモーダルをランダム位置（x:20〜80%, y:10〜85%）に配置
- 各モーダルは Win95 風のエラーダイアログ
- 早い者勝ちでクリック → ×ボタンで閉じる
- クローズされたエラーはリアルタイムで全員の画面から消える

#### RESULT（勝敗表示）
- 勝者の名前・顔アイコン・コメントを表示
- 全員分のスコア（閉じた数）を表示

---

## 4. スコア計算

| 項目 | 内容 |
|------|------|
| スコア単位 | 各プレイヤーが閉じたエラー数 |
| 勝者 | スコア最大のプレイヤー |
| 勝者ポイント | **+7 pt**（MonthlyRanking に加算） |

---

## 5. DBスキーマ

### ErrorEvent（1エラー = 1レコード）

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | UUID | |
| `matchId` | UUID | |
| `appearanceAt` | DateTime | エラー出現予定時刻 |
| `closedAt` | DateTime? | クローズ時刻（null=未クローズ） |
| `closedBy` | UUID? | クローズしたユーザーID |
| `positionX` | Float | 画面上の位置（20〜80%） |
| `positionY` | Float | 画面上の位置（10〜85%） |

インデックス: `matchId`、`(matchId, closedAt)`

### 関連テーブル

| テーブル | 用途 |
|----------|------|
| `matches` | マッチ記録（status: WAITING/PLAYING/FINISHED, winnerId） |
| `monthly_rankings` | 世界ランキング（年月別に +7pt 加算） |
| `point_logs` | ポイント変動履歴（`gameType: "ERROR_HUNTER"`, `reason: "MATCH_WIN"`） |

---

## 6. アーキテクチャ

### ハイブリッドRealtime設計（早い者勝ちの実現）

```
クリック発生
  ↓
① Broadcast で即座にUI更新（超低遅延）
  ↓
② saveErrorClickToDb()（await しない / 非ブロッキング）
  ↓ DB側で排他制御
  updateMany({ where: { id: eventId, closedAt: null } })
  → closedAt が null のレコードのみ更新（重複クリック防止）
```

- **Broadcast**: `supabase.channel("error-hunter-broadcast-{roomId}")` → `"click-error"` イベント
- **Postgres Changes**: `error_events` / `matches` テーブルの変更を監視

### Server Actions

| 関数 | 説明 |
|------|------|
| `startGame()` | Match作成 + 47個のErrorEventを一括作成（createMany）+ 待機時間計算 |
| `saveErrorClickToDb()` | エラークリックをDBに保存（排他制御） |
| `checkAutoFinish()` | 未クローズ数が0なら `finishGame()` を呼び出し |
| `finishGame()` | スコア集計 → 勝者決定 → MonthlyRanking更新 → Match終了 |
| `getMatchProgress()` | `closedBy` ごとのスコア集計 |

### 重複クリック防止

```typescript
// closedEventIds (Set) で既クローズIDを管理
// エラーごとに独立チェック（グローバルロック回避）
if (closedEventIds.has(eventId)) return;
```

---

## 7. 音声エフェクト

| タイミング | SE |
|------------|----|
| WAITING → APPEARING 遷移時 | `"error"` |
| ゲーム初期化・リセット時 | `"chime"` |
| 勝者決定時 | `"tada"` |
| Win95Button クリック時 | `"click"` |

---

## 8. ファイル構成

```
src/
├── hooks/useErrorHunter.ts
├── server/actions/game/errorHunterActions.ts
├── components/game/
│   ├── layout/errorHunterGame/
│   ├── phases/errorHunterGame/
│   │   ├── titlePhase/
│   │   ├── waitingPhase/
│   │   ├── appearingPhase/
│   │   └── resultPhase/
│   └── common/errorHunter/
│       ├── win95Dialog/
│       ├── win95Button/
│       ├── win95TitleBarButton/
│       ├── win95ProgressBar/
│       └── progressPanel/
└── constants/errorHunterGame/constants.ts    # ASCII_ART 定義
```
