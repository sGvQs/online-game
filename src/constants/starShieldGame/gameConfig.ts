/**
 * StarShieldGame ゲームロジック定数
 */

import type { Difficulty } from '@/types/starShieldGame'
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

/** 単語完了時の広範囲弾数（破壊なし。HELL は全破壊＋照準方向に弾で別扱い） */
export const SPECIAL_SPREAD_BULLET_COUNT: Record<Difficulty, number> = {
    EASY: 12,
    NORMAL: 30,
    HARD: 60,
    HELL: 360,
}

// ========== HELL専用・必殺技 ==========
/** EASY/NORMAL/HARD の必殺技の広がり角度（度） */
export const SPREAD_DEG_EASY_NORMAL_HARD = 12
/** HELL 必殺技の広がり角度（度） */
export const HELL_SPECIAL_SPREAD_DEG = 150
/** HELL 通常攻撃の弾数 */
export const HELL_NORMAL_BULLET_COUNT = 3
/** HELL 通常攻撃の広がり角度（度） */
export const HELL_NORMAL_SPREAD_DEG = 3

// ========== 星 ==========
/** 隕石の目標点のランダムオフセット（±） */
export const STAR_TARGET_OFFSET = 0.04
