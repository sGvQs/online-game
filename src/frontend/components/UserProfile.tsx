'use client'
import { createClient } from '@/frontend/lib/supabase/client'
import { useEffect, useState } from 'react'
import { updateName } from '@/backend/actions/user'
import { Button } from '@/frontend/components/ui/Button'
import { Input } from '@/frontend/components/ui/Input'
import { Card } from '@/frontend/components/ui/Card'

export default function UserProfile({ initialData }: { initialData: any }) {
    const [data, setData] = useState(initialData)
    const [newName, setNewName] = useState('')
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('users')
            .on('postgres_changes', {
                event: 'UPDATE', // INSERT, UPDATE, DELETE, *, の種類がある
                schema: 'public',
                table: 'users',
                filter: `id=eq.${initialData.id}` // eqは等しいという意味なので,id=initalData.idと同じ意味
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
            <h2 className="text-xl font-bold mb-2">DB Data (Realtime)</h2>
            <pre className="bg-brand-900 text-brand-100 p-2 rounded mb-4 text-xs font-mono overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>

            <div className="flex gap-2">
                <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="bg-brand-100 text-brand-900 placeholder:text-brand-700 border-brand-400 focus-visible:ring-brand-700"
                    placeholder="Enter New Name..."
                />
                <Button onClick={handleUpdate} variant="solid" className="whitespace-nowrap">
                    Update via Server Action
                </Button>
            </div>
        </Card>
    )
}

