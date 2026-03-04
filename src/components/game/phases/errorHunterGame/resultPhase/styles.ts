import { tv } from 'tailwind-variants'

export const resultPhase = tv({
  slots: {
    overlay: 'fixed inset-0 flex items-center justify-center z-50 bg-black/30',
    inner: 'min-w-[350px]',
    headerSection: 'mb-3 ml-6',
    commentLabel: 'text-xs font-normal text-black mb-1 p-1 bg-transparent rounded-sm',
    commentText: 'text-sm font-bold text-[#000080] mb-1 p-1 bg-[#e0e0e0] rounded-sm',
    resultText: 'text-xs text-[#000080] ml-6 mt-3',
  },
})
