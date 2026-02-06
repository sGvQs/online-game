'use client'

import { Users } from 'lucide-react'
import { RoomUserWithUser } from '@/shared/types'
import { MemberItem } from '../MemberItem'
import { memberListCard } from '../MemberItem/styles'

const styles = memberListCard()

interface MemberListViewProps {
    members: RoomUserWithUser[]
}

/**
 * メンバーリスト表示コンポーネント（Presentational）
 * 
 * 状態管理・リアルタイム購読は親コンポーネント（RoomPageClient）で行う
 */
export function MemberListView({ members }: MemberListViewProps) {
    return (
        <div className={styles.wrapper()}>
            <div className={styles.header()}>
                <h3 className={styles.title()}>
                    <Users className="w-4 h-4" />
                    参加者
                </h3>
                <span className={styles.count()}>
                    {members.length}
                </span>
            </div>

            <ul className={styles.list()}>
                {members.map(member => (
                    <MemberItem key={member.id} member={member} />
                ))}
            </ul>
        </div>
    )
}
