'use client'

import { useEffect } from 'react'
import { SESSION_KEY_HAS_LOGGED_IN } from '@/constants/common/storage'

/** ダッシュボード表示時にログイン済みフラグを sessionStorage に設定 */
export function SetLoginFlag() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY_HAS_LOGGED_IN, 'true')
        }
    }, [])
    return null
}
