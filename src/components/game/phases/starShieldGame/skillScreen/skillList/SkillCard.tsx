import Image from 'next/image'
import { ICONS } from '@/constants/starShieldGame/constants'
import { skillCardStyles } from './styles'

export function SkillCard({
    title,
    jurisdiction,
    children,
}: {
    title: string
    jurisdiction: 'attack' | 'defence'
    children: React.ReactNode
}) {
    const s = skillCardStyles({ jurisdiction })
    const isAttack = jurisdiction === 'attack'
    return (
        <div className={s.root()}>
            <div className={s.header()}>
                <p className={s.title()}>{title}</p>
                <span className={s.badge()}>
                    <span className={s.badgeInner()}>
                        <Image
                            src={isAttack ? ICONS.SHOOTER : ICONS.TYPIST}
                            alt=""
                            width={11}
                            height={11}
                            className="opacity-70"
                        />
                        {isAttack ? 'Shooter' : 'Typist'}
                    </span>
                </span>
            </div>
            {children}
        </div>
    )
}
