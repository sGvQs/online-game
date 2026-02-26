import { useSound } from '@/lib/sound-context';
import { useCallback } from 'react';

type SEName = 'error' | 'chime' | 'tada' | 'select' | 'submit' | 'dinosaur';

/** 音量0.05で再生するSE（声系など） */
const VOICE_SE: readonly SEName[] = ['dinosaur'];

const DEFAULT_VOLUME = 0.1;
const VOICE_VOLUME = 0.01;

export const useSE = () => {
    const { isPlaying } = useSound();

    const play = useCallback((name: SEName) => {
        if (!isPlaying) return;

        const files: Record<SEName, string> = {
            error: '/se/error-se.mp3',
            chime: '/se/chime-se.mp3',
            tada: '/se/tada-se.mp3',
            select: '/se/select-se.mp3',
            submit: '/se/submit-se.mp3',
            dinosaur: '/se/dinosaur-voice.mp3'
        };

        const audio = new Audio(files[name]);
        audio.volume = VOICE_SE.includes(name) ? VOICE_VOLUME : DEFAULT_VOLUME;
        audio.play().catch(() => { }); // 連続で叩かれた時のエラー対策
    }, [isPlaying]);

    return { play };
};