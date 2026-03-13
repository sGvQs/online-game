'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom, resetAllReady } from '@/server/actions/room'
import { startStarShieldMatch, getStarShieldMatchStatus, isHellUnlocked, getStarShieldProgress, getMyStarShieldProgress, updateLoadout } from '@/server/actions/game'
import { RoomWithUsersAndReadyStatus } from '@/types'
import type { UserRanking } from '@/types'
import type { Difficulty, GameResult, GameStats, NormalAttackLevel } from '@/types/starShieldGame'
import { getAvailableNormalAttacks, getAvailableSpecialAttacks } from '@/utils/starShieldGame'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
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
    const [gameResultDifficulty, setGameResultDifficulty] = useState<Difficulty | null>(null)
    const [hellUnlocked, setHellUnlocked] = useState(false)
    const [shooterProgress, setShooterProgress] = useState<Awaited<ReturnType<typeof getStarShieldProgress>> | null>(null)
    const [typistProgress, setTypistProgress] = useState<Awaited<ReturnType<typeof getStarShieldProgress>> | null>(null)
    const [currentUserProgress, setCurrentUserProgress] = useState<Awaited<ReturnType<typeof getStarShieldProgress>> | null>(null)

    const initialRoleChoices = useMemo(() => {
        const users = room.users
        if (users.length < 2) return {} as Record<string, RoleChoice>
        const hostId = room.createdBy
        const other = users.find((u) => u.userId !== hostId)
        if (!other) return {} as Record<string, RoleChoice>
        return { [hostId]: 'SHOOTER' as RoleChoice, [other.userId]: 'TYPIST' as RoleChoice }
    }, [room.users, room.createdBy])

    const [roleChoices, setRoleChoices] = useState<Record<string, RoleChoice>>(initialRoleChoices)
    const [autoAimNearest, setAutoAimNearest] = useState(false)

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

    // 役職が揃ったときに HELL 解放状態を取得（ROLE_SELECT に遷移するたびに再取得し、クリア直後も解放を反映）
    const shooterIdForUnlock = room.users.find((u) => roleChoices[u.userId] === 'SHOOTER')?.userId
    const typistIdForUnlock = room.users.find((u) => roleChoices[u.userId] === 'TYPIST')?.userId
    useEffect(() => {
        if (phase !== 'ROLE_SELECT') return
        if (shooterIdForUnlock && typistIdForUnlock && !roleConflict) {
            isHellUnlocked(shooterIdForUnlock, typistIdForUnlock).then(setHellUnlocked)
            getStarShieldProgress(shooterIdForUnlock).then(setShooterProgress)
            getStarShieldProgress(typistIdForUnlock).then(setTypistProgress)
            return
        }
        if (roleConflict && room.users.length >= 2) {
            const [u0, u1] = room.users
            isHellUnlocked(u0.userId, u1.userId).then(setHellUnlocked)
        } else {
            setHellUnlocked(false)
        }
        setShooterProgress(null)
        setTypistProgress(null)
    }, [phase, shooterIdForUnlock, typistIdForUnlock, roleConflict, room.users])

    const refreshProgress = useCallback(async () => {
        if (phase !== 'ROLE_SELECT') return
        const p1 = getMyStarShieldProgress().then(setCurrentUserProgress)
        const p2 =
            shooterIdForUnlock && typistIdForUnlock && !roleConflict
                ? Promise.all([
                      getStarShieldProgress(shooterIdForUnlock).then(setShooterProgress),
                      getStarShieldProgress(typistIdForUnlock).then(setTypistProgress),
                  ])
                : Promise.resolve()
        await Promise.all([p1, p2])
    }, [phase, shooterIdForUnlock, typistIdForUnlock, roleConflict])

    // 役割選択画面表示時に自分の progress を取得（1人でも表示できるよう常に取得）
    useEffect(() => {
        if (phase !== 'ROLE_SELECT') return
        getMyStarShieldProgress().then(setCurrentUserProgress)
    }, [phase])

    const handleShooterLoadoutUpdate = useCallback(
        async (updates: Parameters<typeof updateLoadout>[0]) => {
            const result = await updateLoadout(updates)
            if (result.ok) await refreshProgress()
        },
        [refreshProgress]
    )

    // HELL が未解放のときに HELL が選択されていたら EASY にリセット
    useEffect(() => {
        if (!hellUnlocked && difficulty === 'HELL') {
            setDifficulty('EASY')
            if (isHost) {
                lobbyChannelRef.current?.send({
                    type: 'broadcast',
                    event: 'difficulty',
                    payload: { difficulty: 'EASY' as const },
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
                setGameResultDifficulty(status.difficulty)
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
            // ゲーム開始前に最新の loadout を取得（シューターが色を変えてもホストは broadcast を受けてないため）
            const [freshShooter, freshTypist] = await Promise.all([
                getStarShieldProgress(shooterIdFromRoles),
                getStarShieldProgress(typistIdFromRoles),
            ])
            setShooterProgress(freshShooter)
            setTypistProgress(freshTypist)
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
    const handleGameEnd = useCallback((result: GameResult, stats: GameStats, actualDifficulty?: Difficulty) => {
        setGameResult(result)
        setGameStats(stats)
        if (actualDifficulty != null) setGameResultDifficulty(actualDifficulty)
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
        setGameResultDifficulty(null)
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
                    roomId={roomId}
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
                    roomId={roomId}
                    roleConflict={roleConflict}
                    canProceed={!roleConflict}
                    onProceedToGame={handleProceedToGame}
                    onBack={handleBackToLobby}
                    currentUserId={currentUserId}
                    difficulty={difficulty}
                    onDifficultyChange={handleDifficultyChange}
                    isHost={isHost}
                    isHellUnlocked={hellUnlocked}
                    autoAimNearest={autoAimNearest}
                    onToggleAutoAim={() => setAutoAimNearest((prev) => !prev)}
                    shooterProgress={shooterProgress}
                    typistProgress={typistProgress}
                    currentUserProgress={currentUserProgress}
                    shooterId={shooterIdForUnlock ?? null}
                    onShooterLoadoutUpdate={handleShooterLoadoutUpdate}
                />
            )}
            {phase === 'PLAYING' && matchId && startedAt && shooterId && (() => {
                const shooterOwned = shooterProgress ?? {
                    normalAttacks: [{ techniqueId: 'red', level: 1 }],
                    specialAttacks: [],
                    healLevel: null,
                }
                const availableNormalAttacks = getAvailableNormalAttacks(shooterOwned)
                const availableSpecialAttacks = getAvailableSpecialAttacks(shooterOwned)
                const rawNormal = shooterProgress?.selectedNormalAttackId ?? 'red'
                const selectedNormal: TechniqueId =
                    availableNormalAttacks.some((a) => a.techniqueId === rawNormal) ? (rawNormal as TechniqueId) : (availableNormalAttacks[0]?.techniqueId ?? 'red')
                const derivedLevel: NormalAttackLevel =
                    (availableNormalAttacks.find((a) => a.techniqueId === selectedNormal)?.level ?? 1) as NormalAttackLevel
                // Typist の healLevel === 6 なら all_destruction を自動適用（Shooter の選択より優先）
                const typistHasAllDestruction = typistProgress?.healLevel === 6
                const rawSpecial = shooterProgress?.selectedSpecialAttackId ?? 'spread'
                const selectedSpecialId: SpecialAttackChoice = typistHasAllDestruction
                    ? 'all_destruction'
                    : availableSpecialAttacks.some((a) => a.specialAttackId === rawSpecial)
                        ? (rawSpecial as SpecialAttackChoice)
                        : (availableSpecialAttacks[0]?.specialAttackId ?? 'spread')
                const typistSpecialAttackLevel = typistHasAllDestruction
                    ? 1
                    : (availableSpecialAttacks.find((a) => a.specialAttackId === selectedSpecialId)?.level ?? 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
                const typistHealLevel = typistProgress?.selectedHealLevel ?? null
                const starHpLevel = typistProgress?.starHpLevel ?? 1
                return (
                    <GameScreen
                        matchId={matchId}
                        startedAt={startedAt}
                        shooterId={shooterId}
                        difficulty={difficulty}
                        currentUserId={currentUserId}
                        onGameEnd={handleGameEnd}
                        playersTotalPoints={room.users.reduce((sum, u) => sum + (initialRankings.find((r) => r.userId === u.userId)?.points ?? 0), 0)}
                        typistNormalAttack={selectedNormal}
                        typistSpecialAttack={selectedSpecialId}
                        typistSpecialAttackLevel={typistSpecialAttackLevel}
                        typistHealLevel={typistHealLevel}
                        starHpLevel={starHpLevel}
                        level={derivedLevel}
                        autoAimNearest={autoAimNearest}
                    />
                )
            })()}
            {phase === 'RESULT' && gameResult && gameStats && (
                <ResultScreen
                    result={gameResult}
                    stats={gameStats}
                    difficulty={gameResultDifficulty ?? difficulty}
                    onBackToTitle={handleBackToTitle}
                />
            )}
        </div>
        </PresenceDuplicateWarning>
    )
}
