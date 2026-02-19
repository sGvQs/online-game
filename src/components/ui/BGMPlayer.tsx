'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const BGM_CONFIG = {
    ERROR_HUNTER: {
        check: (path: string) => path.includes('error-hunter'),
        srcs: ['/music/error-hunter.mp3'],
        label: 'error-hunter'
    },
    NULL_HAND: {
        check: (path: string) => path.includes('null-hand'),
        srcs: ['/music/null-hand-opening.mp3', '/music/null-hand-playing.mp3'],
        label: 'null-hand'
    },
    MAIN_SYSTEM: {
        check: (path: string) => path.includes('/dashboard') || path.includes('/room/'),
        srcs: ['/music/default.mp3'], // 1曲のみの場合は1つだけ入れる
        label: 'default'
    },
    DEFAULT: {
        check: () => true,
        srcs: ['/music/default.mp3'],
        label: 'default'
    }
} as const;

export default function BGMPlayer() {
    const pathname = usePathname();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // 現在どの曲を再生しているかのインデックス管理
    const [trackIndex, setTrackIndex] = useState(0);

    const activeConfig =
        Object.values(BGM_CONFIG).find(config => config.check(pathname))
        ?? BGM_CONFIG.DEFAULT;

    // 現在流すべきソース
    const currentSrc = activeConfig.srcs[trackIndex % activeConfig.srcs.length];

    // パスが変わったときにインデックスをリセット（別のモードに移動した場合）
    useEffect(() => {
        setTrackIndex(0);
    }, [activeConfig.label]);

    // 音量設定
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.2;
        }
    }, [activeConfig.label]);

    // ソースの切り替えと再生
    useEffect(() => {
        if (!audioRef.current) return;

        // すでに現在のソースが設定されているならリロードしない
        if (audioRef.current.src.endsWith(currentSrc)) {
            return;
        }

        audioRef.current.src = currentSrc;
        audioRef.current.load();

        if (isPlaying) {
            audioRef.current.play().catch(console.error);
        }
    }, [currentSrc, isPlaying]);

    // 曲が終了した時の処理
    const handleEnded = () => {
        // 次の曲へ（配列の最後までいったら0に戻る）
        setTrackIndex((prev) => (prev + 1) % activeConfig.srcs.length);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* loop属性を削除し、onEndedを追加 */}
            <audio
                ref={audioRef}
                onEnded={handleEnded}
            />
            <button
                onClick={() => {
                    if (isPlaying) {
                        audioRef.current?.pause();
                    } else {
                        audioRef.current?.play();
                    }
                    setIsPlaying(!isPlaying);
                }}
                className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg text-white flex items-center justify-center"
            >
                {!isPlaying ? '🔇' : '🔊'}
            </button>
        </div>
    );
}