import { MatchScoreWithUser } from '@/shared/types'
import { SideHeader } from './SideHeader'
import { sideCard } from '../phases/phaseCard.styles'
import { cn } from '@/lib/utils'

interface CurrentScoresProps {
    currentScores: MatchScoreWithUser[]
    currentUserId: string
    variant?: 'cyan' | 'red'
    size?: 'sm' | 'md' | 'lg'
    userColor?: string
}

export function CurrentScores({
    currentScores,
    currentUserId,
    variant = 'cyan',
    size = 'md',
    userColor
}: CurrentScoresProps) {
    return (
        <div className={sideCard({ variant, size }).card() + " flex-1 overflow-hidden flex flex-col"}>
            <SideHeader
                engLabel="CURRENT SCORES"
                label="現在のスコア"
                className={variant === 'cyan' ? "border-[#44FFFF]/30" : "border-[#FF4444]/30"}
            />
            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar scrollbar-hide">
                {currentScores.length > 0 ? (
                    currentScores.map((score, index) => (
                        <div
                            key={score.userId}
                            className={cn(
                                "flex items-center justify-between p-2 rounded border",
                                score.userId === currentUserId
                                    ? "bg-[#44FFFF]/10 border-[#44FFFF]/30"
                                    : "bg-black/20 border-white/5"
                            )}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="text-[10px] font-black text-white w-4">
                                    {index + 1}
                                </div>
                                <div className={cn(
                                    "text-xs font-bold truncate text-gray-300",
                                )}
                                    style={{ color: score.userId === currentUserId ? userColor : "" }}
                                >
                                    {score.user.name}
                                </div>
                            </div>
                            <div className="text-sm font-black tabular-nums" style={{ color: score.userId === currentUserId ? userColor : "" }}>
                                {score.points}<span className="text-[10px] ml-1">pt</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-[10px] text-gray-600 italic">
                        No scores recorded
                    </div>
                )}
            </div>
        </div>
    )
}
