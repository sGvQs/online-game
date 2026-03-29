"use client";

import { useState, useEffect } from "react";
import { Link } from "@/components/ui/link";
import { useRouter } from "next/navigation";
import { motion, animate } from "framer-motion";
import Image from "next/image";
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from "@/types";
import type { UserRanking } from "@/types";
import type { PairRanking } from "@/server/actions/game/starShieldRankingActions";
import { Button } from "@/components/ui/button";
import { button } from "@/components/ui/button/styles";
import { FloatGlow, GlowVariant } from "@/components/ui/floatGlow";
import { Modal } from "@/components/ui/modal";
import { ProtectedStar } from "../playing/protectedStar";
import { DinosaurWithBalls } from "@/components/game/common/starShield/dinosaurWithBalls";
import { StarShieldTitle } from "@/components/game/common/starShield/starShieldTitle";
import { AuroraGlow } from "@/components/game/common/starShield/auroraGlow";
import { titleScreen } from "./styles";
import { Typography } from "@/components/ui/typography";
import { ICONS } from "@/constants/starShieldGame/constants";
import { getMyStarShieldProgress } from "@/server/actions/game";

interface TitleScreenProps {
	room: RoomWithUsersAndReadyStatus;
	roomId: string;
	isHost: boolean;
	isReady: boolean;
	allUsersReady: boolean;
	canStart: boolean;
	onToggleReady: () => void | Promise<void>;
	onStartGame: () => void;
	onExit: () => void;
	currentUserId: string;
	initialRankings: UserRanking[];
	memberPairRank?: PairRanking | null;
}

const HOW_TO_PLAY = [
	{
		iconSrc: ICONS.TARGET_CIRCLE,
		text: "「シューター」は照準を隕石に合わせてエイム。",
	},
	{
		iconSrc: ICONS.TYPIST,
		text: "「タイピスト」はワードをタイプして弾を発射。",
	},
	{ iconSrc: ICONS.DINO, text: "90秒間、隕石の猛攻から星を守り抜けばクリア！" },
	{ iconSrc: ICONS.FIRE, text: "隕石が星に直撃するとゲームオーバー" },
];


export function TitleScreen({
	room,
	roomId,
	isHost,
	isReady,
	canStart,
	onToggleReady,
	onStartGame,
	onExit,
	currentUserId,
	initialRankings,
	memberPairRank,
}: TitleScreenProps) {
	const router = useRouter();
	const readyCount = room.users.filter(
		(u: RoomUserWithReadyStatus) => u.isReady,
	).length;
	const totalUsers = room.users.length;
	const styles = titleScreen();
	const [typingCount, setTypingCount] = useState<number>(0);
	const [showCannotStartModal, setShowCannotStartModal] = useState(false);

	useEffect(() => {
		getMyStarShieldProgress()
			.then((p) => {
				const target = p.totalTypingCount ?? 0;
				const controls = animate(0, target, {
					duration: 1.8,
					ease: [0.16, 1, 0.3, 1],
					onUpdate: (v) => setTypingCount(Math.round(v)),
				});
				return () => controls.stop();
			})
			.catch(() => {});
	}, []);

	return (
		<>
		<div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
			<ProtectedStar />
			<DinosaurWithBalls size="w-28 h-28" />
			<AuroraGlow width={700} height={350} opacity={0.25} blur={50} />

			<div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
				<div className="grid grid-cols-[1fr_auto_1fr] gap-10 items-start">
					<div className="flex flex-col gap-5">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, ease: "easeOut" }}
						>
							<StarShieldTitle />
							<Typography variant="small" className={styles.subtitle()}>
								<Image
									src={ICONS.TARGET_CIRCLE}
									alt=""
									width={18}
									height={18}
									className="shrink-0 opacity-80"
								/>
								と
								<Image
									src={ICONS.TYPIST}
									alt=""
									width={18}
									height={18}
									className="shrink-0 opacity-80"
								/>
								で役割分担して隕石から星を守りぬけ
							</Typography>
						</motion.div>

						<motion.div
							className="grid grid-cols-2 gap-4 mt-6"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							<FloatGlow active={!isReady} variant={GlowVariant.Secondary}>
								<Button
									variant="secondary"
									onClick={() => !isReady && onToggleReady()}
									disabled={isReady}
									size="lg"
									className="w-full"
								>
									いけます！
								</Button>
							</FloatGlow>
							<Link
								href={`/game/${roomId}/star-shield/ranking`}
								onClick={async (e) => {
									if (isReady) {
										e.preventDefault();
										await onToggleReady();
										router.push(`/game/${roomId}/star-shield/ranking`);
									}
								}}
								className={button({ variant: "blue", fullWidth: true , size: "lg" })}
							>
								ランキング
							</Link>
							{isHost && (
								<Button
									variant="success"
									onClick={onExit}
									size="lg"
									se="submit"
								>
									もどる
								</Button>
							)}
							<Link
								href={`/game/${roomId}/star-shield/skill`}
								onClick={async (e) => {
									if (isReady) {
										e.preventDefault();
										await onToggleReady();
										router.push(`/game/${roomId}/star-shield/skill`);
									}
								}}
								className={button({ variant: "yellow", fullWidth: true , size: "lg" })}
							>
								スキル
							</Link>
							{isHost && (
								<FloatGlow active={canStart} variant={GlowVariant.Primary} className="col-span-2">
									<Button
										variant="primary"
										se="submit"
										onClick={() => canStart ? onStartGame() : setShowCannotStartModal(true)}
										size="lg"
										className="w-full"
									>
										スタート
									</Button>
								</FloatGlow>
							)}
						</motion.div>
					</div>

					<div className="w-px self-stretch bg-linear-to-b from-transparent via-brand-500/30 to-transparent" />

					<motion.div
						className="flex flex-col gap-6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						<div className="flex justify-between gap-3">
							<Link
								href={`/game/${roomId}/star-shield/ranking`}
								className={styles.pairRankBadge()}
								onClick={async (e) => {
									if (isReady) {
										e.preventDefault();
										await onToggleReady();
										router.push(`/game/${roomId}/star-shield/ranking`);
									}
								}}
							>
								{memberPairRank ? (
									<div className="flex items-center justify-between w-full">
										<div className="flex items-baseline">
											<Image
												src={ICONS.METOR}
												alt="Typing"
												width={28}
												height={28}
												className="shrink-0 opacity-90 mt-auto"
											/>
											<Typography variant="h3" font="cherry-bomb-one" as="span" className="font-bold tabular-nums text-blue-400 shrink-0 ml-2">
												{memberPairRank.rank}
											</Typography>
											<Typography variant="body" font="dot-gothic-16" as="span" className="text-blue-400 shrink-0">
												位
											</Typography>
										</div>
										<div className="flex items-baseline">
											<Typography variant="h3" font="cherry-bomb-one" as="span" className="font-bold tabular-nums text-blue-400 shrink-0 ml-auto">
												{memberPairRank.bestDestroyedCount}
											</Typography>
											<Typography variant="body" font="dot-gothic-16" as="span" className="text-blue-400 shrink-0">
												個
											</Typography>
										</div>
									</div>
								) : (
									<Typography variant="small" font="dot-gothic-16" as="span" className="text-white/60 group-hover:text-white/80 transition-colors">
										ランキングを見る →
									</Typography>
								)}
							</Link>
							<div className="rounded-2xl p-4 bg-[rgba(129,140,248,0.05)] border border-[rgba(129,140,248,0.18)] flex items-center gap-3">
								<Image
									src={ICONS.TYPIST}
									alt="Typing"
									width={28}
									height={28}
									className="shrink-0 opacity-90"
								/>
								<Typography variant="h3" font="cherry-bomb-one" as="span" className="font-bold tabular-nums text-yellow-400/90">
									{typingCount.toLocaleString()}
								</Typography>
							</div>
						</div>
						<div className={styles.playerCard()}>
							<Typography variant="h4" className={styles.playerCardTitle()}>
								Players {readyCount}/{totalUsers}
							</Typography>
							<div className="flex flex-col gap-3">
								{room.users.map((u: RoomUserWithReadyStatus) => {
									const isMe = u.userId === currentUserId;
									const ranking = initialRankings.find(
										(r) => r.userId === u.userId,
									);
									const rankDisplay = ranking
										? `${ranking.rank}位 ${Math.floor(ranking.points)}pt`
										: "--- 0pt";
									return (
										<div
											key={u.id}
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
												{u.user?.name ?? "..."}
												{isMe && (
													<Typography
														variant="caption"
														as="span"
														className={styles.playerNameSuffix()}
													>
														(あなた)
													</Typography>
												)}
											</Typography>
											<Typography
												variant="label"
												as="span"
												className={styles.playerRank()}
											>
												{rankDisplay}
											</Typography>
											<Typography
												variant="label"
												as="span"
												className={u.isReady ? styles.readyBadge() : styles.waitingBadge()}
											>
												READY
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
										<Typography
											variant="body"
											as="span"
											className={styles.howToText()}
										>
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
					二人が「READY」になるとスタートできるよ。
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
