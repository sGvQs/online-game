'use client'

import { useEffect } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { STAR_TARGET_X, STAR_TARGET_Y, STAR_RADIUS } from '@/components/game/phases/starShieldGame/playing/protectedStar'
import { SPAWN_INTERVALS_MS, ASTEROID_RADIUS } from '@/constants/starShieldGame/gameConfig'
import {
    createAsteroid,
    computeCollisionResult,
    applyHpUpdates,
    getContactAsteroids,
    getExpiredBulletIds,
    getAsteroidPosition,
} from '@/utils/starShieldGame'
import type { Asteroid, Bullet, Difficulty, GameResult } from '@/types/starShieldGame'
import type { NormalAttackLevel } from '@/types/starShieldGame'

type Score = { spawned: number; destroyed: number }
type ChainHits = {
    primaryPos: { x: number; y: number }
    targets: { pos: { x: number; y: number }; asteroidId: string }[]
    color: string
} | null

interface UseAsteroidPhysicsParams {
    matchId: string
    isShooter: boolean
    difficulty: Difficulty
    playersTotalPoints: number
    // Shared refs
    asteroidsRef: MutableRefObject<Asteroid[]>
    bulletsRef: MutableRefObject<Bullet[]>
    scoreRef: MutableRefObject<Score>
    starHpRef: MutableRefObject<number>
    levelRef: MutableRefObject<NormalAttackLevel>
    gameEndedRef: MutableRefObject<boolean>
    contactPendingRef: MutableRefObject<boolean>
    // React setters
    setAsteroids: Dispatch<SetStateAction<Asteroid[]>>
    setBullets: Dispatch<SetStateAction<Bullet[]>>
    setScore: Dispatch<SetStateAction<Score>>
    setStarHp: Dispatch<SetStateAction<number>>
    setContactExplosion: Dispatch<SetStateAction<{ x: number; y: number; asteroidId: string } | null>>
    setChainHits: Dispatch<SetStateAction<ChainHits>>
    // Callbacks
    playVoice: (key: string) => void
    sendGameState: (immediate?: boolean) => void
    endGame: (result: GameResult) => Promise<void>
}

export function useAsteroidPhysics({
    matchId,
    isShooter,
    difficulty,
    playersTotalPoints,
    asteroidsRef,
    bulletsRef,
    scoreRef,
    starHpRef,
    levelRef,
    gameEndedRef,
    contactPendingRef,
    setAsteroids,
    setBullets,
    setScore,
    setStarHp,
    setContactExplosion,
    setChainHits,
    playVoice,
    sendGameState,
    endGame,
}: UseAsteroidPhysicsParams): void {
    useEffect(() => {
        if (!isShooter) return

        const spawnInterval = SPAWN_INTERVALS_MS[difficulty]
        let spawnTimer: ReturnType<typeof setInterval> | null = null
        let rafId: number | null = null

        spawnTimer = setInterval(() => {
            if (gameEndedRef.current || contactPendingRef.current) return
            const asteroid = createAsteroid({
                difficulty,
                playersTotalPoints,
                starTargetX: STAR_TARGET_X,
                starTargetY: STAR_TARGET_Y,
            })
            setAsteroids((prev) => {
                const next = [...prev, asteroid]
                asteroidsRef.current = next
                return next
            })
            setScore((prev) => {
                const next = { ...prev, spawned: prev.spawned + 1 }
                scoreRef.current = next
                return next
            })
            sendGameState()
        }, spawnInterval)

        const gameLoop = () => {
            if (gameEndedRef.current || contactPendingRef.current) return
            const now = Date.now()
            const asts = asteroidsRef.current
            const bts = bulletsRef.current

            // 衝突判定
            const result = computeCollisionResult({
                asteroids: asts,
                bullets: bts,
                now,
                level: levelRef.current,
            })

            if (result.hpUpdates.size > 0) {
                setAsteroids((prev) => {
                    const next = applyHpUpdates(prev, result, now, levelRef.current)
                    asteroidsRef.current = next
                    return next
                })
                setBullets((prev) => {
                    const next = prev.filter((b) => !result.hitBulletIds.has(b.id))
                    bulletsRef.current = next
                    return next
                })
                if (result.chainHits) setChainHits(result.chainHits)
                if (result.destroyedCount > 0) {
                    setScore((prev) => {
                        const next = { ...prev, destroyed: prev.destroyed + result.destroyedCount }
                        scoreRef.current = next
                        return next
                    })
                    sendGameState()
                }
            }

            // 期限切れ弾削除
            const expiredIds = getExpiredBulletIds(bts, now)
            if (expiredIds.size > 0) {
                setBullets((prev) => {
                    const next = prev.filter((b) => !expiredIds.has(b.id))
                    bulletsRef.current = next
                    return next
                })
            }

            // 星への接触判定
            const destroyedThisFrame = new Set(
                [...result.hpUpdates.entries()].filter(([, newHp]) => newHp <= 0).map(([id]) => id)
            )
            const contacts = getContactAsteroids({
                asteroids: asts,
                now,
                destroyedAsteroidIds: destroyedThisFrame,
                starTargetX: STAR_TARGET_X,
                starTargetY: STAR_TARGET_Y,
                starRadius: STAR_RADIUS,
                asteroidRadius: ASTEROID_RADIUS,
            })
            if (contacts.length > 0 && !contactPendingRef.current) {
                playVoice('star-damage')
                const damage = contacts.length
                const newStarHp = Math.max(0, starHpRef.current - damage)
                starHpRef.current = newStarHp
                setStarHp(newStarHp)
                sendGameState(true)
                setAsteroids((prev) => {
                    const contactIds = new Set(contacts.map((c) => c.id))
                    const next = prev.map((a) =>
                        contactIds.has(a.id) ? { ...a, hasDamagedStar: true, destroyedAt: now } : a
                    )
                    asteroidsRef.current = next
                    return next
                })
                if (newStarHp <= 0) {
                    contactPendingRef.current = true
                    const ap = getAsteroidPosition(contacts[0]!, now)
                    setContactExplosion({ x: ap.x, y: ap.y, asteroidId: contacts[0]!.id })
                    return
                }
            }

            rafId = requestAnimationFrame(gameLoop)
        }
        rafId = requestAnimationFrame(gameLoop)

        return () => {
            if (spawnTimer) clearInterval(spawnTimer)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [matchId, isShooter, difficulty, playersTotalPoints, sendGameState, endGame])
}
