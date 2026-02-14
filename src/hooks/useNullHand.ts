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
    timerProgress: number
    handleStartGame: () => Promise<void>
    handleSetInitialHand: (hand: HandType, fakeTarget: FakeTarget) => Promise<void>
    handleConfirmShowcase: () => Promise<void>
    handleSetFinalHostHand: (hand: HandType) => Promise<void>
    handleSetGuestHand: (hand: HandType) => Promise<void>
    handleFinish: () => Promise<void>
    isCurrentHost: boolean
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

    // ---- State ----
    const [phase, setPhase] = useState<JankenPhase>('TITLE')
    const [jankenEvent, setJankenEvent] = useState<JankenEventWithGuests | null>(null)
    const [hostStats, setHostStats] = useState<HostStats | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [timerProgress, setTimerProgress] = useState(0)

    // ---- Refs ----
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const matchIdRef = useRef<string | null>(initialMatchId)
    const phaseRef = useRef<JankenPhase>('TITLE')

    // state の最新値を ref に同期
    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    // ============================================
    // タイマー管理
    // ============================================

    /**
     * phaseEndsAt に基づいてタイマー進捗バーを更新
     */
    const setupPhaseTimer = useCallback((phaseEndsAt: Date | string) => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        let targetDate: Date
        if (typeof phaseEndsAt === 'string') {
            const dateString = phaseEndsAt.endsWith('Z') ? phaseEndsAt : `${phaseEndsAt}Z`
            targetDate = new Date(dateString)
        } else {
            targetDate = phaseEndsAt
        }

        const startTime = Date.now()
        const endTime = targetDate.getTime()
        const totalDuration = endTime - startTime

        if (totalDuration <= 0) {
            setTimerProgress(0)
            return
        }

        const interval = setInterval(() => {
            const now = Date.now()
            const elapsed = now - startTime
            const progress = Math.max(0, 100 - (elapsed / totalDuration) * 100)

            if (progress <= 0) {
                clearInterval(interval)
                setTimerProgress(0)
            } else {
                setTimerProgress(progress)
            }
        }, 100)

        timerRef.current = interval as unknown as ReturnType<typeof setTimeout>
    }, [])

    // ============================================
    // データ取得ヘルパー
    // ============================================

    /**
     * 最新のJankenEventを取得して状態を更新
     */
    const refreshJankenEvent = useCallback(async () => {
        if (!matchIdRef.current) return

        try {
            const latest = await getLatestJankenEvent(matchIdRef.current)
            if (!latest) return

            setJankenEvent(latest)

            // フェーズを判定
            const eventPhase = latest.phase as JankenPhase
            setPhase(eventPhase)

            // タイマーセット
            if (latest.phaseEndsAt) {
                setupPhaseTimer(latest.phaseEndsAt)
            }

            // SETUP フェーズで自分がホストなら統計取得
            if (eventPhase === 'SETUP' && latest.currentHostId === currentUserId) {
                const stats = await getHostStats(currentUserId)
                setHostStats(stats)
            }
        } catch (error) {
            console.error('JankenEvent取得に失敗:', error)
        }
    }, [currentUserId, setupPhaseTimer])

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
        } catch (error) {
            console.error('ゲーム開始に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [roomId, isHost, isProcessing])

    /**
     * ホストの初期手と嘘を設定
     */
    const handleSetInitialHand = useCallback(async (hand: HandType, fakeTarget: FakeTarget) => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await setInitialHand(jankenEvent.id, hand, fakeTarget)
        } catch (error) {
            console.error('初期手設定に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing])

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
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, currentUserId, isProcessing])

    /**
     * ホストの最終決定
     */
    const handleSetFinalHostHand = useCallback(async (hand: HandType) => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await setFinalHostHand(jankenEvent.id, hand)
        } catch (error) {
            console.error('最終決定に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, isProcessing])

    /**
     * ゲストの手を設定
     */
    const handleSetGuestHand = useCallback(async (hand: HandType) => {
        if (!jankenEvent || isProcessing) return

        setIsProcessing(true)
        try {
            await setGuestHand(jankenEvent.id, currentUserId, hand)
        } catch (error) {
            console.error('手の設定に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [jankenEvent, currentUserId, isProcessing])

    /**
     * ゲーム終了 → タイトルに戻る
     */
    const handleFinish = useCallback(async () => {
        if (!matchIdRef.current || isProcessing) return

        setIsProcessing(true)
        try {
            setPhase('TITLE')
            setJankenEvent(null)
            setHostStats(null)
            matchIdRef.current = null
            useSE().play('chime')
        } catch (error) {
            console.error('ゲーム終了に失敗:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [isProcessing])

    // ============================================
    // Effects
    // ============================================

    /**
     * 初期データ取得
     */
    useEffect(() => {
        if (!initialMatchId) return

        const loadInitialData = async () => {
            try {
                matchIdRef.current = initialMatchId
                await refreshJankenEvent()
            } catch (error) {
                console.error('初期データ取得に失敗:', error)
            }
        }

        loadInitialData()
    }, [initialMatchId, refreshJankenEvent])

    /**
     * Supabase Realtime サブスクリプション
     */
    useEffect(() => {
        const channel = supabase
            .channel(`null_hand_${roomId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'janken_events',
                filter: `match_id=eq.${matchIdRef.current}`,
            }, async () => {
                // シグナル受信 → 最新データを再取得
                await refreshJankenEvent()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, roomId, refreshJankenEvent])

    /**
     * クリーンアップ
     */
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current as unknown as number)
            }
        }
    }, [])

    // ============================================
    // 戻り値
    // ============================================

    const isCurrentHost = jankenEvent?.currentHostId === currentUserId

    return {
        phase,
        jankenEvent,
        hostStats,
        isProcessing,
        timerProgress,
        handleStartGame,
        handleSetInitialHand,
        handleConfirmShowcase,
        handleSetFinalHostHand,
        handleSetGuestHand,
        handleFinish,
        isCurrentHost,
    }
}
