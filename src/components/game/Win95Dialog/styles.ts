import { tv } from 'tailwind-variants'

/**
 * Win95Dialog コンポーネントのスタイル定義
 * Windows 95風のダイアログボックス
 */
export const win95Dialog = tv({
  slots: {
    wrapper: [
      'bg-[#c0c0c0]',
      'border-2 border-solid',
      'border-t-white border-l-white',
      'border-r-[#808080] border-b-[#808080]',
      '[box-shadow:inset_-1px_-1px_0_#dfdfdf,inset_1px_1px_0_#0a0a0a,2px_2px_4px_rgba(0,0,0,0.3)]',
      'p-[3px]',
      'relative',
      'min-w-[400px]',
    ],
    inner: [
      'bg-[#c0c0c0]',
      'border border-solid border-[#808080]',
      'border-t-[#808080] border-l-[#808080]',
      'border-r-[#dfdfdf] border-b-[#dfdfdf]',
    ],
    innerError: [
      'bg-[#c0c0c0]',
      'border border-solid border-[#808080]',
      'border-t-[#808080] border-l-[#808080]',
      'border-r-[#dfdfdf] border-b-[#dfdfdf]',
      'h-full',
    ],
    titlebar: [
      'bg-[#000080]',
      'text-white',
      'font-bold',
      'px-1 py-[3px]',
      'flex',
      'justify-between',
      'items-center',
      'select-none',
      'text-[11px]',
    ],
    titlebarText: 'flex items-center gap-1',
    titlebarButtons: 'flex gap-[2px]',
    titlebarBtn: [
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
    content: 'p-4 flex gap-4 items-start',
    icon: 'w-8 h-8 flex-shrink-0',
    iconLose: 'w-12 h-12 flex-shrink-0',
    message: 'flex-1 text-black leading-[1.4]',
    buttonGroup: 'flex gap-1.5 justify-center px-4 pt-2 pb-4',
  },
})
