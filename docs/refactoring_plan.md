# ゲーム状態管理のリファクタリングとBroadcast移行計画

作成日: 2026-02-11
対象コンポーネント: `src/components/game/GamePageClient`, `src/components/game/ErrorHunterGame`, `src/hooks/useErrorHunter.ts`

## 1. 現状のアーキテクチャ分析

### A. `useErrorHunter` (Hook)
- **責務**: "Error Hunter" ゲーム固有のロジック管理。
- **状態 (State)**:
  - `phase` ('TITLE', 'WAITING', 'APPEARING', 'RESULT'): ゲーム全体の進行状況（フェーズ）。
  - `match`: 現在の試合データ（エラーイベントを含む）。
  - `progress`: 全体の進行状況（スコア、閉じた数）。
  - `isProcessing`: アクション実行中のローディング状態。
- **リアルタイム通信**:
  - `error_events` (INSERT, UPDATE) と `matches` (UPDATE) を購読。
  - `closedBy` イベントの更新時に `error_events` を楽観的に更新。
  - WAITING -> APPEARING への遷移に `appearanceAt` を使用したタイマーロジックを使用。

### B. `ErrorHunterGame` (Container Component)
- **責務**: ゲーム画面の描画とデータ取得のオーケストレーション。
- **状態 (State)**:
  - `room`: ルームデータのローカルコピー（`room_users` の購読により同期）。
  - `waitProgress`: 待機画面のアニメーション状態。
  - `winnerComment`: 勝者のコメント取得用状態。
- **リアルタイム通信**:
  - `room_users` (UPDATE) を購読し、ルームデータ（準備完了状態）をリフレッシュ。
- **課題**:
  - **ルームレベル** のロジック（準備完了状態、ルームユーザー更新）を扱っており、他のゲームで同様のロジックが必要になった場合に重複する。
  - 「勝者のコメント」取得ロジックがプレゼンテーション層に混在している。

### C. `GamePageClient` (Presentational/Layout Component)
- **責務**: 共通レイアウト、タイトル画面、初期化シーケンスの提供。
- **状態 (State)**:
  - `initProgress`: 「起動中」のアニメーション状態。
  - `isInitializing`: 起動シーケンスの制御。
  - `internalShowTitle`: タイトルモーダルの表示制御。
  - `isTogglingReady`: 準備完了ボタンのローディング状態。
- **リアルタイム通信**:
  - `rooms` (UPDATE) を購読し、ナビゲーション（ゲーム変更/終了など）を処理。
- **課題**:
  - 純粋に視覚的な「起動」ロジックと、重要なルームナビゲーションロジック（ルーム更新時の `handlePayload`）が混在している。
  - `readyCount` の計算ロジックなどが重複している可能性がある。

---

## 2. 特定された問題点 (Pain Points)

1.  **分散したリアルタイムロジック**:
    - `useErrorHunter` は `error_events` と `matches` を監視。
    - `ErrorHunterGame` は `room_users` を監視。
    - `GamePageClient` は `rooms` を監視。
    - これにより、ユーザーごとに3つの個別のWebSocket接続（またはチャンネル）が作成され、負荷と複雑さが増大している。

2.  **状態同期の問題**:
    - `useErrorHunter` は、ペイロードや統一されたストアに純粋に依存する代わりに、`INSERT` イベント時に手動でデータを再取得している。
    - `useErrorHunter` 内の `match` 状態更新ロジックが複雑（ネストされた `map` 処理）で、バグ（ケーシングの問題など）が発生しやすい。

3.  **レイテンシー（遅延）**:
    - 現在のフローは `クライアントA クリック -> Server Action (DB書き込み) -> Realtime (Postgres Changes) -> クライアントB 更新` という流れ。
    - このラウンドトリップには数百ミリ秒かかることがあり、反射神経を要するゲームとしては「もっさり」感につながる。

---

## 3. リファクタリング提案

### ステップ 1: ルームロジックの集約 (`useGameRoom`)
カスタムフック `useGameRoom` を作成し、以下を処理させる:
- ルームデータの購読 (`rooms` テーブル)。
- ルームユーザーデータの購読 (`room_users` テーブル)。
- 準備完了状態の切り替え (Toggle Ready)。
- ナビゲーションロジック（ゲーム終了/変更時のリダイレクト）。

**メリット**: "ルーム" ロジックを特定の "ゲーム" ロジックから分離できる。`ErrorHunterGame`（および将来のゲーム）は、ロビー/サイドバー部分に `useGameRoom` を利用するだけで済む。

### ステップ 2: `useErrorHunter` ロジックの最適化
- 状態更新を簡素化する。
- 再購読のために `initialMatchId` に厳密に依存するのをやめる（可能な場合）。
- 複雑な状態遷移（イベント配列の更新など）には、**Reducer** や厳密に型定義されたヘルパー関数を使用する。

### ステップ 3: Supabase Broadcast への移行（高頻度イベント用）
高頻度なゲームイベント（エラーのクリックやカーソル移動など）について、`postgres_changes` から移行する。

**Broadcast を使用した提案フロー:**
1.  **ゲームイベント**: 単一のチャンネル `game_room_${roomId}` を使用。
2.  **アクション**: ユーザー/ホストがアクション（ゲーム開始、エラークリック）をトリガー。
3.  **Broadcast**:
    - クライアント（またはEdge Function経由）がイベントをブロードキャスト:
      - `type: 'GAME_START', payload: { matchId, appearanceAt }`
      - `type: 'ERROR_CLICKED', payload: { eventId, userId }`
4.  **楽観的UI (Optimistic UI)**:
    - クライアントはブロードキャストを即座に受信し、UIを更新（エラーを非表示、タイマー開始）。
    - **注**: 「スコア」や「勝者」の信頼できる情報源（Source of Truth）は依然としてDB。
    - **フォールバック**: `postgres_changes` リスナーは、状態の一貫性を保証するための「確認用」チャンネルとして残す（結果整合性）。

## 4. 実装計画

1.  **`useGameRoom` の抽出**:
    - `rooms` と `room_users` の購読処理を `GamePageClient`/`ErrorHunterGame` からこのフックに移動。
    - `{ room, members, isReady, toggleReady }` を返すようにする。

2.  **`GamePageClient` のリファクタリング**:
    - 純粋なプレゼンテーションコンポーネントにする。`room` や `members` は props として受け取り、内部でフェッチや購読を行わないようにする。

3.  **`useErrorHunter` への Broadcast 実装**:
    - `channel.on('broadcast', { event: 'error_click' }, ...)` ハンドラーを追加。
    - エラーをクリックした際、Server Action と並行して Broadcast イベントを送信する。

4.  **ドキュメンテーション**:
    - `src/hooks/useErrorHunter.ts` に、デュアルチャンネル戦略（速度のためのBroadcast、真実のためのDB）に関する明確なコメントを追加する。
