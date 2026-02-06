import { RoomUserWithUser } from '@/types'
import { memberItem } from './member-item.styles'

const styles = memberItem()

interface MemberItemProps {
    member: RoomUserWithUser
}

/**
 * MemberItem - メンバー情報を表示するPresentational Component
 * ロジックは持たず、Propsを受け取って表示するだけ
 */
export function MemberItem({ member }: MemberItemProps) {
    return (
        <li className={styles.wrapper()}>
            <div className={styles.avatar()}>
                {member.user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className={styles.info()}>
                <p className={styles.name()}>
                    {member.user.name}
                </p>
                <p className={styles.status()}>
                    参加中
                </p>
            </div>
            <div className={styles.indicator()} />
        </li>
    )
}
