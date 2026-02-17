import { HandType, FakeTarget, FakeDetails, HostStats, JankenPhase } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'
import React from 'react'

interface SetupPhaseProps {
    isCurrentHost: boolean
    titleHand: HandType
    hostStats: HostStats | null
    selectedHand: HandType | null
    selectedFake: FakeTarget
    fakeDetails: FakeDetails
    isProcessing: boolean
    onSelectHand: (hand: HandType) => void
    onSelectFake: (fake: FakeTarget) => void
    onUpdateFakeDetails: (details: FakeDetails) => void
    onSubmit: () => void
    hostName: string
    onReselectHand: () => void
}

export function SetupPhase({
    isCurrentHost,
    titleHand,
    hostStats,
    selectedHand,
    selectedFake,
    fakeDetails,
    isProcessing,
    onSelectHand,
    onSelectFake,
    onUpdateFakeDetails,
    onSubmit,
    hostName,
    onReselectHand
}: SetupPhaseProps) {
    const styles = nullHandGame()

    const [showHelp, setShowHelp] = React.useState(false)

    const handleFakeOptionClick = (value: FakeTarget) => {
        if (selectedFake === value) {
            onSelectFake('NONE')
        } else {
            onSelectFake(value)
            // CHANGE_RATEが選択された場合、初期値をhostStats.realChangeRateに設定（未設定の場合）
            if (value === 'CHANGE_RATE' && fakeDetails.fakeChangeRateValue === undefined && hostStats) {
                onUpdateFakeDetails({
                    ...fakeDetails,
                    fakeChangeRateValue: hostStats.realChangeRate
                })
            }
        }
    }

    const MainArea = () => {
        if (!isCurrentHost) {
            return (
                <div className={styles.mainArea()}>
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className={styles.messageText()}>{hostName}の選択を待っています...</div>
                        <div className="w-48 h-48 mt-8">
                            <Hand3D handType={titleHand} revealed={true} size="medium" isRotating={true} />
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className={styles.mainArea()}>
                <div className="w-full h-full flex flex-col relative">
                    {/* ヘルプボタン（右下に配置） */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="absolute bottom-0 left-0 w-10 h-10 rounded-full border border-[#44FFFF] text-[#44FFFF] font-bold flex items-center justify-center hover:bg-[#44FFFF]/20 transition-colors z-20 bg-black"
                    >
                        ?
                    </button>

                    {/* ヘルプモーダル */}
                    {showHelp && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowHelp(false)}>
                            <div className="bg-black border-[2px] border-[#44FFFF] p-6 max-w-md w-full shadow-[0_0_30px_rgba(68,255,255,0.2)]" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-black text-[#44FFFF] mb-4 border-b border-[#44FFFF] pb-2 uppercase tracking-widest">
                                    HOW TO PLAY
                                </h3>
                                <div className="space-y-3 text-gray-200 text-sm leading-relaxed">
                                    <p>
                                        <span className="text-[#FF4444] font-bold">1. 本当の『手』を選択</span><br />
                                        まずはあなたが本当に出す手を選んでください。
                                    </p>
                                    <p>
                                        <span className="text-[#44FFFF] font-bold">2. 偽装工作 (必須)</span><br />
                                        ゲストに表示される「事前予告」情報を偽装してください。<br />
                                        <span className="text-xs text-gray-400">※このゲームでは嘘をつくことが重要です。</span>
                                    </p>
                                    <p>
                                        <span className="text-white border-b border-gray-500">統計情報の活用</span><br />
                                        右側に表示されている「あなたのデータ」は全員に公開されています。裏をかくか、正直にいくか... 駆け引きを楽しんでください！
                                    </p>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        className="px-6 py-1.5 bg-[#44FFFF] text-black font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors"
                                        onClick={() => setShowHelp(false)}
                                    >
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedHand ? (
                        /* STEP 1: 手の選択 */
                        <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
                            <h2 className={styles.messageText()}>あなたの手を選択</h2>
                            <div className="flex-1 flex items-center justify-center">
                                <div className={styles.handGrid()}>
                                    {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                        <div
                                            key={hand}
                                            className={cn(
                                                styles.hand3DWrapper(),
                                                "h-64", // 少し大きく
                                                selectedHand === hand && styles.hand3DWrapperSelected()
                                            )}
                                            onClick={() => onSelectHand(hand)}
                                        >
                                            <Hand3D handType={hand} revealed={true} size="medium" />
                                            <div className="absolute bottom-2 w-full text-center font-bold text-xl tracking-widest text-[#44FFFF]">
                                                {getHandDisplayWithEmoji(hand)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: 偽装の選択 */
                        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <h2 className={styles.messageText()}>どの情報を偽装する？</h2>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {([
                                        { value: 'INITIAL_HAND', label: '選択した手', icon: '🖐️' },
                                        { value: 'CHANGE_RATE', label: '手を変える確率', icon: '📊' },
                                        { value: 'FAVORITE_HAND', label: '選ぶ確率の高い手', icon: '🎲' },
                                    ] as const).map((option) => (
                                        <button
                                            key={option.value}
                                            className={cn(
                                                "relative group overflow-hidden p-6 transition-all duration-300",
                                                "border-2 bg-black/50 backdrop-blur-sm",
                                                selectedFake === option.value
                                                    ? "border-[#44FFFF] shadow-[0_0_20px_rgba(68,255,255,0.3)] text-[#44FFFF]"
                                                    : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                                            )}
                                            onClick={() => handleFakeOptionClick(option.value)}
                                        >
                                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                                            <div className="font-bold tracking-widest text-lg">{option.label}</div>

                                            {selectedFake === option.value && (
                                                <div className="absolute inset-0 bg-[#44FFFF]/5 pointer-events-none" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* 偽装詳細入力エリア */}
                                <div className="h-48 flex items-center justify-center bg-black/30 border border-gray-800 p-8 rounded-lg relative overflow-hidden">
                                    {/* 背景装飾 */}
                                    {selectedFake === 'NONE' && (
                                        <div className="text-gray-600 font-bold text-xl tracking-widest text-center">
                                            偽装する項目を選択してください
                                        </div>
                                    )}

                                    {selectedFake !== 'NONE' && (
                                        <div className='w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-10'>
                                            {selectedFake === 'INITIAL_HAND' && (
                                                <div className="text-center space-y-4">
                                                    <div className="text-[#44FFFF] font-bold mb-4 uppercase tracking-widest">偽装として表示する手を選択</div>
                                                    <div className="flex justify-center gap-4">
                                                        {(['ROCK', 'SCISSORS', 'PAPER'] as const)
                                                            .filter(h => h !== selectedHand)
                                                            .map(hand => (
                                                                <button
                                                                    key={hand}
                                                                    onClick={() => onUpdateFakeDetails({ ...fakeDetails, fakeHandValue: hand })}
                                                                    className={cn(
                                                                        "w-24 h-24 border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200",
                                                                        fakeDetails.fakeHandValue === hand
                                                                            ? "border-[#FF4444] bg-[#FF4444]/10 text-white shadow-[0_0_15px_rgba(255,68,68,0.3)]"
                                                                            : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                                                                    )}
                                                                >
                                                                    <span className="text-3xl">{hand === 'ROCK' ? '✊' : hand === 'SCISSORS' ? '✌️' : '✋'}</span>
                                                                    <span className="text-xs font-bold">{hand}</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedFake === 'CHANGE_RATE' && (
                                                <div className="w-full space-y-6">
                                                    <div className="text-[#44FFFF] font-bold text-center uppercase tracking-widest">
                                                        偽装する確率: <span className="text-3xl ml-2">{fakeDetails.fakeChangeRateValue ?? 50}%</span>
                                                    </div>
                                                    <div className="relative w-full h-12 flex items-center">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step="1"
                                                            value={fakeDetails.fakeChangeRateValue ?? 50}
                                                            onChange={(e) => onUpdateFakeDetails({ ...fakeDetails, fakeChangeRateValue: parseInt(e.target.value) })}
                                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#44FFFF] hover:accent-[#88FFFF] transition-all"
                                                        />
                                                        {/* 目盛り */}
                                                        <div className="absolute top-8 left-0 text-xs text-gray-500">0%</div>
                                                        <div className="absolute top-8 right-0 text-xs text-gray-500">100%</div>
                                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xs text-gray-500">50%</div>
                                                    </div>
                                                    <div className="text-center text-xs text-gray-400">
                                                        ※ この確率はゲストに「あなたが最終的に手を変える確率」として表示されます
                                                    </div>
                                                </div>
                                            )}

                                            {selectedFake === 'FAVORITE_HAND' && (
                                                <div className="text-center space-y-4">
                                                    <div className="text-[#44FFFF] font-bold mb-4 uppercase tracking-widest">偽装として表示する「よく出す手」</div>
                                                    <div className="flex justify-center gap-4">
                                                        {(['ROCK', 'SCISSORS', 'PAPER'] as const)
                                                            .filter(h => h !== hostStats?.realFavoriteHand)
                                                            .map(hand => (
                                                                <button
                                                                    key={hand}
                                                                    onClick={() => onUpdateFakeDetails({ ...fakeDetails, fakeFavoriteHandValue: hand })}
                                                                    className={cn(
                                                                        "w-24 h-24 border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200",
                                                                        fakeDetails.fakeFavoriteHandValue === hand
                                                                            ? "border-[#FF4444] bg-[#FF4444]/10 text-white shadow-[0_0_15px_rgba(255,68,68,0.3)]"
                                                                            : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                                                                    )}
                                                                >
                                                                    <span className="text-3xl">{hand === 'ROCK' ? '✊' : hand === 'SCISSORS' ? '✌️' : '✋'}</span>
                                                                    <span className="text-xs font-bold">{hand}</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-4 flex justify-end">
                                <button
                                    className={styles.button()}
                                    disabled={!selectedHand || selectedFake === 'NONE' || isProcessing}
                                    onClick={onSubmit}
                                >
                                    選択を確定
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const SideArea = () => {
        return (
            <div className={styles.sideArea()}>
                {isCurrentHost && hostStats && (
                    <>
                        <div className="text-[#44FFFF] font-bold text-lg mb-4 border-b-2 border-[#44FFFF] pb-1">あなたのデータ</div>

                        {/* ホスト用リアル統計 */}
                        <div className="mb-6">
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>最終的に選ぶ確率の高い手</span>
                                <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                            </div>
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>最終的に手を変える確率</span>
                                <span className={styles.statValue()}>{hostStats.realChangeRate}%</span>
                            </div>
                        </div>

                        {/* 選択した手の表示（ステップ2のみ） */}
                        {selectedHand && (
                            <div className="animate-in fade-in slide-in-from-left duration-500">
                                <div className="text-[#FF4444] font-bold text-lg mb-2 border-b-2 border-[#FF4444] pb-1">選択した手</div>
                                <div
                                    className="cursor-pointer hover:opacity-80 transition-opacity relative group"
                                    onClick={onReselectHand}
                                >
                                    <div className="border border-[#FF4444] bg-black p-2">
                                        <div className="h-32 w-full">
                                            <Hand3D handType={selectedHand} revealed={true} size="small" />
                                        </div>
                                        <div className="text-center font-bold text-white mt-1">{getHandDisplayWithEmoji(selectedHand)}</div>

                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[#FF4444] font-bold border border-[#FF4444] px-2 py-1">変更する</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ゲスト用（今は待機中表示） */}
                {!isCurrentHost && (
                    <div className="text-gray-500 italic uppercase">
                        WAITING FOR {hostName}...
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}
