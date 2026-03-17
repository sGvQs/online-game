'use client'

import { forwardRef, useState } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WIN95_PRESSED = 'border-t-[#808080] border-l-[#808080] border-r-white border-b-white pt-px pr-[11px] pb-0 pl-[13px]'
const WIN95_FOCUSED = 'outline-1 outline-dotted outline-black outline-offset-[-4px]'

export interface Win95ButtonProps extends Omit<ButtonProps, 'screen'> {
    pressed?: boolean
    focused?: boolean
}

const Win95Button = forwardRef<HTMLButtonElement, Win95ButtonProps>(
    ({ pressed, focused, className, onMouseDown, onMouseUp, onMouseLeave, ...props }, ref) => {
        const [isPressed, setIsPressed] = useState(false)

        return (
            <Button
                ref={ref}
                screen="error-hunter"
                className={cn(
                    (pressed || isPressed) && WIN95_PRESSED,
                    focused && WIN95_FOCUSED,
                    className,
                )}
                // onMouseLeave はホバー効果ではなく「ボタン押下中にマウスが離れた際のプレス状態キャンセル」用
                onMouseDown={(e) => { setIsPressed(true); onMouseDown?.(e) }}
                onMouseUp={(e) => { setIsPressed(false); onMouseUp?.(e) }}
                onMouseLeave={(e) => { setIsPressed(false); onMouseLeave?.(e) }}
                {...props}
            />
        )
    }
)
Win95Button.displayName = 'Win95Button'

export { Win95Button }
