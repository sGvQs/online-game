import { HandType, JankenEventWithGuests, HostStats, FakeTarget } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface FinalDecisionPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isCurrentHost: boolean
    selectedHand: HandType | null
    isProcessing: boolean
    onSelectHand: (hand: HandType) => void
    onSubmit: () => void
    hostName: string
}

export function FinalDecisionPhase({
    jankenEvent,
    hostStats,
    isCurrentHost,
    selectedHand,
    isProcessing,
    onSelectHand,
    onSubmit,
    hostName
}: FinalDecisionPhaseProps) {
    const styles = nullHandGame()

    if (!jankenEvent) return null

    // ------------------------------------------------------------------
    // HOST VIEW
    // ------------------------------------------------------------------
    if (isCurrentHost) {
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
                    <h2 className={styles.messageText()}>FINAL HAND SELECTION</h2>
                    <p className="text-center text-gray-500 text-sm mb-8 tracking-widest">
                        最終決断: その手を変えるか、貫くか？
                    </p>

                    <div className="flex-1 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-8 w-full max-w-4xl px-8">
                            {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                <button
                                    key={hand}
                                    className={cn(
                                        "relative group aspect-square rounded-xl transition-all duration-300",
                                        "bg-black/40 border-2 backdrop-blur-sm",
                                        selectedHand === hand
                                            ? "border-[#44FFFF] shadow-[0_0_30px_rgba(68,255,255,0.3)] bg-[#44FFFF]/5 scale-105 z-10"
                                            : "border-gray-800 hover:border-gray-600 hover:bg-white/5"
                                    )}
                                    onClick={() => onSelectHand(hand)}
                                    disabled={isProcessing}
                                >
                                    <div className="absolute inset-0 p-4">
                                        <Hand3D handType={hand} revealed={true} size="small" />
                                    </div>
                                    <div className={cn(
                                        "absolute bottom-4 inset-x-0 text-center font-black text-xl tracking-[0.2em] transition-colors",
                                        selectedHand === hand ? "text-[#44FFFF]" : "text-gray-500 group-hover:text-gray-300"
                                    )}>
                                        {hand}
                                    </div>

                                    {/* Selection Indicator */}
                                    {selectedHand === hand && (
                                        <motion.div
                                            layoutId="selection-ring"
                                            className="absolute inset-0 border-2 border-[#44FFFF] rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 mb-4 text-center">
                        <button
                            className={cn(styles.button(), styles.buttonPrimary(), "px-16 py-4 text-lg")}
                            disabled={!selectedHand || isProcessing}
                            onClick={onSubmit}
                        >
                            DECIDE FINAL HAND
                        </button>
                    </div>
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className="h-full flex flex-col gap-6 overflow-y-auto">

                    {/* Publicly Shown Fake Info */}
                    <div className="bg-[#1a0505] border border-[#FF4444]/30 rounded-lg p-5">
                        <h3 className="text-[#FF4444] font-black text-sm tracking-widest border-b border-[#FF4444]/30 pb-2 mb-4 flex items-center gap-2">
                            🔪 YOUR FAKE DATA <span className="text-[10px] bg-[#FF4444] text-black px-1 rounded ml-auto">PUBLIC</span>
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs uppercase tracking-wider">Lied About</span>
                                <span className="text-white font-bold text-sm bg-[#FF4444]/20 px-2 py-0.5 rounded border border-[#FF4444]/30">
                                    {jankenEvent.fakeTarget === 'NONE' && 'NONE'}
                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' && 'INITIAL HAND'}
                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' && 'CHANGE RATE'}
                                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' && 'FAVORITE HAND'}
                                </span>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[#FF4444]/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-xs">Initial Hand</span>
                                    <span className={cn("font-bold", jankenEvent.fakeTarget === 'INITIAL_HAND' ? "text-[#FF4444]" : "text-gray-300")}>
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND'
                                            ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                                            : getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-xs">Change Rate</span>
                                    <span className={cn("font-bold", jankenEvent.fakeTarget === 'CHANGE_RATE' ? "text-[#FF4444]" : "text-gray-300")}>
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE'
                                            ? `${jankenEvent.fakeChangeRateValue ?? 0}%`
                                            : `${hostStats?.realChangeRate ?? 0}%`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-xs">Favorite Hand</span>
                                    <span className={cn("font-bold", jankenEvent.fakeTarget === 'FAVORITE_HAND' ? "text-[#FF4444]" : "text-gray-300")}>
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND'
                                            ? getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)
                                            : getHandDisplayWithEmoji(hostStats?.realFavoriteHand as HandType)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real Private Info */}
                    <div className="bg-[#051a1a] border border-[#44FFFF]/30 rounded-lg p-5 flex-1">
                        <h3 className="text-[#44FFFF] font-black text-sm tracking-widest border-b border-[#44FFFF]/30 pb-2 mb-4 flex items-center gap-2">
                            💎 YOUR REAL STATS <span className="text-[10px] bg-[#44FFFF] text-black px-1 rounded ml-auto">PRIVATE</span>
                        </h3>

                        {hostStats && (
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[#44FFFF] text-xs uppercase mb-1 opacity-70">True Initial Hand</div>
                                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                                        {getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/30 p-3 rounded border border-[#44FFFF]/20">
                                        <div className="text-gray-500 text-[10px] uppercase mb-1">True Fav. Hand</div>
                                        <div className="text-white font-bold">
                                            {getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded border border-[#44FFFF]/20">
                                        <div className="text-gray-500 text-[10px] uppercase mb-1">True Chg. Rate</div>
                                        <div className="text-white font-bold text-xl font-mono">
                                            {hostStats.realChangeRate}%
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-4 rounded text-xs text-gray-400 leading-relaxed border border-gray-800">
                                    <span className="text-[#44FFFF] font-bold">Strategy Tip:</span><br />
                                    ゲストは上の「FAKE DATA」を見て予想しています。<br />
                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' &&
                                        `「変える確率」を ${jankenEvent.fakeChangeRateValue ?? 0}% と偽装しています。ゲストは${(jankenEvent.fakeChangeRateValue ?? 0) > 50 ? '変えてくる' : '変えない'}と予想するでしょう。`
                                    }
                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' &&
                                        `「初期手」を ${getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)} と偽装しています。ゲストはこれに対する勝ち手を出そうとするかもしれません。`
                                    }
                                    {jankenEvent.fakeTarget === 'NONE' &&
                                        `今回は正直に全ての情報を公開しています。裏の裏をかくチャンスです。`
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )

        return (
            <>
                {MainArea()}
                {SideArea()}
            </>
        )
    }

    // ------------------------------------------------------------------
    // GUEST VIEW (WAITING)
    // ------------------------------------------------------------------
    const GuestView = () => {
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                    {/* Background Hand Animation */}
                    <div className="absolute inset-0 opacity-10 blur-sm pointer-events-none flex items-center justify-center">
                        <Hand3D handType={jankenEvent.initialHand as HandType || 'ROCK'} revealed={true} size="large" isRotating={true} />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center">
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#44FFFF] to-white mb-4 tracking-widest animate-pulse">
                            WAITING FOR HOST
                        </h2>
                        <div className="w-16 h-1 bg-[#44FFFF] mx-auto mb-8 rounded-full" />
                        <p className="text-gray-400 text-lg tracking-wider font-light">
                            {hostName} IS MAKING THE FINAL DECISION...
                        </p>

                        {/* Visual Loader */}
                        <div className="flex gap-2 justify-center mt-12">
                            <motion.div
                                className="w-3 h-3 bg-[#44FFFF] rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            />
                            <motion.div
                                className="w-3 h-3 bg-[#44FFFF] rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            />
                            <motion.div
                                className="w-3 h-3 bg-[#44FFFF] rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className="h-full flex flex-col gap-6 overflow-y-auto">

                    {/* Publicly Shown Fake Info for Guest */}
                    <div className="bg-[#1a0505] border border-[#FF4444]/30 rounded-lg p-5 flex-1">
                        <h3 className="text-[#FF4444] font-black text-sm tracking-widest border-b border-[#FF4444]/30 pb-2 mb-4 flex items-center gap-2">
                            🔪 HOST'S PUBLIC DATA <span className="text-[10px] bg-[#FF4444] text-black px-1 rounded ml-auto">PUBLIC</span>
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-black/20 p-4 rounded text-xs text-gray-400 leading-relaxed border border-gray-800">
                                <span className="text-[#FF4444] font-bold">INFO:</span><br />
                                ここに表示されているデータには<span className="text-[#FF4444] font-bold">１つだけ嘘</span>が含まれています。<br />
                                ホストはこのデータを元に、さらに裏をかくか、そのまま手を変えないか迷っています。
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center bg-black/30 p-3 rounded border border-[#FF4444]/10">
                                    <span className="text-gray-400 text-xs uppercase">Initial Hand</span>
                                    <span className="font-bold text-[#FF4444]">
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND'
                                            ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                                            : getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-black/30 p-3 rounded border border-[#FF4444]/10">
                                    <span className="text-gray-400 text-xs uppercase">Change Rate</span>
                                    <span className="font-bold text-[#FF4444]">
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE'
                                            ? `${jankenEvent.fakeChangeRateValue ?? 0}%`
                                            : `${hostStats?.realChangeRate ?? 0}%`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-black/30 p-3 rounded border border-[#FF4444]/10">
                                    <span className="text-gray-400 text-xs uppercase">Favorite Hand</span>
                                    <span className="font-bold text-[#FF4444]">
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND'
                                            ? getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)
                                            : getHandDisplayWithEmoji(hostStats?.realFavoriteHand as HandType)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

        return (
            <>
                {MainArea()}
                {SideArea()}
            </>
        )
    }

    return <GuestView />
}
