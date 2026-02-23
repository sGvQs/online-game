import { phaseHeader } from './PhaseHeader.styles'
import { cn } from '@/lib/utils'

interface PhaseHeaderProps {
    engLabel: string
    title: string
    subLabel: string
    className?: string
    currentTurn?: number
    totalTurns?: number
}

export const PhaseHeader = ({ engLabel, title, subLabel, className, currentTurn, totalTurns }: PhaseHeaderProps) => {
    const styles = phaseHeader()
    return (
        <div className={cn(styles.root(), className, "relative")}>
            {currentTurn !== undefined && totalTurns !== undefined && (
                <div className="absolute top-0 right-0 font-mono text-[10px] tracking-widest text-[#44FFFF]/50 bg-[#44FFFF]/5 px-2 py-0.5 border border-[#44FFFF]/20">
                    ROUND <span className="text-[#44FFFF]">{String(currentTurn).padStart(2, '0')}</span> / {String(totalTurns).padStart(2, '0')}
                </div>
            )}
            <h2 className={styles.engLabel()}>{engLabel}</h2>
            <h3 className={styles.title()}>{title}</h3>
            <p className={styles.subLabel()}>{subLabel}</p>
        </div>
    )
}
