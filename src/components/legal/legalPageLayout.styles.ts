import { tv } from 'tailwind-variants'

export const legalPageLayoutStyles = tv({
    slots: {
        root: 'min-h-screen flex flex-col items-center p-8 bg-transparent',
        card: 'glass-card max-w-2xl w-full p-8 rounded-2xl mt-6 text-foreground',
        title: 'text-2xl font-bold mb-6 text-brand-900',
        body: 'max-w-none text-sm leading-relaxed space-y-4 text-brand-800',
        backLink: 'mt-8 inline-block text-brand-400 hover:underline hover:text-brand-300 transition-colors',
    },
})
