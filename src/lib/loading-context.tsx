"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
	isLoading: boolean;
	showLoading: () => void;
	hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);
	const pathname = usePathname();

	// ナビゲーション完了時に必ずリセット（Server Action の redirect + Supabase realtime の
	// 競合でローディングが残るケースへの安全策）
	useEffect(() => {
		setIsLoading(false);
	}, [pathname]);

	const showLoading = () => setIsLoading(true);
	const hideLoading = () => setIsLoading(false);

	return (
		<LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
			{children}
		</LoadingContext.Provider>
	);
}

export function useLoading() {
	const context = useContext(LoadingContext);
	if (context === undefined) {
		throw new Error("useLoading must be used within a LoadingProvider");
	}
	return context;
}
