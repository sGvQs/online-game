import { tv } from 'tailwind-variants'

/**
 * RoomCard コンポーネントのスタイル定義
 * slots機能を使用して構成要素ごとにスタイルを整理
 */
export const roomCard = tv({
    slots: {
        wrapper: [
            'glass-card rounded-xl p-5 flex flex-col justify-between group h-full relative overflow-hidden',
            'border-t-2 border-t-brand-500/50 hover:border-t-brand-400',
            'transition-all duration-300',
        ],
        glowOverlay: [
            'absolute inset-0 bg-brand-500/5 opacity-0',
            'group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
        ],
        main: 'flex-1 min-w-0 flex flex-col gap-2 mb-4',
        title: [
            'text-lg font-bold text-brand-900 dark:text-brand-800',
            'transition-colors group-hover:text-glow',
        ],
        meta: 'flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400',
        statusBadge: [
            'px-2 py-1 rounded-md text-xs font-medium',
        ],
        statusLobby: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        statusPlaying: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        actions: [
            'flex justify-between items-center pt-4 border-t border-brand-100/50 dark:border-brand-700/20',
        ],
        joinButton: [
            '!bg-brand-400 hover:!bg-brand-500 text-white',
            'shadow-md hover:shadow-brand-500/25 transition-all duration-200',
            'rounded-full px-4 h-8 text-xs font-semibold tracking-wide uppercase gap-1.5',
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
