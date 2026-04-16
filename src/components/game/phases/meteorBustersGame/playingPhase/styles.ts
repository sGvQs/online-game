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
		// スコア（左上）
		score: [
			"absolute top-4 left-4 z-30",
			"bg-[rgba(30,41,59,0.4)] border border-[rgba(129,140,248,0.18)]",
			"rounded-xl px-4 py-3 backdrop-blur-[12px]",
			"flex flex-col gap-1",
		],
		scoreLabel: [
			"text-[10px] text-brand-500/60 font-dot-gothic-16 uppercase tracking-[0.4em]",
		],
		scoreValue: [
			"text-2xl text-white font-dot-gothic-16",
			"drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]",
		],
		scoreProgress: ["text-xs text-white/50 font-dot-gothic-16"],
		progressBarWrap: [
			"w-40 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1",
		],
		progressBarFill: ["h-full rounded-full transition-all duration-300"],
		difficultyLabel: [
			"text-[10px] text-brand-500/40 mt-1 font-dot-gothic-16 uppercase tracking-widest",
		],
	},
});
