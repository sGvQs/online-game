import { tv } from 'tailwind-variants'

export const gameOverPhase = tv({
    slots: {
        // 世界順位エリア
        rankLabel: 'text-[#44FFFF] text-xl font-bold mb-2 tracking-widest',
        rankContainer: 'flex items-center justify-center gap-8 text-4xl font-mono font-bold',
        rankOld: 'text-gray-500',
        rankArrow: 'text-white',
        rankNew: 'text-[#FF4444] text-5xl',

        // ポイント
        pointsContainer: 'mt-4 flex items-center justify-center gap-4 text-xl font-mono',
        pointsLabel: 'text-gray-400',
        pointsOld: 'text-gray-500',
        pointsArrow: 'text-white',
        pointsNew: 'text-[#44FFFF] font-bold text-2xl',
    },
})
