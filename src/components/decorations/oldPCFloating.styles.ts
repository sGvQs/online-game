import { tv } from 'tailwind-variants'

export const oldPCFloating = tv({
    slots: {
        container: 'fixed z-0 pointer-events-none w-10 h-10',
        inner: 'relative w-full h-full',
    },
})
