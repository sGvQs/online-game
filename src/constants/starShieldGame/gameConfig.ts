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

/** 隕石がスポーンから目標まで到達する時間（ms）。短いほど速い */
export const ASTEROID_DURATION_MS: Record<Difficulty, number> = {
    EASY: 8000,
    NORMAL: 7000,
    HARD: 6000,
    HELL: 6000,
    ABYSS: 6000, // 波の経過時間で動的に減少する初期値
}

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
    ABYSS: 200,
}

// ========== 難易度別 ==========
export const ASTEROID_HP: Record<Difficulty, number> = {
    EASY: 3,
    NORMAL: 10,
    HARD: 20,
    HELL: 100,
    ABYSS: 100,
}

// ========== ABYSS 専用 ==========
/** 1ウェーブの通常フェーズ時間（秒） */
export const ABYSS_WAVE_DURATION_SECONDS = 90
/** 1秒あたりの隕石到達時間減少量（ms）。80秒後: 6000-80*50=2000ms */
export const ABYSS_SPEED_DECREASE_PER_SECOND = 50
/** 隕石到達時間の下限（ms） */
export const ABYSS_MIN_DURATION_MS = 2000
/** ボス隕石の到達時間（ms）。ゆっくり落下 */
export const ABYSS_BOSS_DURATION_MS = 60000
/** ウェーブごとのボスHP数列 */
export const ABYSS_BOSS_HP_SEQUENCE = [1000, 2000, 3000, 5000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000] as const
/** ABYSS 解放に必要な隕石破壊数 */
export const ABYSS_UNLOCK_THRESHOLD = 500
/** ボス撃破ごとに付与するポイント */
export const ABYSS_POINTS_PER_WAVE = 5

/** ウェーブ番号（1始まり）からボスHPを計算 */
export function getAbyssBossHp(waveNumber: number): number {
    if (waveNumber <= ABYSS_BOSS_HP_SEQUENCE.length) {
        return ABYSS_BOSS_HP_SEQUENCE[waveNumber - 1]!
    }
    return 3000 + (waveNumber - ABYSS_BOSS_HP_SEQUENCE.length) * 1000
}

/** 星HPレベル → 最大HP（スキルでレベルアップ可能。難易度には依存しない） */
export const LEVEL_STAR_HP: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 5,
    2: 10,
    3: 20,
    4: 40,
    5: 100,
}

/** 必殺技ID → 弾数（難易度非依存）。spread は SPECIAL_ATTACK_LEVEL_PARAMS で制御 */
export const SPECIAL_ATTACK_BULLET_COUNT: Record<SpecialAttackChoice, number> = {
    spread: 30,
    all_destruction: 360,
}
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
    1: { waveCount: 1, bulletsPerWave: 30, spreadDeg: 30, waveDelayMs: 0 },
    2: { waveCount: 1, bulletsPerWave: 60, spreadDeg: 60, waveDelayMs: 0 },
    3: { waveCount: 1, bulletsPerWave: 90, spreadDeg: 90, waveDelayMs: 0 },
    4: { waveCount: 1, bulletsPerWave: 120, spreadDeg: 120, waveDelayMs: 0 },
    5: { waveCount: 1, bulletsPerWave: 150, spreadDeg: 150, waveDelayMs: 0 },
    6: { waveCount: 2, bulletsPerWave: 150, spreadDeg: 150, waveDelayMs: 100 },
    7: { waveCount: 3, bulletsPerWave: 150, spreadDeg: 150, waveDelayMs: 100 },
    8: { waveCount: 4, bulletsPerWave: 150, spreadDeg: 150, waveDelayMs: 100 },
    9: { waveCount: 5, bulletsPerWave: 150, spreadDeg: 150, waveDelayMs: 100 },
    10: { waveCount: 10, bulletsPerWave: 300, spreadDeg: 150, waveDelayMs: 100 },
}

// ========== 通常攻撃・レベル制 ==========
/** レベル → 通常攻撃（tech=null）時の散弾数（基本ダメージは変えず、弾数のみ緩やかに増加） */
export const LEVEL_BULLET_COUNT: Record<NormalAttackLevel, number> = {
    1: 1,
    2: 3,
    3: 12,
    4: 50,
    5: 100,
}
/** レベル別の散弾広がり角度（度） */
export const LEVEL_SPREAD_DEG: Record<NormalAttackLevel, number> = {
    1: 0,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
}

// ========== 技別・レベルスケール ==========
/** 黄: 1発あたりのダメージ（30本ビームの各々に適用）。基本ダメージはレベルで変わらない */
export const LEVEL_YELLOW_DAMAGE: Record<NormalAttackLevel, number> = {
    1: 0.1,
    2: 0.4,
    3: 1.6,
    4: 3.2,
    5: 5,
}
/** 青: レベル別減速倍率（隕石に付与。値が小さいほど遅くなる。0.5=半分） */
export const LEVEL_BLUE_SLOW_MULTIPLIER: Record<NormalAttackLevel, number> = {
    1: 0.5,
    2: 0.4,
    3: 0.3,
    4: 0.2,
    5: 0.1,
}
/** 紫: 球サイズ倍率（BULLET_RADIUS に乗算）。基本ダメージはレベルで変わらない */
export const LEVEL_PURPLE_SIZE: Record<NormalAttackLevel, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
}
/** ピンク: 1発撃ちあたりの弾数（円弧軌道。レベルで増加） */
export const LEVEL_PINK_COUNT: Record<NormalAttackLevel, number> = {
    1: 5,
    2: 20,
    3: 40,
    4: 80,
    5: 160,
}

/** オレンジ: 連鎖範囲（正規化座標。固定） */
export const ORANGE_CHAIN_RADIUS = 0.5
/** オレンジ: 直撃から波及する隕石数（レベルで増加） */
export const LEVEL_ORANGE_CHAIN_COUNT: Record<NormalAttackLevel, number> = {
    1: 5,
    2: 10,
    3: 15,
    4: 30,
    5: 60,
}
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
