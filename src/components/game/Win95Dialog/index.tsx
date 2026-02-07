'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { win95Dialog } from './styles'
import { Win95Button } from '../Win95Button'

export type Win95IconType = 'error' | 'warning' | 'info' | 'question' | "lose"

interface Win95DialogProps {
    title: string
    icon?: Win95IconType
    children: React.ReactNode
    buttons?: {
        label: string
        onClick?: () => void
        primary?: boolean
    }[]
    titlebarButtons?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    innerClassName?: 'default' | 'error'
}

function Win95Icon({ type }: { type: Win95IconType }) {
    const styles = win95Dialog()
    const iconClass = type === 'lose' ? styles.iconLose() : styles.icon()
    
    switch (type) {
        case 'error':
            return (
                <div className={iconClass}>
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" strokeWidth="2" />
                        <path d="M10 10L22 22M22 10L10 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>
            )
        case 'warning':
            return (
                <div className={iconClass}>
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L30 28H2L16 2Z" fill="#ffff00" stroke="#808000" strokeWidth="1" />
                        <text x="16" y="24" textAnchor="middle" fill="#000" fontWeight="bold" fontSize="18">!</text>
                    </svg>
                </div>
            )
        case 'info':
            return (
                <div className={iconClass}>
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#0066cc" stroke="#003366" strokeWidth="2" />
                        <text x="16" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18" fontStyle="italic">i</text>
                    </svg>
                </div>
            )
        case 'question':
            return (
                <div className={iconClass}>
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#0066cc" stroke="#003366" strokeWidth="2" />
                        <text x="16" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="16">?</text>
                    </svg>
                </div>
            )
        case 'lose':
            return (
                <div className={iconClass}>
                    <Image 
                        src="/images/telling-you-lose.svg" 
                        alt="Lose" 
                        width={48} 
                        height={48}
                    />
                </div>
            )
    }
}

export function Win95Dialog({
    title,
    icon,
    children,
    buttons,
    titlebarButtons,
    className = '',
    style,
    innerClassName = 'default',
}: Win95DialogProps) {
    const styles = win95Dialog()
    const innerClass = innerClassName === 'error' ? styles.innerError() : styles.inner()
    
    return (
        <div className={cn(styles.wrapper(), className)} style={style}>
            <div className={innerClass}>
                {/* Title Bar */}
                <div className={styles.titlebar()}>
                    <span className={styles.titlebarText()}>{title}</span>
                    {titlebarButtons && (
                        <div className={styles.titlebarButtons()}>
                            {titlebarButtons}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className={styles.content()}>
                    {icon && <Win95Icon type={icon} />}
                    <div className={styles.message()}>{children}</div>
                </div>

                {/* Buttons */}
                {buttons && buttons.length > 0 && (
                    <div className={styles.buttonGroup()}>
                        {buttons.map((btn, idx) => (
                            <Win95Button
                                key={idx}
                                onClick={btn.onClick}
                                autoFocus={btn.primary}
                            >
                                {btn.label}
                            </Win95Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
