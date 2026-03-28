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
	LEVEL_PINK_COUNT,
	PINK_CURVE_BULGE_FRACTION,
	PINK_CURVE_PEAK_T,
	PINK_ROCKET_SPREAD_HALF_DEG,
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
 * pink は照準が有効なときのみ（恐竜口元共通出発・二次ベジェで照準へ）。targetX, targetY 必須
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
	const { tech, dirX, dirY, level, now, targetX, targetY, centerAngle } =
		params;

	// ピンク: 口元共通 p0、二次ベジェで照準 p2。PINK_CURVE_PEAK_T で横膨らみピーク、p1 は解析式で決定
	if (
		tech &&
		(tech.id as TechniqueId) === "pink" &&
		targetX != null &&
		targetY != null
	) {
		const count = LEVEL_PINK_COUNT[level];
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
		const nx = -uy;
		const ny = ux;
		const spreadHalfRad = (PINK_ROCKET_SPREAD_HALF_DEG * Math.PI) / 180;
		const bMax =
			PINK_CURVE_BULGE_FRACTION > 0 && chordLen >= 1e-6
				? chordLen *
					Math.tan(spreadHalfRad) *
					PINK_CURVE_BULGE_FRACTION
				: 0;
		const tPeak = PINK_CURVE_PEAK_T;
		const denom = Math.max(1e-9, 2 * (1 - tPeak) * tPeak);
		const speedMult = tech.speed ?? 1;
		const curveDurationMs =
			(chordLen * 1.3) / (BULLET_SPEED * speedMult);
		const result: Bullet[] = [];
		for (let i = 0; i < count; i++) {
			const s = count > 1 ? (2 * i) / (count - 1) - 1 : 0;
			const p1Off = (s * bMax) / denom;
			const p1 = {
				x: 0.5 * (p0.x + p2.x) + nx * p1Off,
				y: 0.5 * (p0.y + p2.y) + ny * p1Off,
			};
			const bullet = createBaseBullet(
				{ dirX: ux, dirY: uy, startX: p0.x, startY: p0.y },
				tech,
				now,
			);
			result.push({
				...bullet,
				curveType: "bezier" as const,
				curveP0: p0,
				curveP1: p1,
				curveP2: p2,
				curveDurationMs,
				curveContinueStraight: true,
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
