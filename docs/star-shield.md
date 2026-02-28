# 隕石タイピングゲーム（Typing Shoot Match）実装要件

## 1. プロジェクト概要

### コンセプト
**「敵の文字を打つのではなく、味方のセリフがそのまま弾になる」協力型シューティングゲーム**

- 2人専用ゲーム
- タイピング側：キャラクターのセリフをローマ字で打つ（1文字で1発射）
- シューティング側：照準を操作して敵を狙う
- 敵：1種類のみ。接近してくるだけ
- 武器：1種類。特殊効果なし
- リロード：なし

### ゲーム体験の核
プレイヤーは**セリフの長さによって難度が変わる**ことを体感する。短いセリフなら爽快感、長いセリフなら焦り。キャラクターを変えるだけでゲーム性が変わる。

---

## 2. ゲームルール

### 基本ルール
- **制限時間**：90秒
- **敵**：隕石（asteroid）が一定間隔で出現
- **クリア条件**：制限時間内に出現した隕石を全て破壊
- **ゲームオーバー条件**：隕石がプレイヤーに接触、または時間切れで隕石が残っている

### 難度設定（隕石生成ペース）

| 難度 | 生成ペース | イメージ |
|------|----------|--------|
| EASY | 毎秒0.5体 | 優しい、サクサク撃てる |
| NORMAL | 毎秒1体 | バランス型 |
| HARD | 毎秒1.5体 | 焦り、息が合う感覚 |

---

## 3. システムアーキテクチャ

### 設計思想
- **Realtime同期**（Supabase Realtime）：クライアント↔クライアント間でリアルタイムイベント配信
- **判定の一元化**：シューティング側がすべての判定を行う
- **DB最小化**：マッチ終了時のみ結果を保存

### イベントフロー

#### 1. 隕石スポーン
```
サーバー（定期実行）
  → 隕石を生成（毎秒0.5/1/1.5体）
  → broadcast: asteroid_spawned
  → {id: uuid, spawnedAt: timestamp}
```

#### 2. タイピング側
```
プレイヤーが1文字入力
  → broadcast: fire
  → {type: 'fire'}
```

#### 3. シューティング側（判定）
```
fire受信時
  1. 現在の照準座標を取得
  2. 一番近い隕石を検索
  3. その隕石を破壊対象に
  → broadcast: destroy
  → {asteroidId: uuid, destroyedAt: timestamp}
  → ローカルでアニメーション（破壊演出）
```

#### 4. クリア判定
```
destroyedCount === spawnedCount
  → broadcast: match_cleared
  → マッチ終了、結果をDB保存
```

#### 5. ゲームオーバー判定
```
隕石がプレイヤー側に到達（x < 0）
  → broadcast: match_failed
  → {reason: 'CONTACT', asteroidId: uuid}
  → マッチ終了、結果をDB保存
```

---

## 4. データベース設計

### 新規テーブル：TypingShootMatch

```prisma
model TypingShootMatch {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  matchId             String   @map("match_id") @db.Uuid
  shooterId           String   @map("shooter_id") @db.Uuid
  typistId            String   @map("typist_id") @db.Uuid
  
  characterName       String   @map("character_name") // "dinosaur", 将来の複数キャラ対応
  difficulty          String   @default("NORMAL") // EASY, NORMAL, HARD
  
  targetAsteroidCount Int      @default(0) @map("target_asteroid_count") // 出現予定の隕石数（90秒×生成ペース）
  spawnedCount        Int      @default(0) @map("spawned_count") // 実際に出現した隕石数
  destroyedCount      Int      @default(0) @map("destroyed_count") // 破壊した隕石数
  
  startedAt           DateTime @default(now()) @map("started_at")
  endedAt             DateTime? @map("ended_at")
  isCleared           Boolean  @default(false) @map("is_cleared")
  failureReason       String?  @map("failure_reason") // "CONTACT" or "TIMEOUT"
  
  // 統計情報
  accuracyRate        Float?   @map("accuracy_rate") // destroyedCount / spawnedCount
  durationSeconds     Int?     @map("duration_seconds") // ゲーム時間
  
  match Match @relation(fields: [matchId], references: [id], onDelete: Cascade)
  shooter User @relation("TypingShootShooter", fields: [shooterId], references: [id])
  typist User @relation("TypingShootTypist", fields: [typistId], references: [id])
  
  @@unique([matchId, shooterId, typistId])
  @@index([shooterId, isCleared])
  @@index([typistId, isCleared])
  @@map("typing_shoot_matches")
}
```

### 既存テーブルの更新：Match

```prisma
model Match {
  // ... 既存フィールド ...
  
  typingShootMatch TypingShootMatch?
  
  @@map("matches")
}
```

---

## 5. フロントエンド実装

### 画面構成

#### 5.1 シューティング側（Shooter Side）

**画面要素：**
- 背景：宇宙空間（星や隕石が降ってくる）
- 照準：十字カーソル（マウス/タッチで操作）
- 隕石：円形または岩石状。降ってくる＆接近するアニメーション
- UI：
  - 残り時間（カウントダウン）
  - 破壊数 / 出現数（e.g., "45/50"）
  - 難度表示
  - キャラクターセリフ（下部に表示）

**操作：**
- マウス/タッチで照準を動かす
- fireイベント受信時に自動的に一番近い隕石を破壊

**アニメーション（Framer Motion）：**
- 隕石の落下：`created_at`を基準に位置計算
- 破壊時：隕石がスケールダウンして消える＆火の演出
- クリア時：画面全体がフラッシュ or 背景がきらめく

---

#### 5.2 タイピング側（Typist Side）

**画面要素：**
- キャラクター：手描き風の恐竜（立ち絵）
- セリフ：会話ウィンドウに表示
- タイピング入力欄：
  - 次に打つべき文字をハイライト
  - 打った文字：消える or グレーアウト
  - 打つべき文字列：全て表示
- UI：
  - 残り時間（カウントダウン）
  - 破壊数 / 出現数（シューティング側と同期）
  - 難度表示

**操作：**
- キーボード入力（ローマ字）
- 1文字入力で1回fireイベント送信
- 間違った文字は入力不可

**セリフの例（難度別）：**

**EASY:**
```
「ひとつ」
「ふたつ」
「せーの」
「よかった」
```

**NORMAL:**
```
「今まではひとりだった」
「でも今は、きみがいる」
「だから隕石なんてへっちゃらだ」
「一緒に守ろう」
```

**HARD:**
```
「いっぱい来た」
「でもだいじょうぶ」
「きみがいるから」
「もう一回」
```

---

### 5.3 Realtimeイベント設計

```typescript
// イベントペイロード

// 1. asteroid_spawned
{
  type: 'asteroid_spawned',
  data: {
    id: string (uuid),
    spawnedAt: number (timestamp),
    y: number (random spawn position)
  }
}

// 2. fire（タイピング側から）
{
  type: 'fire'
}

// 3. destroy（シューティング側から）
{
  type: 'destroy',
  data: {
    asteroidId: string (uuid),
    destroyedAt: number (timestamp)
  }
}

// 4. match_cleared
{
  type: 'match_cleared',
  data: {
    destroyedCount: number,
    totalSpawned: number,
    durationSeconds: number
  }
}

// 5. match_failed
{
  type: 'match_failed',
  data: {
    reason: 'CONTACT' | 'TIMEOUT',
    failedAsteroidId?: string
  }
}
```

---

## 6. ゲームパラメータ

```typescript
const GAME_CONFIG = {
  // 時間設定
  GAME_DURATION_SECONDS: 90,
  
  // 隕石生成ペース（隕石/秒）
  SPAWN_RATE: {
    EASY: 0.5,
    NORMAL: 1,
    HARD: 1.5
  },
  
  // 隕石の移動速度
  ASTEROID_SPEED_PX_PER_MS: 0.2, // pixels per millisecond
  
  // シューティング側の照準範囲（判定の甘さ）
  AIM_THRESHOLD_PX: 80, // 照準から80px以内の隕石を対象
  
  // アニメーション
  DESTROY_ANIMATION_DURATION_MS: 300,
  EXPLOSION_PARTICLE_COUNT: 12
}
```

---

## 7. クライアント側の計算

### 隕石の位置計算

各クライアントで独立して計算（同期不要）：

```typescript
// クライアント側
const calculateAsteroidX = (asteroid: Asteroid, now: number): number => {
  const elapsedMs = now - asteroid.spawnedAt;
  const x = GAME_CONFIG.SCREEN_WIDTH - (elapsedMs * GAME_CONFIG.ASTEROID_SPEED_PX_PER_MS);
  return x;
};

// 隕石がプレイヤーに到達したか判定（タイピング側が実行）
if (calculateAsteroidX(asteroid, Date.now()) < 0) {
  // ゲームオーバー
}
```

### 一番近い隕石の検索（シューティング側）

```typescript
const findNearestAsteroid = (aim: {x, y}, asteroids: Asteroid[], now: number): Asteroid | null => {
  const activeAsteroids = asteroids.filter(a => !a.destroyedAt);
  
  return activeAsteroids
    .filter(a => {
      const ax = calculateAsteroidX(a, now);
      const distance = Math.hypot(aim.x - ax, aim.y - a.y);
      return distance < GAME_CONFIG.AIM_THRESHOLD_PX;
    })
    .sort((a, b) => {
      const distA = Math.hypot(aim.x - calculateAsteroidX(a, now), aim.y - a.y);
      const distB = Math.hypot(aim.x - calculateAsteroidX(b, now), aim.y - b.y);
      return distA - distB;
    })[0] || null;
};
```

---

## 8. キャラクター設定

### 恐竜（Dinosaur）

**性格：**
- 可愛い、ちょっとアホっぽい
- でも時々大人びている
- 否定しない
- 基本スタンスは「一緒にやろう」

**笑い方：** へへ

**呼び方：** きみ

**セリフの設計原則：**
- EASY：短くて楽しい（4-6文字）
- NORMAL：中程度で感情がある（10-20文字）
- HARD：長くてエモい（20-30文字以上）

**ゲーム終了時のセリフ：**

クリア時：
```
「これで大丈夫。きみのおかげだ。へへ。」
```

失敗時：
```
「まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。」
```

---

## 9. テクノロジースタック

### バックエンド
- **Database**：PostgreSQL（既存）
- **ORM**：Prisma（既存）
- **Realtime**：Supabase Realtime（既存）
- **Server**：Node.js（既存フレームワークに準ずる）

### フロントエンド
- **Framework**：Next.js（既存）
- **UI Animation**：Framer Motion（既存、推奨）
- **State Management**：React Hooks + Supabase Realtime
- **Styling**：既存スタイリング方式に準ずる

---

## 10. 実装フェーズ

### Phase 1: コア実装
1. Prismaスキーマ更新（TypingShootMatch テーブル）
2. Realtimeチャネル設定（マッチ作成時）
3. サーバー側：隕石生成ロジック
4. シューティング側：基本画面 + 照準操作
5. タイピング側：基本画面 + 入力処理

### Phase 2: ゲームロジック
1. fireイベント→destroy判定
2. クリア/ゲームオーバー判定
3. 90秒タイマー
4. スコア計算＆DB保存

### Phase 3: ポーランド
1. アニメーション（Framer Motion）
2. エフェクト（破壊演出、パーティクル等）
3. UIの細かい調整
4. キャラクターセリフの微調整

### Phase 4: テスト＆デバッグ
1. ネットワーク遅延時の動作確認
2. エッジケースのテスト
3. ユーザーテスト＆フィードバック

---

## 11. 注意点・設計の背景

### なぜこのアーキテクチャか？

1. **判定をシューティング側に寄せる理由**
   - 銃を持ってるやつが、弾が当たったか決める（自然）
   - ネットワーク遅延の影響を最小化
   - 協力ゲームだから、有利な判定＝ゲーム性の一部

2. **DBに「全fire記録」をしない理由**
   - Realtimeで既に両者が同期している
   - マッチ結果（destroyedCount）で統計に十分
   - スケーラビリティ向上

3. **隕石の位置をクライアント計算する理由**
   - サーバー負荷軽減
   - ズレあって当然の設計（ゲーム的に問題なし）
   - created_atを基準にすれば大体揃う

4. **セリフの長さがゲーム性になる理由**
   - タイピング側：長いセリフ＝打つのに時間がかかる＝敵が近づく
   - シューティング側：長い間隔＝照準を継続維持＝協力感が強まる
   - キャラを変えるだけで難度が変わる＝再利用性が高い

---

## 12. 今後の拡張可能性

- ✅ 複数キャラクター対応（characterNameで管理）
- ✅ リプレイ機能（ゲーム終了時のログ保存）
- ✅ ランキング機能（accuracyRateで競争）
- ✅ デイリーチャレンジ（難度や時間制限の変動）
- ✅ Co-op限定イベント（セリフが時間とともに変わる等）

---

## 13. 参考資料

### 既存スキーマ
- `User`, `Match`, `Room`, `RoomUser`：既存テーブルを活用
- `PointLog`, `MatchScore`：ポイント管理の参考実装

### 世界観設定
別途提供される「名もなき恐竜 World Concept Draft」を参照
- コンセプト軸：不安定な世界、記憶の断片、優しさ
- トーン：重くしすぎない、説明しない、肯定する

---

## 14. チェックリスト

実装完了時に確認すべき項目：

- [ ] TypingShootMatch テーブルが作成されている
- [ ] Realtimeチャネルが正常に動作
- [ ] 隕石が正確に生成・降下している
- [ ] fireイベント送信が機能
- [ ] destroy判定が正確（一番近い隕石を破壊）
- [ ] 90秒タイマーが動作
- [ ] クリア条件が正確に判定
- [ ] ゲームオーバー判定が正確
- [ ] 結果がDBに保存される
- [ ] 両画面が同期している（遅延が許容範囲）
- [ ] アニメーションが滑らか
- [ ] モバイルタッチ対応

---

End of Document