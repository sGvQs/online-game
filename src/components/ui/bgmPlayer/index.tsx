"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSound } from "@/lib/sound-context";
import { Volume2, VolumeOff } from "lucide-react";
import { bgmPlayer } from "./styles";

const styles = bgmPlayer();

const BGM_CONFIG = {
    ERROR_HUNTER: {
        check: (path: string) => path.includes("error-hunter"),
        srcs: ["/music/error-hunter.mp3"],
        label: "error-hunter",
    },
    NULL_HAND: {
        check: (path: string) => path.includes("null-hand"),
        srcs: ["/music/null-hand-opening.mp3", "/music/null-hand-playing.mp3"],
        label: "null-hand",
    },
    MAIN_SYSTEM: {
        check: (path: string) =>
            path.includes("/home") || path.includes("/room/"),
        srcs: [
            "/music/title-sleep.mp3",
            "/music/title-sky.mp3",
            "/music/title-night.mp3",
        ],
        label: "default",
    },
    DEFAULT: {
        check: () => true,
        srcs: [
            "/music/title-sleep.mp3",
            "/music/title-sky.mp3",
            "/music/title-night.mp3",
        ],
        label: "default",
    },
} as const;

export default function BGMPlayer() {
    const pathname = usePathname();
    const audioRef = useRef<HTMLAudioElement>(null);
    const { isPlaying, setIsPlaying } = useSound();

    // 現在どの曲を再生しているかのインデックス管理
    const [trackIndex, setTrackIndex] = useState(0);

    const activeConfig =
        Object.values(BGM_CONFIG).find((config) => config.check(pathname)) ??
        BGM_CONFIG.DEFAULT;

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

    // isPlaying の外部変更（LogoWithOrbit 等）にも追従して play/pause
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(console.error);
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

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

    const isSingleTrack = activeConfig.srcs.length === 1;

    return (
        <div className={styles.wrapper()} >
            <audio
                ref={audioRef}
                loop={isSingleTrack}
                onEnded={isSingleTrack ? undefined : handleEnded}
            />
            <button
                className={styles.button()}
                onClick={() => {
                    const next = !isPlaying;
                    if (next) {
                        const audio = new Audio("/se/switch-se.mp3");
                        audio.volume = 0.1;
                        audio.play().catch(() => {});
                    }
                    setIsPlaying(next);
                }}>
                {!isPlaying ? <VolumeOff /> : <Volume2 />}
            </button>
        </div>
    );
}
