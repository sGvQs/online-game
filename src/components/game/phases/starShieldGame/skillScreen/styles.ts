import { tv } from 'tailwind-variants'

export const skillScreenStyles = tv({
    slots: {
        root: 'flex flex-col gap-6 pb-8',
        loadoutSection: 'rounded-2xl p-5 bg-white/2 border border-white/8 flex flex-col gap-3',
        loadoutTitle: 'text-[11px] font-bold tracking-[0.2em] text-white/30 font-dot-gothic-16',
        loadoutRow: 'flex items-center gap-3',
        typingCount: 'text-2xl font-bold font-cherry-bomb-one text-white',
        tabSwitcher: 'flex rounded-2xl overflow-hidden border border-white/8 mb-4',
        tabDivider: 'w-px bg-white/8',
        tabContent: 'flex flex-col gap-4',
    },
})

export const skillCardStyles = tv({
    slots: {
        root: 'rounded-2xl p-5 bg-white/2 border flex flex-col gap-3',
        header: 'flex items-center justify-between',
        title: 'text-[13px] font-bold tracking-wider font-dot-gothic-16',
        badge: 'text-[10px] px-2 py-0.5 rounded-full border tracking-wide font-dot-gothic-16',
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
        levelBarFill: 'h-full rounded-full transition-all duration-700',
        levelText: 'text-[10px] tracking-wider text-white/40 font-dot-gothic-16 shrink-0 w-8 text-right',
        badgeNotOwned: 'text-[10px] text-white/40 shrink-0 font-dot-gothic-16 border border-white/20 bg-white/5 px-2 py-0.5 rounded tracking-widest',
        badgeMaxed: 'text-[10px] text-amber-300 shrink-0 font-dot-gothic-16 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded tracking-widest',
        badgeLevel: 'text-[10px] text-white/70 shrink-0 font-dot-gothic-16 border border-white/10 bg-white/5 px-2 py-0.5 rounded tracking-widest',
    },
    variants: {
        color: {
            indigo: { levelBarFill: 'bg-indigo-400' },
            emerald: { levelBarFill: 'bg-emerald-400' },
        },
    },
})

export const tabButtonStyles = tv({
    base: 'flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all duration-300',
    variants: {
        tab: {
            attack: '',
            defence: '',
        },
        active: {
            true: '',
            false: 'bg-white/2 text-white/35 hover:text-white/55 hover:bg-white/4',
        },
    },
    compoundVariants: [
        {
            tab: 'attack',
            active: true,
            class: 'bg-indigo-700/70 text-indigo-100 shadow-[inset_0_0_30px_rgba(99,102,241,0.2)]',
        },
        {
            tab: 'defence',
            active: true,
            class: 'bg-emerald-800/70 text-emerald-100 shadow-[inset_0_0_30px_rgba(16,185,129,0.2)]',
        },
    ],
})

export const maxedMessageStyles = tv({
    slots: {
        root: 'flex items-center gap-2 py-2.5',
        icon: 'text-amber-400 text-base',
        text: 'text-amber-400/80 text-sm font-dot-gothic-16',
    },
})
