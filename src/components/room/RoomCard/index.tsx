import { Room } from '@/shared/types'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Trash2, Play } from 'lucide-react'
import { roomCard, emptyState } from './styles'

interface RoomCardProps {
    room: Room
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
    return (
        <div className={styles.wrapper()}>
            {/* Glow effect on hover */}
            <div className={styles.glowOverlay()} />

            <div className={styles.header()}>
                <h3 className={styles.title()}>
                    {room.name}
                </h3>
                <div className={styles.dateWrapper()}>
                    <span className={styles.dateBadge()}>
                        {new Date(room.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                </div>
            </div>

            <div className={styles.footer()}>
                <div className={styles.actions()}>
                    {isOwner && (
                        <form action={onDelete}>
                            <IconButton
                                type="submit"
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                                tooltip="削除"
                            />
                        </form>
                    )}
                    <form action={onJoin}>
                        <Button size="sm" className={styles.joinButton()}>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            参加
                        </Button>
                    </form>
                </div>
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
            <div className={emptyStyles.icon()}>🎮</div>
            <h3 className={emptyStyles.title()}>現在アクティブなルームはありません</h3>
            <p className={emptyStyles.description()}>
                まだルームが作成されていません。新しいゲームルームを作成して、最初のプレイヤーになりましょう！
            </p>
        </div>
    )
}
