import { tv } from 'tailwind-variants'

export const skillCardStyles = tv({
    slots: {
        root: 'rounded-2xl p-5 bg-white/2 border flex flex-col gap-3',
        header: 'flex items-center justify-between',
        title: 'text-[13px] font-bold tracking-wider font-dot-gothic-16',
        badge: 'text-[10px] px-2 py-0.5 rounded-full border tracking-wide font-dot-gothic-16',
        badgeInner: 'flex items-center gap-1',
    },
    variants: {
        jurisdiction: {
            attack: {
                root: 'border-indigo-500/20',
                title: 'text-indigo-400',
                badge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
            },
            defence: {
                root: 'border-emerald-500/20',
                title: 'text-emerald-400',
                badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
            },
        },
    },
})

export const skillRowStyles = tv({
    slots: {
        root: 'w-full text-left flex items-center justify-between gap-3 py-2.5 border-b border-white/4 last:border-0 hover:bg-white/4 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group',
        labelCol: 'flex items-center gap-2 min-w-0 flex-1',
        labelInner: 'flex flex-col min-w-0 flex-1',
        labelText: 'text-white/85 text-sm',
        detailText: 'text-white/30 text-[10px] font-dot-gothic-16',
        levelBarWrapper: 'w-full mt-1.5 relative flex items-center gap-3',
        levelBarTrack: 'flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden',
        levelBarFill: 'h-full rounded-full transition-all duration-700 w-(--progress) bg-(--bar-color)',
        levelText: 'text-[10px] tracking-wider text-white/40 font-dot-gothic-16 shrink-0 w-8 text-right',
        badgeNotOwned: 'text-[10px] text-white/40 shrink-0 font-dot-gothic-16 border border-white/20 bg-white/5 px-2 py-0.5 rounded tracking-widest',
        badgeMaxed: 'text-[10px] text-amber-300 shrink-0 font-dot-gothic-16 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded tracking-widest',
        badgeLevel: 'text-[10px] text-white/70 shrink-0 font-dot-gothic-16 border border-white/10 bg-white/5 px-2 py-0.5 rounded tracking-widest',
    },
})

export const sectionDividerStyles = tv({
    slots: {
        root: 'flex items-center gap-2 mt-2',
        icon: 'opacity-80 shrink-0',
        label: 'font-bold font-cherry-bomb-one text-sm shrink-0',
        desc: 'text-white/30 text-xs font-dot-gothic-16 shrink-0',
        divider: 'flex-1 h-px bg-white/8 ml-1',
    },
    variants: {
        color: {
            indigo: { label: 'text-indigo-400' },
            emerald: { label: 'text-emerald-400' },
        },
    },
})

export const maxedMessageStyles = tv({
    slots: {
        root: 'flex items-center gap-2 py-2.5',
        icon: 'text-amber-400 text-base',
        text: 'text-amber-400/80 text-sm font-dot-gothic-16',
    },
})
