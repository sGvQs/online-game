import { tv } from 'tailwind-variants'

export const starShieldGame = tv({
    slots: {
        // 全画面コンテナ（page.tsx と同じ body 背景を継承）
        container: 'relative min-h-screen overflow-hidden flex flex-col items-center justify-center',

        // 星背景
        starsLayer: 'min-h-screen flex flex-col items-center justify-center p-8 bg-transparent',

        // タイトル画面グリッド
        titleGrid: 'relative z-10 w-full max-w-5xl mx-auto px-6 grid grid-cols-[1fr_auto] gap-12 items-center',

        // ゲームロゴ（page.tsx のグラデーションに合わせる）
        logoWrapper: 'mb-10 select-none',
        logoSub: 'text-brand-500/70 text-xs tracking-[0.5em] uppercase mb-2',
        logoTitle: [
            'text-7xl font-black tracking-[0.1em] uppercase',
            'text-transparent bg-clip-text',
            'bg-linear-to-b from-white via-brand-500 to-brand-400',
            'drop-shadow-[0_0_40px_rgba(129,140,248,0.5)]',
        ],

        // メニューボックス
        menuBox: 'flex flex-col gap-2',

        // メニューアイテム
        menuItem: [
            'text-3xl font-black tracking-[0.2em] uppercase cursor-pointer select-none',
            'text-white/70 hover:text-white transition-colors duration-200',
        ],
        menuItemReady: 'text-brand-500 pointer-events-none drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]',
        menuItemSelected: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]',
        menuItemDisabled: 'text-white/20 pointer-events-none cursor-not-allowed',
        menuItemExit: 'text-[#4ade80]/70 hover:text-[#4ade80]',

        // 難度セレクター
        difficultyWrapper: 'mt-8',
        difficultyLabel: 'text-brand-500/60 text-xs tracking-[0.4em] uppercase mb-3',
        difficultyOptions: 'flex gap-3',
        difficultyOption: [
            'px-4 py-1.5 text-xs font-bold tracking-widest uppercase border',
            'transition-all duration-200 cursor-pointer select-none',
        ],
        difficultyActive: 'border-brand-500 text-brand-500 bg-brand-500/10 shadow-[0_0_8px_rgba(129,140,248,0.4)]',
        difficultyInactive: 'border-white/20 text-white/30 hover:border-white/40 hover:text-white/50',

        // プレイヤーリスト（右側）
        playerPanel: 'flex flex-col gap-3 min-w-[200px]',
        playerPanelTitle: 'text-brand-500/60 text-xs tracking-[0.4em] uppercase mb-1',
        playerItem: 'flex items-center gap-3',
        playerName: 'text-white/80 text-sm tracking-wider',
        playerReadyBadge: 'text-brand-500 text-xs font-bold tracking-widest',
        playerNotReadyBadge: 'text-white/20 text-xs tracking-widest',

        // ステータスバー
        readyCount: 'text-brand-500/70 text-xs tracking-widest mt-2',

        // 装飾ライン（page.tsx の via-brand-500/40 に合わせる）
        divider: 'w-px bg-linear-to-b from-transparent via-brand-500/40 to-transparent self-stretch',
    },
})
