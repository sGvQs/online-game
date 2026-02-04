'use client'

import { signOut } from '@/backend/actions/auth'
import { Button } from '@/frontend/components/ui/Button'

export function LogoutButton() {
    return (
        <Button
            onClick={() => signOut()}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
            ログアウト
        </Button>
    )
}
