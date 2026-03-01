'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'

type Difficulty = 'EASY' | 'NORMAL' | 'HARD'

const SPAWN_RATES: Record<Difficulty, number> = {
    EASY: 0.5,
    NORMAL: 1,
    HARD: 1.5,
}

const GAME_DURATION_SECONDS = 90

/**
 * STAR SHIELD ゲーム開始
 * Match + TypingShootMatch を作成し Room.currentMatchId を更新する
 * ホストのみ実行可能
 */
export async function startStarShieldMatch(
    roomId: string,
    difficulty: Difficulty,
    roles: { shooterId: string; typistId: string }
): Promise<{ matchId: string; startedAt: number; shooterId: string; typistId: string }> {
    const user = await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            users: true,
        },
    })

    if (!room) throw new Error('ルームが見つかりません')
    if (room.createdBy !== user.id) throw new Error('ゲームを開始する権限がありません（ホストのみ）')
    if (room.users.length < 2) throw new Error('2人以上必要です')

    const { shooterId, typistId } = roles
    const userIds = new Set(room.users.map((u) => u.userId))
    if (!userIds.has(shooterId) || !userIds.has(typistId)) {
        throw new Error('指定されたプレイヤーがルームに含まれていません')
    }
    if (shooterId === typistId) {
        throw new Error('Shooter と Typist は別のプレイヤーである必要があります')
    }

    const spawnRate = SPAWN_RATES[difficulty]
    const targetAsteroidCount = Math.floor(GAME_DURATION_SECONDS * spawnRate)

    const match = await prisma.match.create({
        data: {
            roomId,
            gameType: 'star-shield',
            status: 'PLAYING',
        },
    })

    await prisma.typingShootMatch.create({
        data: {
            matchId: match.id,
            shooterId,
            typistId,
            characterName: 'dinosaur',
            difficulty,
            targetAsteroidCount,
        },
    })

    await prisma.room.update({
        where: { id: roomId },
        data: { currentMatchId: match.id },
    })

    return {
        matchId: match.id,
        startedAt: match.createdAt.getTime(),
        shooterId,
        typistId,
    }
}

/**
 * STAR SHIELD マッチ情報取得（非ホストがゲーム開始時刻を取得するために使用）
 */
export async function getStarShieldMatchInfo(
    matchId: string
): Promise<{ startedAt: number }> {
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: { createdAt: true },
    })
    return { startedAt: match?.createdAt.getTime() ?? Date.now() }
}

/** リロード時に match ステータスを確認し、終了済みなら結果を返す */
export async function getStarShieldMatchStatus(matchId: string): Promise<
    | { status: 'playing'; startedAt: number; shooterId: string }
    | {
          status: 'finished'
          startedAt: number
          shooterId: string
          result: 'CLEARED' | 'FAILED_CONTACT' | 'FAILED_TIMEOUT'
          stats: { spawnedCount: number; destroyedCount: number; durationSeconds: number }
      }
    | { status: 'not_found' }
> {
    const tsm = await prisma.typingShootMatch.findUnique({
        where: { matchId },
    })

    if (!tsm) {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { room: true },
        })
        if (!match) return { status: 'not_found' }
        return {
            status: 'playing',
            startedAt: match.createdAt.getTime(),
            shooterId: match.room.createdBy,
        }
    }

    const startedAt = tsm.startedAt.getTime()

    if (!tsm.endedAt) {
        return { status: 'playing', startedAt, shooterId: tsm.shooterId }
    }

    const result: 'CLEARED' | 'FAILED_CONTACT' | 'FAILED_TIMEOUT' = tsm.isCleared
        ? 'CLEARED'
        : tsm.failureReason === 'FAILED_CONTACT'
          ? 'FAILED_CONTACT'
          : 'FAILED_TIMEOUT'

    return {
        status: 'finished',
        startedAt,
        shooterId: tsm.shooterId,
        result,
        stats: {
            spawnedCount: tsm.spawnedCount,
            destroyedCount: tsm.destroyedCount,
            durationSeconds: tsm.durationSeconds ?? 0,
        },
    }
}

interface SaveStarShieldResultData {
    spawnedCount: number
    destroyedCount: number
    isCleared: boolean
    failureReason?: string
    durationSeconds: number
    difficulty?: Difficulty
}

/**
 * STAR SHIELD ゲーム結果を保存する
 * シューティング側がゲーム終了時に呼び出す
 */
export async function saveStarShieldResult(
    matchId: string,
    data: SaveStarShieldResultData
): Promise<void> {
    const existing = await prisma.typingShootMatch.findUnique({ where: { matchId } })
    const { spawnedCount, destroyedCount, isCleared, failureReason, durationSeconds } = data
    const accuracyRate = spawnedCount > 0 ? destroyedCount / spawnedCount : 0
    const updateData = {
        spawnedCount,
        destroyedCount,
        isCleared,
        failureReason: failureReason ?? null,
        accuracyRate,
        durationSeconds,
        endedAt: new Date(),
    }

    if (existing) {
        await prisma.typingShootMatch.update({
            where: { matchId },
            data: updateData,
        })
    } else {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { room: { include: { users: true } } },
        })
        if (!match) {
            console.warn('[saveStarShieldResult] Match not found (may have been deleted):', matchId)
            return
        }

        const shooterId = match.room.createdBy
        const typistUser = match.room.users.find((u) => u.userId !== shooterId)
        if (!typistUser) throw new Error('Typist not found in room')

        const diff = data.difficulty ?? 'NORMAL'
        await prisma.typingShootMatch.create({
            data: {
                matchId,
                shooterId,
                typistId: typistUser.userId,
                characterName: 'dinosaur',
                difficulty: diff,
                targetAsteroidCount: Math.floor(GAME_DURATION_SECONDS * SPAWN_RATES[diff]),
                ...updateData,
            },
        })
    }

    await prisma.match.update({
        where: { id: matchId },
        data: { status: 'FINISHED' },
    })
}
