import { tv } from 'tailwind-variants'

/**
 * RoomCard コンポーネントのスタイル定義
 * slots機能を使用して構成要素ごとにスタイルを整理
 */
export const roomCard = tv({
    slots: {
        wrapper: [
            'glass-card rounded-lg px-4 py-3 flex items-center justify-between gap-3 group relative overflow-hidden',
            'border-t-2 border-t-brand-500/50 hover:border-t-brand-400',
            'transition-all duration-300',
        ],
        glowOverlay: [
            'absolute inset-0 bg-brand-500/5 opacity-0',
            'group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
        ],
        main: 'flex-1 min-w-0 flex flex-col gap-0.5',
        title: [
            'text-sm font-bold text-brand-900 dark:text-brand-800 truncate',
            'transition-colors group-hover:text-glow',
        ],
        meta: 'flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400',
        statusBadge: [
            'px-1.5 py-0.5 rounded text-[10px] font-medium',
        ],
        statusLobby: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
        statusPlaying: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        actions: 'flex gap-2 items-center shrink-0',
        joinButton: [
            'bg-brand-600 dark:bg-brand-300 hover:bg-brand-400 text-white',
            'shadow-md hover:shadow-brand-500/25 transition-all duration-200',
            'rounded-full px-3 h-7 text-[10px] font-semibold tracking-wide uppercase gap-1',
        ],
        joinButtonDisabled: 'opacity-50 cursor-not-allowed',
    },
})

export const emptyState = tv({
    slots: {
        wrapper: [
            'col-span-full py-24 text-center rounded-2xl backdrop-blur-sm',
            'border border-dashed border-brand-200 dark:border-brand-800/30',
        ],
        icon: 'text-6xl mb-6 opacity-80 animate-bounce',
        title: 'text-xl font-bold text-brand-400 mb-2',
        description: 'text-brand-600 dark:text-brand-300 max-w-md mx-auto',
    },
})
