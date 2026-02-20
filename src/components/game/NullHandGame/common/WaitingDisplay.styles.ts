import { tv } from 'tailwind-variants'

export const waitingDisplay = tv({
    slots: {
        root: 'flex flex-col h-full animate-in fade-in zoom-in duration-300 relative overflow-hidden',
        bgHand: 'absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none filter blur-[2px]',
        content: 'flex-1 flex flex-col items-center justify-center relative z-10 text-center',
        pulse: 'animate-pulse',
        engLabel: 'text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-mono uppercase',
        title: 'text-white text-4xl font-bold tracking-wider mb-2',
        subText: 'text-gray-600 text-xs font-mono tracking-[0.2em] uppercase',
    },
})
