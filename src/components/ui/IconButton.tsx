'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/lib/utils'
import { Tooltip } from './Tooltip'

const iconButton = tv({
    base: [
        'inline-flex items-center justify-center rounded-lg transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'disabled:pointer-events-none disabled:opacity-50',
        // Default state - slightly muted
        'text-brand-600 opacity-70',
        // Hover state - glow effect
        'hover:opacity-100 hover:text-brand-900',
    ],
    variants: {
        variant: {
            default: 'hover:bg-brand-100/20 hover:shadow-[0_0_15px_rgba(129,140,248,0.4)]',
            danger: 'text-red-400 opacity-70 hover:opacity-100 hover:text-red-300 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]',
            success: 'text-green-400 opacity-70 hover:opacity-100 hover:text-green-300 hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]',
            ghost: 'hover:bg-white/5',
        },
        size: {
            sm: 'w-8 h-8 p-1.5',
            md: 'w-10 h-10 p-2',
            lg: 'w-12 h-12 p-2.5',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
    },
})

export interface IconButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButton> {
    icon: ReactNode
    tooltip: string
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, variant, size, icon, tooltip, tooltipPosition = 'top', ...props }, ref) => {
        return (
            <Tooltip content={tooltip} position={tooltipPosition}>
                <button
                    ref={ref}
                    className={cn(iconButton({ variant, size, className }))}
                    aria-label={tooltip}
                    {...props}
                >
                    {icon}
                </button>
            </Tooltip>
        )
    }
)
IconButton.displayName = 'IconButton'

export { IconButton, iconButton }
