'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'

/**
 * ゲーム開始: Match + ErrorEvent を作成し、ランダムな出現時刻を設定する
 * ホストのみ実行可能
 */
export async function startGame(roomId: string) {
    const user = await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    })

    if (!room) throw new Error('ルームが見つかりません')
    if (room.createdBy !== user.id) throw new Error('ゲームを開始する権限がありません（ホストのみ）')

    // ランダムな待ち時間 (3〜10秒)
    const delayMs = Math.floor(Math.random() * 7000) + 3000
    const appearanceAt = new Date(Date.now() + delayMs)

    // Match を作成
    const match = await prisma.matches.create({
        data: {
            room_id: roomId,
            game_type: 'error-hunter',
            status: 'PLAYING',
        }
    })

    // 20個の ErrorEvent を作成（各エラーにランダムな位置を設定）
    const errorEvents = Array.from({ length: 20 }, () => ({
        match_id: match.id,
        appearance_at: appearanceAt,
        position_x: Math.random() * 60 + 20,  // 20-80の範囲
        position_y: Math.random() * 75 + 10, // 10-85の範囲
    }))

    await prisma.error_events.createMany({ data: errorEvents })

    // Room の currentMatchId を更新
    await prisma.room.update({
        where: { id: roomId },
        data: {
            currentMatchId: match.id,
        }
    })

    return match
}

/**
 * エラーモーダルクリック: 排他制御で勝者を判定する
 * 
 * 条件:
 * - closedAt が NULL（まだ誰も閉じていない）
 * - appearanceAt が現在時刻以前（フライング防止）
 * 
 * updateMany で更新件数を返し、count > 0 なら勝ち、0 なら負け
 */
export async function clickError(eventId: string) {
    const user = await getAuthenticatedUser()

    const now = new Date()

    // 排他制御: closedAt が null かつ appearanceAt を過ぎている場合のみ更新
    const result = await prisma.error_events.updateMany({
        where: {
            id: eventId,
            closed_at: null,
            appearance_at: { lte: now },
        },
        data: {
            closed_at: now,
            closed_by: user.id,
        }
    })

    if (result.count > 0) {
        // 勝者: 更新成功（winner_id は全エラー完了時に決定）
        return { success: true }
    }

    // 敗者: 更新件数0（既に誰かが閉じた or フライング）
    return { success: false }
}

/**
 * Room から currentMatchId を取得する
 * クライアント側が Realtime 経由でゲーム開始を検知した際に、
 * Match ID を解決するために使用する
 */
export async function getMatchIdFromRoom(roomId: string) {
    const room = await prisma.room.findUnique({
        where: { id: roomId }
    })

    return room
}

/**
 * Match + ErrorEvents（勝者ユーザー情報付き）を取得する
 */
export async function getMatchWithEvents(matchId: string) {
    const match = await prisma.matches.findUnique({
        where: { id: matchId },
        include: {
            error_events: {
                include: {
                    users: true, // closedBy の User 情報
                }
            }
        }
    })

    return match
}

/**
 * マッチの進行状況を取得
 * 各プレイヤーが閉じたエラーの数を集計する
 */
export async function getMatchProgress(matchId: string) {
    const events = await prisma.error_events.findMany({
        where: { match_id: matchId },
        include: { users: true }
    })

    // プレイヤーごとのスコアを集計
    const scores = events.reduce((acc, event) => {
        if (event.closed_by) {
            acc[event.closed_by] = (acc[event.closed_by] || 0) + 1
        }
        return acc
    }, {} as Record<string, number>)

    return {
        totalErrors: events.length,
        closedErrors: events.filter(e => e.closed_by).length,
        scores,
        events
    }
}

/**
 * ゲーム終了: Match ステータスを更新し、最高スコアのプレイヤーを勝者に設定
 * 自動終了時またはホストが手動終了時に呼び出される
 */
export async function finishGame(matchId: string, roomId: string) {
    // 全エラーを取得してスコアを集計
    const events = await prisma.error_events.findMany({
        where: { match_id: matchId },
        orderBy: { closed_at: 'asc' }
    })

    // スコア集計
    const scores = new Map<string, number>()
    events.forEach(event => {
        if (event.closed_by) {
            scores.set(event.closed_by, (scores.get(event.closed_by) || 0) + 1)
        }
    })

    // 最高スコアのプレイヤーを見つける
    let winnerId: string | null = null
    let maxScore = 0
    for (const [playerId, score] of scores.entries()) {
        if (score > maxScore) {
            maxScore = score
            winnerId = playerId
        }
    }

    // Match を終了
    await prisma.matches.update({
        where: { id: matchId },
        data: {
            status: 'FINISHED',
            winner_id: winnerId
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

/**
 * 自動終了チェック: 全エラーが閉じられたら自動的にゲームを終了する
 * 全エラーが閉じられた場合、最高スコアのプレイヤーを勝者として finishGame を呼び出す
 */
export async function checkAutoFinish(matchId: string, roomId: string) {
    const user = await getAuthenticatedUser()

    // 閉じられていないエラーの数をカウント
    const unclosedCount = await prisma.error_events.count({
        where: {
            match_id: matchId,
            closed_at: null
        }
    })

    if (unclosedCount === 0) {
        // 全て閉じられた → 自動終了
        await finishGame(matchId, roomId)
        return true
    }

    return false
}
