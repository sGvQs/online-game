/**
 * StarShieldGame 型定義
 */

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'HELL'

/** 通常攻撃（tech=null）時の散弾数レベル。5 = Lv. .max */
export type NormalAttackLevel = 1 | 2 | 3 | 4 | 5

export type { DialogueLine } from '@/constants/starShieldGame/dialogues'

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
    /** 減速効果（1=通常、0.5=半分の速さ）。青い球ヒット時に付与 */
    speedMultiplier?: number
    /** 減速が適用された時刻（ms）。ノックバック防止用 */
    slowAppliedAt?: number
    /** 減速適用時点での progress（0-1）。ノックバック防止用 */
    progressAtSlow?: number
}

export interface Bullet {
    id: string
    firedAt: number
    startX: number
    startY: number
    dirX: number
    dirY: number
    /** ダメージ量（未指定時1） */
    damage?: number
    /** 弾速倍率（未指定時1） */
    speed?: number
    /** 描画用: 技の識別子 */
    technique?: string
    /** 貫通弾（当たっても消えない） */
    piercing?: boolean
    /** 弾の半径（正規化座標）。未指定時は BULLET_RADIUS を使用 */
    radius?: number
}

/** fire broadcast のペイロード（Typist が送信） */
export interface FirePayload {
    special?: boolean
    technique?: string
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
