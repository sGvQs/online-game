import { tv } from 'tailwind-variants'

/**
 * GameSelectionCard コンポーネントのスタイル定義
 * slots機能を使用して構成要素ごとにスタイルを整理
 */
export const gameSelection = tv({
    slots: {
        wrapper: 'glass-card p-6 rounded-2xl',
        header: 'font-bold text-lg text-brand-900 flex items-center gap-2 mb-4',
        headerIcon: 'w-5 h-5',
        grid: 'grid grid-cols-1 gap-3',
        gameButton: [
            'w-full justify-start gap-3 h-16 text-left border-0',
            // Win95風の単色ティールグリーン
            'bg-teal-700 hover:bg-teal-600 text-white',
        ],
        gameIcon: 'text-2xl',
        gameInfo: '',
        gameTitle: 'font-bold',
        gameDescription: 'text-xs opacity-80',
        loadingText: 'mt-4 text-center text-brand-600 text-sm',
    },
})

export const waitingCard = tv({
    slots: {
        wrapper: 'glass-card p-6 rounded-2xl text-center',
        text: 'text-brand-600',
    },
})
