/**
 * Type definitions for Prisma data used in Next.js pages
 * These types match the data returned by backend services
 * 
 * NOTE: Prisma schema を元に生成された型定義です。
 * @prisma/client からインポートすることで、スキーマと自動的に同期されます。
 */
import { Prisma, RoomStatus as PrismaRoomStatus } from '@prisma/client';

// ============================================
// Enums from Prisma
// ============================================

/** ゲームの進行状況 */
export type RoomStatus = PrismaRoomStatus;

// Re-export for convenience
export const RoomStatus = {
    LOBBY: 'LOBBY' as const,
    PLAYING: 'PLAYING' as const,
    FINISHED: 'FINISHED' as const,
} as const;

// ============================================
// Base model types from Prisma
// ============================================

/** User model type */
export type User = Prisma.UserGetPayload<{}>;

/** Room model type */
export type Room = Prisma.RoomGetPayload<{}>;

/** RoomUser model type */
export type RoomUser = Prisma.RoomUserGetPayload<{}>;

/** UserIDP model type */
export type UserIDP = Prisma.UserIDPGetPayload<{}>;

/** ErrorEvent model type */
export type ErrorEvent = Prisma.error_eventsGetPayload<{}>;

/** Match model type */
export type Match = Prisma.matchesGetPayload<{}>;

// ============================================
// User types with relations
// ============================================

/** User with minimal info for display purposes */
export type UserBasic = Pick<User, 'id' | 'name' | 'email'>;

// ============================================
// RoomUser types with relations
// ============================================

/** RoomUser with User relation */
export type RoomUserWithUser = Prisma.RoomUserGetPayload<{
    include: { user: true }
}>;

// ============================================
// UserIDP types with relations
// ============================================

/** UserIDP with User relation */
export type UserIDPWithUser = Prisma.UserIDPGetPayload<{
    include: { user: true }
}>;

// ============================================
// Room types with relations
// ============================================

/** Room with Users and Creator */
export type RoomWithUsers = Prisma.RoomGetPayload<{
    include: {
        users: {
            include: { user: true }
        }
        creator: true
    }
}>;

/** Room with Matches */
export type RoomWithMatches = Prisma.RoomGetPayload<{
    include: { matches: true }
}>;

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
