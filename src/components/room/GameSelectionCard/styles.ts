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
        // Base button style
        gameButton: [
            'w-full justify-start gap-4 h-24 text-left border-2 relative overflow-hidden group transition-all duration-300',
        ],
        // Error Hunter Theme (Win95/Teal)
        errorHunterButton: [
            'border-teal-600 bg-teal-700 hover:bg-teal-600 text-white'
        ],
        // Null Hand Theme (Black/Red)
        nullHandButton: [
            'border-[#FF4444] bg-black hover:bg-[#1a0505] text-[#FF4444]',
            'shadow-[0_0_15px_rgba(255,68,68,0.2)] hover:shadow-[0_0_25px_rgba(255,68,68,0.4)]',
        ],
        // Star Shield Theme（page.tsx の brand に合わせる）
        starShieldButton: [
            'border-brand-500/60 bg-brand-50/80 hover:bg-brand-100/80 text-brand-500',
            'shadow-[0_0_15px_rgba(129,140,248,0.2)] hover:shadow-[0_0_25px_rgba(129,140,248,0.4)]',
        ],
        gameIcon: 'relative z-10 flex items-center justify-center shrink-0 w-12 h-12 group-hover:scale-110 transition-transform duration-300',
        gameInfo: 'flex flex-col relative z-10',
        gameTitle: 'font-black text-xl tracking-widest',
        gameDescription: 'text-xs opacity-70 font-mono tracking-wider',
        loadingText: 'mt-4 text-center text-brand-600 text-sm',

        // Background effects
        nullHandBg: 'absolute inset-0 bg-[#FF4444]/5 group-hover:bg-[#FF4444]/10 transition-colors',
        starShieldBg: 'absolute inset-0 bg-brand-500/5 group-hover:bg-brand-500/10 transition-colors',
    },
})

export const waitingCard = tv({
    slots: {
        wrapper: 'glass-card p-6 rounded-2xl text-center',
        text: 'text-brand-600',
    },
})
