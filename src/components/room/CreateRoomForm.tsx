'use client'

import { createRoom } from '@/server/actions/room'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'

export function CreateRoomForm() {
    const [open, setOpen] = useState(false)

    if (!open) {
        return (
            <Button
                onClick={() => setOpen(true)}
                className="w-full bg-brand-300 hover:bg-brand-400 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
            >
                <Plus className="w-5 h-5" />
                新規ルーム
            </Button>
        )
    }

    return (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="font-bold mb-3 text-sm text-brand-800 dark:text-brand-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                新しいルームの詳細
            </h3>
            <form action={async (formData) => {
                await createRoom(formData)
                setOpen(false)
            }} className="flex flex-col gap-3">
                <Input
                    name="name"
                    placeholder="ルーム名を入力..."
                    required
                    className="w-full bg-white/50 dark:bg-slate-900/50 border-brand-200 dark:border-brand-700 focus:border-brand-500 focus:ring-brand-500/20 dark:text-white placeholder:text-brand-400/50"
                    autoFocus
                />
                <div className="flex gap-2 mt-1">
                    <Button type="submit" className="flex-1 bg-brand-300 hover:bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all duration-300 gap-2">
                        <Check className="w-4 h-4" />
                        作成
                    </Button>
                    <IconButton
                        type="button"
                        onClick={() => setOpen(false)}
                        variant="ghost"
                        size="md"
                        icon={<X className="w-5 h-5" />}
                        tooltip="キャンセル"
                    />
                </div>
            </form>
        </div>
    )
}
