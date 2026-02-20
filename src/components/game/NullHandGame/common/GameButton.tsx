'use client'
import { gameButton } from './GameButton.styles'
import { useSE } from '@/hooks/useSE'

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger'
    fullWidth?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export const GameButton = ({
    className,
    variant = 'primary',
    fullWidth = false,
    size = 'md',
    children,
    onClick,
    ...props
}: GameButtonProps) => {
    const { play } = useSE()

    return (
        <button
            className={gameButton({ variant, size, fullWidth, className })}
            onClick={(e) => {
                play('select')
                if (onClick) onClick(e)
            }}
            {...props}
        >
            {children}
        </button>
    )
}
