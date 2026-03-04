/**
 * 技の難易度段階解放ロジック
 * EASY→1種、NORMAL→2種、HARD→3種、HELL→4種＋全部破壊
 */

import type { Difficulty } from '@/types/starShieldGame'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'

/** 全部破壊（単語完了時の広範囲発射／HELL では全隕石破壊） */
export const ALL_DESTRUCTION_ID = 'all_destruction' as const

/** 必殺技の選択肢（単語完了時の挙動） */
export type SpecialAttackChoice = 'spread' | 'all_destruction'

/** 技IDと解放難易度のマッピング */
export const TECHNIQUE_UNLOCK_DIFFICULTY: Record<TechniqueId | typeof ALL_DESTRUCTION_ID, Difficulty> = {
    blue: 'EASY',
    yellow_beam: 'NORMAL',
    purple: 'HARD',
    orange: 'HELL',
    all_destruction: 'HELL',
}

/** 難易度の順序（解放判定用） */
const DIFFICULTY_ORDER: Difficulty[] = ['EASY', 'NORMAL', 'HARD', 'HELL']

function isDifficultyUnlocked(required: Difficulty, current: Difficulty): boolean {
    return DIFFICULTY_ORDER.indexOf(current) >= DIFFICULTY_ORDER.indexOf(required)
}

/** 選択可能な技の型（ふつう + 4技 + 全部破壊） */
export type SelectableTechnique = TechniqueId | typeof ALL_DESTRUCTION_ID | null

/**
 * 指定難易度で解放されている技の一覧を返す。
 * 順序: null（ふつう）, blue, yellow_beam, purple, orange, all_destruction
 */
export function getAvailableTechniques(difficulty: Difficulty): SelectableTechnique[] {
    const result: SelectableTechnique[] = [null] // ふつうは常に選択可能

    const techniqueIds: (TechniqueId | typeof ALL_DESTRUCTION_ID)[] = [
        'blue',
        'yellow_beam',
        'purple',
        'orange',
        ALL_DESTRUCTION_ID,
    ]

    for (const id of techniqueIds) {
        const unlockDiff = TECHNIQUE_UNLOCK_DIFFICULTY[id]
        if (isDifficultyUnlocked(unlockDiff, difficulty)) {
            result.push(id)
        }
    }

    return result
}

/**
 * デバッグ用: 難易度制限なしで全通常攻撃（ふつう＋4技）を返す。
 */
export function getDebugNormalAttacks(): (TechniqueId | null)[] {
    return [null, 'blue', 'yellow_beam', 'purple', 'orange']
}
