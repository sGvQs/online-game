/**
 * 必殺技の広範囲弾生成（純粋関数）
 */

import type { TechniqueConfig } from '@/constants/starShieldGame/techniques'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'
import {
    DINO_X,
    DINO_Y,
    BULLET_SPAWN_OFFSET_X,
    BULLET_SPAWN_OFFSET_Y,
    LEVEL_SPECIAL,
    LEVEL_YELLOW_DAMAGE,
    LEVEL_PURPLE_SPEED,
} from '@/constants/starShieldGame/gameConfig'
import type { Bullet, NormalAttackLevel } from '@/types/starShieldGame'
import { createBaseBullet } from './normalAttack'
import type { SpecialAttackChoice } from './techniqueUnlock'

/**
 * 必殺技の広範囲弾を生成する（純粋関数）
 * 散弾の数・角度は level に依存（LEVEL_SPECIAL）。各弾の properties は選択球（tech）に依存。
 */
export function createSpecialAttackBullets(params: {
    specialAttack: SpecialAttackChoice
    centerAngle: number
    tech: TechniqueConfig | null
    level: NormalAttackLevel
    now: number
}): Bullet[] {
    const { centerAngle, tech, level, now } = params

    const { count: bulletCount, spreadDeg } = LEVEL_SPECIAL[level]
    const spreadRad = (spreadDeg * Math.PI) / 180

    const yellowDamage = tech && (tech.id as TechniqueId) === 'yellow_beam' ? LEVEL_YELLOW_DAMAGE[level] : undefined
    const purpleSpeed = tech && (tech.id as TechniqueId) === 'purple' ? tech.speed * LEVEL_PURPLE_SPEED[level] : undefined

    const result: Bullet[] = []
    for (let i = 0; i < bulletCount; i++) {
        const angle =
            centerAngle -
            spreadRad / 2 +
            (bulletCount > 1 ? (spreadRad * i) / (bulletCount - 1) : 0)
        const dirX = Math.cos(angle)
        const dirY = Math.sin(angle)
        const bullet = createBaseBullet(
            {
                dirX,
                dirY,
                startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
            },
            tech,
            now,
            yellowDamage,
            purpleSpeed
        )
        result.push(bullet)
    }
    return result
}
