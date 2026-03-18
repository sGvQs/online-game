'use client'

import { useCallback } from 'react'
import { useGameRoom } from '@/hooks/useGameRoom'
import { useStarShieldLobby } from '@/hooks/useStarShield/useStarShieldLobby'
import { returnToRoom } from '@/server/actions/room'
import { RoomWithUsersAndReadyStatus } from '@/types'
import type { UserRanking } from '@/types'
import type { PairRanking } from '@/server/actions/game/starShieldRankingActions'
import { TitleScreen } from '@/components/game/phases/starShieldGame/titleScreen'
import { RoleSelectionScreen } from '@/components/game/phases/starShieldGame/roleSelectionScreen'
import { GameScreen } from '@/components/game/phases/starShieldGame/gameScreen'
import { ResultScreen } from '@/components/game/phases/starShieldGame/resultScreen'
import { PresenceDuplicateWarning } from '@/components/common/PresenceDuplicateWarning'

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

    const {
        phase,
        difficulty,
        roleChoices,
        roleConflict,
        shooterIdForUnlock,
        hellUnlocked,
        abyssUnlocked,
        shooterProgress,
        typistProgress,
        currentUserProgress,
        playingProps,
        gameResult,
        gameStats,
        gameResultDifficulty,
        allUsersReady,
        canStartLobby,
        handleRoleChange,
        handleDifficultyChange,
        handleStartGame,
        handleProceedToGame,
        handleBackToLobby,
        handleGameEnd,
        handleBackToTitle,
        handleShooterLoadoutUpdate,
    } = useStarShieldLobby({ room, isHost, roomId, currentUserId })

    const handleExit = useCallback(async () => {
        await returnToRoom(roomId)
    }, [roomId])

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
                        shooterProgress={shooterProgress}
                        typistProgress={typistProgress}
                        currentUserProgress={currentUserProgress}
                        shooterId={shooterIdForUnlock ?? null}
                        onShooterLoadoutUpdate={handleShooterLoadoutUpdate}
                    />
                )}
                {phase === 'PLAYING' && playingProps && (
                    <GameScreen
                        {...playingProps}
                        difficulty={difficulty}
                        currentUserId={currentUserId}
                        onGameEnd={handleGameEnd}
                    />
                )}
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
