import { tv } from 'tailwind-variants'

export const resultPhase = tv({
    slots: {
        // 対決エリア
        playerName: 'font-bold text-xl mb-4 tracking-widest',
        hostName: 'text-[#FF4444]',
        myselfName: 'text-[#44FFFF]',
        vsText: 'text-4xl font-bold text-white italic opacity-50',

        // 手のコンテナ（勝敗でサイズが変わる）
        handWrapper: 'transition-all duration-500',
        handWrapperWin: 'w-48 h-48',
        handWrapperLose: 'w-40 h-40 opacity-70',

        // ネタバラシヘッダー
        revealTitle: 'text-[#FF4444] font-black text-2xl tracking-[0.2em] uppercase border-b-2 border-[#FF4444] inline-block pb-1',
        revealSubtitle: 'text-gray-500 text-sm mt-2',

        // SideArea フッター
        sideFooter: 'mt-auto pt-4 border-t border-[#44FFFF]/10',
        sideFooterContent: 'flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold',

        // YOU バッジ
        youBadge: 'text-[10px] bg-[#44FFFF]/10 text-[#44FFFF] border border-[#44FFFF]/20 px-1.5 py-0.5 rounded font-mono',
    },
    variants: {
        winner: {
            true: {
                playerName: 'text-[#FF4444]',
            },
            false: {
                playerName: 'text-white',
            },
        },
    },
})
