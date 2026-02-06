/**
 * Room関連の型定義
 * Prisma schema を元に生成された型定義
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

/** Room model type */
export type Room = Prisma.RoomGetPayload<{}>;

/** RoomUser model type */
export type RoomUser = Prisma.RoomUserGetPayload<{}>;

// ============================================
// RoomUser types with relations
// ============================================

/** RoomUser with User relation */
export type RoomUserWithUser = Prisma.RoomUserGetPayload<{
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
