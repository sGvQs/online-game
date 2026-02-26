import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import type { UserRanking } from '@/shared/types/game'

interface RankingCardProps {
    rankings: UserRanking[]
    currentUserId?: string
}

export function RankingCard({ rankings, currentUserId }: RankingCardProps) {
    return (
        <div className="glass-card p-3 rounded-2xl shrink-0 w-full lg:w-[180px] self-start">
            <h2 className="text-sm font-bold mb-2 text-brand-900 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                月間
            </h2>
            <ul className="space-y-0.5 mb-2 max-h-[240px] overflow-y-auto">
                {rankings.map((r) => (
                    <li
                        key={r.userId}
                        className={`flex items-center gap-1 py-0.5 px-1.5 rounded text-xs ${
                            currentUserId === r.userId ? 'bg-brand-300/20' : ''
                        }`}
                    >
                        <span className="font-bold text-brand-700 w-5 shrink-0 text-[10px]">
                            {r.rank}
                        </span>
                        <span className="truncate flex-1 min-w-0">{r.name}</span>
                        <span className="text-brand-600 shrink-0 text-[10px]">{r.points}pt</span>
                    </li>
                ))}
            </ul>
            <Link
                href="/dashboard/ranking"
                className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-brand-600 hover:text-brand-500"
            >
                もっと見る
                <ChevronRight className="w-3 h-3" />
            </Link>
        </div>
    )
}
