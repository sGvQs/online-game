import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ICONS } from '@/constants/starShieldGame/constants'

export function SkillCard({
    title,
    jurisdiction,
    children,
}: {
    title: string
    jurisdiction: 'attack' | 'defence'
    children: React.ReactNode
}) {
    const isAttack = jurisdiction === 'attack'
    return (
        <div
            className={cn(
                'rounded-2xl p-5 bg-white/2 border flex flex-col gap-3',
                isAttack ? 'border-indigo-500/20' : 'border-emerald-500/20'
            )}
        >
            <div className="flex items-center justify-between">
                <p
                    className={cn(
                        'text-[13px] font-bold tracking-wider font-dot-gothic-16',
                        isAttack ? 'text-indigo-400' : 'text-emerald-400'
                    )}
                >
                    {title}
                </p>
                <span
                    className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border tracking-wide font-dot-gothic-16',
                        isAttack
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    )}
                >
                    <span className="flex items-center gap-1">
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
