import { tv } from 'tailwind-variants'

export const currentScores = tv({
  slots: {
    card: 'rounded-xl border flex flex-col',
    indexNumber: 'text-[10px] font-black text-white w-4',
    playerName: 'text-xs font-bold truncate text-gray-300',
    points: 'text-sm font-black tabular-nums',
  },
  variants: {
    variant: {
      cyan: {
        card: 'bg-[#051a1a] border-[#44FFFF]/30',
      },
      red: {
        card: 'bg-[#1a0505] border-[#FF4444]/30',
      },
    },
    size: {
      sm: { card: 'p-3' },
      md: { card: 'p-4' },
      lg: { card: 'p-6' },
    },
  },
  defaultVariants: {
    variant: 'cyan',
    size: 'md',
  },
})
