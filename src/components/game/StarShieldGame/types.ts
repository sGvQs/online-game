/**
 * StarShieldGame 型定義
 */

export type { Difficulty } from './constants'
export type { DialogueLine } from './constants/dialogues'

export type GameResult = 'CLEARED' | 'FAILED_CONTACT' | 'FAILED_TIMEOUT'

export interface GameStats {
    spawnedCount: number
    destroyedCount: number
    durationSeconds: number
    /** broadcast fire イベント数（送信文字数）フロント完結 */
    fireCount: number
}

export interface Asteroid {
    id: string
    spawnedAt: number
    spawnX: number // 0-1（スポーン時 X）
    spawnY: number // 0-1（スポーン時 Y）
    targetX: number // 0-1（飛翔先 X、星中心+ランダム）
    targetY: number // 0-1（飛翔先 Y、星中心+ランダム）
    durationMs: number // スポーン→目標までの時間（ms）
    hp: number // 現在HP（0で破壊）
    destroyedAt?: number
    hasDamagedStar?: boolean // 星にダメージを与えたか
}

export interface Bullet {
    id: string
    firedAt: number
    startX: number
    startY: number
    dirX: number
    dirY: number
}

/** game_state broadcast のペイロード（ホストが一元管理し Typist に通知） */
export interface GameStatePayload {
    spawned: number
    destroyed: number
    fireCount: number
    starHp: number
}

/** game_end broadcast のペイロード */
export interface GameEndPayload {
    result: GameResult
    stats: GameStats
}
