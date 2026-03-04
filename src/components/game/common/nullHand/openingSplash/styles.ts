import { tv } from 'tailwind-variants'

export const openingSplash = tv({
  slots: {
    visualBox: [
      'bg-black', 'flex', 'items-center', 'justify-center',
      'min-h-[350px]', 'p-8', 'relative', 'overflow-hidden', 'w-full',
    ],
    progressArea: 'w-64 space-y-2 [color:var(--splash-color)]',
    progressBar: 'h-full shadow-[0_0_10px_currentColor] [width:var(--splash-progress)] [background-color:var(--splash-color)]',
  },
})
