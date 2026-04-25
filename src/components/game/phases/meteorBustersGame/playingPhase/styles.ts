import { tv } from "tailwind-variants";

export const playingPhase = tv({
	slots: {
		container: ["relative w-full h-screen overflow-hidden cursor-crosshair"],
		// 星（中央）— top は PlayingPhase で ORBIT_CENTER_Y_RATIO からインライン指定
		star: [
			"absolute left-1/2 -translate-x-1/2 -translate-y-1/2",
			"z-10 pointer-events-none",
		],
		// HUD（下部中央 — HOME 緊急モードと同じ配置）
		hud: [
			"absolute bottom-4 left-0 right-0 z-30",
			"flex flex-col items-center",
		],
		// のこり隕石数（中央上・スナックバー下）
		remainingHud: [
			"absolute top-14 left-1/2 -translate-x-1/2 z-30",
			"flex items-center gap-1.5",
			"bg-[rgba(15,23,42,0.5)] border border-white/10 backdrop-blur-md",
			"rounded-full px-3 py-1.5 pointer-events-none",
		],
		remainingLabel: [
			"text-[11px] text-white/60 font-cherry-bomb-one",
		],
		remainingX: [
			"text-[11px] text-white/40 font-dot-gothic-16",
		],
		remainingCount: [
			"text-sm text-white font-dot-gothic-16 tabular-nums min-w-[1.5ch] text-center",
		],
	},
});
