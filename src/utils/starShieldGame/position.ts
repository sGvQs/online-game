/**
 * 座標算出ユーティリティ（隕石・弾の位置）
 */

import { BULLET_SPEED } from '@/constants/starShieldGame/gameConfig'
import type { Asteroid, Bullet } from '@/types/starShieldGame'

export function getAsteroidPosition(asteroid: Asteroid, now: number): { x: number; y: number } {
    const elapsed = now - asteroid.spawnedAt

    if (!asteroid.slowAppliedAt || now < asteroid.slowAppliedAt) {
        const progress = Math.min(1, elapsed / asteroid.durationMs)
        return {
            x: asteroid.spawnX + (asteroid.targetX - asteroid.spawnX) * progress,
            y: asteroid.spawnY + (asteroid.targetY - asteroid.spawnY) * progress,
        }
    }

    const progressAtSlow = asteroid.progressAtSlow ?? 0
    const remainingProgress = 1 - progressAtSlow
    const remainingOriginalTime = asteroid.durationMs * remainingProgress
    const mult = asteroid.speedMultiplier ?? 1
    const remainingSlowedTime = remainingOriginalTime / mult
    const elapsedInSlowedPhase = now - asteroid.slowAppliedAt
    const progressInSlowedPhase = Math.min(1, elapsedInSlowedPhase / remainingSlowedTime)
    const progress = progressAtSlow + remainingProgress * progressInSlowedPhase

    return {
        x: asteroid.spawnX + (asteroid.targetX - asteroid.spawnX) * progress,
        y: asteroid.spawnY + (asteroid.targetY - asteroid.spawnY) * progress,
    }
}

function bezierQuadratic(
    t: number,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number }
): { x: number; y: number } {
    const u = 1 - t
    return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    }
}

export function getBulletPosition(bullet: Bullet, now: number): { x: number; y: number } {
    const elapsed = now - bullet.firedAt

    if (
        bullet.curveType === 'bezier' &&
        bullet.curveP0 &&
        bullet.curveP1 &&
        bullet.curveP2 &&
        bullet.curveDurationMs != null
    ) {
        const t = Math.min(1, elapsed / bullet.curveDurationMs)
        return bezierQuadratic(t, bullet.curveP0, bullet.curveP1, bullet.curveP2)
    }

    const speedMult = bullet.speed ?? 1
    const dist = BULLET_SPEED * speedMult * elapsed
    return {
        x: bullet.startX + bullet.dirX * dist,
        y: bullet.startY + bullet.dirY * dist,
    }
}
