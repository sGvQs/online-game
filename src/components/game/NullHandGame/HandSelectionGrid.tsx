import { HandType } from '@/types'
import { Hand3D } from './Hand3D'
import { motion } from 'framer-motion'
import { getHandDisplayWithEmoji } from './utils'
import { useSE } from '@/hooks/useSE'
import { handSelectionGrid } from './HandSelectionGrid.styles'

interface HandSelectionGridProps {
    selectedHand: HandType | null
    onSelectHand: (hand: HandType) => void
    isProcessing?: boolean
    size?: 'small' | 'medium' | 'large'
    personalColor?: string
}

export function HandSelectionGrid({
    selectedHand,
    onSelectHand,
    isProcessing = false,
    size = 'small',
    personalColor
}: HandSelectionGridProps) {
    const { play } = useSE()
    const styles = handSelectionGrid()

    return (
        <div className={styles.root()}>
            {Object.values(HandType).map((hand) => {
                const isSelected = selectedHand === hand
                const s = handSelectionGrid({ selected: isSelected, disabled: isProcessing })
                return (
                    <button
                        key={hand}
                        className={s.button()}
                        onClick={() => {
                            play('select')
                            onSelectHand(hand)
                        }}
                        disabled={isProcessing}
                    >
                        <div className={s.innerPad()}>
                            <Hand3D handType={hand} revealed={true} size={size} personalColor={personalColor} />
                        </div>

                        {isSelected ? (
                            <div className={s.label()}>
                                YOUR CHOICE
                            </div>
                        ) : (
                            <div className={s.label()}>
                                {getHandDisplayWithEmoji(hand)}
                            </div>
                        )}

                        {/* Selection Indicator */}
                        {isSelected && (
                            <motion.div
                                layoutId="selection-ring"
                                className={s.selectionRing()}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
