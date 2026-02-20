import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from './utils'

interface LieRevealCardProps {
    jankenEvent: JankenEventWithGuests
    hostStats: HostStats | null
}

export const LieRevealCard = ({ jankenEvent, hostStats }: LieRevealCardProps) => {
    if (jankenEvent.fakeTarget === 'NONE') {
        return (
            <div className="text-center text-gray-400 italic">
                今回、ホストは嘘をつきませんでした... (正直者です)
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto bg-[#111] border border-gray-800 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#FF4444] text-black text-xs font-bold px-3 py-1">
                LIE DETECTED
            </div>

            <div className="flex flex-col gap-4">
                {/* 1. 選択した手 */}
                <div className={cn("p-3 rounded-lg border", jankenEvent.fakeTarget === 'INITIAL_HAND' ? "bg-[#1a1a1a] border-[#FF4444]" : "bg-black/20 border-gray-800")}>
                    <div className="text-xs text-gray-500 mb-1">選択した手</div>
                    {jankenEvent.fakeTarget === 'INITIAL_HAND' ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="text-gray-500 line-through text-lg">{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</div>
                            <div className="text-[#FF4444] text-sm">→</div>
                            <div className="text-[#FF4444] font-bold text-xl">{getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}</div>
                            <div className="text-[#FF4444] text-[10px] font-bold ml-2 px-1.5 py-0.5 border border-[#FF4444] rounded">LIE</div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <div className="text-white font-bold text-lg">{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</div>
                            <div className="text-gray-600 text-[10px] ml-2 px-1.5 py-0.5 border border-gray-700 rounded">TRUE</div>
                        </div>
                    )}
                </div>

                {/* 2. 変える確率 */}
                <div className={cn("p-3 rounded-lg border", jankenEvent.fakeTarget === 'CHANGE_RATE' ? "bg-[#1a1a1a] border-[#FF4444]" : "bg-black/20 border-gray-800")}>
                    <div className="text-xs text-gray-500 mb-1">変える確率</div>
                    {jankenEvent.fakeTarget === 'CHANGE_RATE' ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="text-gray-500 line-through text-lg">{hostStats?.realChangeRate !== null && hostStats?.realChangeRate !== undefined ? `${hostStats.realChangeRate}` : '???'}%</div>
                            <div className="text-[#FF4444] text-sm">→</div>
                            <div className="text-[#FF4444] font-bold text-xl">{jankenEvent.fakeChangeRateValue}%</div>
                            <div className="text-[#FF4444] text-[10px] font-bold ml-2 px-1.5 py-0.5 border border-[#FF4444] rounded">LIE</div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <div className="text-white font-bold text-lg">{hostStats?.realChangeRate !== null && hostStats?.realChangeRate !== undefined ? `${hostStats.realChangeRate}%` : '???'}</div>
                            <div className="text-gray-600 text-[10px] ml-2 px-1.5 py-0.5 border border-gray-700 rounded">TRUE</div>
                        </div>
                    )}
                </div>

                {/* 3. お気に入り */}
                <div className={cn("p-3 rounded-lg border", jankenEvent.fakeTarget === 'FAVORITE_HAND' ? "bg-[#1a1a1a] border-[#FF4444]" : "bg-black/20 border-gray-800")}>
                    <div className="text-xs text-gray-500 mb-1">お気に入り</div>
                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="text-gray-500 line-through text-lg">{hostStats?.realFavoriteHand ? getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType) : '???'}</div>
                            <div className="text-[#FF4444] text-sm">→</div>
                            <div className="text-[#FF4444] font-bold text-xl">{getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}</div>
                            <div className="text-[#FF4444] text-[10px] font-bold ml-2 px-1.5 py-0.5 border border-[#FF4444] rounded">LIE</div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <div className="text-white font-bold text-lg">{hostStats?.realFavoriteHand ? getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType) : '???'}</div>
                            <div className="text-gray-600 text-[10px] ml-2 px-1.5 py-0.5 border border-gray-700 rounded">TRUE</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
