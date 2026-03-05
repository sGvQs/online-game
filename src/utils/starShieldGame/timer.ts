/**
 * タイマー計算（純粋関数）
 */

/** 残り秒数を計算（0 以上にクランプ） */
export function calcRemainingSeconds(startedAt: number, gameDurationSec: number): number {
    return Math.max(0, gameDurationSec - Math.floor((Date.now() - startedAt) / 1000))
}

/** 既に時間切れの場合、開始時刻をリセットしてフルタイムにする */
export function resolveStartTime(startedAt: number, gameDurationSec: number): {
    effectiveStartedAt: number
    initialRemaining: number
} {
    const initialRemaining = calcRemainingSeconds(startedAt, gameDurationSec)
    if (initialRemaining <= 0) {
        const effectiveStartedAt = Date.now()
        return {
            effectiveStartedAt,
            initialRemaining: gameDurationSec,
        }
    }
    return {
        effectiveStartedAt: startedAt,
        initialRemaining,
    }
}
