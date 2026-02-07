'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    startGame,
    clickError,
    getMatchWithEvents,
    finishGame,
    getMatchIdFromRoom,
    getMatchProgress,
    checkAutoFinish,
} from '@/server/actions/game'
import type { MatchWithErrorEventsAndUsers, MatchProgress } from '@/shared/types'

// ============================================
// 型定義
// ============================================

/** ゲームのフェーズ */
export type GamePhase = 'TITLE' | 'WAITING' | 'APPEARING' | 'RESULT'

/** フックの戻り値 */
export interface UseErrorHunterReturn {
    phase: GamePhase
    match: MatchWithErrorEventsAndUsers | null
    clickResult: 'win' | 'lose' | null
    progress: MatchProgress | null
    isProcessing: boolean
    handleStartGame: () => Promise<void>
    handleClickError: (eventId: string) => Promise<void>
    handleFinish: () => Promise<void>
}

interface UseErrorHunterProps {
    roomId: string
    isHost: boolean
    initialMatchId: string | null
}

// ============================================
// フック本体
// ============================================

export function useErrorHunter({
    roomId,
    isHost,
    initialMatchId,
}: UseErrorHunterProps): UseErrorHunterReturn {
    const supabase = createClient()

    // ---- State ----
    const [phase, setPhase] = useState<GamePhase>('TITLE')
    const [match, setMatch] = useState<MatchWithErrorEventsAndUsers | null>(null)
    const [clickResult, setClickResult] = useState<'win' | 'lose' | null>(null)
    const [progress, setProgress] = useState<MatchProgress | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // ---- Refs ----
    // Realtime コールバック内で最新値を参照するために ref を使用する。
    // （useEffect の closure は初回レンダー時の値をキャプチャするため）
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const matchIdRef = useRef<string | null>(initialMatchId)
    const phaseRef = useRef<GamePhase>('TITLE')

    // state の最新値を ref に同期
    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    useEffect(() => {
        matchIdRef.current = match?.id ?? initialMatchId
    }, [match?.id, initialMatchId])

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
            // 既に出現時刻を過ぎている → 即座にエラーモーダル表示
            setPhase('APPEARING')
        } else {
            // 出現時刻まで WAITING → 時刻到達で APPEARING
            setPhase('WAITING')
            timerRef.current = setTimeout(() => {
                setPhase('APPEARING')
            }, delay)
        }
    }, [])

    // ============================================
    // データ取得: refreshMatchData
    // ============================================

    /**
     * 最新の Match データを Server Action 経由で取得し、state を更新する。
     *
     * この関数はホストとクライアントの両方で使われる:
     *
     * 【ホスト】
     *   handleStartGame で matchIdRef.current が設定済み
     *   → そのまま getMatchWithEvents で取得
     *
     * 【クライアント（初回）】
     *   matchIdRef.current が null
     *   → Room の currentMatchId を Server Action で取得して解決
     *
     * 【フェーズ遷移ロジック】
     *   - event.closed_by が設定済み → RESULT に遷移
     *   - 現在 TITLE フェーズ → タイマーを起動して WAITING/APPEARING に遷移
     *   - 現在 WAITING/APPEARING → タイマーは既に動いているので何もしない
     *
     * ※ phaseRef.current を使用して最新のフェーズを参照する。
     *   （Realtime コールバックの stale closure 問題を回避）
     */
    const refreshMatchData = useCallback(async () => {

        // ---- Step 1: matchId を解決する ----
        let targetMatchId = matchIdRef.current

        // matchId が不明（クライアント側で初回）→ Room から取得
        if (!targetMatchId) {
            const room = await getMatchIdFromRoom(roomId)
            targetMatchId = room?.currentMatchId ?? null
        }

        // まだゲームが開始されていない場合は何もしない
        if (!targetMatchId) {
            return
        }

        // ---- Step 2: Match + ErrorEvents を取得 ----
        try {
            const latestMatch = await getMatchWithEvents(targetMatchId)

            if (!latestMatch) {
                return
            }

            // matchIdRef を更新（クライアントが初めて Match を発見した場合に重要）
            matchIdRef.current = latestMatch.id
            setMatch(latestMatch)

            // ---- Step 2.5: 進行状況を取得 ----
            const progressData = await getMatchProgress(targetMatchId)
            setProgress(progressData)

            // 全エラーが閉じられた → RESULT フェーズへ
            if (progressData.closedErrors === progressData.totalErrors && progressData.totalErrors > 0) {
                setPhase('RESULT')
                console.log("犯人C")
                return
            }

            const event = latestMatch.error_events[0]
            if (!event) {
                return
            }

            // ---- Step 3: フェーズ遷移判定 ----
            const currentPhase = phaseRef.current

            // 3a. 勝者が既に決定している（Match が終了） → RESULT
            if (latestMatch.status === 'FINISHED') {
                setPhase('RESULT')
                console.log("犯人D")
                return
            }

            // 3b. TITLE フェーズ中に Match を発見した場合
            //     = クライアントがゲーム開始を Realtime 経由で検知したケース
            //     → タイマーを起動して WAITING/APPEARING に遷移する
            if (currentPhase === 'TITLE') {
                setupAppearanceTimer(event.appearance_at)
            }

            // 3c. WAITING/APPEARING フェーズ → タイマーが既に動いているので何もしない

        } catch (error) {
            console.error('Match データの取得に失敗:', error)
        }
    }, [roomId, setupAppearanceTimer])

    // ============================================
    // アクションハンドラ
    // ============================================

    /**
     * ゲーム開始（ホストのみ）
     *
     * 1. Server Action で Match + ErrorEvent を作成
     * 2. matchIdRef に新しい Match ID を設定
     * 3. 最新データを取得してタイマーを起動
     */
    const handleStartGame = useCallback(async () => {
        if (!isHost || isProcessing) return

        setIsProcessing(true)
        try {
            // Server Action: Match + ErrorEvent を作成
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
     * エラーモーダルのクリック（早い者勝ち）
     *
     * 1. Server Action で排他制御付き更新を実行
     * 2. 結果（勝ち/負け）をローカル state に保存（個別のエラー用ではなく全体用）
     * 3. 自動終了チェック（全エラーが閉じられたら RESULT フェーズに遷移）
     * 4. 最新データを再取得して進行状況を反映
     */
    const handleClickError = useCallback(async (eventId: string) => {
        if (!match || isProcessing) return

        setIsProcessing(true)
        try {
            const result = await clickError(eventId)
            
            // 自分がエラーを閉じられたかどうかを記録（最初の成功のみ）
            if (result.success && !clickResult) {
                setClickResult('win')
            }

            // 自動終了チェック
            if (match.id) {
                const finished = await checkAutoFinish(match.id, roomId)
                if (finished) {
                    // 全エラーが閉じられた → RESULT フェーズへ
                    setPhase('RESULT')
                }
            }

            // 最新データを取得して進行状況を反映
            await refreshMatchData()
        } catch (error) {
            console.error('クリック処理に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [match, roomId, isProcessing, clickResult, refreshMatchData])

    /**
     * ゲーム終了 → タイトルモーダルに戻る
     *
     * ホスト: Server Action で Match 終了 + Room の currentMatchId をクリア
     * クライアント: ローカル状態のリセットのみ
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
            setProgress(null)
            setPhase('TITLE')
            matchIdRef.current = null
        } catch (error) {
            console.error('ゲーム終了に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [match, roomId, isHost, isProcessing])


    // クライアントはここの処理でホームに帰れるため消さないで
    const handleFinishClinet = useCallback(async () => {

        // クライアントの場合はisHostはfalseかつisProcessingがfalseなことはわかるはず
        if (isHost || isProcessing) return

        setIsProcessing(true)
        try {
            // ローカル状態をリセット
            setMatch(null)
            setClickResult(null)
            setProgress(null)
            matchIdRef.current = null
            setPhase('TITLE')
            console.log("ここまで走っているはず");
        } catch (error) {
            console.error('ゲーム終了に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [match, roomId, isHost, isProcessing])

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

                const event = existingMatch.error_events[0]
                if (!event) return

                // Match が FINISHED の場合は RESULT フェーズへ（20個すべて閉じられた状態）
                if (existingMatch.status === 'FINISHED') {
                    console.log("犯人A")
                    setPhase('RESULT')
                } else if (event.closed_by) {
                    // 1個でも閉じられている（古いロジック）
                    setPhase('RESULT')
                    console.log("犯人B")

                } else {
                    // まだゲーム中 → タイマーをセット
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
     *
     * error_events と matches テーブルの変更を監視する。
     * ペイロード（payload.new, payload.old）は一切使用しない。
     * 変更を検知したら refreshMatchData() で最新データを Server Action 経由で再取得する。
     *
     * refreshMatchData は useCallback で安定化されているため、
     * このサブスクリプションは roomId が変わらない限り再登録されない。
     */
    useEffect(() => {
        const channel = supabase
            .channel(`error_hunter_${roomId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'error_events',
            }, () => {
                refreshMatchData()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'matches',
            }, () => {
                refreshMatchData()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms',
            }, () => {
                handleFinishClinet(); // ここの処理を消すとクライアントは受け取る手段がない
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, roomId, refreshMatchData])

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
        clickResult,
        progress,
        isProcessing,
        handleStartGame,
        handleClickError,
        handleFinish,
    }
}
