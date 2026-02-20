import { tv } from 'tailwind-variants'

export const finalDecisionPhase = tv({
    slots: {
        // Strategy Tip
        strategyTip: 'w-full max-w-2xl bg-[#1a1a1a]/80 border border-[#44FFFF]/20 rounded-lg p-4 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500 delay-200 mt-2',
        strategyTipHeader: 'flex items-center gap-2 mb-2 border-b border-[#44FFFF]/10 pb-2',
        strategyTipTitle: 'text-[#44FFFF] font-bold text-xs tracking-widest uppercase',
        strategyTipMeta: 'text-[10px] text-gray-500 ml-auto font-mono',
        strategyTipBody: 'text-xs text-gray-300 leading-relaxed',
        strategyTipHighlight: 'text-[#44FFFF] font-bold',
        strategyTipUnderline: 'text-white font-bold underline decoration-[#44FFFF]/50 decoration-2 underline-offset-2',
    },
})
