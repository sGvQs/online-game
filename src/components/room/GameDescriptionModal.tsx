'use client'

import Image from 'next/image'
import { RoomModal } from './RoomModal'
import { Hand3D } from '../game/NullHandGame/Hand3D'

interface GameDescriptionModalProps {
    isOpen: boolean
    onClose: () => void
    gameType: string
}

/**
 * ゲーム説明モーダル
 * 
 * 非ホストユーザーがゲーム選択カードをクリックしたときに表示される。
 * ゲームのルールと説明をglasmorphismスタイルで表示する。
 */
export function GameDescriptionModal({ isOpen, onClose, gameType }: GameDescriptionModalProps) {
    // ERROR HUNTER用の説明
    if (gameType === 'error-hunter') {
        return (
            <RoomModal
                isOpen={isOpen}
                onClose={onClose}
                title="ERROR HUNTER - ゲーム説明"
                showCloseButton
            >
                <div className="space-y-6">
                    {/* タイトル画像 */}
                    <div className="relative w-full h-120 rounded overflow-hidden border-2" style={{ backgroundColor: 'var(--brand-50)', borderColor: 'var(--brand-500)' }}>
                        <Image
                            src="/images/error-hunter-title.png"
                            alt="ERROR HUNTER"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* キャッチコピー */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--brand-900)' }}>
                            🎯 エラーを狩れ。最速を競え。
                        </h2>
                        <p className="text-sm italic" style={{ color: 'var(--brand-700)' }}>
                            あなたの反射神経が試される、スリル満点のクリックバトル！
                        </p>
                    </div>

                    {/* ゲームの流れ */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold border-b-2 pb-1" style={{ color: 'var(--brand-900)', borderColor: 'var(--brand-500)' }}>
                            📋 ゲームの流れ
                        </h3>
                        <ol className="space-y-2 text-sm pl-4" style={{ color: 'var(--brand-800)' }}>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>1.</span>
                                <span>
                                    <strong style={{ color: 'var(--brand-900)' }}>待機フェーズ</strong> - ホストがスタートを押したら、全員で画面を凝視！<br />
                                    <span className="text-xs" style={{ color: 'var(--brand-700)' }}>（3〜10秒のランダムな待ち時間）</span>
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>2.</span>
                                <span>
                                    <strong className="text-red-400">エラー出現！</strong> - 突然、画面にエラーダイアログが出現する！
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>3.</span>
                                <span>
                                    <strong style={{ color: 'var(--brand-900)' }}>早い者勝ち！</strong> - 「×」ボタンを最速でクリックした人が勝者！<br />
                                    <span className="text-red-400 text-xs font-semibold">※ フライング（エラー出現前のクリック）は無効です</span>
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>4.</span>
                                <span>
                                    <strong className="text-green-400">勝者発表！</strong> - 一番早くクリックした人の名前が表示されます
                                </span>
                            </li>
                        </ol>
                    </div>

                    {/* 勝利条件 */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold border-b-2 pb-1" style={{ color: 'var(--brand-900)', borderColor: 'var(--brand-500)' }}>
                            🏆 勝利条件
                        </h3>
                        <div className="border-2 p-3 rounded" style={{ backgroundColor: 'rgba(129, 140, 248, 0.1)', borderColor: 'var(--brand-400)' }}>
                            <p className="text-sm font-bold" style={{ color: 'var(--brand-900)' }}>
                                エラーダイアログの「×」ボタンを<span className="text-base text-red-400">最初にクリック</span>した人が勝利！
                            </p>
                            <p className="text-xs mt-2" style={{ color: 'var(--brand-800)' }}>
                                一瞬の判断と反射神経が勝負を分けます。<br />
                                待機中の緊張感と、エラー出現の瞬間のスリルを楽しんでください！
                            </p>
                        </div>
                    </div>

                    {/* プレイのコツ */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold border-b-2 pb-1" style={{ color: 'var(--brand-900)', borderColor: 'var(--brand-500)' }}>
                            💡 プレイのコツ
                        </h3>
                        <ul className="space-y-1 text-xs pl-4" style={{ color: 'var(--brand-800)' }}>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>画面の中央に集中して、エラーが出現する瞬間を見逃さないように！</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>マウスカーソルを画面中央付近に置いておくと、素早く反応できます</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span className="text-red-400 font-semibold">フライングは無効！待機バーが消えてからクリックしましょう</span>
                            </li>
                        </ul>
                    </div>

                    {/* 閉じるボタン */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-lg font-bold text-sm transition-all duration-200 border"
                            style={{
                                backgroundColor: 'var(--brand-400)',
                                color: 'white',
                                borderColor: 'var(--brand-500)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--brand-300)'
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.5)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--brand-400)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </RoomModal>
        )
    }

    // NULL HAND用の説明
    if (gameType === 'null-hand') {
        return (
            <RoomModal
                isOpen={isOpen}
                onClose={onClose}
                title="NULL HAND - ゲーム説明"
                showCloseButton
            >
                <div className="space-y-6">
                    {/* タイトル部 */}
                    <div className="bg-black border-2 border-[#FF4444] rounded p-6 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#FF4444]/5 transition-colors pointer-events-none" />
                        <h2 className="text-3xl font-black text-[#FF4444] tracking-[0.2em] mb-2 uppercase relative z-10">
                            NULL HAND
                        </h2>
                        <Hand3D handType={"ROCK"} revealed={true} size={"small"} />
                        <p className="text-[#FF4444]/80 text-xs font-mono tracking-wider relative z-10">
                            PSYCHOLOGICAL ROCK-PAPER-SCISSORS
                        </p>
                    </div>

                    {/* キャッチコピー */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--brand-900)' }}>
                            👁️ 嘘を見抜け。心理を読め。
                        </h2>
                        <p className="text-sm italic" style={{ color: 'var(--brand-700)' }}>
                            ホストの「偽装工作」を暴き、じゃんけんで完全勝利せよ！
                        </p>
                    </div>

                    {/* ゲームの流れ */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold border-b-2 pb-1" style={{ color: 'var(--brand-900)', borderColor: 'var(--brand-500)' }}>
                            📋 ゲームの流れ
                        </h3>
                        <ol className="space-y-2 text-sm pl-4" style={{ color: 'var(--brand-800)' }}>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>1.</span>
                                <span>
                                    <strong style={{ color: 'var(--brand-900)' }}>ホストの準備</strong> - ホストは自分の「手」と「嘘」を決定します。
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>2.</span>
                                <span>
                                    <strong style={{ color: 'var(--brand-900)' }}>ホストの情報公開</strong> - 「設定した手」とホストのステータスが公開されます。<br />
                                    <span className="text-red-400 text-xs font-semibold">※ この中に嘘が含まれています</span>
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>3.</span>
                                <span>
                                    <strong style={{ color: 'var(--brand-900)' }}>ホストの最終決定</strong> - ホストは勝負する手を決定します。ホスト準備で「設定した手」から変えるか、そのまま戦うか
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>4.</span>
                                <span>
                                    <strong style={{ color: 'var(--brand-900)' }}>ゲストの予想</strong> - リスクを冒してでも、ホストの手を読み切れ！
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>5.</span>
                                <span>
                                    <strong style={{ color: 'var(--brand-900)' }}>決断の時！</strong> - 嘘に惑わされず、勝てる手を選択！
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold mr-2 min-w-[24px]" style={{ color: 'var(--brand-600)' }}>6.</span>
                                <span>
                                    <strong className="text-green-400">勝者発表！</strong> - 心理戦を制したのは誰だ！？<br />
                                    <span className="text-xs font-semibold">※ ホストは一人一回は必ず行います</span><br />
                                    <span className="text-xs font-semibold">※ 全てのゲームが終わった時の総合点で勝者が決まります</span>
                                </span>
                            </li>
                        </ol>
                    </div>

                    {/* 勝利条件 */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold border-b-2 pb-1" style={{ color: 'var(--brand-900)', borderColor: 'var(--brand-500)' }}>
                            🏆 勝利条件
                        </h3>
                        <div className="border-2 p-3 rounded" style={{ backgroundColor: 'rgba(129, 140, 248, 0.1)', borderColor: 'var(--brand-400)' }}>
                            <p className="text-sm font-bold" style={{ color: 'var(--brand-900)' }}>
                                <span className="text-base text-red-400">ゲスト</span>： ホストにじゃんけんで勝つ（+1点）
                            </p>
                            <p className="text-xs mt-2" style={{ color: 'var(--brand-800)' }}>
                                <span className="font-bold text-base text-black">ホスト</span>： 全員に勝つ（+3点）<br />
                                単なる運ゲーではありません。ホストの心理を読み、裏の裏をかくことが勝利への鍵です。
                            </p>
                        </div>
                    </div>

                    {/* プレイのコツ */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold border-b-2 pb-1" style={{ color: 'var(--brand-900)', borderColor: 'var(--brand-500)' }}>
                            💡 プレイのコツ
                        </h3>
                        <ul className="space-y-1 text-xs pl-4" style={{ color: 'var(--brand-800)' }}>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>「変える確率」や「お気に入り」からホストの心理を読み取ろう</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>あえて正直に情報を出すホストもいます。疑心暗鬼になりすぎないように！</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span className="text-red-400 font-semibold">裏の裏をかくか、素直に信じるか...駆け引きが重要です</span>
                            </li>
                        </ul>
                    </div>

                    {/* 閉じるボタン */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-lg font-bold text-sm transition-all duration-200 border"
                            style={{
                                backgroundColor: 'var(--brand-400)',
                                color: 'white',
                                borderColor: 'var(--brand-500)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--brand-300)'
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.5)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--brand-400)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </RoomModal>
        )
    }

    // 他のゲームタイプの説明（将来的に追加）
    return null
}
