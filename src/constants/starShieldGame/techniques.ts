/**
 * StarShieldGame 技の定義
 * 赤い球（散弾）、青い球、黄色いビーム、紫の球、オレンジの球
 */

export type TechniqueId = 'red' | 'blue' | 'yellow_beam' | 'purple' | 'orange' | 'pink'

export interface TechniqueConfig {
    id: TechniqueId
    label: string
    damage: number
    speed: number
    color: string
    /** 1文字で発射する弾数（複数弾の場合） */
    count?: number
    /** 進行方向への縦オフセット（正規化座標）。負=後方。黄色ビーム用 */
    verticalOffset?: number
    /** 貫通（当たっても消えない） */
    piercing?: boolean
    /** ヒット時に隕石を減速させる */
    slowOnHit?: boolean
    /** 連鎖攻撃（一段。オレンジのみ。範囲・数は gameConfig で制御） */
    chainRadius?: number
}

export const TECHNIQUES: Record<TechniqueId, TechniqueConfig> = {
    red: {
        id: 'red',
        label: '赤い球',
        damage: 1,
        speed: 1,
        color: '#ef4444',
    },
    blue: {
        id: 'blue',
        label: '青い球',
        damage: 1,
        speed: 1,
        color: '#3b82f6',
        slowOnHit: true,
    },
    yellow_beam: {
        id: 'yellow_beam',
        label: '黄色いビーム',
        damage: 0.1,
        speed: 1,
        color: '#eab308',
        count: 30,
        verticalOffset: 0.01, // 進行方向に沿って3発オフセット（ビーム状）
    },
    purple: {
        id: 'purple',
        label: '紫の球',
        damage: 1,
        speed: 1,
        color: '#a855f7',
        piercing: true,
    },
    orange: {
        id: 'orange',
        label: 'オレンジの球',
        damage: 1,
        speed: 1,
        color: '#f97316',
        chainRadius: 0.10,
    },
    pink: {
        id: 'pink',
        label: 'ピンクの球',
        damage: 0.5,
        speed: 1,
        color: '#ec4899',
        count: 5,
    },
}

export const TECHNIQUE_IDS: TechniqueId[] = ['red', 'blue', 'yellow_beam', 'purple', 'orange', 'pink']

/** デフォルト弾の色（red と同色） */
export const DEFAULT_BULLET_COLOR = '#ef4444'
