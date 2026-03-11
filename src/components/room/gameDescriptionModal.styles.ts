import { tv } from 'tailwind-variants'

// =============================================
// Error Hunter スタイル
// =============================================
export const ehModal = tv({
    slots: {
        content: 'space-y-6',
        previewArea: 'relative w-full min-h-[320px] flex items-center justify-center rounded overflow-hidden border-2 bg-[#008080] border-brand-500',
        catchTitle: 'text-2xl font-bold text-brand-900',
        catchSub: 'text-sm italic text-brand-700',
        sectionTitle: 'text-lg font-bold border-b-2 pb-1 text-brand-900 border-brand-500',
        list: 'space-y-2 text-sm pl-4 text-brand-800',
        tipsList: 'space-y-1 text-xs pl-4 text-brand-800',
        listItem: 'flex items-start',
        bullet: 'font-bold mr-2 min-w-[24px] text-brand-600',
        victoryBox: 'border-2 p-3 rounded bg-brand-500/10 border-brand-400',
        victoryText: 'text-sm font-bold text-brand-900',
        closeRow: 'flex justify-center pt-4',
    },
})

// =============================================
// Null Hand スタイル
// =============================================
export const nhModal = tv({
    slots: {
        outerPad: 'p-4 md:p-6 flex-1',
        content: 'space-y-6',
        previewArea: 'min-h-[320px] flex flex-col justify-center bg-black border border-[#FF4444] rounded p-4 text-center relative overflow-hidden group',
        previewGlow: 'absolute inset-0 bg-[#FF4444]/10 pointer-events-none',
        catchTitle: 'text-xl font-bold text-white',
        catchSub: 'text-xs italic text-gray-400',
        sectionTitle: 'text-sm font-bold border-b border-[#FF4444] pb-1 text-white flex items-center gap-2',
        sectionDot: 'w-1.5 h-1.5 bg-[#FF4444] rounded-full',
        flowList: 'space-y-3 text-[11px] pl-2 text-gray-400',
        listItem: 'flex items-start',
        bullet: 'font-bold mr-2 text-[#FF4444]',
        tipsList: 'space-y-2 text-xs pl-2 text-gray-300',
        tipsBullet: 'mr-2 text-[#FF4444]',
        closeRow: 'p-4 border-t border-[#FF4444]/30 flex justify-center',
    },
})

// =============================================
// Star Shield スタイル
// =============================================
export const ssModal = tv({
    slots: {
        outerPad: 'p-4 md:p-6 flex-1',
        content: 'space-y-6',
        previewArea: 'relative min-h-[320px] flex flex-col justify-center bg-brand-950/90 border border-brand-500/50 rounded-xl p-6 overflow-hidden',
        previewGlow: 'absolute inset-0 bg-brand-500/5 pointer-events-none',
        catchTitle: 'text-xl font-bold text-white',
        catchSub: 'text-xs italic text-brand-600',
        flowHeader: 'text-sm font-bold border-b border-brand-500/60 pb-1 text-white flex items-center gap-2',
        flowDot: 'w-1.5 h-1.5 bg-brand-500 rounded-full',
        sectionTitle: 'text-sm font-bold border-b border-brand-500/60 pb-1 text-white',
        flowList: 'space-y-3 text-[11px] pl-2 text-brand-600',
        listItem: 'flex items-start',
        bullet: 'font-bold mr-2 text-brand-300',
        victoryBox: 'border border-brand-500/30 rounded-lg p-3 bg-brand-500/5 space-y-2 text-xs text-white/90',
        tipsList: 'space-y-2 text-xs pl-2 text-brand-600',
        tipsBullet: 'mr-2 text-brand-500',
        closeRow: 'p-4 border-t border-brand-500/30 flex justify-center',
    },
})
