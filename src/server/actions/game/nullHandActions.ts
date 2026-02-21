'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
import {
    JankenEventWithGuests,
    HostStats,
    HandType,
    HostChoice,
    MatchScoreWithUser,
} from '@/shared/types'

// ============================================
// ユーティリティ
// ============================================

/**
 * Fisher-Yates シャッフル（配列をランダムに並べ替え）
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// ============================================
// じゃんけん判定ロジック
// ============================================

/**
 * じゃんけんの勝敗を判定
 */
function judgeHand(hostHand: HandType, guestHand: HandType): 'HOST_WIN' | 'GUEST_WIN' | 'DRAW' {
    if (hostHand === guestHand) return 'DRAW'

    const winPatterns: Record<HandType, HandType> = {
        [HandType.ROCK]: HandType.SCISSORS,
        [HandType.SCISSORS]: HandType.PAPER,
        [HandType.PAPER]: HandType.ROCK,
    }

    return winPatterns[hostHand] === guestHand ? 'HOST_WIN' : 'GUEST_WIN'
}

/**
 * REALに対して必ず負けるBLUFF手を生成
 * REAL: ROCK → BLUFF: SCISSORS
 * REAL: SCISSORS → BLUFF: PAPER
 * REAL: PAPER → BLUFF: ROCK
 */
function getBluffHand(realHand: HandType): HandType {
    const bluffMap: Record<HandType, HandType> = {
        [HandType.ROCK]: HandType.SCISSORS,
        [HandType.SCISSORS]: HandType.PAPER,
        [HandType.PAPER]: HandType.ROCK,
    }
    return bluffMap[realHand]
}

/**
 * ランダムなREAL手を生成
 */
function generateRandomHand(): HandType {
    const hands = Object.values(HandType)
    return hands[Math.floor(Math.random() * hands.length)]
}

// ============================================
// ゲーム制御
// ============================================

/**
 * NULL HAND ゲーム開始
 * ホストのみ実行可能
 * Matchを作成し、最初のターンのJankenEventを生成（DEALフェーズ）
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

    // 参加者リストを取得し、シャッフルしてホスト順をランダム化
    const participants = shuffleArray(room.users.map(ru => ru.userId))
    if (participants.length < 2) throw new Error('最低2人のプレイヤーが必要です')

    // トランザクションで一括実行して、不整合を防ぐ
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

        // 全参加者のMatchScoreを初期化（シャッフルされた順序を保存）
        await Promise.all(
            participants.map((userId, index) =>
                tx.matchScore.create({
                    data: {
                        matchId: newMatch.id,
                        userId: userId,
                        points: 0,
                        turnOrder: index, // シャッフル順を永続化
                    }
                })
            )
        )

        const systemRealHand = generateRandomHand()
        const systemBluffHand = getBluffHand(systemRealHand)

        // 最初のターンを作成（CHOICEフェーズから開始）
        await tx.jankenEvent.create({
            data: {
                matchId: newMatch.id,
                currentHostId: participants[0],
                turnNumber: 1,
                phase: 'CHOICE',
                systemRealHand,
                systemBluffHand,
            }
        })

        // Roomを更新
        await tx.room.update({
            where: { id: roomId },
            data: {
                currentMatchId: newMatch.id,
            }
        })

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
 * ホストの統計データを取得
 * JankenLogからホスト時のREVERSE回数を集計
 */
export async function getHostStats(userId: string): Promise<HostStats> {
    const logs = await prisma.jankenLog.findMany({
        where: { userId, isHost: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

    if (logs.length === 0) {
        return {
            reverseRate: null,
            totalHostCount: 0,
        }
    }

    const reverseCount = logs.filter(log => log.hostChoice === 'REVERSE').length
    const reverseRate = Math.round((reverseCount / logs.length) * 100)

    return {
        reverseRate,
        totalHostCount: logs.length,
    }
}

// ============================================
// フェーズ遷移とアクション
// ============================================

// dealSystemHands は廃止されました

/**
 * ホストのSTAY/REVERSE選択
 * CHOICE → BATTLE フェーズへ遷移
 */
export async function setHostChoice(eventId: string, choice: HostChoice) {
    const user = await getAuthenticatedUser()

    const event = await prisma.jankenEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new Error('イベントが見つかりません')
    if (event.currentHostId !== user.id) throw new Error('ホストではありません')
    if (event.phase !== 'CHOICE') throw new Error('CHOICEフェーズではありません')
    if (!event.systemRealHand || !event.systemBluffHand) throw new Error('システム手が設定されていません')

    // STAYならREAL手、REVERSEならBLUFF手が最終手
    const finalHostHand = choice === 'STAY' ? event.systemRealHand : event.systemBluffHand

    await prisma.jankenEvent.update({
        where: { id: eventId },
        data: {
            hostChoice: choice,
            finalHostHand,
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
    hand: HandType
) {
    const currentUser = await getAuthenticatedUser()
    const userId = currentUser.id

    // hand のバリデーション
    const validHands = Object.values(HandType)
    if (!validHands.includes(hand)) throw new Error('無効な手です')

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
// ラウンド判定とポイント管理（新Binary Reverseスコアロジック）
// ============================================

/**
 * ラウンドの勝敗判定
 *
 * スコアルール:
 * - Null Hand（全員あいこ、ゲスト2人以上時のみ）: ホスト+5pt
 * - ゲスト単独勝利（1人のみ）: そのゲスト+3pt
 * - ゲスト複数勝利: 勝ったゲスト全員+1pt
 * - ホスト完全勝利（全員負けorあいこ）: ホスト+2pt
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
    if (!event.hostChoice) throw new Error('ホストの選択が設定されていません')

    const hostHand = event.finalHostHand as HandType
    const hostChoice = event.hostChoice as HostChoice

    // 各ゲストの勝敗を判定
    const guestWinners: string[] = []
    let allDraw = true

    for (const guestHand of event.guestHands) {
        const result = judgeHand(hostHand, guestHand.hand as HandType)
        if (result === 'GUEST_WIN') {
            guestWinners.push(guestHand.userId)
        }
        if (result !== 'DRAW') {
            allDraw = false
        }
    }

    // ===== 新ルール スコア判定 =====
    // ゲストの人数を取得
    const guestCount = event.guestHands.length

    // 1. Null Hand判定: ゲスト全員がホストと**同じ手**を出した（全ゲストの結果がDRAW）
    // ※ゲストが1人の場合はスキップ（必ずfalse）
    const isNullHand = guestCount > 1 && allDraw

    // 2. ゲスト勝利判定: 1(NullHand)に該当せず、かつホストに勝ったゲストが1人以上いる
    const isGuestWin = !isNullHand && guestWinners.length > 0

    // 3. ホスト完全勝利判定: 1(NullHand)に該当せず、ゲスト全員に勝利した（ゲスト勝利がおらず、かつ引き分けもいない）
    // ※今回は「無敗（引き分け含む）」ではなく「完全勝利（全員負け）」が条件
    // ※ゲストが1人の場合はスキップ（必ずfalse）
    const guestDraws = event.guestHands.filter(gh => judgeHand(hostHand, gh.hand as HandType) === 'DRAW')
    const isHostPerfectWin = guestCount > 1 && !isNullHand && guestWinners.length === 0 && guestDraws.length === 0

    // スコア付与の実行
    if (isNullHand) {
        // Null Hand: ホスト+5pt
        await prisma.matchScore.update({
            where: {
                matchId_userId: {
                    matchId: event.matchId,
                    userId: event.currentHostId
                }
            },
            data: { points: { increment: 5 } }
        })
    } else if (isGuestWin) {
        // ゲスト勝利: 勝ったゲスト全員に各+3pt
        await Promise.all(
            guestWinners.map(winnerId =>
                prisma.matchScore.update({
                    where: {
                        matchId_userId: {
                            matchId: event.matchId,
                            userId: winnerId
                        }
                    },
                    data: { points: { increment: 3 } }
                })
            )
        )
    } else if (isHostPerfectWin) {
        // ホスト完全勝利判定: ホスト+3pt
        await prisma.matchScore.update({
            where: {
                matchId_userId: {
                    matchId: event.matchId,
                    userId: event.currentHostId
                }
            },
            data: { points: { increment: 3 } }
        })
    }
    // ドロー（該当なし）は何もしない（全員 0pt）

    // ホストのJankenLogを記録（REVERSE統計用）
    await prisma.jankenLog.create({
        data: {
            userId: event.currentHostId,
            isHost: true,
            hostChoice: hostChoice,
            matchId: event.matchId,
            isWinning: isNullHand || isHostPerfectWin,
        }
    })

    // ゲストのJankenLogを記録
    for (const guestHand of event.guestHands) {
        const isGuestWin = guestWinners.includes(guestHand.userId)
        await prisma.jankenLog.create({
            data: {
                userId: guestHand.userId,
                isHost: false,
                matchId: event.matchId,
                isWinning: isGuestWin,
            }
        })
    }

    // RESULTフェーズへ遷移
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
    await getAuthenticatedUser()
    const event = await prisma.jankenEvent.findUnique({
        where: { id: eventId },
        include: {
            match: {
                include: {
                    matchScores: {
                        orderBy: { turnOrder: 'asc' }
                    }
                }
            }
        }
    })

    if (!event) throw new Error('イベントが見つかりません')
    if (!event.match.matchScores.length) throw new Error('参加者データが見つかりません')

    const participants = event.match.matchScores.map(ms => ms.userId)
    const totalTurns = participants.length

    if (event.turnNumber >= totalTurns) {
        // 全ターン終了 → GAME_OVER フェーズへ
        await prisma.jankenEvent.update({
            where: { id: eventId },
            data: {
                phase: 'GAME_OVER',
            }
        })

        await prisma.match.update({
            where: { id: event.matchId },
            data: {
                currentTurnIndex: event.turnNumber + 1
            }
        })
        return
    }

    // 次のホストを決定
    const nextHostIndex = event.turnNumber
    const nextHostId = participants[nextHostIndex]

    const systemRealHand = generateRandomHand()
    const systemBluffHand = getBluffHand(systemRealHand)

    await prisma.jankenEvent.create({
        data: {
            matchId: event.matchId,
            currentHostId: nextHostId,
            turnNumber: event.turnNumber + 1,
            phase: 'CHOICE',
            systemRealHand,
            systemBluffHand,
        }
    })

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
            match: true,
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
    if (!matchId) return null

    const event = await prisma.jankenEvent.findFirst({
        where: { matchId },
        orderBy: { turnNumber: 'desc' },
        include: {
            match: true,
            guestHands: {
                include: { user: true }
            }
        }
    })

    return event
}

/**
 * マッチIDから最新の JankenEvent と HostStats を一度に取得
 */
export async function getLatestJankenEventWithStats(
    matchId: string
): Promise<{ event: JankenEventWithGuests; stats: HostStats } | null> {
    if (!matchId) return null

    const event = await prisma.jankenEvent.findFirst({
        where: { matchId },
        orderBy: { turnNumber: 'desc' },
        include: {
            match: true,
            guestHands: {
                include: { user: true }
            }
        }
    })

    if (!event) return null

    const needsStats = ['DEAL', 'CHOICE', 'BATTLE', 'RESULT'].includes(event.phase)
    const stats = needsStats
        ? await getHostStats(event.currentHostId)
        : { reverseRate: null, totalHostCount: 0 }

    return { event, stats }
}

/**
 * 次のラウンドへの準備完了をマーク
 * 全員準備完了したら次のターンを開始
 */
export async function markNextRoundReady(roomId: string, matchId: string) {
    const currentUser = await getAuthenticatedUser()
    const userId = currentUser.id

    await prisma.roomUser.update({
        where: { roomId_userId: { roomId, userId } },
        data: { isReady: true }
    })

    const roomUsers = await prisma.roomUser.findMany({
        where: { roomId }
    })

    const allReady = roomUsers.every(u => u.isReady)

    if (allReady) {
        const event = await prisma.jankenEvent.findFirst({
            where: { matchId },
            orderBy: { turnNumber: 'desc' },
        })

        if (event) {
            await startNextTurn(event.id)
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
    await getAuthenticatedUser()

    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (!match || match.status === 'FINISHED') return

    await prisma.match.update({
        where: { id: matchId },
        data: {
            status: 'FINISHED',
        }
    })

    await prisma.room.update({
        where: { id: roomId },
        data: {
            currentMatchId: null,
        }
    })
}
