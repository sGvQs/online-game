'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { updateName } from '@/app/actions/user'

export default function UserProfile({ initialData }: { initialData: any }) {
    const [data, setData] = useState(initialData)
    const [newName, setNewName] = useState('')
    const supabase = createClient()

    useEffect(() => {
        // Subscribe to changes on THIS user
        console.log("Subscribing to realtime changes for user:", initialData.id)
        const channel = supabase
            .channel('realtime users')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users',
                filter: `id=eq.${initialData.id}`
            }, (payload) => {
                console.log('Change received!', payload)
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
        <div className="p-4 border border-brand-700 rounded bg-white shadow-md">
            <h2 className="text-xl font-bold mb-2">DB Data (Realtime)</h2>
            <pre className="bg-brand-900 text-brand-100 p-2 rounded mb-4 text-xs font-mono overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>

            <div className="flex gap-2">
                <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="border border-brand-400 p-2 rounded text-brand-900 bg-brand-100 placeholder-brand-700 w-full focus:outline-brand-700"
                    placeholder="Enter New Name..."
                />
                <button onClick={handleUpdate} className="bg-brand-700 hover:bg-brand-900 text-white px-4 py-2 rounded font-bold whitespace-nowrap transition-colors">
                    Update via Server Action
                </button>
            </div>
        </div>
    )
}
