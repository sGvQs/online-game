import { tv } from 'tailwind-variants'

export const dashboardHeaderProfile = tv({
    slots: {
        wrapper: 'flex items-center gap-2',
        bubble: 'relative px-2.5 py-1 rounded-lg border border-brand-200/20 bg-brand-300 text-white text-[10px] font-medium shadow-sm max-w-[180px] shrink-0',
        bubbleText: 'font-dot-gothic-16 tracking-wide line-clamp-2 text-left block',
        bubbleTail: 'absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-brand-300',
        profileButton: [
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shrink-0',
            'bg-white/10 border border-brand-200/30',
            'hover:bg-brand-400/30 hover:border-brand-400/60',
            'hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
            'active:scale-[0.98]',
            'transition-all duration-300 cursor-pointer',
        ],
        avatarWrapper: 'relative w-8 h-8 rounded-full overflow-hidden',
    },
})
