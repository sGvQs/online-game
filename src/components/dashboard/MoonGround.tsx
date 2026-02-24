'use client'

import { GroundSolaris } from './GroundSolaris'

/** シード付き擬似乱数（再現性あり） */
function seededRandom(seed: number) {
    return () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed / 0x7fffffff
    }
}

/** 楕円のSVG path（中心・半径指定） */
function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
    return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 1 ${2 * rx} 0 a ${rx} ${ry} 0 1 1 ${-2 * rx} 0`
}

/**
 * 🌛風の影 - 大きい影楕円の内側に、小さい光の楕円が入り込んでC型の影に
 * 影＝内側の暗い部分、光＝外側の三日月（黒が囲まず、影が内側に）
 */
function crescentPath(cx: number, cy: number, rx: number, ry: number) {
    // 大きい影楕円（クレーター内の影の領域・右下寄り）
    const shadowCx = cx + rx * 0.25
    const shadowCy = cy + ry * 0.3
    const shadowRx = rx * 0.85
    const shadowRy = ry * 0.9
    // 小さい光の楕円（左上から入り込む＝切り抜く部分）
    const lightCx = cx - rx * 0.4
    const lightCy = cy - ry * 0.35
    const lightRx = rx * 0.55
    const lightRy = ry * 0.6

    const outer = ellipsePath(shadowCx, shadowCy, shadowRx, shadowRy)
    const inner = ellipsePath(lightCx, lightCy, lightRx, lightRy)
    return `${outer} ${inner}`
}

/** 月面のクラスター（クレーター風）を生成 - ランダムな大きさ・位置・小さめ多め */
function generateClusters(seed: number, count: number) {
    const rnd = seededRandom(seed)
    const clusters: { cx: number; cy: number; rx: number; ry: number }[] = []

    for (let i = 0; i < count; i++) {
        const baseSize = 1.5 + rnd() * 6
        clusters.push({
            cx: 80 + rnd() * 1040,
            cy: 150 + rnd() * 55,
            rx: baseSize * (0.6 + rnd() * 0.6),
            ry: baseSize * (0.25 + rnd() * 0.4),
        })
    }
    return clusters
}

const CLUSTERS = generateClusters(420, 140)

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
                {/* 微細なぼこぼこテクスチャ用フィルター */}
                <filter id="moonBumpyFilter" x="-12%" y="-12%" width="124%" height="124%">
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
                        scale="8"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
                <radialGradient id="moonGroundGradient" cx="50%" cy="100%" r="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="30%" stopColor="#cbd5e1" />
                    <stop offset="55%" stopColor="#94a3b8" />
                    <stop offset="80%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#475569" />
                </radialGradient>
                <clipPath id="moonClip">
                    <ellipse cx="600" cy="420" rx="950" ry="280" />
                </clipPath>
                {/* 凹み（クレーター）用 - 中心暗く・縁明るく */}
                {CLUSTERS.map((c, i) => (
                    <radialGradient
                        key={`grad-${i}`}
                        id={`craterGrad-${i}`}
                        cx="50%"
                        cy="55%"
                        r="50%"
                        fx="48%"
                        fy="42%"
                    >
                        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
                        <stop offset="30%" stopColor="#334155" stopOpacity="0.6" />
                        <stop offset="55%" stopColor="#475569" stopOpacity="0.35" />
                        <stop offset="80%" stopColor="#64748b" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                    </radialGradient>
                ))}
                {CLUSTERS.map((c, i) => (
                    <clipPath key={`clip-${i}`} id={`craterClip-${i}`}>
                        <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} />
                    </clipPath>
                ))}
            </defs>
            <g clipPath="url(#moonClip)">
                <ellipse
                    cx="600"
                    cy="420"
                    rx="950"
                    ry="280"
                    fill="url(#moonGroundGradient)"
                    filter="url(#moonBumpyFilter)"
                />
                {/* 凹んで見えるクラスター（クレーター風）+ C型の影で立体感 */}
                {CLUSTERS.map((c, i) => (
                    <g key={i}>
                        <ellipse
                            cx={c.cx}
                            cy={c.cy}
                            rx={c.rx}
                            ry={c.ry}
                            fill={`url(#craterGrad-${i})`}
                        />
                        {/* 🌛風の影（クレーター内にクリップ） */}
                        <g clipPath={`url(#craterClip-${i})`}>
                            <path
                                d={crescentPath(c.cx, c.cy, c.rx, c.ry)}
                                fill="#0f172a"
                                fillRule="evenodd"
                                opacity={0.78}
                            />
                        </g>
                    </g>
                ))}
            </g>
        </svg>
        <GroundSolaris />
    </>
    )
}
