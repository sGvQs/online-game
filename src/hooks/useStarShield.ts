'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSE } from '@/hooks/useSE'
import { saveStarShieldResult } from '@/server/actions/game'
import { STAR_TARGET_X, STAR_TARGET_Y, STAR_RADIUS } from '@/components/game/phases/starShieldGame/playing/protectedStar'
import {
    GAME_DURATION_SECONDS,
    GAME_STATE_THROTTLE_MS,
    DINO_X,
    DINO_Y,
    BULLET_ORIGIN_Y_OFFSET,
    BULLET_MAX_AGE_MS,
    SPAWN_INTERVALS_MS,
    ASTEROID_RADIUS,
    STAR_HP,
    LEVEL_STAR_HP,
    SPECIAL_ATTACK_BULLET_COUNT,
    SPECIAL_ATTACK_LEVEL_PARAMS,
} from '@/constants/starShieldGame/gameConfig'
import type { SpecialAttackLevel } from '@/constants/starShieldGame/gameConfig'
import { LEVEL_HEAL_RECOVERY } from '@/constants/starShieldGame/skillConfig'
import { DIALOGUES, pickRandomDialogue } from '@/constants/starShieldGame/dialogues'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
import type { Asteroid, Bullet, DialogueLine, Difficulty, GameResult, GameStats, GameStatePayload, GameEndPayload, NormalAttackLevel } from '@/types/starShieldGame'
import {
    getAsteroidPosition,
    getRomaji,
    findNearestAsteroidPosition,
    createNormalAttackBullets,
    createSpecialAttackBullets,
    createAsteroid,
    computeCollisionResult,
    applyHpUpdates,
    getContactAsteroids,
    getExpiredBulletIds,
    calcRemainingSeconds,
    resolveStartTime,
    createGameStats,
    aimToCenterAngle,
    aimToDirection,
} from '@/utils/starShieldGame'

// ============================================
// Hook
// ============================================

interface UseStarShieldProps {
    matchId: string
    startedAt: number   // Unix ms timestamp（マッチ作成時刻）
    isShooter: boolean
    difficulty: Difficulty
    currentUserId: string
    onGameEnd: (result: GameResult, stats: GameStats) => void
    /** HELL 難易度時、両プレイヤーの合計 pt で隕石速度を調整（6000 - totalPt） */
    playersTotalPoints?: number
    /** Typist が選択した通常攻撃（1文字打鍵ごと） */
    selectedNormalAttack?: TechniqueId | null
    /** Typist が選択した必殺技（単語完了時） */
    selectedSpecialAttack?: SpecialAttackChoice
    /** Typist が選択した必殺技レベル（1-10） */
    selectedSpecialAttackLevel?: SpecialAttackLevel
    /** Typist が選択したヒールレベル（単語完了時、1-6。null は未使用） */
    selectedHealLevel?: number | null
    /** 星のHPレベル（1-5）。指定時は LEVEL_STAR_HP を使用。未指定時は難易度ベースにフォールバック */
    starHpLevel?: number
    /** tech=null 時の散弾数レベル（1-5、5=Lv. .max） */
    level?: NormalAttackLevel
    /** デバッグ: 発射時に最も近い隕石を照準にする（準備画面で設定） */
    autoAimNearest?: boolean
}

export function useStarShield({
    matchId,
    startedAt,
    isShooter,
    difficulty,
    onGameEnd,
    playersTotalPoints = 0,
    selectedNormalAttack = null,
    selectedSpecialAttack = 'spread',
    selectedSpecialAttackLevel = 1,
    selectedHealLevel = null,
    starHpLevel,
    level = 1,
    autoAimNearest = false,
}: UseStarShieldProps) {
    const supabase = useMemo(() => createClient(), [])
    const channelName = `star_shield_fire_${matchId}`
    const { play } = useSE()
    const playVoiceRef = useRef(play)
    playVoiceRef.current = play

    // ゲーム状態（Shooter のみ asteroids, bullets を管理、Typist は不要）
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [bullets, setBullets] = useState<Bullet[]>([])
    const [timer, setTimer] = useState(GAME_DURATION_SECONDS)
    const [score, setScore] = useState({ spawned: 0, destroyed: 0 })
    const maxStarHp =
        starHpLevel != null && starHpLevel >= 1 && starHpLevel <= 5
            ? LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]
            : STAR_HP[difficulty]
    const [starHp, setStarHp] = useState(maxStarHp)

    // タイピング状態（Typist のみ）：配列からランダムに選択
    const [currentLine, setCurrentLine] = useState<DialogueLine | null>(() =>
        isShooter ? null : pickRandomDialogue()
    )
    const [charIndex, setCharIndex] = useState(0)
    /** Typist の正解打鍵回数（発射エフェクト用・最後の1文字も含む） */
    const [typistFireCount, setTypistFireCount] = useState(0)

    // Refs
    const asteroidsRef = useRef<Asteroid[]>([])
    const bulletsRef = useRef<Bullet[]>([])
    const scoreRef = useRef({ spawned: 0, destroyed: 0 })
    const fireCountRef = useRef(0)
    const starHpRef = useRef(maxStarHp)
    const aimRef = useRef({ x: 0.5, y: 0.5 }) // 正規化座標 0-1
    const autoAimNearestRef = useRef(autoAimNearest)
    const levelRef = useRef(level)
    const specialAttackLevelRef = useRef(selectedSpecialAttackLevel)
    const gameEndedRef = useRef(false)
    const contactPendingRef = useRef(false)
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    const waveTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
    /** 時刻ズレ補正時のみセット。duration 計算で使用 */
    const effectiveStartedAtRef = useRef<number | null>(null)
    const lastGameStateSendRef = useRef(0)

    useEffect(() => {
        starHpRef.current = starHp
    }, [starHp])

    useEffect(() => {
        autoAimNearestRef.current = autoAimNearest
    }, [autoAimNearest])

    useEffect(() => {
        levelRef.current = level
    }, [level])

    useEffect(() => {
        specialAttackLevelRef.current = selectedSpecialAttackLevel
    }, [selectedSpecialAttackLevel])

    /** Shooter: game_state を broadcast（スロットリング付き） */
    const sendGameState = useCallback(() => {
        if (!isShooter) return
        const now = Date.now()
        if (now - lastGameStateSendRef.current < GAME_STATE_THROTTLE_MS) return
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
    }, [isShooter])

    /** 隕石接触時の爆発位置・対象隕石ID（アニメ終了後に FAILED 遷移、対象隕石は非表示） */
    const [contactExplosion, setContactExplosion] = useState<{ x: number; y: number; asteroidId: string } | null>(null)
    /** オレンジ連鎖時: 弾が当たった隕石から波及先への玉の表示用 */
    const [chainHits, setChainHits] = useState<{
        primaryPos: { x: number; y: number }
        targets: { pos: { x: number; y: number }; asteroidId: string }[]
        color: string
    } | null>(null)

    // ============================================
    // ゲーム終了処理
    // ============================================

    const endGame = useCallback(async (result: GameResult) => {
        if (gameEndedRef.current) return
        gameEndedRef.current = true

        const baseStartedAt = effectiveStartedAtRef.current ?? startedAt
        const stats = createGameStats({
            baseStartedAt,
            spawnedCount: scoreRef.current.spawned,
            destroyedCount: scoreRef.current.destroyed,
            fireCount: fireCountRef.current,
        })

        // Shooter: DB 保存を先に完了してから結果画面へ（returnToRoom による Match 削除との競合を防ぐ）
        if (isShooter) {
            try {
                await saveStarShieldResult(matchId, {
                    spawnedCount: stats.spawnedCount,
                    destroyedCount: stats.destroyedCount,
                    fireCount: stats.fireCount,
                    isCleared: result === 'CLEARED',
                    failureReason: result !== 'CLEARED' ? result : undefined,
                    durationSeconds: stats.durationSeconds,
                    difficulty,
                })
            } catch (e) {
                console.error('結果保存失敗:', e)
            }
            // Typist へ game_end を broadcast（postgres_changes の代替）
            channelRef.current?.send({
                type: 'broadcast',
                event: 'game_end',
                payload: { result, stats } satisfies GameEndPayload,
            })
        }

        onGameEnd(result, stats)
    }, [isShooter, matchId, startedAt, onGameEnd, difficulty])

    // ============================================
    // Supabase Realtime チャンネル
    // ============================================

    useEffect(() => {
        const channel = supabase.channel(channelName)
        channelRef.current = channel

        channel
            .on('broadcast', { event: 'fire' }, ({ payload }: { payload?: { special?: boolean; technique?: string; specialAttack?: SpecialAttackChoice; specialAttackLevel?: SpecialAttackLevel; healLevel?: number } }) => {
                fireCountRef.current += 1
                playVoiceRef.current('shooting')
                if (isShooter) sendGameState()
                if (!isShooter) return

                const now = Date.now()

                if (autoAimNearestRef.current) {
                    const nearestPos = findNearestAsteroidPosition(asteroidsRef.current, DINO_X, DINO_Y, now)
                    if (nearestPos) {
                        aimRef.current = { x: nearestPos.x, y: nearestPos.y }
                    }
                }

                // 単語完了時: ヒール処理（必殺技より先に実行）
                if (payload?.healLevel != null && payload.healLevel >= 1 && payload.healLevel <= 6) {
                    const recovery = LEVEL_HEAL_RECOVERY[payload.healLevel as 1 | 2 | 3 | 4 | 5 | 6]
                    const newHp = Math.min(maxStarHp, starHpRef.current + recovery)
                    starHpRef.current = newHp
                    setStarHp(newHp)
                    lastGameStateSendRef.current = 0
                    sendGameState()

                    // ヒール lv6: 全破壊
                    if (payload.healLevel === 6) {
                        playVoiceRef.current('star-damage')
                        const asts = asteroidsRef.current
                        const toDestroy = asts.filter((a) => !a.destroyedAt)
                        const destroyedCount = toDestroy.length
                        if (toDestroy.length > 0) {
                            setAsteroids((prev) => {
                                const ids = new Set(toDestroy.map((a) => a.id))
                                const next = prev.map((a) =>
                                    ids.has(a.id) ? { ...a, destroyedAt: now, hp: 0 } : a
                                )
                                asteroidsRef.current = next
                                return next
                            })
                            setScore((prev) => {
                                const next = { ...prev, destroyed: prev.destroyed + destroyedCount }
                                scoreRef.current = next
                                return next
                            })
                            sendGameState()
                        }
                    }
                }

                if (payload?.special) {
                    const specialAttack: SpecialAttackChoice =
                        payload?.specialAttack && payload.specialAttack in SPECIAL_ATTACK_BULLET_COUNT
                            ? (payload.specialAttack as SpecialAttackChoice)
                            : 'spread'
                    const useAllDestruction = specialAttack === 'all_destruction'

                    if (useAllDestruction) {
                        playVoiceRef.current('star-damage')
                        const asts = asteroidsRef.current
                        const toDestroy = asts.filter((a) => !a.destroyedAt)
                        const destroyedCount = toDestroy.length

                        if (toDestroy.length > 0) {
                            setAsteroids((prev) => {
                                const ids = new Set(toDestroy.map((a) => a.id))
                                const next = prev.map((a) =>
                                    ids.has(a.id) ? { ...a, destroyedAt: now, hp: 0 } : a
                                )
                                asteroidsRef.current = next
                                return next
                            })
                            setScore((prev) => {
                                const next = { ...prev, destroyed: prev.destroyed + destroyedCount }
                                scoreRef.current = next
                                return next
                            })
                            sendGameState()
                        }
                    }

                    const aim = aimRef.current
                    const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
                    const centerAngle = aimToCenterAngle(aim.x, aim.y, DINO_X, originY)
                    const techId = payload?.technique as TechniqueId | undefined
                    const tech = techId && techId in TECHNIQUES ? TECHNIQUES[techId] : null
                    const rawLevel = payload?.specialAttackLevel ?? specialAttackLevelRef.current
                    const specLv = Math.max(1, Math.min(10, rawLevel)) as SpecialAttackLevel
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
                            const t = setTimeout(() => {
                                addWave(Date.now())
                            }, w * waveDelayMs)
                            waveTimeoutsRef.current.push(t)
                        }
                    }
                    return
                }

                const aim = aimRef.current
                const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
                const dir = aimToDirection(aim.x, aim.y, DINO_X, originY)
                if (!dir) return

                const centerAngle = aimToCenterAngle(aim.x, aim.y, DINO_X, originY)
                const techId = payload?.technique as TechniqueId | undefined
                const tech = techId && techId in TECHNIQUES ? TECHNIQUES[techId] : null

                const newBullets = createNormalAttackBullets({
                    tech,
                    centerAngle,
                    dirX: dir.dirX,
                    dirY: dir.dirY,
                    level,
                    now,
                })
                setBullets((prev) => {
                    const next = [...prev, ...newBullets]
                    bulletsRef.current = next
                    return next
                })
            })
            .on('broadcast', { event: 'game_state' }, ({ payload }: { payload?: GameStatePayload }) => {
                if (isShooter || !payload) return
                if (payload.starHp < starHpRef.current) playVoiceRef.current('star-damage')
                setScore({ spawned: payload.spawned, destroyed: payload.destroyed })
                setStarHp(payload.starHp)
                fireCountRef.current = payload.fireCount
                setTypistFireCount(payload.fireCount)
            })
            .on('broadcast', { event: 'game_end' }, ({ payload }: { payload?: GameEndPayload }) => {
                if (isShooter || !payload) return
                if (gameEndedRef.current) return
                gameEndedRef.current = true
                onGameEnd(payload.result, payload.stats)
            })
            .subscribe()

        if (isShooter) {
            lastGameStateSendRef.current = 0
            sendGameState()
        }

        return () => {
            waveTimeoutsRef.current.forEach(clearTimeout)
            waveTimeoutsRef.current = []
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId])

    // ============================================
    // タイマー
    // ============================================

    useEffect(() => {
        effectiveStartedAtRef.current = null

        const { effectiveStartedAt, initialRemaining } = resolveStartTime(startedAt, GAME_DURATION_SECONDS)
        effectiveStartedAtRef.current = effectiveStartedAt
        setTimer(initialRemaining)

        const interval = setInterval(() => {
            const base = effectiveStartedAtRef.current ?? startedAt
            const remaining = calcRemainingSeconds(base, GAME_DURATION_SECONDS)
            setTimer(remaining)

            if (remaining <= 0) {
                clearInterval(interval)
                if (!isShooter || gameEndedRef.current) return
                endGame('CLEARED')
            }
        }, 1000)

        return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId, startedAt])

    // ============================================
    // Shooter のみ: 隕石スポーン + 接触ゲームオーバー検知
    // ============================================

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

            const expiredIds = getExpiredBulletIds(bts, now)
            if (expiredIds.size > 0) {
                setBullets((prev) => {
                    const next = prev.filter((b) => !expiredIds.has(b.id))
                    bulletsRef.current = next
                    return next
                })
            }

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
                playVoiceRef.current('star-damage')
                const damage = contacts.length
                const newStarHp = Math.max(0, starHpRef.current - damage)
                starHpRef.current = newStarHp
                setStarHp(newStarHp)
                lastGameStateSendRef.current = 0
                sendGameState()
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
                    const ap = getAsteroidPosition(contacts[0], now)
                    setContactExplosion({ x: ap.x, y: ap.y, asteroidId: contacts[0].id })
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
    }, [matchId, isShooter, difficulty, playersTotalPoints, sendGameState])

    // ============================================
    // マウス操作（Shooter）
    // ============================================

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        aimRef.current = {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        }
    }, [])

    // ============================================
    // キーボード入力（Typist）
    // ============================================

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameEndedRef.current) return
        if (e.key.length !== 1) return

        const line = currentLine
        if (!line) return

        const romaji = getRomaji(line.text)
        const expected = romaji[charIndex]
        if (e.key.toLowerCase() !== expected) return

        const nextChar = charIndex + 1
        const isLastChar = nextChar >= romaji.length

        const payload: { special: boolean; technique?: string; specialAttack?: SpecialAttackChoice; specialAttackLevel?: SpecialAttackLevel; healLevel?: number } = { special: isLastChar }
        if (selectedNormalAttack != null) payload.technique = selectedNormalAttack
        if (isLastChar) {
            payload.specialAttack = selectedSpecialAttack
            payload.specialAttackLevel = selectedSpecialAttackLevel
            if (selectedHealLevel != null && selectedHealLevel >= 1 && selectedHealLevel <= 6) {
                payload.healLevel = selectedHealLevel
            }
        }
        channelRef.current?.send({
            type: 'broadcast',
            event: 'fire',
            payload,
        })
        playVoiceRef.current('shooting')

        if (isLastChar) {
            setCurrentLine(pickRandomDialogue())
            setCharIndex(0)
        } else {
            setCharIndex(nextChar)
        }
    }, [currentLine, charIndex, selectedNormalAttack, selectedSpecialAttack, selectedSpecialAttackLevel, selectedHealLevel])

    useEffect(() => {
        if (isShooter) return
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isShooter, onKeyDown])

    const completeContactFail = useCallback(() => {
        setContactExplosion(null)
        endGame('FAILED_CONTACT')
    }, [endGame])

    const clearChainHits = useCallback(() => {
        setChainHits(null)
    }, [])

    return {
        asteroids,
        bullets,
        timer,
        score,
        starHp,
        aimRef,
        onMouseMove,
        dialogue: {
            line: currentLine ?? DIALOGUES[0],
            charIndex,
        },
        typistFireCount,
        contactExplosion,
        completeContactFail,
        chainHits,
        clearChainHits,
    }
}
