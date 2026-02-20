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
    RoomUserWithReadyStatus,
    RoomWithUsers,
    RoomWithUsersAndReadyStatus,
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
    JankenEvent,
    GuestHand,
    JankenLog,
    MatchScore,
    JankenEventWithGuests,
    MatchWithJankenEvents,
    MatchWithScores,
    MatchScoreWithUser,
    HostStats,
    FakeDetails,
    RoundResult,
    JankenPhase,
    FakeTarget,
    UserRanking,
} from './game';
// enumは値としてexportが必要
export { HandType } from './game';

