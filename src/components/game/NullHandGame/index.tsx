'use client'

import { useNullHand } from '@/hooks/useNullHand'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom } from '@/server/actions/room'
import { RoomWithUsersAndReadyStatus, HandType, FakeTarget, FakeDetails, UserRanking } from '@/shared/types'
import { useState, useEffect } from 'react'
import { TitleScreen } from './TitleScreen'
import { GameLayout } from './GameLayout'
import { SetupPhase } from './phases/SetupPhase'
import { ShowcasePhase } from './phases/ShowcasePhase'
import { FinalDecisionPhase } from './phases/FinalDecisionPhase'
import { BattlePhase } from './phases/BattlePhase'
import { ResultPhase } from './phases/ResultPhase'
import { GameOverPhase } from './phases/GameOverPhase'

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
        handleSetInitialHand,
        handleConfirmShowcase,
        handleSetFinalHostHand,
        handleSetGuestHand,
        handleNextRound,
        handleFinish,
        isCurrentHost,
        error,
    } = useNullHand({ roomId, isHost, initialMatchId, currentUserId })

    // タイトル画面用の手のローテーション
    const [titleHand, setTitleHand] = useState<HandType>('ROCK')
    useEffect(() => {
        if (phase !== 'TITLE' && phase !== 'SETUP') return
        const hands: HandType[] = ['ROCK', 'SCISSORS', 'PAPER']
        let index = 0
        const interval = setInterval(() => {
            index = (index + 1) % hands.length
            setTitleHand(hands[index])
        }, 3000)
        return () => clearInterval(interval)
    }, [phase])

    const [selectedHand, setSelectedHand] = useState<HandType | null>(null)
    const [selectedFake, setSelectedFake] = useState<FakeTarget>('NONE')
    const [fakeDetails, setFakeDetails] = useState<FakeDetails>({})
    const [newRankings, setNewRankings] = useState<UserRanking[]>([])

    // GAME_OVER時に最新のランキングを取得
    useEffect(() => {
        if (phase === 'GAME_OVER') {
            const fetchRankings = async () => {
                const userIds = room.users.map(u => u.userId)
                try {
                    // Server Actionをクライアントから呼び出す
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

    const allUsersReady = room.users.every((u) => u.isReady)

    // ============================================
    // TITLE フェーズ
    // ============================================
    if (phase === 'TITLE') {
        return (
            <TitleScreen
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
        )
    }

    // ============================================
    // ゲーム中の共通UI + フェーズごとのコンテンツ
    // ============================================

    return (
        <GameLayout phase={phase} error={error}>
            {phase === 'SETUP' && (
                <SetupPhase
                    isCurrentHost={isCurrentHost}
                    titleHand={titleHand}
                    hostStats={hostStats}
                    selectedHand={selectedHand}
                    selectedFake={selectedFake}
                    fakeDetails={fakeDetails}
                    isProcessing={isProcessing}
                    onSelectHand={setSelectedHand}
                    onSelectFake={setSelectedFake}
                    onUpdateFakeDetails={setFakeDetails}
                    onSubmit={() => selectedHand && handleSetInitialHand(selectedHand, selectedFake, fakeDetails)}
                />
            )}

            {phase === 'SHOWCASE' && (
                <ShowcasePhase
                    jankenEvent={jankenEvent}
                    hostStats={hostStats}
                    isCurrentHost={isCurrentHost}
                    isProcessing={isProcessing}
                    onConfirm={handleConfirmShowcase}
                />
            )}

            {phase === 'FINAL_DECISION' && (
                <FinalDecisionPhase
                    jankenEvent={jankenEvent}
                    hostStats={hostStats}
                    isCurrentHost={isCurrentHost}
                    selectedHand={selectedHand}
                    isProcessing={isProcessing}
                    onSelectHand={setSelectedHand}
                    onSubmit={() => selectedHand && handleSetFinalHostHand(selectedHand)}
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
                />
            )}

            {phase === 'RESULT' && (
                <ResultPhase
                    jankenEvent={jankenEvent}
                    currentScores={currentScores}
                    isProcessing={isProcessing}
                    onNextRound={handleNextRound}
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
    )
}
