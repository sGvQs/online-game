import Image from 'next/image'
import { sectionDividerStyles } from './styles'

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
    const s = sectionDividerStyles({ color })
    return (
        <div className={s.root()}>
            <Image src={icon} alt={label} width={18} height={18} className={s.icon()} />
            <span className={s.label()}>{label}</span>
            <span className={s.desc()}>{desc}</span>
            <div className={s.divider()} />
        </div>
    )
}
