import { phaseHeader } from './PhaseHeader.styles'
import { cn } from '@/lib/utils'

interface PhaseHeaderProps {
    engLabel: string
    title: string
    subLabel: string
    className?: string
}

export const PhaseHeader = ({ engLabel, title, subLabel, className }: PhaseHeaderProps) => {
    const styles = phaseHeader()
    return (
        <div className={cn(styles.root(), className)}>
            <h2 className={styles.engLabel()}>{engLabel}</h2>
            <h3 className={styles.title()}>{title}</h3>
            <p className={styles.subLabel()}>{subLabel}</p>
        </div>
    )
}
