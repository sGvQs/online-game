"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";
import { typistView } from "./styles";

interface StarHpBarProps {
	starHp: number;
	maxStarHp: number;
}

export function StarHpBar({ starHp, maxStarHp }: StarHpBarProps) {
	const prevStarHpRef = useRef(maxStarHp);
	const [damageWidth, setDamageWidth] = useState(0);
	const styles = typistView();

	useEffect(() => {
		const prev = prevStarHpRef.current;
		if (starHp < prev && maxStarHp > 0) {
			const lost = ((prev - starHp) / maxStarHp) * 100;
			setDamageWidth((w) => w + lost);
		}
		prevStarHpRef.current = starHp;
	}, [starHp, maxStarHp]);

	return (
		<div className="flex items-center gap-2">
			<Typography
				variant="caption"
				as="span"
				font="dot-gothic-16"
				className="text-white/50 tabular-nums"
			>
				HP {starHp}
			</Typography>
			<div
				className="relative h-3 rounded-full bg-stone-600/80 overflow-hidden shrink-0"
				style={{
					width: `${Math.max(12, Math.min(28, 12 + ((maxStarHp - 15) * 16) / 30))}rem`,
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
