import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import type { UserRanking } from '@/types'
import { rankingCard } from './rankingCard.styles'
import { Typography } from '@/components/ui/typography'

const styles = rankingCard()

interface RankingCardProps {
    rankings: UserRanking[]
    currentUserId?: string
}

export function RankingCard({ rankings, currentUserId }: RankingCardProps) {
    return (
        <div className={styles.wrapper()}>
            <Typography variant="h3" as="h2" className={styles.heading()}>
                <Trophy className="w-5 h-5" />
                ランキング
            </Typography>
            <ul className={styles.list()}>
                {rankings.map((r) => (
                    <li
                        key={r.userId}
                        className={`${styles.listItem()} ${currentUserId === r.userId ? styles.listItemActive() : ''}`}
                    >
                        <span className={styles.rank()}>{r.rank}位</span>
                        <span className={styles.name()}>{r.name}</span>
                        <span className={styles.points()}>{r.points}pt</span>
                    </li>
                ))}
            </ul>
            <Link href="/dashboard/ranking" className={styles.moreLink()}>
                もっと見る
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    )
}
