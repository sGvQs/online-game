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
            'transition-all duration-500',
        ],
        glowOverlay: [
            'absolute inset-0 bg-brand-500/5 opacity-0',
            'group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
        ],
        header: 'mb-4 relative z-10',
        title: [
            'text-xl font-bold mb-2 text-brand-900 dark:text-brand-800',
            'transition-colors group-hover:text-glow',
        ],
        dateWrapper: 'flex items-center text-xs text-brand-700 dark:text-brand-600 space-x-2',
        dateBadge: [
            'bg-brand-50/50 dark:bg-brand-900/10 px-2 py-0.5 rounded-md',
            'border border-brand-100 dark:border-brand-700/30',
        ],
        footer: [
            'flex justify-between items-center mt-4 pt-4 relative z-10',
            'border-t border-brand-100/50 dark:border-brand-700/20',
        ],
        actions: 'flex gap-2 items-center',
        joinButton: [
            'bg-brand-600 dark:bg-brand-300 hover:bg-brand-400 text-white',
            'shadow-lg hover:shadow-brand-500/25 transition-all duration-300',
            'rounded-full px-4 h-8 text-xs font-semibold tracking-wide uppercase gap-1.5',
        ],
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
