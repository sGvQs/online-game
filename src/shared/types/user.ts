/**
 * User関連の型定義
 * Prisma schema を元に生成された型定義
 */
import { Prisma } from '@prisma/client';

// ============================================
// Base model types from Prisma
// ============================================

/** User model type */
export type User = Prisma.UserGetPayload<{}>;

/** UserIDP model type */
export type UserIDP = Prisma.UserIDPGetPayload<{}>;

// ============================================
// User types with relations
// ============================================

/** User with minimal info for display purposes */
export type UserBasic = Pick<User, 'id' | 'name' | 'email'>;

/** UserIDP with User relation */
export type UserIDPWithUser = Prisma.UserIDPGetPayload<{
    include: { user: true }
}>;
