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
            <h3 className="font-bold mb-3 text-sm text-brand-800 dark:text-brand-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                New Room Details
            </h3>
            <form action={async (formData) => {
                await createRoom(formData)
                setOpen(false)
            }} className="flex flex-col gap-3">
                <Input
                    name="name"
                    placeholder="Enter mission name..."
                    required
                    className="w-full bg-white/50 dark:bg-slate-900/50 border-brand-200 dark:border-brand-700 focus:border-brand-500 focus:ring-brand-500/20 dark:text-white placeholder:text-brand-400/50"
                    autoFocus
                />
                <div className="flex gap-2 mt-1">
                    <Button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all duration-300">
                        Launch Mission
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-brand-500 hover:text-brand-100 hover:bg-brand-900/20">
                        Abort
                    </Button>
                </div>
            </form>
        </div>
    )
}
