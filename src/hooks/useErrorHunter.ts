'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startGame, clickError, getMatchWithEvents, finishGame } from '@/server/actions/game'
import type { MatchWithErrorEventsAndUsers } from '@/shared/types'

/** ゲームのフェーズ */
export type GamePhase = 'TITLE' | 'WAITING' | 'APPEARING' | 'RESULT'

/** フックの戻り値 */
export interface UseErrorHunterReturn {
    phase: GamePhase
    match: MatchWithErrorEventsAndUsers | null
    clickResult: 'win' | 'lose' | null
    isProcessing: boolean
    handleStartGame: () => Promise<void>
    handleClickError: () => Promise<void>
    handleFinish: () => Promise<void>
}

interface UseErrorHunterProps {
    roomId: string
    isHost: boolean
    initialMatchId: string | null
}

export function useErrorHunter({ roomId, isHost, initialMatchId }: UseErrorHunterProps): UseErrorHunterReturn {
    const supabase = createClient()

    const [phase, setPhase] = useState<GamePhase>('TITLE')
    const [match, setMatch] = useState<MatchWithErrorEventsAndUsers | null>(null)
    const [clickResult, setClickResult] = useState<'win' | 'lose' | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // タイマーIDの参照（クリーンアップ用）
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    // 現在のmatchIdの参照（Realtimeコールバック内で最新値を参照するため）
    const matchIdRef = useRef<string | null>(initialMatchId)

    // matchIdRef を同期
    useEffect(() => {
        matchIdRef.current = match?.id ?? initialMatchId
    }, [match?.id, initialMatchId])

    /**
     * 最新のMatchデータを取得し、stateを更新する
     */
    const refreshMatchData = useCallback(async () => {
        const currentMatchId = matchIdRef.current
        if (!currentMatchId) return

        try {
            const latestMatch = await getMatchWithEvents(currentMatchId)
            if (!latestMatch) return

            setMatch(latestMatch)

            const event = latestMatch.error_events[0]
            if (!event) return

            // closedBy が設定されていればリザルト画面へ
            if (event.closed_by) {
                setPhase('RESULT')
                return
            }

            // TITLE以外でまだ閉じられていなければ、タイマー管理に任せる
            // (WAITING or APPEARING のまま維持)
        } catch (error) {
            console.error('Match データの取得に失敗:', error)
        }
    }, [])

    /**
     * appearanceAt に基づいてタイマーをセットする
     */
    const setupAppearanceTimer = useCallback((appearanceAt: Date) => {
        // 既存タイマーをクリア
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }

        const now = Date.now()
        const targetTime = new Date(appearanceAt).getTime()
        const delay = targetTime - now

        if (delay <= 0) {
            // 既に出現時刻を過ぎている
            setPhase('APPEARING')
        } else {
            // 出現時刻まで待機
            setPhase('WAITING')
            timerRef.current = setTimeout(() => {
                setPhase('APPEARING')
            }, delay)
        }
    }, [])

    /**
     * ゲーム開始（ホストのみ）
     */
    const handleStartGame = useCallback(async () => {
        if (!isHost || isProcessing) return

        setIsProcessing(true)
        try {
            const newMatch = await startGame(roomId)
            matchIdRef.current = newMatch.id

            // 作成直後に最新データを取得
            const fullMatch = await getMatchWithEvents(newMatch.id)
            if (fullMatch) {
                setMatch(fullMatch)
                setClickResult(null)

                const event = fullMatch.error_events[0]
                if (event) {
                    setupAppearanceTimer(event.appearance_at)
                }
            }
        } catch (error) {
            console.error('ゲーム開始に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [roomId, isHost, isProcessing, setupAppearanceTimer])

    /**
     * エラーモーダルをクリック（早い者勝ち）
     */
    const handleClickError = useCallback(async () => {
        const event = match?.error_events[0]
        if (!event || isProcessing) return

        setIsProcessing(true)
        try {
            const result = await clickError(event.id)
            setClickResult(result.success ? 'win' : 'lose')

            // 勝っても負けてもリザルト画面へ（他クライアントはRealtime経由で遷移する）
            setPhase('RESULT')

            // 最新データを取得して勝者情報を反映
            await refreshMatchData()
        } catch (error) {
            console.error('クリック処理に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [match, isProcessing, refreshMatchData])

    /**
     * ゲーム終了（ホストのみ）→ タイトルモーダルに戻る
     */
    const handleFinish = useCallback(async () => {
        if (!match || isProcessing) return

        setIsProcessing(true)
        try {
            if (isHost) {
                await finishGame(match.id, roomId)
            }

            // ローカル状態をリセット
            setMatch(null)
            setClickResult(null)
            setPhase('TITLE')
            matchIdRef.current = null
        } catch (error) {
            console.error('ゲーム終了に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [match, roomId, isHost, isProcessing])

    /**
     * 初期データ取得: currentMatchId がある場合は既存 Match を読み込む
     */
    useEffect(() => {
        if (!initialMatchId) return

        const loadInitialMatch = async () => {
            try {
                const existingMatch = await getMatchWithEvents(initialMatchId)
                if (!existingMatch) return

                setMatch(existingMatch)

                const event = existingMatch.error_events[0]
                if (!event) return

                if (event.closed_by) {
                    // 既に勝者が決定済み
                    setPhase('RESULT')
                } else {
                    // まだゲーム中: タイマーをセット
                    setupAppearanceTimer(event.appearance_at)
                }
            } catch (error) {
                console.error('初期データの取得に失敗:', error)
            }
        }

        loadInitialMatch()
    }, [initialMatchId, setupAppearanceTimer])

    /**
     * Supabase Realtime サブスクリプション
     * error_events と matches テーブルの変更を監視
     * ペイロードは使用せず、シグナルとしてのみ利用する
     */
    useEffect(() => {
        const channel = supabase
            .channel(`error_hunter_${roomId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'error_events',
            }, () => {
                // シグナル駆動: 変更を検知したら最新データを再取得
                refreshMatchData()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'matches',
            }, () => {
                refreshMatchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId])

    /**
     * match データ更新時にタイマーを再設定する
     */
    useEffect(() => {
        if (!match) return

        const event = match.error_events[0]
        if (!event) return

        // 既に閉じられている場合はタイマー不要
        if (event.closed_by) return

        // TITLE フェーズの場合はまだタイマーを設定しない
        // (handleStartGame がセットする)
        if (phase === 'TITLE') return

        // WAITING/APPEARING フェーズでタイマーが未設定の場合のみ再設定
        if (phase === 'WAITING' || phase === 'APPEARING') {
            // APPEARING 中はタイマー不要
            if (phase === 'APPEARING') return

            setupAppearanceTimer(event.appearance_at)
        }
    }, [match, phase, setupAppearanceTimer])

    /**
     * クリーンアップ: タイマーを解除
     */
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    return {
        phase,
        match,
        clickResult,
        isProcessing,
        handleStartGame,
        handleClickError,
        handleFinish,
    }
}
