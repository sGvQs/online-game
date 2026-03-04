'use client'

import { GLASS_CARD_STYLE } from './constants'

interface GlassCardProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

export function GlassCard({ children, className = '', style }: GlassCardProps) {
    return (
        <div
            className={className}
            style={{
                ...GLASS_CARD_STYLE,
                ...style,
            }}
        >
            {children}
        </div>
    )
}
