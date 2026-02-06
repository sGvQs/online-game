import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardUser, getRooms } from '@/server/actions'
import { RoomList } from '@/components/room/RoomList'
import { CreateRoomForm } from '@/components/room/CreateRoomForm'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Boxes, PackagePlus } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Server Action経由でDB取得
    const dashboardUser = await getDashboardUser()
    if (!dashboardUser) return <div>User not found in DB</div>

    const rooms = await getRooms()

    return (
        <div className="min-h-screen p-8 bg-transparent text-foreground">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="glass-card flex justify-between items-center p-6 rounded-2xl shadow-sm">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-brand-900">
                            ONLINE GAME STATION
                        </h1>
                        <p className="text-brand-900 font-medium mt-1 opacity-80">
                            おかえりなさい、{dashboardUser.user.name}さん
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="bg-white/10 px-4 py-2 rounded-full text-sm font-medium text-foreground shadow-sm border border-brand-200/30">
                            {dashboardUser.email}
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Actions */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 rounded-2xl">
                            <h2 className="text-xl font-bold mb-4 text-brand-900 flex items-center gap-2">
                                <PackagePlus className="w-4 h-4" />
                                ルームを作成
                            </h2>
                            <CreateRoomForm />
                            <div className="mt-6 pt-6 border-t border-brand-100">
                                <p className="text-xs text-brand-900 leading-relaxed">
                                    新しいルームを作成して、友達とゲームを始めましょう。
                                </p>
                            </div>
                        </div>
                    </aside>

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
                </main>
            </div>
        </div>
    )
}
