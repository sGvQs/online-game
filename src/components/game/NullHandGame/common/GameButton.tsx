import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
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
    const styles = nullHandGame()
    const { play } = useSE()

    const variantStyles = {
        primary: styles.buttonPrimary(),
        secondary: "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600",
        danger: "bg-[#1a0505] border-[#FF4444] text-[#FF4444] hover:bg-[#FF4444] hover:text-black",
    }

    const sizeStyles = {
        sm: "px-4 py-1 text-sm",
        md: "", // Default from styles.button()
        lg: "px-16 py-4 text-lg",
    }

    return (
        <button
            className={cn(
                styles.button(),
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && "w-full",
                className
            )}
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
