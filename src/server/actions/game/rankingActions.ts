'use server'

import { prisma } from '@/server/lib/prisma'
import { UserRanking } from '@/shared/types/game'
import { Prisma } from '@prisma/client'

/**
 * 指定されたユーザーIDのランキング情報を取得する
 * ランキングは (勝利数 * 勝率) で計算されるポイントに基づく
 * 
 * @param userIds - ランキングを取得したいユーザーのIDリスト
 * @returns ユーザーごとのランキング情報
 */
export async function getNullHandRankings(userIds: string[]): Promise<UserRanking[]> {
    if (userIds.length === 0) return []

    // ポイント計算ロジック:
    // Points = Wins * (Wins / TotalGames)
    // 勝率 = Wins / TotalGames

    // 注意: raw query なのでテーブル名やカラム名はDBの実際の名前を使用する
    // JankenLog -> janken_logs
    // User -> users
    // userId -> user_id, isWinning -> is_winning

    const rankings = await prisma.$queryRaw<any[]>`
        WITH UserStats AS (
            SELECT
                user_id,
                COUNT(*) as total_games,
                COUNT(CASE WHEN is_winning = true THEN 1 END) as wins
            FROM janken_logs
            GROUP BY user_id
        ),
        UserPoints AS (
            SELECT
                user_id,
                wins,
                total_games,
                CASE
                    WHEN total_games = 0 THEN 0
                    ELSE (CAST(wins AS DOUBLE PRECISION) * (CAST(wins AS DOUBLE PRECISION) / total_games))
                END as points,
                CASE
                    WHEN total_games = 0 THEN 0
                    ELSE (CAST(wins AS DOUBLE PRECISION) / total_games)
                END as win_rate
            FROM UserStats
        ),
        RankedUsers AS (
            SELECT
                user_id,
                wins,
                total_games,
                win_rate,
                points,
                RANK() OVER (ORDER BY points DESC) as rank
            FROM UserPoints
        )
        SELECT
            ru.user_id,
            u.name,
            ru.wins,
            ru.total_games,
            ru.win_rate,
            ru.points,
            ru.rank
        FROM RankedUsers ru
        JOIN users u ON ru.user_id = u.id
        WHERE ru.user_id IN (${Prisma.join(userIds)})
    `

    // BigInt等の変換が必要な場合があるが、このクエリの結果は通常の数値またはDouble
    // rankはBigIntで返ってくる可能性がある

    return rankings.map((r: any) => ({
        userId: r.user_id,
        name: r.name,
        wins: Number(r.wins),
        totalGames: Number(r.total_games),
        winRate: Number(r.win_rate),
        points: Number(r.points), // 小数点以下が含まれる可能性あり
        rank: Number(r.rank)
    }))
}
