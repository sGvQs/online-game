/**
 * Star Shield スキル・プログレッション設定
 *
 * 値の調整方法:
 * - このファイルを直接編集して値を変更する
 * - PROGRESSION_DEBUG: 環境変数 NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true でのみ全スキル解放
 */

export { SPECIAL_ATTACK_LEVEL_PARAMS } from "./gameConfig";
export type { SpecialAttackLevel } from "./gameConfig";

// ============================================
// デバッグモード
// ============================================
/**
 * true: 全スキル解放（開発用）。false: 所持スキルのみ使用可能
 * - 環境変数 NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION=true でのみ有効化（購入体験のため開発時も通常は false）
 */
export const PROGRESSION_DEBUG =
	process.env.NEXT_PUBLIC_STAR_SHIELD_DEBUG_PROGRESSION === "true";

// ============================================
// 通常攻撃スキル（技の解放）※ Shooter 用
// ============================================
export const NORMAL_ATTACK_UNLOCK_COSTS: Record<string, number> = {
	red: 0, // 初期所持
	blue: 200,
	pink: 800,
	yellow: 400,
	purple: 400,
	orange: 400,
};

// ============================================
// 通常攻撃レベル上げ ※ Shooter 用
// 技ごと・段階ごとのコスト。高級技ほど高額。
// ============================================
type LevelUpCosts = Record<2 | 3 | 4 | 5, number>;

const createLevelUpCosts = (base: number): LevelUpCosts => ({
	2: base * 1.5,
	3: base * 2.5,
	4: base * 5,
	5: base * 10,
});

export const NORMAL_ATTACK_LEVEL_UP_COSTS: Record<string, LevelUpCosts> = {
	red: createLevelUpCosts(100),
	blue: createLevelUpCosts(NORMAL_ATTACK_UNLOCK_COSTS.blue),
	pink: createLevelUpCosts(NORMAL_ATTACK_UNLOCK_COSTS.pink),
	yellow: createLevelUpCosts(NORMAL_ATTACK_UNLOCK_COSTS.yellow),
	purple: createLevelUpCosts(NORMAL_ATTACK_UNLOCK_COSTS.purple),
	orange: createLevelUpCosts(NORMAL_ATTACK_UNLOCK_COSTS.orange),
};

// ============================================
// 必殺技 ※ Shooter 用（1種類、lv1〜10で規模を制御）
// ============================================
export const SPECIAL_ATTACK_MAX_LEVEL = 10;
export const SPECIAL_ATTACK_IDS = ["spread"] as const;


/** 必殺技レベルアップコスト（2〜10） */
export const SPECIAL_ATTACK_LEVEL_UP_COSTS: Record<
	2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
	number
> = {
	2: 500,
	3: 750,
	4: 1000,
	5: 1250,
	6: 1500,
	7: 1750,
	8: 2000,
	9: 2500,
	10: 5000,
};

// ============================================
// 星のHPレベル上げ（全役割共通）
// ============================================
export const STAR_HP_LEVEL_UP_COSTS: Record<2 | 3 | 4 | 5, number> = {
	2: 500,
	3: 1000,
	4: 2000,
	5: 4000,
};

// ============================================
// ヒールスキル ※ Typist 用
// ============================================
export const HEAL_UNLOCK_COST = 500;
export const HEAL_LEVEL_UP_COSTS: Record<2 | 3 | 4 | 5 | 6, number> = {
	2: 500,
	3: 1000,
	4: 2000,
	5: 3000,
	6: 6000, // 5 -> max
};

// ============================================
// ヒール回復量（実数値・加算）
// ============================================
export const LEVEL_HEAL_RECOVERY: Record<1 | 2 | 3 | 4 | 5 | 6, number> = {
	1: 1,
	2: 2,
	3: 4,
	4: 8,
	5: 100,
	6: 100, // max: 全回復 + 全破壊
};
