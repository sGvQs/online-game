'use client'

import { signOut } from '@/server/actions/auth'
import { IconButton } from '@/components/ui/IconButton'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
    return (
        <IconButton
            onClick={() => signOut()}
            variant="danger"
            size="md"
            icon={<LogOut className="w-10 h-10" />}
            tooltip="ログアウト"
        />
    )
}
