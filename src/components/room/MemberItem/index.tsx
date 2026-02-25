import Image from 'next/image'
import { RoomUserWithUser, UserRanking } from '@/shared/types'
import { FACE_ICON_PATHS, DEFAULT_FACE_ICON } from '@/shared/constants/faceIcon'
import { memberItem } from './styles'

const styles = memberItem()

interface MemberItemProps {
    member: RoomUserWithUser
    ranking?: UserRanking
}

/**
 * MemberItem - メンバー情報を表示するPresentational Component
 * ロジックは持たず、Propsを受け取って表示するだけ
 */
export function MemberItem({ member, ranking }: MemberItemProps) {
    const statusText = ranking
        ? `${ranking.rank}位 ${ranking.points}pt`
        : '参加中'

    const faceIcon = member.user.faceIcon ?? DEFAULT_FACE_ICON
    const faceIconPath = FACE_ICON_PATHS[faceIcon]

    return (
        <li className={styles.wrapper()}>
            <div className={`${styles.avatar()} relative overflow-hidden`}>
                <Image
                    src={faceIconPath}
                    alt={member.user.name}
                    fill
                    className="object-contain"
                />
            </div>
            <div className={styles.info()}>
                <p className={styles.name()}>
                    {member.user.name}
                </p>
                <p className={styles.status()}>
                    {statusText}
                </p>
            </div>
            <div className={styles.indicator()} />
        </li>
    )
}
