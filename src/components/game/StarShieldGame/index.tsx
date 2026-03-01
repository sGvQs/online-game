'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom, resetAllReady } from '@/server/actions/room'
import { startStarShieldMatch, getStarShieldMatchStatus } from '@/server/actions/game'
import { RoomWithUsersAndReadyStatus } from '@/shared/types'
import type { UserRanking } from '@/shared/types/game'
import { Difficulty, GameResult, GameStats } from '@/hooks/useStarShield'
import { TitleScreen } from './phases/TitleScreen'
import { RoleSelectionScreen } from './phases/RoleSelectionScreen'
import { GameScreen } from './phases/GameScreen'
import { ResultScreen } from './phases/ResultScreen'

type GamePhase = 'TITLE' | 'ROLE_SELECT' | 'PLAYING' | 'RESULT'
type RoleChoice = 'SHOOTER' | 'TYPIST'

interface StarShieldGameProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    roomId: string
    currentUserId: string
    initialRankings: UserRanking[]
}

export function StarShieldGame({
    room: initialRoom,
    isHost,
    roomId,
    currentUserId,
    initialRankings,
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
    const [shooterId, setShooterId] = useState<string | null>(null)
    const [gameResult, setGameResult] = useState<GameResult | null>(null)
    const [gameStats, setGameStats] = useState<GameStats | null>(null)

    const initialRoleChoices = useMemo(() => {
        const users = room.users
        if (users.length < 2) return {} as Record<string, RoleChoice>
        const hostId = room.createdBy
        const other = users.find((u) => u.userId !== hostId)
        if (!other) return {} as Record<string, RoleChoice>
        return { [hostId]: 'SHOOTER' as RoleChoice, [other.userId]: 'TYPIST' as RoleChoice }
    }, [room.users, room.createdBy])

    const [roleChoices, setRoleChoices] = useState<Record<string, RoleChoice>>(initialRoleChoices)

    // 2人揃ったときに未選択のユーザーに初期値（ホスト=Shooter、他=Typist）を補完
    useEffect(() => {
        if (room.users.length !== 2) return
        const hostId = room.createdBy
        const other = room.users.find((u) => u.userId !== hostId)
        if (!other) return
        setRoleChoices((prev) => {
            const missing = room.users.filter((u) => !(u.userId in prev))
            if (missing.length === 0) return prev
            const next = { ...prev }
            for (const u of missing) {
                next[u.userId] = u.userId === hostId ? 'SHOOTER' : 'TYPIST'
            }
            return next
        })
    }, [room.users, room.createdBy])

    // 既にプレイ済みの matchId を記録。タイトルに戻ったとき room.currentMatchId が
    // まだ DB に残っていても再度 PLAYING に遷移しないようにするため。
    const playedMatchIdsRef = useRef<Set<string>>(new Set())
    const lobbyChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const allUsersReady = room.users.length > 0 && room.users.every((u) => u.isReady)

    // ロビー用 broadcast: TITLE と ROLE_SELECT で channel を有効化
    useEffect(() => {
        if (phase !== 'TITLE' && phase !== 'ROLE_SELECT') return

        const channel = supabase.channel(`star_shield_lobby_${roomId}`)
        lobbyChannelRef.current = channel

        channel
            .on('broadcast', { event: 'difficulty' }, ({ payload }: { payload: { difficulty: Difficulty } }) => {
                if (payload?.difficulty && ['EASY', 'NORMAL', 'HARD'].includes(payload.difficulty)) {
                    setDifficulty(payload.difficulty)
                }
            })
            .on('broadcast', { event: 'role' }, ({ payload }: { payload: { userId: string; role: RoleChoice } }) => {
                if (payload?.userId && payload?.role && ['SHOOTER', 'TYPIST'].includes(payload.role)) {
                    setRoleChoices((prev) => ({ ...prev, [payload.userId]: payload.role }))
                }
            })
            .on('broadcast', { event: 'goToRoleSelect' }, () => {
                setPhase('ROLE_SELECT')
            })
            .on('broadcast', { event: 'goToLobby' }, () => {
                setPhase('TITLE')
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            lobbyChannelRef.current = null
        }
    }, [phase, roomId, supabase])

    // 役職変更（各自が選択、broadcast で共有）
    const handleRoleChange = useCallback((role: RoleChoice) => {
        setRoleChoices((prev) => ({ ...prev, [currentUserId]: role }))
        lobbyChannelRef.current?.send({
            type: 'broadcast',
            event: 'role',
            payload: { userId: currentUserId, role },
        })
    }, [currentUserId])

    // 役職が被っているか（2人とも同じ役職を選んだ場合）
    const roleConflict = useMemo(() => {
        const users = room.users
        if (users.length !== 2) return true
        const choices = users.map((u) => roleChoices[u.userId]).filter(Boolean)
        if (choices.length !== 2) return true
        return choices[0] === choices[1]
    }, [room.users, roleChoices])

    const canStartLobby = allUsersReady

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

    // 非ホスト: Room.currentMatchId の変化を検知。match ステータスを確認し、終了済みなら RESULT、プレイ中なら PLAYING へ
    useEffect(() => {
        if (phase !== 'TITLE' && phase !== 'ROLE_SELECT') return
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
                setShooterId(status.shooterId)
                setPhase('PLAYING')
            }
            // not_found の場合は何もしない（削除済みなど）
        })
    }, [room.currentMatchId, phase])

    // ロビーから役職決定画面へ（ホストが START 押下時）
    const handleStartGame = useCallback(() => {
        if (!canStartLobby) return
        lobbyChannelRef.current?.send({ type: 'broadcast', event: 'goToRoleSelect', payload: {} })
        setPhase('ROLE_SELECT')
    }, [canStartLobby])

    // 役職決定後にゲーム開始（ホストのみ）
    const handleProceedToGame = useCallback(async () => {
        if (roleConflict) return
        const shooterIdFromRoles = room.users.find((u) => roleChoices[u.userId] === 'SHOOTER')?.userId
        const typistIdFromRoles = room.users.find((u) => roleChoices[u.userId] === 'TYPIST')?.userId
        if (!shooterIdFromRoles || !typistIdFromRoles) return
        try {
            const { matchId: newMatchId, startedAt: ts, shooterId: sid } = await startStarShieldMatch(roomId, difficulty, {
                shooterId: shooterIdFromRoles,
                typistId: typistIdFromRoles,
            })
            setMatchId(newMatchId)
            setStartedAt(ts)
            setShooterId(sid)
            setPhase('PLAYING')
        } catch (e) {
            console.error('ゲーム開始失敗:', e)
        }
    }, [roleConflict, room.users, roleChoices, roomId, difficulty])

    // 役職決定画面からロビーへ戻る
    const handleBackToLobby = useCallback(() => {
        lobbyChannelRef.current?.send({ type: 'broadcast', event: 'goToLobby', payload: {} })
        setPhase('TITLE')
    }, [])

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
        setShooterId(null)
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
                    canStart={canStartLobby}
                    onToggleReady={toggleReady}
                    onStartGame={handleStartGame}
                    onExit={handleExit}
                    currentUserId={currentUserId}
                    initialRankings={initialRankings}
                />
            )}
            {phase === 'ROLE_SELECT' && (
                <RoleSelectionScreen
                    room={room}
                    roleChoices={roleChoices}
                    onRoleChange={handleRoleChange}
                    roleConflict={roleConflict}
                    canProceed={!roleConflict}
                    onProceedToGame={handleProceedToGame}
                    onBack={handleBackToLobby}
                    currentUserId={currentUserId}
                    difficulty={difficulty}
                    onDifficultyChange={handleDifficultyChange}
                    isHost={isHost}
                />
            )}
            {phase === 'PLAYING' && matchId && startedAt && shooterId && (
                <GameScreen
                    matchId={matchId}
                    startedAt={startedAt}
                    shooterId={shooterId}
                    difficulty={difficulty}
                    currentUserId={currentUserId}
                    onGameEnd={handleGameEnd}
                />
            )}
            {phase === 'RESULT' && gameResult && gameStats && (
                <ResultScreen
                    result={gameResult}
                    stats={gameStats}
                    difficulty={difficulty}
                    onBackToTitle={handleBackToTitle}
                />
            )}
        </div>
    )
}
