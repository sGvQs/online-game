import { HandType } from '@/types'

// ヘルパー関数: HandTypeを絵文字付きカタカナ表記に変換
export const getHandDisplayWithEmoji = (hand: HandType): string => {
    switch (hand) {
        case HandType.ROCK: return '✊ グー'
        case HandType.SCISSORS: return '✌️ チョキ'
        case HandType.PAPER: return '✋ パー'
        default: return hand
    }
}
// じゃんけんの勝敗を判定
export const judgeHand = (hostHand: HandType, guestHand: HandType): 'HOST_WIN' | 'GUEST_WIN' | 'DRAW' => {
    if (hostHand === guestHand) return 'DRAW'
    const winPatterns: Record<HandType, HandType> = {
        [HandType.ROCK]: HandType.SCISSORS,
        [HandType.SCISSORS]: HandType.PAPER,
        [HandType.PAPER]: HandType.ROCK,
    }
    return winPatterns[hostHand] === guestHand ? 'HOST_WIN' : 'GUEST_WIN'
}
