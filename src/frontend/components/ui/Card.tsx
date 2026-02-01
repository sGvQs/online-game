import { tv, type VariantProps } from 'tailwind-variants'
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/frontend/lib/utils'

const card = tv({
    base: 'rounded-xl border border-brand-200 bg-white text-brand-950 shadow-sm',
    variants: {
        padding: {
            none: 'p-0',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        },
    },
    defaultVariants: {
        padding: 'md',
    },
})

export interface CardProps
    extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, padding, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(card({ padding, className }))}
                {...props}
            />
        )
    }
)
Card.displayName = 'Card'

export { Card, card }
