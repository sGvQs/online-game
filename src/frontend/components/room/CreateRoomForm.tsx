'use client'

import { createRoom } from '@/backend/actions/room'
import { Button } from '@/frontend/components/ui/Button'
import { Card } from '@/frontend/components/ui/Card'
import { Input } from '@/frontend/components/ui/Input'
import { useState } from 'react'

export function CreateRoomForm() {
    const [open, setOpen] = useState(false)

    if (!open) {
        return (
            <Button
                onClick={() => setOpen(true)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
                + Create New Room
            </Button>
        )
    }

    return (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="font-bold mb-3 text-sm text-brand-800 uppercase tracking-wider">New Room Details</h3>
            <form action={async (formData) => {
                await createRoom(formData)
                setOpen(false)
            }} className="flex flex-col gap-3">
                <Input
                    name="name"
                    placeholder="Enter room name..."
                    required
                    className="w-full bg-white/50 border-brand-200 focus:border-brand-500 focus:ring-brand-500/20"
                    autoFocus
                />
                <div className="flex gap-2 mt-1">
                    <Button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white">
                        Create
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-brand-500 hover:text-brand-700 hover:bg-brand-100">
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
