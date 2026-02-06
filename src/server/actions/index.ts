/**
 * Server Actions 一括エクスポート
 * 
 * 注意: 'use server'は各アクションファイルに記述されているため、
 * この再エクスポートファイルには不要
 *
 * 使用例:
 * import { createRoom, getRooms } from '@/server/actions'
 */

// User関連
export { getCurrentUser } from './user/getCurrentUser'
export { getMe } from './user/getMe'
export { getDashboardUser, updateName } from './user'

// Room関連
export {
    getRooms,
    getRoom,
    getRoomWithUsers,
    getRoomUsers,
    createRoom,
    deleteRoom,
    joinRoom,
    leaveRoom,
    selectGame,
    returnToRoom,
} from './room'

// Auth関連
export { syncUser } from './auth'

// Game関連
export {
    startGame,
    clickError,
    getMatchWithEvents,
    finishGame,
} from './game'
