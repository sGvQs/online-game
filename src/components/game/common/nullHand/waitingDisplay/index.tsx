import { HandType } from '@/types'
import { Hand3D } from '@/components/game/common/nullHand/hand3D'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { waitingDisplay } from './styles'

interface WaitingDisplayProps {
    engLabel?: string
    text: string
    subText?: string
    handType?: HandType | null
    isRotating?: boolean
    className?: string
}

export const WaitingDisplay = ({
    engLabel = "WAITING...",
    text,
    subText,
    handType,
    isRotating = true,
    className
}: WaitingDisplayProps) => {
    const styles = waitingDisplay()

    const [displayHand, setDisplayHand] = useState<HandType>(handType || HandType.ROCK)

    useEffect(() => {
        const hands = Object.values(HandType)
        let currentIndex = hands.indexOf(displayHand)
        if (currentIndex === -1) currentIndex = 0

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % hands.length
            setDisplayHand(hands[currentIndex])
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className={cn(styles.root(), className)}>
            {/* Background Hand Animation */}
            <div className={styles.bgHand()}>
                <Hand3D handType={displayHand} revealed={true} size="large" isRotating={isRotating} />
            </div>

            <div className={styles.content()}>
                <div className={styles.pulse()}>
                    <h2 className={styles.engLabel()}>{engLabel}</h2>
                    <h3 className={styles.title()}>{text}</h3>
                    {subText && (
                        <p className={styles.subText()}>{subText}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
