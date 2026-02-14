# 【新規開発要件】リアルタイム心理戦ゲーム「NULL HAND」の実装

## 1. プロジェクト概要と世界観
Next.js (App Router) + Supabase + Prisma を使用したマルチプレイゲームプラットフォームに、新しいミニゲームを追加します。

* **ゲーム名**: NULL HAND (じゃんけんをベースにした心理戦ゲーム)
* **世界観・UI**: 初代PlayStationのパズルゲーム『I.Q (Intelligent Qube)』のような、暗闇、冷徹、無機質、幾何学的なデザイン。
* **3D要素**: `@react-three/fiber` を用いて 手（✊、✌️、✋）を表現し、暗闇に浮かび上がるように描画します。

## 2. ルーティングと基本システム
以前作成した「Error Hunter」というゲームと同じ基盤・ルーティングを踏襲します。

* **待機画面**: `/room/[roomId]` (ここにゲーム選択一覧があり、ホストが選ぶと全員が遷移する)
* **ゲーム画面**: `/game/[roomId]/null-hand`
* **通信仕様**: Supabase Realtime を使用しますが、**ペイロードは一切信用せず、変更の「シグナル」としてのみ使用**します。シグナルを受信したら必ず Server Action を経由して Prisma から最新データを取得（再検証）してください。

## 3. ゲームフローとタイムリミット（ターン制）
参加人数分ターンを回し、各ターンで1人が「ホスト」、残りが「ゲスト」となります。
各フェーズには**制限時間（`phaseEndsAt`）**を設け、時間切れの場合は自動的にデフォルトの手が選ばれるか、次のフェーズへ強制移行します。

### フェーズ進行（1ターン内）
1. **SETUP (ホストの策略フェーズ)**
   * **ホストのみ**: 自分の過去の対戦統計（よく出す手、手を変える確率）を確認する。
   * 「仮置きの手（✊、✌️、✋）」を選択する。
   * ユーザーを騙すための「嘘（Fake）」の対象を1つ選ぶ。（例：仮置きの手を偽装する、確率の数字を偽装する、よく出す手を偽装する）。
   * 完了すると SHOWCASE へ。
2. **SHOWCASE (情報の開示と確認フェーズ)**
   * **全員**: ゲストの画面に、ホストの「仮置きの手」と「統計データ（嘘が混じっている可能性がある）」が3D表現と無機質なテキストで表示される。
   * ゲストは情報を確認し「CONFIRM（確認）」ボタンを押す。全員押すか時間切れで次へ。
3. **FINAL_DECISION (ホストの最終決定フェーズ)**
   * **ホストのみ**: ゲストの心理を読み、自分の手を「変える」か「そのまま」か最終決定する（裏側で確定させるためゲストには見せない）。
4. **BATTLE (ゲストの手入力〜リザルトフェーズ)**
   * **ゲスト**: 最終的な自分の手を決定する。
   * 全員が決定するか時間切れになった瞬間、ホストの本当の手が公開され、勝敗判定が行われる。

## 4. データベース設計 (Prisma)
既存の `Room`, `Match` テーブルを拡張・連携し、以下の構造で実装してください。

```prisma
// 既存のMatchテーブル（ゲームの全体進行を管理）
model Match {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  roomId      String   @map("room_id") @db.Uuid
  gameType    String   @map("game_type") // 今回は "DECEPTION_QUBE"
  status      String   @default("WAITING") // WAITING, PLAYING, FINISHED
  
  jankenEvents JankenEvent[]
  // ...他リレーション
}

// 1ターンの状態を管理するテーブル
model JankenEvent {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  matchId          String   @map("match_id") @db.Uuid
  currentHostId    String   @map("current_host_id") @db.Uuid
  turnNumber       Int      @default(1) @map("turn_number")
  
  // 状態管理（SETUP -> SHOWCASE -> FINAL_DECISION -> BATTLE -> RESULT）
  phase            String   @default("SETUP")
  phaseEndsAt      DateTime @map("phase_ends_at") // フェーズの制限時間
  
  // 手の情報
  initialHand      String?  @map("initial_hand")  // ホストが最初に選んだ手
  finalHostHand    String?  @map("final_host_hand")// ホストが最終的に決めた手
  
  // 嘘（デセプション）の設定
  // NONE, INITIAL_HAND, CHANGE_RATE, FAVORITE_HAND
  fakeTarget       String   @default("NONE") @map("fake_target") 
  
  match            Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  @@map("janken_events")
}

// 統計データを蓄積するテーブル（ホストの傾向分析用）
model JankenLog {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  initialHand  String   @map("initial_hand")
  finalHand    String   @map("final_hand")
  matchId      String   @map("match_id") @db.Uuid
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId, initialHand]) // 高速な集計のための複合インデックス
  @@map("janken_logs")
}
```

## 5. 依頼内容（実装ステップ）
まずは基盤となる以下の部分のコードを提示してください。

Prisma スキーマの更新と、DB型定義。

Server Actions (actions/janken.ts):

startJankenMatch(roomId): マッチと最初のターンの JankenEvent を生成し、phaseEndsAt を設定する処理。

getHostStats(userId): JankenLog を集計し、「手を変える確率」と「よく出す手」を計算して返す処理。

UI/UXの基盤 (React Three Fiber):

@react-three/fiber を用いて、（✊、✌️、✋）を暗闇に描画し、I.Q風の無機質なテキスト(tailwind-variants を使用)をオーバーレイ表示する基本コンポーネント構成。

リアルタイム進行のフック (useJankenMatch.ts):

Supabaseのシグナルを受信し、フェーズが切り替わった際に最新の JankenEvent データを取得・同期する処理。