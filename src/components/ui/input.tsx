import { tv, type VariantProps } from 'tailwind-variants'
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const input = tv({
    base: 'flex h-10 w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50',
    variants: {
        error: {
            true: 'border-red-500 focus-visible:ring-red-500',
        },
    },
})

export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof input> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(input({ error, className }))}
                {...props}
            />
        )
    }
)
Input.displayName = 'Input'

export { Input, input }
