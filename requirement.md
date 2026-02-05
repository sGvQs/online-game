1. 実装のゴール (Phase 1)
Next.js (App Router) + Supabase + Prisma を使用し、**「ホストがゲームを選ぶと、ルーム内の全員がそのゲーム画面へリアルタイムに遷移する」**機能を実装したいです。

2. ユーザーフロー
ルーム待機画面 (/room/[roomId])

ホストにだけ「ゲーム選択ボタン（例: ERROR HUNTER）」が表示されている。

ホストが選択すると、全員がそのゲームの待機画面（/game/[roomId]/error-hunter など）へ自動遷移する。

ゲーム待機画面

「ゲーム開始」ボタン（ホストのみ）と「ルームに戻る」ボタンがある。

ホストが「ルームに戻る」を押すと、全員が再び /room/[roomId] に戻る。

3. データベース設計の方針
「どのゲームが選ばれているか」を管理するために、既存の Room モデルを拡張してください。 今の段階では Game モデルという別テーブルは作らず、Room テーブルのカラムで管理したいです。

コード スニペット
model Room {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  // ...既存のカラム
  
  // 追加: 現在選択されているゲームタイプ
  // nullなら「ルーム待機中」、値が入っていれば「そのゲーム画面へ遷移」とみなす
  activeGameType String?  @map("active_game_type") 
  
  // 追加: ゲームの進行状況（待機中、プレイ中など）
  status         String   @default("LOBBY") // LOBBY, PLAYING, FINISHED
}
4. 技術的な要件
Server Actions:

selectGame(roomId, gameType): activeGameType を更新する。

returnToRoom(roomId): activeGameType を null に戻す。

Realtime Subscription (重要):

クライアント側（useEffect）で rooms テーブルの変更を監視する。

activeGameType が変更された検知したら、Next.js の useRouter で適切なパスへ push する。

これにより、誰かが操作した瞬間に全員の画面が切り替わる挙動を実現する。

5. 成果物
以下のコードを提示してください。

Prisma Schema: Room モデルの変更点。

Server Actions: ゲーム選択・ルーム復帰の関数。

Client Component (RoomPage): リアルタイムリスナーを含み、ゲーム選択時に遷移するロジック。

Client Component (GamePage): リアルタイムリスナーを含み、ルームに戻るボタンと、戻る遷移のロジック。

6. 実装のルール
- supabaseのmigrationは使わないこと（管理が大変）
- prismaのmigrationは使うこと
- prismaのmigrationの方で、リアルタイムの設定をすること（add_realtime_settingsを参考に）