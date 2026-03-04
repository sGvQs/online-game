import { tv } from 'tailwind-variants'

export const waitingPhase = tv({
  slots: {
    inner: 'min-w-[350px]',
    scanningText: 'mb-3 text-black',
    hintText: 'mt-2 text-[11px] text-[#808080]',
  },
})
