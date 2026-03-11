'use client'

import Image from 'next/image'
import { RoomModal } from './roomModal'
import { Win95Dialog } from '../game/common/errorHunter/win95Dialog'
import { Win95TitleBarButton } from '../game/common/errorHunter/win95TitleBarButton'
import { Hand3D } from '../game/common/nullHand/hand3D'
import { HandType } from '@/types'
import { RewardSystem } from '../game/common/nullHand/rewardSystem'
import { StarVisual } from '../game/common/starShield/starVisual'
import { ICONS, BULLET_COLOR, ROLE_META } from '@/constants/starShieldGame/constants'
import { ehModal, nhModal, ssModal } from './gameDescriptionModal.styles'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'

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
        const eh = ehModal()
        return (
            <RoomModal
                isOpen={isOpen}
                onClose={onClose}
                title="ERROR HUNTER - ゲーム説明"
                showCloseButton
            >
                <div className={eh.content()}>
                    {/* タイトル部: Win95 エラーダイアログ */}
                    <div className={eh.previewArea()}>
                        <div className="scale-75 origin-center">
                            <Win95Dialog
                                title="Error"
                                icon="error"
                                titlebarButtons={<Win95TitleBarButton>×</Win95TitleBarButton>}
                            >
                                <span className="text-black text-sm">
                                    Windows Protection Error.<br />You need to restart your computer.
                                </span>
                            </Win95Dialog>
                        </div>
                    </div>

                    {/* キャッチコピー */}
                    <div className="text-center space-y-2">
                        <Typography variant="h2" className={eh.catchTitle()}>
                            🎯 エラーを狩れ。最速を競え。
                        </Typography>
                        <Typography variant="body" className={eh.catchSub()}>
                            あなたの反射神経が試される、スリル満点のクリックバトル！
                        </Typography>
                    </div>

                    {/* ゲームの流れ */}
                    <div className="space-y-3">
                        <Typography variant="h3" className={eh.sectionTitle()}>
                            📋 ゲームの流れ
                        </Typography>
                        <ol className={eh.list()}>
                            <li className={eh.listItem()}>
                                <span className={eh.bullet()}>1.</span>
                                <span>
                                    <strong className="text-brand-900">待機フェーズ</strong> - ホストがスタートを押したら、全員で画面を凝視！<br />
                                    <span className="text-xs text-brand-700">（3〜10秒のランダムな待ち時間）</span>
                                </span>
                            </li>
                            <li className={eh.listItem()}>
                                <span className={eh.bullet()}>2.</span>
                                <span>
                                    <strong className="text-red-400">エラー出現！</strong> - 突然、画面にエラーダイアログが出現する！
                                </span>
                            </li>
                            <li className={eh.listItem()}>
                                <span className={eh.bullet()}>3.</span>
                                <span>
                                    <strong className="text-brand-900">早い者勝ち！</strong> - 「×」ボタンを最速でクリックした人が勝者！<br />
                                    <span className="text-red-400 text-xs font-semibold">※ フライング（エラー出現前のクリック）は無効です</span>
                                </span>
                            </li>
                            <li className={eh.listItem()}>
                                <span className={eh.bullet()}>4.</span>
                                <span>
                                    <strong className="text-green-400">勝者発表！</strong> - 一番早くクリックした人の名前が表示されます
                                </span>
                            </li>
                        </ol>
                    </div>

                    {/* 勝利条件 */}
                    <div className="space-y-2">
                        <Typography variant="h3" className={eh.sectionTitle()}>
                            🏆 勝利条件
                        </Typography>
                        <div className={eh.victoryBox()}>
                            <p className={eh.victoryText()}>
                                エラーダイアログの「×」ボタンを<span className="text-base text-red-400">最初にクリック</span>した人が勝利！
                            </p>
                            <p className="text-xs mt-2 text-brand-800">
                                一瞬の判断と反射神経が勝負を分けます。<br />
                                待機中の緊張感と、エラー出現の瞬間のスリルを楽しんでください！
                            </p>
                        </div>
                    </div>

                    {/* プレイのコツ */}
                    <div className="space-y-2">
                        <Typography variant="h3" className={eh.sectionTitle()}>
                            💡 プレイのコツ
                        </Typography>
                        <ul className={eh.tipsList()}>
                            <li className={eh.listItem()}>
                                <span className="mr-2">•</span>
                                <span>画面の中央に集中して、エラーが出現する瞬間を見逃さないように！</span>
                            </li>
                            <li className={eh.listItem()}>
                                <span className="mr-2">•</span>
                                <span>マウスカーソルを画面中央付近に置いておくと、素早く反応できます</span>
                            </li>
                            <li className={eh.listItem()}>
                                <span className="mr-2">•</span>
                                <span className="text-red-400 font-semibold">フライングは無効！待機バーが消えてからクリックしましょう</span>
                            </li>
                        </ul>
                    </div>

                    {/* 閉じるボタン */}
                    <div className={eh.closeRow()}>
                        <Button variant="solid" onClick={onClose}>OK</Button>
                    </div>
                </div>
            </RoomModal>
        )
    }

    // NULL HAND用の説明
    if (gameType === 'null-hand') {
        const nh = nhModal()
        return (
            <RoomModal
                isOpen={isOpen}
                onClose={onClose}
                title="NULL HAND - ゲーム説明"
                showCloseButton
            >
                <div className={nh.outerPad()}>
                    <div className={nh.content()}>
                        {/* タイトル部 */}
                        <div className={nh.previewArea()}>
                            <div className={nh.previewGlow()} />
                            <h2 className="text-2xl font-black text-[#FF4444] tracking-[0.2em] mb-2 uppercase relative z-10">
                                NULL HAND
                            </h2>
                            <div className="flex justify-center my-2">
                                <div className="w-40 h-40">
                                    <Hand3D handType={HandType.ROCK} revealed={true} size={"small"} />
                                </div>
                            </div>
                            <p className="text-[#FF4444]/80 text-[10px] font-mono tracking-wider relative z-10">
                                PSYCHOLOGICAL ROCK-PAPER-SCISSORS
                            </p>
                        </div>

                        {/* キャッチコピー */}
                        <div className="text-center space-y-2">
                            <Typography variant="h2" className={nh.catchTitle()}>
                                👁️ 嘘を見抜け。心理を読め。
                            </Typography>
                            <Typography variant="body" className={nh.catchSub()}>
                                ホストの企みを見抜き、じゃんけんで完全勝利せよ！
                            </Typography>
                        </div>

                        {/* ゲームの流れ */}
                        <div className="space-y-3">
                            <Typography variant="h3" className={nh.sectionTitle()}>
                                <div className={nh.sectionDot()} />
                                📋 ゲームの流れ
                            </Typography>
                            <ol className={nh.flowList()}>
                                <li className={nh.listItem()}>
                                    <span className={nh.bullet()}>1.</span>
                                    <span>
                                        <strong className="text-white">ホストの選択 (CHOICE)</strong><br />
                                        ホストは提示された「SYSTEM SELECTION」かもう一つの手のどちらで勝負するかを裏で決断します。
                                    </span>
                                </li>
                                <li className={nh.listItem()}>
                                    <span className={nh.bullet()}>2.</span>
                                    <span>
                                        <strong className="text-white">ゲストの予測 &amp; 勝負 (BATTLE)</strong><br />
                                        ゲストは統計情報を参考に、ホストの「意志」を読み合い、自分の手を選択します。
                                    </span>
                                </li>
                                <li className={nh.listItem()}>
                                    <span className={nh.bullet()}>3.</span>
                                    <span>
                                        <strong className="text-white">意志の開示 (RESULT)</strong><br />
                                        ホストが実際にどちらの手を選んでいたのかが暴かれ、最終的な勝敗が確定します。
                                    </span>
                                </li>
                            </ol>
                        </div>

                        {/* ポイント配当 (REWARD SYSTEM) */}
                        <div className="space-y-3">
                            <Typography variant="h3" className={nh.sectionTitle()}>
                                <div className={nh.sectionDot()} />
                                ■ REWARD SYSTEM / ポイント配当
                            </Typography>
                            <RewardSystem
                                isHost={false}
                                userColor="#44FFFF"
                                size="md"
                                showArrow={false}
                            />
                        </div>

                        {/* プレイのコツ */}
                        <div className="space-y-2">
                            <Typography variant="h3" className={nh.sectionTitle()}>
                                <div className={nh.sectionDot()} />
                                💡 プレイのコツ
                            </Typography>
                            <ul className={nh.tipsList()}>
                                <li className={nh.listItem()}>
                                    <span className={nh.tipsBullet()}>•</span>
                                    <span>「SYSTEM SELECTION」の確率からホストの心理を読み取ろう</span>
                                </li>
                                <li className={nh.listItem()}>
                                    <span className={nh.tipsBullet()}>•</span>
                                    <span><span className="text-[#FF4444] font-semibold">裏の裏をかくか、データを信じるか...</span>駆け引きが重要です</span>
                                </li>
                                <li className={nh.listItem()}>
                                    <span className={nh.tipsBullet()}>•</span>
                                    <span className="text-[#FF4444] font-semibold">ポイント配当も重要な情報です</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 閉じるボタン */}
                <div className={nh.closeRow()}>
                    <Button variant="solid" onClick={onClose}>OK</Button>
                </div>
            </RoomModal>
        )
    }

    // STAR SHIELD用の説明
    if (gameType === 'star-shield') {
        const ss = ssModal()
        return (
            <RoomModal
                isOpen={isOpen}
                onClose={onClose}
                title="STAR SHIELD - ゲーム説明"
                showCloseButton
            >
                <div className={ss.outerPad()}>
                    <div className={ss.content()}>
                        {/* タイトル部：タイピスト／シューターで2列分割 */}
                        <div className={ss.previewArea()}>
                            <div className={ss.previewGlow()} />
                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                {/* タイピスト列 */}
                                <div
                                    className="rounded-lg p-5 flex flex-col gap-4 items-center"
                                    style={{ border: `1px solid ${ROLE_META.TYPIST.border}`, background: ROLE_META.TYPIST.bg }}
                                >
                                    <h4 className="text-xs font-bold tracking-wider" style={{ color: ROLE_META.TYPIST.text }}>
                                        タイピスト
                                    </h4>
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="flex flex-row items-center gap-3 rounded-lg px-3 py-2 bg-white/5">
                                            <div className="relative w-11 h-11 shrink-0">
                                                <Image src={ICONS.TYPIST} alt="タイピング" fill className="object-contain" />
                                            </div>
                                            <span className="text-xs font-medium text-brand-600">タイピング</span>
                                        </div>
                                        <div className="flex flex-row items-center gap-3 rounded-lg px-3 py-2 bg-white/5">
                                            <div className="relative flex items-center gap-1.5 shrink-0">
                                                <div className="relative w-9 h-9">
                                                    <Image src={ICONS.DINO} alt="恐竜" fill className="object-contain" />
                                                </div>
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: BULLET_COLOR, boxShadow: `0 0 4px ${BULLET_COLOR}` }} />
                                            </div>
                                            <span className="text-xs font-medium text-brand-600">球を発射</span>
                                        </div>
                                    </div>
                                </div>
                                {/* シューター列 */}
                                <div
                                    className="rounded-lg p-5 flex flex-col gap-4 items-center"
                                    style={{ border: `1px solid ${ROLE_META.SHOOTER.border}`, background: ROLE_META.SHOOTER.bg }}
                                >
                                    <h4 className="text-xs font-bold tracking-wider" style={{ color: ROLE_META.SHOOTER.text }}>
                                        シューター
                                    </h4>
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="flex flex-row items-center gap-3 rounded-lg px-3 py-2 bg-white/5">
                                            <div className="relative w-11 h-11 shrink-0">
                                                <Image src={ICONS.TARGET_CIRCLE} alt="エイム" fill className="object-contain" />
                                            </div>
                                            <span className="text-xs font-medium text-brand-600">エイム</span>
                                        </div>
                                        <div className="flex flex-row items-center gap-3 rounded-lg px-3 py-2 bg-white/5">
                                            <div className="relative flex items-center gap-1.5 shrink-0">
                                                <div className="relative w-9 h-9">
                                                    <Image src={ICONS.DINO} alt="恐竜" fill className="object-contain" />
                                                </div>
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: BULLET_COLOR, boxShadow: `0 0 4px ${BULLET_COLOR}` }} />
                                                <div className="relative w-9 h-9">
                                                    <Image src={ICONS.METOR} alt="隕石" fill className="object-contain" />
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-brand-600">当てる</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-16 -right-16 w-48 h-48 opacity-20 pointer-events-none">
                                <StarVisual position={{ left: '0', bottom: '0', width: '100%', height: '100%' }} />
                            </div>
                        </div>

                        {/* キャッチコピー */}
                        <div className="text-center space-y-2">
                            <Typography variant="h2" className={ss.catchTitle()}>
                                90秒隕石から星を守れ
                            </Typography>
                            <Typography variant="body" className={ss.catchSub()}>
                                2人協力！タイピング × シューティングで星を守り抜け
                            </Typography>
                        </div>

                        {/* ゲームの流れ */}
                        <div className="space-y-3">
                            <Typography variant="h3" className={ss.flowHeader()}>
                                <div className={ss.flowDot()} />
                                ゲームの流れ
                            </Typography>
                            <ol className={ss.flowList()}>
                                <li className={ss.listItem()}>
                                    <span className={ss.bullet()}>1.</span>
                                    <span>
                                        <strong className="text-white">役割選択</strong> - シューター（照準）とタイピスト（タイピング）の2役
                                    </span>
                                </li>
                                <li className={ss.listItem()}>
                                    <span className={ss.bullet()}>2.</span>
                                    <span>
                                        <strong className="text-white">タイピングで弾発射</strong> - タイピストが1文字打つごとに、シューターの照準方向へ弾が飛ぶ
                                    </span>
                                </li>
                                <li className={ss.listItem()}>
                                    <span className={ss.bullet()}>3.</span>
                                    <span>
                                        <strong className="text-white">隕石を破壊</strong> - 弾が隕石に当たるとダメージ。HP分当てると破壊
                                    </span>
                                </li>
                                <li className={ss.listItem()}>
                                    <span className={ss.bullet()}>4.</span>
                                    <span>
                                        <strong className="text-white">星を守る</strong> - 隕石が星に接触すると星のHP減少。90秒耐えればクリア！
                                    </span>
                                </li>
                            </ol>
                        </div>

                        {/* 勝利・敗北条件 */}
                        <div className="space-y-2">
                            <Typography variant="h3" className={ss.sectionTitle()}>
                                勝利・敗北条件
                            </Typography>
                            <div className={ss.victoryBox()}>
                                <p><strong className="text-green-400">クリア</strong> - 90秒間、星のHPを保ちながら隕石を破壊し続ける</p>
                                <p><strong className="text-red-400">ゲームオーバー</strong> - 隕石が星に直撃して星のHPが0になる</p>
                            </div>
                        </div>

                        {/* 必殺技 */}
                        <div className="space-y-2">
                            <Typography variant="h3" className={ss.sectionTitle()}>
                                必殺技
                            </Typography>
                            <p className="text-xs text-brand-600 pl-2">
                                1単語（1行）を打ち終えた最後の文字で、広範囲に複数発の弾が飛ぶ。難易度HELLでは全隕石を一斉破壊する必殺技が発動！
                            </p>
                        </div>

                        {/* プレイのコツ */}
                        <div className="space-y-2">
                            <Typography variant="h3" className={ss.sectionTitle()}>
                                プレイのコツ
                            </Typography>
                            <ul className={ss.tipsList()}>
                                <li className={ss.listItem()}>
                                    <span className={ss.tipsBullet()}>•</span>
                                    <span>シューターは照準を隕石に合わせ、タイピストは正確にタイピング</span>
                                </li>
                                <li className={ss.listItem()}>
                                    <span className={ss.tipsBullet()}>•</span>
                                    <span>単語完了時の必殺技でまとめて破壊しよう</span>
                                </li>
                                <li className={ss.listItem()}>
                                    <span className={ss.tipsBullet()}>•</span>
                                    <span>2人で息を合わせてプレイすることが大切</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 閉じるボタン */}
                <div className={ss.closeRow()}>
                    <Button variant="solid" onClick={onClose}>OK</Button>
                </div>
            </RoomModal>
        )
    }

    // 他のゲームタイプの説明（将来的に追加）
    return null
}
