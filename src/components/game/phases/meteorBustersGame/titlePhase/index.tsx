"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { titlePhase } from "./styles";
import { FloatGlow, GlowVariant } from "@/components/ui/floatGlow";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Typography } from "@/components/ui/typography";
import { AuroraGlow } from "@/components/game/common/starShield/auroraGlow";
import { DifficultyOrbitIcon } from "@/components/game/common/starShield/difficultyOrbitIcon";
import { MeteorOrbitStar } from "./MeteorOrbitStar";
import { FACE_ICON_PATHS, DEFAULT_FACE_ICON } from "@/constants/common/faceIcon";
import type { RoomWithUsersAndReadyStatus, MeteorDifficulty, UserRanking } from "@/types";

interface TitlePhaseProps {
	room: RoomWithUsersAndReadyStatus;
	isHost: boolean;
	isReady: boolean;
	isTogglingReady: boolean;
	allUsersReady: boolean;
	isProcessing: boolean;
	currentUserId: string;
	rankings: UserRanking[];
	selectedDifficulty: MeteorDifficulty;
	onDifficultyChange: (difficulty: MeteorDifficulty) => void;
	onStartGame: (difficulty: MeteorDifficulty) => Promise<void>;
	onClose: () => void;
	onToggleReady: () => void;
}

const DIFFICULTY_META: Record<MeteorDifficulty, {
	label: string;
	rate: string;
	bg: string;
	border: string;
	text: string;
	glow: string;
	orbitIconSrc: string;
}> = {
	TUTORIAL: {
		label: "チュートリアル",
		rate: "+0pt",
		bg: "rgba(129,140,248,0.12)",
		border: "rgba(129,140,248,0.5)",
		text: "#818cf8",
		glow: "0 0 12px rgba(129,140,248,0.4)",
		orbitIconSrc: "/svg/object/metor.svg",
	},
	EASY: {
		label: "かんたん",
		rate: "+1pt",
		bg: "rgba(134,239,172,0.12)",
		border: "rgba(134,239,172,0.5)",
		text: "#86efac",
		glow: "0 0 12px rgba(134,239,172,0.4)",
		orbitIconSrc: "/svg/object/earth.svg",
	},
	NORMAL: {
		label: "ふつう",
		rate: "+2pt",
		bg: "rgba(253,224,71,0.12)",
		border: "rgba(253,224,71,0.5)",
		text: "#fde047",
		glow: "0 0 12px rgba(253,224,71,0.4)",
		orbitIconSrc: "/svg/object/sun.svg",
	},
	HARD: {
		label: "むずかしい",
		rate: "+3pt",
		bg: "rgba(248,113,113,0.12)",
		border: "rgba(248,113,113,0.5)",
		text: "#f87171",
		glow: "0 0 12px rgba(248,113,113,0.4)",
		orbitIconSrc: "/svg/object/mars.svg",
	},
};

export function TitlePhase({
	room,
	isHost,
	isReady,
	isTogglingReady,
	allUsersReady,
	isProcessing,
	currentUserId,
	rankings,
	selectedDifficulty,
	onDifficultyChange,
	onStartGame,
	onClose,
	onToggleReady,
}: TitlePhaseProps) {
	const styles = titlePhase();
	const [showCannotStartModal, setShowCannotStartModal] = useState(false);
	const [showCancelReadyModal, setShowCancelReadyModal] = useState(false);

	const rankingsMap = new Map(rankings.map((r) => [r.userId, r]));

	// ホストは ready → start を自動化するので、他プレイヤー全員が ready かどうかで判定
	const othersAllReady = room.users
		.filter((u) => u.userId !== currentUserId)
		.every((u) => u.isReady);
	const canStart = isHost && othersAllReady && !isProcessing;

	const readyCount = room.users.filter((u) => u.isReady).length;
	const totalUsers = room.users.length;
	const activeMeta = DIFFICULTY_META[selectedDifficulty];

	const handleHostStart = async () => {
		if (!canStart) {
			setShowCannotStartModal(true);
			return;
		}
		if (!isReady) onToggleReady();
		await onStartGame(selectedDifficulty);
	};

	return (
		<>
		<div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
			<MeteorOrbitStar />
			<AuroraGlow width={700} height={350} opacity={0.25} blur={50} />

			<div className="relative z-25 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
				<div className="grid grid-cols-[1fr_auto_1fr] gap-10 items-start">

					{/* 左カラム: タイトル（中央寄せ）+ ボタン */}
					<div className="flex flex-col gap-10 items-center justify-center h-full">
						<motion.div
							className="text-center"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, ease: "easeOut" }}
						>
							<h1 className={styles.titleWrapper()}>
								<span className={styles.titleLine1()}>METEOR</span>
								<span className={styles.titleLine2()}>BUSTERS</span>
							</h1>
							<Typography variant="small" className={styles.subtitle()}>
								<Image src="/svg/object/metor.svg" alt="" width={16} height={16} className="shrink-0 opacity-80" />
								協力して隕石を撃破せよ
							</Typography>
						</motion.div>

						<motion.div
							className="flex gap-3"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							{/* 非ホストのみ ready ボタン */}
							{!isHost && (
								<FloatGlow active={!isReady} variant={GlowVariant.Secondary}>
									<Button
										variant={isReady ? "success" : "secondary"}
										onClick={() => isReady ? setShowCancelReadyModal(true) : onToggleReady()}
										disabled={isTogglingReady}
										size="lg"
										className="w-full"
									>
										{isReady ? "やっぱいけません！" : "いけます！"}
									</Button>
								</FloatGlow>
							)}

							{isHost && (
								<>
									<Button variant="success" onClick={onClose} size="lg">
										もどる
									</Button>
									<FloatGlow active={canStart} variant={GlowVariant.Primary}>
										<Button
											variant="primary"
											onClick={handleHostStart}
											disabled={isProcessing}
											size="lg"
											className="w-full"
										>
											{isProcessing ? "開始中..." : "スタート"}
										</Button>
									</FloatGlow>
								</>
							)}
						</motion.div>
					</div>

					{/* 縦区切り線 */}
					<div className="w-px self-stretch bg-linear-to-b from-transparent via-brand-500/30 to-transparent" />

					{/* 右カラム: プレイヤー + 難易度 */}
					<motion.div
						className="flex flex-col gap-6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.5 }}
					>
						{/* プレイヤーカード */}
						<div className={styles.playerCard()}>
							<div className="flex flex-col gap-3">
								{room.users.map((u) => {
									const ranking = rankingsMap.get(u.userId);
									const faceIconSrc = FACE_ICON_PATHS[u.user?.faceIcon ?? DEFAULT_FACE_ICON];
									return (
										<div
											key={u.userId}
											className="flex items-center gap-2"
										>
											<Image src={faceIconSrc} alt="" width={28} height={28} className="shrink-0 rounded-full" />
											<Typography variant="small" as="span" style={{ color: "rgba(255,255,255,0.85)" }}>
												{u.user?.name ?? u.userId.slice(0, 8)}
											</Typography>
											{ranking && (
												<span className="ml-auto flex items-center gap-1 tabular-nums" style={{ color: "rgba(255,255,255,0.4)" }}>
													<Typography variant="caption" as="span">{ranking.rank}位</Typography>
													<span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
													<Typography variant="caption" as="span">{ranking.points}pt</Typography>
												</span>
											)}
											<Typography
												variant="label"
												as="span"
												className={u.isReady ? styles.readyBadge() : styles.waitingBadge()}
											>
												{u.isReady ? "READY" : "WAITING"}
											</Typography>
										</div>
									);
								})}
							</div>
						</div>

						<div className={`${styles.difficultyCard()} ${!isHost ? "opacity-70" : ""}`}>
							<Typography variant="small" as="p" font="cherry-bomb-one" className={styles.difficultyCardTitle()}>
								むずかしさ
							</Typography>
							<div className="flex flex-col gap-2">
								{(["TUTORIAL", "EASY", "NORMAL", "HARD"] as MeteorDifficulty[]).map((diff) => {
									const meta = DIFFICULTY_META[diff];
									const isActive = selectedDifficulty === diff;
									const canSelect = isHost;
									const isSelectableInactive = canSelect && !isActive;
									return (
										<button
											key={diff}
											onClick={() => canSelect && onDifficultyChange(diff)}
											disabled={!canSelect}
											className={`${styles.difficultyButton()} ${isSelectableInactive ? "hover:bg-white/5 hover:border-white/25" : ""}`}
											style={{
												["--diff-bg" as string]: isActive ? meta.bg : "transparent",
												["--diff-border" as string]: isActive
													? `1.5px solid ${meta.border}`
													: isSelectableInactive
														? "1.5px solid rgba(255,255,255,0.12)"
														: "1.5px solid rgba(255,255,255,0.07)",
												["--diff-glow" as string]: isActive ? meta.glow : "none",
												["--diff-color" as string]: isActive ? meta.text : "rgba(255,255,255,0.35)",
												["--diff-rate-color" as string]: isActive ? meta.text : "rgba(255,255,255,0.15)",
											}}
										>
											<DifficultyOrbitIcon
												src={meta.orbitIconSrc}
												glowBoxShadow={isActive ? meta.glow : undefined}
											/>
											<Typography variant="body" as="span" font="cherry-bomb-one" className="font-bold flex-1 text-left">
												{meta.label}
											</Typography>
											<Typography variant="caption" as="span" className={styles.rateLabel()}>
												{meta.rate}
											</Typography>
										</button>
									);
								})}
							</div>
							<Typography
								variant="caption"
								as="p"
								font="cherry-bomb-one"
								className={styles.successHint()}
								style={{ ["--diff-hint-color" as string]: activeMeta.text }}
							>
								クリアすると {activeMeta.rate} もらえるよ。
							</Typography>
							{!isHost && (
								<Typography variant="caption" as="p" font="cherry-bomb-one" className={styles.hostWaiting()}>
									ほすとがせんたくちゅう…
								</Typography>
							)}
						</div>
					</motion.div>

				</div>
			</div>
		</div>

		<Modal
			isOpen={showCannotStartModal}
			onClose={() => setShowCannotStartModal(false)}
			title="まだはじめられないよ"
		>
			<div className="flex flex-col gap-4">
				<Typography variant="body" className="text-white/80">
					全員が「READY」になるとスタートできるよ。
				</Typography>
				<Typography variant="body" className="text-white/60">
					いまの状況：{readyCount} / {totalUsers} にん 「READY」になっている
				</Typography>
				<div className="flex justify-end">
					<Button variant="success" onClick={() => setShowCannotStartModal(false)}>
						とじる
					</Button>
				</div>
			</div>
		</Modal>

		<Modal
			isOpen={showCancelReadyModal}
			onClose={() => setShowCancelReadyModal(false)}
			title="じゅんびをやめる？"
		>
			<div className="flex flex-col gap-4">
				<Typography variant="body" className="text-white/80">
					「やっぱいけません！」を取り消して、準備をやめますか？
				</Typography>
				<div className="flex justify-end gap-3">
					<Button variant="success" onClick={() => setShowCancelReadyModal(false)}>
						やっぱいける！
					</Button>
					<Button
						variant="danger"
						disabled={isTogglingReady}
						onClick={() => {
							onToggleReady();
							setShowCancelReadyModal(false);
						}}
					>
						やめる
					</Button>
				</div>
			</div>
		</Modal>
		</>
	);
}
