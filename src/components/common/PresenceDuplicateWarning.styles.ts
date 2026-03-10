import { tv } from 'tailwind-variants'

export const presenceDuplicateWarning = tv({
    slots: {
        banner: 'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4 bg-amber-500/95 text-amber-950 px-4 py-3 shadow-lg',
        message: 'text-sm font-medium',
        dismissButton: 'p-1 rounded hover:bg-amber-600/30',
    },
})
