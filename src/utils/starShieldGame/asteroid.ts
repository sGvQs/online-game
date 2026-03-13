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
    ABYSS_MIN_DURATION_MS,
    ABYSS_SPEED_DECREASE_PER_SECOND,
    ABYSS_BOSS_DURATION_MS,
    getAbyssBossHp,
} from '@/constants/starShieldGame/gameConfig'
import type { Asteroid, Difficulty } from '@/types/starShieldGame'

export interface CreateAsteroidParams {
    difficulty: Difficulty
    starTargetX: number
    starTargetY: number
    /** ABYSS: 波開始からの経過時間（ms）。指定時は速度を動的計算 */
    waveElapsedMs?: number
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
        waveElapsedMs,
        now = Date.now(),
        randomId = () => crypto.randomUUID(),
    } = params

    const targetX = starTargetX + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET
    const targetY = starTargetY + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET

    let durationMs: number
    if (difficulty === 'ABYSS' && waveElapsedMs !== undefined) {
        const elapsedSeconds = Math.floor(waveElapsedMs / 1000)
        durationMs = Math.max(
            ABYSS_MIN_DURATION_MS,
            ASTEROID_DURATION_MS[difficulty] - elapsedSeconds * ABYSS_SPEED_DECREASE_PER_SECOND,
        )
    } else {
        durationMs = ASTEROID_DURATION_MS[difficulty]
    }

    return {
        id: randomId(),
        spawnedAt: now,
        spawnX: SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN),
        spawnY: SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN),
        targetX,
        targetY,
        durationMs,
        hp: ASTEROID_HP[difficulty],
    }
}

export interface CreateBossAsteroidParams {
    waveNumber: number
    starTargetX: number
    starTargetY: number
    now?: number
    randomId?: () => string
}

/** ABYSS ボス隕石を生成 */
export function createBossAsteroid(params: CreateBossAsteroidParams): Asteroid {
    const {
        waveNumber,
        starTargetX,
        starTargetY,
        now = Date.now(),
        randomId = () => crypto.randomUUID(),
    } = params

    // ボスは画面上部中央付近からスポーン
    const spawnX = 0.3 + Math.random() * 0.4
    const spawnY = SPAWN_Y_MIN

    return {
        id: randomId(),
        spawnedAt: now,
        spawnX,
        spawnY,
        targetX: starTargetX,
        targetY: starTargetY,
        durationMs: ABYSS_BOSS_DURATION_MS,
        hp: getAbyssBossHp(waveNumber),
        isBoss: true,
    }
}
