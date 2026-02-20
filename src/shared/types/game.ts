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

/** ホストの統計データ（本物と表示用） */
export interface HostStats {
    favoriteHand: HandType | null  // null = 初プレイヤー
    changeRate: number | null      // 変える確率 (0-100), null = 初プレイヤー
    totalGames: number
    // 偽装前の本物のデータ（SETUP画面で表示用）
    realFavoriteHand?: HandType | null
    realChangeRate?: number | null
}

/** 偽装の詳細情報 */
export interface FakeDetails {
    fakeHandValue?: HandType | null
    fakeChangeRateValue?: number | null
    fakeFavoriteHandValue?: HandType | null
}

/** ラウンド結果 */
export interface RoundResult {
    hostId: string
    hostHand: HandType
    winners: Array<{
        userId: string
        userName: string
        hand: HandType
    }>
    hostWonAll: boolean
}

/** じゃんけんのフェーズ */
export type JankenPhase = 'TITLE' | 'SETUP' | 'SHOWCASE' | 'FINAL_DECISION' | 'BATTLE' | 'RESULT' | 'GAME_OVER';

/** 手の種類 */
export enum HandType {
    ROCK = 'ROCK',
    SCISSORS = 'SCISSORS',
    PAPER = 'PAPER',
}

/** 嘘の対象 */
// ... existing types
export type FakeTarget = 'NONE' | 'INITIAL_HAND' | 'CHANGE_RATE' | 'FAVORITE_HAND';

export type UserRanking = {
    userId: string
    name: string
    wins: number
    totalGames: number
    winRate: number
    points: number
    rank: number
}

