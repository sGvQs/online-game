'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'

type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'HELL'

const SPAWN_RATES: Record<Difficulty, number> = {
    EASY: 0.5,
    NORMAL: 1,
    HARD: 1.5,
    HELL: 2,
}

const CLEAR_POINTS: Record<Difficulty, number> = {
    EASY: 1,
    NORMAL: 2,
    HARD: 3,
    HELL: 4,
}

const HELL_UNLOCK_THRESHOLD = 0
/** 検証用: true にすると HELL 制限を常に解除。本番では false に戻すこと */
const HELL_UNLOCK_FOR_VERIFICATION = true

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

    if (difficulty === 'HELL') {
        const unlocked = await isHellUnlocked(shooterId, typistId)
        if (!unlocked) {
            throw new Error('HELL難易度は解放されていません（隕石破壊数200以上のクリアで解放）')
        }
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
    const { spawnedCount, destroyedCount, isCleared, failureReason, durationSeconds, difficulty: dataDifficulty } = data
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

    let shooterId: string
    let typistId: string
    const diff: Difficulty = (dataDifficulty ?? (existing?.difficulty as Difficulty) ?? 'NORMAL')

    if (existing) {
        shooterId = existing.shooterId
        typistId = existing.typistId
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

        shooterId = match.room.createdBy
        const typistUser = match.room.users.find((u) => u.userId !== shooterId)
        if (!typistUser) throw new Error('Typist not found in room')
        typistId = typistUser.userId

        await prisma.typingShootMatch.create({
            data: {
                matchId,
                shooterId,
                typistId,
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

    // 成功時: 両プレイヤーに難易度に応じた pt を加算し、クリア記録を保存
    // ※ポイント付与を先に行う（star_shield_clear_records が未作成の環境でもポイントは付与される）
    if (isCleared) {
        const points = CLEAR_POINTS[diff]
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        for (const userId of [shooterId, typistId]) {
            await prisma.monthlyRanking.upsert({
                where: {
                    userId_year_month: {
                        userId,
                        year,
                        month,
                    },
                },
                update: { totalPoints: { increment: points } },
                create: {
                    userId,
                    year,
                    month,
                    totalPoints: points,
                },
            })
            await prisma.pointLog.create({
                data: {
                    userId,
                    amount: points,
                    gameType: 'STAR_SHIELD',
                    reason: 'CLEARED',
                },
            })
        }

        // クリア記録（HELL解放判定用）。テーブル未作成時はエラーを握りつぶす
        try {
            await prisma.$executeRaw`
                INSERT INTO star_shield_clear_records (shooter_id, typist_id, destroyed_count, difficulty)
                VALUES (${shooterId}, ${typistId}, ${destroyedCount}, ${diff})
            `
        } catch (e) {
            console.warn('[saveStarShieldResult] star_shield_clear_records への保存に失敗（マイグレーション未適用の可能性）:', e)
        }
    }
}

/**
 * HELL 難易度が解放されているか（シューター＋タイピストのペアで隕石破壊数200以上の記録があるか）
 */
export async function isHellUnlocked(shooterId: string, typistId: string): Promise<boolean> {
    if (HELL_UNLOCK_FOR_VERIFICATION) return true
    // $queryRaw を使用（Prisma 7 + adapter 環境で starShieldClearRecord が undefined になる問題を回避）
    const rows = await prisma.$queryRaw<unknown[]>`
        SELECT 1 FROM star_shield_clear_records
        WHERE destroyed_count >= ${HELL_UNLOCK_THRESHOLD}
        AND (
            (shooter_id = ${shooterId} AND typist_id = ${typistId})
            OR (shooter_id = ${typistId} AND typist_id = ${shooterId})
        )
        LIMIT 1
    `
    return rows.length > 0
}
