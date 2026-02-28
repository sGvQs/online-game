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
const SCREEN_WIDTH = 1200
const ASTEROID_SPEED_PX_PER_MS = 0.12

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
// 隕石の型
// ============================================

export interface Asteroid {
    id: string
    spawnedAt: number
    y: number // 0-100 (%)
    destroyedAt?: number
}

// ============================================
// 位置計算ユーティリティ
// ============================================

export function getAsteroidX(asteroid: Asteroid, now: number): number {
    const elapsed = now - asteroid.spawnedAt
    return SCREEN_WIDTH - elapsed * ASTEROID_SPEED_PX_PER_MS
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

    // ゲーム状態（Shooter のみ asteroids を管理、Typist は不要）
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [timer, setTimer] = useState(GAME_DURATION_SECONDS)
    const [score, setScore] = useState({ spawned: 0, destroyed: 0 })

    // タイピング状態（Typist のみ）
    const [dialogueIndex, setDialogueIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)

    // Refs
    const asteroidsRef = useRef<Asteroid[]>([])
    const scoreRef = useRef({ spawned: 0, destroyed: 0 })
    const aimRef = useRef({ x: SCREEN_WIDTH / 2, y: 300 })
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

        onGameEnd(result, stats)

        // Shooter のみ DB 保存（postgres_changes で Typist へ通知される）
        if (isShooter) {
            try {
                await saveStarShieldResult(matchId, {
                    spawnedCount: stats.spawnedCount,
                    destroyedCount: stats.destroyedCount,
                    isCleared: result === 'CLEARED',
                    failureReason: result !== 'CLEARED' ? result : undefined,
                    durationSeconds: stats.durationSeconds,
                })
            } catch (e) {
                console.error('結果保存失敗:', e)
            }
        }
    }, [isShooter, matchId, startedAt, onGameEnd])

    // ============================================
    // Supabase Realtime チャンネル
    // broadcast: fire のみ
    // postgres_changes: typing_shoot_matches のゲーム終了検知（Typist 用）
    // ============================================

    useEffect(() => {
        const channel = supabase.channel(channelName)
        channelRef.current = channel

        channel
            // Typist → Shooter: fire イベント（broadcast）
            .on('broadcast', { event: 'fire' }, () => {
                if (!isShooter) return
                const now = Date.now()
                const active = asteroidsRef.current.filter((a) => !a.destroyedAt)
                if (active.length === 0) return

                const aim = aimRef.current
                const screenH = typeof window !== 'undefined' ? window.innerHeight : 600

                // 最近接隕石を破壊
                let nearest = active[0]
                let minDist = Infinity
                for (const a of active) {
                    const ax = getAsteroidX(a, now)
                    const ay = (a.y / 100) * screenH
                    const dist = Math.hypot(aim.x - ax, aim.y - ay)
                    if (dist < minDist) {
                        minDist = dist
                        nearest = a
                    }
                }

                // ローカルで即座に破壊反映
                const destroyedAt = now
                setAsteroids((prev) => {
                    const next = prev.map((a) =>
                        a.id === nearest.id ? { ...a, destroyedAt } : a
                    )
                    asteroidsRef.current = next
                    return next
                })
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

        // 隕石スポーン（Shooter ローカルのみ。Typist は隕石を表示しないため DB/broadcast 不要）
        spawnTimer = setInterval(() => {
            if (gameEndedRef.current) return
            const asteroid: Asteroid = {
                id: crypto.randomUUID(),
                spawnedAt: Date.now(),
                y: Math.random() * 80 + 10,
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

        // 接触判定ループ
        const checkContact = () => {
            if (gameEndedRef.current) return
            const now = Date.now()
            const contact = asteroidsRef.current.find(
                (a) => !a.destroyedAt && getAsteroidX(a, now) < 0
            )
            if (contact) {
                endGame('FAILED_CONTACT')
                return
            }
            rafId = requestAnimationFrame(checkContact)
        }
        rafId = requestAnimationFrame(checkContact)

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
            x: ((e.clientX - rect.left) / rect.width) * SCREEN_WIDTH,
            y: e.clientY - rect.top,
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

        // fire broadcast を Shooter へ送信
        channelRef.current?.send({
            type: 'broadcast',
            event: 'fire',
            payload: {},
        })

        // ローカルで destroyed カウントを増やす（近似値）
        setScore((prev) => {
            const next = { ...prev, destroyed: prev.destroyed + 1 }
            scoreRef.current = next
            return next
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
