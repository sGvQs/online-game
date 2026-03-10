import { tv } from 'tailwind-variants'

export const authForm = tv({
    slots: {
        wrapper: [
            'w-full rounded-2xl px-8 py-8 flex flex-col items-center gap-6',
            'bg-brand-500/5 border border-brand-500/18',
            'shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl',
        ],
        header: 'text-center',
        headerTitle: 'text-xl text-white font-cherry-bomb-one',
        headerSub: 'mt-1.5 text-[10px] text-brand-700 font-dot-gothic-16',
        separator: 'w-full h-px bg-brand-500/10',
        errorBox: 'w-full p-3 bg-red-900/40 text-red-300 border border-red-700/50 rounded-xl text-[11px] font-dot-gothic-16',
        googleButton: [
            'w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full',
            'text-sm font-semibold tracking-wide text-white font-dot-gothic-16',
            'transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none',
            'bg-[linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))]',
            'border border-brand-500/40',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
            'hover:shadow-[0_0_20px_rgba(129,140,248,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]',
        ],
        legalText: 'text-[10px] text-center text-brand-700/60 leading-relaxed font-dot-gothic-16',
        legalLink: 'hover:text-brand-500 transition-colors underline underline-offset-2',
    },
})
