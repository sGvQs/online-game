import { useSound } from '@/lib/sound-context';
import { useCallback } from 'react';

export const useSE = () => {
    const { isPlaying } = useSound();

    const play = useCallback((name: 'error' | 'chime' | 'tada' | 'select' | 'submit') => {
        if (!isPlaying) return;

        const files = {
            error: '/se/error-se.mp3',
            chime: '/se/chime-se.mp3',
            tada: '/se/tada-se.mp3',
            select: '/se/select-se.mp3',
            submit: '/se/submit-se.mp3',
        };

        const audio = new Audio(files[name]);
        audio.volume = 0.1;
        audio.play().catch(() => { }); // 連続で叩かれた時のエラー対策
    }, [isPlaying]);

    return { play };
};