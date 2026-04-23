/**
 * 型定義の一括エクスポート
 *
 * 使用例:
 * import { Room, User, RoomStatus } from '@/types'
 */

// User関連
export type {
	User,
	UserIDP,
	UserBasic,
	UserIDPWithUser,
} from "./prisma/user";

// Room関連
export type {
	Room,
	RoomUser,
	RoomUserWithUser,
	RoomUserWithReadyStatus,
	RoomWithUsers,
	RoomWithUsersAndReadyStatus,
	RoomWithMatches,
	RoomWithCreator,
} from "./prisma/room";
export { RoomStatus } from "./prisma/room";
export type { RoomStatus as RoomStatusType } from "./prisma/room";

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
	HostChoice,
	RoundResult,
	JankenPhase,
	UserRanking,
	MeteorBustersMatch,
	MeteorDifficulty,
	MeteorBulletType,
	MeteorBustersPhase,
	MeteorOrbitTrack,
	MeteorObject,
	PlayerCursorState,
	MeteorBustersResult,
	BulletAnim,
	DinoShotAnim,
} from "./prisma/game";
// enumは値としてexportが必要
export { HandType } from "./prisma/game";

// StarShieldGame
export type {
	Difficulty,
	GameResult,
	GameStats,
	Asteroid,
	Bullet,
	DialogueLine,
	GameStatePayload,
	GameEndPayload,
} from "./starShieldGame";
