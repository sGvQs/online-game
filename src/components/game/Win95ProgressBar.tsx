'use client'

import React from 'react'

interface Win95ProgressBarProps {
    progress: number // 0-100
    label?: string
    className?: string
}

export function Win95ProgressBar({ progress, label, className = '' }: Win95ProgressBarProps) {
    // Calculate number of blocks (each block is about 8% of total)
    const blockCount = Math.floor(progress / 8)

    return (
        <div className={className}>
            {label && <div style={{ marginBottom: 8, color: '#000' }}>{label}</div>}
            <div className="win95-progress-container">
                <div className="win95-progress-bar">
                    {Array.from({ length: blockCount }).map((_, i) => (
                        <div key={i} className="win95-progress-block" />
                    ))}
                </div>
            </div>
        </div>
    )
}
