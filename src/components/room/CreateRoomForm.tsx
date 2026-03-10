'use client'

import { createRoom } from '@/server/actions/room'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/iconButton'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { createRoomForm } from './CreateRoomForm.styles'

const styles = createRoomForm()

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
        <div className={styles.formWrapper()}>
            <form action={async (formData) => {
                await createRoom(formData)
                setOpen(false)
            }} className={styles.form()}>
                <Input
                    name="name"
                    placeholder="ルーム名を入力...（15文字以内）"
                    required
                    maxLength={15}
                    className="input-room-name w-full border-brand-200 focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2"
                    autoFocus
                />
                <div className={styles.actions()}>
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
