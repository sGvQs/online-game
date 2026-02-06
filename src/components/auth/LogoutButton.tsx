'use client'

import { signOut } from '@/server/actions/auth'
import { IconButton } from '@/components/ui/IconButton'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
    return (
        <IconButton
            onClick={() => signOut()}
            variant="danger"
            size="sm"
            icon={<LogOut className="w-4 h-4" />}
            tooltip="ログアウト"
        />
    )
}
