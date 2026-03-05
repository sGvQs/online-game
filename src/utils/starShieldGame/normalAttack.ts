/**
 * 通常攻撃の弾生成（純粋関数）
 */

import type { TechniqueConfig } from '@/constants/starShieldGame/techniques'
import type { Bullet, Difficulty } from '@/types/starShieldGame'
import {
    DINO_X,
    DINO_Y,
    BULLET_SPAWN_OFFSET_X,
    BULLET_SPAWN_OFFSET_Y,
    HELL_NORMAL_BULLET_COUNT,
    HELL_NORMAL_SPREAD_DEG,
} from '@/constants/starShieldGame/gameConfig'

function createBaseBullet(
    o: { dirX: number; dirY: number; startX: number; startY: number },
    tech: TechniqueConfig | null,
    now: number
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
        return {
            ...base,
            damage: tech.damage,
            speed: tech.speed,
            technique: tech.id,
            piercing: tech.piercing,
        }
    }
    return base
}

/**
 * 通常攻撃の弾を生成する（純粋関数）
 */
export function createNormalAttackBullets(params: {
    tech: TechniqueConfig | null
    centerAngle: number
    dirX: number
    dirY: number
    difficulty: Difficulty
    now: number
}): Bullet[] {
    const { tech, centerAngle, dirX, dirY, difficulty, now } = params

    if (tech?.count && tech.count > 1) {
        const verticalOffset = tech.verticalOffset ?? 0
        const result: Bullet[] = []
        for (let i = 0; i < tech.count; i++) {
            const offsetDist = i * verticalOffset
            const startX = DINO_X + dirX * BULLET_SPAWN_OFFSET_X + dirX * offsetDist
            const startY = DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y + dirY * offsetDist
            result.push(createBaseBullet({ dirX, dirY, startX, startY }, tech, now))
        }
        return result
    }

    if (difficulty === 'HELL' && !tech) {
        const spreadRad = (HELL_NORMAL_SPREAD_DEG * Math.PI) / 180
        const count = HELL_NORMAL_BULLET_COUNT
        const result: Bullet[] = []
        for (let i = 0; i < count; i++) {
            const angle =
                centerAngle -
                spreadRad / 2 +
                (count > 1 ? (spreadRad * i) / (count - 1) : 0)
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

    return [
        createBaseBullet(
            {
                dirX,
                dirY,
                startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
            },
            tech,
            now
        ),
    ]
}
