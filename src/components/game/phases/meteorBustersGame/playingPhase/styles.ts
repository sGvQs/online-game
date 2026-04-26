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
		// のこり隕石数（左上・スナックバー下）
		remainingHud: [
			"absolute top-20 left-20 z-30",
			"flex flex-col items-start gap-2 pointer-events-none",
		],
		remainingLabel: "text-base text-brand-500/80",
		remainingCount: "text-brand-500 font-bold text-4xl tabular-nums",
		// プレイヤースコアリスト
		playerScoreList: "flex flex-col gap-2 mt-3",
		playerScoreItem: "flex flex-col gap-0.5",
		playerScoreName: "text-[10px] leading-none text-white/60 font-dot-gothic-16 whitespace-nowrap",
		playerScoreSep: "text-white/50 text-sm leading-none",
		playerScoreCount: "text-white font-cherry-bomb-one text-lg tabular-nums leading-none",
	},
});
