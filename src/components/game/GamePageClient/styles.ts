import { tv } from 'tailwind-variants'

/**
 * GamePageClient コンポーネントのスタイル定義
 * Windows 95風のタイトルモーダルとゲームレイアウト
 */
export const gamePageClient = tv({
  slots: {
    // タイトルモーダル
    modalOverlay: [
      'fixed inset-0',
      'bg-black/50',
      'flex items-center justify-center',
      'z-[100]',
    ],
    modal: [
      'w-[800px] h-[500px]',
      'bg-[#c0c0c0]',
      'border-2 border-solid',
      'border-t-white border-l-white',
      'border-r-[#808080] border-b-[#808080]',
      '[box-shadow:inset_-1px_-1px_0_#dfdfdf,inset_1px_1px_0_#0a0a0a,4px_4px_8px_rgba(0,0,0,0.5)]',
      'animate-[win95-modal-appear_0.2s_ease-out]',
      'flex flex-col',
    ],
    modalInner: [
      'bg-[#c0c0c0]',
      'border border-solid border-[#808080]',
      'border-t-[#808080] border-l-[#808080]',
      'border-r-[#dfdfdf] border-b-[#dfdfdf]',
      'flex flex-col',
      'h-full',
      'overflow-hidden',
    ],
    
    // タイトルバー
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
    
    // 2カラムレイアウト
    twoColumn: 'grid grid-cols-[1fr_200px] flex-1 overflow-hidden',
    
    // 左パネル
    leftPanel: [
      'bg-[#c0c0c0]',
      'py-10 pl-10 pr-0',
      'flex flex-col',
      'overflow-hidden',
    ],
    infoBox: [
      'bg-[#fffef0]',
      'border-2 border-solid',
      'border-t-[#808080] border-l-[#808080]',
      'border-r-white border-b-white',
      'px-28 py-10',
      'flex-1',
      'overflow-y-auto overflow-x-hidden',
      'flex flex-col items-center',
    ],
    
    // ASCIIアート
    asciiArt: [
      "font-['Courier_New',monospace]",
      'text-[10px]',
      'leading-[1.2]',
      'font-bold',
      'text-[#000080]',
      '[text-shadow:2px_2px_0_#ffffff,3px_3px_0_#808080,4px_4px_2px_rgba(0,0,0,0.3)]',
      'whitespace-pre',
      'mx-auto mb-6',
      'inline-block',
      'tracking-[0]',
    ],
    
    // プレイヤー準備状況
    playerStatusSection: 'w-full mt-8',
    statusTitle: 'text-xs font-bold text-black mb-2 text-left',
    playerListbox: [
      'bg-white',
      'border-2 border-solid',
      'border-t-[#808080] border-l-[#808080]',
      'border-r-white border-b-white',
      'p-2',
    ],
    playerItem: 'flex items-center px-2 py-1 text-[11px] text-black',
    playerItemSelected: 'flex items-center px-2 py-1 text-[11px] bg-[#000080] text-white',
    playerRadio: [
      'w-3 h-3',
      'border border-solid border-black',
      'rounded-full',
      'mr-2',
      'flex items-center justify-center',
      'flex-shrink-0',
    ],
    playerRadioReady: [
      'w-3 h-3',
      'border border-solid border-black',
      'rounded-full',
      'mr-2',
      'flex items-center justify-center',
      'flex-shrink-0',
      "after:content-[''] after:w-1.5 after:h-1.5 after:bg-[#008000] after:rounded-full",
    ],
    
    // 説明モード
    descriptionContent: 'w-full flex flex-col gap-4',
    infoHeader: 'flex items-center gap-2 font-bold text-[13px] text-[#000080]',
    infoIcon: 'text-xl',
    descriptionText: [
      'bg-white',
      'border-2 border-solid',
      'border-t-[#808080] border-l-[#808080]',
      'border-r-white border-b-white',
      'p-4',
      'text-[11px]',
      'leading-[1.6]',
      'text-black',
      'flex-1',
    ],
    descriptionImage: [
      'relative',
      'p-4',
      'border border-solid border-[#808080]',
      'bg-white',
      'min-h-[200px]',
    ],
    
    // 右パネル
    rightPanel: [
      'bg-[#c0c0c0]',
      'pt-10',
      "pl-4",
      "pr-4",
      "pb-10",
      'flex flex-col',
      'gap-2',
    ],
    panelButton: [
      'w-full',
      'min-h-8',
      'px-3 py-1.5',
      'text-[11px]',
      'leading-[1.2]',
      'whitespace-normal',
      'text-center',
    ],
    buttonSpacer: 'flex-1',
    
    // 押しっぱなしボタン
    buttonPressed: [
      '!border-t-[#808080] !border-l-[#808080]',
      '!border-r-white !border-b-white',
      '!bg-[#a0a0a0]',
      '!pt-[7px] !pr-[11px] !pb-[5px] !pl-[13px]',
      '[box-shadow:inset_1px_1px_2px_rgba(0,0,0,0.2)]',
    ],
  },
})
