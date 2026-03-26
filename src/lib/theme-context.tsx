"use client";

import React, { useEffect } from "react";
import { StarfieldBackground } from "@/components/decorations/starfieldBackground";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", "space");
	}, []);

	return (
		<>
			<StarfieldBackground />
			{children}
		</>
	);
}
