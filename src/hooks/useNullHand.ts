'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    startJankenMatch,
    setInitialHand,
    confirmShowcase,
    setFinalHostHand,
    setGuestHand,
    getLatestJankenEventWithStats,
    getMatchScores,
    finishJanken,
    markNextRoundReady,
} from '@/server/actions/game'
import { resetAllReady } from '@/server/actions/room'
import type {
    JankenEventWithGuests,
    HostStats,
    JankenPhase,
    HandType,
    FakeTarget,
    FakeDetails,
    MatchScoreWithUser,
} from '@/shared/types'
import { useSE } from './useSE'

// ============================================
// フックの戻り値
// ============================================

export interface UseNullHandReturn {
    phase: JankenPhase
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isProcessing: boolean
    currentScores: MatchScoreWithUser[]
    handleStartGame: () => Promise<void>
    handleSetInitialHand: (hand: HandType, fakeTarget: FakeTarget, fakeDetails?: FakeDetails) => Promise<void>
    handleConfirmShowcase: () => Promise<void>
    handleSetFinalHostHand: (hand: HandType) => Promise<void>
    handleSetGuestHand: (hand: HandType) => Promise<void>
    handleNextRound: () => Promise<void>
    handleMarkNextRoundReady: () => Promise<void>
    handleFinish: () => Promise<void>
    isCurrentHost: boolean
    error: string | null
}

interface UseNullHandProps {
    roomId: string
    isHost: boolean
    initialMatchId: string | null
    currentUserId: string
}

// ============================================
// フック本体
// ============================================

export function useNullHand({
    roomId,
    isHost,
    initialMatchId,
    currentUserId,
}: UseNullHandProps): UseNullHandReturn {
    // useMemo でクライアントを1度だけ生成し、再レンダーによる再生成を防ぐ
    const supabase = useMemo(() => createClient(), [])
    const { play } = useSE()

    // ---- State ----
    const [phase, setPhase] = useState<JankenPhase>('TITLE')
    const [jankenEvent, setJankenEvent] = useState<JankenEventWithGuests | null>(null)
    const [hostStats, setHostStats] = useState<HostStats | null>(null)
    const [currentScores, setCurrentScores] = useState<MatchScoreWithUser[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [matchId, setMatchId] = useState<string | null>(initialMatchId)

    // ---- Refs ----
    const matchIdRef = useRef<string | null>(initialMatchId)
    const phaseRef = useRef<JankenPhase>('TITLE')
    // 重複フェッチ防止フラグ
    const isFetchingRef = useRef(false)

    // state の最新値を ref に同期
    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    // ============================================
    // 状態取得ヘルパー
    // ============================================

    /**
     * 最新の JankenEvent と HostStats を1往復で取得して状態を更新。
     * in-flight な fetch がある場合はスキップして重複リクエストを防ぐ。
     */
    const fetchState = useCallback(async () => {
        if (!matchIdRef.current) return
        // 既に fetch 中なら今回のリクエストはスキップ
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        try {
            const result = await getLatestJankenEventWithStats(matchIdRef.current)
            if (!result) return

            const { event, stats } = result
            const eventPhase = event.phase as JankenPhase

            setJankenEvent(event)
            setHostStats(stats)

            // フェーズが変わった時のみ setPhase を呼ぶ（余計な再レンダーを防ぐ）
            if (phaseRef.current !== eventPhase) {
                setPhase(eventPhase)
            }
        } catch (err) {
            console.error('状態取得に失敗:', err)
            setError('データの取得に失敗しました')
        } finally {
            isFetchingRef.current = false
        }
    }, []) // matchIdRef は ref なので依存不要

    // ============================================
    // アクションハンドラ
    // ============================================

    /**
     * ゲーム開始（ホストのみ）
     */
    const handleStartGame = useCallback(async () => {
        if (!isHost || isProcessing) return
        play('submit')
        setIsProcessing(true)
        try {
            await resetAllReady(roomId)
            const match = await startJankenMatch(roomId)
            matchIdRef.current = match.id
            setMatchId(match.id)
        } catch (err) {
            console.error('ゲーム開始に失敗:', err)
            setError('ゲームの開始に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [roomId, isHost, isProcessing, play])

    /**
     * ホストの初期手と嘘を設定
     */
    const handleSetInitialHand = useCallback(async (hand: HandType, fakeTarget: FakeTarget, fakeDetails?: FakeDetails) => {
        if (!jankenEvent || isProcessing) return
        play('select')
        setIsProcessing(true)
        try {
            await setInitialHand(jankenEvent.id, hand, fakeTarget, fakeDetails)
            // Realtime で全員に通知されるため自分自身も fetchState で最新化
            await fetchState()
        } catch (err) {
            console.error('初期手設定に失敗:', err)
            setError('手の設定に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing, fetchState, play])

    /**
     * ゲストの確認完了
     */
    const handleConfirmShowcase = useCallback(async () => {
        if (!jankenEvent || isProcessing) return
        play('select')
        setIsProcessing(true)
        try {
            await confirmShowcase(jankenEvent.id, currentUserId)
            // 全員揃ったら Realtime で FINAL_DECISION に移行するため、自分だけ即時状態更新
            await fetchState()
        } catch (err) {
            console.error('確認完了に失敗:', err)
            setError('確認処理に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, currentUserId, isProcessing, fetchState, play])

    /**
     * ホストの最終決定
     */
    const handleSetFinalHostHand = useCallback(async (hand: HandType) => {
        if (!jankenEvent || isProcessing) return
        play('select')
        setIsProcessing(true)
        try {
            await setFinalHostHand(jankenEvent.id, hand)
            await fetchState()
        } catch (err) {
            console.error('最終決定に失敗:', err)
            setError('決定処理に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing, fetchState, play])

    /**
     * ゲストの手を設定
     */
    const handleSetGuestHand = useCallback(async (hand: HandType) => {
        if (!jankenEvent || isProcessing) return
        play('select')
        setIsProcessing(true)
        try {
            await setGuestHand(jankenEvent.id, currentUserId, hand)
            await fetchState()
        } catch (err) {
            console.error('手の設定に失敗:', err)
            setError('手の送信に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, currentUserId, isProcessing, fetchState, play])

    /**
     * 次のラウンドへ遷移（後方互換のため残す）
     */
    const handleNextRound = useCallback(async () => {
        // markNextRoundReady に統合したため空実装
    }, [])

    /**
     * 次のラウンドへの準備完了をマーク
     */
    const handleMarkNextRoundReady = useCallback(async () => {
        if (!jankenEvent || isProcessing) return
        play('select')
        setIsProcessing(true)
        try {
            await markNextRoundReady(roomId, currentUserId, jankenEvent.matchId)
            // 全員揃ったら Realtime で次ターン SETUP が届く
            // 自分の isReady 状態をローカルでも即時反映させるため fetch
            await fetchState()
        } catch (err) {
            console.error('準備完了のマークに失敗:', err)
            setError('準備完了の送信に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, roomId, currentUserId, isProcessing, fetchState, play])

    /**
     * ゲーム終了 → タイトルに戻る
     */
    const handleFinish = useCallback(async () => {
        if (!matchIdRef.current || isProcessing) return
        play('submit')
        setIsProcessing(true)
        try {
            await finishJanken(matchIdRef.current, roomId)
            setPhase('TITLE')
            setJankenEvent(null)
            setHostStats(null)
            matchIdRef.current = null
        } catch (err) {
            console.error('ゲーム終了に失敗:', err)
            setError('ゲーム終了処理に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [roomId, isProcessing, play])

    // ============================================
    // Effects
    // ============================================

    /**
     * スコア取得（RESULT / GAME_OVER フェーズのみ）
     */
    useEffect(() => {
        if (!matchIdRef.current) return
        if (phase !== 'RESULT' && phase !== 'GAME_OVER') return

        const fetchScores = async () => {
            try {
                const scores = await getMatchScores(matchIdRef.current!)
                setCurrentScores(scores)
            } catch (err) {
                console.error('スコア取得に失敗:', err)
            }
        }

        fetchScores()
    }, [phase])

    /**
     * 初期データ取得（ページロード時、試合が既に進行中の場合）
     */
    useEffect(() => {
        if (!initialMatchId) return
        matchIdRef.current = initialMatchId
        fetchState()
    }, [initialMatchId, fetchState])

    /**
     * janken_events テーブルのリアルタイム監視
     *
     * ペイロードの phase を即時 setPhase して UX を向上させつつ、
     * fetchState でデータを最新化する（isFetchingRef で重複防止済み）。
     */
    useEffect(() => {
        if (!matchId) return

        const channel = supabase
            .channel(`null_hand_events_${matchId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'janken_events',
                filter: `match_id=eq.${matchId}`,
            }, (payload: { new: Record<string, unknown> }) => {
                // INSERT = 新しいターン開始。ペイロードから phase を即時反映
                const newPhase = payload.new.phase as JankenPhase
                if (newPhase && phaseRef.current !== newPhase) {
                    setPhase(newPhase)
                }
                fetchState()
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'janken_events',
                filter: `match_id=eq.${matchId}`,
            }, (payload: { new: Record<string, unknown> }) => {
                // UPDATE = フェーズ変更など。ペイロードから phase を即時反映
                const newPhase = payload.new.phase as JankenPhase
                if (newPhase && phaseRef.current !== newPhase) {
                    setPhase(newPhase)
                }
                fetchState()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [matchId, supabase, fetchState])

    /**
     * matches テーブルの監視（ゲーム開始検知）
     */
    useEffect(() => {
        const channel = supabase
            .channel(`null_hand_matches_${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'matches',
                filter: `room_id=eq.${roomId}`,
            }, (payload: { new: Record<string, unknown> }) => {
                if ((payload.new.winner_id as string | null) !== null) return
                const newMatchId = payload.new.id as string
                matchIdRef.current = newMatchId
                setMatchId(newMatchId)
                // matches と janken_events はトランザクションで同時作成される。
                // janken_events の購読は setMatchId による再レンダー後になるため、
                // 最初の INSERT イベントは取りこぼす（Race Condition）。
                // そのため、ここで即時 fetchState を呼んで最新の SETUP フェーズを取得する。
                fetchState()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, supabase, fetchState])

    /**
     * ウインドウ復帰時の再取得（長時間放置後の対策）
     * isFetchingRef により多発しても1リクエストに収束する
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && matchIdRef.current) {
                fetchState()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [fetchState])

    // ============================================
    // 戻り値
    // ============================================

    const isCurrentHost = jankenEvent?.currentHostId === currentUserId

    return {
        phase,
        jankenEvent,
        hostStats,
        isProcessing,
        currentScores,
        handleStartGame,
        handleSetInitialHand,
        handleConfirmShowcase,
        handleSetFinalHostHand,
        handleSetGuestHand,
        handleNextRound,
        handleMarkNextRoundReady,
        handleFinish,
        isCurrentHost,
        error,
    }
}
