'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
import { JankenEventWithGuests, HostStats, HandType, FakeTarget } from '@/shared/types'

/**
 * NULL HAND ゲーム開始
 * ホストのみ実行可能
 * Matchを作成し、最初のターンのJankenEventを生成
 */
export async function startJankenMatch(roomId: string) {
    const user = await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            users: true
        }
    })

    if (!room) throw new Error('ルームが見つかりません')
    if (room.createdBy !== user.id) throw new Error('ゲームを開始する権限がありません（ホストのみ）')

    // 参加者リストを取得
    const participants = room.users.map(ru => ru.userId)
    if (participants.length < 2) throw new Error('最低2人のプレイヤーが必要です')

    // Matchを作成
    const match = await prisma.match.create({
        data: {
            roomId: roomId,
            gameType: 'null-hand',
            status: 'PLAYING',
        }
    })

    // 最初のターンを作成（最初のホストは room.createdBy）
    const phaseEndsAt = new Date(Date.now() + 30000) // 30秒後

    await prisma.jankenEvent.create({
        data: {
            matchId: match.id,
            currentHostId: participants[0], // 最初のプレイヤーがホスト
            turnNumber: 1,
            phase: 'SETUP',
            phaseEndsAt: phaseEndsAt,
        }
    })

    // Roomを更新
    await prisma.room.update({

        where: { id: roomId },
        data: {
            currentMatchId: match.id,
        }
    })

    return match
}

/**
 * ホストの統計データを取得
 * JankenLogから過去のデータを集計
 */
export async function getHostStats(userId: string): Promise<HostStats> {
    const logs = await prisma.jankenLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // 最新50件
    })

    if (logs.length === 0) {
        return {
            favoriteHand: 'ROCK',
            changeRate: 50,
            totalGames: 0
        }
    }

    // よく出す手を集計
    const handCounts: Record<HandType, number> = {
        ROCK: 0,
        SCISSORS: 0,
        PAPER: 0
    }

    let changedCount = 0

    logs.forEach(log => {
        if (log.finalHand in handCounts) {
            handCounts[log.finalHand as HandType]++
        }
        if (log.initialHand !== log.finalHand) {
            changedCount++
        }
    })

    // 最も多く出した手
    const favoriteHand = (Object.entries(handCounts).sort((a, b) => b[1] - a[1])[0][0] as HandType) || 'ROCK'

    // 手を変える確率
    const changeRate = Math.round((changedCount / logs.length) * 100)

    return {
        favoriteHand,
        changeRate,
        totalGames: logs.length
    }
}

/**
 * ホストの初期手と嘘を設定
 * SETUP → SHOWCASE フェーズへ遷移
 */
export async function setInitialHand(
    eventId: string,
    hand: HandType,
    fakeTarget: FakeTarget
) {
    const user = await getAuthenticatedUser()

    const event = await prisma.jankenEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new Error('イベントが見つかりません')
    if (event.currentHostId !== user.id) throw new Error('ホストではありません')

    const phaseEndsAt = new Date(Date.now() + 20000) // 20秒後

    await prisma.jankenEvent.update({
        where: { id: eventId },
        data: {
            initialHand: hand,
            fakeTarget: fakeTarget,
            phase: 'SHOWCASE',
            phaseEndsAt: phaseEndsAt,
        }
    })
}

/**
 * ゲストの確認完了
 * 全ゲストが確認したら FINAL_DECISION へ
 */
export async function confirmShowcase(eventId: string, userId: string) {
    const event = await prisma.jankenEvent.findUnique({
        where: { id: eventId },
        include: {
            match: {
                include: {
                    room: {
                        include: { users: true }
                    }
                }
            }
        }
    })

    if (!event) throw new Error('イベントが見つかりません')

    // ゲストの確認を記録（GuestHandにダミーデータを作成）
    await prisma.guestHand.upsert({
        where: {
            jankenEventId_userId: {
                jankenEventId: eventId,
                userId: userId
            }
        },
        create: {
            jankenEventId: eventId,
            userId: userId,
            hand: 'ROCK', // ダミー
            isConfirmed: true
        },
        update: {
            isConfirmed: true
        }
    })

    // 全ゲストが確認したかチェック
    const participants = event.match.room.users.map(ru => ru.userId)
    const guests = participants.filter(p => p !== event.currentHostId)

    const confirmedGuests = await prisma.guestHand.count({
        where: {
            jankenEventId: eventId,
            isConfirmed: true
        }
    })

    if (confirmedGuests >= guests.length) {
        // 全員確認完了 → FINAL_DECISION へ
        const phaseEndsAt = new Date(Date.now() + 15000) // 15秒後
        await prisma.jankenEvent.update({
            where: { id: eventId },
            data: {
                phase: 'FINAL_DECISION',
                phaseEndsAt: phaseEndsAt,
            }
        })
    }
}

/**
 * ホストの最終決定
 * FINAL_DECISION → BATTLE フェーズへ遷移
 */
export async function setFinalHostHand(eventId: string, hand: HandType) {
    const user = await getAuthenticatedUser()

    const event = await prisma.jankenEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new Error('イベントが見つかりません')
    if (event.currentHostId !== user.id) throw new Error('ホストではありません')

    const phaseEndsAt = new Date(Date.now() + 20000) // 20秒後

    await prisma.jankenEvent.update({
        where: { id: eventId },
        data: {
            finalHostHand: hand,
            phase: 'BATTLE',
            phaseEndsAt: phaseEndsAt,
        }
    })
}

/**
 * ゲストの手を入力
 * 全ゲスト入力完了で勝敗判定 → 次のターンまたはゲーム終了
 */
export async function setGuestHand(
    eventId: string,
    userId: string,
    hand: HandType
) {
    await prisma.guestHand.upsert({
        where: {
            jankenEventId_userId: {
                jankenEventId: eventId,
                userId: userId
            }
        },
        create: {
            jankenEventId: eventId,
            userId: userId,
            hand: hand,
            isConfirmed: true
        },
        update: {
            hand: hand,
            isConfirmed: true
        }
    })

    // 全ゲストが入力したかチェック
    const event = await prisma.jankenEvent.findUnique({
        where: { id: eventId },
        include: {
            match: {
                include: {
                    room: {
                        include: { users: true }
                    }
                }
            },
            guestHands: true
        }
    })

    if (!event) throw new Error('イベントが見つかりません')

    const participants = event.match.room.users.map(ru => ru.userId)
    const guests = participants.filter(p => p !== event.currentHostId)

    const submittedHands = event.guestHands.filter(gh => gh.hand !== 'ROCK' || gh.isConfirmed)

    if (submittedHands.length >= guests.length) {
        // 全員入力完了 → 勝敗判定
        await judgeRound(eventId)
    }
}

/**
 * ラウンドの勝敗判定
 * ホストのログを記録し、次のターンまたはゲーム終了へ
 */
async function judgeRound(eventId: string) {
    const event = await prisma.jankenEvent.findUnique({
        where: { id: eventId },
        include: {
            match: {
                include: {
                    room: {
                        include: { users: true }
                    }
                }
            },
            guestHands: {
                include: { user: true }
            }
        }
    })

    if (!event) throw new Error('イベントが見つかりません')

    // ホストのログを記録
    if (event.initialHand && event.finalHostHand) {
        await prisma.jankenLog.create({
            data: {
                userId: event.currentHostId,
                initialHand: event.initialHand,
                finalHand: event.finalHostHand,
                matchId: event.matchId
            }
        })
    }

    const participants = event.match.room.users.map(ru => ru.userId)
    const totalTurns = participants.length

    // RESULTフェーズへ遷移（10秒間表示）
    await prisma.jankenEvent.update({
        where: { id: eventId },
        data: {
            phase: 'RESULT',
            phaseEndsAt: new Date(Date.now() + 10000) // 10秒後
        }
    })

    // 次のターンまたはゲーム終了は別途処理
    // （タイマーで自動実行するか、クライアントからのアクションで実行）
}

/**
 * 次のターンを開始
 */
export async function startNextTurn(eventId: string) {
    const event = await prisma.jankenEvent.findUnique({
        where: { id: eventId },
        include: {
            match: {
                include: {
                    room: {
                        include: { users: true }
                    }
                }
            }
        }
    })

    if (!event) throw new Error('イベントが見つかりません')

    const participants = event.match.room.users.map(ru => ru.userId)
    const totalTurns = participants.length

    if (event.turnNumber >= totalTurns) {
        // 全ターン終了 → ゲーム終了
        await finishJanken(event.matchId, event.match.roomId)
        return
    }

    // 次のホストを決定
    const nextHostIndex = event.turnNumber // 0-indexed配列なので turnNumber がそのまま次のインデックス
    const nextHostId = participants[nextHostIndex]

    const phaseEndsAt = new Date(Date.now() + 30000) // 30秒後

    await prisma.jankenEvent.create({
        data: {
            matchId: event.matchId,
            currentHostId: nextHostId,
            turnNumber: event.turnNumber + 1,
            phase: 'SETUP',
            phaseEndsAt: phaseEndsAt,
        }
    })
}

/**
 * JankenEventデータ取得（ゲストハンド含む）
 */
export async function getJankenEvent(eventId: string): Promise<JankenEventWithGuests | null> {
    const event = await prisma.jankenEvent.findUnique({
        where: { id: eventId },
        include: {
            guestHands: {
                include: {
                    user: true
                }
            }
        }
    })

    return event
}

/**
 * マッチIDから最新のJankenEventを取得
 */
export async function getLatestJankenEvent(matchId: string): Promise<JankenEventWithGuests | null> {
    const event = await prisma.jankenEvent.findFirst({
        where: { matchId },
        orderBy: { turnNumber: 'desc' },
        include: {
            guestHands: {
                include: {
                    user: true
                }
            }
        }
    })

    return event
}

/**
 * ゲーム終了
 */
export async function finishJanken(matchId: string, roomId: string) {
    // Match を終了
    await prisma.match.update({
        where: { id: matchId },
        data: {
            status: 'FINISHED',
        }
    })

    // Room の currentMatchId をクリア
    await prisma.room.update({
        where: { id: roomId },
        data: {
            currentMatchId: null,
        }
    })
}
