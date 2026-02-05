'use client'

import { ReactNode, useState } from 'react'

interface TooltipProps {
    children: ReactNode
    content: string
    position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    }

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-brand-100/90 border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-brand-100/90 border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-brand-100/90 border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-brand-100/90 border-y-transparent border-l-transparent',
    }

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
                >
                    <div className="relative px-2.5 py-1.5 text-xs font-medium text-brand-900 bg-brand-100/90 backdrop-blur-md rounded-lg shadow-lg border border-brand-200/50 whitespace-nowrap">
                        {content}
                        <div
                            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
