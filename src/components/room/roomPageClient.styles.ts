import { tv } from 'tailwind-variants'

export const roomPageClient = tv({
    slots: {
        layout: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
        mainArea: 'lg:col-span-2 space-y-4',
        sidebar: 'lg:col-span-1',
        errorModalContent: 'p-6 space-y-4',
        errorModalText: 'text-brand-800',
        errorModalSub: 'text-sm text-brand-600',
        errorModalActions: 'flex justify-center pt-4',
        errorModalButton: 'px-8 py-3 rounded-lg font-bold text-sm transition-all border bg-brand-500 text-white border-brand-600 hover:bg-brand-600',
    },
})
