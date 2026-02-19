'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SoundContextType {
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <SoundContext.Provider value={{ isPlaying, setIsPlaying }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
