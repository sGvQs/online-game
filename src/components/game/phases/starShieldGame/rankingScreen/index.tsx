'use client'

import Link from 'next/link'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import type { PairRanking } from '@/server/actions/game/starShieldRankingActions'
import { rankingScreen } from './styles'

const MEDALS = ['🥇', '🥈', '🥉']

interface StarShieldRankingScreenProps {
    roomId: string
    rankings: PairRanking[]
    memberUserIds: string[]
}

export function StarShieldRankingScreen({ roomId, rankings, memberUserIds }: StarShieldRankingScreenProps) {
    const styles = rankingScreen()

    const isMemberPair = (r: PairRanking) =>
        (memberUserIds.includes(r.shooterId) && memberUserIds.includes(r.typistId))

    return (
        <div className={styles.container()}>
            <AuroraGlow width={600} height={300} opacity={0.2} blur={50} />

            <div className={styles.inner()}>
                <div className={styles.header()}>
                    <Link href={`/game/${roomId}/star-shield`} className={styles.backButton()}>
                        ← ロビーに戻る
                    </Link>
                </div>

                <div>
                    <h1 className={styles.title()}>🏆 隕石破壊数ランキング</h1>
                    <p className={styles.subtitle()}>ペア（シューター &amp; タイピスト）ごとの最高記録</p>
                </div>

                {rankings.length === 0 ? (
                    <p className={styles.emptyState()}>まだ記録がありません</p>
                ) : (
                    <ol className={styles.list()}>
                        {rankings.map((r) => {
                            const isMe = isMemberPair(r)
                            return (
                                <li key={`${r.shooterId}-${r.typistId}`} className={isMe ? styles.myRankRow() : styles.rankRow()}>
                                    {r.rank <= 3 ? (
                                        <span className={styles.medalBadge()}>{MEDALS[r.rank - 1]}</span>
                                    ) : (
                                        <span className={styles.rankNum()}>{r.rank}</span>
                                    )}
                                    <span className={isMe ? styles.myPairName() : styles.pairName()}>
                                        {r.shooterName} &amp; {r.typistName}
                                    </span>
                                    {isMe && <span className={styles.myBadge()}>あなたたち</span>}
                                    <span className={styles.destroyedCount()}>{r.bestDestroyedCount}個</span>
                                </li>
                            )
                        })}
                    </ol>
                )}
            </div>
        </div>
    )
}
