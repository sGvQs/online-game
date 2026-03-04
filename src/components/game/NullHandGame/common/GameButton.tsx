'use client'
import { gameButton } from './gameButton.styles'
import { useSE } from '@/hooks/useSE'

import { motion } from 'framer-motion'

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'cyan'
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
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={gameButton({ variant, size, fullWidth, className })}
            onClick={(e) => {
                if (variant === 'danger' || variant === 'primary') {
                    play('submit')
                } else {
                    play('select')
                }
                if (onClick) onClick(e as any)
            }}
            {...props as any}
        >
            {children}
        </motion.button>
    )
}
