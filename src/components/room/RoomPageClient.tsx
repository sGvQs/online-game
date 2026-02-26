'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useTransition, useCallback, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { getRoom, selectGame, getRoomUsers } from '@/server/actions/room'
import { getNullHandRankings } from '@/server/actions/game/rankingActions'
import { Room, RoomUserWithUser, UserRanking } from '@/shared/types'
import { GameSelectionCard } from './GameSelectionCard'
import { MemberListView } from './MemberList/MemberListView'
import { GameDescriptionModal } from './GameDescriptionModal'
import { AnnoyingDinosaurComplaint } from '@/components/dashboard/AnnoyingDinosaurComplaint'
import {
    getRandomSelfEntryMessage,
    getRandomOtherJoinMessage,
} from '@/shared/constants/roomEntryMessages'

interface RoomPageClientProps {
    room: Room // 初期のデータの状態
    initialMembers: RoomUserWithUser[] // 初期のデータの状態
    initialRankings: UserRanking[] // 参加者の月間ランキング
    isHost: boolean // 初期のデータの状態
    currentUserId: string
    children?: ReactNode
}

/**
 * ラッパーコンポーネント: RoomPageClientのチャンネルを使いながら
 * MemberListを別の場所にレンダリング可能にする
 */
export function RoomPageClientWrapper({
    room,
    initialMembers,
    initialRankings,
    isHost,
    currentUserId,
    children
}: RoomPageClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition() // 画面遷移中のローディング状態
    const [members, setMembers] = useState<RoomUserWithUser[]>(initialMembers) // 常に最新のメンバー情報を保持
    const [rankingsMap, setRankingsMap] = useState<Map<string, UserRanking>>(() => {
        const map = new Map<string, UserRanking>()
        initialRankings.forEach((r) => map.set(r.userId, r))
        return map
    })
    const [showGameDescription, setShowGameDescription] = useState(false) // モーダル表示フラグ
    const [selectedGameType, setSelectedGameType] = useState<string>('') // モーダルで表示するゲームの種類
    const [showDinosaur, setShowDinosaur] = useState(false)
    const [dinosaurKey, setDinosaurKey] = useState(0)
    const [dinosaurMessage, setDinosaurMessage] = useState('')

    const triggerDinosaur = useCallback(
        (type: 'self' | 'other') => {
            setDinosaurMessage(
                type === 'self'
                    ? getRandomSelfEntryMessage()
                    : getRandomOtherJoinMessage()
            )
            setShowDinosaur(true)
            setDinosaurKey((k) => k + 1)
        },
        []
    )

    // 自分が入室時（マウント時）に恐竜を表示
    useEffect(() => {
        triggerDinosaur('self')
    }, [triggerDinosaur])

    // ルーム変更ハンドラー
    const handleRoomChange = useCallback(async () => {
        try {
            const newRoom = await getRoom(room.id)
            if (newRoom?.activeGameType) {
                router.push(`/game/${room.id}/${newRoom.activeGameType}`)
            }
        } catch (error) {
            console.error('ルーム更新に失敗:', error)
        }
    }, [room.id, router])

    // メンバー変更ハンドラー（メンバーとランキングを更新）
    const handleMemberChange = useCallback(async () => {
        try {
            const roomUsers = await getRoomUsers(room.id)
            setMembers(roomUsers)
            const rankings = await getNullHandRankings(
                roomUsers.map((u: RoomUserWithUser) => u.userId)
            )
            const map = new Map<string, UserRanking>()
            rankings.forEach((r) => map.set(r.userId, r))
            setRankingsMap(map)
        } catch (error) {
            console.error('メンバー更新に失敗:', error)
        }
    }, [room.id])

    useEffect(() => {
        const channel = supabase
            .channel(`room_unified_${room.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${room.id}`,
            }, () => {
                handleRoomChange()
            })
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'room_users',
                    filter: `room_id=eq.${room.id}`,
                },
                (payload: { eventType: string; new?: { user_id?: string } }) => {
                    if (
                        payload.eventType === 'INSERT' &&
                        payload.new?.user_id !== currentUserId
                    ) {
                        triggerDinosaur('other')
                    }
                    handleMemberChange()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [room.id, currentUserId, handleRoomChange, handleMemberChange, triggerDinosaur])

    const handleSelectGame = (gameType: string) => {
        if (isHost) {
            startTransition(async () => {
                await selectGame(room.id, gameType)
            })
        } else {
            setSelectedGameType(gameType)
            setShowGameDescription(true)
        }
    }

    return (
        <>
            {showDinosaur &&
                typeof document !== 'undefined' &&
                createPortal(
                    <AnnoyingDinosaurComplaint
                        key={dinosaurKey}
                        message={dinosaurMessage}
                        onComplete={() => setShowDinosaur(false)}
                        position="bottom"
                    />,
                    document.body
                )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Game Board Area */}
                <div className="lg:col-span-2 space-y-4">
                    {children}

                    {/* Game Selection for Host */}
                    <GameSelectionCard
                        onSelectGame={handleSelectGame}
                        isPending={isPending}
                        isHost={isHost}
                    />
                </div>

                {/* Sidebar / Members */}
                <div className="lg:col-span-1">
                    <MemberListView members={members} rankingsMap={rankingsMap} />
                </div>
            </div>

            <GameDescriptionModal
                isOpen={showGameDescription}
                onClose={() => setShowGameDescription(false)}
                gameType={selectedGameType}
            />
        </>
    )
}
