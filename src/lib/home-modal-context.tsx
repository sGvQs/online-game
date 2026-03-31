"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type HomeModalOpenContextValue = {
	isModalOpen: boolean;
	setModalOpen: (open: boolean) => void;
};

const HomeModalOpenContext = createContext<HomeModalOpenContextValue | null>(
	null,
);

export function HomeModalOpenProvider({ children }: { children: ReactNode }) {
	const [isModalOpen, setModalOpenState] = useState(false);
	const setModalOpen = useCallback((open: boolean) => {
		setModalOpenState(open);
	}, []);

	const value = useMemo(
		() => ({ isModalOpen, setModalOpen }),
		[isModalOpen, setModalOpen],
	);

	return (
		<HomeModalOpenContext.Provider value={value}>
			{children}
		</HomeModalOpenContext.Provider>
	);
}

export function useHomeModalOpen() {
	const ctx = useContext(HomeModalOpenContext);
	if (!ctx) {
		throw new Error(
			"useHomeModalOpen must be used within HomeModalOpenProvider",
		);
	}
	return ctx;
}
