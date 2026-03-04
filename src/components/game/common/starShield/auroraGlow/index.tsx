'use client'

import { auroraGlow } from './styles'
import { AURORA_GRADIENT_DEFAULT } from '@/constants/starShieldGame/constants'
import { cn } from '@/lib/utils'

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
    const styles = auroraGlow()
    return (
        <div
            className={cn(styles.root(), className)}
            style={{
                ['--aurora-width' as string]: typeof width === 'number' ? `${width}px` : width,
                ['--aurora-height' as string]: typeof height === 'number' ? `${height}px` : height,
                ['--aurora-opacity' as string]: String(opacity),
                ['--aurora-filter' as string]: `blur(${blur}px)`,
                ['--aurora-bg' as string]: gradient,
            }}
        />
    )
}
