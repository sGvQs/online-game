import { tv } from 'tailwind-variants'

export const showcasePhase = tv({
    slots: {
        // ホスト手表示エリア
        handContainer: 'relative group w-64 h-64 mx-auto flex items-center justify-center',
        handGlow: 'absolute inset-0 bg-[#44FFFF]/5 rounded-full blur-2xl group-hover:bg-[#44FFFF]/10 transition-all duration-500',
        handInner: 'relative z-10 w-full h-full',

        // 待機中
        waitingPulse: 'flex flex-col items-center gap-2 animate-pulse',
        waitingLabel: 'text-[#44FFFF] font-bold tracking-widest text-sm',
        waitingSubLabel: 'text-gray-500 text-xs',

        // SideAreaのフッター
        noteText: 'mt-auto pt-6 text-[10px] text-gray-500 leading-relaxed border-t border-[#44FFFF]/10',
        noteHighlight: 'text-[#44FFFF]',
        noteDanger: 'text-[#FF4444] font-bold',
    },
})
