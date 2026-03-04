'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom, resetAllReady } from '@/server/actions/room'
import { startStarShieldMatch, getStarShieldMatchStatus, isHellUnlocked } from '@/server/actions/game'
import { RoomWithUsersAndReadyStatus } from '@/types'
import type { UserRanking } from '@/types'
import type { Difficulty, GameResult, GameStats } from '@/types/starShieldGame'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'
import { TitleScreen } from '@/components/game/phases/starShieldGame/titleScreen'
import { RoleSelectionScreen } from '@/components/game/phases/starShieldGame/roleSelectionScreen'
import { GameScreen } from '@/components/game/phases/starShieldGame/gameScreen'
import { ResultScreen } from '@/components/game/phases/starShieldGame/resultScreen'
import { PresenceDuplicateWarning } from '@/components/common/PresenceDuplicateWarning'

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

    const PHASE_STORAGE_KEY = `star-shield-phase-${roomId}`
    const [phase, setPhase] = useState<GamePhase>('TITLE')
    const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL')
    const [matchId, setMatchId] = useState<string | null>(null)
    const [startedAt, setStartedAt] = useState<number | null>(null)
    const [shooterId, setShooterId] = useState<string | null>(null)
    const [gameResult, setGameResult] = useState<GameResult | null>(null)
    const [gameStats, setGameStats] = useState<GameStats | null>(null)
    const [hellUnlocked, setHellUnlocked] = useState(false)

    const initialRoleChoices = useMemo(() => {
        const users = room.users
        if (users.length < 2) return {} as Record<string, RoleChoice>
        const hostId = room.createdBy
        const other = users.find((u) => u.userId !== hostId)
        if (!other) return {} as Record<string, RoleChoice>
        return { [hostId]: 'SHOOTER' as RoleChoice, [other.userId]: 'TYPIST' as RoleChoice }
    }, [room.users, room.createdBy])

    const [roleChoices, setRoleChoices] = useState<Record<string, RoleChoice>>(initialRoleChoices)
    const [techniqueChoices, setTechniqueChoices] = useState<Record<string, TechniqueId | null>>({})

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
    // リロード時も保持するため sessionStorage に永続化（ROLE_SELECT リロードで RESULT に飛ぶのを防ぐ）
    const STORAGE_KEY = `star-shield-played-${roomId}`
    const initialPlayedMatchIds = useMemo(() => {
        if (typeof window === 'undefined') return new Set<string>()
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY)
            return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>()
        } catch {
            return new Set<string>()
        }
    }, [STORAGE_KEY])
    const playedMatchIdsRef = useRef<Set<string>>(initialPlayedMatchIds)
    const addPlayedMatchId = useCallback((id: string) => {
        playedMatchIdsRef.current.add(id)
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...playedMatchIdsRef.current]))
        } catch {
            /* ignore */
        }
    }, [roomId])
    const lobbyChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const allUsersReady = room.users.length > 0 && room.users.every((u) => u.isReady)

    // マウント後に sessionStorage から ROLE_SELECT を復元（SSR との hydration ミスマッチを防ぐためクライアント only）
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(PHASE_STORAGE_KEY)
            if (stored === 'ROLE_SELECT') setPhase('ROLE_SELECT')
        } catch {
            /* ignore */
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps -- PHASE_STORAGE_KEY は roomId 依存でマウント時は不変

    // phase を sessionStorage に永続化（ROLE_SELECT でリロードしても復元）
    useEffect(() => {
        try {
            if (phase === 'TITLE' || phase === 'ROLE_SELECT') {
                sessionStorage.setItem(PHASE_STORAGE_KEY, phase)
            } else {
                sessionStorage.removeItem(PHASE_STORAGE_KEY)
            }
        } catch {
            /* ignore */
        }
    }, [phase, roomId])

    // ロビー用 broadcast: TITLE と ROLE_SELECT で channel を有効化
    useEffect(() => {
        if (phase !== 'TITLE' && phase !== 'ROLE_SELECT') return

        const channel = supabase.channel(`star_shield_lobby_${roomId}`)
        lobbyChannelRef.current = channel

        channel
            .on('broadcast', { event: 'difficulty' }, ({ payload }: { payload: { difficulty: Difficulty } }) => {
                if (payload?.difficulty && ['EASY', 'NORMAL', 'HARD', 'HELL'].includes(payload.difficulty)) {
                    setDifficulty(payload.difficulty)
                }
            })
            .on('broadcast', { event: 'role' }, ({ payload }: { payload: { userId: string; role: RoleChoice } }) => {
                if (payload?.userId && payload?.role && ['SHOOTER', 'TYPIST'].includes(payload.role)) {
                    setRoleChoices((prev) => ({ ...prev, [payload.userId]: payload.role }))
                }
            })
            .on('broadcast', { event: 'technique' }, ({ payload }: { payload: { userId: string; technique: TechniqueId | null } }) => {
                if (payload?.userId !== undefined) {
                    setTechniqueChoices((prev) => ({ ...prev, [payload.userId]: payload.technique }))
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

    // 技変更（Typist 用、broadcast で共有）
    const handleTechniqueChange = useCallback((technique: TechniqueId | null) => {
        setTechniqueChoices((prev) => ({ ...prev, [currentUserId]: technique }))
        lobbyChannelRef.current?.send({
            type: 'broadcast',
            event: 'technique',
            payload: { userId: currentUserId, technique },
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

    // 役職が揃ったときに HELL 解放状態を取得（ROLE_SELECT に遷移するたびに再取得し、クリア直後も解放を反映）
    const shooterIdForUnlock = room.users.find((u) => roleChoices[u.userId] === 'SHOOTER')?.userId
    const typistIdForUnlock = room.users.find((u) => roleChoices[u.userId] === 'TYPIST')?.userId
    useEffect(() => {
        if (phase !== 'ROLE_SELECT') return
        if (!shooterIdForUnlock || !typistIdForUnlock || roleConflict) {
            setHellUnlocked(false)
            return
        }
        isHellUnlocked(shooterIdForUnlock, typistIdForUnlock).then(setHellUnlocked)
    }, [phase, shooterIdForUnlock, typistIdForUnlock, roleConflict])

    // HELL が未解放のときに HELL が選択されていたら NORMAL にリセット
    useEffect(() => {
        if (!hellUnlocked && difficulty === 'HELL') {
            setDifficulty('NORMAL')
            if (isHost) {
                lobbyChannelRef.current?.send({
                    type: 'broadcast',
                    event: 'difficulty',
                    payload: { difficulty: 'NORMAL' as const },
                })
            }
        }
    }, [hellUnlocked, difficulty, isHost])

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
                addPlayedMatchId(newMatchId)
                setGameResult(status.result)
                setGameStats({ ...status.stats, fireCount: 0 }) // サーバーに保存しないので再入時は0
                setPhase('RESULT')
            } else if (status.status === 'playing') {
                setMatchId(newMatchId)
                setStartedAt(status.startedAt)
                setShooterId(status.shooterId)
                setPhase('PLAYING')
            }
            // not_found の場合は何もしない（削除済みなど）
        })
    }, [room.currentMatchId, phase, addPlayedMatchId])

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
        if (matchId) addPlayedMatchId(matchId)
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
    }, [matchId, roomId, addPlayedMatchId])

    // ルームに戻る（ホストのみ）
    const handleExit = useCallback(async () => {
        await returnToRoom(roomId)
    }, [roomId])

    // 背景は (play) layout で描画（room ⇔ game 遷移時もアンマウントされない）
    return (
        <PresenceDuplicateWarning roomId={roomId} currentUserId={currentUserId}>
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
                    techniqueChoices={techniqueChoices}
                    onTechniqueChange={handleTechniqueChange}
                    roleConflict={roleConflict}
                    canProceed={!roleConflict}
                    onProceedToGame={handleProceedToGame}
                    onBack={handleBackToLobby}
                    currentUserId={currentUserId}
                    difficulty={difficulty}
                    onDifficultyChange={handleDifficultyChange}
                    isHost={isHost}
                    isHellUnlocked={hellUnlocked}
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
                    playersTotalPoints={room.users.reduce((sum, u) => sum + (initialRankings.find((r) => r.userId === u.userId)?.points ?? 0), 0)}
                    typistTechnique={((): TechniqueId | null => {
                        const typist = room.users.find((u) => roleChoices[u.userId] === 'TYPIST')
                        return typist ? (techniqueChoices[typist.userId] ?? null) : null
                    })()}
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
        </PresenceDuplicateWarning>
    )
}
