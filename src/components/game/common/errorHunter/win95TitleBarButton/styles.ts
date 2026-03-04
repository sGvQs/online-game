import { tv } from 'tailwind-variants'

export const win95TitleBarButton = tv({
  slots: {
    root: [
      'w-4 h-[14px]',
      'bg-[#c0c0c0]',
      'border-2 border-solid',
      'border-t-white border-l-white',
      'border-r-[#808080] border-b-[#808080]',
      'text-black text-[9px] leading-none',
      'flex items-center justify-center',
      'cursor-pointer font-bold',
      "font-['Marlett',sans-serif]",
      'active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white active:bg-[#a0a0a0]',
    ],
  },
})
