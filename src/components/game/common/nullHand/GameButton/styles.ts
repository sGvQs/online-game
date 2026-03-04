import { tv } from 'tailwind-variants'

export const gameButton = tv({
    base: [
        'border-2',
        'bg-black/20',
        'text-white',
        'font-black',
        'uppercase',
        'tracking-[0.3em]',
        'cursor-pointer',
        'transition-all',
        'duration-200',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
        'flex flex-col items-center justify-center',
        'backdrop-blur-sm',
    ],
    variants: {
        variant: {
            primary: [
                'border-[#FF4444]',
                'bg-[#FF4444]/10',
                'hover:bg-[#FF4444]/20',
                'text-white',
            ],
            secondary: [
                'border-white/20',
                'bg-black',
                'hover:bg-white/10',
                'text-white',
            ],
            danger: [
                'border-[#FF4444]',
                'bg-[#FF4444]/10',
                'text-[#FF4444]',
                'hover:bg-[#FF4444]',
                'hover:text-black',
            ],
            cyan: [
                'border-[#44FFFF]',
                'bg-[#44FFFF]/10',
                'hover:bg-[#44FFFF]/20',
                'text-[#44FFFF]',
            ],
        },
        size: {
            sm: ['px-4', 'py-1', 'text-[10px]'],
            md: ['px-10', 'py-3', 'text-sm'],
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
