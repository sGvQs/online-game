'use client'

import { Button } from '@/frontend/components/ui/Button'
import { useTheme } from '@/frontend/lib/theme-context'

export function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme()

    return (
        <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className="fixed bottom-4 right-4 z-50 rounded-full w-10 h-10 p-0 shadow-lg border border-brand-200 bg-white/80 backdrop-blur-sm hover:scale-110 transition-transform"
            title={theme === 'light' ? "Go to Space" : "Return to Earth"}
        >
            {theme === 'light' ? '🚀' : '🌍'}
        </Button>
    )
}
