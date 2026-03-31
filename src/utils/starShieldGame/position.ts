/**
 * 座標算出ユーティリティ（隕石・弾の位置）
 */

import { BULLET_SPEED } from "@/constants/starShieldGame/gameConfig";
import type { Asteroid, Bullet } from "@/types/starShieldGame";

export function getAsteroidPosition(
	asteroid: Asteroid,
	now: number,
): { x: number; y: number } {
	const elapsed = now - asteroid.spawnedAt;

	if (!asteroid.slowAppliedAt || now < asteroid.slowAppliedAt) {
		const progress = Math.min(1, elapsed / asteroid.durationMs);
		return {
			x: asteroid.spawnX + (asteroid.targetX - asteroid.spawnX) * progress,
			y: asteroid.spawnY + (asteroid.targetY - asteroid.spawnY) * progress,
		};
	}

	const progressAtSlow = asteroid.progressAtSlow ?? 0;
	const remainingProgress = 1 - progressAtSlow;
	const remainingOriginalTime = asteroid.durationMs * remainingProgress;
	const mult = asteroid.speedMultiplier ?? 1;
	const remainingSlowedTime = remainingOriginalTime / mult;
	const elapsedInSlowedPhase = now - asteroid.slowAppliedAt;
	const progressInSlowedPhase = Math.min(
		1,
		elapsedInSlowedPhase / remainingSlowedTime,
	);
	const progress = progressAtSlow + remainingProgress * progressInSlowedPhase;

	return {
		x: asteroid.spawnX + (asteroid.targetX - asteroid.spawnX) * progress,
		y: asteroid.spawnY + (asteroid.targetY - asteroid.spawnY) * progress,
	};
}

function bezierQuadratic(
	t: number,
	p0: { x: number; y: number },
	p1: { x: number; y: number },
	p2: { x: number; y: number },
): { x: number; y: number } {
	const u = 1 - t;
	return {
		x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
		y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
	};
}

function bezierQuadraticDerivative(
	t: number,
	p0: { x: number; y: number },
	p1: { x: number; y: number },
	p2: { x: number; y: number },
): { x: number; y: number } {
	const u = 1 - t;
	return {
		x: 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
		y: 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
	};
}

function normalize2(x: number, y: number): { x: number; y: number } | null {
	const len = Math.hypot(x, y);
	if (len < 1e-9) return null;
	return { x: x / len, y: y / len };
}

/**
 * 弾の進行方向（単位ベクトル、画面座標系で +y 下向き）。
 * ベジェ区間では接線、直進区間・通常弾では速度方向
 */
export function getBulletTravelDirection(
	bullet: Bullet,
	now: number,
): { x: number; y: number } {
	const elapsed = now - bullet.firedAt;

	if (
		bullet.curveType === "bezier" &&
		bullet.curveP0 &&
		bullet.curveP1 &&
		bullet.curveP2 &&
		bullet.curveDurationMs != null
	) {
		const { curveP0: p0, curveP1: p1, curveP2: p2, curveDurationMs: dur } =
			bullet;
		if (bullet.curveContinueStraight && elapsed > dur) {
			const tx = 2 * (p2.x - p1.x);
			const ty = 2 * (p2.y - p1.y);
			const u = normalize2(tx, ty);
			if (u) return u;
			return normalize2(bullet.dirX, bullet.dirY) ?? { x: 1, y: 0 };
		}
		const t = Math.max(0, Math.min(1, elapsed / dur));
		const d = bezierQuadraticDerivative(t, p0, p1, p2);
		const u = normalize2(d.x, d.y);
		if (u) return u;
		const pLater = getBulletPosition(bullet, now + 12);
		const pHere = getBulletPosition(bullet, now);
		return normalize2(pLater.x - pHere.x, pLater.y - pHere.y) ?? {
			x: bullet.dirX,
			y: bullet.dirY,
		};
	}

	return normalize2(bullet.dirX, bullet.dirY) ?? { x: 1, y: 0 };
}

export function getBulletPosition(
	bullet: Bullet,
	now: number,
): { x: number; y: number } {
	const elapsed = now - bullet.firedAt;

	if (
		bullet.curveType === "bezier" &&
		bullet.curveP0 &&
		bullet.curveP1 &&
		bullet.curveP2 &&
		bullet.curveDurationMs != null
	) {
		const { curveP0: p0, curveP1: p1, curveP2: p2, curveDurationMs: dur } =
			bullet;
		if (bullet.curveContinueStraight && elapsed > dur) {
			const tx = 2 * (p2.x - p1.x);
			const ty = 2 * (p2.y - p1.y);
			const tLen = Math.hypot(tx, ty);
			let ux: number;
			let uy: number;
			if (tLen < 1e-9) {
				ux = bullet.dirX;
				uy = bullet.dirY;
			} else {
				ux = tx / tLen;
				uy = ty / tLen;
			}
			const speedMult = bullet.speed ?? 1;
			const extraDist = BULLET_SPEED * speedMult * (elapsed - dur);
			return {
				x: p2.x + ux * extraDist,
				y: p2.y + uy * extraDist,
			};
		}
		const t = Math.max(0, Math.min(1, elapsed / dur));
		return bezierQuadratic(t, p0, p1, p2);
	}

	const speedMult = bullet.speed ?? 1;
	const dist = BULLET_SPEED * speedMult * elapsed;
	return {
		x: bullet.startX + bullet.dirX * dist,
		y: bullet.startY + bullet.dirY * dist,
	};
}
