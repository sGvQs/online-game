import { HandType, FakeTarget, FakeDetails, HostStats, JankenPhase } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../../utils'
import { HandSelectionGrid } from '../../HandSelectionGrid'
import React from 'react'
import { motion } from 'framer-motion'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { WaitingDisplay } from '../../common/WaitingDisplay'
import { GameButton } from '../../common/GameButton'
import { useSE } from '@/hooks/useSE'
import { setupPhase } from './styles'
import { sideCard } from '../phaseCard.styles'

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
    const spStyles = setupPhase()
    const { play } = useSE()

    const [showHelp, setShowHelp] = React.useState(false)

    const handleFakeOptionClick = (value: FakeTarget) => {
        play('select')
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
                        <div className={spStyles.howToPlayTitle()}>
                            HOW TO PLAY
                        </div>
                        <div className="space-y-6 text-gray-200 flex-1 overflow-y-auto">
                            <div className="flex gap-4 items-start">
                                <div className={spStyles.stepBadge()}>1</div>
                                <div>
                                    <div className={spStyles.stepTitle()}>ホストの嘘を見破れ</div>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        ホストは「選択する手」を設定し、<br />
                                        その後「選択する手」「お気に入り」「変える確率」の3つのデータを公開します。<br />
                                        ただし、公開されるデータには必ず<span className="text-[#FF4444]">嘘</span>が混ざっています。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className={spStyles.stepBadge()}>2</div>
                                <div>
                                    <div className={spStyles.stepTitle()}>勝つ手を予想せよ</div>
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
                                <div className={spStyles.stepBadge()}>3</div>
                                <div>
                                    <div className={spStyles.stepTitle()}>Null Hand</div>
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
                    <button
                        onClick={() => {
                            play('select')
                            setShowHelp(true)
                        }}
                        className="absolute top-5 right-5 px-5 py-2 border border-[#44FFFF]/30 text-[#44FFFF]/80 font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-[#44FFFF] hover:text-black hover:border-[#44FFFF] transition-all duration-300 z-30 bg-black/80 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(68,255,255,0.4)]"
                    >
                        HOW TO PLAY
                    </button>

                    {/* ヘルプモーダル */}
                    {showHelp && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => { play('select'); setShowHelp(false); }}>
                            <div className="bg-black border-[2px] border-[#44FFFF] p-6 max-w-md w-full shadow-[0_0_30px_rgba(68,255,255,0.2)]" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-black text-[#44FFFF] mb-4 border-b border-[#44FFFF] pb-2 uppercase tracking-widest">
                                    HOW TO PLAY
                                </h3>
                                <div className="space-y-3 text-gray-200 text-sm leading-relaxed">
                                    <p>
                                        <span className="text-[#FF4444] font-bold">1.『選択する手』を選択</span><br />
                                        まずはあなたがゲストに見せる手を選んでください。
                                    </p>
                                    <p>
                                        <span className="text-[#44FFFF] font-bold">2. 偽装工作 (必須)</span><br />
                                        ゲストに表示される情報を偽装してください。<br />
                                        <span className="text-xs text-gray-400">「選択する手」「変える確率」「お気に入り」の値のどれかに嘘をつけます</span>
                                    </p>
                                    <p>
                                        <span className="text-white border-b border-gray-500">統計情報の活用</span><br />
                                        右側に表示されている「あなたのデータ」は過去の実績から算出されたものです。
                                        あなたが偽装情報を設定後、偽装情報を含むデータは全員に共有されます。
                                    </p>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        className="px-6 py-1.5 bg-[#44FFFF] text-black font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors"
                                        onClick={() => { play('select'); setShowHelp(false); }}
                                    >
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedHand ? (
                        /* STEP 1: 手の選択 */
                        <div className="flex flex-col flex-1 min-h-0 animate-in fade-in zoom-in duration-300">
                            <PhaseHeader
                                engLabel="STEP 1"
                                title="あなたの手を選択"
                                subLabel="SELECT YOUR REAL HAND"
                            />
                            <div className="flex-1 flex items-center justify-center min-h-0">
                                <div className="flex justify-center w-full mb-8">
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
                        <div className="flex flex-col flex-1 min-h-0 animate-in slide-in-from-right duration-300">

                            <PhaseHeader
                                engLabel="STEP 2"
                                title="どの情報を偽装する？"
                                subLabel="CHOOSE DECEPTION"
                            />

                            <div className="flex flex-col flex-1 justify-center gap-6 min-h-0">
                                <div className={spStyles.fakeOptionGrid()}>
                                    {([
                                        { value: 'INITIAL_HAND', label: '選択した手', icon: '🖐️' },
                                        { value: 'CHANGE_RATE', label: '変える確率', icon: '📊' },
                                        { value: 'FAVORITE_HAND', label: 'お気に入り', icon: '🎲' },
                                    ] as const).map((option) => (
                                        <button
                                            key={option.value}
                                            className={cn(
                                                spStyles.fakeOption(),
                                                selectedFake === option.value
                                                    ? spStyles.fakeOptionActive()
                                                    : spStyles.fakeOptionInactive()
                                            )}
                                            onClick={() => handleFakeOptionClick(option.value)}
                                        >
                                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                                            <div>{option.label}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* 偽装詳細入力エリア */}
                                <div className="h-48 shrink-0 flex items-center justify-center bg-black/30 border border-gray-800 p-8 rounded-lg relative overflow-hidden">
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
                                                    <div className={spStyles.fakeHandGrid()}>
                                                        {Object.values(HandType)
                                                            .filter(h => h !== selectedHand)
                                                            .map(hand => (
                                                                <button
                                                                    key={hand}
                                                                    onClick={() => { play('select'); onUpdateFakeDetails({ ...fakeDetails, fakeHandValue: hand }); }}
                                                                    className={cn(
                                                                        spStyles.fakeHandOption(),
                                                                        fakeDetails.fakeHandValue === hand
                                                                            ? spStyles.fakeHandActive()
                                                                            : spStyles.fakeHandInactive()
                                                                    )}
                                                                >
                                                                    <Hand3D handType={hand} size="micro" />
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
                                                            className={spStyles.probabilityInput()}
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
                                                    <div className="text-[#44FFFF] font-bold mb-4 uppercase tracking-widest">偽装として表示する「お気に入り」を選択</div>
                                                    <div className={spStyles.fakeHandGrid()}>
                                                        {Object.values(HandType)
                                                            .filter(h => h !== hostStats?.realFavoriteHand)
                                                            .map(hand => (
                                                                <button
                                                                    key={hand}
                                                                    onClick={() => { play('select'); onUpdateFakeDetails({ ...fakeDetails, fakeFavoriteHandValue: hand }); }}
                                                                    className={cn(
                                                                        spStyles.fakeHandOption(),
                                                                        fakeDetails.fakeFavoriteHandValue === hand
                                                                            ? spStyles.fakeHandActive()
                                                                            : spStyles.fakeHandInactive()
                                                                    )}
                                                                >
                                                                    <Hand3D handType={hand} size="micro" />
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 shrink-0 flex justify-end">
                                <GameButton
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
                                    SUBMIT
                                </GameButton>
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
                            <div className={sideCard({ variant: 'red', size: 'lg' }).card()}>
                                <SideHeader
                                    engLabel="YOUR SELECTION"
                                    label="選択した手"
                                    badge="PRIVATE"
                                    variant="red"
                                    className="border-[#FF4444]/30"
                                />

                                <div className="flex items-center gap-4 mt-4">
                                    <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg border border-[#FF4444]/20 relative overflow-hidden shrink-0 pointer-events-none">
                                        <div className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <Hand3D handType={selectedHand} revealed={true} size="micro" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className={sideCard().cardTitle()}>選択した手</div>
                                        <div className={sideCard({ size: 'lg' }).cardValue()}>
                                            {getHandDisplayWithEmoji(selectedHand)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { play('select'); onReselectHand(); }}
                                        className="ml-auto text-[#FF4444] text-xs font-bold border border-[#FF4444]/30 px-3 py-1.5 rounded hover:bg-[#FF4444] hover:text-black transition-colors shrink-0"
                                    >
                                        変更
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ホスト用リアル統計 */}
                        <div className={sideCard({ variant: 'cyan', size: 'lg', className: 'flex-1' }).card()}>
                            <SideHeader
                                engLabel="YOUR DATA"
                                label="公開データ"
                                badge="PUBLIC"
                                className="border-[#44FFFF]/30 !mb-4"
                            />

                            <div className="space-y-4">
                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>お気に入り</div>
                                    <div className={sideCard({ size: 'lg' }).cardValue()}>
                                        {getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}
                                    </div>
                                </div>
                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>変える確率</div>
                                    <div className={sideCard({ size: 'lg' }).cardValueWithUnit()}>
                                        {hostStats.realChangeRate}<span className="text-lg text-gray-500 font-bold ml-1">%</span>
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
                    <div className="h-full border border-gray-800 rounded bg-[#111]">
                        <WaitingDisplay
                            engLabel="WAITING FOR"
                            text={hostName}
                            subText="ホストが設定中です..."
                            handType={titleHand}
                            isRotating={true}
                        />
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