import { tv } from 'tailwind-variants'

/**
 * ErrorHunterGame コンポーネントのスタイル定義
 */
export const errorHunterGame = tv({
  slots: {
    container: [
      'bg-[#008080]',
      'min-h-screen',
      "font-['MS_Sans_Serif','Segoe_UI',Tahoma,sans-serif]",
      'text-xs',
      'p-5',
      'relative',
      "after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full",
      'after:bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.03)_0px,rgba(0,0,0,0.03)_1px,transparent_1px,transparent_2px)]',
      'after:pointer-events-none',
    ],
    floatingDialog: [
      'absolute',
      'cursor-move',
      'animate-[win95-appear_0.15s_ease-out]',
    ],
  },
})
