/**
 * Game関連の型定義
 * Prisma schema を元に生成された型定義
 */
import { Prisma } from "@prisma/client";

// ============================================
// Base model types from Prisma
// ============================================

/** Match model type */
export type Match = Prisma.MatchGetPayload<{}>;

// ============================================
// Match types with relations
// ============================================

/** Match with Room */
export type MatchWithRoom = Prisma.MatchGetPayload<{
	include: { room: true };
}>;

export type UserRanking = {
	userId: string;
	name: string;
	wins: number;
	totalGames: number;
	winRate: number;
	points: number;
	rank: number;
};
