'use client'

import { useNullHand } from '@/hooks/useNullHand'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom } from '@/server/actions/room'
import { RoomWithUsersAndReadyStatus, HandType, HostChoice, UserRanking } from '@/shared/types'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TitleScreen } from './TitleScreen'
import { GameLayout } from './GameLayout'
import { ChoicePhase } from './phases/ChoicePhase'
import { BattlePhase } from './phases/BattlePhase'
import { ResultPhase } from './phases/ResultPhase'
import { GameOverPhase } from './phases/GameOverPhase'
import { OpeningSplash } from './OpeningSplash'

interface NullHandGameProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    roomId: string
    initialMatchId: string | null
    currentUserId: string
    initialRankings?: UserRanking[]
}

export function NullHandGame({
    room: initialRoom,
    isHost,
    roomId,
    initialMatchId,
    currentUserId,
    initialRankings = [],
}: NullHandGameProps) {
    const { room, isReady, toggleReady, isTogglingReady } = useGameRoom({
        roomId,
        initialRoom,
        currentUserId,
    })

    const {
        phase,
        jankenEvent,
        hostStats,
        isProcessing,
        currentScores,
        handleStartGame,
        handleSetHostChoice,
        handleSetGuestHand,
        handleNextRound,
        handleMarkNextRoundReady,
        handleFinish,
        isCurrentHost,
        error,
    } = useNullHand({ roomId, isHost, initialMatchId, currentUserId })

    // タイトル画面用の手のローテーション
    const [titleHand, setTitleHand] = useState<HandType>(HandType.ROCK)
    useEffect(() => {
        if (phase !== 'TITLE' && phase !== 'DEAL') return
        const hands = Object.values(HandType)
        let index = 0
        const interval = setInterval(() => {
            index = (index + 1) % hands.length
            setTitleHand(hands[index])
        }, 3000)
        return () => clearInterval(interval)
    }, [phase])

    const [selectedHand, setSelectedHand] = useState<HandType | null>(null)
    const [newRankings, setNewRankings] = useState<UserRanking[]>([])

    // GAME_OVER時に最新のランキングを取得
    useEffect(() => {
        if (phase === 'GAME_OVER') {
            const fetchRankings = async () => {
                const userIds = room.users.map(u => u.userId)
                try {
                    const { getNullHandRankings } = await import('@/server/actions/game/rankingActions')
                    const rankings = await getNullHandRankings(userIds)
                    setNewRankings(rankings)
                } catch (e) {
                    console.error('Failed to fetch rankings', e)
                }
            }
            fetchRankings()
        }
    }, [phase, room.users])

    const handleClose = async () => {
        await returnToRoom(roomId)
    }

    // フェーズが変わった際に選択状態をリセット
    useEffect(() => {
        if (phase === 'DEAL' || phase === 'CHOICE') {
            setSelectedHand(null)
        }
    }, [phase])

    const allUsersReady = room.users.every((u) => u.isReady)

    // ホスト名の取得
    const hostUser = room.users.find(u => u.userId === jankenEvent?.currentHostId)
    const hostName = hostUser?.user.name || 'HOST'

    // ============================================
    // OPENING SPLASH
    // ============================================
    const [showSplash, setShowSplash] = useState(true)

    // ============================================
    // RENDER
    // ============================================

    return (
        <>
            <AnimatePresence mode="popLayout">
                {phase === 'TITLE' && showSplash && (
                    <OpeningSplash
                        key="splash"
                        onComplete={() => setShowSplash(false)}
                        titleHand={titleHand}
                    />
                )}
                {phase === 'TITLE' && !showSplash && (
                    <TitleScreen
                        key="title"
                        room={room}
                        isHost={isHost}
                        isReady={isReady}
                        allUsersReady={allUsersReady}
                        titleHand={titleHand}
                        initialRankings={initialRankings}
                        onToggleReady={toggleReady}
                        onStartGame={handleStartGame}
                        onExit={handleClose}
                    />
                )}
                {phase !== 'TITLE' && (
                    <GameLayout key="game" phase={phase} error={error} hostName={hostName}>
                        {phase === 'CHOICE' && (
                            <ChoicePhase
                                jankenEvent={jankenEvent}
                                hostStats={hostStats}
                                isCurrentHost={isCurrentHost}
                                isProcessing={isProcessing}
                                onChoice={handleSetHostChoice}
                                hostName={hostName}
                                currentScores={currentScores}
                                currentUserId={currentUserId}
                            />
                        )}

                        {phase === 'BATTLE' && (
                            <BattlePhase
                                jankenEvent={jankenEvent}
                                hostStats={hostStats}
                                isCurrentHost={isCurrentHost}
                                selectedHand={selectedHand}
                                isProcessing={isProcessing}
                                onSelectHand={setSelectedHand}
                                onSubmit={() => selectedHand && handleSetGuestHand(selectedHand)}
                                hostName={hostName}
                            />
                        )}

                        {phase === 'RESULT' && (
                            <ResultPhase
                                jankenEvent={jankenEvent}
                                currentScores={currentScores}
                                isProcessing={isProcessing}
                                onNextRound={handleMarkNextRoundReady}
                                hostName={hostName}
                                currentUserId={currentUserId}
                                isCurrentHost={isCurrentHost}
                                hostStats={hostStats}
                                roomUsers={room.users}
                            />
                        )}

                        {phase === 'GAME_OVER' && (
                            <GameOverPhase
                                currentUserId={currentUserId}
                                newRankings={newRankings}
                                initialRankings={initialRankings}
                                currentScores={currentScores}
                                onFinish={handleFinish}
                            />
                        )}
                    </GameLayout>
                )}
            </AnimatePresence>
        </>
    )
}
