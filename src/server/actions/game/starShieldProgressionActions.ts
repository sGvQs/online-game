'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
import {
    PROGRESSION_DEBUG,
    NORMAL_ATTACK_UNLOCK_COSTS,
    NORMAL_ATTACK_LEVEL_UP_COSTS,
    SPECIAL_ATTACK_UNLOCK_COSTS,
    SPECIAL_ATTACK_LEVEL_UP_COSTS,
    HEAL_UNLOCK_COST,
    HEAL_LEVEL_UP_COSTS,
} from '@/constants/starShieldGame/shopConfig'

export interface StarShieldProgress {
    totalTypingCount: number
    normalAttacks: { techniqueId: string; level: number }[]
    specialAttacks: { specialAttackId: string; level: number }[]
    healLevel: number | null
}

/**
 * ユーザーのプログレッション状態を取得。未登録時は red lv1 のみ所持として返す。
 * ルームメンバー同士でスキル確認するために、他ユーザーの progress も取得可能。
 */
export async function getStarShieldProgress(userId: string): Promise<StarShieldProgress> {
    const [progress, normalAttacks, specialAttacks, heal] = await Promise.all([
        prisma.starShieldUserProgress.findUnique({ where: { userId } }),
        prisma.starShieldUserNormalAttack.findMany({ where: { userId } }),
        prisma.starShieldUserSpecialAttack.findMany({ where: { userId } }),
        prisma.starShieldUserHeal.findUnique({ where: { userId } }),
    ])

    const normalList = normalAttacks.map((a) => ({ techniqueId: a.techniqueId, level: a.level }))
    const hasRed = normalList.some((a) => a.techniqueId === 'red')
    if (!hasRed) {
        normalList.unshift({ techniqueId: 'red', level: 1 })
    }

    return {
        totalTypingCount: progress?.totalTypingCount ?? 0,
        normalAttacks: normalList,
        specialAttacks: specialAttacks.map((a) => ({ specialAttackId: a.specialAttackId, level: a.level })),
        healLevel: heal?.level ?? null,
    }
}

/** 自分のプログレッションを取得（認証必須） */
export async function getMyStarShieldProgress(): Promise<StarShieldProgress> {
    const user = await getAuthenticatedUser()
    return getStarShieldProgress(user.id)
}

async function ensureProgress(userId: string): Promise<{ totalTypingCount: number }> {
    const p = await prisma.starShieldUserProgress.upsert({
        where: { userId },
        update: {},
        create: { userId, totalTypingCount: 0 },
    })
    return { totalTypingCount: p.totalTypingCount }
}

/** 通常攻撃スキルを解放 */
export async function purchaseNormalAttackUnlock(techniqueId: string): Promise<{ ok: boolean; error?: string }> {
    const user = await getAuthenticatedUser()
    const cost = NORMAL_ATTACK_UNLOCK_COSTS[techniqueId]
    if (cost === undefined) return { ok: false, error: '無効なスキルID' }
    if (techniqueId === 'red') return { ok: false, error: 'red は初期所持のため購入不可' }

    const { totalTypingCount } = await ensureProgress(user.id)
    if (totalTypingCount < cost) return { ok: false, error: 'typing 数が不足しています' }

    const existing = await prisma.starShieldUserNormalAttack.findUnique({
        where: { userId_techniqueId: { userId: user.id, techniqueId } },
    })
    if (existing) return { ok: false, error: '既に所持しています' }

    await prisma.$transaction([
        prisma.starShieldUserProgress.update({
            where: { userId: user.id },
            data: { totalTypingCount: { decrement: cost } },
        }),
        prisma.starShieldUserNormalAttack.create({
            data: { userId: user.id, techniqueId, level: 1 },
        }),
        prisma.starShieldPurchaseHistory.create({
            data: {
                userId: user.id,
                purchaseType: 'SKILL_UNLOCK',
                targetSkillId: techniqueId,
                typingCost: cost,
                totalTypingBefore: totalTypingCount,
            },
        }),
    ])
    return { ok: true }
}

/** 通常攻撃のレベル上げ */
export async function purchaseNormalAttackLevelUp(
    techniqueId: string,
    targetLevel: 2 | 3 | 4 | 5
): Promise<{ ok: boolean; error?: string }> {
    const user = await getAuthenticatedUser()
    const costs = NORMAL_ATTACK_LEVEL_UP_COSTS[techniqueId]
    if (!costs) return { ok: false, error: '無効なスキルID' }
    const cost = costs[targetLevel]
    if (cost === undefined) return { ok: false, error: '無効なレベル' }

    const existing = await prisma.starShieldUserNormalAttack.findUnique({
        where: { userId_techniqueId: { userId: user.id, techniqueId } },
    })
    if (!existing) return { ok: false, error: 'スキルを所持していません' }
    if (existing.level >= targetLevel) return { ok: false, error: '既にそのレベル以上です' }
    if (existing.level !== targetLevel - 1) return { ok: false, error: '前のレベルを先に購入してください' }

    const { totalTypingCount } = await ensureProgress(user.id)
    if (totalTypingCount < cost) return { ok: false, error: 'typing 数が不足しています' }

    await prisma.$transaction([
        prisma.starShieldUserProgress.update({
            where: { userId: user.id },
            data: { totalTypingCount: { decrement: cost } },
        }),
        prisma.starShieldUserNormalAttack.update({
            where: { userId_techniqueId: { userId: user.id, techniqueId } },
            data: { level: targetLevel },
        }),
        prisma.starShieldPurchaseHistory.create({
            data: {
                userId: user.id,
                purchaseType: 'LEVEL_UP',
                targetSkillId: techniqueId,
                targetLevel,
                typingCost: cost,
                totalTypingBefore: totalTypingCount,
            },
        }),
    ])
    return { ok: true }
}

/** 必殺技を解放 */
export async function purchaseSpecialAttackUnlock(specialAttackId: string): Promise<{ ok: boolean; error?: string }> {
    const user = await getAuthenticatedUser()
    const cost = SPECIAL_ATTACK_UNLOCK_COSTS[specialAttackId]
    if (cost === undefined) return { ok: false, error: '無効なスキルID' }
    if (specialAttackId === 'all_destruction') return { ok: false, error: '全破壊はヒール lv max で獲得' }

    const { totalTypingCount } = await ensureProgress(user.id)
    if (totalTypingCount < cost) return { ok: false, error: 'typing 数が不足しています' }

    const existing = await prisma.starShieldUserSpecialAttack.findUnique({
        where: { userId_specialAttackId: { userId: user.id, specialAttackId } },
    })
    if (existing) return { ok: false, error: '既に所持しています' }

    await prisma.$transaction([
        prisma.starShieldUserProgress.update({
            where: { userId: user.id },
            data: { totalTypingCount: { decrement: cost } },
        }),
        prisma.starShieldUserSpecialAttack.create({
            data: { userId: user.id, specialAttackId, level: 1 },
        }),
        prisma.starShieldPurchaseHistory.create({
            data: {
                userId: user.id,
                purchaseType: 'SKILL_UNLOCK',
                targetSkillId: specialAttackId,
                typingCost: cost,
                totalTypingBefore: totalTypingCount,
            },
        }),
    ])
    return { ok: true }
}

/** 必殺技のレベル上げ */
export async function purchaseSpecialAttackLevelUp(
    specialAttackId: string,
    targetLevel: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
): Promise<{ ok: boolean; error?: string }> {
    const user = await getAuthenticatedUser()
    const cost = SPECIAL_ATTACK_LEVEL_UP_COSTS[targetLevel]
    if (cost === undefined) return { ok: false, error: '無効なレベル' }

    const existing = await prisma.starShieldUserSpecialAttack.findUnique({
        where: { userId_specialAttackId: { userId: user.id, specialAttackId } },
    })
    if (!existing) return { ok: false, error: '必殺技を所持していません' }
    if (existing.level >= targetLevel) return { ok: false, error: '既にそのレベル以上です' }
    if (existing.level !== targetLevel - 1) return { ok: false, error: '前のレベルを先に購入してください' }

    const { totalTypingCount } = await ensureProgress(user.id)
    if (totalTypingCount < cost) return { ok: false, error: 'typing 数が不足しています' }

    await prisma.$transaction([
        prisma.starShieldUserProgress.update({
            where: { userId: user.id },
            data: { totalTypingCount: { decrement: cost } },
        }),
        prisma.starShieldUserSpecialAttack.update({
            where: { userId_specialAttackId: { userId: user.id, specialAttackId } },
            data: { level: targetLevel },
        }),
        prisma.starShieldPurchaseHistory.create({
            data: {
                userId: user.id,
                purchaseType: 'LEVEL_UP',
                targetSkillId: specialAttackId,
                targetLevel,
                typingCost: cost,
                totalTypingBefore: totalTypingCount,
            },
        }),
    ])
    return { ok: true }
}

/** ヒールを解放 */
export async function purchaseHealUnlock(): Promise<{ ok: boolean; error?: string }> {
    const user = await getAuthenticatedUser()
    const cost = HEAL_UNLOCK_COST

    const { totalTypingCount } = await ensureProgress(user.id)
    if (totalTypingCount < cost) return { ok: false, error: 'typing 数が不足しています' }

    const existing = await prisma.starShieldUserHeal.findUnique({
        where: { userId: user.id },
    })
    if (existing) return { ok: false, error: '既に所持しています' }

    await prisma.$transaction([
        prisma.starShieldUserProgress.update({
            where: { userId: user.id },
            data: { totalTypingCount: { decrement: cost } },
        }),
        prisma.starShieldUserHeal.create({
            data: { userId: user.id, level: 1 },
        }),
        prisma.starShieldPurchaseHistory.create({
            data: {
                userId: user.id,
                purchaseType: 'SKILL_UNLOCK',
                targetSkillId: 'heal',
                typingCost: cost,
                totalTypingBefore: totalTypingCount,
            },
        }),
    ])
    return { ok: true }
}

/** ヒールのレベル上げ */
export async function purchaseHealLevelUp(targetLevel: 2 | 3 | 4 | 5 | 6): Promise<{ ok: boolean; error?: string }> {
    const user = await getAuthenticatedUser()
    const cost = HEAL_LEVEL_UP_COSTS[targetLevel]
    if (cost === undefined) return { ok: false, error: '無効なレベル' }

    const existing = await prisma.starShieldUserHeal.findUnique({
        where: { userId: user.id },
    })
    if (!existing) return { ok: false, error: 'ヒールを所持していません' }
    if (existing.level >= targetLevel) return { ok: false, error: '既にそのレベル以上です' }
    if (existing.level !== targetLevel - 1) return { ok: false, error: '前のレベルを先に購入してください' }

    const { totalTypingCount } = await ensureProgress(user.id)
    if (totalTypingCount < cost) return { ok: false, error: 'typing 数が不足しています' }

    await prisma.$transaction([
        prisma.starShieldUserProgress.update({
            where: { userId: user.id },
            data: { totalTypingCount: { decrement: cost } },
        }),
        prisma.starShieldUserHeal.update({
            where: { userId: user.id },
            data: { level: targetLevel },
        }),
        prisma.starShieldPurchaseHistory.create({
            data: {
                userId: user.id,
                purchaseType: 'LEVEL_UP',
                targetSkillId: 'heal',
                targetLevel,
                typingCost: cost,
                totalTypingBefore: totalTypingCount,
            },
        }),
    ])
    return { ok: true }
}
