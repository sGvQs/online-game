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
