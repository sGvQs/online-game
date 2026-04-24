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
import { DinosaurWithBalls } from "@/components/game/common/starShield/dinosaurWithBalls";
import type { RoomWithUsersAndReadyStatus, MeteorDifficulty } from "@/types";

interface TitlePhaseProps {
	room: RoomWithUsersAndReadyStatus;
	isHost: boolean;
	isReady: boolean;
	isTogglingReady: boolean;
	allUsersReady: boolean;
	isProcessing: boolean;
	currentUserId: string;
	onStartGame: (difficulty: MeteorDifficulty) => Promise<void>;
	onClose: () => void;
	onToggleReady: () => void;
}

const DIFFICULTY_LABELS: Record<MeteorDifficulty, string> = {
	EASY: "易しい",
	NORMAL: "普通",
	HARD: "難しい",
};

const DIFFICULTY_COLORS: Record<MeteorDifficulty, { bg: string; border: string; text: string; glow: string }> = {
	EASY:   { bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.35)",  text: "text-emerald-400", glow: "rgba(16,185,129,0.4)" },
	NORMAL: { bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.35)", text: "text-indigo-400",  glow: "rgba(129,140,248,0.4)" },
	HARD:   { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.35)",   text: "text-red-400",    glow: "rgba(239,68,68,0.4)" },
};

const HOW_TO_PLAY = [
	{ iconSrc: "/svg/object/target-circle.svg", text: "カーソルを隕石に合わせて任意キーで射撃。" },
	{ iconSrc: "/svg/object/collision.svg",     text: "弾の色を隕石の色に合わせると25倍ダメージ！" },
	{ iconSrc: "/svg/object/metor.svg",         text: "中ボスを倒すと周囲の隕石を連鎖破壊。" },
	{ iconSrc: "/svg/charactor/annoying-dinosaur.svg", text: "隕石が星に到達する前に80%以上撃破でクリア！" },
];

export function TitlePhase({
	room,
	isHost,
	isReady,
	isTogglingReady,
	allUsersReady,
	isProcessing,
	currentUserId,
	onStartGame,
	onClose,
	onToggleReady,
}: TitlePhaseProps) {
	const styles = titlePhase();
	const [selectedDifficulty, setSelectedDifficulty] = useState<MeteorDifficulty>("NORMAL");
	const [showCannotStartModal, setShowCannotStartModal] = useState(false);

	const canStart = isHost && allUsersReady && !isProcessing;
	const readyCount = room.users.filter((u) => u.isReady).length;
	const totalUsers = room.users.length;

	return (
		<>
		<div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
			<DinosaurWithBalls size="w-28 h-28" />
			<AuroraGlow width={700} height={350} opacity={0.25} blur={50} />

			<div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
				<div className="grid grid-cols-[1fr_auto_1fr] gap-10 items-start">

					{/* 左カラム: タイトル + 難易度 + ボタン */}
					<div className="flex flex-col gap-5">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, ease: "easeOut" }}
						>
							<h1 className={styles.title()}>METEOR BUSTERS</h1>
							<Typography variant="small" className={styles.subtitle()}>
								<Image src="/svg/object/metor.svg" alt="" width={16} height={16} className="shrink-0 opacity-80" />
								協力して隕石を撃破せよ
							</Typography>
						</motion.div>

						{/* 難易度選択（ホストのみ） */}
						{isHost && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className={styles.difficultyCard()}
							>
								<Typography variant="label" className={styles.sectionLabel()}>
									DIFFICULTY
								</Typography>
								<div className="grid grid-cols-3 gap-3 mt-3">
									{(["EASY", "NORMAL", "HARD"] as MeteorDifficulty[]).map((diff) => {
										const c = DIFFICULTY_COLORS[diff];
										const isActive = selectedDifficulty === diff;
										return (
											<button
												key={diff}
												onClick={() => setSelectedDifficulty(diff)}
												className={styles.difficultyBtn()}
												style={{
													background: isActive ? c.bg : "transparent",
													border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.08)"}`,
													boxShadow: isActive ? `0 0 10px ${c.glow}` : "none",
												}}
											>
												<span className={isActive ? c.text : "text-white/30"}>
													{DIFFICULTY_LABELS[diff]}
												</span>
											</button>
										);
									})}
								</div>
							</motion.div>
						)}

						<motion.div
							className="flex flex-col gap-3 mt-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							<FloatGlow active={!isReady} variant={GlowVariant.Secondary}>
								<Button
									variant="secondary"
									onClick={() => !isReady && onToggleReady()}
									disabled={isReady || isTogglingReady}
									size="lg"
									className="w-full"
								>
									{isReady ? "✓ 準備完了" : "いけます！"}
								</Button>
							</FloatGlow>

							{isHost && (
								<>
									<Button variant="success" onClick={onClose} size="lg">
										もどる
									</Button>
									<FloatGlow active={canStart} variant={GlowVariant.Primary}>
										<Button
											variant="primary"
											onClick={() => canStart ? onStartGame(selectedDifficulty) : setShowCannotStartModal(true)}
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

						{/* 操作説明 */}
						<motion.p
							className={styles.controls()}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							任意キー: 射撃　スペース: リロード　クリック: 弾切り替え
						</motion.p>
					</div>

					{/* 縦区切り線 */}
					<div className="w-px self-stretch bg-linear-to-b from-transparent via-brand-500/30 to-transparent" />

					{/* 右カラム: プレイヤー + How to Play */}
					<motion.div
						className="flex flex-col gap-6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						{/* プレイヤーカード */}
						<div className={styles.playerCard()}>
							<Typography variant="h4" className={styles.playerCardTitle()}>
								Players {readyCount}/{totalUsers}
							</Typography>
							<div className="flex flex-col gap-3">
								{room.users.map((u) => {
									const isMe = u.userId === currentUserId;
									return (
										<div
											key={u.userId}
											className="flex items-center gap-3"
											style={{
												["--status-dot-color" as string]: u.isReady
													? "#818cf8"
													: "rgba(255,255,255,0.15)",
												["--player-name-color" as string]: isMe
													? "#ffffff"
													: "rgba(255,255,255,0.65)",
											}}
										>
											<div className={styles.statusDot()} />
											<Typography
												variant="small"
												as="span"
												className={styles.playerName()}
											>
												{u.user?.name ?? u.userId.slice(0, 8)}
												{isMe && (
													<Typography
														variant="caption"
														as="span"
														className={styles.playerNameSuffix()}
													>
														(あなた)
													</Typography>
												)}
												{u.userId === room.createdBy && (
													<Typography
														variant="caption"
														as="span"
														className="text-brand-500/70 ml-1 tracking-widest"
													>
														HOST
													</Typography>
												)}
											</Typography>
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
							<div className={styles.progressTrack()}>
								<div
									className={styles.progressBar()}
									style={{
										["--progress-pct" as string]: `${totalUsers > 0 ? (readyCount / totalUsers) * 100 : 0}%`,
									}}
								/>
							</div>
						</div>

						{/* How to Play */}
						<div className={styles.howToCard()}>
							<Typography variant="h4" className={styles.howToTitle()}>
								How to Play
							</Typography>
							<div className="flex flex-col gap-2.5">
								{HOW_TO_PLAY.map(({ iconSrc, text }) => (
									<div key={text} className="flex items-start gap-2.5">
										<Image
											src={iconSrc}
											alt=""
											width={20}
											height={20}
											className="mt-0.5 shrink-0 opacity-90"
										/>
										<Typography variant="body" as="span" className={styles.howToText()}>
											{text}
										</Typography>
									</div>
								))}
							</div>
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
		</>
	);
}
