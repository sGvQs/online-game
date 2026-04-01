"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSound } from "@/lib/sound-context";
import { Volume2, VolumeOff } from "lucide-react";
import { effectiveSeVolume } from "@/lib/sound-volume";
import { bgmPlayer } from "./styles";
import { cn } from "@/lib/utils";

const styles = bgmPlayer();

const BGM_BASE_VOLUME = 0.2;

/** 縦セグメント本数（左＝低・右＝高）。タップで (index+1)/N の音量になる */
const VOLUME_SEGMENT_COUNT = 10;

/** 左端・右端のセグメントの高さ（px）。左が小さく右へいくほど高い */
const SEG_HEIGHT_MIN_PX = 10;
const SEG_HEIGHT_MAX_PX = 36;

function segmentHeightPx(index: number): number {
	if (VOLUME_SEGMENT_COUNT <= 1) return SEG_HEIGHT_MAX_PX;
	return (
		SEG_HEIGHT_MIN_PX +
		(index / (VOLUME_SEGMENT_COUNT - 1)) *
			(SEG_HEIGHT_MAX_PX - SEG_HEIGHT_MIN_PX)
	);
}

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

function activeSegmentCount(volume: number): number {
	return Math.min(
		VOLUME_SEGMENT_COUNT,
		Math.max(0, Math.round(volume * VOLUME_SEGMENT_COUNT)),
	);
}

export default function BGMPlayer() {
	const pathname = usePathname();
	const audioRef = useRef<HTMLAudioElement>(null);
	const { isPlaying, setIsPlaying, volume, setVolume } = useSound();
	const [trackIndex, setTrackIndex] = useState(0);

	const activeConfig =
		Object.values(BGM_CONFIG).find((config) => config.check(pathname)) ??
		BGM_CONFIG.DEFAULT;

	const currentSrc = activeConfig.srcs[trackIndex % activeConfig.srcs.length];

	// ルート変更で BGM セットが変わったら先頭トラックへ
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- label 変更時のみトラックを同期リセット
		setTrackIndex(0);
	}, [activeConfig.label]);

	useEffect(() => {
		if (!audioRef.current) return;
		audioRef.current.volume = effectiveSeVolume(BGM_BASE_VOLUME, volume);
	}, [activeConfig.label, volume]);

	useEffect(() => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.play().catch(console.error);
		} else {
			audioRef.current.pause();
		}
	}, [isPlaying]);

	useEffect(() => {
		if (!audioRef.current) return;

		if (audioRef.current.src.endsWith(currentSrc)) {
			return;
		}

		audioRef.current.src = currentSrc;
		audioRef.current.load();

		if (isPlaying) {
			audioRef.current.play().catch(console.error);
		}
	}, [currentSrc, isPlaying]);

	const handleEnded = () => {
		setTrackIndex((prev) => (prev + 1) % activeConfig.srcs.length);
	};

	const isSingleTrack = activeConfig.srcs.length === 1;

	const playSwitchSe = () => {
		const audio = new Audio("/se/switch-se.mp3");
		audio.volume = effectiveSeVolume(0.1, volume);
		audio.play().catch(() => {});
	};

	const soundAudible = isPlaying && volume > 0.0001;
	const lit = activeSegmentCount(volume);

	return (
		<div className={styles.wrapper()}>
			<audio
				ref={audioRef}
				loop={isSingleTrack}
				onEnded={isSingleTrack ? undefined : handleEnded}
			/>
			<button
				type="button"
				className={styles.button()}
				aria-label={isPlaying ? "音をオフにする" : "音をオンにする"}
				onClick={() => {
					const next = !isPlaying;
					if (next) playSwitchSe();
					setIsPlaying(next);
				}}
			>
				{soundAudible ? <Volume2 /> : <VolumeOff />}
			</button>
			<div
				className={styles.segments()}
				role="group"
				aria-label="音量（左が小さく右が大きい）"
			>
				{Array.from({ length: VOLUME_SEGMENT_COUNT }, (_, i) => {
					const level = (i + 1) / VOLUME_SEGMENT_COUNT;
					const isActive = i < lit;
					const h = Math.round(segmentHeightPx(i));
					return (
						<button
							key={i}
							type="button"
							style={{ height: h }}
							className={cn(
								styles.segment(),
								isActive && styles.segmentActive(),
							)}
							aria-label={"音量レベル " + String(i + 1) + " / " + String(VOLUME_SEGMENT_COUNT)}
							aria-pressed={lit > 0 && i === lit - 1}
							onClick={() => setVolume(level)}
						/>
					);
				})}
			</div>
		</div>
	);
}
