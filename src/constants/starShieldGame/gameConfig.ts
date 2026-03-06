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
    NORMAL: 10,
    HARD: 20,
    HELL: 100,
}

/** 星HPレベル → 最大HP（スキルでレベルアップ可能。難易度には依存しない） */
export const LEVEL_STAR_HP: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 15,
    2: 20,
    3: 26,
    4: 34,
    5: 45,
}

/** 単語完了時の広範囲弾数（難易度別・旧仕様。新仕様は SPECIAL_ATTACK_* を使用） */
export const SPECIAL_SPREAD_BULLET_COUNT: Record<Difficulty, number> = {
    EASY: 12,
    NORMAL: 30,
    HARD: 60,
    HELL: 360,
}

/** 必殺技ID → 弾数（難易度非依存）。spread は SPECIAL_ATTACK_LEVEL_PARAMS で制御 */
export const SPECIAL_ATTACK_BULLET_COUNT: Record<SpecialAttackChoice, number> = {
    spread: 30,
    all_destruction: 360,
}
/** 必殺技ID → 広がり角度（度）。spread は SPECIAL_ATTACK_LEVEL_PARAMS で制御 */
export const SPECIAL_ATTACK_SPREAD_DEG: Record<SpecialAttackChoice, number> = {
    spread: 12,
    all_destruction: 150,
}

// ========== HELL専用・必殺技 ==========
/** EASY/NORMAL/HARD の必殺技の広がり角度（度） */
export const SPREAD_DEG_EASY_NORMAL_HARD = 12
/** HELL 必殺技の広がり角度（度） */
export const HELL_SPECIAL_SPREAD_DEG = 150

// ========== 必殺技・レベル制 ==========
/** 必殺技のレベル別パラメータ（B: 時間差発射） */
export type SpecialAttackLevelParams = {
    waveCount: number
    bulletsPerWave: number
    spreadDeg: number
    waveDelayMs: number
}

export type SpecialAttackLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export const SPECIAL_ATTACK_LEVEL_PARAMS: Record<SpecialAttackLevel, SpecialAttackLevelParams> = {
    1: { waveCount: 1, bulletsPerWave: 5, spreadDeg: 12, waveDelayMs: 0 },
    2: { waveCount: 1, bulletsPerWave: 12, spreadDeg: 20, waveDelayMs: 0 },
    3: { waveCount: 1, bulletsPerWave: 20, spreadDeg: 35, waveDelayMs: 0 },
    4: { waveCount: 1, bulletsPerWave: 40, spreadDeg: 50, waveDelayMs: 0 },
    5: { waveCount: 1, bulletsPerWave: 60, spreadDeg: 85, waveDelayMs: 0 },
    6: { waveCount: 1, bulletsPerWave: 80, spreadDeg: 135, waveDelayMs: 0 },
    7: { waveCount: 1, bulletsPerWave: 100, spreadDeg: 150, waveDelayMs: 0 },
    8: { waveCount: 2, bulletsPerWave: 100, spreadDeg: 150, waveDelayMs: 80 },
    9: { waveCount: 3, bulletsPerWave: 100, spreadDeg: 150, waveDelayMs: 80 },
    10: { waveCount: 5, bulletsPerWave: 100, spreadDeg: 150, waveDelayMs: 70 },
}

/** 通常攻撃レベル流用（後方互換・all_destruction 用）。新規は SPECIAL_ATTACK_LEVEL_PARAMS を使用 */
export type SpecialSpreadParams = { count: number; spreadDeg: number }

export const LEVEL_SPECIAL: Record<NormalAttackLevel, SpecialSpreadParams> = {
    1: { count: 5, spreadDeg: 12 },
    2: { count: 12, spreadDeg: 20 },
    3: { count: 20, spreadDeg: 35 },
    4: { count: 30, spreadDeg: 55 },
    5: { count: 45, spreadDeg: 85 },
}

// ========== 通常攻撃・レベル制 ==========
/** レベル → 通常攻撃（tech=null）時の散弾数（基本ダメージは変えず、弾数のみ緩やかに増加） */
export const LEVEL_BULLET_COUNT: Record<NormalAttackLevel, number> = {
    1: 1,
    2: 3,
    3: 6,
    4: 12,
    5: 15,
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
/** 黄: 1発あたりのダメージ（30本ビームの各々に適用）。基本ダメージはレベルで変わらない */
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
    2: 0.5,
    3: 0.2,
    4: 0.1,
    5: 0.01,
}
/** 紫: 球サイズ倍率（BULLET_RADIUS に乗算）。基本ダメージはレベルで変わらない */
export const LEVEL_PURPLE_SIZE: Record<NormalAttackLevel, number> = {
    1: 1,
    2: 2,
    3: 4,
    4: 8,
    5: 16,
}
/** ピンク: 1発撃ちあたりの弾数（円弧軌道。レベルで増加） */
export const LEVEL_PINK_COUNT: Record<NormalAttackLevel, number> = {
    1: 5,
    2: 6,
    3: 7,
    4: 8,
    5: 9,
}

/** オレンジ: 連鎖範囲（正規化座標。固定） */
export const ORANGE_CHAIN_RADIUS = 0.25
/** オレンジ: ダメージ倍率（直撃・連鎖の両方に適用）。基本ダメージはレベルで変わらない */
export const LEVEL_ORANGE_DAMAGE: Record<NormalAttackLevel, number> = {
    1: 1,
    2: 1.2,
    3: 1.5,
    4: 2,
    5: 2.5,
}
// ========== 星 ==========
/** 隕石の目標点のランダムオフセット（±） */
export const STAR_TARGET_OFFSET = 0.04
