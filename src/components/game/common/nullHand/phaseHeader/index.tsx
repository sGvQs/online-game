import { phaseHeader } from './styles'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/typography'

interface PhaseHeaderProps {
    engLabel: string
    title: string
    subLabel: string
    className?: string
    currentTurn?: number
    totalTurns?: number
    titleVariant?: 'cyan' | 'red'
}

export const PhaseHeader = ({ engLabel, title, subLabel, className, currentTurn, totalTurns, titleVariant = 'cyan' }: PhaseHeaderProps) => {
    const styles = phaseHeader()
    return (
        <div className={cn(styles.root(), className, "relative")}>
            {currentTurn !== undefined && totalTurns !== undefined && (
                <div className="absolute top-0 right-0 font-mono text-[10px] tracking-widest text-[#44FFFF]/50 bg-[#44FFFF]/5 px-2 py-0.5 border border-[#44FFFF]/20">
                    ROUND <span className="text-[#44FFFF]">{String(currentTurn).padStart(2, '0')}</span> / {String(totalTurns).padStart(2, '0')}
                </div>
            )}
            <Typography variant="h4" as="h2" className={styles.engLabel()}>{engLabel}</Typography>
            <Typography variant="h3" className={cn(styles.title(), titleVariant === 'red' && "text-[#FF4444]")}>{title}</Typography>
            <Typography variant="small" className={cn(styles.subLabel(), titleVariant === 'red' && "text-[#FF4444]")}>{subLabel}</Typography>
        </div>
    )
}
