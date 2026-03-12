'use client'

import { Users } from 'lucide-react'
import { RoomUserWithUser, UserRanking } from '@/types'
import { MemberItem } from '../memberItem'
import { memberListCard } from '../memberItem/styles'
import { Typography } from '@/components/ui/typography'

const styles = memberListCard()

interface MemberListViewProps {
    members: RoomUserWithUser[]
    rankingsMap?: Map<string, UserRanking>
    isHost?: boolean
    currentUserId?: string
    roomCreatorId?: string
    onKick?: (userId: string) => void
    kickingUserId?: string | null
}

/**
 * メンバーリスト表示コンポーネント
 *
 * ホストの場合はゲストに追放ボタンを表示
 */
export function MemberList({
    members,
    rankingsMap,
    isHost,
    currentUserId,
    roomCreatorId,
    onKick,
    kickingUserId,
}: MemberListViewProps) {
    return (
        <div className={styles.wrapper()}>
            <div className={styles.header()}>
                <Typography variant="h3" font='dot-gothic-16' className={styles.title()}>
                    <Users className="w-4 h-4" />
                    メンバー
                </Typography>
                <span className={styles.count()}>
                    {members.length}
                </span>
            </div>

            <ul className={styles.list()}>
                {[...members]
                    .sort((a, b) => {
                        if (!rankingsMap) return 0
                        const rankA = rankingsMap.get(a.userId)?.rank ?? Infinity
                        const rankB = rankingsMap.get(b.userId)?.rank ?? Infinity
                        return rankA - rankB
                    })
                    .map((member: RoomUserWithUser) => {
                        const showKickButton = Boolean(
                            isHost &&
                            roomCreatorId &&
                            currentUserId &&
                            member.userId !== roomCreatorId &&
                            member.userId !== currentUserId
                        )
                        return (
                            <MemberItem
                                key={member.id}
                                member={member}
                                ranking={rankingsMap?.get(member.userId)}
                                showKickButton={showKickButton}
                                onKick={showKickButton && onKick ? () => onKick(member.userId) : undefined}
                                isKicking={kickingUserId === member.userId}
                            />
                        )
                    })}
            </ul>
        </div>
    )
}
