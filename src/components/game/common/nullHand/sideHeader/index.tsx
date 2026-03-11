import { sideHeader } from './styles'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/typography'

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
                <Typography variant="h4" as="h2" className={styles.engLabel()}>{engLabel}</Typography>
                <Typography variant="h3" className={styles.label()}>{label}</Typography>
            </div>
            {badge && (
                <Typography variant="label" as="span" className={styles.badge()}>{badge}</Typography>
            )}
        </div>
    )
}
