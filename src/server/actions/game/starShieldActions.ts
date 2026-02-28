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
    difficulty: Difficulty
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

    const shooterId = room.createdBy
    const typistUser = room.users.find((u) => u.userId !== shooterId)
    if (!typistUser) throw new Error('タイピスト側のプレイヤーが見つかりません')
    const typistId = typistUser.userId

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

interface SaveStarShieldResultData {
    spawnedCount: number
    destroyedCount: number
    isCleared: boolean
    failureReason?: string
    durationSeconds: number
}

/**
 * STAR SHIELD ゲーム結果を保存する
 * シューティング側がゲーム終了時に呼び出す
 */
export async function saveStarShieldResult(
    matchId: string,
    data: SaveStarShieldResultData
): Promise<void> {
    const { spawnedCount, destroyedCount, isCleared, failureReason, durationSeconds } = data

    const accuracyRate = spawnedCount > 0 ? destroyedCount / spawnedCount : 0

    await prisma.typingShootMatch.update({
        where: { matchId },
        data: {
            spawnedCount,
            destroyedCount,
            isCleared,
            failureReason: failureReason ?? null,
            accuracyRate,
            durationSeconds,
            endedAt: new Date(),
        },
    })

    await prisma.match.update({
        where: { id: matchId },
        data: { status: 'FINISHED' },
    })
}
