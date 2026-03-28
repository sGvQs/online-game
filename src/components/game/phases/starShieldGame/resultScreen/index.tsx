"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { GameResult, GameStats } from "@/types/starShieldGame";
import { ProtectedStar } from "../playing/protectedStar";
import { AuroraGlow } from "@/components/game/common/starShield/auroraGlow";
import { resultScreen } from "./styles";
import { Button } from "@/components/ui/button";
import {
	ICONS,
	DIFFICULTY_META,
	type Difficulty,
} from "@/constants/starShieldGame/constants";
import { useState, useEffect } from "react";
import { animate } from "framer-motion";
import { getMonthlyRankingInfo } from "@/server/actions/game";

interface ResultScreenProps {
	result: GameResult;
	stats: GameStats;
	difficulty: Difficulty;
	onBackToTitle: () => void;
	beforeRanking: { points: number; rank: number };
	currentUserId: string;
	isShooter: boolean;
}

function PointGainAnimation({
	before,
	gain,
	delay,
}: {
	before: number;
	gain: number;
	delay: number;
}) {
	const [displayPoints, setDisplayPoints] = useState(before);

	useEffect(() => {
		// カウントアップ開始
		const controls = animate(before, before + gain, {
			duration: 0.8,
			delay: delay,
			ease: "easeOut",
			onUpdate: (v) => setDisplayPoints(Math.floor(v)),
		});

		return () => {
			controls.stop();
		};
	}, [before, gain, delay]);

	return (
		<div className="flex flex-col items-center gap-6 my-4">
			<div className="relative flex flex-col items-center">
				<div className="flex items-end gap-2">
					<motion.div
						key={displayPoints}
						initial={{ scale: 1 }}
						animate={{ scale: [1, 1.2, 1], rotate: [0, -2, 2, -2, 2, 0] }}
						transition={{ duration: 0.25 }}
						className="flex items-baseline gap-1"
					>
						<span className="text-3xl font-cherry-bomb-one text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
							{displayPoints.toLocaleString()}
						</span>
						<span className="text-lg text-yellow-400/80">pt</span>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, scale: 0, y: 10, rotate: -10 }}
					animate={{ opacity: 1, scale: 1, y: -35, rotate: 12 }}
					exit={{ opacity: 0, y: -20, scale: 0 }}
					transition={{ delay: delay }}
					className="absolute right-0 top-6 bg-linear-to-br from-yellow-300 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.4)] border border-white/20 whitespace-nowrap"
				>
					+{gain}pt
				</motion.div>
			</div>
		</div>
	);
}

function RankUpAnimation({
	beforeRank,
	afterRank,
	delay,
}: {
	beforeRank: number;
	afterRank: number;
	delay: number;
}) {
	const [displayRank, setDisplayRank] = useState(beforeRank);
	const isRankUp = afterRank < beforeRank && afterRank > 0 && beforeRank > 0;

	useEffect(() => {
		if (!isRankUp) return;

		const timer = setTimeout(() => {
			setDisplayRank(afterRank);
		}, delay * 1000);

		return () => clearTimeout(timer);
	}, [isRankUp, afterRank, beforeRank, delay]);

	return (
		<div className="flex flex-col items-center mt-2">
			<motion.div
				key={displayRank}
				initial={{ scale: 1 }}
				animate={
					displayRank !== beforeRank
						? {
								scale: [1, 1.4, 1],
								rotate: [0, -5, 5, -5, 5, 0],
							}
						: {}
				}
				transition={{ duration: 0.3 }}
				className="relative flex items-center gap-2"
			>
				<div className="flex items-baseline gap-1">
					<span className="text-3xl font-cherry-bomb-one text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
						{displayRank > 0 ? displayRank : "--"}
					</span>
					<span className="text-lg text-white/60">位</span>
				</div>

				{displayRank !== beforeRank && (
					<motion.div
						initial={{ opacity: 0, scale: 0, y: 10, rotate: -10 }}
						animate={{ opacity: 1, scale: 1, y: -35, rotate: 12 }}
						className="absolute right-0 top-6 bg-linear-to-br from-purple-300 to-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.4)] border border-white/20 whitespace-nowrap"
					>
						RANK UP!
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}

function StatResultRow({
	icon,
	label,
	value,
	suffix,
	delay = 0.3,
}: {
	icon: string;
	label: string;
	value: number;
	suffix: string;
	delay?: number;
}) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		const controls = animate(0, value, {
			duration: 1.2,
			delay,
			ease: "easeOut",
			onUpdate: (v) => setDisplayValue(Math.floor(v)),
		});
		return () => controls.stop();
	}, [value, delay]);

	return (
		<motion.div
			key={displayValue}
			initial={{ scale: 1 }}
			animate={{ scale: [1, 1.1, 1], rotate: [0, -1, 1, -1, 1, 0] }}
			transition={{ duration: 0.15 }}
			className="flex items-center gap-8"
		>
			<div className="flex items-center gap-2">
				<Image
					src={icon}
					alt=""
					width={40}
					height={40}
					className="object-contain"
				/>
				<span className="text-sm font-cherry-bomb-one text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
					{label}
				</span>
			</div>
			<div className="flex gap-2 items-baseline">
				<span className="text-3xl font-cherry-bomb-one text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
					{displayValue.toLocaleString()}
				</span>
				<span className="text-md text-white/40">{suffix}</span>
			</div>
		</motion.div>
	);
}

const RESULT_CONFIG: Record<
	GameResult,
	{
		title: string;
		subtitle: string;
		color: string;
		glowColor: string;
		message: string;
		gradient: string;
	}
> = {
	CLEARED: {
		title: "CLEARED",
		subtitle: "Mission Complete",
		color: "#818cf8",
		glowColor: "rgba(129,140,248,0.5)",
		message: "これで大丈夫。きみのおかげだ。へへ。",
		gradient: "linear-gradient(135deg, #fff 0%, #c084fc 50%, #818cf8 100%)",
	},
	FAILED_CONTACT: {
		title: "FAILED",
		subtitle: "Asteroid Contact",
		color: "#ef4444",
		glowColor: "rgba(239,68,68,0.5)",
		message:
			"まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。",
		gradient: "linear-gradient(135deg, #fca5a5 0%, #ef4444 60%, #b91c1c 100%)",
	},
};

export function ResultScreen({
	result,
	stats,
	difficulty,
	onBackToTitle,
	beforeRanking,
	currentUserId,
	isShooter,
}: ResultScreenProps) {
	const [afterRanking, setAfterRanking] = useState<{
		points: number;
		rank: number;
	} | null>(null);

	useEffect(() => {
		if (result === "CLEARED") {
			// 少し待ってから最新の順位を取得（DB更新完了を待つ）
			const timer = setTimeout(() => {
				getMonthlyRankingInfo(currentUserId).then(setAfterRanking);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [result, currentUserId]);
	const config = RESULT_CONFIG[result];
	const accuracy =
		stats.spawnedCount > 0
			? Math.round((stats.destroyedCount / stats.spawnedCount) * 100)
			: 0;
	const diffMeta = DIFFICULTY_META[difficulty];
	const earnedPoints = diffMeta.rate;
	const isCleared = result === "CLEARED";
	const styles = resultScreen();

	const delay = {
		wrapper: 0,
		title: 0,
		rank: 1.5,
		points: 1.5,
		destory: 3,
		role: 3.5,
		button: 4.0,
	};

	return (
		<div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
			<ProtectedStar />

			{/* background glow */}
			<div
				className={styles.bgGlow()}
				style={{
					["--result-bg-glow" as string]: isCleared
						? "rgba(129,140,248,0.12)"
						: "rgba(239,68,68,0.08)",
				}}
			/>
			<AuroraGlow
				width={800}
				height={400}
				opacity={0.2}
				blur={60}
				gradient={
					isCleared
						? "radial-gradient(ellipse at 50% 60%, rgba(192,132,252,0.7) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)"
						: "radial-gradient(ellipse at 50% 60%, rgba(239,68,68,0.7) 0%, rgba(185,28,28,0.3) 40%, transparent 70%)"
				}
			/>

			<motion.div
				className="relative z-10 w-full max-w-lg mx-auto px-6 py-10 flex flex-col items-center gap-10"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: delay.wrapper }}
			>
				{/* ===== HERO ===== */}
				<div className="flex flex-col items-center gap-6 w-full">
					{/* title */}
					<motion.div
						className="text-center"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: delay.title, duration: 0.6, ease: "easeOut" }}
						style={{
							["--result-title-color" as string]: config.color,
							["--result-title-glow" as string]: config.glowColor,
						}}
					>
						<h1 className={styles.title()}>{config.title}</h1>
						<p className={styles.subtitle()}>{config.subtitle}</p>
					</motion.div>

                    {(result === "CLEARED" || difficulty === "ABYSS") && (
					<div className="flex gap-8 justify-center items-baseline mt-6">
						{/* 順位・ポイント */}
						<RankUpAnimation
							beforeRank={beforeRanking.rank}
							afterRank={afterRanking?.rank ?? beforeRanking.rank}
							delay={delay.rank}
						/>
						<PointGainAnimation
							before={beforeRanking.points}
							gain={parseInt(earnedPoints?.replace("+", "") || "0")}
							delay={delay.points}
						/>
					</div>
                    )}

					{/* 壊した数 */}
					<StatResultRow
						icon={ICONS.METOR}
						label="をこわしたかず"
						value={stats.destroyedCount}
						suffix="個"
						delay={delay.destory}
					/>
					{/* 役職ごとの結果 */}
					<StatResultRow
						icon={isShooter ? ICONS.TARGET_CIRCLE : ICONS.TYPIST}
						label={isShooter ? "めいちゅうりつ" : "たいぷしたかず"}
						value={isShooter ? accuracy : stats.fireCount}
						suffix={isShooter ? "%" : "文字"}
						delay={delay.role}
					/>
				</div>

				{/* ===== BUTTON ===== */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: delay.button, duration: 0.5 }}
					className="mt-6"
				>
                    <Button
                        variant="success"
                        onClick={onBackToTitle}
                        className="w-full"
                    >
                        BACK TO TITLE
                    </Button>
				</motion.div>
			</motion.div>
		</div>
	);
}
