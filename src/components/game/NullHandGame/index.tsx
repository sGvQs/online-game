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
import { DealPhase } from './phases/DealPhase' // Added DealPhase import
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
    const [localRankings, setLocalRankings] = useState<UserRanking[]>(initialRankings)
    const [hasCalculatedScores, setHasCalculatedScores] = useState(false)

    // INITIAL_RANKINGSが外部から更新された場合はローカルステートにも反映(再入室などを想定)
    useEffect(() => {
        setLocalRankings(initialRankings)
    }, [initialRankings])

    // GAME_OVER時にローカルでスコアを合算してランキングをオプティミスティック更新する
    useEffect(() => {
        if (phase === 'GAME_OVER' && currentScores.length > 0 && !hasCalculatedScores) {
            setHasCalculatedScores(true)

            // 現在の localRankings に currentScores のポイントを足す
            const updated = localRankings.map(ranking => {
                const scoreAdd = currentScores.find(s => s.userId === ranking.userId)?.points || 0
                return {
                    ...ranking,
                    points: ranking.points + scoreAdd
                }
            })

            // 新しいポイントで降順ソート
            updated.sort((a, b) => b.points - a.points)

            // 順位（rank）の再計算
            let currentRank = 1
            let previousPoints = -1
            let tieCount = 0

            const reRanked = updated.map((ranking, index) => {
                if (previousPoints !== ranking.points) {
                    currentRank = index + 1
                    tieCount = 0
                    previousPoints = ranking.points
                } else {
                    tieCount++
                }
                return {
                    ...ranking,
                    rank: currentRank
                }
            })

            // ステートを更新
            setLocalRankings(reRanked)
        }
    }, [phase, currentScores, localRankings, hasCalculatedScores])

    const handleClose = async () => {
        await returnToRoom(roomId)
    }

    // フェーズが変わった際に選択状態とスコア計算フラグをリセット
    useEffect(() => {
        if (phase === 'DEAL' || phase === 'CHOICE') {
            setSelectedHand(null)
            setHasCalculatedScores(false)
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

    // = :::::::::::::::::::::::::::::::::::::::::
    // RENDER
    // = :::::::::::::::::::::::::::::::::::::::::
    const [userColor, setUserColor] = useState<string>('#44FFFF')

    useEffect(() => {
        const savedColor = localStorage.getItem('nullhand_user_color')
        if (savedColor) {
            setUserColor(savedColor)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('nullhand_user_color', userColor)
    }, [userColor])

    return (
        <>
            <AnimatePresence mode="popLayout">
                {phase === 'TITLE' && showSplash && (
                    <OpeningSplash
                        key="splash"
                        onComplete={() => setShowSplash(false)}
                        titleHand={titleHand}
                        userColor={userColor}
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
                        initialRankings={localRankings} // 最新のローカルランキングを渡す
                        onToggleReady={toggleReady}
                        onStartGame={handleStartGame}
                        onExit={handleClose}
                        userColor={userColor}
                        onColorChange={setUserColor}
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
                                userColor={userColor}
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
                                currentScores={currentScores}
                                currentUserId={currentUserId}
                                userColor={userColor}
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
                                userColor={userColor}
                            />
                        )}

                        {phase === 'GAME_OVER' && (
                            <GameOverPhase
                                currentUserId={currentUserId}
                                newRankings={localRankings} // サーバーからのフェッチではなくローカルで計算済みのものを渡す
                                initialRankings={initialRankings} // GameOverPhaseで上昇分を見せるために、試合開始時の値も渡す
                                currentScores={currentScores}
                                onFinish={handleFinish}
                                userColor={userColor}
                            />
                        )}
                    </GameLayout>
                )}
            </AnimatePresence>
        </>
    )
}
