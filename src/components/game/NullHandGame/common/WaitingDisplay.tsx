import { HandType } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

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
    const styles = nullHandGame()

    // Cycle through hands for visual effect/obfuscation
    const [displayHand, setDisplayHand] = useState<HandType>(handType || 'ROCK')

    useEffect(() => {
        const hands: HandType[] = ['ROCK', 'PAPER', 'SCISSORS']
        let currentIndex = hands.indexOf(displayHand)
        if (currentIndex === -1) currentIndex = 0


        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % hands.length
            setDisplayHand(hands[currentIndex])
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className={cn("flex flex-col h-full animate-in fade-in zoom-in duration-300 relative overflow-hidden", className)}>
            {/* Background Hand Animation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none filter blur-[2px]">
                <Hand3D handType={displayHand} revealed={true} size="large" isRotating={isRotating} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center">
                <div className="animate-pulse">
                    <h2 className="text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-mono uppercase">{engLabel}</h2>
                    <h3 className="text-white text-4xl font-bold tracking-wider mb-2">{text}</h3>
                    {subText && (
                        <p className="text-gray-600 text-xs font-mono tracking-[0.2em] uppercase">{subText}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
