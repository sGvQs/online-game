/**
 * Room関連アクションの一括エクスポート
 */

// 取得系
export { getRooms } from './getRooms'
export { getRoom, getRoomWithUsers, getRoomUsers } from './getRoom'

// 作成・削除
export { createRoom } from './createRoom'
export { deleteRoom } from './deleteRoom'
export { cleanupAbandonedRooms } from './cleanupAbandonedRooms'

// ルーム削除通知
export {
    getUnreadRoomDeletedNotifications,
    markRoomDeletedNotificationsAsRead,
} from './roomDeletedNotifications'

// 参加・退出・追放
export { joinRoom, leaveRoom, kickUserFromRoom } from './joinLeaveRoom'

// ゲーム関連
export { selectGame, returnToRoom, clearCurrentMatch } from './gameActions'

// 準備完了関連
export { toggleReady, getRoomWithReadyStatus, resetAllReady } from './readyActions'
