'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { updateName } from '@/server/actions/user'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Check } from 'lucide-react'

export default function UserProfile({ initialData }: { initialData: any }) {
    const [data, setData] = useState(initialData)
    const [newName, setNewName] = useState('')
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('users')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users',
                filter: `id=eq.${initialData.id}`
            }, (payload) => {
                setData(payload.new)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, initialData.id])

    async function handleUpdate() {
        await updateName(newName)
        setNewName('')
    }

    return (
        <Card className="bg-white border-brand-700 shadow-md" padding="sm">
            <h2 className="text-xl font-bold mb-2">DBデータ (リアルタイム)</h2>
            <pre className="bg-brand-900 text-brand-100 p-2 rounded mb-4 text-xs font-mono overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>

            <div className="flex gap-2 items-center">
                <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="bg-brand-100 text-brand-900 placeholder:text-brand-700 border-brand-400 focus-visible:ring-brand-700 flex-1"
                    placeholder="新しい名前を入力..."
                />
                <IconButton
                    onClick={handleUpdate}
                    variant="success"
                    size="md"
                    icon={<Check className="w-5 h-5" />}
                    tooltip="更新"
                />
            </div>
        </Card>
    )
}
