'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    startJankenMatch,
    getHostStats,
    setInitialHand,
    confirmShowcase,
    setFinalHostHand,
    setGuestHand,
    getJankenEvent,
    getLatestJankenEvent,
    getMatchScores,
    startNextTurn,
    finishJanken,
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
// Supabase Realtime ペイロード型定義
// ============================================

interface JankenEventRow {
    id: string
    match_id: string
    current_host_id: string
    turn_number: number
    phase: string
    phase_ends_at: string
    initial_hand: string | null
    final_host_hand: string | null
    fake_target: string
}

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
    const supabase = createClient()
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

    // state の最新値を ref に同期
    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    // ============================================
    // JankenEvent取得
    // ============================================

    // ============================================
    // データ取得ヘルパー
    // ============================================

    /**
     * 最新のJankenEventを取得して状態を更新
     */
    const fetchJankenEvent = useCallback(async () => {
        if (!matchIdRef.current) {
            return
        }

        try {
            const latest = await getLatestJankenEvent(matchIdRef.current)
            if (!latest) return

            const eventPhase = latest.phase as JankenPhase

            setJankenEvent(latest)
            if (phaseRef.current !== eventPhase) {
                setPhase(eventPhase)
            }

            // SETUP フェーズなら統計取得（ゲストもホストのデータを見る）
            // BATTLE, RESULT フェーズでも表示などのために必要
            if (eventPhase === 'SETUP' || eventPhase === 'SHOWCASE' || eventPhase === 'FINAL_DECISION' || eventPhase === 'BATTLE' || eventPhase === 'RESULT') {
                const stats = await getHostStats(latest.currentHostId, latest.id)
                setHostStats(stats)
            }
        } catch (error) {
            console.error('JankenEvent取得に失敗:', error)
            setError('データの取得に失敗しました')
        }
    }, [currentUserId])

    // ============================================
    // アクションハンドラ
    // ============================================

    /**
     * ゲーム開始（ホストのみ）
     */
    const handleStartGame = useCallback(async () => {
        if (!isHost || isProcessing) return

        setIsProcessing(true)
        try {
            await resetAllReady(roomId)
            const match = await startJankenMatch(roomId)
            matchIdRef.current = match.id
            setMatchId(match.id)
        } catch (error) {
            console.error('ゲーム開始に失敗:', error)
            setError('ゲームの開始に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [roomId, isHost, isProcessing])

    /**
     * ホストの初期手と嘘を設定
     */
    const handleSetInitialHand = useCallback(async (hand: HandType, fakeTarget: FakeTarget, fakeDetails?: FakeDetails) => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await setInitialHand(jankenEvent.id, hand, fakeTarget, fakeDetails)
            await fetchJankenEvent()
        } catch (error) {
            console.error('初期手設定に失敗:', error)
            setError('手の設定に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing, fetchJankenEvent])

    /**
     * ゲストの確認完了
     */
    const handleConfirmShowcase = useCallback(async () => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await confirmShowcase(jankenEvent.id, currentUserId)
        } catch (error) {
            console.error('確認完了に失敗:', error)
            setError('確認処理に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, currentUserId, isProcessing, fetchJankenEvent])

    /**
     * ホストの最終決定
     */
    const handleSetFinalHostHand = useCallback(async (hand: HandType) => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await setFinalHostHand(jankenEvent.id, hand)
            await fetchJankenEvent()
        } catch (error) {
            console.error('最終決定に失敗:', error)
            setError('決定処理に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing, fetchJankenEvent])

    /**
     * ゲストの手を設定
     */
    const handleSetGuestHand = useCallback(async (hand: HandType) => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await setGuestHand(jankenEvent.id, currentUserId, hand)
            await fetchJankenEvent()
        } catch (error) {
            console.error('手の設定に失敗:', error)
            setError('手の送信に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, currentUserId, isProcessing, fetchJankenEvent])

    /**
     * 次のラウンドへ遷移
     */
    const handleNextRound = useCallback(async () => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await startNextTurn(jankenEvent.id)
            await fetchJankenEvent()
        } catch (error) {
            console.error('次のラウンドへの遷移に失敗:', error)
            setError('次ラウンドへの遷移に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing, fetchJankenEvent])

    /**
     * ゲーム終了 → タイトルに戻る
     */
    const handleFinish = useCallback(async () => {
        if (!matchIdRef.current || isProcessing) return

        setIsProcessing(true)
        try {
            await finishJanken(matchIdRef.current, roomId)
            setPhase('TITLE')
            setJankenEvent(null)
            setHostStats(null)
            matchIdRef.current = null
            play('chime')
        } catch (error) {
            console.error('ゲーム終了に失敗:', error)
            setError('ゲーム終了処理に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [roomId, isProcessing, play])

    // ============================================
    // Effects
    // ============================================

    /**
     * スコア取得
     */
    useEffect(() => {
        if (!matchIdRef.current) return
        if (phase !== 'RESULT' && phase !== 'GAME_OVER') return

        const fetchScores = async () => {
            try {
                const scores = await getMatchScores(matchIdRef.current!)
                setCurrentScores(scores)
            } catch (error) {
                console.error('スコア取得に失敗:', error)
            }
        }

        fetchScores()
    }, [matchIdRef, phase])

    /**
     * 初期データ取得
     */
    useEffect(() => {
        if (!initialMatchId) return

        const loadInitialData = async () => {
            try {
                matchIdRef.current = initialMatchId
                await fetchJankenEvent()
            } catch (error) {
                console.error('初期データ取得に失敗:', error)
            }
        }

        loadInitialData()
    }, [initialMatchId, fetchJankenEvent])

    /**
     * Supabase Realtime サブスクリプション
     * 
     * matchId が設定されたら janken_events のサブスクリプションを作成
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
            }, async () => {
                await fetchJankenEvent()
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'janken_events',
                filter: `match_id=eq.${matchId}`,
            }, async () => {
                await fetchJankenEvent()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [matchId, supabase, fetchJankenEvent])

    /**
     * matches テーブルのサブスクリプション（ゲーム開始検知用）
     */
    useEffect(() => {
        const channel = supabase
            .channel(`null_hand_matches_${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'matches',
                filter: `room_id=eq.${roomId}`,
            }, async (payload: any) => {
                console.log('Match Inserted:', payload)
                if (payload.new.winner_id !== null) return
                const newMatchId = payload.new.id
                matchIdRef.current = newMatchId
                setMatchId(newMatchId)
                fetchJankenEvent()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, supabase, fetchJankenEvent])

    /**
     * ウインドウフォーカス時/可視化時のデータ再取得
     * 長時間放置後の復帰対策
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && matchIdRef.current) {
                console.log('Window Visible: Fetching latest data...')
                fetchJankenEvent()
            }
        }

        const handleFocus = () => {
            if (matchIdRef.current) {
                console.log('Window Focused: Fetching latest data...')
                fetchJankenEvent()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [fetchJankenEvent])

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
        handleFinish,
        isCurrentHost,
        error,
    }
}
