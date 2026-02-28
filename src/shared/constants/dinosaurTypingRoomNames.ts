/** 恐竜がタイピングイベントで入力する部屋名候補（15文字以内） */
export const DINOSAUR_TYPING_ROOM_NAMES = [
    '昔、人間がいた',
    'Windows95くれた',
    'NULL HAND教わった',
    'ルール、曖昧だった',
    '名前、忘れた',
    '顔は、たぶん覚えてる',
    '来なくなった',
    'PC、ここにある',
    'たまに止まる',
    'でも動く',
    'あの人も曖昧',
    '敵じゃなかった',
    '友達でもなかった',
    'なんかある',
    'まあいいか',
    'ぷかぷかしてる',
    '思い出、バラバラ',
    'ノイズ、たぶん',
    'あ、また忘れた',
    '石、硬い',
    'さっき転んだ',
    'キー、光ってる',
    'なんの音？',
    'ぷかぷか',
    '浮いてる',
]

export function getRandomDinosaurRoomName(): string {
    return DINOSAUR_TYPING_ROOM_NAMES[
        Math.floor(Math.random() * DINOSAUR_TYPING_ROOM_NAMES.length)
    ]!
}
