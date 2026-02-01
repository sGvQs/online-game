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
            <Button onClick={() => setOpen(true)} variant="solid">
                Create Room
            </Button>
        )
    }

    return (
        <Card className="p-4 border shadow-sm bg-white" padding="sm">
            <h3 className="font-bold mb-2">Create New Room</h3>
            <form action={async (formData) => {
                await createRoom(formData)
                setOpen(false)
            }} className="flex gap-2">
                <Input name="name" placeholder="Room Name" required className="w-64" />
                <Button type="submit" variant="solid">Create</Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </form>
        </Card>
    )
}
