import { tv } from 'tailwind-variants'

export const starShieldGame = tv({
    slots: {
        // 全画面コンテナ
        container: 'relative min-h-screen overflow-hidden flex flex-col items-center justify-center',

        // 星背景
        starsLayer: 'absolute inset-0 pointer-events-none',

        // タイトル画面グリッド
        titleGrid: 'relative z-10 w-full max-w-5xl mx-auto px-6 grid grid-cols-[1fr_auto] gap-12 items-center',

        // ゲームロゴ
        logoWrapper: 'mb-10 select-none',
        logoSub: 'text-[#00CFFF]/60 text-xs tracking-[0.5em] uppercase font-mono mb-2',
        logoTitle: [
            'text-7xl font-black tracking-[0.1em] uppercase',
            'text-transparent bg-clip-text',
            'bg-gradient-to-b from-white via-[#00CFFF] to-[#0066FF]',
            'drop-shadow-[0_0_40px_rgba(0,207,255,0.5)]',
        ],

        // メニューボックス
        menuBox: 'flex flex-col gap-2',

        // メニューアイテム
        menuItem: [
            'text-3xl font-black tracking-[0.2em] uppercase cursor-pointer select-none',
            'text-white/70 hover:text-white transition-colors duration-200',
            'font-mono',
        ],
        menuItemReady: 'text-[#00CFFF] pointer-events-none drop-shadow-[0_0_10px_rgba(0,207,255,0.8)]',
        menuItemSelected: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]',
        menuItemDisabled: 'text-white/20 pointer-events-none cursor-not-allowed',
        menuItemExit: 'text-[#FF6666]/70 hover:text-[#FF6666]',

        // 難度セレクター
        difficultyWrapper: 'mt-8',
        difficultyLabel: 'text-[#00CFFF]/50 text-xs tracking-[0.4em] uppercase font-mono mb-3',
        difficultyOptions: 'flex gap-3',
        difficultyOption: [
            'px-4 py-1.5 text-xs font-mono font-bold tracking-widest uppercase border',
            'transition-all duration-200 cursor-pointer select-none',
        ],
        difficultyActive: 'border-[#00CFFF] text-[#00CFFF] bg-[#00CFFF]/10 shadow-[0_0_8px_rgba(0,207,255,0.4)]',
        difficultyInactive: 'border-white/20 text-white/30 hover:border-white/40 hover:text-white/50',

        // プレイヤーリスト（右側）
        playerPanel: 'flex flex-col gap-3 min-w-[200px]',
        playerPanelTitle: 'text-[#00CFFF]/50 text-xs tracking-[0.4em] uppercase font-mono mb-1',
        playerItem: 'flex items-center gap-3',
        playerName: 'text-white/80 font-mono text-sm tracking-wider',
        playerReadyBadge: 'text-[#00CFFF] text-xs font-mono font-bold tracking-widest',
        playerNotReadyBadge: 'text-white/20 text-xs font-mono tracking-widest',

        // ステータスバー
        readyCount: 'text-[#00CFFF]/60 text-xs font-mono tracking-widest mt-2',

        // 装飾ライン
        divider: 'w-px bg-gradient-to-b from-transparent via-[#00CFFF]/30 to-transparent self-stretch',
    },
})
