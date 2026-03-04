import { tv, type VariantProps } from 'tailwind-variants'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const button = tv({
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50',
    variants: {
        variant: {
            solid: 'bg-brand-600 text-white bg-brand-100 hover:bg-brand-700 shadow-sm',
            outline: 'border border-brand-200 hover:bg-brand-100 text-brand-900',
            ghost: 'hover:bg-brand-100 text-brand-900',
        },
        size: {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 py-2 text-sm',
            lg: 'h-12 px-8 text-base',
        },
        fullWidth: {
            true: 'w-full',
        },
    },
    defaultVariants: {
        variant: 'solid',
        size: 'md',
    },
})

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> { }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(button({ variant, size, fullWidth, className }))}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button, button }
