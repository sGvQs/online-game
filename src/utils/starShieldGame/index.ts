/**
 * StarShieldGame ユーティリティ
 */

export { findNearestAsteroidPosition } from './autoAim'
export { createAsteroid, createBossAsteroid } from './asteroid'
export type { CreateAsteroidParams, CreateBossAsteroidParams } from './asteroid'
export {
    computeCollisionResult,
    applyHpUpdates,
    getContactAsteroids,
    getExpiredBulletIds,
} from './collision'
export type { CollisionResult, ChainHitTarget } from './collision'
export { calcRemainingSeconds, resolveStartTime } from './timer'
export { createGameStats } from './gameEnd'
export { aimToCenterAngle, aimToDirection } from './aim'
export { createNormalAttackBullets } from './normalAttack'
export { createSpecialAttackBullets } from './specialAttack'
export {
    getDebugNormalAttacks,
    getAvailableNormalAttacks,
    getAvailableSpecialAttacks,
    getAvailableHealLevel,
    ALL_DESTRUCTION_ID,
} from './techniqueUnlock'
export type { SelectableTechnique, SpecialAttackChoice, OwnedSkills } from './techniqueUnlock'
export { getAsteroidPosition, getBulletPosition } from './position'

import { toRomaji } from 'wanakana'

/** ひらがな・カタカナ以外を除去して toRomaji に渡す（句読点はタイピング対象外） */
const KANA_ONLY = /[^\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/g

export const getRomaji = (text: string): string => toRomaji(text.replace(KANA_ONLY, ''))
