// components/BGMPlayer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const BGM_CONFIG = {
    GAME_MODE: {
        // URLに "error-hunter" が含まれる場合
        check: (path: string) => path.includes('error-hunter'),
        src: '/music/error-hunter.mp3',
        label: 'error-hunter'
    },
    MAIN_SYSTEM: {
        // /dashboard または /room/... の場合は同じ曲
        check: (path: string) => path.includes('/dashboard') || path.includes('/room/'),
        src: '/music/default.mp3',
        label: 'default'
    },
    DEFAULT: {
        check: () => true,
        src: '/music/default.mp3',
        label: 'default'
    }
} as const;

export default function BGMPlayer() {
    const pathname = usePathname();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // 現在のパスに一致する設定を取得
    const activeConfig =
        BGM_CONFIG.GAME_MODE.check(pathname) ? BGM_CONFIG.GAME_MODE :
            BGM_CONFIG.MAIN_SYSTEM.check(pathname) ? BGM_CONFIG.MAIN_SYSTEM :
                BGM_CONFIG.DEFAULT;


    // 初回レンダリング時とソース変更時に音量を設定
    useEffect(() => {
        if (audioRef.current) {
            if (activeConfig.label === 'error-hunter') {
                audioRef.current.volume = 0.2;
            } else {
                audioRef.current.volume = 0.05;
            }
        }
    }, [activeConfig.src]); // 曲が変わっても音量を維持

    useEffect(() => {
        if (!audioRef.current) return;

        // 重要：今流れている曲と、次に流すべき曲が「同じ」なら何もしない
        // これにより、dashboard ↔ room の移動で音が途切れない
        if (audioRef.current.src.endsWith(activeConfig.src)) {
            return;
        }

        // 曲が違う場合のみ、新しくロードして再生
        audioRef.current.src = activeConfig.src;
        audioRef.current.load();

        if (isPlaying) {
            audioRef.current.play().catch(console.error);
        }
    }, [activeConfig.src]); // 曲のパスが変わった時だけ発火

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <audio ref={audioRef} loop />
            <button
                onClick={() => {
                    if (isPlaying) audioRef.current?.pause();
                    else audioRef.current?.play();
                    setIsPlaying(!isPlaying);
                }}
                className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg text-white"
            >
                {!isPlaying ? '🔇' : '🔊'}
            </button>
        </div>
    );
}