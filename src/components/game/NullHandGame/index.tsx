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
        error,
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
                <div className={styles.titleGrid()}>
                    {/* 左上: メニュー */}
                    <div className={styles.menuBox()}>
                        <div
                            className={isReady ? styles.menuItem() : styles.menuItemSelected()}
                            onClick={toggleReady}
                        >
                            {isReady ? '準備完了をキャンセル' : '準備完了'}
                        </div>

                        {isHost && (
                            <div
                                className={cn(
                                    styles.menuItem(),
                                    allUsersReady ? styles.menuItemSelected() : styles.menuItemNormal()
                                )}
                                onClick={() => allUsersReady && handleStartGame()}
                            >
                                ゲーム開始
                            </div>
                        )}

                        <div className={styles.menuItem()} onClick={handleClose}>
                            退出
                        </div>
                    </div>

                    {/* 右上: ビジュアル・ロゴ */}
                    <div className={styles.visualBox()}>
                        <div className="text-center">
                            <div className={styles.logo()}>NULL HAND</div>
                            <div className="w-64 h-64 mx-auto">
                                <Hand3D handType="ROCK" revealed={true} size="medium" isRotating={true} />
                            </div>
                        </div>
                    </div>

                    {/* 下部: インフォメーション */}
                    <div className={styles.infoBox()}>
                        <div className='w-full'>
                            <p className={styles.subtitle()}>I.Q FINAL MODE</p>

                            <div className={styles.playerListWrapper()}>
                                <div className="text-[#FF4444] font-bold mb-2">参加者</div>
                                {room.users.map((u: RoomUserWithReadyStatus) => (
                                    <div key={u.id} className={styles.playerItem()}>
                                        <span className={u.isReady ? 'text-[#44FFFF]' : 'text-gray-500'}>
                                            {u.user?.name || '不明'}
                                        </span>
                                        <span className={u.isReady ? 'text-[#FF4444]' : 'text-gray-700'}>
                                            {u.isReady ? '準備完了' : '待機中'}
                                        </span>
                                    </div>
                                ))}
                                <div className="mt-4 text-right text-gray-400">
                                    {readyCount} / {totalUsers} 準備完了
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
                    {phase === 'SETUP' && 'フェーズ: セットアップ - 決断'}
                    {phase === 'SHOWCASE' && 'フェーズ: ショーケース - 観察'}
                    {phase === 'FINAL_DECISION' && 'フェーズ: 最終決断 - 確定'}
                    {phase === 'BATTLE' && 'フェーズ: バトル - 衝突'}
                    {phase === 'RESULT' && 'フェーズ: リザルト - 評価'}
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

                                    <div className="border-t border-gray-700 my-4"></div>

                                    {/* 偽装選択 */}
                                    <h3 className="text-[#FF4444] font-bold mb-2 uppercase">偽装工作: {selectedFake === 'NONE' ? 'なし' :
                                        selectedFake === 'INITIAL_HAND' ? '手' :
                                            selectedFake === 'CHANGE_RATE' ? '確率' : '得意手'}</h3>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {([
                                            { value: 'NONE', label: '偽装なし' },
                                            { value: 'INITIAL_HAND', label: '手を偽装' },
                                            { value: 'CHANGE_RATE', label: '変える確率を偽装' },
                                            { value: 'FAVORITE_HAND', label: '得意手を偽装' },
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
                                        <div className={styles.inputGroup()}>
                                            {selectedFake === 'INITIAL_HAND' && (
                                                <select
                                                    className={styles.select()}
                                                    value={fakeDetails.fakeHandValue || ''}
                                                    onChange={(e) => setFakeDetails({ ...fakeDetails, fakeHandValue: e.target.value as HandType })}
                                                >
                                                    <option value="">偽装する手を選択...</option>
                                                    <option value="ROCK">ROCK</option>
                                                    <option value="SCISSORS">SCISSORS</option>
                                                    <option value="PAPER">PAPER</option>
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
                                                    <option value="">偽装する得意手を選択...</option>
                                                    <option value="ROCK">ROCK</option>
                                                    <option value="SCISSORS">SCISSORS</option>
                                                    <option value="PAPER">PAPER</option>
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
                                        <Hand3D handType={null} revealed={false} size="medium" isRotating={true} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 右サイドエリア（統計情報等） */}
                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">DATA ANALYSIS</div>

                            {/* ホスト用リアル統計 */}
                            {isCurrentHost && hostStats && (
                                <div>
                                    <div className="mb-6">
                                        <div className="text-[#FF4444] font-bold mb-2">極秘データ</div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>本当の得意手</span>
                                            <span className={styles.statValue()}>{hostStats.realFavoriteHand}</span>
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
                                            <span className={styles.statLabel()}>得意手</span>
                                            <span className={styles.statValue()}>{hostStats.favoriteHand}</span>
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
                                        handType={jankenEvent.initialHand as HandType}
                                        revealed={!!jankenEvent.initialHand}
                                        size="large"
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
                                        <span className={styles.statLabel()}>得意手</span>
                                        <span className={styles.statValue()}>
                                            {hostStats.favoriteHand === 'ROCK' && '✊ グー'}
                                            {hostStats.favoriteHand === 'SCISSORS' && '✌️ チョキ'}
                                            {hostStats.favoriteHand === 'PAPER' && '✋ パー'}
                                        </span>
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>CHANGE %</span>
                                        <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        * DATA MAY BE DECEPTIVE
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
                                <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">初期手 (公開済み)</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">
                                        {jankenEvent.initialHand === 'ROCK' && '✊'}
                                        {jankenEvent.initialHand === 'SCISSORS' && '✌️'}
                                        {jankenEvent.initialHand === 'PAPER' && '✋'}
                                    </span>
                                    <span className={styles.statValue()}>{jankenEvent.initialHand}</span>
                                </div>
                            </div>

                            {/* 嘘の情報 */}
                            <div className="mb-6">
                                <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">偽装工作</div>
                                <div className={styles.statRow()}>
                                    <span className={styles.statLabel()}>ターゲット</span>
                                    <span className={styles.statValue()}>
                                        {jankenEvent.fakeTarget === 'NONE' && 'なし'}
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && '手を偽装'}
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && '確率を偽装'}
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && '得意手を偽装'}
                                    </span>
                                </div>
                                {jankenEvent.fakeTarget !== 'NONE' && (
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>偽装値</span>
                                        <span className="text-white font-bold">
                                            {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue}
                                            {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                            {jankenEvent.fakeTarget === 'FAVORITE_HAND' && jankenEvent.fakeFavoriteHandValue}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* リアル統計 */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">極秘データ</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>本当の得意手</span>
                                        <span className={styles.statValue()}>{hostStats.realFavoriteHand}</span>
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
                                    <Hand3D handType={null} revealed={false} size="medium" isRotating={true} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">HOST INFO</div>

                            {/* ホストの初期手 */}
                            {jankenEvent && (
                                <div className="mb-6">
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">INITIAL HAND</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">
                                            {jankenEvent.initialHand === 'ROCK' && '✊'}
                                            {jankenEvent.initialHand === 'SCISSORS' && '✌️'}
                                            {jankenEvent.initialHand === 'PAPER' && '✋'}
                                        </span>
                                        <span className={styles.statValue()}>{jankenEvent.initialHand}</span>
                                    </div>
                                </div>
                            )}

                            {/* ホストの統計（公開用） */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">HOST TENDENCY</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>FAV HAND</span>
                                        <span className={styles.statValue()}>
                                            {hostStats.favoriteHand === 'ROCK' && '✊ ROCK'}
                                            {hostStats.favoriteHand === 'SCISSORS' && '✌️ SCISSORS'}
                                            {hostStats.favoriteHand === 'PAPER' && '✋ PAPER'}
                                        </span>
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>変える確率</span>
                                        <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        * DATA MAY BE DECEPTIVE
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
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">HOST INFO</div>

                            {/* ホストの初期手 */}
                            {jankenEvent && (
                                <div className="mb-6">
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">INITIAL HAND</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">
                                            {jankenEvent.initialHand === 'ROCK' && '✊'}
                                            {jankenEvent.initialHand === 'SCISSORS' && '✌️'}
                                            {jankenEvent.initialHand === 'PAPER' && '✋'}
                                        </span>
                                        <span className={styles.statValue()}>{jankenEvent.initialHand}</span>
                                    </div>
                                </div>
                            )}

                            {/* ホストの統計（公開用） */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">HOST TENDENCY</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>FAV HAND</span>
                                        <span className={styles.statValue()}>
                                            {hostStats.favoriteHand === 'ROCK' && '✊ ROCK'}
                                            {hostStats.favoriteHand === 'SCISSORS' && '✌️ SCISSORS'}
                                            {hostStats.favoriteHand === 'PAPER' && '✋ PAPER'}
                                        </span>
                                    </div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>変える確率</span>
                                        <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        * DATA MAY BE DECEPTIVE
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
                                            {jankenEvent.finalHostHand === 'ROCK' && '✊ グー'}
                                            {jankenEvent.finalHostHand === 'SCISSORS' && '✌️ チョキ'}
                                            {jankenEvent.finalHostHand === 'PAPER' && '✋ パー'}
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
                                        <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">初期手 (公開済み)</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">
                                                {jankenEvent.initialHand === 'ROCK' && '✊'}
                                                {jankenEvent.initialHand === 'SCISSORS' && '✌️'}
                                                {jankenEvent.initialHand === 'PAPER' && '✋'}
                                            </span>
                                            <span className={styles.statValue()}>{jankenEvent.initialHand}</span>
                                        </div>
                                    </div>

                                    {/* 嘘の情報 */}
                                    <div className="mb-6">
                                        <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">偽装工作</div>
                                        <div className={styles.statRow()}>
                                            <span className={styles.statLabel()}>ターゲット</span>
                                            <span className={styles.statValue()}>
                                                {jankenEvent.fakeTarget === 'NONE' && 'なし'}
                                                {jankenEvent.fakeTarget === 'INITIAL_HAND' && '手を偽装'}
                                                {jankenEvent.fakeTarget === 'CHANGE_RATE' && '確率を偽装'}
                                                {jankenEvent.fakeTarget === 'FAVORITE_HAND' && '得意手を偽装'}
                                            </span>
                                        </div>
                                        {jankenEvent.fakeTarget !== 'NONE' && (
                                            <div className={styles.statRow()}>
                                                <span className={styles.statLabel()}>偽装値</span>
                                                <span className="text-white font-bold">
                                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue}
                                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' && jankenEvent.fakeFavoriteHandValue}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* リアル統計 */}
                            {hostStats && (
                                <div>
                                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">極秘データ</div>
                                    <div className={styles.statRow()}>
                                        <span className={styles.statLabel()}>本当の得意手</span>
                                        <span className={styles.statValue()}>{hostStats.realFavoriteHand}</span>
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
                                            size="large"
                                        />
                                    </div>
                                    <div className="text-center text-xl font-bold mt-2">
                                        {jankenEvent.finalHostHand}
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
                            <h1 className="text-5xl font-bold text-[#FF4444] mb-8 tracking-[0.2em] text-center border-b-4 border-[#FF4444] pb-4">GAME OVER</h1>

                            <div className="text-center mt-12">
                                <button
                                    className={cn(styles.button(), styles.buttonPrimary())}
                                    onClick={handleClose}
                                >
                                    ロビーに戻る
                                </button>
                            </div>
                        </div>

                        <div className={styles.sideArea()}>
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">最終順位</div>
                            {currentScores.length > 0 && (
                                <div className="space-y-4">
                                    {currentScores.map((score, index) => (
                                        <div
                                            key={score.userId}
                                            className={cn(
                                                "flex justify-between items-center p-4 border-l-4",
                                                index === 0 ? "bg-[#FF4444]/20 border-[#FF4444]" : "bg-gray-900 border-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={cn(styles.rankBadge(), index === 0 ? "bg-[#FF4444] text-black" : "")}>#{index + 1}</span>
                                                <span className="text-white font-mono text-lg">{score.user.name}</span>
                                            </div>
                                            <span className="text-[#44FFFF] font-bold font-mono text-2xl">{score.points} 点</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
