'use server'

import { prisma } from '@/server/lib/prisma'

export type PairRanking = {
    rank: number
    shooterId: string
    shooterName: string
    typistId: string
    typistName: string
    bestDestroyedCount: number
}

export async function getStarShieldPairRankings(limit = 50): Promise<PairRanking[]> {
    const groups = await prisma.typingShootMatch.groupBy({
        by: ['shooterId', 'typistId'],
        _max: { destroyedCount: true },
        orderBy: { _max: { destroyedCount: 'desc' } },
        take: limit,
    })

    if (groups.length === 0) return []

    const userIds = [...new Set(groups.flatMap((g) => [g.shooterId, g.typistId]))]
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
    })
    const nameMap = new Map(users.map((u) => [u.id, u.name ?? '???']))

    const ranked: PairRanking[] = []
    let rank = 1
    for (let i = 0; i < groups.length; i++) {
        const g = groups[i]!
        const bestDestroyedCount = g._max.destroyedCount ?? 0
        if (i > 0 && bestDestroyedCount < (groups[i - 1]!._max.destroyedCount ?? 0)) {
            rank = i + 1
        }
        ranked.push({
            rank,
            shooterId: g.shooterId,
            shooterName: nameMap.get(g.shooterId) ?? '???',
            typistId: g.typistId,
            typistName: nameMap.get(g.typistId) ?? '???',
            bestDestroyedCount,
        })
    }

    return ranked
}
