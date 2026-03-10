import { tv } from 'tailwind-variants'

export const tooltip = tv({
    slots: {
        trigger: 'relative inline-flex',
        popover: 'absolute z-50 pointer-events-none',
        content: 'relative px-2.5 py-1.5 text-xs font-medium text-brand-900 bg-brand-100/90 backdrop-blur-md rounded-lg shadow-lg border border-brand-200/50 whitespace-nowrap',
        arrow: 'absolute w-0 h-0 border-4',
    },
    variants: {
        position: {
            top: {
                popover: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
                arrow: 'top-full left-1/2 -translate-x-1/2 border-t-brand-100/90 border-x-transparent border-b-transparent',
            },
            bottom: {
                popover: 'top-full left-1/2 -translate-x-1/2 mt-2',
                arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-brand-100/90 border-x-transparent border-t-transparent',
            },
            left: {
                popover: 'right-full top-1/2 -translate-y-1/2 mr-2',
                arrow: 'left-full top-1/2 -translate-y-1/2 border-l-brand-100/90 border-y-transparent border-r-transparent',
            },
            right: {
                popover: 'left-full top-1/2 -translate-y-1/2 ml-2',
                arrow: 'right-full top-1/2 -translate-y-1/2 border-r-brand-100/90 border-y-transparent border-l-transparent',
            },
        },
    },
    defaultVariants: {
        position: 'top',
    },
})
