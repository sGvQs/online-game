"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SoundContext } from "@/lib/sound-context";
import { effectiveSeVolume } from "@/lib/sound-volume";
import { TECHNIQUES } from "@/constants/starShieldGame/techniques";
import {
	NORMAL_ATTACK_UNLOCK_COSTS,
	NORMAL_ATTACK_LEVEL_UP_COSTS,
SPECIAL_ATTACK_LEVEL_UP_COSTS,
	HEAL_UNLOCK_COST,
	HEAL_LEVEL_UP_COSTS,
	STAR_HP_LEVEL_UP_COSTS,
} from "@/constants/starShieldGame/skillConfig";
import {
	purchaseNormalAttackUnlock,
	purchaseNormalAttackLevelUp,
purchaseSpecialAttackLevelUp,
	purchaseHealUnlock,
	purchaseHealLevelUp,
	purchaseStarHpLevelUp,
} from "@/server/actions/game";
import type { StarShieldProgress } from "@/types/starShieldGame";
import type { PreviewData } from "../types";
import { PreviewContent } from "./PreviewContent";

export function SkillPreviewModal({
	preview,
	progress,
	typingCount,
	handlePurchase,
	onClose,
}: {
	preview: PreviewData;
	progress: StarShieldProgress | null;
	typingCount: number;
	handlePurchase: (
		fn: () => Promise<{ ok: boolean; error?: string }>,
		label: string,
	) => Promise<void>;
	onClose: () => void;
}) {
	const sound = useContext(SoundContext);
	let currentLevel = 0;
	let maxLevel = 1;
	let nextCost: number | null = null;
	let purchaseLabel = "";
	let purchaseFn: (() => Promise<{ ok: boolean; error?: string }>) | null =
		null;
	let purchaseLabelForFn = "";

	if (preview.kind === "normalAttack") {
		const ownedAttack = progress?.normalAttacks.find(
			(a) => a.techniqueId === preview.techniqueId,
		);
		currentLevel = ownedAttack ? ownedAttack.level : 0;
		maxLevel = 5;
		const tech = TECHNIQUES[preview.techniqueId];
		if (currentLevel === 0) {
			nextCost = NORMAL_ATTACK_UNLOCK_COSTS[preview.techniqueId] ?? 0;
			purchaseLabel = "かいほうする";
			purchaseFn = () => purchaseNormalAttackUnlock(preview.techniqueId);
			purchaseLabelForFn = tech.label;
		} else if (currentLevel < maxLevel) {
			const nl = (currentLevel + 1) as 2 | 3 | 4 | 5;
			nextCost = NORMAL_ATTACK_LEVEL_UP_COSTS[preview.techniqueId]?.[nl] ?? 0;
			purchaseLabel = `レベル ${nl} にあげる`;
			purchaseFn = () => purchaseNormalAttackLevelUp(preview.techniqueId, nl);
			purchaseLabelForFn = "通常攻撃レベル上げ";
		}
	} else if (preview.kind === "specialAttack") {
		const ownedSA = progress?.specialAttacks.find(
			(a) => a.specialAttackId === preview.id,
		);
		currentLevel = ownedSA ? ownedSA.level : 0;
		maxLevel = 10;
		if (currentLevel < maxLevel) {
			const nl = (currentLevel +
				1) as keyof typeof SPECIAL_ATTACK_LEVEL_UP_COSTS;
			nextCost = SPECIAL_ATTACK_LEVEL_UP_COSTS[nl] ?? 0;
			purchaseLabel = `レベル ${nl} にあげる`;
			purchaseFn = () =>
				purchaseSpecialAttackLevelUp(preview.id as "spread", nl);
			purchaseLabelForFn = "必殺技レベル上げ";
		}
	} else if (preview.kind === "starHp") {
		currentLevel = progress?.starHpLevel ?? 1;
		maxLevel = 5;
		if (currentLevel < maxLevel) {
			const nl = (currentLevel + 1) as 2 | 3 | 4 | 5;
			nextCost = STAR_HP_LEVEL_UP_COSTS[nl];
			purchaseLabel = `レベル ${nl} にあげる`;
			purchaseFn = () => purchaseStarHpLevelUp(nl);
			purchaseLabelForFn = "星のHPレベル上げ";
		}
	} else if (preview.kind === "heal") {
		currentLevel = progress?.healLevel ?? 0;
		maxLevel = 6;
		if (currentLevel === 0) {
			nextCost = HEAL_UNLOCK_COST;
			purchaseLabel = "かいほうする";
			purchaseFn = () => purchaseHealUnlock();
			purchaseLabelForFn = "ヒール解放";
		} else if (currentLevel < maxLevel) {
			const nl = (currentLevel + 1) as 2 | 3 | 4 | 5 | 6;
			nextCost = HEAL_LEVEL_UP_COSTS[nl];
			purchaseLabel = nl === 6 ? "さいだいにあげる" : `レベル ${nl} にあげる`;
			purchaseFn = () => purchaseHealLevelUp(nl);
			purchaseLabelForFn = "ヒールレベル上げ";
		}
	}

	const isMaxed = currentLevel >= maxLevel;
	const canAfford = nextCost !== null && typingCount >= nextCost;
	const isStarHp = preview.kind === "starHp";

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
			onClick={onClose}
		>
			<div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
			<motion.div
				initial={{ y: 24, scale: 0.95, opacity: 0 }}
				animate={{ y: 0, scale: 1, opacity: 1 }}
				exit={{ y: 24, scale: 0.95, opacity: 0 }}
				transition={{ type: "spring", damping: 26, stiffness: 280 }}
				className={cn(
					"relative w-full max-w-sm rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-full",
					isStarHp
						? "bg-[#0a1a14] border border-emerald-500/20"
						: "bg-[#14142a] border border-white/10",
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="absolute top-4 right-4 z-10">
					<button
						onClick={onClose}
						className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm backdrop-blur border border-white/5"
					>
						✕
					</button>
				</div>

				<div className="p-6 overflow-y-auto">
					<PreviewContent
						preview={preview}
						progress={progress}
						currentLevel={currentLevel}
					/>
				</div>

				<div
					className={cn(
						"p-5 mt-auto",
						isStarHp
							? "bg-emerald-500/5 border-t border-emerald-500/20"
							: "bg-white/2 border-t border-white/5",
					)}
				>
					{isMaxed ? (
						<div
							className={cn(
								"py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2",
								isStarHp
									? "border border-emerald-500/30 bg-emerald-500/15"
									: "border border-amber-500/20 bg-amber-500/10",
							)}
						>
							<span
								className={
									isStarHp
										? "text-emerald-400 text-lg"
										: "text-amber-400 text-lg"
								}
							>
								🏆
							</span>
							<span
								className={cn(
									"text-sm font-bold font-dot-gothic-16 tracking-wider",
									isStarHp ? "text-emerald-300/90" : "text-amber-300/90",
								)}
							>
								MAX レベル到達
							</span>
						</div>
					) : (
						<button
							disabled={!canAfford || !purchaseFn}
							onClick={() => {
								if (purchaseFn) {
									if (sound?.isPlaying) {
										const audio = new Audio("/se/buy-se.mp3");
										audio.volume = effectiveSeVolume(0.1, sound.volume);
										audio.play().catch(() => {});
									}
									handlePurchase(purchaseFn, purchaseLabelForFn);
								}
							}}
							className={cn(
								"w-full py-3.5 px-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-3 transition-all font-cherry-bomb-one",
								canAfford
									? isStarHp
										? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
										: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
									: "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed",
							)}
						>
							<span>{purchaseLabel}</span>
							{nextCost !== null && (
								<span
									className={cn(
										"px-2.5 py-1 rounded-lg text-xs font-bold border",
										canAfford
											? "bg-black/20 border-black/10"
											: "bg-black/10 border-white/5",
									)}
								>
									{nextCost.toLocaleString()}
								</span>
							)}
						</button>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
}
