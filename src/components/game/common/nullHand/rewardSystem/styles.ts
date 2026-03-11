import { tv } from 'tailwind-variants'

export const rewardSystem = tv({
  slots: {
    card: 'rounded-xl border flex flex-col',
    ruleDot: 'absolute inset-0 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] [background-color:var(--rule-color)]',
    ruleArrow: 'absolute top-1/2 -translate-y-1/2 text-[10px] font-bold -translate-x-1/2 [color:var(--rule-color)]',
    rulePts: 'text-xs font-black font-sans tabular-nums [color:var(--rule-color)]',
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
