'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    startJankenMatch,
    dealSystemHands,
    setHostChoice,
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
    HostChoice,
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
    handleDealSystemHands: () => Promise<void>
    handleSetHostChoice: (choice: HostChoice) => Promise<void>
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
    const isFetchingRef = useRef(false)

    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    // ============================================
    // 状態取得ヘルパー
    // ============================================

    const fetchState = useCallback(async () => {
        if (!matchIdRef.current) return
        if (isFetchingRef.current) return
        isFetchingRef.current = true

        try {
            const result = await getLatestJankenEventWithStats(matchIdRef.current)
            if (!result) return

            const { event, stats } = result
            const eventPhase = event.phase as JankenPhase

            setJankenEvent(event)
            setHostStats(stats)

            if (phaseRef.current !== eventPhase) {
                setPhase(eventPhase)
            }
        } catch (err) {
            console.error('状態取得に失敗:', err)
            setError('データの取得に失敗しました')
        } finally {
            isFetchingRef.current = false
        }
    }, [])

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
     * システムDEAL（ホストがDEALアクションを確認）
     * DEAL → CHOICE フェーズへ
     */
    const handleDealSystemHands = useCallback(async () => {
        if (!jankenEvent || isProcessing) return
        play('submit')
        setIsProcessing(true)
        try {
            await dealSystemHands(jankenEvent.id)
            await fetchState()
        } catch (err) {
            console.error('DEAL処理に失敗:', err)
            setError('DEALの処理に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing, fetchState, play])

    /**
     * ホストのSTAY/REVERSE選択
     * CHOICE → BATTLE フェーズへ
     */
    const handleSetHostChoice = useCallback(async (choice: HostChoice) => {
        if (!jankenEvent || isProcessing) return
        play('select')
        setIsProcessing(true)
        try {
            await setHostChoice(jankenEvent.id, choice)
            await fetchState()
        } catch (err) {
            console.error('ホスト選択に失敗:', err)
            setError('選択の送信に失敗しました')
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
            await setGuestHand(jankenEvent.id, hand)
            await fetchState()
        } catch (err) {
            console.error('手の設定に失敗:', err)
            setError('手の送信に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing, fetchState, play])

    /**
     * 次のラウンドへ遷移（後方互換のため残す）
     */
    const handleNextRound = useCallback(async () => {
        // markNextRoundReady に統合
    }, [])

    /**
     * 次のラウンドへの準備完了をマーク
     */
    const handleMarkNextRoundReady = useCallback(async () => {
        if (!jankenEvent || isProcessing) return
        play('select')
        setIsProcessing(true)
        try {
            await markNextRoundReady(roomId, jankenEvent.matchId)
            await fetchState()
        } catch (err) {
            console.error('準備完了のマークに失敗:', err)
            setError('準備完了の送信に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, roomId, isProcessing, fetchState, play])

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

    useEffect(() => {
        if (!matchIdRef.current) return
        if (phase !== 'DEAL' && phase !== 'RESULT' && phase !== 'GAME_OVER') return

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

    useEffect(() => {
        if (!initialMatchId) return
        matchIdRef.current = initialMatchId
        fetchState()
    }, [initialMatchId, fetchState])

    /**
     * janken_events テーブルのリアルタイム監視
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
                fetchState()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, supabase, fetchState])

    /**
     * ウインドウ復帰時の再取得
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
        handleDealSystemHands,
        handleSetHostChoice,
        handleSetGuestHand,
        handleNextRound,
        handleMarkNextRoundReady,
        handleFinish,
        isCurrentHost,
        error,
    }
}
