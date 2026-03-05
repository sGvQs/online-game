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
    BULLET_SPAWN_OFFSET_X,
    BULLET_SPAWN_OFFSET_Y,
    BULLET_ORIGIN_Y_OFFSET,
    SPAWN_X_MIN,
    SPAWN_X_MAX,
    SPAWN_Y_MIN,
    SPAWN_Y_MAX,
    ASTEROID_DURATION_MS,
    HELL_ASTEROID_DURATION_BASE,
    HELL_ASTEROID_DURATION_MIN,
    BULLET_RADIUS,
    ASTEROID_RADIUS,
    BULLET_MAX_AGE_MS,
    STAR_TARGET_OFFSET,
    SPAWN_INTERVALS_MS,
    ASTEROID_HP,
    STAR_HP,
    SPECIAL_ATTACK_BULLET_COUNT,
    SPECIAL_ATTACK_SPREAD_DEG,
    HELL_NORMAL_BULLET_COUNT,
    HELL_NORMAL_SPREAD_DEG,
} from '@/constants/starShieldGame/gameConfig'
import { DIALOGUES, pickRandomDialogue } from '@/constants/starShieldGame/dialogues'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
import type { Asteroid, Bullet, DialogueLine, Difficulty, GameResult, GameStats, GameStatePayload, GameEndPayload } from '@/types/starShieldGame'
import { getBulletPosition, getAsteroidPosition, getRomaji, findNearestAsteroidPosition } from '@/utils/starShieldGame'

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
    selectedSpecialAttack = 'spread_medium',
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
    const maxStarHp = STAR_HP[difficulty]
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
    const gameEndedRef = useRef(false)
    const contactPendingRef = useRef(false)
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    /** 時刻ズレ補正時のみセット。duration 計算で使用 */
    const effectiveStartedAtRef = useRef<number | null>(null)
    const lastGameStateSendRef = useRef(0)

    useEffect(() => {
        starHpRef.current = starHp
    }, [starHp])

    useEffect(() => {
        autoAimNearestRef.current = autoAimNearest
    }, [autoAimNearest])

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
        const durationSeconds = Math.round((Date.now() - baseStartedAt) / 1000)
        const stats: GameStats = {
            spawnedCount: scoreRef.current.spawned,
            destroyedCount: scoreRef.current.destroyed,
            durationSeconds,
            fireCount: fireCountRef.current,
        }

        // Shooter: DB 保存を先に完了してから結果画面へ（returnToRoom による Match 削除との競合を防ぐ）
        if (isShooter) {
            try {
                await saveStarShieldResult(matchId, {
                    spawnedCount: stats.spawnedCount,
                    destroyedCount: stats.destroyedCount,
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
            .on('broadcast', { event: 'fire' }, ({ payload }: { payload?: { special?: boolean; technique?: string; specialAttack?: SpecialAttackChoice } }) => {
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

                if (payload?.special) {
                    const specialAttack: SpecialAttackChoice =
                        payload?.specialAttack && payload.specialAttack in SPECIAL_ATTACK_BULLET_COUNT
                            ? (payload.specialAttack as SpecialAttackChoice)
                            : 'spread_medium'
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

                    const bulletCount = SPECIAL_ATTACK_BULLET_COUNT[specialAttack]
                    const spreadDeg = SPECIAL_ATTACK_SPREAD_DEG[specialAttack]
                    const aim = aimRef.current
                    const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
                    const dx = aim.x - DINO_X
                    const dy = aim.y - originY
                    const len = Math.hypot(dx, dy)
                    const centerAngle = len >= 0.001 ? Math.atan2(dy, dx) : 0
                    const spreadRad = (spreadDeg * Math.PI) / 180
                    const newBullets: Bullet[] = []
                    for (let i = 0; i < bulletCount; i++) {
                        const angle =
                            centerAngle -
                            spreadRad / 2 +
                            (bulletCount > 1 ? (spreadRad * i) / (bulletCount - 1) : 0)
                        const dirX = Math.cos(angle)
                        const dirY = Math.sin(angle)
                        newBullets.push({
                            id: crypto.randomUUID(),
                            firedAt: now,
                            startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                            startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
                            dirX,
                            dirY,
                        })
                    }
                    setBullets((prev) => {
                        const next = [...prev, ...newBullets]
                        bulletsRef.current = next
                        return next
                    })
                    return
                }

                const aim = aimRef.current
                const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
                const dx = aim.x - DINO_X
                const dy = aim.y - originY
                const len = Math.hypot(dx, dy)
                if (len < 0.001) return

                const centerAngle = Math.atan2(dy, dx)
                const dirX = dx / len
                const dirY = dy / len

                const techId = payload?.technique as TechniqueId | undefined
                const tech = techId && techId in TECHNIQUES ? TECHNIQUES[techId] : null

                const createBullet = (o: { dirX: number; dirY: number; startX: number; startY: number }) => {
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

                if (tech?.count && tech.count > 1) {
                    const verticalOffset = tech.verticalOffset ?? 0
                    const newBullets: Bullet[] = []
                    for (let i = 0; i < tech.count; i++) {
                        const offsetDist = i * verticalOffset
                        const startX = DINO_X + dirX * BULLET_SPAWN_OFFSET_X + dirX * offsetDist
                        const startY = DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y + dirY * offsetDist
                        newBullets.push(
                            createBullet({ dirX, dirY, startX, startY })
                        )
                    }
                    setBullets((prev) => {
                        const next = [...prev, ...newBullets]
                        bulletsRef.current = next
                        return next
                    })
                } else if (difficulty === 'HELL' && !tech) {
                    const spreadRad = (HELL_NORMAL_SPREAD_DEG * Math.PI) / 180
                    const count = HELL_NORMAL_BULLET_COUNT
                    const newBullets: Bullet[] = []
                    for (let i = 0; i < count; i++) {
                        const angle =
                            centerAngle -
                            spreadRad / 2 +
                            (count > 1 ? (spreadRad * i) / (count - 1) : 0)
                        const bDirX = Math.cos(angle)
                        const bDirY = Math.sin(angle)
                        newBullets.push(
                            createBullet({
                                dirX: bDirX,
                                dirY: bDirY,
                                startX: DINO_X + bDirX * BULLET_SPAWN_OFFSET_X,
                                startY: DINO_Y + bDirY * BULLET_SPAWN_OFFSET_Y,
                            })
                        )
                    }
                    setBullets((prev) => {
                        const next = [...prev, ...newBullets]
                        bulletsRef.current = next
                        return next
                    })
                } else {
                    const bullet = createBullet({
                        dirX,
                        dirY,
                        startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                        startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
                    })
                    setBullets((prev) => {
                        const next = [...prev, bullet]
                        bulletsRef.current = next
                        return next
                    })
                }
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
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId])

    // ============================================
    // タイマー
    // ============================================

    useEffect(() => {
        effectiveStartedAtRef.current = null

        const getBase = () => effectiveStartedAtRef.current ?? startedAt
        const calcRemaining = () =>
            Math.max(0, GAME_DURATION_SECONDS - Math.floor((Date.now() - getBase()) / 1000))

        let initialRemaining = calcRemaining()
        if (initialRemaining <= 0) {
            effectiveStartedAtRef.current = Date.now()
            initialRemaining = GAME_DURATION_SECONDS
        }

        setTimer(initialRemaining)

        const interval = setInterval(() => {
            const remaining = calcRemaining()
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
            const targetX = STAR_TARGET_X + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET
            const targetY = STAR_TARGET_Y + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET
            const durationMs =
                difficulty === 'HELL'
                    ? Math.max(HELL_ASTEROID_DURATION_MIN, HELL_ASTEROID_DURATION_BASE - playersTotalPoints)
                    : ASTEROID_DURATION_MS[difficulty]
            const asteroid: Asteroid = {
                id: crypto.randomUUID(),
                spawnedAt: Date.now(),
                spawnX: SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN),
                spawnY: SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN),
                targetX,
                targetY,
                durationMs,
                hp: ASTEROID_HP[difficulty],
            }
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

            const hitBulletIds = new Set<string>()
            const hpUpdates = new Map<string, number>()
            const slowAsteroidData = new Map<string, { progressAtSlow: number }>()
            let destroyedCount = 0

            for (const bullet of bts) {
                if (hitBulletIds.has(bullet.id)) continue
                const bp = getBulletPosition(bullet, now)
                const damage = bullet.damage ?? 1
                const tech = bullet.technique && bullet.technique in TECHNIQUES ? TECHNIQUES[bullet.technique as TechniqueId] : null

                for (const a of asts) {
                    if (a.destroyedAt || (hpUpdates.has(a.id) && (hpUpdates.get(a.id) ?? 0) <= 0)) continue
                    const ap = getAsteroidPosition(a, now)
                    const dist = Math.hypot(bp.x - ap.x, bp.y - ap.y)
                    if (dist >= ASTEROID_RADIUS + BULLET_RADIUS) continue

                    const currentHp = hpUpdates.get(a.id) ?? a.hp
                    const newHp = Math.max(0, currentHp - damage)

                    if (damage <= 0) continue

                    hpUpdates.set(a.id, newHp)
                    if (newHp <= 0) destroyedCount++

                    if (tech?.slowOnHit && !a.slowAppliedAt) {
                        const progressAtSlow = Math.min(1, (now - a.spawnedAt) / a.durationMs)
                        slowAsteroidData.set(a.id, { progressAtSlow })
                    }

                    if (tech?.chainLevel1Count !== undefined && tech.chainRadius !== undefined) {
                        const chainHitIds = new Set<string>([a.id])
                        const applyChainDamage = (astId: string, dmg: number) => {
                            const cur = hpUpdates.get(astId) ?? asts.find((x) => x.id === astId)?.hp ?? 0
                            const next = Math.max(0, cur - dmg)
                            hpUpdates.set(astId, next)
                            if (next <= 0) destroyedCount++
                            chainHitIds.add(astId)
                        }
                        const findNearest = (centerPos: { x: number; y: number }, limit: number, radius: number) => {
                            const withDist = asts
                                .filter((o) => !o.destroyedAt && !chainHitIds.has(o.id))
                                .map((o) => ({ ast: o, pos: getAsteroidPosition(o, now) }))
                                .map(({ ast, pos }) => ({ ast, dist: Math.hypot(centerPos.x - pos.x, centerPos.y - pos.y) }))
                                .filter(({ dist }) => dist <= radius)
                                .sort((x, y) => x.dist - y.dist)
                            return withDist.slice(0, limit).map(({ ast }) => ast)
                        }
                        const l1 = findNearest(ap, tech.chainLevel1Count, tech.chainRadius)
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[orange chain] L1 targets:', l1.length)
                        }
                        const chainTargets: { pos: { x: number; y: number }; asteroidId: string }[] = []
                        for (const t1 of l1) {
                            const t1Pos = getAsteroidPosition(t1, now)
                            chainTargets.push({ pos: t1Pos, asteroidId: t1.id })
                            applyChainDamage(t1.id, tech.chainLevel1Damage ?? 0)
                            const l2 = findNearest(t1Pos, tech.chainLevel2Count ?? 0, tech.chainRadius)
                            for (const t2 of l2) {
                                chainTargets.push({ pos: getAsteroidPosition(t2, now), asteroidId: t2.id })
                                applyChainDamage(t2.id, tech.chainLevel2Damage ?? 0)
                            }
                        }
                        if (chainTargets.length > 0) {
                            setChainHits({
                                primaryPos: ap,
                                targets: chainTargets,
                                color: tech.color ?? '#f97316',
                            })
                        }
                    }

                    if (!bullet.piercing) {
                        hitBulletIds.add(bullet.id)
                        break
                    }
                }
            }

            if (hpUpdates.size > 0) {
                setAsteroids((prev) => {
                    const next = prev.map((ast) => {
                        const newHp = hpUpdates.get(ast.id)
                        if (newHp === undefined) return ast
                        const base = newHp <= 0 ? { ...ast, hp: 0, destroyedAt: now } : { ...ast, hp: newHp }
                        const slowData = slowAsteroidData.get(ast.id)
                        return slowData
                            ? { ...base, speedMultiplier: 0.5, slowAppliedAt: now, progressAtSlow: slowData.progressAtSlow }
                            : base
                    })
                    asteroidsRef.current = next
                    return next
                })
                setBullets((prev) => {
                    const next = prev.filter((b) => !hitBulletIds.has(b.id))
                    bulletsRef.current = next
                    return next
                })
                if (destroyedCount > 0) {
                    setScore((prev) => {
                        const next = { ...prev, destroyed: prev.destroyed + destroyedCount }
                        scoreRef.current = next
                        return next
                    })
                    sendGameState()
                }
            }

            const toRemove = bts.filter((b) => now - b.firedAt > BULLET_MAX_AGE_MS)
            if (toRemove.length > 0) {
                const ids = new Set(toRemove.map((b) => b.id))
                setBullets((prev) => {
                    const next = prev.filter((b) => !ids.has(b.id))
                    bulletsRef.current = next
                    return next
                })
            }

            const destroyedThisFrame = new Set(
                [...hpUpdates.entries()]
                    .filter(([, newHp]) => newHp <= 0)
                    .map(([id]) => id)
            )
            const contacts = asts.filter((a) => {
                if (a.destroyedAt || destroyedThisFrame.has(a.id) || a.hasDamagedStar) return false
                const ap = getAsteroidPosition(a, now)
                const progress = (now - a.spawnedAt) / a.durationMs
                if (progress >= 1) return true
                const dist = Math.hypot(ap.x - STAR_TARGET_X, ap.y - STAR_TARGET_Y)
                return dist < STAR_RADIUS + ASTEROID_RADIUS
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

        const payload: { special: boolean; technique?: string; specialAttack?: SpecialAttackChoice } = { special: isLastChar }
        if (selectedNormalAttack != null) payload.technique = selectedNormalAttack
        if (isLastChar) payload.specialAttack = selectedSpecialAttack
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
    }, [currentLine, charIndex, selectedNormalAttack, selectedSpecialAttack])

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
