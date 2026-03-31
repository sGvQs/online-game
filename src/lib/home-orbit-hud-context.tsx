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
};

const HomeOrbitHudContext = createContext<Ctx | null>(null);

export function HomeOrbitHudProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<HomeOrbitHudState | null>(null);
	const setStateStable = useCallback((next: HomeOrbitHudState | null) => {
		setState(next);
	}, []);
	const value = useMemo(
		() => ({ state, setState: setStateStable }),
		[state, setStateStable],
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
