import { tv } from 'tailwind-variants'

/**
 * HostControls コンポーネントのスタイル定義
 * Win95スタイルのホストコントロール用
 */
export const hostControls = tv({
    slots: {
        wrapper: 'flex gap-4 mb-4',
        button: 'win95-button flex items-center gap-2',
        buttonIcon: 'w-4 h-4',
    },
})
