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
