# Star Shield プログレッション設計

## 概要

ユーザーIDに紐づく**総合typing数**（Star Shield のみ）を通貨とし、スキル解放・レベルアップをショップで購入する仕組み。

**通貨の棲み分け**
- **破壊数** → ランキング用（既存・今回変更なし）
- **typing数** → スキルアップ用通貨（ショップで消費）

---

## 1. 総合typing数（通貨）

### 定義
- **userId** に紐づく累積値
- **Star Shield のみ**加算（他ゲームは干渉しない）

### 加算タイミング
- 正解1文字打鍵ごとに +1（fire イベント発火分）
- マッチ終了時に fireCount 相当を加算

### 保存
- テーブル: `star_shield_user_progress` など
- カラム例: `userId`, `totalTypingCount`, `updatedAt`

---

## 2. 役割別の設定・所持

### ルール
| 役割 | 設定できるもの | 解放していないと使えない |
|------|----------------|--------------------------|
| **Typist** | ヒールスキルのみ | Typist がヒールスキルを解放していないと使用不可 |
| **Shooter** | ヒール以外（通常攻撃・必殺技） | Shooter が該当スキルを解放していないと使用不可 |

- Typist はヒールのみ購入・設定
- Shooter は通常攻撃・必殺技を購入・設定
- 各プレイヤーは自分の役割で使うスキルを自分の通貨で購入する

---

## 3. ショップで買えるもの

### ショップUI
- **Star Shield ゲーム内**に配置
- **別ページ**として分離（例: `/game/[roomId]/star-shield/skill` または タイトルからの導線）

### A. 通常攻撃スキル（技の解放）※ Shooter 用

**red を新規定義**: 従来の「ふつう（null）」を廃止し、red（赤い球）として TECHNIQUES に追加。散弾で、レベルごとに弾数が増える。**初期所持**（スタンダードなので無料）。

| スキルID | 名前 | 消費typing数 | 備考 |
|----------|------|--------------|------|
| red | 赤い球 | 0（初期所持） | 散弾、lv1から |
| blue | 青い球 | 1000 | 減速効果で実戦では強く感じる |
| yellow_beam | 黄色いビーム | 3000 |
| purple | 紫の球 | 500 | 貫通だが単体ダメージは控えめ |
| orange | オレンジの球 | 5000 |

### B. 通常攻撃のレベル上げ ※ Shooter 用
- **技ごとに独立**（共通化しない）
- **段階ごとにコストが高くなる**
- **高級技（orange など）のレベル上げは非常に高額**

### C. 必殺技（単語完了時）※ Shooter 用
- **共通化**（1回購入で使用可能）
- 必殺技を1つも持っていない場合、**単語完了時は何もしない**
- **all_destruction（全破壊）はショップにない** → ヒール lv max でのみ獲得（後述）

| スキルID | 名前 | 消費typing数（案） |
|----------|------|-------------------|
| spread_small | 小規模 | 20 |
| spread_medium | 中規模 | 50 |
| spread_large | 大規模 | 100 |

### D. ヒールスキル（単語完了時）※ Typist 用
- **必殺技と同じタイミングで発動**（単語完了時）
- **必殺技とヒールは両方発動**（両方所持・選択していれば1単語で両方発動）
- **レベル 1〜5 + max** の6段階
- **lv max で全破壊を付与**（全破壊はヒール経由でしか手に入らない隠しスキル）

#### 回復量（実数値・加算）

- 単位は比率（%）ではなく**実数値**
- 現在HPに対して加算される（例: HP 1 のとき 0.1 回復 → 1.1 になる）
- 最大HPを超えた分は打ち切り（上限あり）

| レベル | 回復量 | 備考 |
|--------|--------|------|
| lv1 | 0.1 | ちょっと回復 |
| lv2 | 0.2 | |
| lv3 | 0.4 | |
| lv4 | 1.6 | |
| lv5 | 1.0 | **全回復** |
| lv max | 1.0 + 全破壊 | **全回復 + 全隕石破壊** |

#### ヒールのレベル上げコスト（案）
| レベル | 消費typing数 |
|--------|--------------|
| 解放（lv1） | 3000 |
| 1→2 | 4000 |
| 2→3 | 8000 |
| 3→4 | 15000 |
| 4→5 | 30000 |
| 5→max | 100000 |

---

## 4. 全破壊（all_destruction）について

- **ショップでは購入不可**
- **ヒール lv max でのみ獲得**
- 単語完了時に Typist がヒール lv max を選択していれば:
  - 星が全回復
  - 画面上の全隕石を破壊（既存 all_destruction と同等の効果）
- 隠しスキル的な要素として、ヒールの究極形態に統合

---

## 5. 購入履歴

### テーブル例: `star_shield_purchase_history`

```
- id
- userId
- purchaseType: 'SKILL_UNLOCK' | 'LEVEL_UP'
- targetSkillId?: string      // red, blue, spread_medium, heal, ...
- targetLevel?: number        // LEVEL_UP の場合（2,3,4,5,6=max）
- typingCost: number
- totalTypingBefore?: number
- createdAt
```

---

## 6. 所持状態の保存

### テーブル案

- `star_shield_user_progress`: userId, totalTypingCount
- `star_shield_user_normal_attacks`: userId, techniqueId（red, blue, ...）, level（1–5）
- `star_shield_user_special_attacks`: userId, specialAttackId（spread_small, spread_medium, spread_large のみ。all_destruction は含まない）
- `star_shield_user_heal_skills`: userId, level（1–6。6=max）。解放時 lv1、レベル上げで 2–6
- `star_shield_purchase_history`: 購入履歴

---

## 7. データフロー（概略）

```
[ゲームプレイ] Star Shield
  → 正解打鍵 → fireCount
  → マッチ終了 → totalTypingCount に fireCount 加算

[ショップページ] Star Shield ゲーム内・別ページ
  → 所持typing数表示
  → 役割に応じた購入可能アイテム一覧
  → 購入 → 減算 + 履歴保存 + 所持スキル更新

[マッチ準備画面]
  → Shooter: 所持している通常攻撃・必殺技のみ選択可能
  → Typist: 所持しているヒール（レベル含む）のみ選択可能
  → 未所持のスキルは選択不可
```

---

## 8. 初期状態（新規ユーザー）

| カテゴリ | 初期所持 | 役割 |
|----------|----------|------|
| 通常攻撃 | red のみ / lv1 | Shooter |
| 必殺技 | なし | Shooter |
| ヒール | なし | Typist |

**必殺技が0のとき**: 単語完了時に**何もしない**（ヒールも0なら何もしない）

---

## 9. 発動タイミング（単語完了時）

- **両方発動**: Shooter が必殺技を、Typist がヒールを、それぞれ所持・選択していれば、**1単語で両方発動**
- 発動順序や同時性は実装時に定義（例: ヒール → 必殺技 の順、または同時）

| Shooter 必殺技 | Typist ヒール | 単語完了時の動作 |
|----------------|---------------|------------------|
| なし | なし | 何もしない |
| あり | なし | 必殺技のみ発動 |
| なし | あり | ヒールのみ発動 |
| あり | あり | **両方発動** |

### ヒール lv max の場合
- 星が全回復
- 全隕石破壊（all_destruction と同等）
- Shooter の必殺技も併せて発動する場合、両方の効果が入る

---

## 10. 実装上の変更点

### techniques 定義
- `null`（ふつう）を廃止
- `red` を追加（散弾、LEVEL_BULLET_COUNT / LEVEL_SPREAD_DEG 相当のレベル効果）

### 必殺技の分割
- Shooter 用: spread_small, spread_medium, spread_large の3種
- all_destruction: ヒール lv max に統合（ショップには出さない）

### 役割選択画面
- Shooter: 通常攻撃・必殺技の選択 UI（所持スキルのみ表示）
- Typist: ヒールの選択 UI（所持レベルを選択）
- 役割ごとに表示する項目を分離

### ショップページ
- Star Shield ゲーム内に新規ページとして追加
- タイトル画面 or 役割選択前から導線を設ける

### 難易度解放の廃止
- 現行の「難易度で技解放」を廃止し、通貨ベースに統一

---

## 11. 定数例（ヒール回復量）

```ts
/** ヒールレベル別回復量（実数値。現在HPに加算。maxHP でキャップ） */
export const LEVEL_HEAL_RECOVERY: Record<1 | 2 | 3 | 4 | 5 | 6, number> = {
  1: 0.1,
  2: 0.2,
  3: 0.4,
  4: 1.6,
  5: 1.0,   // 全回復
  6: 1.0,   // max: 全回復 + 全破壊（回復量は 1.0、効果に全破壊が付与）
}
```

---

## 12. 次のステップ（実装時）

- [ ] `red` を techniques に追加、`null` 廃止
- [ ] 必殺技から all_destruction を削除（Shooter ショップ）
- [ ] ヒール lv max に全破壊効果を付与
- [ ] Prisma スキーマ追加
- [ ] マッチ終了時の typing 加算処理
- [ ] ショップ API（購入・一覧・所持状態）
- [ ] ショップページ（Star Shield 内・別ページ）
- [ ] techniqueUnlock を「所持スキル」ベースに変更
- [ ] 役割選択画面を役割別に分離
- [ ] 単語完了時のヒール発動ロジック追加（両方発動対応）
- [ ] gameConfig の level 参照を「選択中技のレベル」に変更
