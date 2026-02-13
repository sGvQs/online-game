'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    startGame,
    clickError,
    getMatchWithEvents,
    getMatchProgress,
    checkAutoFinish,
} from '@/server/actions/game'
import { resetAllReady } from '@/server/actions/room'
import type { MatchWithErrorEventsAndUsers, MatchProgress, ErrorEventWithUser } from '@/shared/types'
import { getUserComment } from '@/server/actions/user/getUserComment'
import { useSE } from './useSE'

// ============================================
// Supabase Realtime ペイロード型定義
// ============================================

/**
 * Supabaseから受け取るデータはデータベースのカラム名（snake_case）
 * Prismaの型（camelCase）とは異なるため、別途定義が必要
 */

/** error_events テーブルの型（snake_case） */
interface ErrorEventRow {
    id: string
    match_id: string
    appearance_at: string
    closed_at: string | null
    closed_by: string | null
    position_x: number
    position_y: number
    room_id: string
}

/** matches テーブルの型（snake_case） */
interface MatchRow {
    id: string
    room_id: string
    game_type: string
    status: string
    winner_id: string | null
    created_at: string
}

/** Supabase Realtime の postgres_changes イベントペイロード */
interface RealtimePostgresChangesPayload<T> {
    commit_timestamp: string
    errors: null | string
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: T
    old: Partial<T>
    schema: string
    table: string
}

/** Broadcast イベントのペイロード */
interface BroadcastPayload<T> {
    type: 'broadcast'
    event: string
    payload: T
}

/** エラークリック時のブロードキャストペイロード */
interface ErrorClickPayload {
    eventId: string
    userId: string | null
    createdAt: Date
}

// ============================================
// 型定義
// ============================================

/** ゲームのフェーズ */
export type GamePhase = 'TITLE' | 'WAITING' | 'APPEARING' | 'RESULT'

/** フックの戻り値 */
export interface UseErrorHunterReturn {
    phase: GamePhase
    match: MatchWithErrorEventsAndUsers | null
    progress: MatchProgress | null
    isProcessing: boolean
    handleStartGame: () => Promise<void>
    handleClickError: (eventId: string) => Promise<void>
    handleFinish: () => Promise<void>
    waitProgress: number
    winnerComment: string | null
}

interface UseErrorHunterProps {
    roomId: string
    isHost: boolean
    initialMatchId: string | null
    currentUserId: string | null
}

// ============================================
// フック本体
// ============================================

export function useErrorHunter({
    roomId,
    isHost,
    initialMatchId, // 通常時はnullだが、ページリロード時にゲームが始まっていた時に渡される
    currentUserId,
}: UseErrorHunterProps): UseErrorHunterReturn {
    const supabase = createClient()

    // ---- State ----
    const [phase, setPhase] = useState<GamePhase>('TITLE')
    const [match, setMatch] = useState<MatchWithErrorEventsAndUsers | null>(null)
    const [progress, setProgress] = useState<MatchProgress | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // ---- Refs ----
    // Realtime コールバック内で最新値を参照するために ref を使用する。
    // （useEffect の closure は初回レンダー時の値をキャプチャするため）
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const matchIdRef = useRef<string | null>(initialMatchId)
    const phaseRef = useRef<GamePhase>('TITLE')

    // 既に閉じられたエラーIDを保持するSet (クライアントサイドフィルタリング用)
    const closedEventIds = useRef<Set<string>>(new Set())
    const isSetupGameStatusRef = useRef<boolean>(false)
    const broadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    const [waitProgress, setWaitProgress] = useState(0)
    const [winnerComment, setWinnerComment] = useState<string | null>(null)

    // state の最新値を ref に同期
    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    // WAITING フェーズ用のプログレスバー
    useEffect(() => {
        if (phase !== 'WAITING') {
            setWaitProgress(0)
            return
        }

        const interval = setInterval(() => {
            setWaitProgress(prev => {
                // 0〜100をループするアニメーション
                const next = prev + 20
                return next > 200 ? 0 : next
            })
        }, 200)

        return () => clearInterval(interval)
    }, [phase])

    // ============================================
    // タイマー管理
    // ============================================

    /**
     * appearanceAt の時刻に基づいてフェーズを切り替えるタイマーをセットする。
     *
     * - まだ出現時刻前 → WAITING にし、時刻到達で APPEARING に切り替え
     * - 既に出現時刻を過ぎている → 即座に APPEARING に切り替え
     *
     * このコールバックは依存が空なので、インスタンスが変わらず安定している。
     */
    const setupAppearanceTimer = useCallback((appearanceAt: Date | string) => {
        // 既存タイマーをクリア
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }

        const now = Date.now();

        // 1. まずは Date オブジェクトか文字列かを判定し、常に Date 型の変数を作る
        let targetDate: Date;

        if (typeof appearanceAt === 'string') {
            // 文字列の場合: Z がなければ足して UTC として解釈
            const dateString = appearanceAt.endsWith('Z') ? appearanceAt : `${appearanceAt}Z`;
            targetDate = new Date(dateString);
        } else {
            // Date オブジェクトの場合: そのまま使用
            targetDate = appearanceAt;
        }

        const targetTime = targetDate.getTime();
        const delay = targetTime - now;

        if (delay <= 0) {
            setPhase('APPEARING');
            useSE().play('error');
        } else {
            setPhase('WAITING');
            timerRef.current = setTimeout(() => {
                setPhase('APPEARING');
                useSE().play('error');
            }, delay);
        }
    }, []);

    // ============================================
    // ヘルパー関数
    // ============================================

    /**
     * エラーイベントがクローズされたことをローカル状態に反映する
     * （broadcastとhandleClickErrorの両方で使用）
     */
    const updateLocalStateForClosedError = useCallback((
        eventId: string,
        closedBy: string | null,
        closedAt: Date
    ) => {
        setMatch(prev => {
            if (!prev) return null

            const newEvents = prev.errorEvents.map((e) =>
                e.id === eventId
                    ? { ...e, closedAt, closedBy }
                    : e
            )
            return { ...prev, errorEvents: newEvents }
        })

        setProgress(prev => {
            if (!prev) return null

            // 既にカウント済みならスキップ
            const existingEvent = prev.events.find(e => e.id === eventId)
            if (existingEvent?.closedBy) return prev

            const newScores = { ...prev.scores }
            if (closedBy) {
                newScores[closedBy] = (newScores[closedBy] || 0) + 1
            }

            const newEvents = prev.events.map(e =>
                e.id === eventId
                    ? { ...e, closedAt, closedBy, positionX: e.positionX, positionY: e.positionY }
                    : e
            )

            return {
                ...prev,
                closedErrors: prev.closedErrors + 1,
                scores: newScores,
                events: newEvents,
            }
        })
    }, [])

    /**
     * ゲーム状態を完全にリセット（次のゲーム準備）
     */
    const resetGameState = useCallback(() => {
        setMatch(null)
        setProgress(null)
        setPhase('TITLE')
        setWinnerComment(null)
        matchIdRef.current = null
        isSetupGameStatusRef.current = false
        closedEventIds.current.clear()
    }, [])

    // ============================================
    // アクションハンドラ
    // ============================================

    /**
     * ゲーム開始（ホストのみ）
     *
     * 1. 全員の準備状態をリセット
     * 2. Server Action で Match + ErrorEvent を作成
     * 3. matchIdRef に新しい Match ID を設定
     * 4. 最新データを取得してタイマーを起動
     */
    const handleStartGame = useCallback(async () => {
        if (!isHost || isProcessing) return

        setIsProcessing(true)
        try {
            // 全員の準備状態をリセット
            await resetAllReady(roomId)

            // Server Action: Match + ErrorEvent を作成
            await startGame(roomId)

        } catch (error) {
            console.error('ゲーム開始に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [roomId, isHost, isProcessing])


    /**
     * エラーモーダルのクリック（早い者勝ち）
     * 
     * 楽観的UI更新を採用:
     * 1. クリックした瞬間にUIを更新（即座にエラーモーダルを閉じる）
     * 2. DBでの排他制御チェックをバックグラウンドで実行
     * 3. DBチェックが失敗した場合はUIをロールバック
     */
    const handleClickError = useCallback(async (eventId: string) => {
        // ガード句: 基本条件チェック
        if (!match || isProcessing) return
        if (closedEventIds.current.has(eventId)) return

        // 第一関門: 楽観的UI更新（クリックした瞬間にUIを閉じる）
        closedEventIds.current.add(eventId)

        const optimisticEvent = {
            eventId,
            userId: currentUserId,
            createdAt: new Date()
        }

        // 即座にローカル状態を更新（スピード感のある反応）
        updateLocalStateForClosedError(eventId, optimisticEvent.userId, optimisticEvent.createdAt)

        setIsProcessing(true)
        try {
            // 第二関門: DBでの排他制御チェック（バックグラウンドで実行）
            const isSuccess = await clickError(eventId)

            if (!isSuccess) {
                // DBチェック失敗 → UIをロールバック
                closedEventIds.current.delete(eventId)

                // 状態を元に戻す（エラーを未クローズ状態に）
                setMatch(prev => {
                    if (!prev) return null
                    const newEvents = prev.errorEvents.map((e) =>
                        e.id === eventId
                            ? { ...e, closedAt: null, closedBy: null }
                            : e
                    )
                    return { ...prev, errorEvents: newEvents }
                })

                setProgress(prev => {
                    if (!prev) return null

                    const newScores = { ...prev.scores }
                    if (optimisticEvent.userId && newScores[optimisticEvent.userId]) {
                        newScores[optimisticEvent.userId] = Math.max(0, newScores[optimisticEvent.userId] - 1)
                    }

                    const newEvents = prev.events.map(e =>
                        e.id === eventId
                            ? { ...e, closedAt: null, closedBy: null }
                            : e
                    )

                    return {
                        ...prev,
                        closedErrors: Math.max(0, prev.closedErrors - 1),
                        scores: newScores,
                        events: newEvents,
                    }
                })
                return
            }

            // DBチェック成功 → 他のクライアントへブロードキャスト
            broadcastChannelRef.current?.send({
                type: 'broadcast',
                event: 'click-error',
                payload: optimisticEvent
            })

            // 全エラー終了チェック
            if (match.id) {
                await checkAutoFinish(match.id, roomId)
            }
        } catch (error) {
            console.error('クリック処理に失敗:', error)
            // エラー時もロールバック
            closedEventIds.current.delete(eventId)
        } finally {
            setIsProcessing(false)
        }
    }, [match, roomId, isProcessing, currentUserId, updateLocalStateForClosedError])

    /**
     * ゲーム終了 → タイトルモーダルに戻る
     *
     * 全ユーザー: ローカル状態のリセットのみ
     * （Match のステータスは checkAutoFinish で既に FINISHED に設定済み）
     */
    const handleFinish = useCallback(async () => {
        if (!match || isProcessing) return

        setIsProcessing(true)
        try {
            resetGameState()
        } catch (error) {
            console.error('ゲーム終了に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [match, isProcessing, resetGameState])


    // ============================================
    // Effects
    // ============================================

    /**
     * 初期データ取得
     *
     * ページロード時に initialMatchId (= Room.currentMatchId) が存在する場合、
     * 既存の Match データを読み込んでゲーム状態を復元する。
     * （例: ページリロード時、途中参加時）
     */
    useEffect(() => {
        if (!initialMatchId) return

        const loadInitialMatch = async () => {
            try {
                const existingMatch = await getMatchWithEvents(initialMatchId)
                if (!existingMatch) return

                setMatch(existingMatch)
                matchIdRef.current = existingMatch.id

                const firstEvent = existingMatch.errorEvents[0]
                if (!firstEvent) return

                // ゲーム状態の判定と適切なフェーズへ遷移
                if (existingMatch.status === 'FINISHED') {
                    setPhase('RESULT')
                    return
                }

                if (firstEvent.closedBy) {
                    setPhase('RESULT')
                    return
                }

                // ゲーム進行中 → タイマーセット
                setupAppearanceTimer(firstEvent.appearanceAt)
            } catch (error) {
                console.error('初期データの取得に失敗:', error)
            }
        }

        loadInitialMatch()
    }, [initialMatchId, setupAppearanceTimer])

    /**
     * Supabase Realtime サブスクリプション
     *
     * error_events と matches テーブルの変更を監視する。
     * ペイロード（payload.new, payload.old）は一切使用しない。
     * 変更を検知したら refreshMatchData() で最新データを Server Action 経由で再取得する。
     *
     * refreshMatchData は useCallback で安定化されているため、
     * このサブスクリプションは roomId が変わらない限り再登録されない。
     */
    useEffect(() => {
        // Broadcast channel for real-time game events
        const broadcastChannel = supabase.channel(`error-hunter-broadcast-${roomId}`)
        broadcastChannelRef.current = broadcastChannel

        broadcastChannel
            .on('broadcast', { event: 'click-error' }, (payload: BroadcastPayload<ErrorClickPayload>) => {
                const eventData = payload.payload
                if (!eventData) return
                if (closedEventIds.current.has(eventData.eventId)) return

                closedEventIds.current.add(eventData.eventId)
                updateLocalStateForClosedError(
                    eventData.eventId,
                    eventData.userId,
                    eventData.createdAt
                )
            })

        // Postgres changes channel for game state
        const channel = supabase
            .channel(`error_hunter_${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'error_events',
                filter: `room_id=eq.${roomId}`,
            }, async (payload: RealtimePostgresChangesPayload<ErrorEventRow>) => {
                // ゲーム開始検知: 新しいエラーイベントが作成されたらゲームをセットアップ
                const matchId = payload.new.match_id
                const appearanceAt = payload.new.appearance_at

                if (!matchId) return
                if (!appearanceAt) return
                if (isSetupGameStatusRef.current) return

                // ゲーム状態の初期化
                matchIdRef.current = matchId
                const progressData = await getMatchProgress(matchId)
                setProgress(progressData)
                const matchData = await getMatchWithEvents(matchId)
                setMatch(matchData)
                setupAppearanceTimer(appearanceAt)
                isSetupGameStatusRef.current = true
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'matches',
                filter: `room_id=eq.${roomId}`
            }, async (payload: RealtimePostgresChangesPayload<MatchRow>) => {
                // ゲーム終了検知: 勝者が決定したらRESULTフェーズへ
                if (!payload.new.winner_id) return
                if (payload.new.status !== 'FINISHED') return

                const comment = await getUserComment(payload.new.winner_id)
                setWinnerComment(comment)
                useSE().play('tada')
                setPhase('RESULT')
            })
            .subscribe()

        // Subscribe broadcast channel
        broadcastChannel.subscribe()

        return () => {
            supabase.removeChannel(channel)
            supabase.removeChannel(broadcastChannel)
            broadcastChannelRef.current = null
        }
    }, [supabase, roomId])

    /**
     * クリーンアップ: アンマウント時にタイマーを解除
     */
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    // ============================================
    // 戻り値
    // ============================================

    return {
        phase,
        match,
        progress,
        isProcessing,
        handleStartGame,
        handleClickError,
        handleFinish,
        waitProgress,
        winnerComment,
    }
}
