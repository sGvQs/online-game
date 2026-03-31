/**
 * 必殺技の広範囲弾生成（純粋関数）
 */

import type { TechniqueConfig } from "@/constants/starShieldGame/techniques";
import type { TechniqueId } from "@/constants/starShieldGame/techniques";
import {
	DINO_X,
	DINO_Y,
	BULLET_RADIUS,
	BULLET_SPAWN_OFFSET_X,
	BULLET_SPAWN_OFFSET_Y,
	LEVEL_ORANGE_DAMAGE,
	LEVEL_PURPLE_SIZE,
	LEVEL_YELLOW_DAMAGE,
	SPECIAL_ATTACK_LEVEL_PARAMS,
} from "@/constants/starShieldGame/gameConfig";
import type { SpecialAttackLevel } from "@/constants/starShieldGame/gameConfig";
import type { Bullet, NormalAttackLevel } from "@/types/starShieldGame";
import { createBaseBullet } from "./normalAttack";
import type { SpecialAttackChoice } from "./techniqueUnlock";

/**
 * 1波分の必殺技弾を生成する（純粋関数）
 * 散弾の数・角度は specialAttackLevel（SPECIAL_ATTACK_LEVEL_PARAMS）に依存。
 * 複数波は呼び出し側で waveDelayMs 間隔で本関数を複数回呼ぶ。
 * 各弾の properties は選択球（tech）と normalAttackLevel に依存。
 */
export function createSpecialAttackBullets(params: {
	specialAttack: SpecialAttackChoice;
	centerAngle: number;
	tech: TechniqueConfig | null;
	/** 必殺技レベル（1-10）: 弾数・広がりを制御 */
	specialAttackLevel: SpecialAttackLevel;
	/** 通常攻撃レベル（1-5）: 黄・オレンジ・紫のスケール用 */
	normalAttackLevel: NormalAttackLevel;
	now: number;
}): Bullet[] {
	const { centerAngle, tech, specialAttackLevel, normalAttackLevel, now } =
		params;

	const { bulletsPerWave: bulletCount, spreadDeg } =
		SPECIAL_ATTACK_LEVEL_PARAMS[specialAttackLevel];
	const spreadRad = (spreadDeg * Math.PI) / 180;

	const yellowDamage =
		tech && (tech.id as TechniqueId) === "yellow"
			? LEVEL_YELLOW_DAMAGE[normalAttackLevel]
			: undefined;
	const orangeDamage =
		tech && (tech.id as TechniqueId) === "orange"
			? tech.damage * LEVEL_ORANGE_DAMAGE[normalAttackLevel]
			: undefined;
	const purpleRadius =
		tech && (tech.id as TechniqueId) === "purple"
			? BULLET_RADIUS * LEVEL_PURPLE_SIZE[normalAttackLevel]
			: undefined;

	const result: Bullet[] = [];
	for (let i = 0; i < bulletCount; i++) {
		const angle =
			centerAngle -
			spreadRad / 2 +
			(bulletCount > 1 ? (spreadRad * i) / (bulletCount - 1) : 0);
		const dirX = Math.cos(angle);
		const dirY = Math.sin(angle);
		const bullet = createBaseBullet(
			{
				dirX,
				dirY,
				startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
				startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
			},
			tech,
			now,
			yellowDamage ?? orangeDamage,
			undefined,
			purpleRadius,
		);
		result.push(bullet);
	}
	return result;
}
