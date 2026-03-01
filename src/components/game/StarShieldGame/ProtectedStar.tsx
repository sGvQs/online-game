'use client'

import { useId } from 'react'

// 星の位置・サイズ（変更しやすいように変数で管理）
export const STAR_POSITION = {
    left: '-45%',
    bottom: '-120%',
    width: '90vmax',
    height: '90vmax',
} as const

/**
 * 守られる星（恐竜の背後・左下に巨大で配置、5〜10%程度のみ見える丸い星）
 * 恐竜が隕石から星を守っている雰囲気を出す
 */
export function ProtectedStar() {
    const id = useId()
    const glowId = `starGlow-${id}`
    const blurId = `starBlur-${id}`

    return (
        <div
            className="absolute pointer-events-none z-0"
            style={{
                left: STAR_POSITION.left,
                bottom: STAR_POSITION.bottom,
                width: STAR_POSITION.width,
                height: STAR_POSITION.height,
            }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                <defs>
                    <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(255,230,150,0.95)" />
                        <stop offset="60%" stopColor="rgba(255,200,100,0.7)" />
                        <stop offset="100%" stopColor="rgba(255,180,80,0.3)" />
                    </radialGradient>
                    <filter id={blurId}>
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill={`url(#${glowId})`}
                    filter={`url(#${blurId})`}
                    className="drop-shadow-[0_0_60px_rgba(255,220,120,0.6)]"
                />
            </svg>
        </div>
    )
}
