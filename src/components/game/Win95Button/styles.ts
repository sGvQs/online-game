import { tv } from 'tailwind-variants'

/**
 * Win95Button コンポーネントのスタイル定義
 * Windows 95風のボタンスタイル
 */
export const win95Button = tv({
  base: [
    'min-w-[75px] h-[23px] px-3',
    'bg-[#c0c0c0]',
    'border-2 border-solid',
    'border-t-white border-l-white',
    'border-r-[#808080] border-b-[#808080]',
    'font-[inherit] text-xs cursor-pointer outline-none',
  ],
  variants: {
    pressed: {
      true: [
        'border-t-[#808080] border-l-[#808080]',
        'border-r-white border-b-white',
        'pt-px pr-[11px] pb-0 pl-[13px]',
      ],
    },
    disabled: {
      true: [
        'text-[#808080]',
        '[text-shadow:1px_1px_0_#ffffff]',
        'cursor-not-allowed',
      ],
    },
    focused: {
      true: 'outline-1 outline-dotted outline-black outline-offset-[-4px]',
    },
  },
})
