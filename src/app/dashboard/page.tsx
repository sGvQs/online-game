import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    getDashboardUser,
    getRooms,
    cleanupAbandonedRooms,
    getUnreadRoomDeletedNotifications,
    getMonthlyRanking,
    getTopRankings,
} from '@/server/actions'
import { RoomList } from '@/components/room/RoomList'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { SetLoginFlag } from '@/components/auth/SetLoginFlag'
import { Boxes } from 'lucide-react'
import { DEFAULT_FACE_ICON, FaceIcon } from '@/shared/constants/faceIcon'
import { DashboardHeaderTitle } from '@/components/dashboard/DashboardHeaderTitle'
import { DashboardHeaderProfile } from '@/components/dashboard/DashboardHeaderProfile'
import { DashboardComplaintWrapper } from '@/components/dashboard/DashboardComplaintWrapper'
import { RankingCard } from '@/components/dashboard/RankingCard'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // 放置ルームのクリーンアップ（ダッシュボード訪問者なら誰でも実行）
    await cleanupAbandonedRooms()

    // Server Action経由でDB取得
    const dashboardUser = await getDashboardUser()
    if (!dashboardUser) return <div>User not found in DB</div>

    const [rooms, roomDeletedNotifications, monthlyRanking, topRankings] = await Promise.all([
        getRooms(),
        getUnreadRoomDeletedNotifications(),
        getMonthlyRanking(dashboardUser.user.id),
        getTopRankings(10),
    ])
    const initialFaceIcon: FaceIcon =
        (dashboardUser.user as { faceIcon?: FaceIcon }).faceIcon ?? DEFAULT_FACE_ICON

    return (
        <div className="min-h-screen p-8 bg-transparent text-foreground">
            <SetLoginFlag />
            <DashboardComplaintWrapper
                notifications={roomDeletedNotifications.map((n: { id: string; roomName: string }) => ({
                    id: n.id,
                    roomName: n.roomName,
                }))}
            />
            <div className="max-w-7xl mx-auto space-y-8">
                {params.error === 'game_in_progress' && (
                    <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
                        ゲーム中は参加できません
                    </div>
                )}
                {/* Header Section */}
                <header className="glass-card flex justify-between items-center p-6 rounded-2xl shadow-sm">
                    <div>
                        <DashboardHeaderTitle />
                        <p className="text-brand-900 font-medium mt-1 opacity-80">
                            Music By Dream or Real?
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <DashboardHeaderProfile
                            name={dashboardUser.user.name}
                            comment={dashboardUser.user.comment}
                            faceIcon={initialFaceIcon}
                            rank={monthlyRanking?.rank ?? null}
                            totalPoints={monthlyRanking?.totalPoints ?? 0}
                        />
                        <LogoutButton />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex flex-col lg:flex-row gap-6">
                    {/* 左: 順位（上） + ルーム作成（下）縦並び */}
                    <div className="flex flex-col gap-6 lg:w-[220px] shrink-0">
                        <RankingCard
                            rankings={topRankings}
                            currentUserId={dashboardUser.user.id}
                        />
                        <DashboardSidebar />
                    </div>

                    {/* 右: ルーム一覧 */}
                    <section className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-1xl font-bold text-brand-800 flex items-center gap-2">
                                <Boxes className="w-4 h-4" />
                                アクティブなルーム
                            </h2>
                            <span className="text-sm font-medium px-3 py-1 bg-brand-300 text-brand-700 rounded-full">
                                {rooms.length}件
                            </span>
                        </div>
                        <RoomList initialRooms={rooms} userId={dashboardUser.user.id} />
                    </section>
                </main>
            </div>
        </div>
    )
}
