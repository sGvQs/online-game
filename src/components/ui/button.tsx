import { tv, type VariantProps } from 'tailwind-variants'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const button = tv({
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50',
    variants: {
        variant: {
            solid: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
            outline: 'border border-brand-200 hover:bg-brand-100 text-brand-900',
            ghost: 'hover:bg-brand-100 text-brand-900',
            primary: 'bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-500 hover:to-purple-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(129,140,248,0.4)] hover:shadow-[0_0_30px_rgba(129,140,248,0.6)] transition-all',
            success: 'bg-green-600/90 text-green-50 border-2 border-green-500 hover:bg-green-500 hover:border-green-400 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.45)] transition-all rounded-2xl',
            danger: 'bg-red-600/90 text-red-50 border-2 border-red-500 hover:bg-red-500 hover:border-red-400 hover:scale-105 active:scale-95 transition-all',
        },
        size: {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 py-2 text-sm',
            lg: 'h-12 px-8 text-base',
            xl: 'h-14 px-10 text-lg',
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
