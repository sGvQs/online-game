'use client'

import { useId } from 'react'
import { starVisual } from './styles'
import { STAR_GRADIENT_STOPS, STAR_GLOW_FILTER } from '@/constants/starShieldGame/constants'
import { cn } from '@/lib/utils'

export interface StarPosition {
    left: string
    bottom: string
    width: string
    height: string
    transform?: string
}

interface StarVisualProps {
    position: StarPosition
    className?: string
}

export function StarVisual({ position, className = '' }: StarVisualProps) {
    const id = useId()
    const glowId = `starGlow-${id}`
    const styles = starVisual()

    return (
        <div
            className={cn(styles.root(), className)}
            style={{
                ['--star-left' as string]: position.left,
                ['--star-bottom' as string]: position.bottom,
                ['--star-width' as string]: position.width,
                ['--star-height' as string]: position.height,
                ['--star-transform' as string]: position.transform ?? 'none',
            }}
        >
            <svg viewBox="0 0 100 100" className={styles.svg()} fill="none">
                <defs>
                    <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                        {STAR_GRADIENT_STOPS.map(({ offset, color }) => (
                            <stop key={offset} offset={offset} stopColor={color} />
                        ))}
                    </radialGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill={`url(#${glowId})`}
                    className={styles.circle()}
                    style={{ ['--star-glow-filter' as string]: STAR_GLOW_FILTER }}
                />
            </svg>
        </div>
    )
}
