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
import Image from 'next/image'
import { DEFAULT_FACE_ICON, FACE_ICON_PATHS, FaceIcon } from '@/shared/constants/faceIcon'
import { DashboardHeaderTitle } from '@/components/dashboard/DashboardHeaderTitle'
import { DashboardComplaintWrapper } from '@/components/dashboard/DashboardComplaintWrapper'
import { RankingCard } from '@/components/dashboard/RankingCard'

export default async function DashboardPage() {
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
                {/* Header Section */}
                <header className="glass-card flex justify-between items-center p-6 rounded-2xl shadow-sm">
                    <div>
                        <DashboardHeaderTitle />
                        <p className="text-brand-900 font-medium mt-1 opacity-80">
                            Music By Dream or Real?
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full text-sm font-medium text-foreground shadow-sm border border-brand-200/30">
                            <Image
                                src={FACE_ICON_PATHS[initialFaceIcon]}
                                alt=""
                                width={24}
                                height={24}
                                className="shrink-0 rounded-full object-contain"
                            />
                            <span>{dashboardUser.user.name}</span>
                            <span className="opacity-70">
                                {monthlyRanking?.rank ? `${monthlyRanking.rank}位` : '圏外'}
                            </span>
                            <span className="opacity-70">
                                {monthlyRanking?.totalPoints ?? 0}pt
                            </span>
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex flex-col lg:flex-row gap-6">
                    {/* 左: コンパクトなランキング */}
                    <RankingCard
                        rankings={topRankings}
                        currentUserId={dashboardUser.user.id}
                    />

                    {/* 右: 既存のサイドバー + ルーム一覧 */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <DashboardSidebar
                            initialComment={dashboardUser.user.comment}
                            initialFaceIcon={initialFaceIcon}
                        />

                        {/* Room List */}
                        <section className="lg:col-span-3">
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
                    </div>
                </main>
            </div>
        </div>
    )
}
