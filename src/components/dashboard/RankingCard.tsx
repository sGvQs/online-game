import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import type { UserRanking } from '@/shared/types/game'

interface RankingCardProps {
    rankings: UserRanking[]
    currentUserId?: string
}

export function RankingCard({ rankings, currentUserId }: RankingCardProps) {
    return (
        <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 text-brand-900 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                月間ランキング
            </h2>
            <ul className="space-y-2 mb-4">
                {rankings.map((r) => (
                    <li
                        key={r.userId}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm ${
                            currentUserId === r.userId ? 'bg-brand-300/20 border border-brand-200/30' : ''
                        }`}
                    >
                        <span className="font-bold text-brand-700 w-6 shrink-0">
                            {r.rank}位
                        </span>
                        <span className="truncate flex-1 mx-2">{r.name}</span>
                        <span className="text-brand-600 shrink-0">{r.points}pt</span>
                    </li>
                ))}
            </ul>
            <Link
                href="/dashboard/ranking"
                className="flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors"
            >
                もっと見る
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    )
}
