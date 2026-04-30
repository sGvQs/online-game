"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { animate } from "framer-motion";
import { resultPhase } from "./styles";
import { CLEAR_RATE, DIFFICULTY_CONFIG } from "@/constants/meteorBustersGame/gameConfig";
import type { MeteorBustersResult, MeteorDifficulty } from "@/types";

interface ResultPhaseProps {
	result: MeteorBustersResult;
	isHost: boolean;
	difficulty: MeteorDifficulty;
	beforePoints: number;
	players: { userId: string; name?: string | null; faceIconPath?: string }[];
	onReturnToTitle: () => void;
}

function AnimatedCount({
	target,
	delay,
	className,
}: {
	target: number;
	delay: number;
	className?: string;
}) {
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		const controls = animate(0, target, {
			duration: 1.2,
			delay,
			ease: "easeOut",
			onUpdate: (v) => setDisplay(Math.floor(v)),
		});
		return () => controls.stop();
	}, [target, delay]);

	return <span className={className}>{display}</span>;
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
		const controls = animate(before, before + gain, {
			duration: 0.8,
			delay,
			ease: "easeOut",
			onUpdate: (v) => setDisplayPoints(Math.floor(v)),
		});
		return () => controls.stop();
	}, [before, gain, delay]);

	return (
		<motion.div
			className="relative flex items-center justify-center"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}
		>
			<div className="flex items-baseline gap-1.5">
				<motion.span
					key={displayPoints}
					initial={{ scale: 1 }}
					animate={{ scale: [1, 1.12, 1] }}
					transition={{ duration: 0.2 }}
					className="text-3xl font-cherry-bomb-one text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
				>
					{displayPoints.toLocaleString()}
				</motion.span>
				<span className="text-lg text-yellow-400/70">pt</span>
			</div>
			<motion.div
				initial={{ opacity: 0, scale: 0, y: 10, rotate: -10 }}
				animate={{ opacity: 1, scale: 1, y: -32, rotate: 12 }}
				transition={{ delay }}
				className="absolute right-0 top-5 bg-linear-to-br from-yellow-300 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.4)] border border-white/20 whitespace-nowrap"
			>
				+{gain}pt
			</motion.div>
		</motion.div>
	);
}

function DestroyRateSection({
	destroyed,
	spawned,
	isCleared,
	delay,
	styles,
}: {
	destroyed: number;
	spawned: number;
	isCleared: boolean;
	delay: number;
	styles: ReturnType<typeof resultPhase>;
}) {
	const ratePct = spawned > 0 ? (destroyed / spawned) * 100 : 0;
	const [displayRate, setDisplayRate] = useState(0);
	const [barWidthPct, setBarWidthPct] = useState(0);
	const clearLinePct = CLEAR_RATE * 100;

	useEffect(() => {
		const controls = animate(0, ratePct, {
			duration: 1.5,
			delay,
			ease: "easeOut",
			onUpdate: (v) => {
				setDisplayRate(Math.floor(v));
				setBarWidthPct(v);
			},
		});
		return () => controls.stop();
	}, [ratePct, delay]);

	const barColor = isCleared
		? "linear-gradient(to right, rgba(99,102,241,0.7), rgba(129,140,248,1))"
		: "linear-gradient(to right, rgba(239,68,68,0.7), rgba(239,68,68,1))";

	return (
		<motion.div
			className={styles.progressSection()}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay, duration: 0.3 }}
		>
			<div className={styles.progressHeader()}>
				<span className={styles.progressLabel()}>はかいりつ</span>
				<div className={styles.progressRateWrap()}>
					<span className={styles.progressRate()}>{displayRate}</span>
					<span className={styles.progressRateSuffix()}>%</span>
				</div>
			</div>
			<div className={styles.progressTrack()}>
				<div className={styles.progressTrackInner()}>
					<div
						className={styles.progressBar()}
						style={{ width: `${barWidthPct}%`, background: barColor }}
					/>
				</div>
				{/* クリアライン マーカー */}
				<div
					className={styles.progressClearLine()}
					style={{ left: `${clearLinePct}%` }}
				/>
			</div>
			<div className={styles.progressFooter()}>
				<span>0%</span>
				<span>クリア {Math.round(clearLinePct)}%</span>
				<span>100%</span>
			</div>
		</motion.div>
	);
}

// ============================================================
// アニメーションタイミング設定（秒）
// 各要素の登場タイミングをここで一括調整できます
// ============================================================
const RESULT_TIMING = {
	/** 「はかいすう」タイトルの登場 */
	title: 0.1,
	/** 1人目プレイヤー行の登場。以降は playerStagger ずつ遅延 */
	firstPlayer: 0.4,
	/** プレイヤー行の間隔 */
	playerStagger: 0.5,
	/** 合計行: 最後のプレイヤーのカウントアップ完了まで待つための追加ウェイト */
	totalAfterLastPlayer: 1.6,
	/** プログレスバー: 合計カウントアップ完了まで待つための追加ウェイト */
	progressAfterTotal: 1.5,
	/** バッジ: プログレスバーアニメーション完了まで待つための追加ウェイト */
	badgeAfterProgress: 2.0,
	/** ポイントアニメーション: バッジ登場後の追加ウェイト（CLEARED時のみ） */
	pointsAfterBadge: 0.5,
	/** ボタン: バッジ登場後の追加ウェイト（FAILED時） */
	buttonAfterBadge: 0.6,
	/** ボタン: バッジ登場後の追加ウェイト（CLEARED + ポイントアニメーション後） */
	buttonAfterBadgeCleared: 2.0,
};

export function ResultPhase({
	result,
	isHost,
	difficulty,
	beforePoints,
	players,
	onReturnToTitle,
}: ResultPhaseProps) {
	const styles = resultPhase();

	const gainPoints = result.isCleared
		? (DIFFICULTY_CONFIG[difficulty]?.pointsOnClear ?? 0)
		: 0;
	const showPoints = result.isCleared && gainPoints > 0;

	// タイミングを順番に積み上げ
	const t = RESULT_TIMING;
	const playerDelay = (i: number) => t.firstPlayer + i * t.playerStagger;
	const totalDelay = playerDelay(players.length - 1) + t.totalAfterLastPlayer;
	const progressDelay = totalDelay + t.progressAfterTotal;
	const badgeDelay = progressDelay + t.badgeAfterProgress;
	const buttonDelay = badgeDelay + (showPoints ? t.buttonAfterBadgeCleared : t.buttonAfterBadge);

	return (
		<div className={styles.container()}>
			<div className={styles.inner()}>

				{/* ── タイトル ── */}
				<motion.p
					className={styles.sectionTitle()}
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: t.title, duration: 0.4 }}
				>
					はかいすう
				</motion.p>

				{/* ── プレイヤースコア ── */}
				<div className={styles.playersSection()}>
					{players.map((player, i) => (
						<motion.div
							key={player.userId}
							className={styles.playerRow()}
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: playerDelay(i), duration: 0.4 }}
						>
							<div className={styles.playerInfo()}>
								<div className={styles.playerFaceWrap()}>
									<Image
										src={player.faceIconPath ?? "/svg/face/boy-face.svg"}
										alt=""
										fill
										className="object-contain"
									/>
								</div>
								<span className={styles.playerName()}>
									{player.name ?? player.userId.slice(0, 6)}
								</span>
							</div>
							<div className={styles.playerScoreInner()}>
								<AnimatedCount
									target={result.playerScores[player.userId] ?? 0}
									delay={playerDelay(i)}
									className={styles.playerCount()}
								/>
								<span className={styles.playerUnit()}>個</span>
							</div>
						</motion.div>
					))}
				</div>

				{/* ── 合計 ── */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: totalDelay, duration: 0.3 }}
				>
					<div className={styles.divider()} />
					<div className={`${styles.totalRow()} mt-3`}>
						<span className={styles.totalLabel()}>ごうけい</span>
						<div className={styles.totalInner()}>
							<AnimatedCount
								target={result.destroyedCount}
								delay={totalDelay}
								className={styles.totalCount()}
							/>
							<span className={styles.totalUnit()}>個</span>
						</div>
					</div>
				</motion.div>

				{/* ── プログレスバー + 破壊率 ── */}
				<DestroyRateSection
					destroyed={result.destroyedCount}
					spawned={result.spawnedCount}
					isCleared={result.isCleared}
					delay={progressDelay}
					styles={styles}
				/>

				{/* ── CLEARED / FAILED バッジ（最後に出現） ── */}
				<motion.div
					className={styles.badgeWrap()}
					initial={{ opacity: 0, scale: 1.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: badgeDelay, duration: 0.5, ease: "backOut" }}
				>
					<span
						className={`${styles.badge()} ${
							result.isCleared ? styles.badgeCleared() : styles.badgeFailed()
						}`}
					>
						{result.isCleared ? "CLEARED!" : "FAILED"}
					</span>
					<span className={styles.badgeSub()}>
						{result.isCleared ? "Mission Complete" : "Try Again"}
					</span>
				</motion.div>

				{/* ── ポイントアニメーション（CLEARED時のみ） ── */}
				{showPoints && (
					<PointGainAnimation
						before={beforePoints}
						gain={gainPoints}
						delay={badgeDelay + t.pointsAfterBadge}
					/>
				)}

				{/* ── ボタン ── */}
				<motion.div
					className={styles.buttonArea()}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: buttonDelay, duration: 0.4 }}
				>
					{isHost ? (
						<button onClick={onReturnToTitle} className={styles.returnBtn()}>
							タイトルに戻る
						</button>
					) : (
						<p className={styles.waitText()}>
							ホストがタイトルに戻るまでお待ちください
						</p>
					)}
				</motion.div>

			</div>
		</div>
	);
}
