'use client'

import { useNullHand } from '@/hooks/useNullHand'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom } from '@/server/actions/room'
import { nullHandGame } from './styles'
import { Hand3D } from './Hand3D'
import { RoomWithUsersAndReadyStatus, HandType, FakeTarget, RoomUserWithReadyStatus, FakeDetails } from '@/shared/types'
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
        currentScores,
        handleStartGame,
        handleSetInitialHand,
        handleConfirmShowcase,
        handleSetFinalHostHand,
        handleSetGuestHand,
        handleNextRound,
        handleFinish,
        isCurrentHost,
    } = useNullHand({ roomId, isHost, initialMatchId, currentUserId })

    const [selectedHand, setSelectedHand] = useState<HandType | null>(null)
    const [selectedFake, setSelectedFake] = useState<FakeTarget>('NONE')
    const [fakeDetails, setFakeDetails] = useState<FakeDetails>({})

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

                {/* SETUP: ホストのみ */}
                {phase === 'SETUP' && isCurrentHost && (
                    <div>
                        <p className={styles.messageText()}>あなたはこのターンのホストです。手を選択してください。</p>

                        {/* リアル統計表示（ホストのみが見る） */}
                        {hostStats && hostStats.realFavoriteHand && (
                            <div className={styles.realStatsPanel()}>
                                <h3 className="text-xl font-bold mb-4">YOUR REAL STATS (Private)</h3>
                                <div className={styles.realStatItem()}>
                                    <span className={styles.realStatLabel()}>Real Favorite Hand</span>
                                    <span className={styles.realStatValue()}>
                                        {hostStats.realFavoriteHand === 'ROCK' && '✊ ROCK'}
                                        {hostStats.realFavoriteHand === 'SCISSORS' && '✌️ SCISSORS'}
                                        {hostStats.realFavoriteHand === 'PAPER' && '✋ PAPER'}
                                    </span>
                                </div>
                                <div className={styles.realStatItem()}>
                                    <span className={styles.realStatLabel()}>Real Change Rate</span>
                                    <span className={styles.realStatValue()}>{hostStats.realChangeRate}%</span>
                                </div>
                            </div>
                        )}

                        {/* ゲストに見せる統計（偽装後） */}
                        {hostStats && (
                            <div className={styles.statsPanel()}>
                                <h3 className="text-lg text-gray-300 mb-3">GUESTS WILL SEE:</h3>
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

                        {/* 手選択（3D） */}
                        <div className={styles.handGrid()}>
                            {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                <div
                                    key={hand}
                                    className={cn(
                                        styles.hand3DContainer(),
                                        selectedHand === hand && styles.hand3DContainerSelected()
                                    )}
                                    onClick={() => setSelectedHand(hand)}
                                >
                                    <Hand3D handType={hand} revealed={true} size="medium" />
                                </div>
                            ))}
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

                        {/* 偽装詳細入力 */}
                        {selectedFake === 'INITIAL_HAND' && (
                            <div className={styles.fakeDetailsSection()}>
                                <div className={styles.inputLabel()}>Select fake initial hand</div>
                                <select
                                    className={styles.select()}
                                    value={fakeDetails.fakeHandValue || ''}
                                    onChange={(e) => setFakeDetails({ ...fakeDetails, fakeHandValue: e.target.value as HandType })}
                                >
                                    <option value="">-- Select --</option>
                                    <option value="ROCK">✊ ROCK</option>
                                    <option value="SCISSORS">✌️ SCISSORS</option>
                                    <option value="PAPER">✋ PAPER</option>
                                </select>
                            </div>
                        )}

                        {selectedFake === 'CHANGE_RATE' && (
                            <div className={styles.fakeDetailsSection()}>
                                <div className={styles.inputLabel()}>Input fake change rate (%)</div>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className={styles.numberInput()}
                                    value={fakeDetails.fakeChangeRateValue ?? ''}
                                    onChange={(e) => setFakeDetails({ ...fakeDetails, fakeChangeRateValue: parseInt(e.target.value) || 0 })}
                                    placeholder="0-100"
                                />
                            </div>
                        )}

                        {selectedFake === 'FAVORITE_HAND' && (
                            <div className={styles.fakeDetailsSection()}>
                                <div className={styles.inputLabel()}>Select fake favorite hand</div>
                                <select
                                    className={styles.select()}
                                    value={fakeDetails.fakeFavoriteHandValue || ''}
                                    onChange={(e) => setFakeDetails({ ...fakeDetails, fakeFavoriteHandValue: e.target.value as HandType })}
                                >
                                    <option value="">-- Select --</option>
                                    <option value="ROCK">✊ ROCK</option>
                                    <option value="SCISSORS">✌️ SCISSORS</option>
                                    <option value="PAPER">✋ PAPER</option>
                                </select>
                            </div>
                        )}

                        <div className="text-center mt-8">
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                disabled={!selectedHand || isProcessing}
                                onClick={() => selectedHand && handleSetInitialHand(selectedHand, selectedFake, fakeDetails)}
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
                            <div className="w-64 mx-auto">
                                <Hand3D
                                    handType={jankenEvent.initialHand as HandType}
                                    revealed={!!jankenEvent.initialHand}
                                    size="large"
                                />
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
                            {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                <div
                                    key={hand}
                                    className={cn(
                                        styles.hand3DContainer(),
                                        selectedHand === hand && styles.hand3DContainerSelected()
                                    )}
                                    onClick={() => setSelectedHand(hand)}
                                >
                                    <Hand3D handType={hand} revealed={true} size="medium" />
                                </div>
                            ))}
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
                            {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                <div
                                    key={hand}
                                    className={cn(
                                        styles.hand3DContainer(),
                                        selectedHand === hand && styles.hand3DContainerSelected()
                                    )}
                                    onClick={() => setSelectedHand(hand)}
                                >
                                    <Hand3D handType={hand} revealed={true} size="medium" />
                                </div>
                            ))}
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

                        {/* 手の表示（3D） */}
                        <div className={styles.vsContainer()}>
                            <div>
                                <div className={styles.handLabel()}>
                                    <span className={styles.handLabelText()}>HOST</span>
                                </div>
                                <div className="w-64">
                                    <Hand3D
                                        handType={jankenEvent.finalHostHand as HandType}
                                        revealed={true}
                                        size="large"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* スコア表示 */}
                        {currentScores.length > 0 && (
                            <div className={styles.scoresSection()}>
                                <h3 className="text-2xl font-bold mb-4 text-white">CURRENT SCORES</h3>
                                {currentScores.map((score, index) => (
                                    <div key={score.userId} className={styles.scoreItem()}>
                                        <span className={styles.scoreRank()}>#{index + 1}</span>
                                        <span className={styles.scoreName()}>{score.user.name}</span>
                                        <span className={styles.scorePoints()}>{score.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-center mt-8">
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                onClick={handleNextRound}
                                disabled={isProcessing}
                            >
                                NEXT ROUND
                            </button>
                        </div>
                    </div>
                )}

                {/* GAME_OVER: 最終結果表示 */}
                {phase === 'GAME_OVER' && (
                    <div className={styles.resultScreen()}>
                        <h1 className={styles.resultTitle()}>GAME OVER</h1>
                        <p className="text-2xl text-gray-300 mb-8">FINAL RESULTS</p>

                        {currentScores.length > 0 && (
                            <div className={styles.scoresSection()}>
                                {currentScores.map((score, index) => (
                                    <div
                                        key={score.userId}
                                        className={cn(
                                            styles.finalScoreItem(),
                                            index === 0 && styles.finalScoreWinner()
                                        )}
                                    >
                                        <span className={styles.finalScoreRank()}>#{index + 1}</span>
                                        <span className={styles.finalScoreName()}>{score.user.name}</span>
                                        <span className={styles.finalScorePoints()}>{score.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-center mt-12">
                            <button
                                className={cn(styles.button(), styles.buttonPrimary())}
                                onClick={handleClose}
                            >
                                RETURN TO LOBBY
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
