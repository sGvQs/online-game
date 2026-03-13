import { type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export function SkillRow({
    label,
    detail,
    currentLevel,
    maxLevel,
    onClick,
    progressBarColor,
}: {
    label: React.ReactNode
    detail?: string
    currentLevel?: number
    maxLevel?: number
    onClick?: () => void
    progressBarColor: string
}) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-center justify-between gap-3 py-2.5 border-b border-white/4 last:border-0 hover:bg-white/4 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-white/85 text-sm">{label}</span>
                    {detail && (
                        <span className="text-white/30 text-[10px] font-dot-gothic-16">{detail}</span>
                    )}
                    {currentLevel !== undefined && maxLevel !== undefined && (
                        <div className="w-full mt-1.5 relative flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 w-(--progress) bg-(--bar-color)"
                                    style={{
                                        '--progress': `${(currentLevel / maxLevel) * 100}%`,
                                        '--bar-color': progressBarColor,
                                    } as CSSProperties}
                                />
                            </div>
                            <span className="text-[10px] tracking-wider text-white/40 font-dot-gothic-16 shrink-0 w-8 text-right">
                                {currentLevel}/{maxLevel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {currentLevel === 0 ? (
                <span className="text-[10px] text-white/40 shrink-0 font-dot-gothic-16 border border-white/20 bg-white/5 px-2 py-0.5 rounded tracking-widest">
                    未入手
                </span>
            ) : currentLevel === maxLevel ? (
                <span className="text-[10px] text-amber-300 shrink-0 font-dot-gothic-16 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded tracking-widest">
                    MAX
                </span>
            ) : (
                <span className="text-[10px] text-white/70 shrink-0 font-dot-gothic-16 border border-white/10 bg-white/5 px-2 py-0.5 rounded tracking-widest">
                    Lv {currentLevel}
                </span>
            )}
        </button>
    )
}
