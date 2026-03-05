/**
 * 必殺技の広範囲弾生成（純粋関数）
 */

import type { SpecialAttackChoice } from './techniqueUnlock'
import type { Bullet } from '@/types/starShieldGame'
import {
    DINO_X,
    DINO_Y,
    BULLET_SPAWN_OFFSET_X,
    BULLET_SPAWN_OFFSET_Y,
    SPECIAL_ATTACK_BULLET_COUNT,
    SPECIAL_ATTACK_SPREAD_DEG,
} from '@/constants/starShieldGame/gameConfig'

/**
 * 必殺技の広範囲弾を生成する（純粋関数）
 */
export function createSpecialAttackBullets(params: {
    specialAttack: SpecialAttackChoice
    centerAngle: number
    now: number
}): Bullet[] {
    const { specialAttack, centerAngle, now } = params

    const bulletCount = SPECIAL_ATTACK_BULLET_COUNT[specialAttack]
    const spreadDeg = SPECIAL_ATTACK_SPREAD_DEG[specialAttack]
    const spreadRad = (spreadDeg * Math.PI) / 180

    const result: Bullet[] = []
    for (let i = 0; i < bulletCount; i++) {
        const angle =
            centerAngle -
            spreadRad / 2 +
            (bulletCount > 1 ? (spreadRad * i) / (bulletCount - 1) : 0)
        const dirX = Math.cos(angle)
        const dirY = Math.sin(angle)
        result.push({
            id: crypto.randomUUID(),
            firedAt: now,
            startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
            startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
            dirX,
            dirY,
        })
    }
    return result
}
