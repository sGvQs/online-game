"use server";

import { prisma } from "@/server/lib/prisma";
import { GameType, MatchStatus } from "@prisma/client";
import { getAuthenticatedUser } from "../_helpers/getAuthenticatedUser";
import type { MeteorDifficulty } from "@/types";

const DIFFICULTY_POINTS: Record<MeteorDifficulty, number> = {
	EASY: 3,
	NORMAL: 5,
	HARD: 8,
};

const DIFFICULTY_SPAWN_COUNT: Record<MeteorDifficulty, number> = {
	EASY: 15,
	NORMAL: 20,
	HARD: 30,
};

/**
 * Meteor Busters マッチ開始
 * ホストのみ実行可能
 */
export async function startMeteorBustersMatch(
	roomId: string,
	difficulty: MeteorDifficulty,
) {
	const user = await getAuthenticatedUser();

	const room = await prisma.room.findUnique({ where: { id: roomId } });
	if (!room) throw new Error("ルームが見つかりません");
	if (room.createdBy !== user.id)
		throw new Error("ゲームを開始する権限がありません（ホストのみ）");

	const totalSpawnCount = DIFFICULTY_SPAWN_COUNT[difficulty];

	const match = await prisma.match.create({
		data: {
			roomId,
			gameType: GameType.METEOR_BUSTERS,
			status: MatchStatus.PLAYING,
			meteorBustersMatch: {
				create: {
					difficulty,
					totalSpawnCount,
				},
			},
		},
		include: { meteorBustersMatch: true },
	});

	await prisma.room.update({
		where: { id: roomId },
		data: { currentMatchId: match.id },
	});

	return match;
}

/**
 * ゲーム終了: スコア集計・ポイント付与
 */
export async function finishMeteorBustersMatch(
	matchId: string,
	roomId: string,
	destroyedCount: number,
	spawnedCount: number,
) {
	const room = await prisma.room.findUnique({
		where: { id: roomId },
		include: { users: true },
	});
	if (!room) throw new Error("ルームが見つかりません");

	const destroyRate =
		spawnedCount > 0 ? destroyedCount / spawnedCount : 0;
	const isCleared = destroyRate >= 0.8;

	const meteorBustersMatch = await prisma.meteorBustersMatch.findUnique({
		where: { matchId },
	});
	if (!meteorBustersMatch) throw new Error("マッチが見つかりません");

	const difficulty = meteorBustersMatch.difficulty as MeteorDifficulty;
	const points = isCleared ? DIFFICULTY_POINTS[difficulty] : 0;

	const now = new Date();

	await prisma.$transaction(async (tx) => {
		// MeteorBustersMatch 更新
		await tx.meteorBustersMatch.update({
			where: { matchId },
			data: {
				spawnedCount,
				destroyedCount,
				destroyRate,
				isCleared,
				endedAt: now,
			},
		});

		// Match を FINISHED に
		await tx.match.update({
			where: { id: matchId },
			data: { status: MatchStatus.FINISHED },
		});

		// Room の currentMatchId をクリア
		await tx.room.update({
			where: { id: roomId },
			data: { currentMatchId: null },
		});

		if (points > 0) {
			const currentYearMonth = {
				year: now.getFullYear(),
				month: now.getMonth() + 1,
			};

			for (const roomUser of room.users) {
				const userId = roomUser.userId;

				// MatchScore 記録
				await tx.matchScore.upsert({
					where: { matchId_userId: { matchId, userId } },
					create: { matchId, userId, points },
					update: { points },
				});

				// MonthlyRanking 加算
				await tx.monthlyRanking.upsert({
					where: {
						userId_year_month: {
							userId,
							...currentYearMonth,
						},
					},
					create: {
						userId,
						...currentYearMonth,
						totalPoints: points,
					},
					update: {
						totalPoints: { increment: points },
					},
				});

				// PointLog 記録
				await tx.pointLog.create({
					data: {
						userId,
						amount: points,
						gameType: "METEOR_BUSTERS",
						reason: "CLEAR",
					},
				});
			}
		}
	});

	return { destroyRate, isCleared, points };
}

/**
 * マッチ情報取得
 */
export async function getMeteorBustersMatch(matchId: string) {
	return prisma.meteorBustersMatch.findUnique({ where: { matchId } });
}
