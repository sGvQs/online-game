/**
 * オートエイム用ユーティリティ
 * 恐竜位置から最も近い生存中隕石を算出
 */

import type { Asteroid } from "@/types/starShieldGame";
import { getAsteroidPosition } from "./position";

/**
 * 指定座標から最も近い生存中の隕石の位置を返す。
 * 生存中の隕石がなければ null。
 */
export function findNearestAsteroidPosition(
	asteroids: Asteroid[],
	fromX: number,
	fromY: number,
	now: number,
): { x: number; y: number } | null {
	const alive = asteroids.filter((a) => !a.destroyedAt);
	if (alive.length === 0) return null;

	const nearest = alive.reduce(
		(best, a) => {
			const pos = getAsteroidPosition(a, now);
			const d = Math.hypot(pos.x - fromX, pos.y - fromY);
			return d < best.dist ? { pos, dist: d } : best;
		},
		{ pos: getAsteroidPosition(alive[0], now), dist: Infinity },
	);
	return nearest.pos;
}
