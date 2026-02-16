import { HandType } from '@/shared/types'

// ヘルパー関数: HandTypeを絵文字付きカタカナ表記に変換
export const getHandDisplayWithEmoji = (hand: HandType): string => {
    switch (hand) {
        case 'ROCK': return '✊ グー'
        case 'SCISSORS': return '✌️ チョキ'
        case 'PAPER': return '✋ パー'
        default: return hand
    }
}
// じゃんけんの勝敗を判定
export const judgeHand = (hostHand: HandType, guestHand: HandType): 'HOST_WIN' | 'GUEST_WIN' | 'DRAW' => {
    if (hostHand === guestHand) return 'DRAW'
    const winPatterns: Record<HandType, HandType> = {
        ROCK: 'SCISSORS',
        SCISSORS: 'PAPER',
        PAPER: 'ROCK',
    }
    return winPatterns[hostHand] === guestHand ? 'HOST_WIN' : 'GUEST_WIN'
}
