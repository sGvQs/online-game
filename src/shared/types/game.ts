/**
 * Game関連の型定義
 * Prisma schema を元に生成された型定義
 */
import { Prisma } from '@prisma/client';

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
    include: { errorEvents: true }
}>;

/** Match with Room */
export type MatchWithRoom = Prisma.MatchGetPayload<{
    include: { room: true }
}>;

// ============================================
// ErrorEvent types with relations
// ============================================

/** ErrorEvent with Match */
export type ErrorEventWithMatch = Prisma.ErrorEventGetPayload<{
    include: { match: true }
}>;

/** ErrorEvent with User (winner info) */
export type ErrorEventWithUser = Prisma.ErrorEventGetPayload<{
    include: { user: true }
}>;

/** Match with ErrorEvents including User */
export type MatchWithErrorEventsAndUsers = Prisma.MatchGetPayload<{
    include: {
        errorEvents: { include: { user: true } }
    }
}>;

// ============================================
// Progress types
// ============================================

/** Match progress information */
export interface MatchProgress {
    totalErrors: number
    closedErrors: number
    scores: Record<string, number>
    events: ErrorEventWithUser[]
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
        guestHands: {
            include: {
                user: true
            }
        }
    }
}>;

/** Match with JankenEvents */
export type MatchWithJankenEvents = Prisma.MatchGetPayload<{
    include: { jankenEvents: true }
}>;

/** Match with Scores */
export type MatchWithScores = Prisma.MatchGetPayload<{
    include: {
        matchScores: {
            include: {
                user: true
            }
        }
    }
}>;

/** MatchScore with User */
export type MatchScoreWithUser = Prisma.MatchScoreGetPayload<{
    include: { user: true }
}>;

/** ホストの統計データ（Binary Reverseシステム用） */
export interface HostStats {
    reverseRate: number | null  // REVERSE率 (0-100)、null = 初プレイヤー
    totalHostCount: number      // ホストを担当した回数
}

/** ラウンド結果 */
export interface RoundResult {
    hostId: string
    hostHand: HandType
    hostChoice: HostChoice
    winners: Array<{
        userId: string
        userName: string
        hand: HandType
    }>
    isNullHand: boolean
    hostWonAll: boolean
}

/** じゃんけんのフェーズ */
export type JankenPhase = 'TITLE' | 'DEAL' | 'CHOICE' | 'BATTLE' | 'RESULT' | 'GAME_OVER';

/** 手の種類 */
export enum HandType {
    ROCK = 'ROCK',
    SCISSORS = 'SCISSORS',
    PAPER = 'PAPER',
}

/** ホストの選択（STAY: REALをそのまま / REVERSE: BLUFFに変更） */
export type HostChoice = 'STAY' | 'REVERSE';

export type UserRanking = {
    userId: string
    name: string
    wins: number
    totalGames: number
    winRate: number
    points: number
    rank: number
}

