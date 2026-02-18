import { cn } from '@/lib/utils'

interface SideHeaderProps {
    engLabel: string
    label: string
    className?: string
    badge?: string
    badgeColor?: string // default #FF4444 or #44FFFF based on context? Let's just pass class or string.
}

export const SideHeader = ({ engLabel, label, className, badge }: SideHeaderProps) => {
    return (
        <div className={cn("mb-4 border-b-2 border-[#44FFFF] pb-2", className)}>
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[#44FFFF] text-xs font-bold tracking-[0.2em] mb-1 uppercase">{engLabel}</h2>
                    <h3 className="text-white text-xl font-bold">{label}</h3>
                </div>
                {badge && (
                    <span className="bg-[#44FFFF] text-black px-1.5 py-0.5 rounded text-[10px] font-bold mb-1">{badge}</span>
                )}
            </div>
        </div>
    )
}
