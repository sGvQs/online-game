import { tv } from 'tailwind-variants'

export const annoyingDinosaurStyles = tv({
    slots: {
        wrapper: 'fixed bottom-0 z-0 flex items-end pointer-events-none',
        innerRow: 'flex items-start gap-2',
        imageWrapper: 'relative w-14 h-14 sm:w-16 sm:h-16 shrink-0',
        speechBubble: 'relative px-2.5 py-1.5 rounded-xl border border-white bg-white text-black text-[10px] font-medium shadow-sm',
        speechTail: 'absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-white',
        cursor: 'inline-block w-0.5 h-3 ml-0.5 bg-current animate-pulse',
    },
    variants: {
        fromBottom: {
            true: {
                wrapper: 'left-1/2',
                innerRow: 'min-w-[280px]',
            },
            false: {
                wrapper: 'left-0',
            },
        },
    },
})

export const rotateFlowStyles = tv({
    slots: {
        wrapper: 'fixed left-1/2 top-1/2 z-0 pointer-events-none',
        row: 'flex items-end gap-2',
        imageWrapper: 'relative w-14 h-14 sm:w-16 sm:h-16 shrink-0',
        bubble: 'shrink-0 mb-2 px-2.5 py-1.5 rounded-xl border border-white bg-white text-black text-[10px] font-medium shadow-sm max-w-[400px]',
    },
})

export const suckedInStyles = tv({
    slots: {
        wrapper: 'fixed left-1/2 top-0 z-0 pointer-events-none',
        row: 'flex items-end gap-2',
        imageWrapper: 'relative w-14 h-14 sm:w-16 sm:h-16 shrink-0',
        bubble: 'shrink-0 mb-1 px-2.5 py-1.5 rounded-xl border border-white bg-white text-black text-[10px] font-medium shadow-sm',
    },
})
