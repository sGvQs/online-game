"use client";

import { useHomeAmmo } from "@/lib/home-ammo-context";
import { useHomeOrbitHudState } from "@/lib/home-orbit-hud-context";
import { HOME_AMMO_BAR_ACTIVE_CLASSNAME } from "@/lib/home-shooter-config";
import { HomeShooterLegend } from "@/components/home/homeShooterLegend";

/** 弾数・射撃凡例（下部ドック用）。HP は LogoWithOrbit 内の StarHpBar を参照 */
export function HomeOrbitHud() {
	const hud = useHomeOrbitHudState();
	const homeAmmo = useHomeAmmo();

	if (!hud) return null;

	return (
		<div className="flex w-full flex-col items-center gap-1.5">
			{homeAmmo && (
				<>
					<div
						className="mt-1 flex flex-wrap justify-center gap-1"
						aria-hidden
					>
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
				</>
			)}
		</div>
	);
}
