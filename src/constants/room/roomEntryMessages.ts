/**
 * 自分がルームに入室した時の恐竜のメッセージ
 * 修正方針：
 * - ひらがなとカタカナのみ
 * - リズムの崩れを入れる
 * - 意味になりかける断片を混ぜる
 * - 空間の揺れを出す
 * - 反応はあるけど意味を作らない
 * - 相手を確定しない、関係を作らない
 */

export const SELF_ENTRY_MESSAGES = [
    'あ。',
    'なんかいる。',
    'ぷか。',
    '……。',
    'ふえた。',
    'へへ。',
    'ずれる。',
    'まる。',
    'あ、あ。',
    'ここ。',
    'ちょっと。',
    'いた。',
    'へや。',
    'うえ。',
    'ぷかぷか。',
]

/**
 * 誰かがルームに入室した時の恐竜のメッセージ
 * 修正方針：
 * - ひらがなとカタカナのみ
 * - リズムの崩れを入れる（あ、あ、あ。など）
 * - 意味になりかける断片を混ぜる
 * - 空間の揺れを出す
 * - 反応はあるけど意味を作らない
 * - 相手を確定しない、関係を作らない
 */

export const OTHER_JOIN_MESSAGES = [
    'あ。',
    'いる、いる。',
    'ふたり。',
    'ぷか。',
    'ちょっと。',
    '……。',
    'あ、あ、あ。',
    'ずれる。',
    'なんかいる。',
    'へへ。',
    'ふえた。',
    'ここ。',
    'あ。',
    'ぷかぷか。',
    'うえ。',
    'いた、いた。',
    '……あ。',
    'ちがう。',
    'へや。',
    'あ、あ。',
]

function getRandomFrom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!
}

/** 自分が入室した時に表示するメッセージを1つランダムに返す */
export function getRandomSelfEntryMessage(): string {
    return getRandomFrom(SELF_ENTRY_MESSAGES)
}

/** 誰かが入室した時に表示するメッセージを1つランダムに返す */
export function getRandomOtherJoinMessage(): string {
    return getRandomFrom(OTHER_JOIN_MESSAGES)
}
