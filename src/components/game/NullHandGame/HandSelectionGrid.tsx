import { HandType } from '@/shared/types'
import { Hand3D } from './Hand3D'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { getHandDisplayWithEmoji } from './utils'

interface HandSelectionGridProps {
    selectedHand: HandType | null
    onSelectHand: (hand: HandType) => void
    isProcessing?: boolean
    size?: 'small' | 'medium' | 'large'
}

export function HandSelectionGrid({
    selectedHand,
    onSelectHand,
    isProcessing = false,
    size = 'small'
}: HandSelectionGridProps) {
    return (
        <div className="grid grid-cols-3 gap-8 w-full max-w-4xl px-8">
            {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                <button
                    key={hand}
                    className={cn(
                        "relative group aspect-square rounded-xl transition-all duration-300",
                        "bg-black/40 border-2 backdrop-blur-sm",
                        selectedHand === hand
                            ? "border-[#44FFFF] shadow-[0_0_30px_rgba(68,255,255,0.3)] bg-[#44FFFF]/5 scale-105 z-10"
                            : "border-gray-800 hover:border-gray-600 hover:bg-white/5",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => onSelectHand(hand)}
                    disabled={isProcessing}
                >
                    <div className="absolute inset-0 p-4">
                        <Hand3D handType={hand} revealed={true} size={size} />
                    </div>
                    <div className={cn(
                        "absolute bottom-4 inset-x-0 text-center font-black text-xl tracking-[0.2em] transition-colors",
                        selectedHand === hand ? "text-[#44FFFF]" : "text-gray-500 group-hover:text-gray-300"
                    )}>
                        {getHandDisplayWithEmoji(hand)}
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
    )
}
