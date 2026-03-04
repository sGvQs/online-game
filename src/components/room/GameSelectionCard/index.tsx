import Image from 'next/image'
import { Gamepad2, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getPlayerRangeLabel } from '@/constants/room/gamePlayerRequirements'
import { gameSelection, waitingCard } from './styles'

const styles = gameSelection()

interface GameSelectionCardProps {
    onSelectGame: (gameType: string) => void
    isPending: boolean
    isHost: boolean
}

/**
 * GameSelectionCard - ゲーム選択UIのPresentational Component
 */
export function GameSelectionCard({ onSelectGame, isPending, isHost }: GameSelectionCardProps) {
    return (
        <div className={styles.wrapper()}>
            <h3 className={styles.header()}>
                <Gamepad2 className={styles.headerIcon()} />
                {isHost ? 'ゲームを選択' : 'ゲーム一覧'}
            </h3>
            <div className={styles.grid()}>
                <Button
                    onClick={() => onSelectGame('error-hunter')}
                    disabled={isPending}
                    className={styles.gameButton({ class: styles.errorHunterButton() })}
                >
                    <span className={styles.gameIcon()}>
                        <Image src="/svg/object/old-pc.svg" alt="" width={48} height={48} className="object-contain" />
                    </span>
                    <div className={styles.gameInfo()}>
                        <div className={styles.gameTitle()}>ERROR HUNTER</div>
                        <div className={styles.gameDescription()}>
                            <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {getPlayerRangeLabel('error-hunter')}
                            </span>
                            {' · '}
                            {isHost ? 'バグを見つけて潰せ！' : 'クリックでルールを表示'}
                        </div>
                    </div>
                </Button>
                <Button
                    onClick={() => onSelectGame('null-hand')}
                    disabled={isPending}
                    className={styles.gameButton({ class: styles.nullHandButton() })}
                >
                    <div className={styles.nullHandBg()} />
                    <span className={styles.gameIcon()}>
                        <Image src="/svg/object/null-hand.svg" alt="" width={48} height={48} className="object-contain" />
                    </span>
                    <div className={styles.gameInfo()}>
                        <div className={styles.gameTitle()}>NULL HAND</div>
                        <div className={styles.gameDescription()}>
                            <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {getPlayerRangeLabel('null-hand')}
                            </span>
                            {' · '}
                            {isHost ? '心理戦で相手を欺け' : 'クリックでルールを表示'}
                        </div>
                    </div>
                </Button>
                <Button
                    onClick={() => onSelectGame('star-shield')}
                    disabled={isPending}
                    className={styles.gameButton({ class: styles.starShieldButton() })}
                >
                    <div className={styles.starShieldBg()} />
                    <span className={styles.gameIcon()}>
                        <Image src="/svg/object/target-circle.svg" alt="" width={48} height={48} className="object-contain" />
                    </span>
                    <div className={styles.gameInfo()}>
                        <div className={styles.gameTitle()}>STAR SHIELD</div>
                        <div className={styles.gameDescription()}>
                            <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {getPlayerRangeLabel('star-shield')}
                            </span>
                            {' · '}
                            {isHost ? '90秒生き延びて星を守れ' : 'クリックでルールを表示'}
                        </div>
                    </div>
                </Button>
            </div>
            {isPending && (
                <div className={styles.loadingText()}>
                    ゲームを開始中...
                </div>
            )}
        </div>
    )
}
