import { tv } from 'tailwind-variants'

/**
 * フェーズコンポーネント共通のカードUI定義
 * SideAreaカード・データ行などで使用
 */

/** SideArea内のカードコンテナ */
export const sideCard = tv({
    slots: {
        card: 'rounded-xl border flex flex-col',
        cardTitle: 'text-gray-500 text-[10px] uppercase tracking-wider',
        cardValue: 'font-bold text-white',
        cardValueWithUnit: 'font-bold text-white flex items-baseline',
        row: 'flex justify-between items-center',
        rowLabel: 'text-gray-500 text-[10px]',
        rowValue: 'font-bold text-xs text-gray-300',
        dataBlock: 'bg-black/30 rounded-lg border',
    },
    variants: {
        variant: {
            cyan: {
                card: 'bg-[#051a1a] border-[#44FFFF]/30',
                dataBlock: 'border-[#44FFFF]/10',
            },
            red: {
                card: 'bg-[#1a0505] border-[#FF4444]/30',
                dataBlock: 'border-[#FF4444]/10',
            },
        },
        size: {
            sm: {
                card: 'p-3',
                cardValue: 'text-sm',
                dataBlock: 'px-3 py-2',
            },
            md: {
                card: 'p-4',
                cardValue: 'text-base',
                dataBlock: 'p-4',
            },
            lg: {
                card: 'p-6',
                cardValue: 'text-2xl',
                dataBlock: 'p-4',
            },
        },
    },
    defaultVariants: {
        variant: 'cyan',
        size: 'md',
    },
})

/** 結果バッジ (WIN / LOSE / DRAW) */
export const resultBadge = tv({
    base: 'font-bold px-4 py-1 rounded',
    variants: {
        result: {
            win: 'bg-[#FF4444] text-black',
            lose: 'bg-gray-600 text-white',
            draw: 'bg-gray-500 text-white',
        },
        color: {
            red: 'bg-[#FF4444] text-black',
            cyan: 'bg-[#44FFFF] text-black',
        },
    },
})

/** スコアカード行 */
export const scoreRow = tv({
    slots: {
        root: 'flex justify-between items-center p-4 rounded-lg transition-colors relative overflow-hidden border',
        indicator: 'absolute left-0 top-0 bottom-0 w-1 bg-[#FF4444]',
        name: 'font-bold text-sm tracking-wide',
        youBadge: 'text-[10px] bg-[#44FFFF]/10 text-[#44FFFF] border border-[#44FFFF]/20 px-1.5 py-0.5 rounded font-mono',
        points: 'font-black font-mono text-xl',
        pts: 'text-[10px] text-gray-700 font-bold uppercase tracking-wider',
    },
    variants: {
        winner: {
            true: {
                root: 'bg-black/30 border-[#FF4444]/20',
                name: 'text-white',
                points: 'text-[#FF4444]',
            },
            false: {
                root: 'bg-black/30 border-[#44FFFF]/10',
                name: 'text-gray-300',
                points: 'text-gray-500',
            },
        },
    },
    defaultVariants: {
        winner: false,
    },
})
