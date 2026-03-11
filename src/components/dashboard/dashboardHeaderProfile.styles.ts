import { tv } from 'tailwind-variants'

export const dashboardHeaderProfile = tv({
    slots: {
        wrapper: 'flex items-center gap-2',
        bubble: 'relative px-2.5 py-1 rounded-lg border border-brand-200/20 bg-brand-300 text-white text-[10px] font-medium shadow-sm max-w-[180px] shrink-0',
        bubbleText: 'tracking-wide line-clamp-2 text-left block',
        bubbleTail: 'absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-brand-300',
        avatarWrapper: 'relative w-8 h-8 rounded-full overflow-hidden',
    },
})
