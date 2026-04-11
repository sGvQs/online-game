"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { isAchievementUnlocked } from "@/lib/local-storage-bridge";

/** 最初の実績（地球型星破壊）の ID。ゲームを「始めた」かどうかの判定に使う */
export const HOME_FIRST_ACHIEVEMENT_ID = "enemy-of-humanity" as const;

interface HomeStartedContextType {
	hasStarted: boolean;
	notifyStarted: () => void;
}

const HomeStartedContext = createContext<HomeStartedContextType>({
	hasStarted: false,
	notifyStarted: () => {},
});

export function HomeStartedProvider({ children }: { children: ReactNode }) {
	const [hasStarted, setHasStarted] = useState(false);

	useEffect(() => {
		setHasStarted(isAchievementUnlocked(HOME_FIRST_ACHIEVEMENT_ID));
	}, []);

	const notifyStarted = useCallback(() => setHasStarted(true), []);

	return (
		<HomeStartedContext.Provider value={{ hasStarted, notifyStarted }}>
			{children}
		</HomeStartedContext.Provider>
	);
}

export function useHomeStarted() {
	return useContext(HomeStartedContext);
}
