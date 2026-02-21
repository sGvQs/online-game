import { SideHeader } from './SideHeader'
import { sideCard } from '../phases/phaseCard.styles'

interface RewardSystemProps {
    guestCount: number
    variant?: 'cyan' | 'red'
    size?: 'sm' | 'md' | 'lg'
}

export function RewardSystem({
    guestCount,
    variant = 'red',
    size = 'md'
}: RewardSystemProps) {
    const rules = [
        { title: 'NULL HAND', desc: '全員があいこ', show: guestCount >= 2, pts: '+5', target: 'HOST', color: '#44FFFF' },
        { title: 'GUEST WIN', desc: 'ホストに勝利', show: true, pts: '+3', target: 'GUEST', color: '#FF4444' },
        { title: 'HOST PERFECT', desc: 'ゲスト全員を撃破', show: guestCount >= 2, pts: '+3', target: 'HOST', color: '#44FFFF' },
        { title: 'DRAW', desc: '上記以外（勝ち・負け混在など）', show: true, pts: '0', target: 'ALL', color: '#666666' },
    ]

    return (
        <div className={sideCard({ variant, size }).card()}>
            <SideHeader
                engLabel="REWARD SYSTEM"
                label="ポイント配当"
                variant={variant}
                className={variant === 'red' ? "border-[#FF4444]/30" : "border-[#44FFFF]/30"}
                compact
            />
            <div className="mt-4 space-y-4">
                {rules.map((item) => item.show && (
                    <div key={item.title} className="group relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-1 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-[10px] font-black tracking-widest text-white/90 font-mono">
                                    {item.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                <span className="text-[8px] font-bold text-white/90 uppercase tracking-tighter">
                                    {item.target}
                                </span>
                                <span className="text-xs font-black font-mono tabular-nums" style={{ color: item.color }}>
                                    {item.pts}<span className="text-[8px] ml-0.5 opacity-70">PT</span>
                                </span>
                            </div>
                        </div>
                        <div className="text-[9px] text-white/50 font-bold pl-3 leading-tight tracking-tight">
                            {item.desc}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
