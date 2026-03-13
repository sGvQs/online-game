'use client'

import { useState } from 'react'

export function LevelProgressionBarChart({
    values,
    currentLevel,
    maxLevel,
    color,
    formatValue,
    title = 'レベル推移',
}: {
    values: number[]
    currentLevel: number
    maxLevel: number
    color: string
    formatValue: (v: number, level: number) => string
    title?: string
}) {
    const [hoveredLevel, setHoveredLevel] = useState<number | null>(null)
    const barCount = Math.min(values.length, maxLevel)
    const maxVal = Math.max(...values, 1)
    const w = barCount <= 5 ? 220 : Math.min(320, 40 + barCount * 26)
    const h = 100
    const padding = { left: 28, right: 8, top: 4, bottom: 22 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom
    const barGap = 4
    const barTotalW = barCount > 0 ? (chartW - barGap * (barCount - 1)) / barCount : 0

    return (
        <div className="flex flex-col items-center gap-2 relative">
            <p className="text-indigo-400 text-[12px] font-bold font-dot-gothic-16 tracking-wider">
                {title}
            </p>
            <svg width={w} height={h} className="shrink-0 overflow-visible">
                {Array.from({ length: barCount }).map((_, i) => {
                    const level = i + 1
                    const val = values[i] ?? 0
                    const ratio = maxVal > 0 ? val / maxVal : 0
                    const barH = Math.max(2, ratio * chartH)
                    const x = padding.left + i * (barTotalW + barGap)
                    const y = padding.top + chartH - barH
                    const isCurrent = level === currentLevel
                    const isHovered = level === hoveredLevel
                    const barFill =
                        isHovered ? (isCurrent ? color : `${color}99`) : isCurrent ? color : 'rgba(255,255,255,0.18)'
                    const barStroke = isCurrent || isHovered ? color : 'transparent'
                    return (
                        <g key={level}>
                            <rect
                                x={x}
                                y={y}
                                width={barTotalW}
                                height={barH}
                                rx={3}
                                ry={3}
                                fill={barFill}
                                stroke={barStroke}
                                strokeWidth={1.5}
                                onMouseEnter={() => setHoveredLevel(level)}
                                onMouseLeave={() => setHoveredLevel(null)}
                                className="cursor-pointer"
                            />
                            <text
                                x={x + barTotalW / 2}
                                y={h - 6}
                                textAnchor="middle"
                                fontSize="9"
                                fill="rgba(255,255,255,0.6)"
                                fontFamily="var(--font-dot-gothic-16)"
                            >
                                Lv{level}
                            </text>
                        </g>
                    )
                })}
                {hoveredLevel !== null && hoveredLevel <= barCount && (
                    <g>
                        <rect
                            x={padding.left + (hoveredLevel - 1) * (barTotalW + barGap) + barTotalW / 2 - 36}
                            y={padding.top - 20}
                            width={72}
                            height={16}
                            rx={4}
                            ry={4}
                            fill="rgba(0,0,0,0.75)"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth={1}
                        />
                        <text
                            x={padding.left + (hoveredLevel - 1) * (barTotalW + barGap) + barTotalW / 2}
                            y={padding.top - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="white"
                            fontFamily="var(--font-dot-gothic-16)"
                        >
                            Lv{hoveredLevel}: {formatValue(values[hoveredLevel - 1] ?? 0, hoveredLevel)}
                        </text>
                    </g>
                )}
            </svg>
            {currentLevel > 0 && currentLevel <= barCount && (
                <p className="text-white text-[10px] font-dot-gothic-16">
                    現在 Lv{currentLevel}: {formatValue(values[currentLevel - 1] ?? 0, currentLevel)}
                </p>
            )}
        </div>
    )
}
