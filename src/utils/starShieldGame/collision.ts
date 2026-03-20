/**
 * 衝突判定・ダメージ計算（純粋関数）
 */

import {
	BULLET_RADIUS,
	ASTEROID_RADIUS,
	BULLET_MAX_AGE_MS,
	LEVEL_BLUE_SLOW_MULTIPLIER,
	LEVEL_ORANGE_CHAIN_COUNT,
	LEVEL_ORANGE_DAMAGE,
	ORANGE_CHAIN_RADIUS,
} from "@/constants/starShieldGame/gameConfig";
import { TECHNIQUES } from "@/constants/starShieldGame/techniques";
import type { TechniqueId } from "@/constants/starShieldGame/techniques";
import type {
	Asteroid,
	Bullet,
	NormalAttackLevel,
} from "@/types/starShieldGame";
import { getAsteroidPosition, getBulletPosition } from "./position";

export interface ChainHitTarget {
	pos: { x: number; y: number };
	asteroidId: string;
}

export interface CollisionResult {
	hpUpdates: Map<string, number>;
	hitBulletIds: Set<string>;
	slowAsteroidData: Map<string, { progressAtSlow: number }>;
	chainHits: {
		primaryPos: { x: number; y: number };
		targets: ChainHitTarget[];
		color: string;
	} | null;
	destroyedCount: number;
}

/** 弾・隕石の衝突結果を純粋に計算 */
export function computeCollisionResult(params: {
	asteroids: Asteroid[];
	bullets: Bullet[];
	now: number;
	level: NormalAttackLevel;
}): CollisionResult {
	const { asteroids: asts, bullets: bts, now, level } = params;
	const hitBulletIds = new Set<string>();
	const hpUpdates = new Map<string, number>();
	const slowAsteroidData = new Map<string, { progressAtSlow: number }>();
	let destroyedCount = 0;
	let chainHits: CollisionResult["chainHits"] = null;
	const chainRadius = ORANGE_CHAIN_RADIUS;

	function getCurrentHp(astId: string): number {
		return hpUpdates.get(astId) ?? asts.find((x) => x.id === astId)?.hp ?? 0;
	}

	function applyChainDamage(
		astId: string,
		dmg: number,
		chainHitIds: Set<string>,
	): void {
		const cur = getCurrentHp(astId);
		const next = Math.max(0, cur - dmg);
		hpUpdates.set(astId, next);
		if (next <= 0) destroyedCount++;
		chainHitIds.add(astId);
	}

	function findNearestInRadius(
		centerPos: { x: number; y: number },
		limit: number,
		radius: number,
		chainHitIds: Set<string>,
	): Asteroid[] {
		return asts
			.filter((o) => !o.destroyedAt && !chainHitIds.has(o.id))
			.map((o) => ({ ast: o, pos: getAsteroidPosition(o, now) }))
			.map(({ ast, pos }) => ({
				ast,
				dist: Math.hypot(centerPos.x - pos.x, centerPos.y - pos.y),
			}))
			.filter(({ dist }) => dist <= radius)
			.sort((x, y) => x.dist - y.dist)
			.slice(0, limit)
			.map(({ ast }) => ast);
	}

	for (const bullet of bts) {
		if (hitBulletIds.has(bullet.id)) continue;
		const bp = getBulletPosition(bullet, now);
		const damage = bullet.damage ?? 1;
		const tech =
			bullet.technique && bullet.technique in TECHNIQUES
				? TECHNIQUES[bullet.technique as TechniqueId]
				: null;

		for (const a of asts) {
			if (
				a.destroyedAt ||
				(hpUpdates.has(a.id) && (hpUpdates.get(a.id) ?? 0) <= 0)
			)
				continue;
			const ap = getAsteroidPosition(a, now);
			const dist = Math.hypot(bp.x - ap.x, bp.y - ap.y);
			const bulletRadius = bullet.radius ?? BULLET_RADIUS;
			if (dist >= ASTEROID_RADIUS + bulletRadius) continue;

			const currentHp = hpUpdates.get(a.id) ?? a.hp;
			const newHp = Math.max(0, currentHp - damage);

			if (damage <= 0) continue;

			hpUpdates.set(a.id, newHp);
			if (newHp <= 0) destroyedCount++;

			if (tech?.slowOnHit && !a.slowAppliedAt) {
				const progressAtSlow = Math.min(1, (now - a.spawnedAt) / a.durationMs);
				slowAsteroidData.set(a.id, { progressAtSlow });
			}

			if (
				tech?.chainRadius !== undefined &&
				(bullet.technique as TechniqueId) === "orange"
			) {
				const chainHitIds = new Set<string>([a.id]);
				const chainCount = LEVEL_ORANGE_CHAIN_COUNT[level];
				const chainAsteroids = findNearestInRadius(
					ap,
					chainCount,
					chainRadius,
					chainHitIds,
				);
				const chainTargets: ChainHitTarget[] = [];
				const chainDmg = (tech.damage ?? 1) * LEVEL_ORANGE_DAMAGE[level];
				for (const ast of chainAsteroids) {
					chainTargets.push({
						pos: getAsteroidPosition(ast, now),
						asteroidId: ast.id,
					});
					applyChainDamage(ast.id, chainDmg, chainHitIds);
				}
				if (chainTargets.length > 0) {
					chainHits = {
						primaryPos: ap,
						targets: chainTargets,
						color: tech.color ?? "#f97316",
					};
				}
			}

			if (!bullet.piercing) {
				hitBulletIds.add(bullet.id);
				break;
			}
		}
	}

	return {
		hpUpdates,
		hitBulletIds,
		slowAsteroidData,
		chainHits,
		destroyedCount,
	};
}

/** HP 更新と減速データを適用した新しい隕石配列を返す */
export function applyHpUpdates(
	prev: Asteroid[],
	result: CollisionResult,
	now: number,
	level: NormalAttackLevel,
): Asteroid[] {
	const { hpUpdates, slowAsteroidData } = result;
	const slowMult = LEVEL_BLUE_SLOW_MULTIPLIER[level];
	return prev.map((ast) => {
		const newHp = hpUpdates.get(ast.id);
		if (newHp === undefined) return ast;
		const base =
			newHp <= 0 ? { ...ast, hp: 0, destroyedAt: now } : { ...ast, hp: newHp };
		const slowData = slowAsteroidData.get(ast.id);
		return slowData
			? {
					...base,
					speedMultiplier: slowMult,
					slowAppliedAt: now,
					progressAtSlow: slowData.progressAtSlow,
				}
			: base;
	});
}

/** 星に接触した隕石一覧（破壊済み・既に星にダメージを与えたものは除外） */
export function getContactAsteroids(params: {
	asteroids: Asteroid[];
	now: number;
	destroyedAsteroidIds: Set<string>;
	starTargetX: number;
	starTargetY: number;
	starRadius: number;
	asteroidRadius: number;
}): Asteroid[] {
	const {
		asteroids,
		now,
		destroyedAsteroidIds,
		starTargetX,
		starTargetY,
		starRadius,
		asteroidRadius,
	} = params;
	return asteroids.filter((a) => {
		if (a.destroyedAt || destroyedAsteroidIds.has(a.id) || a.hasDamagedStar)
			return false;
		const ap = getAsteroidPosition(a, now);
		const dist = Math.hypot(ap.x - starTargetX, ap.y - starTargetY);
		return dist < starRadius + asteroidRadius;
	});
}

/** 寿命切れの弾 ID 一覧。ベジェ弾は軌道終点到達時に即削除 */
export function getExpiredBulletIds(
	bullets: Bullet[],
	now: number,
	maxAgeMs: number = BULLET_MAX_AGE_MS,
): Set<string> {
	return new Set(
		bullets
			.filter((b) => {
				const elapsed = now - b.firedAt;
				if (b.curveDurationMs != null) return elapsed >= b.curveDurationMs;
				return elapsed > maxAgeMs;
			})
			.map((b) => b.id),
	);
}
