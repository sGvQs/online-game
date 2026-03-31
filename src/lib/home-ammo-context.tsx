"use client";

import { createContext, useContext, type ReactNode } from "react";

export const AMMO_MAX =  35;

export interface HomeAmmoContextValue {
	ammo: number;
	ammoMax: number;
}

export const HomeAmmoContext = createContext<HomeAmmoContextValue | undefined>(
	undefined,
);

export function HomeAmmoProvider({
	children,
	ammo,
	ammoMax = AMMO_MAX,
}: {
	children: ReactNode;
	ammo: number;
	ammoMax?: number;
}) {
	return (
		<HomeAmmoContext.Provider value={{ ammo, ammoMax }}>
			{children}
		</HomeAmmoContext.Provider>
	);
}

export function useHomeAmmo(): HomeAmmoContextValue | undefined {
	return useContext(HomeAmmoContext);
}
