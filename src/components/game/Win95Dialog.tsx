'use client'

import React from 'react'

export type Win95IconType = 'error' | 'warning' | 'info' | 'question'

interface Win95DialogProps {
    title: string
    icon?: Win95IconType
    children: React.ReactNode
    buttons?: {
        label: string
        onClick?: () => void
        primary?: boolean
    }[]
    className?: string
    style?: React.CSSProperties
}

function Win95Icon({ type }: { type: Win95IconType }) {
    switch (type) {
        case 'error':
            return (
                <div className="win95-dialog-icon">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" strokeWidth="2" />
                        <path d="M10 10L22 22M22 10L10 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>
            )
        case 'warning':
            return (
                <div className="win95-dialog-icon">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L30 28H2L16 2Z" fill="#ffff00" stroke="#808000" strokeWidth="1" />
                        <text x="16" y="24" textAnchor="middle" fill="#000" fontWeight="bold" fontSize="18">!</text>
                    </svg>
                </div>
            )
        case 'info':
            return (
                <div className="win95-dialog-icon">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#0066cc" stroke="#003366" strokeWidth="2" />
                        <text x="16" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18" fontStyle="italic">i</text>
                    </svg>
                </div>
            )
        case 'question':
            return (
                <div className="win95-dialog-icon">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#0066cc" stroke="#003366" strokeWidth="2" />
                        <text x="16" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="16">?</text>
                    </svg>
                </div>
            )
    }
}

export function Win95Dialog({
    title,
    icon,
    children,
    buttons,
    className = '',
    style
}: Win95DialogProps) {
    return (
        <div className={`win95-dialog ${className}`} style={style}>
            <div className="win95-dialog-inner">
                {/* Title Bar */}
                <div className="win95-titlebar">
                    <span className="win95-titlebar-text">{title}</span>
                </div>

                {/* Content */}
                <div className="win95-dialog-content">
                    {icon && <Win95Icon type={icon} />}
                    <div className="win95-dialog-message">{children}</div>
                </div>

                {/* Buttons */}
                <div className="win95-button-group">
                    {buttons?.map((btn, idx) => (
                        <button
                            key={idx}
                            className="win95-button"
                            onClick={btn.onClick}
                            autoFocus={btn.primary}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
