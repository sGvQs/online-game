"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import {
	getSoundMasterVolume,
	setSoundMasterVolume,
} from "@/lib/local-storage-bridge";

interface SoundContextType {
	isPlaying: boolean;
	setIsPlaying: (isPlaying: boolean) => void;
	volume: number;
	setVolume: (volume: number) => void;
}

export const SoundContext = createContext<SoundContextType | undefined>(
	undefined,
);

/** RAF / コールバック外から SE 実効可否・マスターを参照する（LogoWithOrbit の隕石 SE 等） */
export const soundOutputRef: { isPlaying: boolean; masterVolume: number } = {
	isPlaying: false,
	masterVolume: 1,
};

export function SoundProvider({ children }: { children: ReactNode }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolumeState] = useState(() => getSoundMasterVolume());

	const setVolume = useCallback((next: number) => {
		const v = Math.min(1, Math.max(0, next));
		setVolumeState(v);
		setSoundMasterVolume(v);
	}, []);

	useEffect(() => {
		soundOutputRef.isPlaying = isPlaying;
		soundOutputRef.masterVolume = volume;
	}, [isPlaying, volume]);

	return (
		<SoundContext.Provider
			value={{ isPlaying, setIsPlaying, volume, setVolume }}
		>
			{children}
		</SoundContext.Provider>
	);
}

export function useSound() {
	const context = useContext(SoundContext);
	if (context === undefined) {
		throw new Error("useSound must be used within a SoundProvider");
	}
	return context;
}
