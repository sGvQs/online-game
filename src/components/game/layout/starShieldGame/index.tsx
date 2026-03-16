'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom, resetAllReady } from '@/server/actions/room'
import { createStarShieldSetupMatch, updateStarShieldSetupMatch, startStarShieldMatch, getStarShieldMatchStatus, isHellUnlocked, isAbyssUnlocked, getStarShieldProgress, getMyStarShieldProgress, updateLoadout } from '@/server/actions/game'
import { RoomWithUsersAndReadyStatus } from '@/types'
import type { UserRanking } from '@/types'
import type { PairRanking } from '@/server/actions/game/starShieldRankingActions'
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
    memberPairRank?: PairRanking | null
}

export function StarShieldGame({
    room: initialRoom,
    isHost,
    roomId,
    currentUserId,
    initialRankings,
    memberPairRank,
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
    const [gameResultDifficulty, setGameResultDifficulty] = useState<Difficulty | null>(null)
    const [hellUnlocked, setHellUnlocked] = useState(false)
    const [abyssUnlocked, setAbyssUnlocked] = useState(false)
    const [shooterProgress, setShooterProgress] = useState<Awaited<ReturnType<typeof getStarShieldProgress>> | null>(null)
    const [typistProgress, setTypistProgress] = useState<Awaited<ReturnType<typeof getStarShieldProgress>> | null>(null)
    const [currentUserProgress, setCurrentUserProgress] = useState<Awaited<ReturnType<typeof getStarShieldProgress>> | null>(null)

    const [roleChoices, setRoleChoices] = useState<Record<string, RoleChoice>>({})
    const [autoAimNearest, setAutoAimNearest] = useState(false)

    /**
     * 【初期役職の割り当て】
     * 2人揃ったタイミングで、まだ役職が選択されていない場合に
     * ホスト＝シューター、ゲスト＝タイピスト をデフォルトとして設定します。
     */
    useEffect(() => {
        if (room.users.length !== 2) return
        const hostId = room.createdBy
        const other = room.users.find((u) => u.userId !== hostId)
        if (!other) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
    }, [STORAGE_KEY])
    const lobbyChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const allUsersReady = room.users.length > 0 && room.users.every((u) => u.isReady)

    /**
     * 【ロビー内リアルタイム同期】
     * タイトル画面および役割選択画面において、難易度の変更、役職の選択、
     * およびホストによるゲーム開始合図をリアルタイムで全プレイヤーに共有します。
     */
    useEffect(() => {
        if (phase !== 'TITLE' && phase !== 'ROLE_SELECT') return

        const channel = supabase.channel(`star_shield_lobby_${roomId}`)
        lobbyChannelRef.current = channel

        channel
            .on('broadcast', { event: 'difficulty' }, ({ payload }: { payload: { difficulty: Difficulty } }) => {
                if (payload?.difficulty && ['EASY', 'NORMAL', 'HARD', 'HELL', 'ABYSS'].includes(payload.difficulty)) {
                    setDifficulty(payload.difficulty)
                }
            })
            .on('broadcast', { event: 'role' }, ({ payload }: { payload: { userId: string; role: RoleChoice } }) => {
                if (payload?.userId && payload?.role && ['SHOOTER', 'TYPIST'].includes(payload.role)) {
                    setRoleChoices((prev) => ({ ...prev, [payload.userId]: payload.role }))
                }
            })
            .on('broadcast', { event: 'startGame' }, () => {
                if (matchId) {
                    // Refetch status to proceed to playing
                    getStarShieldMatchStatus(matchId).then((status) => {
                        if (status.status === 'playing') {
                            setStartedAt(status.startedAt)
                            setShooterId(status.shooterId)
                            setPhase('PLAYING')
                        }
                    })
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            lobbyChannelRef.current = null
        }
    }, [phase, roomId, supabase, matchId])

    // 役職変更（各自が選択、broadcast で共有＆DB保存）
    const handleRoleChange = useCallback(async (role: RoleChoice) => {
        const nextChoices = { ...roleChoices, [currentUserId]: role }
        setRoleChoices(nextChoices)
        lobbyChannelRef.current?.send({
            type: 'broadcast',
            event: 'role',
            payload: { userId: currentUserId, role },
        })

        if (matchId && phase === 'ROLE_SELECT') {
            const sId = room.users.find((u) => nextChoices[u.userId] === 'SHOOTER')?.userId
            const tId = room.users.find((u) => nextChoices[u.userId] === 'TYPIST')?.userId
            if (sId && tId) {
                await updateStarShieldSetupMatch(matchId, { shooterId: sId, typistId: tId })
            }
        }
    }, [currentUserId, roleChoices, matchId, room.users, phase])

    // 役職が被っているか（2人とも同じ役職を選んだ場合）
    const roleConflict = useMemo(() => {
        const users = room.users
        if (users.length !== 2) return true
        const choices = users.map((u) => roleChoices[u.userId]).filter(Boolean)
        if (choices.length !== 2) return true
        return choices[0] === choices[1]
    }, [room.users, roleChoices])

    const shooterIdForUnlock = room.users.find((u) => roleChoices[u.userId] === 'SHOOTER')?.userId
    const typistIdForUnlock = room.users.find((u) => roleChoices[u.userId] === 'TYPIST')?.userId

    /**
     * 【進行状況・難易度解放の取得】
     * 役割選択画面において、現在選択されているペア（シューター＆タイピスト）に基づき
     * HELL/ABYSS難易度が解放されているか、およびそれぞれの装備状況を取得します。
     */
    useEffect(() => {
        if (phase !== 'ROLE_SELECT') return
        if (shooterIdForUnlock && typistIdForUnlock && !roleConflict) {
            isHellUnlocked(shooterIdForUnlock, typistIdForUnlock).then(setHellUnlocked)
            isAbyssUnlocked(shooterIdForUnlock, typistIdForUnlock).then(setAbyssUnlocked)
            getStarShieldProgress(shooterIdForUnlock).then(setShooterProgress)
            getStarShieldProgress(typistIdForUnlock).then(setTypistProgress)
            return
        }
        if (roleConflict && room.users.length >= 2) {
            const [u0, u1] = room.users
            isHellUnlocked(u0.userId, u1.userId).then(setHellUnlocked)
            isAbyssUnlocked(u0.userId, u1.userId).then(setAbyssUnlocked)
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHellUnlocked(false)
            setAbyssUnlocked(false)
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

    /**
     * 【自分自信の進行状況取得】
     * 役割選択画面において、自分が装備を変更できるよう、自身の最新の進行状況を取得します。
     */
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

    /**
     * 【難易度の自動リセット】
     * 役割選択中に、まだ解放されていない難易度が選択状態になった場合（ペアの変更など）、
     * 強制的に「EASY」へリセットし、整合性を保ちます。
     */
    useEffect(() => {
        const needsReset = (!hellUnlocked && difficulty === 'HELL') || (!abyssUnlocked && difficulty === 'ABYSS')
        if (needsReset) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDifficulty('EASY')
            if (isHost) {
                lobbyChannelRef.current?.send({
                    type: 'broadcast',
                    event: 'difficulty',
                    payload: { difficulty: 'EASY' as const },
                })
            }
        }
    }, [hellUnlocked, abyssUnlocked, difficulty, isHost])

    const canStartLobby = allUsersReady

    // ホストが難易度を変更したときに state 更新 + broadcast + DB保存
    const handleDifficultyChange = useCallback(
        async (d: Difficulty) => {
            setDifficulty(d)
            if (isHost) {
                lobbyChannelRef.current?.send({
                    type: 'broadcast',
                    event: 'difficulty',
                    payload: { difficulty: d },
                })
                if (matchId && phase === 'ROLE_SELECT') {
                    await updateStarShieldSetupMatch(matchId, { difficulty: d })
                }
            }
        },
        [isHost, matchId, phase]
    )

    /**
     * 【データベース主導のフェーズ同期】
     * Room.currentMatchId（DB上の現在のマッチID）を監視し、フェーズ遷移を制御します。
     * リロード時や途中参加時でも、DBの状態に合わせて SETUP / PLAYING / RESULT / TITLE に同期します。
     */
    useEffect(() => {
        if (!room.currentMatchId || playedMatchIdsRef.current.has(room.currentMatchId)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (phase !== 'TITLE') setPhase('TITLE')
            return
        }

        const newMatchId = room.currentMatchId
        getStarShieldMatchStatus(newMatchId).then(async (status) => {
            if (status.status === 'not_found') {
                if (phase !== 'TITLE') setPhase('TITLE')
            } else if (status.status === 'setup') {
                setDifficulty(status.difficulty)
                setRoleChoices((prev) => {
                    const next = { ...prev }
                    if (status.shooterId) next[status.shooterId] = 'SHOOTER'
                    if (status.typistId) next[status.typistId] = 'TYPIST'
                    return next
                })
                setMatchId(newMatchId)

                // SSR後等でプログレスがなければ取得
                if (!shooterProgress || !typistProgress) {
                    const [freshShooter, freshTypist] = await Promise.all([
                        getStarShieldProgress(status.shooterId),
                        getStarShieldProgress(status.typistId)
                    ])
                    setShooterProgress(freshShooter)
                    setTypistProgress(freshTypist)
                }

                if (phase !== 'ROLE_SELECT') setPhase('ROLE_SELECT')
            } else if (status.status === 'playing') {
                const sId = status.shooterId
                const tId = status.typistId
                if (sId && tId && (!shooterProgress || !typistProgress)) {
                    const [freshShooter, freshTypist] = await Promise.all([
                        getStarShieldProgress(sId),
                        getStarShieldProgress(tId)
                    ])
                    setShooterProgress(freshShooter)
                    setTypistProgress(freshTypist)
                }

                setMatchId(newMatchId)
                setStartedAt(status.startedAt)
                setShooterId(status.shooterId)
                if (phase !== 'PLAYING') setPhase('PLAYING')
            } else if (status.status === 'finished') {
                addPlayedMatchId(newMatchId)
                setGameResult(status.result)
                setGameStats({ ...status.stats, fireCount: 0 }) // サーバーに保存しないので再入時は0
                setGameResultDifficulty(status.difficulty)
                if (phase !== 'RESULT') setPhase('RESULT')
            }
        })
    }, [room.currentMatchId, addPlayedMatchId, phase, shooterProgress, typistProgress])

    // ロビーから役職決定画面へ（ホストが START 押下時）
    const handleStartGame = useCallback(async () => {
        if (!canStartLobby || !isHost) return
        try {
            const hostId = room.createdBy
            const other = room.users.find((u) => u.userId !== hostId)
            const typistId = other?.userId ?? hostId
            await createStarShieldSetupMatch(roomId, {
                shooterId: hostId,
                typistId: typistId,
            })
            // DB-driven なので、このアクションで room.currentMatchId が更新され、useEffect で画面が自動的に切り替わる
        } catch (e) {
            console.error('セットアップ開始失敗:', e)
        }
    }, [canStartLobby, isHost, room.createdBy, room.users, roomId])

    // 役職決定後にゲーム開始（ホストのみ）
    const handleProceedToGame = useCallback(async () => {
        if (roleConflict || !matchId || !isHost) return
        const shooterIdFromRoles = room.users.find((u) => roleChoices[u.userId] === 'SHOOTER')?.userId
        const typistIdFromRoles = room.users.find((u) => roleChoices[u.userId] === 'TYPIST')?.userId
        if (!shooterIdFromRoles || !typistIdFromRoles) return
        try {
            // DB のステータスを PLAYING に変更
            const { startedAt: ts, shooterId: sid } = await startStarShieldMatch(matchId)
            setStartedAt(ts)
            setShooterId(sid)
            // ゲスト達の画面切り替えのために Broadcast
            lobbyChannelRef.current?.send({ type: 'broadcast', event: 'startGame', payload: {} })
            setPhase('PLAYING')
        } catch (e) {
            console.error('ゲーム開始失敗:', e)
        }
    }, [roleConflict, matchId, isHost, room.users, roleChoices])

    // 役職決定画面からロビーへ戻る
    const handleBackToLobby = useCallback(async () => {
        if (isHost && matchId) {
            // Room.currentMatchId をクリアするなどしてタイトルに戻す（今回は played リストに入れておく）
            addPlayedMatchId(matchId)
        }
        setPhase('TITLE')
    }, [isHost, matchId, addPlayedMatchId])

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
                        memberPairRank={memberPairRank}
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
                        isAbyssUnlocked={abyssUnlocked}
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
                    const typistSpecialAttackLevel =
                        (availableSpecialAttacks.find((a) => a.specialAttackId === rawSpecial)?.level ?? 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
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
