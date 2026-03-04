'use client'

import { AURORA_GRADIENT_DEFAULT } from '@/constants/starShieldGame/constants'

interface AuroraGlowProps {
    width?: number | string
    height?: number | string
    opacity?: number
    blur?: number
    gradient?: string
    className?: string
}

export function AuroraGlow({
    width = 700,
    height = 350,
    opacity = 0.25,
    blur = 50,
    gradient = AURORA_GRADIENT_DEFAULT,
    className = '',
}: AuroraGlowProps) {
    return (
        <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                opacity,
                filter: `blur(${blur}px)`,
                background: gradient,
            }}
        />
    )
}
