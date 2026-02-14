import { tv } from 'tailwind-variants'

/**
 * NullHandGame コンポーネントのスタイル定義
 * I.Q風の白黒、無機質、幾何学的デザイン
 * ネオン効果、グロー、グラデーションは一切使用しない
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
            // シンプルなグリッド線
            "after:content-['']",
            'after:absolute',
            'after:inset-0',
            'after:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0px,transparent_1px,transparent_50px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0px,transparent_1px,transparent_50px)]',
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
            'text-white',
            'tracking-widest',
        ],

        subtitle: [
            'text-xl',
            'text-gray-400',
            'mb-8',
            'tracking-[0.3em]',
        ],

        // プレイヤーリスト
        playerList: [
            'bg-black',
            'border border-white',
            'p-6',
            'mb-6',
        ],

        playerItem: [
            'text-gray-300',
            'mb-2',
            'flex items-center justify-between',
            'px-4 py-2',
            'border-l-2 border-gray-500',
        ],

        playerReady: [
            'text-white',
            'font-bold',
        ],

        // ボタン
        button: [
            'px-8 py-3',
            'bg-black',
            'border border-white',
            'text-white',
            'font-bold',
            'tracking-widest',
            'cursor-pointer',
            'transition-colors',
            'hover:bg-white',
            'hover:text-black',
            'disabled:opacity-30',
            'disabled:cursor-not-allowed',
            'disabled:hover:bg-black',
            'disabled:hover:text-white',
        ],

        buttonPrimary: [
            'bg-white',
            'text-black',
            'hover:bg-gray-300',
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
            'text-white',
            'tracking-[0.5em]',
        ],

        // タイマーバー
        timerContainer: [
            'w-full',
            'h-4',
            'bg-black',
            'border border-white',
            'mb-8',
            'overflow-hidden',
        ],

        timerBar: [
            'h-full',
            'bg-white',
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
            'bg-black',
            'border border-white',
            'p-6',
            'mb-6',
        ],

        statItem: [
            'flex justify-between',
            'text-gray-300',
            'mb-3',
            'pb-2',
            'border-b border-gray-800',
        ],

        statLabel: [
            'text-gray-400',
            'uppercase',
            'text-sm',
            'tracking-wider',
        ],

        statValue: [
            'text-white',
            'font-bold',
            'text-lg',
        ],

        // リアル統計パネル（ホストSETUPフェーズ用）
        realStatsPanel: [
            'bg-white',
            'text-black',
            'border border-white',
            'p-6',
            'mb-6',
        ],

        realStatItem: [
            'flex justify-between',
            'text-black',
            'mb-3',
            'pb-2',
            'border-b border-gray-300',
        ],

        realStatLabel: [
            'text-gray-600',
            'uppercase',
            'text-sm',
            'tracking-wider',
        ],

        realStatValue: [
            'text-black',
            'font-bold',
            'text-lg',
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
            'bg-black',
            'border-2 border-gray-600',
            'cursor-pointer',
            'transition-all',
            'hover:border-white',
            'hover:bg-gray-900',
            'text-9xl',
        ],

        handOptionSelected: [
            'border-white',
            'bg-gray-900',
        ],

        // 3D手表示用コンテナ
        hand3DContainer: [
            'aspect-square',
            'border-2 border-gray-600',
            'overflow-hidden',
        ],

        hand3DContainerSelected: [
            'border-white',
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
            'bg-black',
            'border border-gray-600',
            'text-gray-300',
            'cursor-pointer',
            'transition-all',
            'hover:border-white',
            'hover:bg-gray-900',
            'flex items-center justify-between',
        ],

        fakeOptionSelected: [
            'border-white',
            'bg-gray-900',
            'text-white',
        ],

        // 偽装詳細入力
        fakeDetailsSection: [
            'mt-6',
            'p-6',
            'border border-white',
            'bg-gray-900',
        ],

        inputLabel: [
            'text-gray-300',
            'mb-2',
            'text-sm',
            'uppercase',
            'tracking-wider',
        ],

        select: [
            'w-full',
            'p-3',
            'bg-black',
            'border border-white',
            'text-white',
            'font-mono',
            'cursor-pointer',
        ],

        numberInput: [
            'w-full',
            'p-3',
            'bg-black',
            'border border-white',
            'text-white',
            'font-mono',
            '[appearance:textfield]',
            '[&::-webkit-outer-spin-button]:appearance-none',
            '[&::-webkit-inner-spin-button]:appearance-none',
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
            'text-white',
        ],

        resultMessage: [
            'text-2xl',
            'mb-12',
            'text-gray-300',
        ],

        // 勝者表示
        winnersSection: [
            'my-8',
            'p-6',
            'border-2 border-white',
            'bg-black',
        ],

        winnerTitle: [
            'text-3xl',
            'font-bold',
            'mb-4',
            'text-white',
            'tracking-widest',
        ],

        winnerList: [
            'text-xl',
            'text-gray-300',
        ],

        // スコア表示
        scoresSection: [
            'my-8',
            'p-6',
            'border border-white',
        ],

        scoreItem: [
            'flex justify-between',
            'py-3',
            'border-b border-gray-800',
            'last:border-b-0',
        ],

        scoreRank: [
            'text-gray-500',
            'font-mono',
            'w-12',
        ],

        scoreName: [
            'text-white',
            'flex-1',
        ],

        scorePoints: [
            'text-white',
            'font-bold',
            'tabular-nums',
        ],

        // 最終スコア（GAME_OVER）
        finalScoreItem: [
            'flex justify-between items-center',
            'py-4',
            'px-6',
            'border-b border-gray-800',
            'last:border-b-0',
        ],

        finalScoreRank: [
            'text-2xl',
            'font-mono',
            'w-16',
            'text-gray-500',
        ],

        finalScoreName: [
            'text-2xl',
            'flex-1',
            'text-white',
        ],

        finalScorePoints: [
            'text-3xl',
            'font-bold',
            'tabular-nums',
            'text-white',
        ],

        finalScoreWinner: [
            'bg-white',
            'text-black',
        ],

        // メッセージテキスト
        messageText: [
            'text-center',
            'text-gray-300',
            'text-lg',
            'mb-6',
        ],

        // 警告メッセージ
        warningText: [
            'text-center',
            'text-white',
            'text-sm',
            'font-mono',
            'tracking-widest',
        ],

        // vs表示
        vsContainer: [
            'flex items-center justify-center gap-8',
            'my-12',
        ],

        vsLabel: [
            'text-4xl',
            'font-bold',
            'text-gray-600',
        ],

        handLabel: [
            'text-center',
            'mb-4',
        ],

        handLabelText: [
            'text-gray-400',
            'text-sm',
            'uppercase',
            'tracking-wider',
        ],
    },
})
