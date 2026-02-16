'use client'

import { useNullHand } from '@/hooks/useNullHand'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom } from '@/server/actions/room'
import { nullHandGame } from './styles'
import { Hand3D } from './Hand3D'
import { RoomWithUsersAndReadyStatus, HandType, FakeTarget, RoomUserWithReadyStatus, FakeDetails, UserRanking } from '@/shared/types'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// ヘルパー関数: HandTypeを絵文字付きカタカナ表記に変換
const getHandDisplayWithEmoji = (hand: HandType): string => {
    switch (hand) {
        case 'ROCK': return '✊ グー'
        case 'SCISSORS': return '✌️ チョキ'
        case 'PAPER': return '✋ パー'
        default: return hand
    }
}

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

    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length
    const allUsersReady = room.users.every((u: RoomUserWithReadyStatus) => u.isReady)

    // ============================================
    // TITLE フェーズ
    // ============================================
    if (phase === 'TITLE') {
        return (
            <div className={styles.container()}>
                <div className={styles.titleGrid()}>
                    {/* 左上: メニュー */}
                    <div className={styles.menuBox()}>
                        <div
                            className={cn(
                                styles.menuItem(),
                                isReady && styles.menuItemReady()
                            )}
                            onClick={toggleReady}
                        >
                            READY
                        </div>

                        {isHost && (
                            <div
                                className={cn(
                                    styles.menuItem(),
                                    allUsersReady ? styles.menuItemSelected() : styles.menuItemDisabled()
                                )}
                                onClick={() => allUsersReady && handleStartGame()}
                            >
                                START
                            </div>
                        )}

                        <div className={styles.menuItem()} onClick={handleClose}>
                            EXIT
                        </div>
                    </div>

                    {/* 右上: ビジュアル・ロゴ */}
                    <div className={styles.visualBox()}>
                        <div className="text-center">
                            <div className={styles.logo()}>NULL HAND</div>
                            <div className="w-64 h-64 mx-auto">
                                <Hand3D handType={titleHand} revealed={true} size="medium" isRotating={true} />
                            </div>
                        </div>
                    </div>

                    {/* 下部: インフォメーション */}
                    <div className={styles.infoBox()}>
                        <div className='w-full'>
                            <p className={styles.subtitle()}>NULL HAND PLAY MEMBERS</p>

                            <div className={styles.playerListWrapper()}>
                                {[...room.users].sort((a, b) => {
                                    const rankA = initialRankings.find(r => r.userId === a.userId)?.rank ?? Infinity
                                    const rankB = initialRankings.find(r => r.userId === b.userId)?.rank ?? Infinity
                                    return rankA - rankB
                                }).map((u: RoomUserWithReadyStatus) => {
                                    const ranking = initialRankings.find(r => r.userId === u.userId)
                                    // ランキングが見つからない場合は未プレイ扱い
                                    const rankDisplay = ranking ? `世界順位:${ranking.rank}位 ${Math.floor(ranking.points)}pt` : '世界ランキング: 最下位 0pt'

                                    return (
                                        <div key={u.id} className={styles.playerItem()}>
                                            <div className="flex items-center">
                                                <span className={styles.rankingText()}>
                                                    {rankDisplay}
                                                </span>
                                                <span className={u.isReady ? 'text-[#44FFFF]' : 'text-gray-500'}>
                                                    {u.user?.name || '不明'}
                                                </span>
                                            </div>
                                            <span className={u.isReady ? 'text-[#FF4444]' : 'text-gray-700'}>
                                                {u.isReady ? 'READY' : 'WAITING'}
                                            </span>
                                        </div>
                                    )
                                })}
                                <div className="mt-4 text-right text-gray-400">
                                    {readyCount} / {totalUsers} READY
                                </div>
                            </div>
                        </div>
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
            {/* エラー表示 */}
            {error && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-8 py-4 border-[3px] border-[#FF4444] font-bold tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center gap-4">
                    <span className="text-2xl">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className={styles.gameGrid()}>
                {/* フェーズ表示 */}
                <div className={styles.phaseBox()}>
                    {phase === 'SETUP' && 'ホストの手を設定（未確定）'}
                    {phase === 'SHOWCASE' && 'ホストの手を公開（未確定）'}
                    {phase === 'FINAL_DECISION' && 'ホストの手を設定（確定）'}
                    {phase === 'BATTLE' && 'ゲストの手を設定（確定）'}
                    {phase === 'RESULT' && '結果発表'}
                    {phase === 'GAME_OVER' && '最終結果'}
                </div>

                {/* メインエリア（左/中央） */}
                {phase === 'SETUP' && (
                    <>
                        <div className={styles.mainArea()}>
                            {/* SETUP: ホストのみ */}
                            {isCurrentHost && (
                                <div className="w-full h-full flex flex-col">
                                    <h2 className={styles.messageText()}>あなたの手を選択</h2>

                                    {/* 手選択（3D） */}
                                    <div className={styles.handGrid()}>
                                        {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                            <div
                                                key={hand}
                                                className={cn(
                                                    styles.hand3DWrapper(),
                                                    selectedHand === hand && styles.hand3DWrapperSelected()
                                                )}
                                                onClick={() => setSelectedHand(hand)}
                                            >
                                                <Hand3D handType={hand} revealed={true} size="medium" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-700 my-2"></div>

                                    {/* 偽装選択 */}
                                    <h3 className="text-[#FF4444] font-bold mb-1 uppercase text-lg">偽装工作: {selectedFake === 'NONE' ? 'なし' :
                                        selectedFake === 'INITIAL_HAND' ? '手' :
                                            selectedFake === 'CHANGE_RATE' ? '確率' : 'よく出す手'}</h3>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        {([
                                            { value: 'NONE', label: '偽装なし' },
                                            { value: 'INITIAL_HAND', label: '手を偽装' },
                                            { value: 'CHANGE_RATE', label: '変える確率を偽装' },
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
                                    {selectedFake !== 'NONE' && (
                                        <div className='mt-2'>
                                            {selectedFake === 'INITIAL_HAND' && (
                                                <select
                                                    className={styles.select()}
                                                    value={fakeDetails.fakeHandValue || ''}
                                                    onChange={(e) => setFakeDetails({ ...fakeDetails, fakeHandValue: e.target.value as HandType })}
                                                >
                                                    <option value="">偽装する手を選択...</option>
                                                    <option value="ROCK">✊ グー</option>
                                                    <option value="SCISSORS">✌️ チョキ</option>
                                                    <option value="PAPER">✋ パー</option>
                                                </select>
                                            )}
                                            {selectedFake === 'CHANGE_RATE' && (
                                                <input
                                                    type="number"
                                                    className={styles.numberInput()}
                                                    value={fakeDetails.fakeChangeRateValue ?? ''}
                                                    onChange={(e) => setFakeDetails({ ...fakeDetails, fakeChangeRateValue: parseInt(e.target.value) || 0 })}
                                                    placeholder="偽装する確率 (0-100)"
                                                />
                                            )}
                                            {selectedFake === 'FAVORITE_HAND' && (
                                                <select
                                                    className={styles.select()}
                                                    value={fakeDetails.fakeFavoriteHandValue || ''}
                                                    onChange={(e) => setFakeDetails({ ...fakeDetails, fakeFavoriteHandValue: e.target.value as HandType })}
                                                >
                                                    <option value="">偽装するよく出す手を選択...</option>
                                                    <option value="ROCK">✊ グー</option>
                                                    <option value="SCISSORS">✌️ チョキ</option>
                                                    <option value="PAPER">✋ パー</option>
                                                </select>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 flex justify-end">
                                        <button
                                            className={styles.button()}
                                            disabled={!selectedHand || isProcessing}
                                            onClick={() => selectedHand && handleSetInitialHand(selectedHand, selectedFake, fakeDetails)}
                                        >
                                            選択を確定
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* SETUP: ゲスト待機（統計表示） */}
                            {!isCurrentHost && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className={styles.messageText()}>ホストの選択を待っています...</div>
                                    <div className="w-48 h-48 mt-8">
                                        <Hand3D handType={titleHand} revealed={true} size="medium" isRotating={true} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 右サイドエリア（統計情報等） */}
                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-lg mb-2 border-b-2 border-[#44FFFF] pb-1">あなたのデータ</div>

                            {/* ホスト用リアル統計 */}
                            {isCurrentHost && hostStats && (
                                <div>
                                    <div className="mb-4">
                                        <div className="text-[#FF4444] font-bold mb-2">あなたの情報</div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>本当のよく出す手</span>
                                            <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                                        </div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>本当の変える確率</span>
                                            <span className={styles.statValue()}>{hostStats.realChangeRate}%</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-gray-400 font-bold mb-2">公開データ (プレビュー)</div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>試合数</span>
                                            <span className={styles.statValue()}>{hostStats.totalGames}</span>
                                        </div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>よく出す手</span>
                                            <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.favoriteHand as HandType)}</span>
                                        </div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>変える確率</span>
                                            <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ゲスト用（今は待機中表示） */}
                            {!isCurrentHost && (
                                <div className="text-gray-500 italic">
                                    WAITING FOR HOST...
                                </div>
                            )}
                        </div>
                    </>
                )}
                {/* SHOWCASE: 全員 */}
                {/* 
                 * 左 (mainArea): ホストの初回選択（仮置き）
                 * 右 (sideArea): ホストの統計（嘘が含まれる可能性あり）
                 */}
                {phase === 'SHOWCASE' && jankenEvent && (
                    <>
                        <div className={styles.mainArea()}>
                            <h2 className={styles.messageText()}>ホストの手を観察</h2>
                            <div className={styles.handDisplay()}>
                                <div className="w-64 mx-auto">
                                    <Hand3D
                                        handType={
                                            (jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue
                                                ? jankenEvent.fakeHandValue
                                                : jankenEvent.initialHand) as HandType
                                        }
                                        revealed={!!jankenEvent.initialHand}
                                        size="medium"
                                    />
                                </div>
                            </div>

                            {!isCurrentHost && (
                                <div className="text-center mt-8">
                                    <button
                                        className={cn(styles.button(), styles.buttonPrimary())}
                                        disabled={isProcessing}
                                        onClick={handleConfirmShowcase}
                                    >
                                        確認して次へ
                                    </button>
                                </div>
                            )}

                            {isCurrentHost && (
                                <p className={styles.messageText()}>ゲストの確認を待っています...</p>
                            )}
                        </div>

                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">ホストデータ (公開)</div>
                            {hostStats && (
                                <div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>よく出す手</span>

                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && jankenEvent.fakeHandValue
                                            ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                                            : getHandDisplayWithEmoji(hostStats.favoriteHand as HandType)}
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>手を変える可能性</span>
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && jankenEvent.fakeChangeRateValue
                                            ? jankenEvent.fakeChangeRateValue
                                            : hostStats.changeRate}%
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        * 全てのデータはホストの過去の動向を正確に表していますが、嘘の情報が紛れています。（初回の手、一番選ぶ可能性が高い手、変える確率、のどれか一つは嘘の可能性が高いです）
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* FINAL_DECISION: ホストのみ */}
                {/* 
                 * 左 (mainArea): ホストの最終決定
                 * 右 (sideArea): 補足情報
                 */}
                {phase === 'FINAL_DECISION' && isCurrentHost && jankenEvent && (
                    <>
                        <div className={styles.mainArea()}>
                            <h2 className={styles.messageText()}>最終決断: 変えるか、そのままか？</h2>
                            <div className={styles.handGrid()}>
                                {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                    <div
                                        key={hand}
                                        className={cn(
                                            styles.hand3DWrapper(),
                                            selectedHand === hand && styles.hand3DWrapperSelected()
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
                                    最終手を決定
                                </button>
                            </div>
                        </div>
                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">あなたの状況</div>

                            {/* 初期手 */}
                            <div className="mb-6">
                                <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">最初に公開した 🖐️</div>
                                <div className="flex items-center gap-2">
                                    <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</span>
                                </div>
                            </div>

                            {/* 嘘の情報 */}
                            <div className="mb-6">
                                <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">偽装工作（公開済み） 🤫</div>
                                <div className={styles.statRow()}>
                                    <span className={styles.statLabel()}>偽造した情報</span>
                                    <span className={styles.statValue()}>
                                        {jankenEvent.fakeTarget === 'NONE' && 'なし'}
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && '手を偽装'}
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && '手を変える確率'}
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && 'よく出す手を偽装'}
                                    </span>
                                </div>
                                {jankenEvent.fakeTarget !== 'NONE' && (
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>偽造した値</span>
                                        <span className="text-white font-bold">
                                            {jankenEvent.fakeTarget === 'INITIAL_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}
                                            {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                            {jankenEvent.fakeTarget === 'FAVORITE_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* リアル統計 */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">あなたの情報</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>本当のよく出す手</span>
                                        <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>本当の変える確率</span>
                                        <span className={styles.statValue()}>{hostStats.realChangeRate}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* FINAL_DECISION: ゲスト待機 */}
                {phase === 'FINAL_DECISION' && !isCurrentHost && (
                    <>
                        <div className={styles.mainArea()}>
                            <div className={styles.messageText()}>
                                <p>ホストが最終決断を下しています...</p>
                                <div className="w-48 h-48 mx-auto mt-8">
                                    {jankenEvent && <>
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue ?
                                            <Hand3D handType={jankenEvent.fakeHandValue as HandType} revealed={true} size="medium" isRotating={true} />
                                            :
                                            <Hand3D handType={jankenEvent.initialHand as HandType} revealed={true} size="medium" isRotating={true} />
                                        }
                                    </>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">ホストの情報</div>

                            {/* ホストの初期手 */}
                            {jankenEvent &&
                                (
                                    <div className="mb-6">
                                        <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">初回の手</div>

                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue ?
                                            <div className="flex items-center gap-2">
                                                <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}</span>
                                            </div>
                                            :
                                            <div className="flex items-center gap-2">
                                                <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</span>
                                            </div>
                                        }
                                    </div>
                                )
                            }

                            {/* ホストの統計（公開用） */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">ホストの情報</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>一番選ぶ可能性が高い手</span>

                                        <span className={styles.statValue()}>
                                            {getHandDisplayWithEmoji(hostStats.favoriteHand)}
                                        </span>
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>変える確率</span>
                                        <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        * 全てのデータはホストの過去の動向を正確に表していますが、嘘の情報が紛れています。（初回の手、一番選ぶ可能性が高い手、変える確率、のどれか一つは嘘の可能性が高いです）
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* BATTLE: ゲストの手入力 */}
                {/* 
                 * 左 (mainArea): ゲストの手選択
                 * 右 (sideArea): メッセージ
                 */}
                {phase === 'BATTLE' && !isCurrentHost && (
                    <>
                        <div className={styles.mainArea()}>
                            <h2 className={styles.messageText()}>勝つための手を選択せよ！</h2>
                            <div className={styles.handGrid()}>
                                {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                    <div
                                        key={hand}
                                        className={cn(
                                            styles.hand3DWrapper(),
                                            selectedHand === hand && styles.hand3DWrapperSelected()
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
                                    勝負！
                                </button>
                            </div>
                        </div>
                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">ホストの情報</div>

                            {/* ホストの初期手 */}
                            {jankenEvent && (
                                <div className="mb-6">
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">初回の手</div>

                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue ? (
                                        <div className="flex items-center gap-2">
                                            <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ホストの統計（公開用） */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">ホストの情報</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>一番選ぶ可能性が高い手</span>
                                        <span className={styles.statValue()}>
                                            {getHandDisplayWithEmoji(
                                                (jankenEvent?.fakeTarget === 'FAVORITE_HAND' && jankenEvent?.fakeFavoriteHandValue
                                                    ? jankenEvent.fakeFavoriteHandValue
                                                    : hostStats.favoriteHand) as HandType
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>変える確率</span>
                                        <span className={styles.statValue()}>
                                            {jankenEvent?.fakeTarget === 'CHANGE_RATE' && jankenEvent?.fakeChangeRateValue !== null && jankenEvent?.fakeChangeRateValue !== undefined
                                                ? jankenEvent.fakeChangeRateValue
                                                : hostStats.changeRate}%
                                        </span>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        * 全てのデータはホストの過去の動向を正確に表していますが、嘘の情報が紛れています。（初回の手、一番選ぶ可能性が高い手、変える確率、のどれか一つは嘘の可能性が高いです）
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* BATTLE: ホスト待機 */}
                {phase === 'BATTLE' && isCurrentHost && (
                    <>
                        <div className={styles.mainArea()}>
                            <div className={styles.messageText()}>
                                <p>ゲストが選択中です...</p>
                                {jankenEvent?.finalHostHand ? (
                                    <div className="mt-8">
                                        <div className="text-[#44FFFF] font-bold mb-6 text-xl tracking-widest border-b-2 border-[#44FFFF] pb-2 inline-block">あなたの最終決断</div>
                                        <div className="w-48 h-48 mx-auto">
                                            <Hand3D
                                                handType={jankenEvent.finalHostHand as HandType}
                                                revealed={true}
                                                size="medium"
                                            />
                                        </div>
                                        <div className="text-3xl font-bold mt-6 text-white tracking-widest">
                                            {getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 mx-auto mt-8">
                                        <Hand3D handType={null} revealed={false} size="medium" isRotating={true} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">あなたの状況</div>

                            {jankenEvent && (
                                <>
                                    {/* 初期手 */}
                                    <div className="mb-6">
                                        <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">最初に公開した 🖐️</div>
                                        <div className="flex items-center gap-2">
                                            <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</span>
                                        </div>
                                    </div>

                                    {/* 嘘の情報 */}
                                    <div className="mb-6">
                                        <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">偽装工作（未公開 🤫</div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>偽造した情報</span>
                                            <span className={styles.statValue()}>
                                                {jankenEvent.fakeTarget === 'NONE' && 'なし'}
                                                {jankenEvent.fakeTarget === 'INITIAL_HAND' && '手を偽装'}
                                                {jankenEvent.fakeTarget === 'CHANGE_RATE' && '手を変える確率'}
                                                {jankenEvent.fakeTarget === 'FAVORITE_HAND' && 'よく出す手を偽装'}
                                            </span>
                                        </div>
                                        {jankenEvent.fakeTarget !== 'NONE' && (
                                            <div className={styles.statRow()}>
                                                <span className={styles.statLabel()}>偽造した値</span>
                                                <span className="text-white font-bold">
                                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}
                                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* リアル統計 */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">あなたの情報</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>本当のよく出す手</span>
                                        <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>本当の変える確率</span>
                                        <span className={styles.statValue()}>{hostStats.realChangeRate}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* RESULT: 結果表示 */}
                {/* 
                 * 左 (mainArea): ホストの最終手公開
                 * 右 (sideArea): ランキング・スコア
                 */}
                {phase === 'RESULT' && jankenEvent && (
                    <>
                        <div className={styles.mainArea()}>
                            <h2 className={styles.messageText()}>ホストの最終手</h2>
                            <div className={styles.vsContainer()}>
                                <div>
                                    <div className="text-[#FF4444] font-bold text-center mb-2 tracking-widest">ホスト</div>
                                    <div className="w-64 mx-auto">
                                        <Hand3D
                                            handType={jankenEvent.finalHostHand as HandType}
                                            revealed={true}
                                            size="medium"
                                        />
                                    </div>
                                    <div className="text-center text-xl font-bold mt-2">
                                        {getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mt-8">
                                <button
                                    className={cn(styles.button(), styles.buttonPrimary())}
                                    onClick={handleNextRound}
                                    disabled={isProcessing}
                                >
                                    次のラウンドへ
                                </button>
                            </div>
                        </div>

                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">ラウンド結果</div>
                            <div className="space-y-4">
                                {/* ホスト（自分/相手）の結果 */}
                                {(() => {
                                    const hostScore = currentScores.find(s => s.userId === jankenEvent.currentHostId)
                                    // ホストが勝利（誰も勝たなかった）したか判定
                                    const guestWins = jankenEvent.guestHands.some(gh => {
                                        const h = jankenEvent.finalHostHand as HandType
                                        const g = gh.hand as HandType
                                        if (h === g) return false // Draw
                                        if (h === 'ROCK' && g === 'PAPER') return true
                                        if (h === 'SCISSORS' && g === 'ROCK') return true
                                        if (h === 'PAPER' && g === 'SCISSORS') return true
                                        return false
                                    })
                                    const hostGained = !guestWins ? 3 : 0

                                    return (
                                        <div className="flex justify-between items-center bg-[#FF4444]/20 border border-[#FF4444] p-3">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-[#FF4444] text-black font-bold px-2 py-0.5 text-xs">ホスト</span>
                                                <span className="text-white font-bold">{hostScore?.user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">
                                                    {jankenEvent.finalHostHand === 'ROCK' && '✊'}
                                                    {jankenEvent.finalHostHand === 'SCISSORS' && '✌️'}
                                                    {jankenEvent.finalHostHand === 'PAPER' && '✋'}
                                                </span>
                                                <div className="text-right">
                                                    <div className="text-[#FF4444] font-bold">+{hostGained} 点</div>
                                                    <div className="text-xs text-gray-400">合計: {hostScore?.points}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* ゲスト一覧 */}
                                {jankenEvent.guestHands.map(gh => {
                                    const score = currentScores.find(s => s.userId === gh.userId)
                                    // 勝敗判定
                                    let result = 'LOSE'
                                    let gained = 0
                                    const h = jankenEvent.finalHostHand as HandType
                                    const g = gh.hand as HandType

                                    if (h === g) {
                                        result = 'DRAW'
                                    } else if (
                                        (h === 'ROCK' && g === 'PAPER') ||
                                        (h === 'SCISSORS' && g === 'ROCK') ||
                                        (h === 'PAPER' && g === 'SCISSORS')
                                    ) {
                                        result = 'WIN'
                                        gained = 1
                                    }

                                    return (
                                        <div key={gh.userId} className="flex justify-between items-center bg-gray-900 border border-gray-700 p-3">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-gray-700 text-white font-bold px-2 py-0.5 text-xs">ゲスト</span>
                                                <span className="text-white font-bold">{gh.user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">
                                                    {gh.hand === 'ROCK' && '✊'}
                                                    {gh.hand === 'SCISSORS' && '✌️'}
                                                    {gh.hand === 'PAPER' && '✋'}
                                                </span>
                                                <div className="text-right">
                                                    <div className={cn("font-bold", result === 'WIN' ? "text-[#44FFFF]" : "text-gray-500")}>
                                                        +{gained} 点
                                                    </div>
                                                    <div className="text-xs text-gray-400">合計: {score?.points}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* GAME_OVER: 最終結果表示 */}
                {phase === 'GAME_OVER' && (
                    <>
                        <div className={styles.mainArea()}>
                            {/* <h1 className="text-5xl font-bold text-[#FF4444] mb-8 tracking-[0.2em] text-center border-b-4 border-[#FF4444] pb-4">GAME OVER</h1> */}

                            <div className="text-center mt-12">
                                {(() => {
                                    const currentUserScore = currentScores.find(s => s.userId === currentUserId)
                                    if (!currentUserScore) return null

                                    const oldRanking = initialRankings.find(r => r.userId === currentUserId)
                                    const oldRank = oldRanking?.rank
                                    const oldPoints = oldRanking?.points

                                    const newRanking = newRankings.find(r => r.userId === currentUserId)
                                    // newRankingsがまだ空の場合はoldRankを表示あるいはLoading...？
                                    // ここではnewRankingsがあればそれを、なければoldRankを表示
                                    const newRank = newRanking?.rank ?? oldRank
                                    const newPoints = newRanking?.points ?? oldPoints

                                    if (!oldRank) return null

                                    return (
                                        <div className="mb-12">
                                            <div className="text-[#44FFFF] text-xl font-bold mb-2 tracking-widest">世界順位</div>
                                            <div className="flex items-center justify-center gap-8 text-4xl font-mono font-bold">
                                                <span className="text-gray-500">{oldRank}位</span>
                                                <span className="text-white">→</span>
                                                <span className="text-[#FF4444] text-5xl">{newRank}位</span>
                                            </div>
                                            {oldPoints !== undefined && newPoints !== undefined && (
                                                <div className="mt-4 flex items-center justify-center gap-4 text-xl font-mono">
                                                    <div className="text-gray-400">合計ポイント:</div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-gray-500">{Math.floor(oldPoints)}pt</span>
                                                        <span className="text-white">→</span>
                                                        <span className="text-[#44FFFF] font-bold text-2xl">{Math.floor(newPoints)}pt</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}

                                <button
                                    className={cn(styles.button(), styles.buttonPrimary())}
                                    onClick={handleFinish}
                                >
                                    タイトルに戻る
                                </button>
                            </div>
                        </div>

                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">最終順位</div>
                            {currentScores.length > 0 && (
                                <div className="space-y-4">
                                    {(() => {
                                        // ポイント順にソート（念のため）
                                        const sortedScores = [...currentScores].sort((a, b) => b.points - a.points)

                                        return sortedScores.map((score, index) => {
                                            let rank = index + 1
                                            if (index > 0 && score.points === sortedScores[index - 1].points) {
                                                let prevIndex = index - 1
                                                while (prevIndex >= 0 && sortedScores[prevIndex].points === score.points) {
                                                    rank = prevIndex + 1
                                                    prevIndex--
                                                }
                                            }

                                            return (
                                                <div
                                                    key={score.userId}
                                                    className={cn(
                                                        "flex justify-between items-center p-4 border-l-4",
                                                        rank === 1 ? "bg-[#FF4444]/20 border-[#FF4444]" : "bg-gray-900 border-gray-700"
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn(styles.rankBadge(), rank === 1 ? "bg-[#FF4444] text-black" : "")}>{rank}位</span>
                                                            <span className="text-white font-mono text-lg">{score.user.name}</span>
                                                        </div>

                                                    </div>
                                                    <span className="text-[#44FFFF] font-bold font-mono text-2xl">{score.points}点</span>
                                                </div>
                                            )
                                        })
                                    })()}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
