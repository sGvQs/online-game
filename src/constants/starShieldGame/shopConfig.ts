/**
 * Star Shield ショップ・プログレッション設定
 *
 * 値の調整方法:
 * - このファイルを直接編集して値を変更する
 * - 開発時は PROGRESSION_DEBUG = true で全スキル解放
 * - 本番では PROGRESSION_DEBUG = false にすること
 */

// ============================================
// デバッグモード
// ============================================
/**
 * true: 全スキル解放（開発用）。false: 所持スキルのみ使用可能
 * - 開発時は NODE_ENV=development で自動的に true
 * - 環境変数 NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true で本番でも強制的に有効化可能
 */
export const PROGRESSION_DEBUG =
    process.env.NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION === 'true' ||
    process.env.NODE_ENV === 'development'

// ============================================
// 通常攻撃スキル（技の解放）※ Shooter 用
// ============================================
export const NORMAL_ATTACK_UNLOCK_COSTS: Record<string, number> = {
    red: 0, // 初期所持
    blue: 1000,
    yellow_beam: 3000,
    purple: 500,
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
    red: createLevelUpCosts(30),
    blue: createLevelUpCosts(50),
    yellow_beam: createLevelUpCosts(80),
    purple: createLevelUpCosts(80),
    orange: createLevelUpCosts(240),
}

// ============================================
// 必殺技 ※ Shooter 用
// ============================================
export const SPECIAL_ATTACK_MAX_LEVEL = 10
export const SPECIAL_ATTACK_IDS = ['spread_small', 'spread_medium', 'spread_large'] as const

export const SPECIAL_ATTACK_UNLOCK_COSTS: Record<string, number> = {
    spread_small: 20,
    spread_medium: 50,
    spread_large: 100,
}

/** 必殺技レベルアップコスト（2〜10） */
export const SPECIAL_ATTACK_LEVEL_UP_COSTS: Record<2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, number> = {
    2: 30,
    3: 60,
    4: 120,
    5: 240,
    6: 400,
    7: 600,
    8: 900,
    9: 1300,
    10: 2000,
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
    5: 1.0,
    6: 1.0, // max: 全回復 + 全破壊
}
