/**
 * ゲーム終了時の統計生成（純粋関数）
 */

import type { GameStats } from '@/types/starShieldGame'

export function createGameStats(params: {
    baseStartedAt: number
    spawnedCount: number
    destroyedCount: number
    fireCount: number
}): GameStats {
    const { baseStartedAt, spawnedCount, destroyedCount, fireCount } = params
    const durationSeconds = Math.round((Date.now() - baseStartedAt) / 1000)
    return {
        spawnedCount,
        destroyedCount,
        durationSeconds,
        fireCount,
    }
}
