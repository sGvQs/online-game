import { tv } from 'tailwind-variants'

export const bgmPlayer = tv({
    slots: {
        wrapper: 'fixed bottom-6 right-6 z-50',
        button: 'w-12 h-12 rounded-full shadow-lg text-white flex items-center justify-center',
    },
})
