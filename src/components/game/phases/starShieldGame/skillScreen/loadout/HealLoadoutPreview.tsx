"use client";

import { motion } from "framer-motion";

export function HealLoadoutPreview({
	healValue,
	isFullRestore,
	starHpMax,
	healLevel,
}: {
	healValue: number;
	isFullRestore: boolean;
	starHpMax: number;
	healLevel: number;
}) {
	const HEAL_PCT = isFullRestore
		? 72
		: Math.min(72, (healValue / starHpMax) * 100);

	return (
		<div className="rounded-xl bg-black/30 border border-white/5 p-2.5 flex flex-col gap-1.5">
			<p className="text-[9px] text-white/25 font-dot-gothic-16">
				ヒール効果イメージ
			</p>
			<div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
				<div className="absolute inset-y-0 left-0 w-[28%] bg-emerald-600" />
				<motion.div
					className="absolute inset-y-0 left-[28%] bg-linear-to-r from-emerald-600 to-emerald-400"
					animate={{ width: ["0%", `${HEAL_PCT}%`, `${HEAL_PCT}%`, "0%"] }}
					transition={{
						duration: 1.8,
						times: [0, 0.4, 0.7, 1],
						repeat: Infinity,
						repeatDelay: 0.6,
					}}
				/>
			</div>
			<p className="text-[9px] font-dot-gothic-16 flex justify-between items-center">
				<span className="text-emerald-400/60">
					{isFullRestore ? "全回復" : `+${healValue} HP`}
				</span>
				<span className="text-white/25">
					{healLevel === 6 ? "Lv. max" : `Lv. ${healLevel}`}
				</span>
			</p>
		</div>
	);
}
