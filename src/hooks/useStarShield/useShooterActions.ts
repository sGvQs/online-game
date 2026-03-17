'use client'

import { useRef, useCallback, useMemo } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import {
    DINO_X,
    DINO_Y,
    BULLET_ORIGIN_Y_OFFSET,
    SPECIAL_ATTACK_LEVEL_PARAMS,
    SPECIAL_ATTACK_BULLET_COUNT,
} from '@/constants/starShieldGame/gameConfig'
import type { SpecialAttackLevel } from '@/constants/starShieldGame/gameConfig'
import { LEVEL_HEAL_RECOVERY } from '@/constants/starShieldGame/skillConfig'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
import {
    findNearestAsteroidPosition,
    createNormalAttackBullets,
    createSpecialAttackBullets,
    aimToCenterAngle,
    aimToDirection,
} from '@/utils/starShieldGame'
import type { Asteroid, Bullet, FirePayload, NormalAttackLevel } from '@/types/starShieldGame'

type Score = { spawned: number; destroyed: number }

interface UseShooterActionsParams {
    maxStarHp: number
    levelRef: RefObject<NormalAttackLevel>
    asteroidsRef: RefObject<Asteroid[]>
    bulletsRef: RefObject<Bullet[]>
    scoreRef: RefObject<Score>
    starHpRef: RefObject<number>
    aimRef: RefObject<{ x: number; y: number }>
    autoAimNearestRef: RefObject<boolean>
    specialAttackLevelRef: RefObject<SpecialAttackLevel>
    setAsteroids: Dispatch<SetStateAction<Asteroid[]>>
    setBullets: Dispatch<SetStateAction<Bullet[]>>
    setScore: Dispatch<SetStateAction<Score>>
    setStarHp: Dispatch<SetStateAction<number>>
    playVoice: (key: string) => void
    sendGameState: (immediate?: boolean) => void
}

/** payload と ref から必殺技レベルを決定（1–10 クランプ込み） */
function resolveSpecialAttackLevel(
    payload: FirePayload | undefined,
    fallbackRef: RefObject<SpecialAttackLevel>
): SpecialAttackLevel {
    const raw = payload?.specialAttackLevel ?? fallbackRef.current
    return Math.max(1, Math.min(10, raw ?? 1)) as SpecialAttackLevel
}

/** 全破壊共通ロジック（heal lv6 / all_destruction） */
function destroyNonBossAsteroids(
    ctx: {
        asteroidsRef: RefObject<Asteroid[]>
        scoreRef: RefObject<Score>
        setAsteroids: Dispatch<SetStateAction<Asteroid[]>>
        setScore: Dispatch<SetStateAction<Score>>
        playVoice: (key: string) => void
        sendGameState: (immediate?: boolean) => void
    },
    now: number
): void {
    const toDestroy = ctx.asteroidsRef.current.filter((a) => !a.destroyedAt && !a.isBoss)
    if (toDestroy.length === 0) return

    ctx.playVoice('star-damage')
    const count = toDestroy.length
    const ids = new Set(toDestroy.map((a) => a.id))
    const nextAsteroids = ctx.asteroidsRef.current.map((a) => (ids.has(a.id) ? { ...a, destroyedAt: now, hp: 0 } : a))
    ctx.asteroidsRef.current = nextAsteroids
    ctx.setAsteroids(nextAsteroids)
    const nextScore = { ...ctx.scoreRef.current, destroyed: ctx.scoreRef.current.destroyed + count }
    ctx.scoreRef.current = nextScore
    ctx.setScore(nextScore)
    ctx.sendGameState()
}

export function useShooterActions({
    maxStarHp,
    levelRef,
    asteroidsRef,
    bulletsRef,
    scoreRef,
    starHpRef,
    aimRef,
    autoAimNearestRef,
    specialAttackLevelRef,
    setAsteroids,
    setBullets,
    setScore,
    setStarHp,
    playVoice,
    sendGameState,
}: UseShooterActionsParams) {
    const waveTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

    const destroyCtx = useMemo(() => ({
        asteroidsRef,
        scoreRef,
        setAsteroids,
        setScore,
        playVoice,
        sendGameState,
    }), [asteroidsRef, scoreRef, setAsteroids, setScore, playVoice, sendGameState])

    const clearTimeouts = useCallback(() => {
        waveTimeoutsRef.current.forEach(clearTimeout)
        waveTimeoutsRef.current = []
    }, [])

    const handleHealEffect = useCallback(
        (payload: FirePayload, now: number) => {
            if (payload.healLevel == null || payload.healLevel < 1 || payload.healLevel > 6) return

            const recovery = LEVEL_HEAL_RECOVERY[payload.healLevel as 1 | 2 | 3 | 4 | 5 | 6]
            const newHp = Math.min(maxStarHp, starHpRef.current + recovery)
            starHpRef.current = newHp
            setStarHp(newHp)
            sendGameState(true)

            if (payload.healLevel === 6) {
                destroyNonBossAsteroids(destroyCtx, now)
            }
        },
        [maxStarHp, starHpRef, setStarHp, sendGameState, destroyCtx]
    )

    const handleSpreadSpecialAttack = useCallback(
        (payload: FirePayload, now: number) => {
            const specialAttack: SpecialAttackChoice =
                payload.specialAttack && payload.specialAttack in SPECIAL_ATTACK_BULLET_COUNT
                    ? (payload.specialAttack as SpecialAttackChoice)
                    : 'spread'

            if (specialAttack === 'all_destruction') {
                // return してはいけない。all_destructionと必殺技は別物だから
                destroyNonBossAsteroids(destroyCtx, now)
            }

            const aim = aimRef.current
            const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
            const centerAngle = aimToCenterAngle(aim.x, aim.y, DINO_X, originY)
            const techId = payload.technique as TechniqueId | undefined
            const tech = techId && techId in TECHNIQUES ? TECHNIQUES[techId] : null
            const specLv = resolveSpecialAttackLevel(payload, specialAttackLevelRef)
            const { waveCount, waveDelayMs } = SPECIAL_ATTACK_LEVEL_PARAMS[specLv]
            const normalLv = levelRef.current

            const addWave = (waveNow: number) => {
                const newBullets = createSpecialAttackBullets({
                    specialAttack,
                    centerAngle,
                    tech,
                    specialAttackLevel: specLv,
                    normalAttackLevel: normalLv,
                    now: waveNow,
                })
                const nextBullets = [...bulletsRef.current, ...newBullets]
                bulletsRef.current = nextBullets
                setBullets(nextBullets)
            }

            if (waveCount <= 1) {
                addWave(now)
            } else {
                for (let w = 0; w < waveCount; w++) {
                    const t = setTimeout(() => addWave(Date.now()), w * waveDelayMs)
                    waveTimeoutsRef.current.push(t)
                }
            }
        },
        [aimRef, specialAttackLevelRef, levelRef, setBullets, destroyCtx, bulletsRef]
    )

    const handleNormalAttack = useCallback(
        (payload: FirePayload, now: number) => {
            const aim = aimRef.current
            const dir = aimToDirection(aim.x, aim.y, DINO_X, DINO_Y + BULLET_ORIGIN_Y_OFFSET)
            if (!dir) return
            const centerAngle = aimToCenterAngle(aim.x, aim.y, DINO_X, DINO_Y + BULLET_ORIGIN_Y_OFFSET)
            const techId = payload.technique as TechniqueId | undefined
            const tech = techId && techId in TECHNIQUES ? TECHNIQUES[techId] : null
            const newBullets = createNormalAttackBullets({
                tech,
                centerAngle,
                dirX: dir.dirX,
                dirY: dir.dirY,
                level: levelRef.current,
                now,
                targetX: aim.x,
                targetY: aim.y,
            })
            const nextBullets = [...bulletsRef.current, ...newBullets]
            bulletsRef.current = nextBullets
            setBullets(nextBullets)
        },
        [aimRef, levelRef, setBullets, bulletsRef]
    )

    const onReceiveFire = useCallback(
        (payload: FirePayload) => {
            const now = Date.now()

            if (autoAimNearestRef.current) {
                const nearestPos = findNearestAsteroidPosition(asteroidsRef.current, DINO_X, DINO_Y, now)
                if (nearestPos) aimRef.current = { x: nearestPos.x, y: nearestPos.y }
            }

            try {
                if (payload?.healLevel != null && payload.healLevel >= 1 && payload.healLevel <= 6) {
                    handleHealEffect(payload, now)
                }
            } catch (e) {
                console.error('[handleHealEffect]', e)
            }

            if (payload?.special) {
                handleSpreadSpecialAttack(payload, now)
                return
            }

            handleNormalAttack(payload, now)
        },
        [autoAimNearestRef, asteroidsRef, aimRef, handleHealEffect, handleSpreadSpecialAttack, handleNormalAttack]
    )

    return {
        onReceiveFire,
        clearTimeouts,
    }
}
