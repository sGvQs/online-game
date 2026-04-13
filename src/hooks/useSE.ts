import { useSound, soundOutputRef } from "@/lib/sound-context";
import { effectiveSeVolume } from "@/lib/sound-volume";
import { useCallback, useEffect, useRef } from "react";

type SEName =
	| "error"
	| "chime"
	| "tada"
	| "select"
	| "submit"
	| "dinosaur"
	| "shooting"
	| "star-damage"
	| "heal"
	| "modal"
	| "reload"
	| "cannot-shoot";

const DEFAULT_VOLUME = 0.1;
const VOICE_VOLUME = 0.01;

const SE_VOLUMES: Partial<Record<SEName, number>> = {
	heal: 0.03,
};

const DINOSAUR_POOL_SIZE = 3;

/** 恐竜ボイス用のプリロード済みAudioプール（本番で連続再生時の途切れ防止） */
function getDinosaurPool(): HTMLAudioElement[] {
	const url = "/se/dinosaur-voice-se.mp3";
	const pool: HTMLAudioElement[] = [];
	for (let i = 0; i < DINOSAUR_POOL_SIZE; i++) {
		const audio = new Audio(url);
		audio.volume = VOICE_VOLUME;
		audio.preload = "auto";
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

const SHOOTING_POOL_SIZE = 5;

function getShootingPool(): HTMLAudioElement[] {
	const url = "/se/shooting-se.mp3";
	const pool: HTMLAudioElement[] = [];
	for (let i = 0; i < SHOOTING_POOL_SIZE; i++) {
		const audio = new Audio(url);
		audio.volume = DEFAULT_VOLUME;
		audio.preload = "auto";
		audio.load();
		pool.push(audio);
	}
	return pool;
}

let shootingPool: HTMLAudioElement[] | null = null;
let shootingPoolIndex = 0;

function getNextShootingAudio(): HTMLAudioElement | null {
	if (!shootingPool) {
		shootingPool = getShootingPool();
	}
	const audio = shootingPool[shootingPoolIndex % SHOOTING_POOL_SIZE]!;
	shootingPoolIndex++;
	return audio;
}

export const useSE = () => {
	// isPlaying / volume はプリロード用にのみ購読。
	// play 関数は soundOutputRef 経由で参照することで安定した関数参照を保つ。
	// （isPlaying/volume を deps に入れると useCallback が再生成 → applyDamage 再生成
	//   → メインの useEffect クリーンアップ → RAF ループがキャンセルされる問題を防ぐ）
	useSound(); // コンテキストの購読自体は維持（SoundProvider 外でのエラー検出のため）
	const preloadStarted = useRef(false);

	useEffect(() => {
		if (preloadStarted.current) return;
		preloadStarted.current = true;
		if (!dinosaurPool) dinosaurPool = getDinosaurPool();
		if (!shootingPool) shootingPool = getShootingPool();
	}, []);

	const play = useCallback(
		(name: SEName) => {
			// soundOutputRef は SoundProvider の useEffect で isPlaying/volume と同期済み
			if (!soundOutputRef.isPlaying) return;
			const volume = soundOutputRef.masterVolume;

			const files: Record<SEName, string> = {
				error: "/se/error-se.mp3",
				chime: "/se/chime-se.mp3",
				tada: "/se/tada-se.mp3",
				select: "/se/select-se.mp3",
				submit: "/se/submit-se.mp3",
				heal: "/se/heal-se.mp3",
				modal: "/se/modal-se.mp3",
				dinosaur: "/se/dinosaur-voice-se.mp3",
				shooting: "/se/shooting-se.mp3",
				"star-damage": "/se/star-damage-se.mp3",
				reload: "/se/reload-se.mp3",
				"cannot-shoot": "/se/cannot-shoot-se.mp3",
			};

			if (name === "dinosaur") {
				const audio = getNextDinosaurAudio();
				if (audio) {
					audio.volume = effectiveSeVolume(VOICE_VOLUME, volume);
					audio.currentTime = 0;
					audio.play().catch(() => {});
				}
				return;
			}

			if (name === "shooting") {
				const audio = getNextShootingAudio();
				if (audio) {
					audio.volume = effectiveSeVolume(DEFAULT_VOLUME, volume);
					audio.currentTime = 0;
					audio.play().catch(() => {});
				}
				return;
			}

			const audio = new Audio(files[name]);
			audio.volume = effectiveSeVolume(
				SE_VOLUMES[name] ?? DEFAULT_VOLUME,
				volume,
			);
			audio.play().catch(() => {});
		},
		[], // soundOutputRef はミュータブルオブジェクトのため deps 不要。参照は常に最新値を持つ
	);

	return { play };
};
