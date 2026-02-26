/** 恐竜がタイピングイベントで入力する部屋名候補（10文字以内） */
export const DINOSAUR_TYPING_ROOM_NAMES = [
    '恐竜の部屋',
    'ぷかぷか星',
    '肉',
    '誰かの部屋',
    '小さな隠れ場',
    '笑顔の場所',
    '石に突進',
    '君の部屋',
    '恐竜ランド',
    'ぷかぷか',
]

export function getRandomDinosaurRoomName(): string {
    return DINOSAUR_TYPING_ROOM_NAMES[
        Math.floor(Math.random() * DINOSAUR_TYPING_ROOM_NAMES.length)
    ]!
}
