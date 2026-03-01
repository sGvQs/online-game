'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom, resetAllReady } from '@/server/actions/room'
import { startStarShieldMatch, getStarShieldMatchStatus } from '@/server/actions/game'
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
    const lobbyChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const allUsersReady = room.users.length > 0 && room.users.every((u) => u.isReady)

    // ロビー用 broadcast: 難易度を共有（ホストが変更時に broadcast、全員が受信して表示）
    useEffect(() => {
        if (phase !== 'TITLE') return

        const channel = supabase.channel(`star_shield_lobby_${roomId}`)
        lobbyChannelRef.current = channel

        channel
            .on('broadcast', { event: 'difficulty' }, ({ payload }: { payload: { difficulty: Difficulty } }) => {
                if (payload?.difficulty && ['EASY', 'NORMAL', 'HARD'].includes(payload.difficulty)) {
                    setDifficulty(payload.difficulty)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            lobbyChannelRef.current = null
        }
    }, [phase, roomId, supabase])

    // ホストが難易度を変更したときに state 更新 + broadcast
    const handleDifficultyChange = useCallback(
        (d: Difficulty) => {
            setDifficulty(d)
            if (isHost) {
                lobbyChannelRef.current?.send({
                    type: 'broadcast',
                    event: 'difficulty',
                    payload: { difficulty: d },
                })
            }
        },
        [isHost]
    )

    // 非ホスト + リロード時: Room.currentMatchId の変化を検知。match ステータスを確認し、終了済みなら RESULT へ
    useEffect(() => {
        if (phase !== 'TITLE') return
        if (!room.currentMatchId) return
        if (playedMatchIdsRef.current.has(room.currentMatchId)) return

        const newMatchId = room.currentMatchId
        getStarShieldMatchStatus(newMatchId).then((status) => {
            if (status.status === 'finished') {
                playedMatchIdsRef.current.add(newMatchId)
                setGameResult(status.result)
                setGameStats(status.stats)
                setPhase('RESULT')
            } else if (status.status === 'playing') {
                setMatchId(newMatchId)
                setStartedAt(status.startedAt)
                setPhase('PLAYING')
            }
            // not_found の場合は何もしない（削除済みなど）
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

    // 背景は (play) layout で描画（room ⇔ game 遷移時もアンマウントされない）
    return (
        <div className="relative min-h-screen overflow-hidden">
            {phase === 'TITLE' && (
                <TitleScreen
                    room={room}
                    isHost={isHost}
                    isReady={isReady}
                    allUsersReady={allUsersReady}
                    difficulty={difficulty}
                    onToggleReady={toggleReady}
                    onStartGame={handleStartGame}
                    onExit={handleExit}
                    onDifficultyChange={handleDifficultyChange}
                    currentUserId={currentUserId}
                />
            )}
            {phase === 'PLAYING' && matchId && startedAt && (
                <GameScreen
                    matchId={matchId}
                    startedAt={startedAt}
                    isShooter={isHost}
                    difficulty={difficulty}
                    currentUserId={currentUserId}
                    onGameEnd={handleGameEnd}
                />
            )}
            {phase === 'RESULT' && gameResult && gameStats && (
                <ResultScreen
                    result={gameResult}
                    stats={gameStats}
                    onBackToTitle={handleBackToTitle}
                />
            )}
        </div>
    )
}
