"use server";

import { prisma } from "@/server/lib/prisma";
import { GameType, MatchStatus } from "@prisma/client";
import { getAuthenticatedUser } from "../_helpers/getAuthenticatedUser";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "HELL" | "ABYSS";

const SPAWN_RATES: Record<Difficulty, number> = {
	EASY: 0.5,
	NORMAL: 1,
	HARD: 1.5,
	HELL: 2,
	ABYSS: 2,
};

const CLEAR_POINTS: Record<Difficulty, number> = {
	EASY: 1,
	NORMAL: 2,
	HARD: 3,
	HELL: 4,
	ABYSS: 0, // ABYSS はウェーブ報酬で付与するためクリア時は 0
};

/** HELL 解放に必要な隕石破壊数 */
const HELL_UNLOCK_THRESHOLD = 200;

/**
 * 現在の月間ランキング情報（ポイントと順位）を取得
 */
export async function getMonthlyRankingInfo(
	userId: string,
): Promise<{ points: number; rank: number }> {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const ranking = await prisma.monthlyRanking.findUnique({
		where: { userId_year_month: { userId, year, month } },
	});

	if (!ranking) return { points: 0, rank: 0 };

	const rank = await prisma.monthlyRanking.count({
		where: {
			year,
			month,
			totalPoints: { gt: ranking.totalPoints },
		},
	});

	return { points: ranking.totalPoints, rank: rank + 1 };
}
/** ABYSS 解放に必要な隕石破壊数 */
const ABYSS_UNLOCK_THRESHOLD = 500;
/** ABYSS ボス撃破ごとに付与するポイント */
const ABYSS_POINTS_PER_WAVE = 5;

const GAME_DURATION_SECONDS = 90;

/**
 * STAR SHIELD セットアップ画面用マッチ作成
 * ロビーから「START」を押したときに呼ばれる
 */
export async function createStarShieldSetupMatch(
	roomId: string,
	roles: { shooterId: string; typistId: string },
): Promise<{ matchId: string }> {
	const user = await getAuthenticatedUser();

	const room = await prisma.room.findUnique({
		where: { id: roomId },
		include: { users: true },
	});

	if (!room) throw new Error("ルームが見つかりません");
	if (room.createdBy !== user.id)
		throw new Error("ゲームを開始する権限がありません（ホストのみ）");
	if (room.users.length < 2) throw new Error("2人以上必要です");

	const { shooterId, typistId } = roles;
	const userIds = new Set(room.users.map((u) => u.userId));
	if (!userIds.has(shooterId) || !userIds.has(typistId)) {
		throw new Error("指定されたプレイヤーがルームに含まれていません");
	}
	if (shooterId === typistId) {
		throw new Error("Shooter と Typist は別のプレイヤーである必要があります");
	}

	const match = await prisma.match.create({
		data: {
			roomId,
			gameType: GameType.STAR_SHIELD,
			status: MatchStatus.SETUP,
		},
	});

	await prisma.typingShootMatch.create({
		data: {
			matchId: match.id,
			shooterId,
			typistId,
			characterName: "dinosaur",
			difficulty: "NORMAL",
			targetAsteroidCount: 0,
		},
	});

	await prisma.room.update({
		where: { id: roomId },
		data: { currentMatchId: match.id },
	});

	return { matchId: match.id };
}

/**
 * STAR SHIELD セットアップ中の役職・難易度更新
 */
export async function updateStarShieldSetupMatch(
	matchId: string,
	updates: { shooterId?: string; typistId?: string; difficulty?: Difficulty },
): Promise<void> {
	await getAuthenticatedUser();
	const match = await prisma.match.findUnique({ where: { id: matchId } });
	if (!match || match.status !== MatchStatus.SETUP) return; // 無視

	await prisma.typingShootMatch.update({
		where: { matchId },
		data: {
			shooterId: updates.shooterId,
			typistId: updates.typistId,
			difficulty: updates.difficulty,
		},
	});
}

/**
 * STAR SHIELD ゲーム開始（セットアップ完了）
 * ホストのみ実行可能
 */
export async function startStarShieldMatch(
	matchId: string,
): Promise<{ startedAt: number; shooterId: string; typistId: string }> {
	const user = await getAuthenticatedUser();

	const match = await prisma.match.findUnique({
		where: { id: matchId },
		include: { room: true },
	});

	if (!match) throw new Error("マッチが見つかりません");
	if (match.room.createdBy !== user.id)
		throw new Error("ゲームを開始する権限がありません（ホストのみ）");
	if (match.status !== MatchStatus.SETUP) throw new Error("既に開始されています");

	const tsm = await prisma.typingShootMatch.findUnique({ where: { matchId } });
	if (!tsm) throw new Error("TypingShootMatchが見つかりません");

	const shooterId = tsm.shooterId;
	const typistId = tsm.typistId;

	if (tsm.difficulty === "HELL") {
		const unlocked = await isHellUnlocked(shooterId, typistId);
		if (!unlocked) {
			throw new Error(
				"HELL難易度は解放されていません（隕石破壊数200以上のクリアで解放）",
			);
		}
	}

	if (tsm.difficulty === "ABYSS") {
		const unlocked = await isAbyssUnlocked(shooterId, typistId);
		if (!unlocked) {
			throw new Error(
				"ABYSS難易度は解放されていません（隕石破壊数500以上のクリアで解放）",
			);
		}
	}

	const spawnRate = SPAWN_RATES[tsm.difficulty as Difficulty];
	const targetAsteroidCount = Math.floor(GAME_DURATION_SECONDS * spawnRate);
	const startedAt = new Date();

	await prisma.match.update({
		where: { id: matchId },
		data: { status: MatchStatus.PLAYING },
	});

	await prisma.typingShootMatch.update({
		where: { matchId },
		data: {
			targetAsteroidCount,
			startedAt,
		},
	});

	return {
		startedAt: startedAt.getTime(),
		shooterId,
		typistId,
	};
}

/**
 * STAR SHIELD マッチ情報取得（非ホストがゲーム開始時刻を取得するために使用）
 */
export async function getStarShieldMatchInfo(
	matchId: string,
): Promise<{ startedAt: number }> {
	const match = await prisma.match.findUnique({
		where: { id: matchId },
		select: { createdAt: true },
	});
	return { startedAt: match?.createdAt.getTime() ?? Date.now() };
}

/** リロード時に match ステータスを確認し、終了済みなら結果を返す */
export async function getStarShieldMatchStatus(matchId: string): Promise<
	| {
			status: "setup";
			shooterId: string;
			typistId: string;
			difficulty: Difficulty;
	  }
	| {
			status: "playing";
			startedAt: number;
			shooterId: string;
			typistId: string;
	  }
	| {
			status: "finished";
			startedAt: number;
			shooterId: string;
			result: "CLEARED" | "FAILED_CONTACT";
			stats: {
				spawnedCount: number;
				destroyedCount: number;
				durationSeconds: number;
			};
			difficulty: Difficulty;
	  }
	| { status: "not_found" }
> {
	const match = await prisma.match.findUnique({
		where: { id: matchId },
		include: { typingShootMatch: true, room: { include: { users: true } } },
	});

	if (!match) return { status: "not_found" };

	const tsm = match.typingShootMatch;
	if (!tsm) {
		// Fallback for some reason
		const typistId =
			match.room.users.find((u) => u.userId !== match.room.createdBy)?.userId ||
			match.room.createdBy;
		return {
			status: "playing",
			startedAt: match.createdAt.getTime(),
			shooterId: match.room.createdBy,
			typistId,
		};
	}

	if (match.status === MatchStatus.SETUP) {
		return {
			status: "setup",
			shooterId: tsm.shooterId,
			typistId: tsm.typistId,
			difficulty: tsm.difficulty as Difficulty,
		};
	}

	const startedAt = tsm.startedAt.getTime();

	if (!tsm.endedAt) {
		return {
			status: "playing",
			startedAt,
			shooterId: tsm.shooterId,
			typistId: tsm.typistId,
		};
	}

	const result: "CLEARED" | "FAILED_CONTACT" = tsm.isCleared
		? "CLEARED"
		: "FAILED_CONTACT";

	return {
		status: "finished",
		startedAt,
		shooterId: tsm.shooterId,
		result,
		stats: {
			spawnedCount: tsm.spawnedCount,
			destroyedCount: tsm.destroyedCount,
			durationSeconds: tsm.durationSeconds ?? 0,
		},
		difficulty: tsm.difficulty as Difficulty,
	};
}

interface SaveStarShieldResultData {
	spawnedCount: number;
	destroyedCount: number;
	fireCount: number;
	isCleared: boolean;
	failureReason?: string;
	durationSeconds: number;
	difficulty?: Difficulty;
}

/**
 * STAR SHIELD ゲーム結果を保存する
 * シューティング側がゲーム終了時に呼び出す
 */
export async function saveStarShieldResult(
	matchId: string,
	data: SaveStarShieldResultData,
): Promise<{ difficulty: Difficulty }> {
	const existing = await prisma.typingShootMatch.findUnique({
		where: { matchId },
	});
	const {
		spawnedCount,
		destroyedCount,
		fireCount,
		isCleared,
		failureReason,
		durationSeconds,
		difficulty: dataDifficulty,
	} = data;
	const accuracyRate = spawnedCount > 0 ? destroyedCount / spawnedCount : 0;
	const updateData = {
		spawnedCount,
		destroyedCount,
		isCleared,
		failureReason: failureReason ?? null,
		accuracyRate,
		durationSeconds,
		endedAt: new Date(),
	};

	let shooterId: string;
	let typistId: string;
	const diff: Difficulty = existing
		? (existing.difficulty as Difficulty)
		: (dataDifficulty ?? "NORMAL");

	if (existing) {
		shooterId = existing.shooterId;
		typistId = existing.typistId;
		await prisma.typingShootMatch.update({
			where: { matchId },
			data: updateData,
		});
	} else {
		const match = await prisma.match.findUnique({
			where: { id: matchId },
			include: { room: { include: { users: true } } },
		});
		if (!match) {
			console.warn(
				"[saveStarShieldResult] Match not found (may have been deleted):",
				matchId,
			);
			return { difficulty: diff };
		}

		shooterId = match.room.createdBy;
		const typistUser = match.room.users.find((u) => u.userId !== shooterId);
		if (!typistUser) throw new Error("Typist not found in room");
		typistId = typistUser.userId;

		await prisma.typingShootMatch.create({
			data: {
				matchId,
				shooterId,
				typistId,
				characterName: "dinosaur",
				difficulty: diff,
				targetAsteroidCount: Math.floor(
					GAME_DURATION_SECONDS * SPAWN_RATES[diff],
				),
				...updateData,
			},
		});
	}

	await prisma.match.update({
		where: { id: matchId },
		data: { status: MatchStatus.FINISHED },
	});

	// ABYSS: クリア概念なし。ゲームオーバー時にランキング用記録を保存
	if (diff === "ABYSS" && !isCleared) {
		try {
			await prisma.$executeRaw`
                INSERT INTO star_shield_clear_records (shooter_id, typist_id, destroyed_count, difficulty)
                VALUES (${shooterId}, ${typistId}, ${destroyedCount}, ${diff})
            `;
		} catch (e) {
			console.warn(
				"[saveStarShieldResult] ABYSS star_shield_clear_records への保存に失敗:",
				e,
			);
		}
	}

	// EASY/NORMAL/HARD/HELL 成功時: 両プレイヤーに難易度に応じた pt を加算し、クリア記録を保存
	// ※ポイント付与を先に行う（star_shield_clear_records が未作成の環境でもポイントは付与される）
	if (isCleared) {
		const points = CLEAR_POINTS[diff];
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;

		await Promise.all(
			[shooterId, typistId].flatMap((userId) => [
				prisma.monthlyRanking.upsert({
					where: {
						userId_year_month: {
							userId,
							year,
							month,
						},
					},
					update: { totalPoints: { increment: points } },
					create: {
						userId,
						year,
						month,
						totalPoints: points,
					},
				}),
				prisma.pointLog.create({
					data: {
						userId,
						amount: points,
						gameType: "STAR_SHIELD",
						reason: "CLEARED",
					},
				}),
			]),
		);

		// クリア記録（HELL解放判定用）。テーブル未作成時はエラーを握りつぶす
		try {
			await prisma.$executeRaw`
                INSERT INTO star_shield_clear_records (shooter_id, typist_id, destroyed_count, difficulty)
                VALUES (${shooterId}, ${typistId}, ${destroyedCount}, ${diff})
            `;
		} catch (e) {
			console.warn(
				"[saveStarShieldResult] star_shield_clear_records への保存に失敗（マイグレーション未適用の可能性）:",
				e,
			);
		}
	}

	// Typist の typing 数を通貨として加算
	if (fireCount > 0) {
		try {
			await prisma.starShieldUserProgress.upsert({
				where: { userId: typistId },
				update: { totalTypingCount: { increment: fireCount } },
				create: { userId: typistId, totalTypingCount: fireCount },
			});
		} catch (e) {
			console.warn(
				"[saveStarShieldResult] star_shield_user_progress への typing 加算に失敗:",
				e,
			);
		}
	}

	return { difficulty: diff };
}

/**
 * HELL 難易度が解放されているか（シューター＋タイピストのペアで隕石破壊数200以上の記録があるか）
 */
export async function isHellUnlocked(
	shooterId: string,
	typistId: string,
): Promise<boolean> {
	// $queryRaw を使用（Prisma 7 + adapter 環境で starShieldClearRecord が undefined になる問題を回避）
	const rows = await prisma.$queryRaw<unknown[]>`
        SELECT 1 FROM star_shield_clear_records
        WHERE destroyed_count >= ${HELL_UNLOCK_THRESHOLD}
        AND (
            (shooter_id = ${shooterId} AND typist_id = ${typistId})
            OR (shooter_id = ${typistId} AND typist_id = ${shooterId})
        )
        LIMIT 1
    `;
	return rows.length > 0;
}

/**
 * ABYSS 難易度が解放されているか（ペアで隕石破壊数500以上の記録があるか）
 */
export async function isAbyssUnlocked(
	shooterId: string,
	typistId: string,
): Promise<boolean> {
	const rows = await prisma.$queryRaw<unknown[]>`
        SELECT 1 FROM star_shield_clear_records
        WHERE destroyed_count >= ${ABYSS_UNLOCK_THRESHOLD}
        AND (
            (shooter_id = ${shooterId} AND typist_id = ${typistId})
            OR (shooter_id = ${typistId} AND typist_id = ${shooterId})
        )
        LIMIT 1
    `;
	return rows.length > 0;
}

/**
 * HELL・ABYSS の解放状態を1クエリで取得する
 */
export async function getUnlockStatus(
	shooterId: string,
	typistId: string,
): Promise<{ hellUnlocked: boolean; abyssUnlocked: boolean }> {
	const rows = await prisma.$queryRaw<{ max_destroyed: number }[]>`
        SELECT COALESCE(MAX(destroyed_count), 0) AS max_destroyed
        FROM star_shield_clear_records
        WHERE (
            (shooter_id = ${shooterId} AND typist_id = ${typistId})
            OR (shooter_id = ${typistId} AND typist_id = ${shooterId})
        )
    `;
	const max = rows[0]?.max_destroyed ?? 0;
	return {
		hellUnlocked: max >= HELL_UNLOCK_THRESHOLD,
		abyssUnlocked: max >= ABYSS_UNLOCK_THRESHOLD,
	};
}

/**
 * ABYSS ボス撃破時にポイントを付与する（シューター側がウェーブ完了時に呼ぶ）
 */
export async function awardAbyssWavePoints(matchId: string): Promise<void> {
	const tsm = await prisma.typingShootMatch.findUnique({ where: { matchId } });
	if (!tsm) return;

	const { shooterId, typistId } = tsm;
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;

	await Promise.all(
		[shooterId, typistId].flatMap((userId) => [
			prisma.monthlyRanking.upsert({
				where: { userId_year_month: { userId, year, month } },
				update: { totalPoints: { increment: ABYSS_POINTS_PER_WAVE } },
				create: { userId, year, month, totalPoints: ABYSS_POINTS_PER_WAVE },
			}),
			prisma.pointLog.create({
				data: {
					userId,
					amount: ABYSS_POINTS_PER_WAVE,
					gameType: "STAR_SHIELD",
					reason: "ABYSS_WAVE_CLEAR",
				},
			}),
		]),
	);
}
