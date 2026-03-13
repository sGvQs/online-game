import Image from 'next/image'
import { cn } from '@/lib/utils'

export function SectionDivider({
    icon,
    label,
    color,
    desc,
}: {
    icon: string
    label: string
    color: 'indigo' | 'emerald'
    desc: string
}) {
    return (
        <div className="flex items-center gap-2 mt-2">
            <Image src={icon} alt={label} width={18} height={18} className="opacity-80 shrink-0" />
            <span
                className={cn(
                    'font-bold font-cherry-bomb-one text-sm shrink-0',
                    color === 'indigo' ? 'text-indigo-400' : 'text-emerald-400'
                )}
            >
                {label}
            </span>
            <span className="text-white/30 text-xs font-dot-gothic-16 shrink-0">{desc}</span>
            <div className="flex-1 h-px bg-white/8 ml-1" />
        </div>
    )
}
