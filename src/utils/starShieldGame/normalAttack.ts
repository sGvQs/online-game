/**
 * 通常攻撃の弾生成（純粋関数）
 */

import type { TechniqueConfig } from '@/constants/starShieldGame/techniques'
import type { Bullet, NormalAttackLevel } from '@/types/starShieldGame'
import {
    DINO_X,
    DINO_Y,
    BULLET_SPAWN_OFFSET_X,
    BULLET_SPAWN_OFFSET_Y,
    LEVEL_BULLET_COUNT,
    LEVEL_SPREAD_DEG,
    LEVEL_YELLOW_DAMAGE,
    LEVEL_PURPLE_SPEED,
} from '@/constants/starShieldGame/gameConfig'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'

function createBaseBullet(
    o: { dirX: number; dirY: number; startX: number; startY: number },
    tech: TechniqueConfig | null,
    now: number,
    overrideDamage?: number,
    overrideSpeed?: number
): Bullet {
    const base: Bullet = {
        id: crypto.randomUUID(),
        firedAt: now,
        startX: o.startX,
        startY: o.startY,
        dirX: o.dirX,
        dirY: o.dirY,
    }
    if (tech) {
        const damage = overrideDamage ?? tech.damage
        const speed = overrideSpeed ?? tech.speed
        return {
            ...base,
            damage,
            speed,
            technique: tech.id,
            piercing: tech.piercing,
        }
    }
    return base
}

/**
 * tech=null 時の散弾を生成する純粋関数。
 * HELL専用3発も、レベル制の N 発もこの関数で共通化。
 */
export function createDefaultSpreadBullets(params: {
    centerAngle: number
    count: number
    spreadDeg: number
    now: number
}): Bullet[] {
    const { centerAngle, count, spreadDeg, now } = params

    if (count <= 1) {
        const dirX = Math.cos(centerAngle)
        const dirY = Math.sin(centerAngle)
        return [
            createBaseBullet(
                {
                    dirX,
                    dirY,
                    startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                    startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
                },
                null,
                now
            ),
        ]
    }

    const spreadRad = (spreadDeg * Math.PI) / 180
    const result: Bullet[] = []
    for (let i = 0; i < count; i++) {
        const angle =
            centerAngle - spreadRad / 2 + (spreadRad * i) / (count - 1)
        const bDirX = Math.cos(angle)
        const bDirY = Math.sin(angle)
        result.push(
            createBaseBullet(
                {
                    dirX: bDirX,
                    dirY: bDirY,
                    startX: DINO_X + bDirX * BULLET_SPAWN_OFFSET_X,
                    startY: DINO_Y + bDirY * BULLET_SPAWN_OFFSET_Y,
                },
                null,
                now
            )
        )
    }
    return result
}

/**
 * 通常攻撃の弾を生成する（純粋関数）
 */
export function createNormalAttackBullets(params: {
    tech: TechniqueConfig | null
    centerAngle: number
    dirX: number
    dirY: number
    level: NormalAttackLevel
    now: number
}): Bullet[] {
    const { tech, centerAngle, dirX, dirY, level, now } = params

    if (tech?.count && tech.count > 1) {
        const verticalOffset = tech.verticalOffset ?? 0
        const yellowDamage = (tech.id as TechniqueId) === 'yellow_beam' ? LEVEL_YELLOW_DAMAGE[level] : undefined
        const result: Bullet[] = []
        for (let i = 0; i < tech.count; i++) {
            const offsetDist = i * verticalOffset
            const startX = DINO_X + dirX * BULLET_SPAWN_OFFSET_X + dirX * offsetDist
            const startY = DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y + dirY * offsetDist
            result.push(createBaseBullet({ dirX, dirY, startX, startY }, tech, now, yellowDamage))
        }
        return result
    }

    if (!tech) {
        const count = LEVEL_BULLET_COUNT[level]
        const spreadDeg = LEVEL_SPREAD_DEG[level]
        return createDefaultSpreadBullets({ centerAngle, count, spreadDeg, now })
    }

    const yellowDamage = (tech.id as TechniqueId) === 'yellow_beam' ? LEVEL_YELLOW_DAMAGE[level] : undefined
    const purpleSpeed = (tech.id as TechniqueId) === 'purple' ? (tech.speed * LEVEL_PURPLE_SPEED[level]) : undefined

    return [
        createBaseBullet(
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
        ),
    ]
}
