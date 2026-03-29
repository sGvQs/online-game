/**
 * 技の所持・解放ロジック
 * 通貨ベースのスキルで購入したスキルのみ使用可能
 * PROGRESSION_DEBUG 時は全スキル解放
 */

import type { TechniqueId } from "@/constants/starShieldGame/techniques";
import { PROGRESSION_DEBUG } from "@/constants/starShieldGame/skillConfig";

/** 全部破壊（ヒール Lv.  max でのみ獲得。スキルにはない） */
export const ALL_DESTRUCTION_ID = "all_destruction" as const;

/** 必殺技の選択肢（spread: スキルで購入、all_destruction: ヒール Lv.  max で獲得） */
export type SpecialAttackChoice = "spread" | "all_destruction";

/** 通常攻撃の型（red は初期所持） */
export type SelectableTechnique = TechniqueId | null;

export interface OwnedNormalAttack {
	techniqueId: string;
	level: number;
}

export interface OwnedSpecialAttack {
	specialAttackId: string;
	level: number;
}

export interface OwnedSkills {
	normalAttacks: OwnedNormalAttack[];
	specialAttacks: OwnedSpecialAttack[]; // { specialAttackId, level }[]
	healLevel: number | null;
}

/** Shooter 用: 選択可能な通常攻撃一覧。PROGRESSION_DEBUG 時は全技 lv5 */
export function getAvailableNormalAttacks(
	owned: OwnedSkills,
): { techniqueId: TechniqueId; level: number }[] {
	if (PROGRESSION_DEBUG) {
		return [
			{ techniqueId: "red", level: 5 },
			{ techniqueId: "blue", level: 5 },
			{ techniqueId: "yellow", level: 5 },
			{ techniqueId: "purple", level: 5 },
			{ techniqueId: "orange", level: 5 },
			{ techniqueId: "pink", level: 5 },
		];
	}
	const hasRed = owned.normalAttacks.some((a) => a.techniqueId === "red");
	const list: { techniqueId: TechniqueId; level: number }[] = [];
	if (hasRed) {
		const r = owned.normalAttacks.find((a) => a.techniqueId === "red");
		list.push({ techniqueId: "red", level: r?.level ?? 1 });
	}
	for (const id of [
		"blue",
		"yellow",
		"purple",
		"orange",
		"pink",
	] as const) {
		const o = owned.normalAttacks.find((a) => a.techniqueId === id);
		if (o) list.push({ techniqueId: id, level: o.level });
	}
	return list;
}

/** Shooter 用: 選択可能な必殺技一覧（ID + レベル）。PROGRESSION_DEBUG 時は lv10 */
export function getAvailableSpecialAttacks(
	owned: OwnedSkills,
): { specialAttackId: SpecialAttackChoice; level: number }[] {
	if (PROGRESSION_DEBUG) {
		return [{ specialAttackId: "spread", level: 10 }];
	}
	const list: { specialAttackId: SpecialAttackChoice; level: number }[] = [];
	const spread = owned.specialAttacks.find(
		(a) => a.specialAttackId === "spread",
	);
	if (spread) list.push({ specialAttackId: "spread", level: spread.level });
	// all_destruction は Typist の healLevel === 6 で自動発動（Shooter の選択肢には含めない）
	return list;
}

/** Typist 用: ヒール所持していれば選択可能。PROGRESSION_DEBUG 時は lv6 */
export function getAvailableHealLevel(owned: OwnedSkills): number | null {
	if (PROGRESSION_DEBUG) return 6;
	return owned.healLevel;
}

/**
 * デバッグ用: 難易度制限なしで全通常攻撃を返す。
 * PROGRESSION_DEBUG 時に getAvailableNormalAttacks が使うのと同じ。
 */
export function getDebugNormalAttacks(): TechniqueId[] {
	return ["red", "blue", "yellow", "purple", "orange", "pink"];
}
