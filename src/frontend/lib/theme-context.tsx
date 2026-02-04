'use client'

import React, { createContext, useContext, useEffect } from 'react'

type Theme = 'space'

type ThemeContextType = {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme: Theme = 'space'

    useEffect(() => {
        // Always set Space theme
        document.documentElement.setAttribute('data-theme', 'space')
    }, [])

    // No-op since theme is fixed
    const toggleTheme = () => { }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
