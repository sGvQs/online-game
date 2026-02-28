/**
 * ルーム名に応じた文句メッセージ
 * 修正方針：
 * - ひらがなとカタカナのみ
 * - 説教しない
 * - 褒めない
 * - 感情を語らない
 * - 短く、未完成
 * - ただそこにいるだけ
 */

const ROOM_NAME_SPECIFIC_COMPLAINTS: Record<string, string[]> = {
    test: [
        'てすと、か。',
        'あたらしいことをためしてたんだ。',
        'はじめてみたんだ。',
    ],
    テスト: [
        'テスト。',
        'なにか、ためしてた。',
        'そういうときもあるんだ。',
    ],
    とりあえず: [
        'とりあえず。',
        'そっか、そっか。',
        'まあ、いいか。',
    ],
    あああ: [
        'あああ、か。',
        '……。',
        'そういうきもちもある。',
    ],
    123: [
        'いちにさん。',
        'いっこずつ。',
        'かぞえてたんだ。',
    ],
}

/**
 * ルーム削除時の汎用メッセージ
 * 修正方針：
 * - ひらがなとカタカナのみ
 * - 相手を分析しない
 * - ただ事実を述べる
 * - 断片的
 */

const GENERAL_COMPLAINTS = [
    'へやが、なくなった。',
    'あのへや。',
    'だれも、こなかったんだ。',
    'かたづけておいた。',
    'ぼくが。',
    'そういうときもある。',
    'つくってた。',
    'きみが。',
    'もう、いいのか。',
    'また、つくる？',
    'へや。',
    'ぷかぷか。',
    'あ。',
]

/**
 * ルーム名に応じた文句メッセージを1つ返す
 */
export function getComplaintMessageForRoomName(roomName: string): string {
    const normalized = roomName.trim().toLowerCase()
    const specific = ROOM_NAME_SPECIFIC_COMPLAINTS[normalized] ?? ROOM_NAME_SPECIFIC_COMPLAINTS[roomName.trim()]

    if (specific && specific.length > 0) {
        return specific[Math.floor(Math.random() * specific.length)]!
    }

    return GENERAL_COMPLAINTS[Math.floor(Math.random() * GENERAL_COMPLAINTS.length)]!
}
