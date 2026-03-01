'use client'

import { useId } from 'react'

// 星の位置・サイズ（変更しやすいように変数で管理）
export const STAR_POSITION = {
    left: '-45%',
    bottom: '-120%',
    width: '90vmax',
    height: '90vmax',
} as const

// 当たり判定用（正規化座標 0-1、星の見えている部分の中心）
export const STAR_TARGET_X = 0.03
export const STAR_TARGET_Y = 0.92
/** 星の半径（中心から表面まで）。隕石がこの表面に触れたらゲームオーバー */
export const STAR_RADIUS = 0.35

/**
 * 守られる星（恐竜の背後・左下に巨大で配置、5〜10%程度のみ見える丸い星）
 * 恐竜が隕石から星を守っている雰囲気を出す
 */
export function ProtectedStar() {
    const id = useId()
    const glowId = `starGlow-${id}`

    return (
        <div
            className="absolute pointer-events-none z-0 overflow-visible"
            style={{
                left: STAR_POSITION.left,
                bottom: STAR_POSITION.bottom,
                width: STAR_POSITION.width,
                height: STAR_POSITION.height,
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
                        <stop offset="0%" stopColor="rgb(235,210,150)" />
                        <stop offset="40%" stopColor="rgb(200,170,110)" />
                        <stop offset="100%" stopColor="rgb(140,100,55)" />
                    </radialGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill={`url(#${glowId})`}
                    style={{ filter: 'drop-shadow(0 0 50px rgba(180,150,90,0.5))' }}
                />
            </svg>
        </div>
    )
}
