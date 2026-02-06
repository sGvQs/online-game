/**
 * Game関連の型定義
 * Prisma schema を元に生成された型定義
 */
import { Prisma } from '@prisma/client';

// ============================================
// Base model types from Prisma
// ============================================

/** ErrorEvent model type */
export type ErrorEvent = Prisma.error_eventsGetPayload<{}>;

/** Match model type */
export type Match = Prisma.matchesGetPayload<{}>;

// ============================================
// Match types with relations
// ============================================

/** Match with ErrorEvents */
export type MatchWithErrorEvents = Prisma.matchesGetPayload<{
    include: { error_events: true }
}>;

/** Match with Room */
export type MatchWithRoom = Prisma.matchesGetPayload<{
    include: { rooms: true }
}>;

// ============================================
// ErrorEvent types with relations
// ============================================

/** ErrorEvent with Match */
export type ErrorEventWithMatch = Prisma.error_eventsGetPayload<{
    include: { matches: true }
}>;

/** ErrorEvent with User (winner info) */
export type ErrorEventWithUser = Prisma.error_eventsGetPayload<{
    include: { users: true }
}>;

/** Match with ErrorEvents including User */
export type MatchWithErrorEventsAndUsers = Prisma.matchesGetPayload<{
    include: {
        error_events: { include: { users: true } }
    }
}>;
