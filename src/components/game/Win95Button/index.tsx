'use client'

import { ButtonHTMLAttributes, forwardRef, useState } from 'react'
import { type VariantProps } from 'tailwind-variants'
import { cn } from '@/lib/utils'
import { win95Button } from './styles'

export interface Win95ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof win95Button> {}

const Win95Button = forwardRef<HTMLButtonElement, Win95ButtonProps>(
  ({ className, pressed, disabled, focused, children, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false)
    
    return (
      <button
        ref={ref}
        className={cn(win95Button({ pressed: pressed || isPressed, disabled, focused, className }))}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Win95Button.displayName = 'Win95Button'

export { Win95Button }
