/**
 * 恐竜の文言リスト - 一覧
 *
 * 各用途ごとの恐竜メッセージをまとめて管理。
 * 詳細は各ファイルを参照。
 */

// ログイン画面
export {
    DIALOGUE_MESSAGES_CACHE_RESET,
    DIALOGUE_MESSAGES_INCOGNITO,
    DIALOGUE_MESSAGES_VISIT_0,
    DIALOGUE_MESSAGES_VISIT_1_PLUS,
    DIALOGUE_MESSAGES_RETURNING,
    LP_DINOSAUR_MESSAGES,
} from './dinosaurLoginMessages'

// ルーム作成時
export { CREATE_ROOM_MESSAGES, getRandomCreateRoomMessage } from './createRoomMessages'

// ルーム入室時
export {
    SELF_ENTRY_MESSAGES,
    OTHER_JOIN_MESSAGES,
    getRandomSelfEntryMessage,
    getRandomOtherJoinMessage,
} from './roomEntryMessages'

// ルーム削除時
export { getComplaintMessageForRoomName } from './roomDeletedComplaints'

// タイピングイベント用
export { getRandomDinosaurRoomName } from './dinosaurTypingRoomNames'

export const TYPING_MODE_MESSAGES = [
    'もじ。',
    'なんか。',
    'でてる。',
    '……。',
    'カタ。',
    'カタカタ。',
    'ひかってる。',
    'たぶん。',
    'あ。',
    'へへ。',
    'まだ。',
    'あ、もじが。',
    'キーが。',
    'なにか。',
    'なんかうってる。',
]

/**
 * 配列からメッセージをランダムに取得する
 */
export const getRandomTypingMessage = () => {
    const randomIndex = Math.floor(Math.random() * TYPING_MODE_MESSAGES.length);
    return TYPING_MODE_MESSAGES[randomIndex];
};
