/**
 * 通常攻撃の弾生成（純粋関数）
 */

import type { TechniqueConfig } from "@/constants/starShieldGame/techniques";
import type { Bullet, NormalAttackLevel } from "@/types/starShieldGame";
import {
	BULLET_RADIUS,
	BULLET_SPEED,
	DINO_X,
	DINO_Y,
	BULLET_SPAWN_OFFSET_X,
	BULLET_SPAWN_OFFSET_Y,
	LEVEL_BULLET_COUNT,
	LEVEL_ORANGE_DAMAGE,
	PINK_ROCKET_BURST_COUNT,
	PINK_ROCKET_CONTROL_LEN_RATIO,
	PINK_ROCKET_SPREAD_HALF_DEG,
	PINK_ROCKET_STAGGER_MS,
	LEVEL_PURPLE_SIZE,
	LEVEL_SPREAD_DEG,
	LEVEL_YELLOW_DAMAGE,
} from "@/constants/starShieldGame/gameConfig";
import {
	TECHNIQUES,
	type TechniqueId,
} from "@/constants/starShieldGame/techniques";

export function createBaseBullet(
	o: { dirX: number; dirY: number; startX: number; startY: number },
	tech: TechniqueConfig | null,
	now: number,
	overrideDamage?: number,
	overrideSpeed?: number,
	overrideRadius?: number,
): Bullet {
	const base: Bullet = {
		id: crypto.randomUUID(),
		firedAt: now,
		startX: o.startX,
		startY: o.startY,
		dirX: o.dirX,
		dirY: o.dirY,
	};
	if (tech) {
		const damage = overrideDamage ?? tech.damage;
		const speed = overrideSpeed ?? tech.speed;
		return {
			...base,
			damage,
			speed,
			technique: tech.id,
			piercing: tech.piercing,
			...(overrideRadius !== undefined && { radius: overrideRadius }),
		};
	}
	return base;
}

/**
 * tech=null 時の散弾を生成する純粋関数。
 * HELL専用3発も、レベル制の N 発もこの関数で共通化。
 */
export function createDefaultSpreadBullets(params: {
	centerAngle: number;
	count: number;
	spreadDeg: number;
	now: number;
}): Bullet[] {
	const { centerAngle, count, spreadDeg, now } = params;

	if (count <= 1) {
		const dirX = Math.cos(centerAngle);
		const dirY = Math.sin(centerAngle);
		return [
			createBaseBullet(
				{
					dirX,
					dirY,
					startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
					startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
				},
				TECHNIQUES.red,
				now,
			),
		];
	}

	const spreadRad = (spreadDeg * Math.PI) / 180;
	const result: Bullet[] = [];
	for (let i = 0; i < count; i++) {
		const angle = centerAngle - spreadRad / 2 + (spreadRad * i) / (count - 1);
		const bDirX = Math.cos(angle);
		const bDirY = Math.sin(angle);
		result.push(
			createBaseBullet(
				{
					dirX: bDirX,
					dirY: bDirY,
					startX: DINO_X + bDirX * BULLET_SPAWN_OFFSET_X,
					startY: DINO_Y + bDirY * BULLET_SPAWN_OFFSET_Y,
				},
				TECHNIQUES.red,
				now,
			),
		);
	}
	return result;
}

/**
 * 通常攻撃の弾を生成する（純粋関数）
 * pink のベジェ軌道（照準へ向かうロケット）用に targetX, targetY（照準座標）を渡すこと
 */
export function createNormalAttackBullets(params: {
	tech: TechniqueConfig | null;
	centerAngle: number;
	dirX: number;
	dirY: number;
	level: NormalAttackLevel;
	now: number;
	/** 照準座標（pink の終着点） */
	targetX?: number;
	targetY?: number;
}): Bullet[] {
	const { tech, dirX, dirY, level, now, targetX, targetY } = params;

	// ピンク: 照準へ向かうロケット。同一終点・30° 扇を弾数で等分割・10ms ずつ発射（弾数は暫定固定）
	if (
		tech &&
		(tech.id as TechniqueId) === "pink" &&
		targetX != null &&
		targetY != null
	) {
		const count = PINK_ROCKET_BURST_COUNT;
		const result: Bullet[] = [];
		const p0 = {
			x: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
			y: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
		};
		const p2 = { x: targetX, y: targetY };
		const chordX = p2.x - p0.x;
		const chordY = p2.y - p0.y;
		let chordLen = Math.hypot(chordX, chordY);
		let ux: number;
		let uy: number;
		if (chordLen < 1e-6) {
			ux = dirX;
			uy = dirY;
			chordLen = 1e-3;
		} else {
			ux = chordX / chordLen;
			uy = chordY / chordLen;
		}
		const spreadHalfRad = (PINK_ROCKET_SPREAD_HALF_DEG * Math.PI) / 180;
		const step =
			count > 1 ? (2 * spreadHalfRad) / (count - 1) : 0;
		const controlLen = chordLen * PINK_ROCKET_CONTROL_LEN_RATIO;

		for (let i = 0; i < count; i++) {
			const theta = count > 1 ? -spreadHalfRad + i * step : 0;
			const cos = Math.cos(theta);
			const sin = Math.sin(theta);
			const dix = ux * cos - uy * sin;
			const diy = ux * sin + uy * cos;
			const p1 = {
				x: p0.x + controlLen * dix,
				y: p0.y + controlLen * diy,
			};
			const curveDurationMs = (chordLen * 1.3) / BULLET_SPEED;

			const bullet = createBaseBullet(
				{ dirX: 1, dirY: 0, startX: p0.x, startY: p0.y },
				tech,
				now,
				tech.damage,
			);
			result.push({
				...bullet,
				firedAt: now + i * PINK_ROCKET_STAGGER_MS,
				curveType: "bezier" as const,
				curveP0: p0,
				curveP1: p1,
				curveP2: p2,
				curveDurationMs,
			});
		}
		return result;
	}

	if (tech?.count && tech.count > 1) {
		const verticalOffset = tech.verticalOffset ?? 0;
		const yellowDamage =
			(tech.id as TechniqueId) === "yellow_beam"
				? LEVEL_YELLOW_DAMAGE[level]
				: undefined;
		const result: Bullet[] = [];
		for (let i = 0; i < tech.count; i++) {
			const offsetDist = i * verticalOffset;
			const startX = DINO_X + dirX * BULLET_SPAWN_OFFSET_X + dirX * offsetDist;
			const startY = DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y + dirY * offsetDist;
			result.push(
				createBaseBullet(
					{ dirX, dirY, startX, startY },
					tech,
					now,
					yellowDamage,
				),
			);
		}
		return result;
	}

	// red（赤い球）または tech なし → 散弾
	if (!tech || (tech.id as TechniqueId) === "red") {
		const count = LEVEL_BULLET_COUNT[level];
		const spreadDeg = LEVEL_SPREAD_DEG[level];
		return createDefaultSpreadBullets({ centerAngle, count, spreadDeg, now });
	}

	const yellowDamage =
		(tech.id as TechniqueId) === "yellow_beam"
			? LEVEL_YELLOW_DAMAGE[level]
			: undefined;
	const orangeDamage =
		(tech.id as TechniqueId) === "orange"
			? tech.damage * LEVEL_ORANGE_DAMAGE[level]
			: undefined;
	const purpleRadius =
		(tech.id as TechniqueId) === "purple"
			? BULLET_RADIUS * LEVEL_PURPLE_SIZE[level]
			: undefined;

	return [
		createBaseBullet(
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
		),
	];
}
