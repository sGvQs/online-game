/**
 * 型定義の一括エクスポート
 * 
 * 使用例:
 * import { Room, User, RoomStatus } from '@/shared/types'
 */

// User関連
export type {
    User,
    UserIDP,
    UserBasic,
    UserIDPWithUser,
} from './user';

// Room関連
export type {
    Room,
    RoomUser,
    RoomUserWithUser,
    RoomWithUsers,
    RoomWithMatches,
} from './room';
export { RoomStatus } from './room';
export type { RoomStatus as RoomStatusType } from './room';

// Game関連
export type {
    ErrorEvent,
    Match,
    MatchWithErrorEvents,
    MatchWithRoom,
    ErrorEventWithMatch,
    ErrorEventWithUser,
    MatchWithErrorEventsAndUsers,
    MatchProgress,
} from './game';
