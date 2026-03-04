'use client'

import { useId } from 'react'
import { STAR_GRADIENT_STOPS, STAR_GLOW_FILTER } from '@/constants/starShieldGame/constants'

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

    return (
        <div
            className={`absolute pointer-events-none z-0 overflow-visible ${className}`}
            style={{
                left: position.left,
                bottom: position.bottom,
                width: position.width,
                height: position.height,
                transform: position.transform,
            }}
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible"
                fill="none"
                style={{ overflow: 'visible' }}
            >
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
                    style={{ filter: STAR_GLOW_FILTER }}
                />
            </svg>
        </div>
    )
}
