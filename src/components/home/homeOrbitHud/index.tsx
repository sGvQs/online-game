"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useHomeAmmo } from "@/lib/home-ammo-context";
import { HOME_AMMO_BAR_ACTIVE_CLASSNAME } from "@/lib/home-shooter-config";
import { HomeShooterLegend } from "@/components/home/homeShooterLegend";
import { useIsEmergencyMode } from "@/lib/home-orbit-hud-context";

/** 弾数・射撃凡例（下部ドック）。軌道 HP は LogoWithOrbit 内の StarHpBar を参照 */
export function HomeOrbitHud() {
	const homeAmmo = useHomeAmmo();
	const isEmergencyMode = useIsEmergencyMode();

	if (!homeAmmo) return null;

	return (
		<>
			{isEmergencyMode && (
				<motion.div
					className="flex w-full flex-col items-center gap-1.5"
					initial={{ y: "100%", opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: "100%", opacity: 0 }}
					transition={{ type: "spring", stiffness: 320, damping: 32 }}
				>
					<div className="mt-1 flex flex-wrap justify-center gap-1" aria-hidden>
						{Array.from({ length: homeAmmo.ammoMax }, (_, i) => (
							<span
								key={i}
								className={`w-1.5 h-6 rounded-full shrink-0 ${
									i < homeAmmo.ammo
										? HOME_AMMO_BAR_ACTIVE_CLASSNAME
										: "bg-white/15"
								}`}
							/>
						))}
					</div>
					<HomeShooterLegend />
				</motion.div>
			)}
		</>
	);
}
