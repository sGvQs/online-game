import { tv } from 'tailwind-variants'

/**
 * NullHandGame コンポーネントのスタイル定義
 * I.Q FINAL風デザイン
 * - 黒背景 (#000000)
 * - 太い赤枠 (#E74C3C / #FF4444)
 * - 水色テキスト (#44FFFF)
 * - グリッドレイアウト
 */
export const nullHandGame = tv({
    slots: {
        container: [
            'bg-black',
            'min-h-screen',
            'font-sans', // I.Qはサンセリフ系
            'text-white',
            'overflow-auto', // スクロール可能に
            'flex',
            'items-center',
            'justify-center',
            'p-4',
            'md:p-8',
        ],

        // 共通: I.Q風ボックス
        iqBox: [
            'border-[6px]', // かなり太い枠線
            'border-[#FF4444]', // 赤
            'bg-black',
            'p-6',
            'relative',
        ],

        // 強調ボックス（選択中など）
        iqBoxActive: [
            'bg-[#FF4444]',
            'text-white',
        ],

        // タイトル画面のグリッド
        titleGrid: [
            'grid',
            'grid-cols-1 md:grid-cols-2',
            'gap-6',
            'w-full',
            'max-w-6xl',
        ],

        // 左上エリア（メニュー）
        menuBox: [
            'border-[6px]',
            'border-[#FF4444]',
            'bg-black',
            'p-6', // よりコンパクトに
            'flex',
            'flex-col',
            'justify-start', // 上寄せ
            'min-h-[300px]',
        ],

        // 右上エリア（ロゴ・ビジュアル）
        visualBox: [
            'border-[6px]',
            'border-[#FF4444]',
            'bg-black',
            'flex',
            'items-center',
            'justify-center',
            'min-h-[300px]',
            'relative',
            'overflow-hidden',
        ],

        // 下部エリア（インフォメーション）
        infoBox: [
            'col-span-1 md:col-span-2',
            'border-[6px]',
            'border-[#FF4444]',
            'bg-black', // 半透明赤背景もありだが、画像は黒っぽい
            'p-8',
            'min-h-[150px]',
            'flex',
            'items-center',
            'justify-center',
            'text-center',
        ],

        // ロゴテキスト
        logo: [
            'text-6xl',
            'font-black', // 極太
            'text-white',
            'tracking-widest',
            'uppercase',
            'mb-4',
            'drop-shadow-[4px_4px_0_rgba(255,0,0,0.5)]',
        ],

        subtitle: [
            'text-xl',
            'text-[#44FFFF]', // 水色
            'font-bold',
            'tracking-[0.5em]',
        ],

        // メニュー項目（デフォルト）
        menuItem: [
            'text-2xl', // 少し小さく
            'font-bold',
            'py-2',
            'px-2',
            'mb-1', // 間隔をより詰める
            'cursor-pointer',
            'transition-all',
            'duration-200',
            'uppercase',
            'tracking-[0.3em]', // 字間を広げる
            'text-white',
            'border-2',
            'border-transparent', // デフォルトは透明
            'hover:border-[#FF4444]', // ホバー時に赤枠
        ],

        // 準備完了状態（赤文字）
        menuItemReady: [
            'text-[#FF4444]',
        ],

        // 無効状態（グレーアウト、ホバー効果なし）
        menuItemDisabled: [
            'text-gray-600',
            'cursor-not-allowed',
            'border-transparent', // ボーダーを常に透明に
            'hover:border-transparent', // ホバー時もボーダーなし
        ],

        // 選択されたメニュー項目（赤背景・白文字）
        menuItemSelected: [
            'bg-[#FF4444]',
            'text-white',
            'border-[#FF4444]',
        ],

        // 通常メニュー項目（黒背景・白文字）
        menuItemNormal: [
            'text-gray-400',
            'hover:text-white',
        ],

        // プレイヤーリスト
        playerListWrapper: [
            'mt-8',
            'text-left',
            'w-full',
        ],

        playerItem: [
            'flex',
            'justify-between',
            'text-lg',
            'mb-1',
            'font-bold',
            'tracking-wider',
        ],

        rankingText: [
            'mr-6',
            'text-[#44FFFF]',
            'font-mono',
            'text-base',
        ],

        // ゲーム画面グリッド
        gameGrid: [
            'grid',
            'grid-cols-12',
            'gap-4',
            'w-full',
            'max-w-7xl',
            'h-full',
        ],

        // フェーズ表示（上部）
        phaseBox: [
            'col-span-12',
            'border-[4px]',
            'border-[#FF4444]',
            'p-2', // 4 → 2
            'text-center',
            'text-xl', // 2xl → xl
            'font-bold',
            'text-[#44FFFF]', // 水色
            'tracking-[0.3em]',
        ],

        // メインエリア（中央・左）
        mainArea: [
            'col-span-12 lg:col-span-8',
            'border-[4px]',
            'border-[#FF4444]',
            'p-4', // 6 → 4
            'min-h-[400px]', // 400px → 350px
            'flex',
            'flex-col',
            'justify-between',
        ],

        // サイドエリア（右・統計など）
        sideArea: [
            'col-span-12 lg:col-span-4',
            'border-[4px]',
            'border-[#FF4444]',
            'p-4', // 6 → 4
            'flex',
            'flex-col',
            'gap-3', // 4 → 3
        ],

        // 統計項目
        statRow: [
            'flex',
            'justify-between',
            'items-end',
            'border-b',
            'border-gray-700',
            'pb-1',
            'mb-1', // 2 → 1
        ],

        statLabel: [
            'text-[#FF4444]',
            'font-bold',
            'text-sm',
            'uppercase',
        ],

        statValue: [
            'text-white',
            'text-xl',
            'font-bold',
        ],

        // メッセージテキスト（下部ボックス用）
        messageText: [
            'text-xl', // 2xl → xl
            'font-bold',
            'text-[#44FFFF]',
            'tracking-wide',
            'uppercase',
        ],

        // ボタン（共通）
        button: [
            'border-[3px]',
            'border-[#FF4444]',
            'bg-black',
            'text-white',
            'px-6', // 8 → 6
            'py-2', // 3 → 2
            'text-lg', // xl → lg
            'font-bold',
            'uppercase',
            'tracking-widest',
            'cursor-pointer',
            'hover:bg-[#FF4444]',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
            'disabled:hover:bg-black',
        ],

        buttonPrimary: [
            // Primaryもスタイル統一、強いて言えば最初からActive風
            'hover:bg-[#FF4444]',
        ],

        // 3Dコンテナ
        hand3DWrapper: [
            'border-[4px]',
            'border-gray-700',
            'bg-[#111]',
            'relative',
            'transition-colors',
            'cursor-pointer',
        ],

        hand3DWrapperSelected: [
            'border-[#44FFFF]', // 選択時は水色枠
        ],

        handGrid: [
            'grid',
            'grid-cols-3',
            'gap-3', // 4 → 3
            'w-full',
        ],

        // 偽装オプション
        fakeOption: [
            'p-2', // 3 → 2
            'border-[2px]',
            'border-gray-700',
            'text-gray-400',
            'font-bold',
            'cursor-pointer',
            'hover:text-white',
        ],

        fakeOptionSelected: [
            'bg-[#FF4444]',
            'text-white',
            'border-[#FF4444]',
        ],

        // 入力フォーム
        inputGroup: [
            'mt-3', // 4 → 3
            'border-[2px]',
            'border-[#44FFFF]',
            'p-3', // 4 → 3
        ],

        select: [
            'w-full',
            'bg-black',
            'text-white',
            'border',
            'border-white',
            'p-2',
            'font-bold',
            'focus:outline-none',
            'focus:border-[#44FFFF]',
        ],

        // VS表示
        vsContainer: [
            'flex',
            'items-center',
            'justify-center',
            'gap-8',
            'py-8',
            'border-y-[4px]',
            'border-[#FF4444]',
            'bg-[#111]',
        ],

        // 結果ランク
        rankBadge: [
            'bg-[#FF4444]',
            'text-white',
            'font-bold',
            'px-3',
            'py-1',
            'py-1',
            'mr-4',
        ],

        // 入力（数値）
        numberInput: [
            'w-full',
            'bg-black',
            'text-white',
            'border',
            'border-white',
            'p-2',
            'font-bold',
            'focus:outline-none',
            'focus:border-[#44FFFF]',
        ],

        // 手の表示エリア
        handDisplay: [
            'flex',
            'justify-center',
            'items-center',
            'py-12',
            'border-y-[4px]',
            'border-gray-800',
            'mb-8',
        ],
    },
})

