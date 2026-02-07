import { tv } from 'tailwind-variants'

/**
 * RoomModal コンポーネントのスタイル定義
 * glassmorphismデザイン、画面の縦横60%のサイズ
 */
export const roomModal = tv({
  slots: {
    overlay: [
      'fixed inset-0',
      'bg-black/70',
      'flex items-center justify-center',
      'z-50',
      'animate-[fadeIn_0.2s_ease-out]',
    ],
    content: [
      'w-[60vw] h-[60vh]',
      'bg-slate-800/95',
      'border border-solid border-[var(--brand-500)]',
      'rounded-2xl',
      '[box-shadow:0_0_40px_rgba(99,102,241,0.3),0_20px_60px_rgba(0,0,0,0.5)]',
      'backdrop-blur-xl',
      'animate-[scaleIn_0.3s_ease-out]',
      'flex flex-col',
      'overflow-hidden',
    ],
    header: [
      'bg-gradient-to-br from-[var(--brand-300)] to-[var(--brand-400)]',
      'text-white',
      'px-6 py-4',
      'flex justify-between items-center',
      'border-b border-solid border-[var(--brand-500)]',
      'flex-shrink-0',
    ],
    title: 'text-xl font-bold m-0',
    closeButton: [
      'bg-transparent',
      'border-none',
      'text-white',
      'text-2xl',
      'w-8 h-8',
      'flex items-center justify-center',
      'cursor-pointer',
      'rounded',
      'transition-colors duration-200',
      'hover:bg-white/20',
      'active:bg-white/30',
    ],
    body: [
      'flex-1',
      'overflow-y-auto',
      'p-6',
      'text-[var(--foreground)]',
      // カスタムスクロールバー
      '[&::-webkit-scrollbar]:w-2',
      '[&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-track]:rounded',
      '[&::-webkit-scrollbar-thumb]:bg-[var(--brand-500)] [&::-webkit-scrollbar-thumb]:rounded',
      '[&::-webkit-scrollbar-thumb:hover]:bg-[var(--brand-400)]',
    ],
  },
})
