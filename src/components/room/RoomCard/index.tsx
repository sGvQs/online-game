import type { Room, RoomUser } from '@/shared/types'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Trash2, Play, Users } from 'lucide-react'
import { roomCard, emptyState } from './styles'

export type RoomWithUsers = Room & { users: RoomUser[] }

interface RoomCardProps {
    room: RoomWithUsers
    isOwner: boolean
    onJoin: () => void
    onDelete: () => void
}

const styles = roomCard()
const emptyStyles = emptyState()

/**
 * RoomCard - ルーム情報を表示するPresentational Component
 * ロジックは持たず、Propsを受け取って表示するだけ
 */
export function RoomCard({ room, isOwner, onJoin, onDelete }: RoomCardProps) {
    const isPlaying = room.status === 'PLAYING'
    const participantCount = room.users?.length ?? 0

    return (
        <div className={styles.wrapper()}>
            <div className={styles.glowOverlay()} />

            <div className={styles.main()}>
                <h3 className={styles.title()}>{room.name}</h3>
                <div className={styles.meta()}>
                    <span
                        className={`${styles.statusBadge()} ${
                            isPlaying ? styles.statusPlaying() : styles.statusLobby()
                        }`}
                    >
                        {isPlaying ? 'ゲーム中' : '待機中'}
                    </span>
                    <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" />
                        {participantCount}人
                    </span>
                </div>
            </div>

            <div className={styles.actions()}>
                {isOwner ? (
                    <form action={onDelete}>
                        <IconButton
                            type="submit"
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            tooltip="削除"
                        />
                    </form>
                ) : (
                    <div />
                )}
                <form action={onJoin}>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isPlaying}
                        title={isPlaying ? 'ゲーム中は参加できません' : undefined}
                        className={`${styles.joinButton()} ${isPlaying ? styles.joinButtonDisabled() : ''}`}
                    >
                        <Play className="w-3 h-3 fill-current" />
                        参加
                    </Button>
                </form>
            </div>
        </div>
    )
}

/**
 * RoomListEmptyState - ルームがない場合の空状態を表示
 */
export function RoomListEmptyState() {
    return (
        <div className={emptyStyles.wrapper()}>
            <div className={emptyStyles.icon()}>
                <Image
                    src="/svg/object/games-control.svg"
                    alt=""
                    width={96}
                    height={96}
                    className="mx-auto"
                />
            </div>
            <h3
                className={emptyStyles.title()}
                style={{ color: '#ffffff', fontFamily: 'var(--font-cherry-bomb-one)' }}
            >
                いまはだれもあそんでないな。
            </h3>
            <p
                className={emptyStyles.description()}
                style={{ color: '#ffffff', fontFamily: 'var(--font-cherry-bomb-one)' }}
            >
               でもいいんだよ。きみがるーむつくると、きっとみんなあつまってくるからさ。
            </p>
        </div>
    )
}
