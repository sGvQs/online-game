import { tv } from 'tailwind-variants'

export const gameButton = tv({
    base: [
        'border-[3px]',
        'bg-black',
        'text-white',
        'font-bold',
        'uppercase',
        'tracking-widest',
        'cursor-pointer',
        'transition-all',
        'duration-200',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
    ],
    variants: {
        variant: {
            primary: [
                'border-[#FF4444]',
                'hover:bg-[#FF4444]',
                'disabled:hover:bg-black',
            ],
            secondary: [
                'border-gray-600',
                'bg-gray-800',
                'hover:bg-gray-700',
                'text-gray-300',
                'disabled:hover:bg-gray-800',
            ],
            danger: [
                'border-[#FF4444]',
                'bg-[#1a0505]',
                'text-[#FF4444]',
                'hover:bg-[#FF4444]',
                'hover:text-black',
                'disabled:hover:bg-[#1a0505]',
            ],
        },
        size: {
            sm: ['px-4', 'py-1', 'text-sm'],
            md: ['px-6', 'py-2', 'text-lg'],
            lg: ['px-16', 'py-4', 'text-lg'],
        },
        fullWidth: {
            true: 'w-full',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
    },
})
