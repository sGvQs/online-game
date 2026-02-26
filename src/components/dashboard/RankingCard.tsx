import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import type { UserRanking } from '@/shared/types/game'

interface RankingCardProps {
    rankings: UserRanking[]
    currentUserId?: string
}

export function RankingCard({ rankings, currentUserId }: RankingCardProps) {
    return (
        <div className="glass-card p-5 rounded-2xl shrink-0 w-full self-start">
            <h2 className="text-lg font-bold mb-4 text-brand-900 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                ランキング
            </h2>
            <ul className="space-y-1.5 mb-4 max-h-[280px] overflow-y-auto">
                {rankings.map((r) => (
                    <li
                        key={r.userId}
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm ${
                            currentUserId === r.userId ? 'bg-brand-300/30' : ''
                        }`}
                    >
                        <span className="font-bold text-brand-700 w-7 shrink-0 text-sm">
                            {r.rank}位
                        </span>
                        <span className="truncate flex-1 min-w-0 font-medium">{r.name}</span>
                        <span className="text-brand-600 shrink-0 text-sm font-semibold">{r.points}pt</span>
                    </li>
                ))}
            </ul>
            <Link
                href="/dashboard/ranking"
                className="flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 py-2"
            >
                もっと見る
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    )
}
