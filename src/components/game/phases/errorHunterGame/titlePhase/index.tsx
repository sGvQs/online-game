'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { titlePhase } from './styles'
import { Typography } from '@/components/ui/typography'
import { Win95Button } from '@/components/game/common/errorHunter/win95Button'
import { Win95TitleBarButton } from '@/components/game/common/errorHunter/win95TitleBarButton'
import { RoomUserWithReadyStatus, UserRanking } from '@/types'
import { FACE_ICON_PATHS, DEFAULT_FACE_ICON } from '@/constants/common/faceIcon'

const ASCII_ART = `███████╗██████╗ ██████╗  ██████╗ ██████╗ 
██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
█████╗  ██████╔╝██████╔╝██║   ██║██████╔╝
██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗
███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝

██╗  ██╗██╗   ██╗███╗   ██╗████████╗███████╗██████╗ 
██║  ██║██║   ██║████╗  ██║╚══██╔══╝██╔═══╝██╔══██╗
███████║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
██╔══██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝`

export interface TitlePhaseProps {
    room: { users: RoomUserWithReadyStatus[] }
    rankings: UserRanking[]
    isHost: boolean
    isReady: boolean
    isTogglingReady: boolean
    showDescription: boolean
    onToggleDescription: () => void
    onToggleReady: () => void
    onStartGame: () => void
    onClose: () => void
    onLeave: () => void
    currentUserId: string
    allUsersReady: boolean
    isProcessing: boolean
}

export function TitlePhase({
    room,
    rankings,
    isHost,
    isReady,
    isTogglingReady,
    showDescription,
    onToggleDescription,
    onToggleReady,
    onStartGame,
    onClose,
    onLeave,
    currentUserId,
    allUsersReady,
    isProcessing,
}: TitlePhaseProps) {
    const styles = titlePhase()
    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length

    return (
        <div className={styles.modalOverlay()}>
            <div className={styles.modal()}>
                <div className={styles.modalInner()}>
                    <div className={styles.titlebar()}>
                        <Typography variant="label" as="span" className={styles.titlebarText()}>ERROR HUNTER</Typography>
                        {isHost && (
                            <div className={styles.titlebarButtons()}>
                                <Win95TitleBarButton onClick={onClose}>
                                    ×
                                </Win95TitleBarButton>
                            </div>
                        )}
                    </div>

                    <div className={styles.twoColumn()}>
                        <div className={styles.leftPanel()}>
                            <div className={styles.infoBox()}>
                                {!showDescription ? (
                                    <>
                                        <pre className={styles.asciiArt()}>{ASCII_ART}</pre>
                                        <div className={styles.playerStatusSection()}>
                                            <Typography variant="body" className={styles.statusTitle()}>
                                                プレイヤー準備状況: {readyCount} / {totalUsers}
                                            </Typography>
                                            <div className={styles.playerListbox()}>
                                                {[...room.users]
                                                    .sort((a, b) => {
                                                        const rankA = rankings.find((r) => r.userId === a.userId)?.rank ?? Infinity
                                                        const rankB = rankings.find((r) => r.userId === b.userId)?.rank ?? Infinity
                                                        return rankA - rankB
                                                    })
                                                    .map((roomUser: RoomUserWithReadyStatus) => {
                                                        const ranking = rankings.find((r) => r.userId === roomUser.userId)
                                                        const faceIcon = roomUser.user?.faceIcon ?? DEFAULT_FACE_ICON
                                                        const faceIconPath = FACE_ICON_PATHS[faceIcon]
                                                        return (
                                                            <div
                                                                key={roomUser.id}
                                                                className={cn(styles.playerItem(), 'gap-2')}
                                                            >
                                                                <div className={roomUser.isReady ? styles.playerRadioReady() : styles.playerRadio()} />
                                                                <Image
                                                                    src={faceIconPath}
                                                                    alt=""
                                                                    width={24}
                                                                    height={24}
                                                                    className="shrink-0 rounded-full object-contain"
                                                                />
                                                                <span>
                                                                    {roomUser.user?.name || 'Unknown'}
                                                                    {roomUser.userId === currentUserId && ' (あなた)'}
                                                                </span>
                                                                {ranking && (
                                                                    <Typography variant="caption" as="span" className="text-gray-500 ml-auto">
                                                                        {ranking.rank}位 {ranking.points}pt
                                                                    </Typography>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.descriptionContent()}>
                                        <div className={styles.infoHeader()}>
                                            <span className={styles.infoIcon()}>💡</span>
                                            <span>ゲーム説明</span>
                                        </div>
                                        <div className={styles.descriptionText()}>
                                            ERROR HUNTERは、画面に出現する47個のエラーモーダルを素早く閉じる反射神経ゲームです。<br />
                                            <br />
                                            <strong>ルール:</strong><br />
                                            ・全47個のエラーが一斉に画面上に出現します<br />
                                            ・各プレイヤーは素早くエラーの×ボタンをクリック<br />
                                            ・最も多くのエラーを閉じたプレイヤーが勝利<br />
                                            ・全員で協力して全てのエラーを閉じましょう！<br />
                                            ・何回か押さないと閉じないものもあるよ<br />
                                            ・↑はprismaの限界だから許してね<br />
                                            <br />
                                            準備ができたら「準備完了」ボタンを押してください。
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.rightPanel()}>
                            <Win95Button
                                className={cn(styles.panelButton(), showDescription && styles.buttonPressed())}
                                onClick={onToggleDescription}
                                pressed={showDescription}
                            >
                                What's ERROR HUNTER
                            </Win95Button>

                            <div className={styles.buttonSpacer()} />

                            <Win95Button
                                className={cn(styles.panelButton(), isReady && '!bg-[#008000] !text-white')}
                                onClick={onToggleReady}
                                disabled={isTogglingReady}
                            >
                                準備完了
                            </Win95Button>

                            {isHost && (
                                <Win95Button
                                    className={styles.panelButton()}
                                    onClick={onStartGame}
                                    disabled={isProcessing || !allUsersReady}
                                >
                                    ゲーム開始
                                </Win95Button>
                            )}

                            {isHost && (
                                <Win95Button
                                    className={styles.panelButton()}
                                    onClick={onClose}
                                >
                                    Close
                                </Win95Button>
                            )}

                            {!isHost && (
                                <Win95Button
                                    className={styles.panelButton()}
                                    onClick={onLeave}
                                >
                                    LEAVE
                                </Win95Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
