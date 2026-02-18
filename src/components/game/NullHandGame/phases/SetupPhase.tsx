import { HandType, FakeTarget, FakeDetails, HostStats, JankenPhase } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'
import { HandSelectionGrid } from '../HandSelectionGrid'
import React from 'react'
import { motion } from 'framer-motion'

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
                <motion.div
                    className={styles.mainArea()}
                    layout
                    transition={{ duration: 0.3 }}
                >
                    <div className="h-full flex flex-col p-4">
                        <div className="text-[#44FFFF] font-black text-3xl mb-6 border-b-4 border-[#44FFFF] pb-2 tracking-widest uppercase">
                            HOW TO PLAY
                        </div>
                        <div className="space-y-6 text-gray-200 flex-1 overflow-y-auto">
                            <div className="flex gap-4 items-start">
                                <div className="bg-[#44FFFF] text-black font-bold w-8 h-8 flex items-center justify-center rounded-sm shrink-0">1</div>
                                <div>
                                    <div className="text-[#44FFFF] font-bold text-lg mb-1">ホストの嘘を見破れ</div>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        ホストは「選択する手」を設定し、<br />
                                        その後「選択する手」「お気に入り」「変える確率」の3つのデータを公開します。<br />
                                        ただし、公開されるデータには必ず<span className="text-[#FF4444]">嘘</span>が混ざっています。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="bg-[#44FFFF] text-black font-bold w-8 h-8 flex items-center justify-center rounded-sm shrink-0">2</div>
                                <div>
                                    <div className="text-[#44FFFF] font-bold text-lg mb-1">勝つ手を予想せよ</div>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        ホストの心理を読み、最終的に出す手に<span className="text-[#44FFFF] font-bold">勝てる手</span>を選んでください。<br />
                                        「嘘」と設定された項目は、表示されている内容が事実とは異なります。<br />
                                        <span className="text-gray-400 text-xs">
                                            （例：「選択する手」が嘘の場合、表示されている手とは別の手が、本当の「選択する手」として設定されています）
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="bg-[#44FFFF] text-black font-bold w-8 h-8 flex items-center justify-center rounded-sm shrink-0">3</div>
                                <div>
                                    <div className="text-[#44FFFF] font-bold text-lg mb-1">Null Hand</div>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        プレイヤー： ホストに勝てば<span className="text-[#44FFFF] font-bold">1点</span>獲得<br />
                                        ホスト： 全員に勝てば<span className="text-[#44FFFF] font-bold">3点</span>獲得<br />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )
        }

        return (
            <motion.div
                className={styles.mainArea()}
                layout
                transition={{ duration: 0.3 }}
            >
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
                            <div className="text-center mb-8">
                                <h2 className="text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-mono">STEP 1</h2>
                                <h3 className="text-white text-3xl font-bold tracking-wider">あなたの手を選択</h3>
                                <p className="text-gray-500 text-sm mt-2 tracking-wide">SELECT YOUR REAL HAND</p>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex justify-center w-full">
                                    <HandSelectionGrid
                                        selectedHand={selectedHand}
                                        onSelectHand={onSelectHand}
                                        isProcessing={isProcessing}
                                        size="small"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: 偽装の選択 */
                        <div
                            className="flex flex-col h-full animate-in slide-in-from-right duration-300"
                        >

                            <div className="text-center mb-8">
                                <h2 className="text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-mono">STEP 2</h2>
                                <h3 className="text-white text-3xl font-bold tracking-wider">どの情報を偽装する？</h3>
                                <p className="text-gray-500 text-sm mt-2 tracking-wide">CHOOSE DECEPTION</p>
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {([
                                        { value: 'INITIAL_HAND', label: '選択した手', icon: '🖐️' },
                                        { value: 'CHANGE_RATE', label: '変える確率', icon: '📊' },
                                        { value: 'FAVORITE_HAND', label: 'お気に入り', icon: '🎲' },
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
                                                    <div className="text-[#44FFFF] font-bold mb-4 uppercase tracking-widest">偽装として表示する「選択した手」を選択</div>
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
                                                        変える確率: <span className="text-3xl ml-2">{fakeDetails.fakeChangeRateValue ?? 50}%</span>
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
                                                        ※ この確率はゲストに「あなたが最終的に変える確率」として表示されます
                                                    </div>
                                                </div>
                                            )}

                                            {selectedFake === 'FAVORITE_HAND' && (
                                                <div className="text-center space-y-4">
                                                    <div className="text-[#44FFFF] font-bold mb-4 uppercase tracking-widest">偽装として表示する「お気に入り」</div>
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
                                    disabled={
                                        !selectedHand ||
                                        selectedFake === 'NONE' ||
                                        (selectedFake === 'INITIAL_HAND' && !fakeDetails.fakeHandValue) ||
                                        (selectedFake === 'CHANGE_RATE' && fakeDetails.fakeChangeRateValue === undefined) ||
                                        (selectedFake === 'FAVORITE_HAND' && !fakeDetails.fakeFavoriteHandValue) ||
                                        isProcessing
                                    }
                                    onClick={onSubmit}
                                >
                                    選択を確定
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        )
    }

    const SideArea = () => {
        return (
            <motion.div
                className={styles.sideArea()}
                layout
                transition={{ duration: 0.3 }}
            >
                {isCurrentHost && hostStats && (
                    <div className="flex flex-col gap-4 h-full">
                        {/* 選択した手の表示（ステップ2のみ） */}
                        {selectedHand && (
                            <div className="bg-[#1a0505] border border-[#FF4444]/30 rounded-xl p-6 relative overflow-hidden group">


                                <h3 className="text-[#FF4444] font-black text-xs tracking-widest border-b border-[#FF4444]/30 pb-2 mb-4 flex items-center justify-between">
                                    <span>YOUR SELECTION</span>
                                    <span className="bg-[#FF4444] text-black px-1.5 rounded text-[10px]">PRIVATE</span>
                                </h3>

                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 bg-black/50 rounded-lg border border-[#FF4444]/20 overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Hand3D handType={selectedHand} revealed={true} size="small" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">選択した手</div>
                                        <div className="text-2xl font-bold text-white leading-none">
                                            {getHandDisplayWithEmoji(selectedHand)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={onReselectHand}
                                        className="ml-auto text-[#FF4444] text-xs font-bold border border-[#FF4444]/30 px-3 py-1.5 rounded hover:bg-[#FF4444] hover:text-black transition-colors"
                                    >
                                        変更
                                    </button>
                                </div>


                            </div>
                        )}

                        {/* ホスト用リアル統計 */}
                        <div className="bg-[#051a1a] border border-[#44FFFF]/30 rounded-xl p-6 flex-1 flex flex-col">
                            <h3 className="text-[#44FFFF] font-black text-xs tracking-widest border-b border-[#44FFFF]/30 pb-2 mb-4 flex items-center justify-between">
                                <span>YOUR DATA</span>
                                <span className="bg-[#44FFFF] text-black px-1.5 rounded text-[10px]">PUBLIC</span>
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-black/30 rounded-lg p-3 border border-[#44FFFF]/10">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">お気に入り</div>
                                    <div className="text-lg font-bold text-white flex items-center gap-2">
                                        {getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}
                                    </div>
                                </div>
                                <div className="bg-black/30 rounded-lg p-3 border border-[#44FFFF]/10">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">変える確率</div>
                                    <div className="text-lg font-bold text-white font-mono">
                                        {hostStats.realChangeRate}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 text-[10px] text-gray-500 leading-relaxed border-t border-[#44FFFF]/10">
                                <span className="text-[#44FFFF]">Note:</span> このデータは全員に公開されています。これを逆手に取って偽装工作を行いましょう。
                            </div>
                        </div>
                    </div>
                )}

                {/* ゲスト用（今は待機中表示） */}
                {!isCurrentHost && (
                    <div className="flex flex-col items-center justify-center p-6 bg-[#111] rounded border border-gray-800 animate-pulse h-full">
                        <Hand3D handType={titleHand} revealed={true} size="small" isRotating={true} />
                        <div className="text-[#44FFFF] font-bold text-lg mb-1 tracking-widest text-center mt-4">WAITING FOR</div>
                        <div className="text-white font-black text-2xl tracking-widest text-center border-b-2 border-[#44FFFF] pb-1 w-full max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                            {hostName}
                        </div>
                        <div className="text-gray-500 text-xs mt-4 text-center">ホストが設定中です...</div>
                    </div>
                )}
            </motion.div>
        )
    }

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}