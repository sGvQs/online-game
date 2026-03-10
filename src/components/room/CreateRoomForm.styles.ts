import { tv } from 'tailwind-variants'

export const createRoomForm = tv({
    slots: {
        formWrapper: 'animate-in fade-in slide-in-from-top-2 duration-300',
        form: 'flex flex-col gap-3',
        actions: 'flex gap-2 mt-1',
    },
})
