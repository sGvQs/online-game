"use client";

import { StarHpBar } from "@/components/game/phases/starShieldGame/playing/typistView/StarHpBar";
import { useHomeAmmo } from "@/lib/home-ammo-context";
import { useHomeOrbitHudState } from "@/lib/home-orbit-hud-context";
import { HomeShooterLegend } from "@/components/home/homeShooterLegend";

/** 軌道星の HP・弾数・射撃凡例（LogoWithOrbit がコンテキストへ同期） */
export function HomeOrbitHud() {
	const hud = useHomeOrbitHudState();
	const homeAmmo = useHomeAmmo();

	if (!hud) return null;

	return (
		<div className="flex w-full flex-col items-center gap-1.5">
			<StarHpBar starHp={hud.starHp} maxStarHp={hud.maxStarHp} />
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
										? "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.55)]"
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
