import { tv } from 'tailwind-variants'

export const nullHandLogo = tv({
  slots: {
    logo: [
      'text-6xl', 'font-black', 'tracking-widest', 'uppercase', 'mb-4',
      'drop-shadow-[4px_4px_0_rgba(255,0,0,0.5)]',
      '[color:var(--logo-color,white)]',
    ],
  },
})
