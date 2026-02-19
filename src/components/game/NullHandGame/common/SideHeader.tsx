import { cn } from '@/lib/utils'

interface SideHeaderProps {
    engLabel: string
    label: string
    className?: string
    badge?: string
    variant?: 'cyan' | 'red'
}

export const SideHeader = ({ engLabel, label, className, badge, variant = 'cyan' }: SideHeaderProps) => {
    const borderColor = variant === 'red' ? 'border-[#FF4444]' : 'border-[#44FFFF]'
    const textColor = variant === 'red' ? 'text-[#FF4444]' : 'text-[#44FFFF]'
    const badgeBg = variant === 'red' ? 'bg-[#FF4444]' : 'bg-[#44FFFF]'

    return (
        <div className={cn("mb-4 border-b-2 pb-2", borderColor, className)}>
            <div className="flex justify-between items-end">
                <div>
                    <h2 className={cn("text-xs font-bold tracking-[0.2em] mb-1 uppercase", textColor)}>{engLabel}</h2>
                    <h3 className="text-white text-xl font-bold">{label}</h3>
                </div>
                {badge && (
                    <span className={cn("text-black px-1.5 py-0.5 rounded text-[10px] font-bold mb-1", badgeBg)}>{badge}</span>
                )}
            </div>
        </div>
    )
}
