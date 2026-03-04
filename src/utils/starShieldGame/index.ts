/**
 * StarShieldGame ユーティリティ
 */

import { toRomaji } from 'wanakana'
import { BULLET_SPEED } from '@/constants/starShieldGame/gameConfig'
import type { Asteroid, Bullet } from '@/types/starShieldGame'

/** ひらがな・カタカナ以外を除去して toRomaji に渡す（句読点はタイピング対象外） */
const KANA_ONLY = /[^\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/g

export const getRomaji = (text: string): string => toRomaji(text.replace(KANA_ONLY, ''))

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

export function getBulletPosition(bullet: Bullet, now: number): { x: number; y: number } {
    const elapsed = now - bullet.firedAt
    const speedMult = bullet.speed ?? 1
    const dist = BULLET_SPEED * speedMult * elapsed
    return {
        x: bullet.startX + bullet.dirX * dist,
        y: bullet.startY + bullet.dirY * dist,
    }
}
