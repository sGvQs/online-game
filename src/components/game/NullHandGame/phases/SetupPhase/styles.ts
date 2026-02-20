import { tv } from 'tailwind-variants'

export const setupPhase = tv({
    slots: {
        // ゲスト向けHow to Playセクション
        howToPlayTitle: 'text-[#44FFFF] font-black text-3xl mb-6 border-b-4 border-[#44FFFF] pb-2 tracking-widest uppercase',
        stepBadge: 'bg-[#44FFFF] text-black font-bold w-8 h-8 flex items-center justify-center rounded-sm shrink-0',
        stepTitle: 'text-[#44FFFF] font-bold text-lg mb-1',

        // 手選択済み後の表示
        selectedHandDisplay: 'flex items-center justify-center gap-8 mb-8',
        selectedHandCard: 'bg-[#1a1a1a] border-2 border-[#44FFFF] rounded-xl p-6 text-center w-48',
        selectedHandLabel: 'text-[#44FFFF] text-sm font-bold tracking-[0.2em] mb-2 uppercase',
        selectedHandValue: 'text-white text-2xl font-bold',
        reSelectBtn: 'text-gray-400 text-xs underline cursor-pointer hover:text-gray-200',

        // 偽装選択エリア
        fakeSection: 'bg-[#0a0a0a] border border-[#FF4444]/30 rounded-xl p-4',
        fakeSectionTitle: 'text-[#FF4444] font-bold text-sm tracking-[0.2em] uppercase mb-3',
        fakeOptionGrid: 'grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto',
        fakeOption: 'rounded-lg border-2 px-3 py-2 text-center cursor-pointer transition-all duration-200 text-xs font-bold tracking-wider',
        fakeOptionActive: 'border-[#FF4444] bg-[#FF4444]/10 text-[#FF4444]',
        fakeOptionInactive: 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300',

        // 偽装詳細入力エリア
        fakeDetail: 'bg-black/30 border border-[#FF4444]/20 rounded-lg p-4 mt-3',
        fakeDetailLabel: 'text-gray-500 text-[10px] uppercase tracking-wider mb-2',
        fakeHandGrid: 'flex justify-center gap-4 flex-wrap',
        fakeHandOption: 'rounded-lg border-2 px-6 py-3 text-center cursor-pointer transition-all text-sm font-bold flex items-center gap-2',
        fakeHandActive: 'border-[#FF4444] bg-[#FF4444]/10 text-white',
        fakeHandInactive: 'border-gray-700 text-gray-500 hover:border-gray-500',

        // 確率入力
        probabilityInput: 'w-full accent-[#44FFFF] cursor-pointer',
    },
})
