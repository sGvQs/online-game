'use server'

import { prisma } from '@/server/lib/prisma'
import { UserRanking } from '@/shared/types/game'
import { Prisma } from '@prisma/client'

/**
 * 指定されたユーザーIDの月間ランキング情報を取得する
 * 
 * @param userIds - ランキングを取得したいユーザーのIDリスト
 * @returns ユーザーごとのランキング情報
 */
export async function getNullHandRankings(userIds: string[]): Promise<UserRanking[]> {
    if (userIds.length === 0) return []

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // 指定されたユーザーの月間ランキング情報を取得
    const rankings = await prisma.monthlyRanking.findMany({
        where: {
            year,
            month,
        },
        include: {
            user: true
        },
        orderBy: {
            totalPoints: 'desc'
        }
    })

    // ランキングの順位を計算して、要求されたユーザーのみをフィルタリングして返す
    // （同じポイントの場合は同順位にするため、ループで計算）
    let currentRank = 1
    let previousPoints = -1
    let tieCount = 0

    const rankedUsersMap = new Map<string, UserRanking>()

    rankings.forEach((ranking, index) => {
        if (previousPoints !== ranking.totalPoints) {
            currentRank = index + 1
            tieCount = 0
            previousPoints = ranking.totalPoints
        } else {
            tieCount++
        }

        rankedUsersMap.set(ranking.userId, {
            userId: ranking.userId,
            name: ranking.user.name,
            points: ranking.totalPoints,
            rank: currentRank,
            // 互換性のため残す
            wins: 0,
            totalGames: 0,
            winRate: 0,
        })
    })

    // 指定されたユーザーのリストに対して、ランキングがあればそれを返し、なければデフォルト（圏外: 0位, 0pt）を返す
    return userIds.map(userId => {
        const found = rankedUsersMap.get(userId)
        if (found) return found

        return {
            userId,
            name: 'Unknown', // 名前はフロントエンドで保持しているためダミーで可
            points: 0,
            rank: rankings.length + 1, // 現在の最下位より下（今回は一律で最下位の次とするか、0で圏外とする等）
            wins: 0,
            totalGames: 0,
            winRate: 0,
        }
    })
}

