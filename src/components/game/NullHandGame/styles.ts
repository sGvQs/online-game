import { tv } from 'tailwind-variants'

/**
 * NullHandGame コンポーネントのスタイル定義
 * I.Q (Intelligent Qube) 風の暗黒・無機質・幾何学的なデザイン
 */
export const nullHandGame = tv({
    slots: {
        // メインコンテナ
        container: [
            'bg-black',
            'min-h-screen',
            'font-mono',
            'text-white',
            'relative',
            'overflow-hidden',
            'flex items-center justify-center',
            // I.Q風グリッド床（緑の線）
            "after:content-['']",
            'after:absolute',
            'after:inset-0',
            'after:bg-[repeating-linear-gradient(0deg,rgba(0,255,0,0.05)_0px,transparent_1px,transparent_50px),repeating-linear-gradient(90deg,rgba(0,255,0,0.05)_0px,transparent_1px,transparent_50px)]',
            'after:pointer-events-none',
            'after:z-0',
        ],

        // タイトル画面
        titleScreen: [
            'relative z-10',
            'max-w-4xl',
            'mx-auto',
            'p-8',
            'text-center',
        ],

        // ロゴ
        logo: [
            'text-8xl',
            'font-bold',
            'mb-4',
            'text-green-400',
            '[text-shadow:0_0_20px_rgba(0,255,0,0.5),0_0_40px_rgba(0,255,0,0.3)]',
            'tracking-widest',
        ],

        subtitle: [
            'text-xl',
            'text-green-300',
            'mb-8',
            'tracking-[0.3em]',
            '[text-shadow:0_0_10px_rgba(0,255,0,0.5)]',
        ],

        // プレイヤーリスト
        playerList: [
            'bg-black/80',
            'border border-green-400/30',
            'p-6',
            'mb-6',
            '[box-shadow:0_0_20px_rgba(0,255,0,0.2)]',
        ],

        playerItem: [
            'text-green-300',
            'mb-2',
            'flex items-center justify-between',
            'px-4 py-2',
            'border-l-2 border-green-400/50',
        ],

        playerReady: [
            'text-green-400',
            'font-bold',
            '[text-shadow:0_0_10px_rgba(0,255,0,0.8)]',
        ],

        // ボタン
        button: [
            'px-8 py-3',
            'bg-green-900/50',
            'border border-green-400',
            'text-green-300',
            'font-bold',
            'tracking-widest',
            'cursor-pointer',
            'transition-all',
            'hover:bg-green-800/50',
            'hover:text-green-100',
            'hover:[box-shadow:0_0_20px_rgba(0,255,0,0.5)]',
            'disabled:opacity-30',
            'disabled:cursor-not-allowed',
            'disabled:hover:bg-green-900/50',
            'disabled:hover:[box-shadow:none]',
        ],

        buttonPrimary: [
            'bg-green-600/70',
            'hover:bg-green-500/70',
            '[box-shadow:0_0_15px_rgba(0,255,0,0.4)]',
        ],

        // ゲーム画面
        gameScreen: [
            'relative z-10',
            'w-full',
            'max-w-6xl',
            'mx-auto',
            'p-8',
        ],

        // フェーズ表示
        phaseIndicator: [
            'text-center',
            'mb-8',
            'text-3xl',
            'font-bold',
            'text-green-400',
            'tracking-[0.5em]',
            '[text-shadow:0_0_20px_rgba(0,255,0,0.8)]',
            'animate-pulse',
        ],

        // タイマーバー
        timerContainer: [
            'w-full',
            'h-4',
            'bg-black',
            'border border-green-400/50',
            'mb-8',
            'overflow-hidden',
        ],

        timerBar: [
            'h-full',
            'bg-gradient-to-r from-green-400 to-yellow-400',
            '[box-shadow:0_0_20px_rgba(0,255,0,0.8)]',
            'transition-all duration-300',
        ],

        // 手表示エリア
        handDisplay: [
            'text-center',
            'py-16',
        ],

        handEmoji: [
            'text-[200px]',
            'inline-block',
            'transform',
            'transition-transform duration-700',
            'perspective-1000',
            '[text-shadow:0_0_40px_rgba(0,255,0,0.5)]',
        ],

        handRevealed: [
            '[transform:rotateY(0deg)]',
        ],

        handHidden: [
            '[transform:rotateY(180deg)]',
            'opacity-30',
        ],

        // 統計パネル
        statsPanel: [
            'bg-black/80',
            'border border-green-400/30',
            'p-6',
            'mb-6',
            '[box-shadow:0_0_20px_rgba(0,255,0,0.2)]',
        ],

        statItem: [
            'flex justify-between',
            'text-green-300',
            'mb-3',
            'pb-2',
            'border-b border-green-400/20',
        ],

        statLabel: [
            'text-green-400/70',
            'uppercase',
            'text-sm',
            'tracking-wider',
        ],

        statValue: [
            'text-green-300',
            'font-bold',
            'text-lg',
            '[text-shadow:0_0_10px_rgba(0,255,0,0.5)]',
        ],

        // 手選択グリッド
        handGrid: [
            'grid grid-cols-3 gap-6',
            'max-w-3xl',
            'mx-auto',
            'my-8',
        ],

        handOption: [
            'aspect-square',
            'flex items-center justify-center',
            'bg-black/50',
            'border-2 border-green-400/30',
            'cursor-pointer',
            'transition-all',
            'hover:border-green-400',
            'hover:bg-green-900/30',
            'hover:[box-shadow:0_0_30px_rgba(0,255,0,0.3)]',
            'text-9xl',
        ],

        handOptionSelected: [
            'border-green-400',
            'bg-green-900/50',
            '[box-shadow:0_0_40px_rgba(0,255,0,0.6)]',
            'scale-105',
        ],

        // 嘘選択（Fake Target）
        fakeGrid: [
            'grid grid-cols-1 gap-4',
            'max-w-2xl',
            'mx-auto',
            'my-6',
        ],

        fakeOption: [
            'px-6 py-4',
            'bg-black/50',
            'border border-red-400/30',
            'text-red-300',
            'cursor-pointer',
            'transition-all',
            'hover:border-red-400',
            'hover:bg-red-900/30',
            'hover:[box-shadow:0_0_20px_rgba(255,0,0,0.3)]',
            'flex items-center justify-between',
        ],

        fakeOptionSelected: [
            'border-red-400',
            'bg-red-900/50',
            '[box-shadow:0_0_30px_rgba(255,0,0,0.5)]',
            'text-red-100',
        ],

        // リザルト画面
        resultScreen: [
            'text-center',
            'py-12',
        ],

        resultTitle: [
            'text-6xl',
            'font-bold',
            'mb-8',
            'text-green-400',
            '[text-shadow:0_0_30px_rgba(0,255,0,0.8)]',
        ],

        resultMessage: [
            'text-2xl',
            'mb-12',
            'text-green-300',
        ],

        // メッセージテキスト
        messageText: [
            'text-center',
            'text-green-300',
            'text-lg',
            'mb-6',
        ],

        // 警告メッセージ
        warningText: [
            'text-center',
            'text-yellow-400',
            'text-sm',
            'italic',
            '[text-shadow:0_0_10px_rgba(255,255,0,0.5)]',
        ],
    },
})
