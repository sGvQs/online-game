'use client'

import { GroundSolaris } from './GroundSolaris'

/** シード付き擬似乱数（再現性あり） */
function seededRandom(seed: number) {
    return () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed / 0x7fffffff
    }
}

/** 草の葉を生成 - 楕円の上縁に沿って配置 */
function generateGrassBlades(seed: number, count: number) {
    const rnd = seededRandom(seed)
    const blades: { x: number; baseY: number; height: number; tilt: number }[] = []
    const cx = 600
    const rx = 950
    const ry = 280
    const cy = 420

    for (let i = 0; i < count; i++) {
        const t = rnd()
        const angle = Math.PI * 0.3 + t * Math.PI * 0.4
        const ex = cx + rx * Math.cos(angle)
        const ey = cy - ry * Math.sin(angle)
        blades.push({
            x: ex,
            baseY: ey,
            height: 4 + rnd() * 12,
            tilt: (rnd() - 0.5) * 0.4,
        })
    }
    return blades
}

const GRASS_BLADES = generateGrassBlades(123, 120)

export function MoonGround() {
    return (
        <>
        <svg
            className="fixed left-0 right-0 bottom-0 w-full pointer-events-none"
            style={{ height: '30vh' }}
            viewBox="0 0 1200 200"
            preserveAspectRatio="xMidYMax meet"
        >
            <defs>
                {/* 地面の凹凸＋うっすらテクスチャ */}
                <filter id="groundBumpyFilter" x="-15%" y="-15%" width="130%" height="130%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.025 0.05"
                        numOctaves="5"
                        result="noise"
                        seed="7"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="6"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="bumpy"
                    />
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05 0.08"
                        numOctaves="3"
                        result="grain"
                        seed="42"
                    />
                    <feColorMatrix in="grain" type="saturate" values="0" result="grayGrain" />
                    <feComponentTransfer in="grayGrain" result="softGrain">
                        <feFuncR type="linear" slope="0.2" intercept="0.5" />
                        <feFuncG type="linear" slope="0.2" intercept="0.5" />
                        <feFuncB type="linear" slope="0.2" intercept="0.5" />
                        <feFuncA type="linear" slope="0.015" intercept="0.49" />
                    </feComponentTransfer>
                    <feBlend in="bumpy" in2="softGrain" mode="soft-light" result="withTexture" />
                </filter>
                {/* 左暗め〜右明るめのグラデーション */}
                <linearGradient id="groundGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#2a4020" />
                    <stop offset="35%" stopColor="#3d6b2a" />
                    <stop offset="65%" stopColor="#4d8a35" />
                    <stop offset="100%" stopColor="#6fc04a" />
                </linearGradient>
                <clipPath id="groundClip">
                    <ellipse cx="600" cy="420" rx="950" ry="280" />
                </clipPath>
                {/* 草のグラデーション（左暗め〜右明るめ） */}
                <linearGradient id="grassGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#3a5c28" />
                    <stop offset="50%" stopColor="#4d8a35" />
                    <stop offset="100%" stopColor="#5da840" />
                </linearGradient>
            </defs>
            <g
                clipPath="url(#groundClip)"
                style={{
                    animation: 'moonScroll 240s ease-in-out infinite alternate',
                }}
            >
                {/* 土・草地のベース */}
                <ellipse
                    cx="600"
                    cy="420"
                    rx="950"
                    ry="280"
                    fill="url(#groundGradient)"
                    filter="url(#groundBumpyFilter)"
                />
                {/* 草の葉 */}
                <g fill="none" stroke="url(#grassGradient)" strokeWidth="0.8" strokeLinecap="round">
                    {GRASS_BLADES.map((b, i) => (
                        <path
                            key={i}
                            d={`M ${b.x} ${b.baseY} Q ${b.x + b.tilt * b.height * 3} ${b.baseY - b.height * 0.6} ${b.x + b.tilt * b.height} ${b.baseY - b.height}`}
                            opacity={0.85}
                        />
                    ))}
                </g>
            </g>
        </svg>
        <GroundSolaris />
    </>
    )
}
