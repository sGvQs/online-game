import { tv } from 'tailwind-variants'

export const userCommentForm = tv({
    slots: {
        form: 'space-y-4',
        label: 'block text-sm font-medium text-brand-900 mb-2',
        charCount: 'mt-1 text-brand-900 opacity-70',
        successMessage: 'text-sm text-green-600 text-center',
    },
})
