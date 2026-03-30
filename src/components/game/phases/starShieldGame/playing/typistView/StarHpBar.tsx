"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";
import { typistView } from "./styles";

/** StarHpBar のトラック幅(rem)。`maxStarHp` に応じたゲームと同じ式。 */
export function getStarHpBarTrackWidthRem(maxStarHp: number): number {
	return Math.max(12, Math.min(28, 12 + ((maxStarHp - 15) * 16) / 30));
}

/** ホーム軌道用: トラックの幅・高さをゲーム本番相当からこの倍率で表示 */
const HOME_VISUAL_SCALE = 0.1;
/** `variant="home"` 時のトラック基準高さ（h-5 = 1.25rem） */
const HOME_TRACK_BASE_HEIGHT_REM = 1.25;

export type StarHpBarVariant = "default" | "home";

interface StarHpBarProps {
	starHp: number;
	maxStarHp: number;
	/** `home`: ラベル非表示・バー太め。省略時はゲーム用（従来どおり） */
	variant?: StarHpBarVariant;
}

export function StarHpBar({
	starHp,
	maxStarHp,
	variant = "default",
}: StarHpBarProps) {
	const prevStarHpRef = useRef(maxStarHp);
	const [damageWidth, setDamageWidth] = useState(0);
	const styles = typistView();
	const barWidthRem = getStarHpBarTrackWidthRem(maxStarHp);
	const isHome = variant === "home";
	const trackWidthRem = isHome ? barWidthRem * HOME_VISUAL_SCALE : barWidthRem;

	useEffect(() => {
		const prev = prevStarHpRef.current;
		if (starHp < prev && maxStarHp > 0) {
			const lost = ((prev - starHp) / maxStarHp) * 100;
			setDamageWidth((w) => w + lost);
		}
		prevStarHpRef.current = starHp;
	}, [starHp, maxStarHp]);

	return (
		<div
			className={
				isHome ? "flex items-center gap-0" : "flex items-center gap-2"
			}
		>
			{!isHome && (
				<Typography
					variant="caption"
					as="span"
					font="dot-gothic-16"
					className="text-white/50 tabular-nums"
				>
					HP {starHp}
				</Typography>
			)}
			<div
				className={`relative rounded-full bg-stone-600/80 overflow-hidden shrink-0 ${
					isHome ? "" : "h-3"
				}`}
				style={{
					width: `${trackWidthRem}rem`,
					...(isHome
						? { height: `${HOME_TRACK_BASE_HEIGHT_REM * HOME_VISUAL_SCALE}rem` }
						: {}),
				}}
			>
				<div
					className={styles.hpBar()}
					style={{
						["--hp-pct" as string]: `${Math.max(0, (starHp / maxStarHp) * 100)}%`,
					}}
				/>
				{damageWidth > 0 && (
					<motion.div
						key={`dmg-${damageWidth}`}
						className={styles.damageFlash()}
						style={{
							["--hp-pct" as string]: `${Math.max(0, (starHp / maxStarHp) * 100)}%`,
						}}
						initial={{ width: `${damageWidth}%` }}
						animate={{ width: "0%" }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						onAnimationComplete={() => setDamageWidth(0)}
					/>
				)}
			</div>
		</div>
	);
}
