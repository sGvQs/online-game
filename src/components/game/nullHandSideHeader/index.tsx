import { sideHeader } from './styles'
import { cn } from '@/lib/utils'

interface SideHeaderProps {
    engLabel: string
    label: string
    className?: string
    badge?: string
    variant?: 'cyan' | 'red'
    compact?: boolean
}

export const SideHeader = ({ engLabel, label, className, badge, variant = 'cyan', compact = false }: SideHeaderProps) => {
    const styles = sideHeader({ variant, compact })
    return (
        <div className={cn(styles.root(), className)}>
            <div>
                <h2 className={styles.engLabel()}>{engLabel}</h2>
                <h3 className={styles.label()}>{label}</h3>
            </div>
            {badge && (
                <span className={styles.badge()}>{badge}</span>
            )}
        </div>
    )
}
