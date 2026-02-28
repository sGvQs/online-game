'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom, resetAllReady } from '@/server/actions/room'
import { startStarShieldMatch, getStarShieldMatchInfo } from '@/server/actions/game'
import { RoomWithUsersAndReadyStatus } from '@/shared/types'
import { Difficulty, GameResult, GameStats } from '@/hooks/useStarShield'
import { TitleScreen } from './TitleScreen'
import { GameScreen } from './GameScreen'
import { ResultScreen } from './ResultScreen'

type GamePhase = 'TITLE' | 'PLAYING' | 'RESULT'

interface StarShieldGameProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    roomId: string
    currentUserId: string
}

export function StarShieldGame({
    room: initialRoom,
    isHost,
    roomId,
    currentUserId,
}: StarShieldGameProps) {
    const { room, isReady, toggleReady } = useGameRoom({
        roomId,
        initialRoom,
        currentUserId,
    })

    const [phase, setPhase] = useState<GamePhase>('TITLE')
    const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL')
    const [matchId, setMatchId] = useState<string | null>(null)
    const [startedAt, setStartedAt] = useState<number | null>(null)
    const [gameResult, setGameResult] = useState<GameResult | null>(null)
    const [gameStats, setGameStats] = useState<GameStats | null>(null)

    // 既にプレイ済みの matchId を記録。タイトルに戻ったとき room.currentMatchId が
    // まだ DB に残っていても再度 PLAYING に遷移しないようにするため。
    const playedMatchIdsRef = useRef<Set<string>>(new Set())

    const allUsersReady = room.users.length > 0 && room.users.every((u) => u.isReady)

    // 非ホスト: Room.currentMatchId の変化を検知してゲーム開始
    useEffect(() => {
        if (phase !== 'TITLE') return
        if (!room.currentMatchId) return
        if (playedMatchIdsRef.current.has(room.currentMatchId)) return

        const newMatchId = room.currentMatchId
        // startedAt をサーバーから取得してから PLAYING へ遷移
        getStarShieldMatchInfo(newMatchId).then(({ startedAt: ts }) => {
            setMatchId(newMatchId)
            setStartedAt(ts)
            setPhase('PLAYING')
        })
    }, [room.currentMatchId, phase])

    // ゲーム開始（ホストのみ）
    const handleStartGame = useCallback(async () => {
        if (!allUsersReady) return
        try {
            const { matchId: newMatchId, startedAt: ts } = await startStarShieldMatch(roomId, difficulty)
            setMatchId(newMatchId)
            setStartedAt(ts)
            setPhase('PLAYING')
        } catch (e) {
            console.error('ゲーム開始失敗:', e)
        }
    }, [allUsersReady, roomId, difficulty])

    // ゲーム終了時
    const handleGameEnd = useCallback((result: GameResult, stats: GameStats) => {
        setGameResult(result)
        setGameStats(stats)
        setPhase('RESULT')
    }, [])

    // タイトルに戻る
    const handleBackToTitle = useCallback(async () => {
        // このマッチを「プレイ済み」に登録しておき、再び PLAYING へ遷移しないようにする
        if (matchId) playedMatchIdsRef.current.add(matchId)
        setMatchId(null)
        setStartedAt(null)
        setGameResult(null)
        setGameStats(null)
        setPhase('TITLE')
        try {
            await resetAllReady(roomId)
        } catch (e) {
            console.error('READYリセット失敗:', e)
        }
    }, [matchId, roomId])

    // ルームに戻る（ホストのみ）
    const handleExit = useCallback(async () => {
        await returnToRoom(roomId)
    }, [roomId])

    if (phase === 'TITLE') {
        return (
            <TitleScreen
                room={room}
                isHost={isHost}
                isReady={isReady}
                allUsersReady={allUsersReady}
                difficulty={difficulty}
                onToggleReady={toggleReady}
                onStartGame={handleStartGame}
                onExit={handleExit}
                onDifficultyChange={setDifficulty}
                currentUserId={currentUserId}
            />
        )
    }

    if (phase === 'PLAYING' && matchId && startedAt) {
        return (
            <GameScreen
                matchId={matchId}
                startedAt={startedAt}
                isShooter={isHost}
                difficulty={difficulty}
                currentUserId={currentUserId}
                onGameEnd={handleGameEnd}
            />
        )
    }

    if (phase === 'RESULT' && gameResult && gameStats) {
        return (
            <ResultScreen
                result={gameResult}
                stats={gameStats}
                onBackToTitle={handleBackToTitle}
            />
        )
    }

    return null
}
