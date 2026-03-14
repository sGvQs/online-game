'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    DINO_X,
    DINO_Y,
    BULLET_ORIGIN_Y_OFFSET,
    GAME_STATE_THROTTLE_MS,
    SPECIAL_ATTACK_BULLET_COUNT,
    SPECIAL_ATTACK_LEVEL_PARAMS,
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
import type {
    Asteroid,
    Bullet,
    Difficulty,
    FirePayload,
    GameResult,
    GameStats,
    GameStatePayload,
    GameEndPayload,
    NormalAttackLevel,
} from '@/types/starShieldGame'

type Score = { spawned: number; destroyed: number }

interface UseGameChannelParams {
    matchId: string
    isShooter: boolean
    maxStarHp: number
    level: NormalAttackLevel
    // Shared refs
    asteroidsRef: MutableRefObject<Asteroid[]>
    bulletsRef: MutableRefObject<Bullet[]>
    scoreRef: MutableRefObject<Score>
    starHpRef: MutableRefObject<number>
    fireCountRef: MutableRefObject<number>
    levelRef: MutableRefObject<NormalAttackLevel>
    aimRef: MutableRefObject<{ x: number; y: number }>
    autoAimNearestRef: MutableRefObject<boolean>
    specialAttackLevelRef: MutableRefObject<SpecialAttackLevel>
    gameEndedRef: MutableRefObject<boolean>
    // React setters
    setAsteroids: Dispatch<SetStateAction<Asteroid[]>>
    setBullets: Dispatch<SetStateAction<Bullet[]>>
    setScore: Dispatch<SetStateAction<Score>>
    setStarHp: Dispatch<SetStateAction<number>>
    setTypistFireCount: Dispatch<SetStateAction<number>>
    // Callbacks
    playVoice: (key: string) => void
    onGameEnd: (result: GameResult, stats: GameStats, difficulty?: Difficulty) => void
}

/** payload と ref から必殺技レベルを決定（1–10 クランプ込み） */
function resolveSpecialAttackLevel(
    payload: FirePayload | undefined,
    fallbackRef: MutableRefObject<SpecialAttackLevel>
): SpecialAttackLevel {
    const raw = payload?.specialAttackLevel ?? fallbackRef.current
    return Math.max(1, Math.min(10, raw ?? 1)) as SpecialAttackLevel
}

/** 全破壊共通ロジック（heal lv6 / all_destruction） */
function destroyNonBossAsteroids(
    ctx: {
        asteroidsRef: MutableRefObject<Asteroid[]>
        scoreRef: MutableRefObject<Score>
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
    ctx.setAsteroids((prev) => {
        const ids = new Set(toDestroy.map((a) => a.id))
        const next = prev.map((a) => (ids.has(a.id) ? { ...a, destroyedAt: now, hp: 0 } : a))
        ctx.asteroidsRef.current = next
        return next
    })
    ctx.setScore((prev) => {
        const next = { ...prev, destroyed: prev.destroyed + count }
        ctx.scoreRef.current = next
        return next
    })
    ctx.sendGameState()
}

export function useGameChannel({
    matchId,
    isShooter,
    maxStarHp,
    level,
    asteroidsRef,
    bulletsRef,
    scoreRef,
    starHpRef,
    fireCountRef,
    levelRef,
    aimRef,
    autoAimNearestRef,
    specialAttackLevelRef,
    gameEndedRef,
    setAsteroids,
    setBullets,
    setScore,
    setStarHp,
    setTypistFireCount,
    playVoice,
    onGameEnd,
}: UseGameChannelParams): {
    sendGameState: (immediate?: boolean) => void
    sendGameEnd: (result: GameResult, stats: GameStats, difficulty?: Difficulty) => void
    sendFire: (payload: FirePayload) => void
} {
    const supabase = useMemo(() => createClient(), [])
    const channelName = `star_shield_fire_${matchId}`
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    const waveTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
    const lastGameStateSendRef = useRef(0)

    const sendGameState = useCallback((immediate = false) => {
        if (!isShooter) return
        const now = Date.now()
        if (!immediate && now - lastGameStateSendRef.current < GAME_STATE_THROTTLE_MS) return
        lastGameStateSendRef.current = now
        channelRef.current?.send({
            type: 'broadcast',
            event: 'game_state',
            payload: {
                spawned: scoreRef.current.spawned,
                destroyed: scoreRef.current.destroyed,
                fireCount: fireCountRef.current,
                starHp: starHpRef.current,
            } satisfies GameStatePayload,
        })
    }, [isShooter, scoreRef, fireCountRef, starHpRef])

    const sendGameEnd = useCallback((result: GameResult, stats: GameStats, difficulty?: Difficulty) => {
        channelRef.current?.send({
            type: 'broadcast',
            event: 'game_end',
            payload: { result, stats, ...(difficulty != null && { difficulty }) } satisfies GameEndPayload,
        })
    }, [])

    const sendFire = useCallback((payload: FirePayload) => {
        channelRef.current?.send({
            type: 'broadcast',
            event: 'fire',
            payload,
        })
    }, [])

    useEffect(() => {
        const channel = supabase.channel(channelName)
        channelRef.current = channel

        const destroyCtx = {
            asteroidsRef,
            scoreRef,
            setAsteroids,
            setScore,
            playVoice,
            sendGameState,
        }

        const handleHealEffect = (payload: FirePayload, now: number) => {
            if (payload.healLevel == null || payload.healLevel < 1 || payload.healLevel > 6) return

            const recovery = LEVEL_HEAL_RECOVERY[payload.healLevel as 1 | 2 | 3 | 4 | 5 | 6]
            const newHp = Math.min(maxStarHp, starHpRef.current + recovery)
            starHpRef.current = newHp
            setStarHp(newHp)
            sendGameState(true)

            if (payload.healLevel === 6) {
                destroyNonBossAsteroids(destroyCtx, now)
            }
        }

        const handleSpreadSpecialAttack = (payload: FirePayload, now: number) => {
            const specialAttack: SpecialAttackChoice =
                payload.specialAttack && payload.specialAttack in SPECIAL_ATTACK_BULLET_COUNT
                    ? (payload.specialAttack as SpecialAttackChoice)
                    : 'spread'

            if (specialAttack === 'all_destruction') {
                destroyNonBossAsteroids(destroyCtx, now)
                return
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
                setBullets((prev) => {
                    const next = [...prev, ...newBullets]
                    bulletsRef.current = next
                    return next
                })
            }

            if (waveCount <= 1) {
                addWave(now)
            } else {
                for (let w = 0; w < waveCount; w++) {
                    const t = setTimeout(() => addWave(Date.now()), w * waveDelayMs)
                    waveTimeoutsRef.current.push(t)
                }
            }
        }

        const handleNormalAttack = (payload: FirePayload, now: number) => {
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
                level,
                now,
                targetX: aim.x,
                targetY: aim.y,
            })
            setBullets((prev) => {
                const next = [...prev, ...newBullets]
                bulletsRef.current = next
                return next
            })
        }

        channel
            .on('broadcast', { event: 'fire' }, ({ payload }: { payload?: FirePayload }) => {
                fireCountRef.current += 1
                playVoice('shooting')
                if (isShooter) sendGameState()
                if (!isShooter) return

                const now = Date.now()

                if (autoAimNearestRef.current) {
                    const nearestPos = findNearestAsteroidPosition(asteroidsRef.current, DINO_X, DINO_Y, now)
                    if (nearestPos) aimRef.current = { x: nearestPos.x, y: nearestPos.y }
                }

                if (payload?.healLevel != null && payload.healLevel >= 1 && payload.healLevel <= 6) {
                    handleHealEffect(payload, now)
                }

                if (payload?.special) {
                    handleSpreadSpecialAttack(payload, now)
                    return
                }

                handleNormalAttack(payload ?? {}, now)
            })
            .on('broadcast', { event: 'game_state' }, ({ payload }: { payload?: GameStatePayload }) => {
                if (isShooter || !payload) return
                if (payload.starHp < starHpRef.current) playVoice('star-damage')
                setScore({ spawned: payload.spawned, destroyed: payload.destroyed })
                setStarHp(payload.starHp)
                fireCountRef.current = payload.fireCount
                setTypistFireCount(payload.fireCount)
            })
            .on('broadcast', { event: 'game_end' }, ({ payload }: { payload?: GameEndPayload }) => {
                if (isShooter || !payload) return
                if (gameEndedRef.current) return
                gameEndedRef.current = true
                onGameEnd(payload.result, payload.stats, payload.difficulty)
            })
            .subscribe()

        if (isShooter) sendGameState(true)

        return () => {
            waveTimeoutsRef.current.forEach(clearTimeout)
            waveTimeoutsRef.current = []
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId])

    return { sendGameState, sendGameEnd, sendFire }
}
