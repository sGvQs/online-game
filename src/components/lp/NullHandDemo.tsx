'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChoicePhase } from '@/components/game/NullHandGame/phases/ChoicePhase'
import { BattlePhase } from '@/components/game/NullHandGame/phases/BattlePhase'
import { ResultPhase } from '@/components/game/NullHandGame/phases/ResultPhase'
import { HandType } from '@/shared/types'
import { nullHandGame } from '@/components/game/NullHandGame/styles'
import type { JankenEventWithGuests, HostStats, MatchScoreWithUser, RoomUserWithUser } from '@/shared/types'

const DEVELOPER_ICON = '/svg/charactor/developer.svg'
const ALL_HANDS = Object.values(HandType) as HandType[]

function randomHand(): HandType {
    return ALL_HANDS[Math.floor(Math.random() * ALL_HANDS.length)]!
}

function getBluffHand(realHand: HandType): HandType {
    const map: Record<HandType, HandType> = {
        [HandType.ROCK]: HandType.SCISSORS,
        [HandType.SCISSORS]: HandType.PAPER,
        [HandType.PAPER]: HandType.ROCK,
    }
    return map[realHand]
}

function createMockEvent(realHand?: HandType): JankenEventWithGuests {
    const r = realHand ?? randomHand()
    return {
        id: 'lp-demo-event',
        matchId: 'lp-demo-match',
        currentHostId: 'lp-demo-guest1',
        turnNumber: 1,
        phase: 'CHOICE',
        systemRealHand: r,
        systemBluffHand: getBluffHand(r),
        hostChoice: null,
        finalHostHand: null,
        match: {
            id: 'lp-demo-match',
            roomId: 'lp-demo-room',
            gameType: 'NULL_HAND',
            status: 'CHOICE',
            winnerId: null,
            createdAt: new Date(),
            currentTurnIndex: 1,
            totalTurns: 1,
        },
        guestHands: [],
    } as JankenEventWithGuests
}

const mockHostStats: HostStats = {
    reverseRate: 20,
    totalHostCount: 5,
}

const mockCurrentScores: MatchScoreWithUser[] = [
    {
        userId: 'lp-demo-guest',
        points: 0,
        turnOrder: 0,
        matchId: 'lp-demo-match',
        createdAt: new Date(),
        user: {
            id: 'lp-demo-guest',
            name: 'あなた',
            email: 'demo@example.com',
            comment: null,
            faceIcon: 'BOY_FACE',
            createdAt: new Date(),
        },
    },
    {
        userId: 'lp-demo-guest1',
        points: 300,
        turnOrder: 1,
        matchId: 'lp-demo-match',
        createdAt: new Date(),
        user: {
            id: 'lp-demo-guest1',
            name: '開発者',
            email: 'demo@example.com',
            comment: null,
            faceIcon: 'LADY_FACE',
            createdAt: new Date(),
        },
    },
    {
        userId: 'lp-demo-guest2',
        points: 0,
        turnOrder: 0,
        matchId: 'lp-demo-match',
        createdAt: new Date(),
        user: {
            id: 'lp-demo-guest2',
            name: 'あなたの友達',
            email: 'demo@example.com',
            comment: null,
            faceIcon: 'BOY_FACE',
            createdAt: new Date(),
        },
    },
]

const mockRoomUsers: RoomUserWithUser[] = [
    {
        userId: 'lp-demo-guest',
        roomId: 'lp-demo-room',
        turnOrder: 0,
        isReady: false,
        createdAt: new Date(),
        user: {
            id: 'lp-demo-guest',
            name: 'あなた',
            email: 'demo@example.com',
            comment: null,
            faceIcon: 'BOY_FACE',
            createdAt: new Date(),
        },
    },
    {
        userId: 'lp-demo-guest1',
        roomId: 'lp-demo-room',
        turnOrder: 1,
        isReady: false,
        createdAt: new Date(),
        user: {
            id: 'lp-demo-guest1',
            name: '開発者',
            email: 'demo@example.com',
            comment: null,
            faceIcon: 'LADY_FACE',
            createdAt: new Date(),
        },
    },
    {
        userId: 'lp-demo-guest2',
        roomId: 'lp-demo-room',
        turnOrder: 2,
        isReady: false,
        createdAt: new Date(),
        user: {
            id: 'lp-demo-guest2',
            name: 'あなたの友達',
            email: 'demo@example.com',
            comment: null,
            faceIcon: 'BOY_FACE',
            createdAt: new Date(),
        },
    },
] as unknown as RoomUserWithUser[]

type DemoPhase = 'choice' | 'battle' | 'result'

/** ChoicePhase 内部アニメーション完了まで約9秒 + 余裕を持って12秒 */
const BATTLE_TRIGGER_MS = 12000

/**
 * リザルト用 JankenEvent を組み立てる。
 *
 * ゲームロジック（LP デモ仕様）:
 *   - チョキ (SCISSORS) を出したとき → 開発者 PAPER = ユーザー勝ち (YOU WIN!!)
 *   - グー / パー を出したとき      → 開発者が同じ手 + ゲスト2人全員 DRAW = NULL HAND
 */
function buildResultEvent(
    base: JankenEventWithGuests,
    userHand: HandType
): JankenEventWithGuests {
    const isScissors = userHand === HandType.SCISSORS

    const finalHostHand = isScissors
        ? HandType.PAPER // PAPER loses to SCISSORS → GUEST_WIN
        : userHand       // same hand → DRAW for all → isNullHand = true

    const hostChoice = isScissors ? 'STAY' : 'STAY'

    const makeGuestHand = (userId: string, hand: HandType) =>
        ({
            id: `gh-${userId}`,
            jankenEventId: base.id,
            userId,
            hand,
            createdAt: new Date(),
            user: mockRoomUsers.find((u) => u.userId === userId)?.user ?? null,
        }) as JankenEventWithGuests['guestHands'][number]

    // NULL HAND 判定には guestCount > 1 が必要なので、グー/パー時は架空のゲストも追加
    const guestHands = isScissors
        ? [makeGuestHand('lp-demo-guest', userHand)]
        : [
              makeGuestHand('lp-demo-guest', userHand),
              makeGuestHand('lp-demo-guest2', userHand),
          ]

    return {
        ...base,
        finalHostHand,
        hostChoice,
        guestHands,
    }
}

export function NullHandDemo() {
    const styles = nullHandGame()
    const sectionRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hasTriggeredRef = useRef(false)
    const isInitialChoiceRef = useRef(true)

    const [demoPhase, setDemoPhase] = useState<DemoPhase>('choice')
    const [baseEvent, setBaseEvent] = useState<JankenEventWithGuests>(() => createMockEvent())
    const [selectedHand, setSelectedHand] = useState<HandType | null>(null)
    const [resultEvent, setResultEvent] = useState<JankenEventWithGuests | null>(null)

    // Battle 用 JankenEvent（finalHostHand なし・手の種類だけ表示）
    const battleEvent = useMemo<JankenEventWithGuests>(
        () => ({ ...baseEvent, phase: 'BATTLE' }) as JankenEventWithGuests,
        [baseEvent]
    )

    // IntersectionObserver：初回表示時にセクションが見えてから BATTLE_TRIGGER_MS 後に BATTLE へ
    useEffect(() => {
        const el = sectionRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (!entry?.isIntersecting || hasTriggeredRef.current) return

                hasTriggeredRef.current = true
                timerRef.current = setTimeout(() => {
                    isInitialChoiceRef.current = false
                    setDemoPhase('battle')
                }, BATTLE_TRIGGER_MS)
            },
            { threshold: 0.3 }
        )

        observer.observe(el)
        return () => {
            observer.disconnect()
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    // リトライで choice に戻ったとき、BATTLE_TRIGGER_MS 後に自動で battle へ
    useEffect(() => {
        if (isInitialChoiceRef.current || demoPhase !== 'choice') return

        timerRef.current = setTimeout(() => {
            setDemoPhase('battle')
        }, BATTLE_TRIGGER_MS)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [demoPhase])

    const handleBattle = useCallback(() => {
        if (!selectedHand) return
        const event = buildResultEvent(baseEvent, selectedHand)
        setResultEvent(event)
        setDemoPhase('result')
    }, [selectedHand, baseEvent])

    const handleRetry = useCallback(async () => {
        setBaseEvent(createMockEvent())
        setSelectedHand(null)
        setResultEvent(null)
        setDemoPhase('choice')
    }, [])

    const phaseLabel = demoPhase === 'choice' ? 'HOST CHOICE' : demoPhase === 'battle' ? 'BATTLE' : 'RESULT'

    return (
        <div
            ref={sectionRef}
            className="bg-black text-white overflow-visible flex items-center justify-center p-4 md:p-6 relative"
        >
            <div className={cn(styles.gameGrid(), 'scale-[0.85] origin-center md:scale-90 lg:scale-95')}>
                <div className={styles.phaseBox()}>
                    <h2 className="text-2xl font-black text-[#FF4444] tracking-[0.2em] uppercase">
                        {phaseLabel}
                    </h2>
                </div>

                {demoPhase === 'choice' && (
                    <ChoicePhase
                        jankenEvent={baseEvent}
                        hostStats={mockHostStats}
                        isCurrentHost={false}
                        isProcessing={false}
                        onChoice={async () => {}}
                        hostName="開発者"
                        hostCustomIconSrc={DEVELOPER_ICON}
                        currentScores={mockCurrentScores}
                        currentUserId="lp-demo-guest"
                    />
                )}

                {demoPhase === 'battle' && (
                    // aspect-square なボタン内で Hand3D(150px固定高) がはみ出すため overflow-hidden でクリップ
                    // [&_.aspect-square>.absolute.bottom-4] でグー/チョキ/パーのラベルを非表示
                    <div className="contents [&_.aspect-square]:overflow-hidden [&_.aspect-square>.absolute.bottom-4]:hidden">
                        <BattlePhase
                            jankenEvent={battleEvent}
                            hostStats={mockHostStats}
                            isCurrentHost={false}
                            selectedHand={selectedHand}
                            isProcessing={false}
                            onSelectHand={setSelectedHand}
                            onSubmit={handleBattle}
                            hostName="開発者"
                            currentScores={mockCurrentScores}
                            currentUserId="lp-demo-guest"
                            userColor="#FFFFFF"
                        />
                    </div>
                )}

                {demoPhase === 'result' && resultEvent && (
                    <ResultPhase
                        jankenEvent={resultEvent}
                        currentScores={mockCurrentScores}
                        isProcessing={false}
                        onNextRound={handleRetry}
                        hostName="開発者"
                        currentUserId="lp-demo-guest"
                        isCurrentHost={false}
                        roomUsers={mockRoomUsers}
                        userColor="#FFFFFF"
                    />
                )}
            </div>
        </div>
    )
}
