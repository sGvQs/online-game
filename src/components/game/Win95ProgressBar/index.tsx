'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { win95ProgressBar } from './styles'

interface Win95ProgressBarProps {
    progress: number // 0-100
    label?: string
    className?: string
}

export function Win95ProgressBar({ progress, label, className = '' }: Win95ProgressBarProps) {
    const styles = win95ProgressBar()
    // Calculate number of blocks (each block is about 8% of total)
    const blockCount = Math.floor(progress / 8)

    return (
        <div className={cn(styles.wrapper(), className)}>
            {label && <div className={styles.label()}>{label}</div>}
            <div className={styles.container()}>
                <div className={styles.bar()}>
                    {Array.from({ length: blockCount }).map((_, i) => (
                        <div key={i} className={styles.block()} />
                    ))}
                </div>
            </div>
        </div>
    )
}
