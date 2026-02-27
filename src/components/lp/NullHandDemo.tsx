'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChoicePhase } from '@/components/game/NullHandGame/phases/ChoicePhase'
import { HandType } from '@/shared/types'
import { nullHandGame } from '@/components/game/NullHandGame/styles'
import type { JankenEventWithGuests, HostStats, MatchScoreWithUser } from '@/shared/types'

const DINOSAUR_ICON = '/svg/charactor/annoying-dinosaur.svg'

/** LP用のモック JankenEvent（ゲスト視点・名もなき恐竜がホスト） */
function createMockJankenEvent(): JankenEventWithGuests {
    return {
        id: 'lp-demo-event',
        matchId: 'lp-demo-match',
        currentHostId: 'lp-demo-host',
        turnNumber: 1,
        phase: 'CHOICE',
        systemRealHand: HandType.ROCK,
        systemBluffHand: HandType.SCISSORS,
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
    reverseRate: 50,
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
]

export function NullHandDemo() {
    const styles = nullHandGame()
    const jankenEvent = useMemo(() => createMockJankenEvent(), [])

    return (
        <div className="bg-black text-white overflow-visible flex items-center justify-center p-4 md:p-6">
            <div className={cn(styles.gameGrid(), 'scale-[0.85] origin-center md:scale-90 lg:scale-95')}>
                <div className={styles.phaseBox()}>
                    <h2 className="text-2xl font-black text-[#FF4444] tracking-[0.2em] uppercase">
                        HOST CHOICE
                    </h2>
                </div>
                <ChoicePhase
                    jankenEvent={jankenEvent}
                    hostStats={mockHostStats}
                    isCurrentHost={false}
                    isProcessing={false}
                    onChoice={async () => {}}
                    hostName="名もなき恐竜"
                    hostCustomIconSrc={DINOSAUR_ICON}
                    currentScores={mockCurrentScores}
                    currentUserId="lp-demo-guest"
                />
            </div>
        </div>
    )
}
