'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'

export type PairRanking = {
    rank: number
    user1Id: string
    user1Name: string
    user2Id: string
    user2Name: string
    bestDestroyedCount: number
}

type PairRow = {
    user1_id: string
    user2_id: string
    best_destroyed_count: bigint
}

export async function getStarShieldPairRankings(limit = 50): Promise<PairRanking[]> {
    const rows = await prisma.$queryRaw<PairRow[]>(Prisma.sql`
        SELECT
            LEAST(shooter_id, typist_id)::text  AS user1_id,
            GREATEST(shooter_id, typist_id)::text AS user2_id,
            MAX(destroyed_count) AS best_destroyed_count
        FROM star_shield_clear_records
        GROUP BY LEAST(shooter_id, typist_id), GREATEST(shooter_id, typist_id)
        ORDER BY best_destroyed_count DESC
        LIMIT ${limit}
    `)

    if (rows.length === 0) return []

    const userIds = [...new Set(rows.flatMap((r) => [r.user1_id, r.user2_id]))]
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
    })
    const nameMap = new Map(users.map((u) => [u.id, u.name ?? '???']))

    const ranked: PairRanking[] = []
    let rank = 1
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!
        const bestDestroyedCount = Number(row.best_destroyed_count)
        if (i > 0 && bestDestroyedCount < Number(rows[i - 1]!.best_destroyed_count)) {
            rank = i + 1
        }
        ranked.push({
            rank,
            user1Id: row.user1_id,
            user1Name: nameMap.get(row.user1_id) ?? '???',
            user2Id: row.user2_id,
            user2Name: nameMap.get(row.user2_id) ?? '???',
            bestDestroyedCount,
        })
    }

    return ranked
}
