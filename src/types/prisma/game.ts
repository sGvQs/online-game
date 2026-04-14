/**
 * Game関連の型定義
 * Prisma schema を元に生成された型定義
 */
import { Prisma } from "@prisma/client";

// ============================================
// Base model types from Prisma
// ============================================

/** ErrorEvent model type */
export type ErrorEvent = Prisma.ErrorEventGetPayload<{}>;

/** Match model type */
export type Match = Prisma.MatchGetPayload<{}>;

// ============================================
// Match types with relations
// ============================================

/** Match with ErrorEvents */
export type MatchWithErrorEvents = Prisma.MatchGetPayload<{
	include: { errorEvents: true };
}>;

/** Match with Room */
export type MatchWithRoom = Prisma.MatchGetPayload<{
	include: { room: true };
}>;

// ============================================
// ErrorEvent types with relations
// ============================================

/** ErrorEvent with Match */
export type ErrorEventWithMatch = Prisma.ErrorEventGetPayload<{
	include: { match: true };
}>;

/** ErrorEvent with User (winner info) */
export type ErrorEventWithUser = Prisma.ErrorEventGetPayload<{
	include: { user: true };
}>;

/** Match with ErrorEvents including User */
export type MatchWithErrorEventsAndUsers = Prisma.MatchGetPayload<{
	include: {
		errorEvents: { include: { user: true } };
	};
}>;

// ============================================
// Progress types
// ============================================

/** Match progress information */
export interface MatchProgress {
	totalErrors: number;
	closedErrors: number;
	scores: Record<string, number>;
	events: ErrorEventWithUser[];
}

// ============================================
// NULL HAND (じゃんけん) types
// ============================================

/** JankenEvent model type */
export type JankenEvent = Prisma.JankenEventGetPayload<{}>;

/** GuestHand model type */
export type GuestHand = Prisma.GuestHandGetPayload<{}>;

/** JankenLog model type */
export type JankenLog = Prisma.JankenLogGetPayload<{}>;

/** MatchScore model type (ポイント管理) */
export type MatchScore = Prisma.MatchScoreGetPayload<{}>;

/** JankenEvent with GuestHands including User */
export type JankenEventWithGuests = Prisma.JankenEventGetPayload<{
	include: {
		match: { include: { nullHandMatch: true } };
		guestHands: {
			include: {
				user: true;
			};
		};
	};
}>;

/** Match with JankenEvents */
export type MatchWithJankenEvents = Prisma.MatchGetPayload<{
	include: { jankenEvents: true };
}>;

/** Match with Scores */
export type MatchWithScores = Prisma.MatchGetPayload<{
	include: {
		matchScores: {
			include: {
				user: true;
			};
		};
	};
}>;

/** MatchScore with User */
export type MatchScoreWithUser = Prisma.MatchScoreGetPayload<{
	include: { user: true };
}>;

/** ホストの統計データ（Binary Reverseシステム用） */
export interface HostStats {
	reverseRate: number | null; // REVERSE率 (0-100)、null = 初プレイヤー
	totalHostCount: number; // ホストを担当した回数
}

/** ラウンド結果 */
export interface RoundResult {
	hostId: string;
	hostHand: HandType;
	hostChoice: HostChoice;
	winners: Array<{
		userId: string;
		userName: string;
		hand: HandType;
	}>;
	isNullHand: boolean;
	hostWonAll: boolean;
}

/** じゃんけんのフェーズ */
export type JankenPhase =
	| "TITLE"
	| "DEAL"
	| "CHOICE"
	| "BATTLE"
	| "RESULT"
	| "GAME_OVER";

/** 手の種類 */
export enum HandType {
	ROCK = "ROCK",
	SCISSORS = "SCISSORS",
	PAPER = "PAPER",
}

/** ホストの選択（STAY: REALをそのまま / REVERSE: BLUFFに変更） */
export type HostChoice = "STAY" | "REVERSE";

export type UserRanking = {
	userId: string;
	name: string;
	wins: number;
	totalGames: number;
	winRate: number;
	points: number;
	rank: number;
};

// ============================================
// METEOR BUSTERS types
// ============================================

export type MeteorBustersMatch = Prisma.MeteorBustersMatchGetPayload<{}>;

export type MeteorDifficulty = "EASY" | "NORMAL" | "HARD";

export type MeteorBulletType = "A" | "B" | "C";

export type MeteorBustersPhase = "TITLE" | "PLAYING" | "RESULT";

/** 隕石の軌道トラックインデックス（ORBIT_TRACKS 配列の添字） */
export type MeteorOrbitTrack = number;

export interface MeteorObject {
	id: string;
	type: MeteorBulletType;
	hp: number;
	maxHp: number;
	/** 軌道トラック（nano / inner / mid / main / outer / huge） */
	orbitTrack: MeteorOrbitTrack;
	/** 軌道上の現在角度（ラジアン） */
	angle: number;
	/** Y方向のオフセット（px）バラつき演出用 */
	yOffset: number;
	/** スポーン時刻（performance.now() ベース） */
	spawnTime: number;
	/** 軌道の所要時間（ms） */
	orbitDurationMs: number;
	/** 出発角度（ラジアン） */
	spawnAngle: number;
	/** 終着角度（ラジアン）。この角度に達したら missed 扱い */
	collisionAngle: number;
	destroyed: boolean;
}

export interface PlayerCursorState {
	playerId: string;
	x: number;
	y: number;
	bulletType: MeteorBulletType;
}

export interface MeteorBustersResult {
	destroyedCount: number;
	spawnedCount: number;
	destroyRate: number;
	isCleared: boolean;
}

export interface BulletAnim {
	id: string;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	angle: number;       // rotation in degrees (toward target)
	durationSec: number;
	color: string;       // CSS color value (matches active bullet type)
}
