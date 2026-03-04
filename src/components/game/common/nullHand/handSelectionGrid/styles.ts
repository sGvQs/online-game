import { tv } from 'tailwind-variants'

export const handSelectionGrid = tv({
    slots: {
        root: 'grid grid-cols-3 gap-8 w-full max-w-4xl px-8',
        button: [
            'relative group aspect-square',
            'transition-all duration-300',
            'bg-black/40 border-2 backdrop-blur-sm',
        ],
        innerPad: 'absolute inset-0 p-4 flex items-center justify-center',
        label: [
            'absolute bottom-4 inset-x-0 text-center',
            'font-black text-xl tracking-[0.2em] transition-colors',
        ],
        selectionRing: 'absolute inset-0 border-2 border-[#44FFFF]',
    },
    variants: {
        selected: {
            true: {
                button: 'border-[#44FFFF] shadow-[0_0_30px_rgba(68,255,255,0.3)] z-10',
                label: 'text-[#44FFFF]',
            },
            false: {
                button: 'border-gray-800 hover:border-gray-600',
                label: 'text-gray-500 group-hover:text-gray-300',
            },
        },
        disabled: {
            true: {
                button: 'opacity-50 cursor-not-allowed',
            },
        },
    },
    defaultVariants: {
        selected: false,
        disabled: false,
    },
})
