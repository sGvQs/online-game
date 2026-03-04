import { HandType } from '@/types'
import { Hand3D } from '../Hand3D'
import { motion } from 'framer-motion'
import { getHandDisplayWithEmoji } from '../utils'
import { handCard } from './HandCard.styles'
import { cn } from '@/lib/utils'

interface HandCardProps {
    handType: HandType | null
    active?: boolean
    color?: 'cyan' | 'red' | 'gray'
    size?: 'small' | 'medium' | 'large'
    personalColor?: string
    className?: string
}

export function HandCard({
    handType,
    active = true,
    color = 'cyan',
    size = 'medium',
    personalColor,
    className,
}: HandCardProps) {
    const s = handCard({ size, active, color })

    return (
        <div className={cn(s.root(), className)}>
            <div className={s.card()}>
                {handType ? (
                    <Hand3D
                        handType={handType}
                        revealed={true}
                        size={size}
                        personalColor={personalColor || (color === 'red' ? '#FF4444' : color === 'cyan' ? '#44FFFF' : undefined)}
                    />
                ) : (
                    <div className="text-gray-800 text-4xl">?</div>
                )}
            </div>
        </div>
    )
}
