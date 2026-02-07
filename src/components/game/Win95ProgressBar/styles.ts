import { tv } from 'tailwind-variants'

/**
 * Win95ProgressBar コンポーネントのスタイル定義
 * Windows 95風のプログレスバー
 */
export const win95ProgressBar = tv({
  slots: {
    wrapper: '',
    label: 'mb-2 text-black',
    container: [
      'bg-white',
      'border-2 border-solid',
      'border-t-[#808080] border-l-[#808080]',
      'border-r-white border-b-white',
      'h-5',
      'p-[2px]',
      'relative',
    ],
    bar: 'flex gap-[2px] h-full',
    block: 'w-3 bg-[#000080] flex-shrink-0',
  },
})
