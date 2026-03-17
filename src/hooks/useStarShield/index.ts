'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useSE } from '@/hooks/useSE'
import { saveStarShieldResult } from '@/server/actions/game'
import {
    GAME_DURATION_SECONDS,
} from '@/constants/starShieldGame/gameConfig'
import type { SpecialAttackLevel } from '@/constants/starShieldGame/gameConfig'
import { DIALOGUES, pickRandomDialogue } from '@/constants/starShieldGame/dialogues'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
import { getRomaji } from '@/utils/starShieldGame'
import { LEVEL_STAR_HP } from '@/constants/starShieldGame/gameConfig'
import { calcRemainingSeconds, resolveStartTime, createGameStats } from '@/utils/starShieldGame'
import type {
    Asteroid,
    Bullet,
    DialogueLine,
    Difficulty,
    GameResult,
    GameStats,
    NormalAttackLevel,
} from '@/types/starShieldGame'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import { useGameChannel } from './useGameChannel'
import { useShooterActions } from './useShooterActions'
import { useAsteroidPhysics } from './useAsteroidPhysics'
import { useAbyssPhysics } from './useAbyssPhysics'

// ============================================
// Hook
// ============================================

interface UseStarShieldProps {
    matchId: string
    startedAt: number
    isShooter: boolean
    difficulty: Difficulty
    currentUserId: string
    onGameEnd: (result: GameResult, stats: GameStats, difficulty?: Difficulty) => void
    selectedNormalAttack?: TechniqueId | null
    selectedSpecialAttack?: SpecialAttackChoice
    selectedSpecialAttackLevel?: SpecialAttackLevel
    selectedHealLevel?: number | null
    starHpLevel?: number
    level?: NormalAttackLevel
    autoAimNearest?: boolean
}

export function useStarShield({
    matchId,
    startedAt,
    isShooter,
    difficulty,
    onGameEnd,
    selectedNormalAttack = null,
    selectedSpecialAttack = 'spread',
    selectedSpecialAttackLevel = 1,
    selectedHealLevel = null,
    starHpLevel,
    level = 1,
    autoAimNearest = process.env.NODE_ENV === 'development',
}: UseStarShieldProps) {
    const { play } = useSE()
    const playVoiceRef = useRef(play)
    playVoiceRef.current = play
    const playVoice = useCallback((key: string) => playVoiceRef.current(key as Parameters<typeof play>[0]), [])

    // ゲーム状態
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [bullets, setBullets] = useState<Bullet[]>([])
    const [timer, setTimer] = useState(GAME_DURATION_SECONDS)
    const [score, setScore] = useState({ spawned: 0, destroyed: 0 })
    const [waveNumber, setWaveNumber] = useState(1)

    const effectiveStarHpLevel = useMemo(
        () => (starHpLevel != null && starHpLevel >= 1 && starHpLevel <= 5 ? (starHpLevel as 1 | 2 | 3 | 4 | 5) : 1),
        [starHpLevel]
    )
    const maxStarHp = LEVEL_STAR_HP[effectiveStarHpLevel]
    const [starHp, setStarHp] = useState(maxStarHp)

    // タイピング状態（Typist のみ）
    const [currentLine, setCurrentLine] = useState<DialogueLine | null>(() =>
        isShooter ? null : pickRandomDialogue()
    )
    const [charIndex, setCharIndex] = useState(0)
    const [typistFireCount, setTypistFireCount] = useState(0)

    /** 接触爆発アニメ用 */
    const [contactExplosion, setContactExplosion] = useState<{ x: number; y: number; asteroidId: string } | null>(null)
    /** オレンジ連鎖ヒット表示用 */
    const [chainHits, setChainHits] = useState<{
        primaryPos: { x: number; y: number }
        targets: { pos: { x: number; y: number }; asteroidId: string }[]
        color: string
    } | null>(null)

    // Shared refs
    const asteroidsRef = useRef<Asteroid[]>([])
    const bulletsRef = useRef<Bullet[]>([])
    const scoreRef = useRef({ spawned: 0, destroyed: 0 })
    const fireCountRef = useRef(0)
    const starHpRef = useRef(maxStarHp)
    const aimRef = useRef({ x: 0.5, y: 0.5 })
    const autoAimNearestRef = useRef(autoAimNearest)
    const levelRef = useRef(level)
    const specialAttackLevelRef = useRef(selectedSpecialAttackLevel)
    const gameEndedRef = useRef(false)
    const contactPendingRef = useRef(false)
    const effectiveStartedAtRef = useRef<number | null>(null)

    // Sync props → refs
    useEffect(() => { starHpRef.current = starHp }, [starHp])
    useEffect(() => { autoAimNearestRef.current = process.env.NODE_ENV === 'development' }, [])
    useEffect(() => { levelRef.current = level }, [level])
    useEffect(() => { specialAttackLevelRef.current = selectedSpecialAttackLevel }, [selectedSpecialAttackLevel])

    // ============================================
    // シューターアクション
    // ============================================

    const { onReceiveFire, clearTimeouts } = useShooterActions({
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
        sendGameState: (immediate) => sendGameState(immediate),
    })

    // ============================================
    // Supabase チャンネル
    // ============================================

    const { sendGameState, sendGameEnd, sendFire } = useGameChannel({
        matchId,
        isShooter,
        scoreRef,
        starHpRef,
        fireCountRef,
        gameEndedRef,
        setScore,
        setStarHp,
        setTypistFireCount,
        playVoice,
        onReceiveFire,
        onGameEnd,
    })

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

        let actualDifficulty: Difficulty | undefined
        if (isShooter) {
            try {
                const saved = await saveStarShieldResult(matchId, {
                    spawnedCount: stats.spawnedCount,
                    destroyedCount: stats.destroyedCount,
                    fireCount: stats.fireCount,
                    isCleared: result === 'CLEARED',
                    failureReason: result !== 'CLEARED' ? result : undefined,
                    durationSeconds: stats.durationSeconds,
                    difficulty,
                })
                actualDifficulty = saved.difficulty
            } catch (e) {
                console.error('結果保存失敗:', e)
            }
            sendGameEnd(result, stats, actualDifficulty)
        }

        onGameEnd(result, stats, actualDifficulty)
    }, [isShooter, matchId, startedAt, onGameEnd, difficulty, sendGameEnd])

    // ============================================
    // 隕石スポーン + 衝突 ゲームループ
    // ============================================

    useAsteroidPhysics({
        matchId,
        isShooter,
        difficulty,
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
    })

    useAbyssPhysics({
        matchId,
        isShooter: isShooter && difficulty === 'ABYSS',
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
    })

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
                if (!isShooter || gameEndedRef.current || difficulty === 'ABYSS') return
                endGame('CLEARED')
            }
        }, 1000)

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId, startedAt])

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
        if (e.isComposing || e.keyCode === 229) return // IME入力中は無視
        if (e.key === 'Process' || e.key === 'Unidentified') return // 一部ブラウザのIME対策
        if (e.key.length !== 1) return

        const line = currentLine
        if (!line) return

        const romaji = getRomaji(line.text)
        const expected = romaji[charIndex]
        if (e.key.toLowerCase() !== expected) return

        const nextChar = charIndex + 1
        const isLastChar = nextChar >= romaji.length

        const payload: {
            special: boolean
            technique?: string
            specialAttack?: SpecialAttackChoice
            specialAttackLevel?: SpecialAttackLevel
            healLevel?: number
        } = { special: isLastChar }
        if (selectedNormalAttack != null) payload.technique = selectedNormalAttack
        if (isLastChar) {
            payload.specialAttack = selectedSpecialAttack
            payload.specialAttackLevel = selectedSpecialAttackLevel
            if (selectedHealLevel != null && selectedHealLevel >= 1 && selectedHealLevel <= 6) {
                payload.healLevel = selectedHealLevel
            }
        }

        sendFire(payload)
        playVoice('shooting')

        if (isLastChar) {
            setCurrentLine(pickRandomDialogue())
            setCharIndex(0)
        } else {
            setCharIndex(nextChar)
        }
    }, [currentLine, charIndex, selectedNormalAttack, selectedSpecialAttack, selectedSpecialAttackLevel, selectedHealLevel, sendFire, playVoice])

    useEffect(() => {
        if (isShooter) return
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isShooter, onKeyDown])

    // ============================================
    // 後処理
    // ============================================

    useEffect(() => {
        return () => clearTimeouts()
    }, [clearTimeouts])

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
        waveNumber,
    }
}
