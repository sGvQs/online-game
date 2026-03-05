/**
 * 照準・方向計算（純粋関数）
 */

/** aim 正規化座標から発射角度（rad）を算出 */
export function aimToCenterAngle(
    aimX: number,
    aimY: number,
    originX: number,
    originY: number
): number {
    const dx = aimX - originX
    const dy = aimY - originY
    const len = Math.hypot(dx, dy)
    if (len < 0.001) return 0
    return Math.atan2(dy, dx)
}

/** aim 正規化座標から正規化方向ベクトル (dirX, dirY) を算出。ゼロベクトルは null */
export function aimToDirection(
    aimX: number,
    aimY: number,
    originX: number,
    originY: number
): { dirX: number; dirY: number } | null {
    const dx = aimX - originX
    const dy = aimY - originY
    const len = Math.hypot(dx, dy)
    if (len < 0.001) return null
    return { dirX: dx / len, dirY: dy / len }
}
