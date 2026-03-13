'use client'

import { useEffect } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { STAR_TARGET_X, STAR_TARGET_Y, STAR_RADIUS } from '@/components/game/phases/starShieldGame/playing/protectedStar'
import { SPAWN_INTERVALS_MS, ASTEROID_RADIUS, ABYSS_WAVE_DURATION_SECONDS } from '@/constants/starShieldGame/gameConfig'
import {
    createAsteroid,
    createBossAsteroid,
    computeCollisionResult,
    applyHpUpdates,
    getContactAsteroids,
    getExpiredBulletIds,
    getAsteroidPosition,
} from '@/utils/starShieldGame'
import { awardAbyssWavePoints } from '@/server/actions/game/starShieldActions'
import type { Asteroid, Bullet, GameResult, NormalAttackLevel } from '@/types/starShieldGame'

type Score = { spawned: number; destroyed: number }
type ChainHits = {
    primaryPos: { x: number; y: number }
    targets: { pos: { x: number; y: number }; asteroidId: string }[]
    color: string
} | null

interface UseAbyssPhysicsParams {
    matchId: string
    isShooter: boolean
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
    // ABYSS ウェーブ管理
    waveNumber: number
    setWaveNumber: Dispatch<SetStateAction<number>>
}

export function useAbyssPhysics({
    matchId,
    isShooter,
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
    waveNumber,
    setWaveNumber,
}: UseAbyssPhysicsParams): void {
    useEffect(() => {
        if (!isShooter) return

        // 新ウェーブ開始時: 前ウェーブの残骸をクリア
        contactPendingRef.current = false
        setAsteroids(() => {
            asteroidsRef.current = []
            return []
        })

        const spawnInterval = SPAWN_INTERVALS_MS['ABYSS']
        const waveStartTime = Date.now()
        let phase: 'normal' | 'boss' | 'boss_cleared' = 'normal'
        let spawnTimer: ReturnType<typeof setInterval> | null = null
        let waveTimer: ReturnType<typeof setTimeout> | null = null
        let rafId: number | null = null

        // --- 通常フェーズ: 隕石スポーン ---
        spawnTimer = setInterval(() => {
            if (gameEndedRef.current || phase !== 'normal') return
            const waveElapsedMs = Date.now() - waveStartTime
            const asteroid = createAsteroid({
                difficulty: 'ABYSS',
                waveElapsedMs,
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

        // --- 90秒後: ボスフェーズへ移行 ---
        waveTimer = setTimeout(() => {
            if (gameEndedRef.current) return
            phase = 'boss'
            if (spawnTimer) {
                clearInterval(spawnTimer)
                spawnTimer = null
            }

            // 通常隕石を一掃してボスをスポーン
            const boss = createBossAsteroid({
                waveNumber,
                starTargetX: STAR_TARGET_X,
                starTargetY: STAR_TARGET_Y,
            })
            setAsteroids(() => {
                const next = [boss]
                asteroidsRef.current = next
                return next
            })
            setScore((prev) => {
                const next = { ...prev, spawned: prev.spawned + 1 }
                scoreRef.current = next
                return next
            })
            sendGameState()
        }, ABYSS_WAVE_DURATION_SECONDS * 1000)

        // --- ゲームループ ---
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
                // ボス撃破判定（state 更新前に実施）
                const boss = asts.find((a) => a.isBoss && !a.destroyedAt)
                const bossNewHp = boss ? (result.hpUpdates.get(boss.id) ?? boss.hp) : undefined
                const bossJustDefeated = bossNewHp !== undefined && bossNewHp <= 0 && phase === 'boss'

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

                if (bossJustDefeated) {
                    phase = 'boss_cleared'
                    void awardAbyssWavePoints(matchId).catch((e) => console.error('[ABYSS] ポイント付与失敗:', e))
                    setWaveNumber((n) => n + 1)
                    rafId = null
                    return
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
                const bossContact = contacts.find((a) => a.isBoss)

                if (bossContact) {
                    // ボス接触 = 星HP に関わらず即ゲームオーバー
                    contactPendingRef.current = true
                    const ap = getAsteroidPosition(bossContact, now)
                    setContactExplosion({ x: ap.x, y: ap.y, asteroidId: bossContact.id })
                    return
                }

                // 通常隕石接触（通常フェーズのみ発生）
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
            if (waveTimer) clearTimeout(waveTimer)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [matchId, isShooter, waveNumber, sendGameState, endGame])
}
