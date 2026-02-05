'use client'

import { signOut } from '@/backend/actions/auth'
import { IconButton } from '@/frontend/components/ui/IconButton'
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
