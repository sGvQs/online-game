'use client'

import { useNullHand } from '@/hooks/useNullHand'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom } from '@/server/actions/room'
import { nullHandGame } from './styles'
import { RoomWithUsersAndReadyStatus, HandType, FakeTarget, RoomUserWithReadyStatus } from '@/shared/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NullHandGameProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    roomId: string
    initialMatchId: string | null
    currentUserId: string
}

export function NullHandGame({
    room: initialRoom,
    isHost,
    roomId,
    initialMatchId,
    currentUserId,
}: NullHandGameProps) {
    const styles = nullHandGame()

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
        timerProgress,
        handleStartGame,
        handleSetInitialHand,
        handleConfirmShowcase,
        handleSetFinalHostHand,
        handleSetGuestHand,
        handleFinish,
        isCurrentHost,
    } = useNullHand({ roomId, isHost, initialMatchId, currentUserId })

    const [selectedHand, setSelectedHand] = useState<HandType | null>(null)
    const [selectedFake, setSelectedFake] = useState<FakeTarget>('NONE')

    const handleClose = async () => {
        await returnToRoom(roomId)
    }

    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length
    const allUsersReady = room.users.every((u: RoomUserWithReadyStatus) => u.isReady)

    // ============================================
    // TITLE フェーズ
    // ============================================
    if (phase === 'TITLE') {
        return (
            <div className={styles.container()}>
                <div className={styles.titleScreen()}>
                    <h1 className={styles.logo()}>NULL HAND</h1>
                    <p className={styles.subtitle()}>INTELLIGENT QUBE FINAL</p>

                    <div className={styles.playerList()}>
                        <h2 className="text-green-400 text-xl mb-4 tracking-widest">PLAYERS</h2>
                        {room.users.map((u: RoomUserWithReadyStatus) => (
                            <div key={u.id} className={styles.playerItem()}>
                                <span>{u.user?.name || 'Unknown'}</span>
                                <span className={u.isReady ? styles.playerReady() : ''}>
                                    {u.isReady ? '[READY]' : ''}
                                </span>
                            </div>
                        ))}
                        <div className="mt-4 text-green-300 text-sm">
                            Ready: {readyCount} / {totalUsers}
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            className={styles.button()}
                            onClick={toggleReady}
                            disabled={isTogglingReady}
                        >
                            {isReady ? 'CANCEL' : 'READY'}
                        </button>

                        {isHost && (
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                onClick={handleStartGame}
                                disabled={isProcessing || !allUsersReady}
                            >
                                START GAME
                            </button>
                        )}

                        <button className={styles.button()} onClick={handleClose}>
                            RETURN
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ============================================
    // ゲーム中の共通UI
    // ============================================
    const showTimer = phase !== 'RESULT'

    return (
        <div className={styles.container()}>
            <div className={styles.gameScreen()}>
                {/* フェーズ表示 */}
                <div className={styles.phaseIndicator()}>
                    {phase === 'SETUP' && 'SETUP'}
                    {phase === 'SHOWCASE' && 'SHOWCASE'}
                    {phase === 'FINAL_DECISION' && 'FINAL DECISION'}
                    {phase === 'BATTLE' && 'BATTLE'}
                    {phase === 'RESULT' && 'RESULT'}
                </div>

                {/* タイマーバー */}
                {showTimer && (
                    <div className={styles.timerContainer()}>
                        <div
                            className={styles.timerBar()}
                            style={{ width: `${timerProgress}%` }}
                        />
                    </div>
                )}

                {/* SETUP: ホストのみ */}
                {phase === 'SETUP' && isCurrentHost && (
                    <div>
                        <p className={styles.messageText()}>あなたはこのターンのホストです。手を選択してください。</p>

                        {/* 統計表示 */}
                        {hostStats && (
                            <div className={styles.statsPanel()}>
                                <div className={styles.statItem()}>
                                    <span className={styles.statLabel()}>Total Games</span>
                                    <span className={styles.statValue()}>{hostStats.totalGames}</span>
                                </div>
                                <div className={styles.statItem()}>
                                    <span className={styles.statLabel()}>Favorite Hand</span>
                                    <span className={styles.statValue()}>
                                        {hostStats.favoriteHand === 'ROCK' && '✊ ROCK'}
                                        {hostStats.favoriteHand === 'SCISSORS' && '✌️ SCISSORS'}
                                        {hostStats.favoriteHand === 'PAPER' && '✋ PAPER'}
                                    </span>
                                </div>
                                <div className={styles.statItem()}>
                                    <span className={styles.statLabel()}>Change Rate</span>
                                    <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                                </div>
                            </div>
                        )}

                        {/* 手選択 */}
                        <div className={styles.handGrid()}>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'ROCK' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('ROCK')}
                            >
                                ✊
                            </div>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'SCISSORS' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('SCISSORS')}
                            >
                                ✌️
                            </div>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'PAPER' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('PAPER')}
                            >
                                ✋
                            </div>
                        </div>

                        {/* 嘘選択 */}
                        <p className={styles.warningText()}>⚠️ 嘘をつけ!</p>
                        <div className={styles.fakeGrid()}>
                            {([
                                { value: 'NONE', label: '嘘をつかない' },
                                { value: 'INITIAL_HAND', label: '仮置きの手を偽装' },
                                { value: 'CHANGE_RATE', label: '手を変える確率を偽装' },
                                { value: 'FAVORITE_HAND', label: 'よく出す手を偽装' },
                            ] as const).map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        styles.fakeOption(),
                                        selectedFake === option.value && styles.fakeOptionSelected()
                                    )}
                                    onClick={() => setSelectedFake(option.value)}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                disabled={!selectedHand || isProcessing}
                                onClick={() => selectedHand && handleSetInitialHand(selectedHand, selectedFake)}
                            >
                                CONFIRM
                            </button>
                        </div>
                    </div>
                )}

                {/* SETUP: ゲスト待機 */}
                {phase === 'SETUP' && !isCurrentHost && (
                    <div className={styles.messageText()}>
                        <p>ホストが手を選択しています...</p>
                        <p className="text-sm mt-2">しばらくお待ちください</p>
                    </div>
                )}

                {/* SHOWCASE: 全員 */}
                {phase === 'SHOWCASE' && jankenEvent && (
                    <div>
                        <p className={styles.messageText()}>ホストの情報を確認してください</p>

                        {/* ホストの仮置き手表示 */}
                        <div className={styles.handDisplay()}>
                            <div className={cn(styles.handEmoji(), styles.handRevealed())}>
                                {jankenEvent.initialHand === 'ROCK' && '✊'}
                                {jankenEvent.initialHand === 'SCISSORS' && '✌️'}
                                {jankenEvent.initialHand === 'PAPER' && '✋'}
                                {!jankenEvent.initialHand && '?'}
                            </div>
                        </div>

                        {/* 統計表示（嘘混じり） */}
                        {hostStats && (
                            <div className={styles.statsPanel()}>
                                <div className={styles.statItem()}>
                                    <span className={styles.statLabel()}>Favorite Hand</span>
                                    <span className={styles.statValue()}>
                                        {hostStats.favoriteHand === 'ROCK' && '✊ ROCK'}
                                        {hostStats.favoriteHand === 'SCISSORS' && '✌️ SCISSORS'}
                                        {hostStats.favoriteHand === 'PAPER' && '✋ PAPER'}
                                    </span>
                                </div>
                                <div className={styles.statItem()}>
                                    <span className={styles.statLabel()}>Change Rate</span>
                                    <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                                </div>
                            </div>
                        )}

                        {!isCurrentHost && (
                            <div className="text-center mt-8">
                                <button
                                    className={cn(styles.button(), styles.buttonPrimary())}
                                    disabled={isProcessing}
                                    onClick={handleConfirmShowcase}
                                >
                                    CONFIRMED
                                </button>
                            </div>
                        )}

                        {isCurrentHost && (
                            <p className={styles.messageText()}>ゲストの確認を待っています...</p>
                        )}
                    </div>
                )}

                {/* FINAL_DECISION: ホストのみ */}
                {phase === 'FINAL_DECISION' && isCurrentHost && jankenEvent && (
                    <div>
                        <p className={styles.messageText()}>最終決定: 手を変えますか?</p>

                        <div className={styles.handGrid()}>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'ROCK' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('ROCK')}
                            >
                                ✊
                            </div>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'SCISSORS' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('SCISSORS')}
                            >
                                ✌️
                            </div>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'PAPER' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('PAPER')}
                            >
                                ✋
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                disabled={!selectedHand || isProcessing}
                                onClick={() => selectedHand && handleSetFinalHostHand(selectedHand)}
                            >
                                DECIDE
                            </button>
                        </div>
                    </div>
                )}

                {/* FINAL_DECISION: ゲスト待機 */}
                {phase === 'FINAL_DECISION' && !isCurrentHost && (
                    <div className={styles.messageText()}>
                        <p>ホストが最終決定をしています...</p>
                    </div>
                )}

                {/* BATTLE: ゲストの手入力 */}
                {phase === 'BATTLE' && !isCurrentHost && (
                    <div>
                        <p className={styles.messageText()}>あなたの手を選んでください!</p>

                        <div className={styles.handGrid()}>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'ROCK' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('ROCK')}
                            >
                                ✊
                            </div>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'SCISSORS' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('SCISSORS')}
                            >
                                ✌️
                            </div>
                            <div
                                className={cn(
                                    styles.handOption(),
                                    selectedHand === 'PAPER' && styles.handOptionSelected()
                                )}
                                onClick={() => setSelectedHand('PAPER')}
                            >
                                ✋
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                disabled={!selectedHand || isProcessing}
                                onClick={() => selectedHand && handleSetGuestHand(selectedHand)}
                            >
                                SUBMIT
                            </button>
                        </div>
                    </div>
                )}

                {/* BATTLE: ホスト待機 */}
                {phase === 'BATTLE' && isCurrentHost && (
                    <div className={styles.messageText()}>
                        <p>ゲストが手を選択しています...</p>
                    </div>
                )}

                {/* RESULT: 結果表示 */}
                {phase === 'RESULT' && jankenEvent && (
                    <div className={styles.resultScreen()}>
                        <h2 className={styles.resultTitle()}>RESULT</h2>

                        <div className="mb-8">
                            <p className="text-green-300 mb-2">ホストの手:</p>
                            <div className="text-9xl">
                                {jankenEvent.finalHostHand === 'ROCK' && '✊'}
                                {jankenEvent.finalHostHand === 'SCISSORS' && '✌️'}
                                {jankenEvent.finalHostHand === 'PAPER' && '✋'}
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                onClick={handleFinish}
                            >
                                CONTINUE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
