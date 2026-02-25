/** ルーム名に応じた文句メッセージ（特定ルーム名は小馬鹿に） */
const ROOM_NAME_SPECIFIC_COMPLAINTS: Record<string, string[]> = {
    test: [
        '「test」って……君、名前つけるのすら面倒だったんだね。化石級のネーミングセンスだよ。',
        '「test」で部屋作って放置？ テストする気あったの？ 僕の忍耐力のテストだったなら合格だよ。',
    ],
    テスト: [
        '「テスト」で部屋作るなんて、本気で遊ぶ気なかったでしょ。……消しといた。次はちゃんと名前つけな。',
        '「テスト」って名前、君の本気度が透けて見えるよ。……片付けてあげた。感謝しな。',
    ],
    とりあえず: [
        '「とりあえず」で部屋作って放置？ とりあえず何？ とりあえず忘れた？……消しといたよ。',
        '「とりあえず」って、君の人生のテーマなの？……部屋もとりあえず片付けた。',
    ],
    あああ: [
        '「あああ」……キーボードの左上、3回押しただけだね。その程度の労力で部屋作るな。',
        '「あああ」で部屋作るなんて、僕が「がおー」って言うのと同じレベルだよ。……消した。',
    ],
    123: [
        '「123」……数字3つで部屋作るなんて、君の創造力も3つくらいしかないんだね。',
        '「123」で部屋作って放置？ 数えるのすら面倒だったでしょ。……片付けた。',
    ],
}

/** 汎用のルーム削除文句 */
const GENERAL_COMPLAINTS = [
    '部屋作って放置したまま忘れてたんじゃない？ 誰かが消してあげたよ。感謝しな。',
    '君の作った部屋、誰も来なかったから化石になってた。……片付けてあげたよ。',
    '部屋を作って放置するなんて、僕の巣を荒らしたまま逃げる奴と同じだよ。……まあ、消しといた。',
    '部屋作ってほったらかし？ 君のその態度、絶滅した恐竜よりたちが悪いよ。……消した。',
    '誰も来ない部屋、ずっと置いといたんだ。……僕が片付けてあげた。礼言いな。',
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
