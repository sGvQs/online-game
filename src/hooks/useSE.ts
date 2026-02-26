import { useSound } from '@/lib/sound-context';
import { useCallback, useEffect, useRef } from 'react';

type SEName = 'error' | 'chime' | 'tada' | 'select' | 'submit' | 'dinosaur';

const DEFAULT_VOLUME = 0.1;
const VOICE_VOLUME = 0.01;

const DINOSAUR_POOL_SIZE = 3;

/** 恐竜ボイス用のプリロード済みAudioプール（本番で連続再生時の途切れ防止） */
function getDinosaurPool(): HTMLAudioElement[] {
    const url = '/se/dinosaur-voice.mp3';
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < DINOSAUR_POOL_SIZE; i++) {
        const audio = new Audio(url);
        audio.volume = VOICE_VOLUME;
        audio.preload = 'auto';
        audio.load();
        pool.push(audio);
    }
    return pool;
}

let dinosaurPool: HTMLAudioElement[] | null = null;
let poolIndex = 0;

function getNextDinosaurAudio(): HTMLAudioElement | null {
    if (!dinosaurPool) {
        dinosaurPool = getDinosaurPool();
    }
    const audio = dinosaurPool[poolIndex % DINOSAUR_POOL_SIZE]!;
    poolIndex++;
    return audio;
}

export const useSE = () => {
    const { isPlaying } = useSound();
    const preloadStarted = useRef(false);

    useEffect(() => {
        if (preloadStarted.current) return;
        preloadStarted.current = true;
        if (!dinosaurPool) dinosaurPool = getDinosaurPool();
    }, []);

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

        if (name === 'dinosaur') {
            const audio = getNextDinosaurAudio();
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
            return;
        }

        const audio = new Audio(files[name]);
        audio.volume = DEFAULT_VOLUME;
        audio.play().catch(() => {});
    }, [isPlaying]);

    return { play };
};