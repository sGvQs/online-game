/**
 * Star Shield スキル・プログレッション設定
 *
 * 値の調整方法:
 * - このファイルを直接編集して値を変更する
 * - PROGRESSION_DEBUG: 環境変数 NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true でのみ全スキル解放
 */

export { SPECIAL_ATTACK_LEVEL_PARAMS } from './gameConfig'
export type { SpecialAttackLevel } from './gameConfig'

// ============================================
// デバッグモード
// ============================================
/**
 * true: 全スキル解放（開発用）。false: 所持スキルのみ使用可能
 * - 環境変数 NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true でのみ有効化（購入体験のため開発時も通常は false）
 */
export const PROGRESSION_DEBUG = process.env.NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION === 'true'

// ============================================
// 通常攻撃スキル（技の解放）※ Shooter 用
// ============================================
export const NORMAL_ATTACK_UNLOCK_COSTS: Record<string, number> = {
    red: 0, // 初期所持
    blue: 1000,
    pink: 2000,
    yellow_beam: 3000,
    purple: 4000,
    orange: 5000,
}

// ============================================
// 通常攻撃レベル上げ ※ Shooter 用
// 技ごと・段階ごとのコスト。高級技ほど高額。
// ============================================
type LevelUpCosts = Record<2 | 3 | 4 | 5, number>

const createLevelUpCosts = (base: number): LevelUpCosts => ({
    2: base * 1,
    3: base * 2.5,
    4: base * 5,
    5: base * 8,
})

export const NORMAL_ATTACK_LEVEL_UP_COSTS: Record<string, LevelUpCosts> = {
    red: createLevelUpCosts(300),
    blue: createLevelUpCosts(1000),
    pink: createLevelUpCosts(2000),
    yellow_beam: createLevelUpCosts(3000),
    purple: createLevelUpCosts(4000),
    orange: createLevelUpCosts(5000),
}

// ============================================
// 必殺技 ※ Shooter 用（1種類、lv1〜10で規模を制御）
// ============================================
export const SPECIAL_ATTACK_MAX_LEVEL = 10
export const SPECIAL_ATTACK_IDS = ['spread'] as const

export const SPECIAL_ATTACK_UNLOCK_COSTS: Record<string, number> = {
    spread: 500,
}

/** 必殺技レベルアップコスト（2〜10） */
export const SPECIAL_ATTACK_LEVEL_UP_COSTS: Record<2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, number> = {
    2: 1000,
    3: 1500,
    4: 3000,
    5: 3500,
    6: 4000,
    7: 6000,
    8: 9000,
    9: 13000,
    10: 20000,
}

// ============================================
// 星のHPレベル上げ（全役割共通）
// ============================================
export const STAR_HP_LEVEL_UP_COSTS: Record<2 | 3 | 4 | 5, number> = {
    2: 1500,
    3: 3500,
    4: 7000,
    5: 12000,
}

// ============================================
// ヒールスキル ※ Typist 用
// ============================================
export const HEAL_UNLOCK_COST = 3000
export const HEAL_LEVEL_UP_COSTS: Record<2 | 3 | 4 | 5 | 6, number> = {
    2: 4000,
    3: 8000,
    4: 15000,
    5: 30000,
    6: 100000, // 5 -> max
}

// ============================================
// ヒール回復量（実数値・加算）
// ============================================
export const LEVEL_HEAL_RECOVERY: Record<1 | 2 | 3 | 4 | 5 | 6, number> = {
    1: 0.1,
    2: 0.2,
    3: 0.4,
    4: 1.6,
    5: 100,
    6: 100, // max: 全回復 + 全破壊
}
