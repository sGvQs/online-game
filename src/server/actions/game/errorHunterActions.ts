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

    // ErrorEvent を作成
    await prisma.error_events.create({
        data: {
            match_id: match.id,
            appearance_at: appearanceAt,
        }
    })

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
        // 勝者: Match の winner_id も更新
        const event = await prisma.error_events.findUnique({
            where: { id: eventId }
        })

        if (event) {
            await prisma.matches.update({
                where: { id: event.match_id },
                data: { winner_id: user.id }
            })
        }

        return { success: true }
    }

    // 敗者: 更新件数0（既に誰かが閉じた or フライング）
    return { success: false }
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
 * ゲーム終了: Match ステータスを更新し、タイトルモーダルに戻る
 * ホストのみ実行可能
 */
export async function finishGame(matchId: string, roomId: string) {
    const user = await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    })

    if (!room) throw new Error('ルームが見つかりません')
    if (room.createdBy !== user.id) throw new Error('ゲームを終了する権限がありません（ホストのみ）')

    // Match ステータスを FINISHED に更新
    await prisma.matches.update({
        where: { id: matchId },
        data: { status: 'FINISHED' }
    })

    // Room の currentMatchId をクリア
    await prisma.room.update({
        where: { id: roomId },
        data: {
            currentMatchId: null,
        }
    })
}
