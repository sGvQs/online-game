import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'

interface PhaseHeaderProps {
    engLabel: string
    title: string
    subLabel: string
    className?: string
}

export const PhaseHeader = ({ engLabel, title, subLabel, className }: PhaseHeaderProps) => {
    return (
        <div className={cn("text-center mb-8", className)}>
            <h2 className="text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-mono uppercase">{engLabel}</h2>
            <h3 className="text-white text-3xl font-bold tracking-wider">{title}</h3>
            <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] font-mono uppercase">{subLabel}</p>
        </div>
    )
}
