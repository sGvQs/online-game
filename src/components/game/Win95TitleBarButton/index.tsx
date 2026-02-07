'use client'

import { ButtonHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { win95Dialog } from '../Win95Dialog/styles'

export interface Win95TitleBarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Win95TitleBarButton = forwardRef<HTMLButtonElement, Win95TitleBarButtonProps>(
  ({ className, children, ...props }, ref) => {
    const styles = win95Dialog()
    const [isActive, setIsActive] = useState(false)
    
    return (
      <button
        ref={ref}
        className={cn(
          styles.titlebarBtn(),
          isActive && 'border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#a0a0a0]',
          className
        )}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onMouseLeave={() => setIsActive(false)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Win95TitleBarButton.displayName = 'Win95TitleBarButton'

export { Win95TitleBarButton }
