/**
 * StarShieldGame ゲームロジック定数
 */

import type { Difficulty, NormalAttackLevel } from '@/types/starShieldGame'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
import { DINO_SPAWN } from './constants'

// ========== 基本 ==========
export const GAME_DURATION_SECONDS = 90
export const GAME_STATE_THROTTLE_MS = 100

// ========== 恐竜・弾 ==========
/** 座標系: ビューポート基準の正規化座標 (0-1) */
export const DINO_X = DINO_SPAWN.left / 100
export const DINO_Y = 1 - DINO_SPAWN.bottom / 100

/** 弾のスポーン位置オフセット（中心→口方向へ。正規化座標） */
export const BULLET_SPAWN_OFFSET_X = 0.055
export const BULLET_SPAWN_OFFSET_Y = 0.1
/** 弾の向き計算用：恐竜の口がアンカーより下にある分。負の値で弾が下に補正される */
export const BULLET_ORIGIN_Y_OFFSET = -0.025

export const BULLET_SPEED = 0.0008 // 正規化座標/ms（速すぎないように）
export const BULLET_RADIUS = 0.008
export const BULLET_MAX_AGE_MS = 3000

// ========== 隕石 ==========
export const ASTEROID_RADIUS = 0.02

/** 隕石がスポーンから目標まで到達する時間（ms）。短いほど速い。HELL は playersTotalPoints で動的調整 */
export const ASTEROID_DURATION_MS: Record<Exclude<Difficulty, 'HELL'>, number> = {
    EASY: 8000,
    NORMAL: 7000,
    HARD: 6000,
}
export const HELL_ASTEROID_DURATION_BASE = 6000
export const HELL_ASTEROID_DURATION_MIN = 2000

// ========== スポーン ==========
export const SPAWN_X_MIN = 0.0 // 左
export const SPAWN_X_MAX = 1.0 // 右
export const SPAWN_Y_MIN = 0.1 // 下
export const SPAWN_Y_MAX = 0.1 // 上

export const SPAWN_INTERVALS_MS: Record<Difficulty, number> = {
    EASY: 2000,
    NORMAL: 1500,
    HARD: 800,
    HELL: 200,
}

// ========== 難易度別 ==========
export const ASTEROID_HP: Record<Difficulty, number> = {
    EASY: 3,
    NORMAL: 4,
    HARD: 5,
    HELL: 6,
}

export const STAR_HP: Record<Difficulty, number> = {
    EASY: 20,
    NORMAL: 18,
    HARD: 15,
    HELL: 100,
}

/** 単語完了時の広範囲弾数（難易度別・旧仕様。新仕様は SPECIAL_ATTACK_* を使用） */
export const SPECIAL_SPREAD_BULLET_COUNT: Record<Difficulty, number> = {
    EASY: 12,
    NORMAL: 30,
    HARD: 60,
    HELL: 360,
}

/** 必殺技ID → 弾数（難易度非依存） */
export const SPECIAL_ATTACK_BULLET_COUNT: Record<SpecialAttackChoice, number> = {
    spread_small: 12,
    spread_medium: 30,
    spread_large: 60,
    all_destruction: 360,
}
/** 必殺技ID → 広がり角度（度） */
export const SPECIAL_ATTACK_SPREAD_DEG: Record<SpecialAttackChoice, number> = {
    spread_small: 12,
    spread_medium: 12,
    spread_large: 12,
    all_destruction: 150,
}

// ========== HELL専用・必殺技 ==========
/** EASY/NORMAL/HARD の必殺技の広がり角度（度） */
export const SPREAD_DEG_EASY_NORMAL_HARD = 12
/** HELL 必殺技の広がり角度（度） */
export const HELL_SPECIAL_SPREAD_DEG = 150

// ========== 通常攻撃・レベル制 ==========
/** レベル → 通常攻撃（tech=null）時の散弾数 */
export const LEVEL_BULLET_COUNT: Record<NormalAttackLevel, number> = {
    1: 1,
    2: 3,
    3: 9,
    4: 15,
    5: 25,
}
/** レベル別の散弾広がり角度（度） */
export const LEVEL_SPREAD_DEG: Record<NormalAttackLevel, number> = {
    1: 0,
    2: 3,
    3: 8,
    4: 12,
    5: 15,
}

// ========== 技別・レベルスケール ==========
/** 黄: レベル別ダメージ（1発あたり。30本ビームの各々に適用） */
export const LEVEL_YELLOW_DAMAGE: Record<NormalAttackLevel, number> = {
    1: 0.1,
    2: 0.15,
    3: 0.2,
    4: 0.28,
    5: 0.4,
}
/** 青: レベル別減速倍率（隕石に付与。値が小さいほど遅くなる。0.5=半分） */
export const LEVEL_BLUE_SLOW_MULTIPLIER: Record<NormalAttackLevel, number> = {
    1: 0.8,
    2: 0.7,
    3: 0.5,
    4: 0.4,
    5: 0.3,
}
/** 紫: レベル別弾速倍率（bullet.speed に乗算） */
export const LEVEL_PURPLE_SPEED: Record<NormalAttackLevel, number> = {
    1: 1,
    2: 1.2,
    3: 1.4,
    4: 1.6,
    5: 2,
}
/** オレンジ: レベル別反響半径（正規化座標） */
export const LEVEL_ORANGE_CHAIN_RADIUS: Record<NormalAttackLevel, number> = {
    1: 0.08,
    2: 0.1,
    3: 0.12,
    4: 0.15,
    5: 0.18,
}

// ========== 星 ==========
/** 隕石の目標点のランダムオフセット（±） */
export const STAR_TARGET_OFFSET = 0.04
