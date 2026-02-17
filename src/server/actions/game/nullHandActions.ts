'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
import {
    JankenEventWithGuests,
    HostStats,
    HandType,
    FakeTarget,
    FakeDetails,
    RoundResult,
    MatchScoreWithUser,
} from '@/shared/types'

// ============================================
// じゃんけん判定ロジック
// ============================================

/**
 * じゃんけんの勝敗を判定
 */
function judgeHand(hostHand: HandType, guestHand: HandType): 'HOST_WIN' | 'GUEST_WIN' | 'DRAW' {
    if (hostHand === guestHand) return 'DRAW'

    const winPatterns: Record<HandType, HandType> = {
        ROCK: 'SCISSORS',
        SCISSORS: 'PAPER',
        PAPER: 'ROCK',
    }

    return winPatterns[hostHand] === guestHand ? 'HOST_WIN' : 'GUEST_WIN'
}

// ============================================
// ゲーム制御
// ============================================

/**
 * NULL HAND ゲーム開始
 * ホストのみ実行可能
 * Matchを作成し、最初のターンのJankenEventを生成
 * 全参加者のMatchScoreを初期化
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

    // トランザクションで一括実行して、不整合（MatchはあるがEventがない等）を防ぐ
    const match = await prisma.$transaction(async (tx) => {
        // Matchを作成
        const newMatch = await tx.match.create({
            data: {
                roomId: roomId,
                gameType: 'null-hand',
                status: 'PLAYING',
                currentTurnIndex: 1,
                totalTurns: participants.length,
            }
        })

        // 全参加者のMatchScoreを初期化
        await Promise.all(
            participants.map(userId =>
                tx.matchScore.create({
                    data: {
                        matchId: newMatch.id,
                        userId: userId,
                        points: 0,
                    }
                })
            )
        )

        // 最初のターンを作成
        await tx.jankenEvent.create({
            data: {
                matchId: newMatch.id,
                currentHostId: participants[0], // 最初のプレイヤーがホスト
                turnNumber: 1,
                phase: 'SETUP',
            }
        })

        // Roomを更新
        await tx.room.update({
            where: { id: roomId },
            data: {
                currentMatchId: newMatch.id,
            }
        })

        // ...
        return newMatch
    })

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/room/${roomId}`)
    revalidatePath(`/game/${roomId}/null-hand`)

    return match
}



// ============================================
// 統計データ取得
// ============================================

/**
 * ホストの統計データを取得（本物のデータを含む）
 * JankenLogから過去のデータを集計
 */
export async function getHostStats(userId: string, eventId?: string): Promise<HostStats> {
    const logs = await prisma.jankenLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // 最新50件
    })

    if (logs.length === 0) {
        return {
            favoriteHand: 'ROCK',
            changeRate: 50,
            totalGames: 0,
            realFavoriteHand: 'ROCK',
            realChangeRate: 50,
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
    const realFavoriteHand = (Object.entries(handCounts).sort((a, b) => b[1] - a[1])[0][0] as HandType) || 'ROCK'

    // 手を変える確率
    const realChangeRate = Math.round((changedCount / logs.length) * 100)

    // 偽装データを取得（eventIdが指定されている場合）
    let favoriteHand = realFavoriteHand
    let changeRate = realChangeRate

    if (eventId) {
        const event = await prisma.jankenEvent.findUnique({
            where: { id: eventId }
        })

        if (event) {
            // 偽装が適用されている場合は偽装データを返す
            if (event.fakeTarget === 'FAVORITE_HAND' && event.fakeFavoriteHandValue) {
                favoriteHand = event.fakeFavoriteHandValue as HandType
            }
            if (event.fakeTarget === 'CHANGE_RATE' && event.fakeChangeRateValue !== null) {
                changeRate = event.fakeChangeRateValue
            }
        }
    }

    return {
        favoriteHand,
        changeRate,
        totalGames: logs.length,
        realFavoriteHand,
        realChangeRate,
    }
}

// ============================================
// フェーズ遷移とアクション
// ============================================

/**
 * ホストの初期手と嘘を設定
 * SETUP → SHOWCASE フェーズへ遷移
 */
export async function setInitialHand(
    eventId: string,
    hand: HandType,
    fakeTarget: FakeTarget,
    fakeDetails?: FakeDetails
) {
    const user = await getAuthenticatedUser()

    const event = await prisma.jankenEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new Error('イベントが見つかりません')
    if (event.currentHostId !== user.id) throw new Error('ホストではありません')

    // 偽装の詳細を保存
    await prisma.jankenEvent.update({
        where: { id: eventId },
        data: {
            initialHand: hand,
            fakeTarget: fakeTarget,
            fakeHandValue: fakeDetails?.fakeHandValue,
            fakeChangeRateValue: fakeDetails?.fakeChangeRateValue,
            fakeFavoriteHandValue: fakeDetails?.fakeFavoriteHandValue,
            phase: 'SHOWCASE',
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

    //全ゲストが確認したかチェック
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
        await prisma.jankenEvent.update({
            where: { id: eventId },
            data: {
                phase: 'FINAL_DECISION',
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

    await prisma.jankenEvent.update({
        where: { id: eventId },
        data: {
            finalHostHand: hand,
            phase: 'BATTLE',
        }
    })
}

/**
 * ゲストの手を入力
 * 全ゲスト入力完了で勝敗判定 → RESULT フェーズへ
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

    const submittedHands = event.guestHands.filter(gh => gh.isConfirmed)

    if (submittedHands.length >= guests.length) {
        // 全員入力完了 → 勝敗判定
        await judgeRound(eventId)
    }
}

// ============================================
// ラウンド判定とポイント管理
// ============================================

/**
 * ラウンドの勝敗判定
 * ホストのログを記録し、ポイントを計算してMatchScoreを更新
 * RESULT フェーズへ遷移
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
    if (!event.finalHostHand) throw new Error('ホストの手が設定されていません')

    // ホストのログを記録（勝負は後で計算）
    let hostWon = false // 全員に勝ったかどうか
    if (event.initialHand && event.finalHostHand) {
        await prisma.jankenLog.create({
            data: {
                userId: event.currentHostId,
                initialHand: event.initialHand,
                finalHand: event.finalHostHand,
                matchId: event.matchId,
                isWinning: false, // 一旦false、後で更新
            }
        })
    }

    // 勝敗判定とゲストログ記録
    const hostHand = event.finalHostHand as HandType
    const winners: Array<{ userId: string; hand: HandType }> = []
    const guestWinners: Set<string> = new Set() // 勝ったゲストのID
    let hasDraw = false

    for (const guestHand of event.guestHands) {
        const result = judgeHand(hostHand, guestHand.hand as HandType)
        const isWin = result === 'GUEST_WIN'

        if (result === 'DRAW') {
            hasDraw = true
        }

        if (isWin) {
            winners.push({
                userId: guestHand.userId,
                hand: guestHand.hand as HandType
            })
            guestWinners.add(guestHand.userId)
        }

        // ゲストのログを記録
        await prisma.jankenLog.create({
            data: {
                userId: guestHand.userId,
                initialHand: guestHand.hand,
                finalHand: guestHand.hand,
                matchId: event.matchId,
                isWinning: isWin,
            }
        })
    }

    // ポイントを更新
    if (winners.length === 0 && !hasDraw) {
        // ホストが全員に勝利（引き分けなし） → +3ポイント
        hostWon = true
        await prisma.matchScore.update({
            where: {
                matchId_userId: {
                    matchId: event.matchId,
                    userId: event.currentHostId
                }
            },
            data: {
                points: {
                    increment: 3
                }
            }
        })
    } else if (winners.length > 0) {
        // ゲストが勝利 → 各+1ポイント
        await Promise.all(
            winners.map(winner =>
                prisma.matchScore.update({
                    where: {
                        matchId_userId: {
                            matchId: event.matchId,
                            userId: winner.userId
                        }
                    },
                    data: {
                        points: {
                            increment: 1
                        }
                    }
                })
            )
        )
    }

    // ホストのログのisWinningを更新
    if (event.initialHand && event.finalHostHand) {
        await prisma.jankenLog.updateMany({
            where: {
                userId: event.currentHostId,
                matchId: event.matchId,
                finalHand: event.finalHostHand,
            },
            data: {
                isWinning: hostWon
            }
        })
    }

    // RESULTフェーズへ遷移（10秒間表示）
    await prisma.jankenEvent.update({
        where: { id: eventId },
        data: {
            phase: 'RESULT',
        }
    })
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
        // 全ターン終了 → GAME_OVER フェーズへ
        await prisma.jankenEvent.update({
            where: { id: eventId },
            data: {
                phase: 'GAME_OVER',
            }
        })

        // Matchのステータスを更新
        await prisma.match.update({
            where: { id: event.matchId },
            data: {
                currentTurnIndex: event.turnNumber + 1
            }
        })
        return
    }

    // 次のホストを決定
    const nextHostIndex = event.turnNumber // 0-indexed配列なので turnNumber がそのまま次のインデックス
    const nextHostId = participants[nextHostIndex]

    await prisma.jankenEvent.create({
        data: {
            matchId: event.matchId,
            currentHostId: nextHostId,
            turnNumber: event.turnNumber + 1,
            phase: 'SETUP',
        }
    })

    // Matchのターン数を更新
    await prisma.match.update({
        where: { id: event.matchId },
        data: {
            currentTurnIndex: event.turnNumber + 1
        }
    })
}

// ============================================
// データ取得
// ============================================

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
    console.log('[getLatestJankenEvent] Called with matchId:', matchId)
    if (!matchId) {
        console.log('[getLatestJankenEvent] matchId is invalid')
        return null
    }

    try {
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

        console.log('[getLatestJankenEvent] Result:', event ? `Found Event ID: ${event.id}, Turn: ${event.turnNumber}` : 'NULL')
        return event
    } catch (error) {
        console.error('[getLatestJankenEvent] Error:', error)
        throw error
    }
}

/**
 * 次のラウンドへの準備完了をマーク
 * 全員準備完了したら次のターンを開始
 */
export async function markNextRoundReady(roomId: string, userId: string, matchId: string) {
    // ユーザーのisReadyをtrueにする
    await prisma.roomUser.update({
        where: { roomId_userId: { roomId, userId } },
        data: { isReady: true }
    })

    // 全員の準備完了状態を確認
    const roomUsers = await prisma.roomUser.findMany({
        where: { roomId }
    })

    const allReady = roomUsers.every(u => u.isReady)

    if (allReady) {
        // 全員準備完了なら次のターンへ（またはゲーム終了へ）
        const event = await prisma.jankenEvent.findFirst({
            where: { matchId },
            orderBy: { turnNumber: 'desc' },
        })

        if (event) {
            await startNextTurn(event.id)
            // 全員のisReadyをリセット
            await prisma.roomUser.updateMany({
                where: { roomId },
                data: { isReady: false }
            })
        }
    }
}


/**
 * マッチの現在のスコアを取得
 */
export async function getMatchScores(matchId: string): Promise<MatchScoreWithUser[]> {
    const scores = await prisma.matchScore.findMany({
        where: { matchId },
        include: {
            user: true
        },
        orderBy: {
            points: 'desc'
        }
    })

    return scores
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
