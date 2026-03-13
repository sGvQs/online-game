/**
 * 隕石生成（純粋関数）
 */

import {
    SPAWN_X_MIN,
    SPAWN_X_MAX,
    SPAWN_Y_MIN,
    SPAWN_Y_MAX,
    ASTEROID_DURATION_MS,
    ASTEROID_HP,
    STAR_TARGET_OFFSET,
} from '@/constants/starShieldGame/gameConfig'
import type { Asteroid, Difficulty } from '@/types/starShieldGame'

export interface CreateAsteroidParams {
    difficulty: Difficulty
    starTargetX: number
    starTargetY: number
    /** テスト用。未指定時は Date.now() */
    now?: number
    /** テスト用。未指定時は crypto.randomUUID() */
    randomId?: () => string
}

/** 新規隕石を生成（スポーン位置・目標をランダム決定） */
export function createAsteroid(params: CreateAsteroidParams): Asteroid {
    const {
        difficulty,
        starTargetX,
        starTargetY,
        now = Date.now(),
        randomId = () => crypto.randomUUID(),
    } = params

    const targetX = starTargetX + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET
    const targetY = starTargetY + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET

    return {
        id: randomId(),
        spawnedAt: now,
        spawnX: SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN),
        spawnY: SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN),
        targetX,
        targetY,
        durationMs: ASTEROID_DURATION_MS[difficulty],
        hp: ASTEROID_HP[difficulty],
    }
}
