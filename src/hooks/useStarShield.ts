'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { saveStarShieldResult } from '@/server/actions/game'

// ============================================
// 定数・型
// ============================================

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD'
export type GameResult = 'CLEARED' | 'FAILED_CONTACT' | 'FAILED_TIMEOUT'

const GAME_DURATION_SECONDS = 90

// 座標系: ビューポート基準の正規化座標 (0-1)
export const DINO_X = 0.08
export const DINO_Y = 0.85
const SPAWN_X_MIN = 0.1
const SPAWN_X_MAX = 0.65
const SPAWN_Y_MIN = 0.02
const SPAWN_Y_MAX = 0.15
const ASTEROID_DURATION_MS = 8000

// 弾の設定（デバッグ用に BULLET_RADIUS を変数化）
const BULLET_SPEED = 0.0008 // 正規化座標/ms（速すぎないように）
// export const BULLET_RADIUS = 0.008 // デバッグ時は大きくできる
export const BULLET_RADIUS = 0.008 // デバッグ時は大きくできる
export const ASTEROID_RADIUS = 0.02
const DINO_HIT_RADIUS = 0.06
const BULLET_MAX_AGE_MS = 3000

const SPAWN_INTERVALS_MS: Record<Difficulty, number> = {
    EASY: 2000,
    NORMAL: 1000,
    HARD: Math.round(1000 / 1.5),
}

// ============================================
// セリフデータ
// ============================================

export interface DialogueLine {
    text: string
    romaji: string
}

export const DIALOGUES: Record<Difficulty, DialogueLine[]> = {
    EASY: [
        { text: 'ひとつ', romaji: 'hitotsu' },
        { text: 'ふたつ', romaji: 'futatsu' },
        { text: 'せーの', romaji: 'seeno' },
        { text: 'よかった', romaji: 'yokatta' },
    ],
    NORMAL: [
        { text: '今まではひとりだった', romaji: 'imamadehahitoridatta' },
        { text: 'でも今は、きみがいる', romaji: 'demoimahakimiiru' },
        { text: '一緒に守ろう', romaji: 'issyonimamoro' },
        { text: 'だから隕石なんてへっちゃら', romaji: 'dakarainsekiinanteheccyara' },
    ],
    HARD: [
        { text: 'いっぱい来た', romaji: 'ippaikita' },
        { text: 'でもだいじょうぶ', romaji: 'demodaijoubu' },
        { text: 'きみがいるから', romaji: 'kimigarukaara' },
        { text: 'もう一回', romaji: 'mouikkai' },
    ],
}

// ============================================
// 隕石・弾の型
// ============================================

export interface Asteroid {
    id: string
    spawnedAt: number
    spawnX: number // 0-1（スポーン時 X）
    spawnY: number // 0-1（スポーン時 Y）
    destroyedAt?: number
}

export interface Bullet {
    id: string
    firedAt: number
    startX: number
    startY: number
    dirX: number
    dirY: number
}

// ============================================
// 位置計算ユーティリティ
// ============================================

export function getAsteroidPosition(asteroid: Asteroid, now: number): { x: number; y: number } {
    const elapsed = now - asteroid.spawnedAt
    const progress = Math.min(1, elapsed / ASTEROID_DURATION_MS)
    return {
        x: asteroid.spawnX + (DINO_X - asteroid.spawnX) * progress,
        y: asteroid.spawnY + (DINO_Y - asteroid.spawnY) * progress,
    }
}

export function getBulletPosition(bullet: Bullet, now: number): { x: number; y: number } {
    const elapsed = now - bullet.firedAt
    const dist = BULLET_SPEED * elapsed
    return {
        x: bullet.startX + bullet.dirX * dist,
        y: bullet.startY + bullet.dirY * dist,
    }
}

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
}

export interface GameStats {
    spawnedCount: number
    destroyedCount: number
    durationSeconds: number
}

// typing_shoot_matches の postgres_changes ペイロード型（snake_case）
interface TypingShootMatchRow {
    match_id: string
    ended_at: string | null
    is_cleared: boolean
    failure_reason: string | null
    spawned_count: number
    destroyed_count: number
    duration_seconds: number | null
}

export function useStarShield({
    matchId,
    startedAt,
    isShooter,
    difficulty,
    onGameEnd,
}: UseStarShieldProps) {
    const supabase = useMemo(() => createClient(), [])
    const channelName = `star_shield_fire_${matchId}`

    // ゲーム状態（Shooter のみ asteroids, bullets を管理、Typist は不要）
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [bullets, setBullets] = useState<Bullet[]>([])
    const [timer, setTimer] = useState(GAME_DURATION_SECONDS)
    const [score, setScore] = useState({ spawned: 0, destroyed: 0 })

    // タイピング状態（Typist のみ）
    const [dialogueIndex, setDialogueIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)

    // Refs
    const asteroidsRef = useRef<Asteroid[]>([])
    const bulletsRef = useRef<Bullet[]>([])
    const scoreRef = useRef({ spawned: 0, destroyed: 0 })
    const aimRef = useRef({ x: 0.5, y: 0.5 }) // 正規化座標 0-1
    const gameEndedRef = useRef(false)
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    const dialogues = DIALOGUES[difficulty]

    // ============================================
    // ゲーム終了処理
    // ============================================

    const endGame = useCallback(async (result: GameResult) => {
        if (gameEndedRef.current) return
        gameEndedRef.current = true

        const durationSeconds = Math.round((Date.now() - startedAt) / 1000)
        const stats: GameStats = {
            spawnedCount: scoreRef.current.spawned,
            destroyedCount: scoreRef.current.destroyed,
            durationSeconds,
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
        }

        onGameEnd(result, stats)
    }, [isShooter, matchId, startedAt, onGameEnd, difficulty])

    // ============================================
    // Supabase Realtime チャンネル
    // broadcast: fire のみ
    // postgres_changes: typing_shoot_matches のゲーム終了検知（Typist 用）
    // ============================================

    useEffect(() => {
        const channel = supabase.channel(channelName)
        channelRef.current = channel

        channel
            // Typist → Shooter: fire イベント（broadcast）→ 弾を生成
            .on('broadcast', { event: 'fire' }, () => {
                if (!isShooter) return

                const aim = aimRef.current
                const dx = aim.x - DINO_X
                const dy = aim.y - DINO_Y
                const len = Math.hypot(dx, dy)
                if (len < 0.001) return // 照準が恐竜にほぼ重なっている場合は弾を出さない

                const dirX = dx / len
                const dirY = dy / len

                const bullet: Bullet = {
                    id: crypto.randomUUID(),
                    firedAt: Date.now(),
                    startX: DINO_X,
                    startY: DINO_Y,
                    dirX,
                    dirY,
                }

                setBullets((prev) => {
                    const next = [...prev, bullet]
                    bulletsRef.current = next
                    return next
                })
            })
            // Typist: Shooter が隕石破壊したときに destroyed カウントを更新
            .on('broadcast', { event: 'asteroid_destroyed' }, () => {
                if (isShooter) return
                setScore((prev) => {
                    const next = { ...prev, destroyed: prev.destroyed + 1 }
                    scoreRef.current = next
                    return next
                })
            })
            // Typist 側: typing_shoot_matches の更新でゲーム終了を検知
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'typing_shoot_matches',
                    filter: `match_id=eq.${matchId}`,
                },
                ({ new: row }: { new: TypingShootMatchRow }) => {
                    if (isShooter) return  // Shooter はローカルで処理済み
                    // フィルターが効かない場合の安全弁
                    if (row.match_id !== matchId) return
                    if (!row.ended_at) return
                    const result: GameResult = row.is_cleared
                        ? 'CLEARED'
                        : row.failure_reason === 'FAILED_CONTACT'
                        ? 'FAILED_CONTACT'
                        : 'FAILED_TIMEOUT'
                    const stats: GameStats = {
                        spawnedCount: row.spawned_count,
                        destroyedCount: row.destroyed_count,
                        durationSeconds: row.duration_seconds ?? 0,
                    }
                    if (gameEndedRef.current) return
                    gameEndedRef.current = true
                    onGameEnd(result, stats)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId])

    // ============================================
    // タイマー（startedAt ベースで両者独立計算）
    // ============================================

    useEffect(() => {
        const calcRemaining = () =>
            Math.max(0, GAME_DURATION_SECONDS - Math.floor((Date.now() - startedAt) / 1000))

        // 初期値を設定
        setTimer(calcRemaining())

        const interval = setInterval(() => {
            const remaining = calcRemaining()
            setTimer(remaining)

            if (remaining <= 0) {
                clearInterval(interval)
                if (!isShooter || gameEndedRef.current) return

                // Shooter: タイムアップ時の判定
                const remaining2 = asteroidsRef.current.filter((a) => !a.destroyedAt)
                if (remaining2.length === 0 && scoreRef.current.spawned > 0) {
                    endGame('CLEARED')
                } else {
                    endGame('FAILED_TIMEOUT')
                }
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

        // 隕石スポーン（上中央ゾーンから恐竜方向へ）
        spawnTimer = setInterval(() => {
            if (gameEndedRef.current) return
            const asteroid: Asteroid = {
                id: crypto.randomUUID(),
                spawnedAt: Date.now(),
                spawnX: SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN),
                spawnY: SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN),
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
        }, spawnInterval)

        // 弾・隕石の当たり判定 + 隕石→恐竜の接触判定ループ
        const gameLoop = () => {
            if (gameEndedRef.current) return
            const now = Date.now()
            const asts = asteroidsRef.current
            const bts = bulletsRef.current

            // 弾 vs 隕石の当たり判定
            const hitBulletIds = new Set<string>()
            const hitAsteroidIds = new Set<string>()
            for (const bullet of bts) {
                if (hitBulletIds.has(bullet.id)) continue
                const bp = getBulletPosition(bullet, now)
                for (const a of asts) {
                    if (a.destroyedAt || hitAsteroidIds.has(a.id)) continue
                    const ap = getAsteroidPosition(a, now)
                    const dist = Math.hypot(bp.x - ap.x, bp.y - ap.y)
                    if (dist < ASTEROID_RADIUS + BULLET_RADIUS) {
                        hitBulletIds.add(bullet.id)
                        hitAsteroidIds.add(a.id)
                        channelRef.current?.send({
                            type: 'broadcast',
                            event: 'asteroid_destroyed',
                            payload: {},
                        })
                    }
                }
            }
            if (hitAsteroidIds.size > 0) {
                setAsteroids((prev) => {
                    const next = prev.map((ast) =>
                        hitAsteroidIds.has(ast.id) ? { ...ast, destroyedAt: now } : ast
                    )
                    asteroidsRef.current = next
                    return next
                })
                setBullets((prev) => {
                    const next = prev.filter((b) => !hitBulletIds.has(b.id))
                    bulletsRef.current = next
                    return next
                })
                setScore((prev) => {
                    const next = { ...prev, destroyed: prev.destroyed + hitAsteroidIds.size }
                    scoreRef.current = next
                    return next
                })
            }

            // 古い弾を削除
            const toRemove = bts.filter((b) => now - b.firedAt > BULLET_MAX_AGE_MS)
            if (toRemove.length > 0) {
                const ids = new Set(toRemove.map((b) => b.id))
                setBullets((prev) => {
                    const next = prev.filter((b) => !ids.has(b.id))
                    bulletsRef.current = next
                    return next
                })
            }

            // 隕石 vs 恐竜の接触判定
            const contact = asts.find((a) => {
                if (a.destroyedAt || hitAsteroidIds.has(a.id)) return false
                const ap = getAsteroidPosition(a, now)
                const progress = (now - a.spawnedAt) / ASTEROID_DURATION_MS
                if (progress >= 1) return true
                const dist = Math.hypot(ap.x - DINO_X, ap.y - DINO_Y)
                return dist < DINO_HIT_RADIUS
            })
            if (contact) {
                endGame('FAILED_CONTACT')
                return
            }

            rafId = requestAnimationFrame(gameLoop)
        }
        rafId = requestAnimationFrame(gameLoop)

        return () => {
            if (spawnTimer) clearInterval(spawnTimer)
            if (rafId) cancelAnimationFrame(rafId)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId, isShooter, difficulty])

    // ============================================
    // Typist のみ: スコア（spawned）をローカル計算
    // ============================================

    useEffect(() => {
        if (isShooter) return

        const spawnIntervalSec = SPAWN_INTERVALS_MS[difficulty] / 1000

        const interval = setInterval(() => {
            if (gameEndedRef.current) return
            const elapsed = (Date.now() - startedAt) / 1000
            const spawned = Math.floor(elapsed / spawnIntervalSec)
            setScore((prev) => ({ ...prev, spawned }))
        }, 500)

        return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId, isShooter, difficulty, startedAt])

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

        const currentLine = dialogues[dialogueIndex % dialogues.length]
        const expected = currentLine.romaji[charIndex]

        if (e.key.toLowerCase() !== expected) return

        // fire broadcast を Shooter へ送信（破壊は弾が当たったときのみ Shooter でカウント）
        channelRef.current?.send({
            type: 'broadcast',
            event: 'fire',
            payload: {},
        })

        const nextChar = charIndex + 1
        if (nextChar >= currentLine.romaji.length) {
            setDialogueIndex((i) => i + 1)
            setCharIndex(0)
        } else {
            setCharIndex(nextChar)
        }
    }, [dialogues, dialogueIndex, charIndex])

    useEffect(() => {
        if (isShooter) return
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isShooter, onKeyDown])

    return {
        asteroids,
        bullets,
        timer,
        score,
        aimRef,
        onMouseMove,
        dialogue: {
            line: dialogues[dialogueIndex % dialogues.length],
            charIndex,
        },
    }
}
