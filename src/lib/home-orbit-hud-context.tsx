"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";

export type HomeOrbitHudState = {
	starHp: number;
	maxStarHp: number;
};

type Ctx = {
	state: HomeOrbitHudState | null;
	setState: (next: HomeOrbitHudState | null) => void;
	isEmergencyMode: boolean;
	setIsEmergencyMode: (v: boolean) => void;
};

const HomeOrbitHudContext = createContext<Ctx | null>(null);

export function HomeOrbitHudProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<HomeOrbitHudState | null>(null);
	const setStateStable = useCallback((next: HomeOrbitHudState | null) => {
		setState(next);
	}, []);
	const [isEmergencyMode, setIsEmergencyMode] = useState(false);
	const setIsEmergencyModeStable = useCallback((v: boolean) => {
		setIsEmergencyMode(v);
	}, []);
	const value = useMemo(
		() => ({
			state,
			setState: setStateStable,
			isEmergencyMode,
			setIsEmergencyMode: setIsEmergencyModeStable,
		}),
		[state, setStateStable, isEmergencyMode, setIsEmergencyModeStable],
	);
	return (
		<HomeOrbitHudContext.Provider value={value}>
			{children}
		</HomeOrbitHudContext.Provider>
	);
}

/** LogoWithOrbit が HP を同期する（未 Provider 時は no-op） */
export function useSyncHomeOrbitHud() {
	const ctx = useContext(HomeOrbitHudContext);
	return ctx?.setState;
}

export function useHomeOrbitHudState(): HomeOrbitHudState | null {
	const ctx = useContext(HomeOrbitHudContext);
	return ctx?.state ?? null;
}

/** LogoWithOrbit が緊急モードを同期する（未 Provider 時は no-op） */
export function useSyncIsEmergencyMode() {
	const ctx = useContext(HomeOrbitHudContext);
	return ctx?.setIsEmergencyMode;
}

/** HomeCursor が緊急モードを読む */
export function useIsEmergencyMode(): boolean {
	const ctx = useContext(HomeOrbitHudContext);
	return ctx?.isEmergencyMode ?? false;
}
