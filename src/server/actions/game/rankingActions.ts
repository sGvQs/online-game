"use server";

import { prisma } from "@/server/lib/prisma";
import { UserRanking } from "@/types";

/**
 * 指定されたユーザーIDの月間ランキング情報を取得する（ゲーム共通）
 *
 * @param userIds - ランキングを取得したいユーザーのIDリスト
 * @returns ユーザーごとのランキング情報
 */
export async function getRoomMemberRankings(
	userIds: string[],
): Promise<UserRanking[]> {
	if (userIds.length === 0) return [];

	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;

	// 指定されたユーザーの月間ランキング情報を取得
	const rankings = await prisma.monthlyRanking.findMany({
		where: {
			year,
			month,
		},
		include: {
			user: true,
		},
		orderBy: {
			totalPoints: "desc",
		},
	});

	// ランキングの順位を計算して、要求されたユーザーのみをフィルタリングして返す
	// （同じポイントの場合は同順位にするため、ループで計算）
	let currentRank = 1;
	let previousPoints = -1;
	let tieCount = 0;

	const rankedUsersMap = new Map<string, UserRanking>();

	rankings.forEach((ranking: (typeof rankings)[number], index: number) => {
		if (previousPoints !== ranking.totalPoints) {
			currentRank = index + 1;
			tieCount = 0;
			previousPoints = ranking.totalPoints;
		} else {
			tieCount++;
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
		});
	});

	// 指定されたユーザーのリストに対して、ランキングがあればそれを返し、なければデフォルト（圏外: 0位, 0pt）を返す
	return userIds.map((userId) => {
		const found = rankedUsersMap.get(userId);
		if (found) return found;

		return {
			userId,
			name: "Unknown", // 名前はフロントエンドで保持しているためダミーで可
			points: 0,
			rank: rankings.length + 1, // 現在の最下位より下（今回は一律で最下位の次とするか、0で圏外とする等）
			wins: 0,
			totalGames: 0,
			winRate: 0,
		};
	});
}

/**
 * 月間ランキングの上位 N 件を取得（同順位対応）
 * @param limit - 取得件数（未指定時は全件）
 */
export async function getTopRankings(limit?: number): Promise<UserRanking[]> {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;

	const rankings = await prisma.monthlyRanking.findMany({
		where: { year, month },
		include: { user: true },
		orderBy: { totalPoints: "desc" },
		take: limit ?? undefined,
	});

	let currentRank = 1;
	let previousPoints = -1;

	return rankings.map((ranking: (typeof rankings)[number], index: number) => {
		if (previousPoints !== ranking.totalPoints) {
			currentRank = index + 1;
			previousPoints = ranking.totalPoints;
		}
		return {
			userId: ranking.userId,
			name: ranking.user.name,
			points: ranking.totalPoints,
			rank: currentRank,
			wins: 0,
			totalGames: 0,
			winRate: 0,
		};
	});
}

// ============================================
// 世界ランキング関連取得（ユーザー単体）
// ============================================

export type UserRankingInfo = {
	rank: number;
	totalPoints: number;
	year: number;
	month: number;
};

/**
 * ユーザーの現在の月間ランキングと累計ポイントを取得
 */
export async function getMonthlyRanking(
	userId: string,
): Promise<UserRankingInfo | null> {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;

	const userRanking = await prisma.monthlyRanking.findUnique({
		where: {
			userId_year_month: {
				userId,
				year,
				month,
			},
		},
	});

	if (!userRanking) {
		return {
			rank: 0,
			totalPoints: 0,
			year,
			month,
		};
	}

	// 自分より高いポイントを持っている人の数を数える（+1で順位になる）
	const higherRankingCount = await prisma.monthlyRanking.count({
		where: {
			year,
			month,
			totalPoints: {
				gt: userRanking.totalPoints,
			},
		},
	});

	return {
		rank: higherRankingCount + 1,
		totalPoints: userRanking.totalPoints,
		year,
		month,
	};
}
