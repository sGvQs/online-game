import { tv } from 'tailwind-variants'

export const userProfileStyles = tv({
    slots: {
        title: 'text-xl font-bold mb-2',
        pre: 'bg-brand-900 text-brand-100 p-2 rounded mb-4 text-xs font-mono overflow-auto',
        actions: 'flex gap-2 items-center',
        input: 'bg-brand-100 text-brand-900 placeholder:text-brand-700 border-brand-400 focus-visible:ring-brand-700 flex-1',
    },
})
