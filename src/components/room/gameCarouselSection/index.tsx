"use client";

import { useState, useEffect } from "react";
import { useLoading } from "@/lib/loading-context";
import Image from "next/image";
import { Users } from "lucide-react";
import { gameCarouselSection } from "./styles";
import { Modal } from "@/components/ui/modal";
import { LeaveRoomButton } from "../leaveRoomButton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { selectGame } from "@/server/actions/room";
import {
	isPlayerCountValid,
	getPlayerRangeLabel,
} from "@/constants/room/gamePlayerRequirements";

interface GameCarouselSectionProps {
	roomId: string;
	memberCount: number;
	isHost: boolean;
	onLeaveRoom: () => void;
}

const GAMES = [
	{
		type: "error-hunter",
		title: "ERROR HUNTER",
		icon: "/svg/object/old-pc.svg",
		desc: "バグを見つけて潰せ！",
		mode: "competitive",
		shortDesc:
			"エラーダイアログが突然出現！最速で「×」ボタンを押した人が勝利。フライングは無効。",
		roles: null,
	},
	{
		type: "null-hand",
		title: "NULL HAND",
		icon: "/svg/object/null-hand.svg",
		desc: "心理戦で相手を欺け",
		mode: "competitive",
		shortDesc:
			"ホストは裏で手を選択。ゲストはその心理を読んで勝て。統計情報を活かせ。",
		roles: ["HOST", "GUEST"] as const,
	},
	{
		type: "star-shield",
		title: "STAR SHIELD",
		icon: "/svg/object/target-circle.svg",
		desc: "90秒生き延びて星を守れ",
		mode: "cooperative",
		shortDesc:
			"タイピスト&シューターの2人協力。タイピングで弾を撃ち、90秒間星を守り切れ！",
		roles: ["SHOOTER", "TYPIST"] as const,
		videos: ["/mp4/shooting.mp4", "/mp4/typing.mp4"] as const,
	},
] as const;

type GameType = (typeof GAMES)[number]["type"];

const CARD_THEME: Record<GameType, string> = {
	"error-hunter": "border-teal-600 bg-teal-700/80 text-white",
	"null-hand":
		"border-[#FF4444] bg-black/80 text-[#FF4444] shadow-[0_0_20px_rgba(255,68,68,0.3)]",
	"star-shield":
		"border-brand-500/60 bg-brand-50/80 text-brand-500 shadow-[0_0_20px_rgba(129,140,248,0.3)]",
};

export function GameCarouselSection({
	roomId,
	memberCount,
	isHost,
	onLeaveRoom,
}: GameCarouselSectionProps) {
	const styles = gameCarouselSection();
	const { showLoading, hideLoading } = useLoading();
	const [activeIndex, setActiveIndex] = useState(0);
	const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

	useEffect(() => {
		setSelectedRoleIndex(0);
	}, [activeIndex]);
	const [showGameStartError, setShowGameStartError] = useState(false);
	const [gameStartErrorType, setGameStartErrorType] = useState<string>("");
	const [showHostOnlyModal, setShowHostOnlyModal] = useState(false);

	const getPosition = (i: number): "center" | "left" | "right" => {
		const diff = ((i - activeIndex) % 3 + 3) % 3;
		if (diff === 0) return "center";
		if (diff === 1) return "right";
		return "left";
	};

	const handleGameStart = async () => {
		const game = GAMES[activeIndex];
		if (
			!isPlayerCountValid(
				game.type as "error-hunter" | "null-hand" | "star-shield",
				memberCount,
			)
		) {
			setGameStartErrorType(game.type);
			setShowGameStartError(true);
			return;
		}
		showLoading();
		try {
			await selectGame(roomId, game.type);
		} finally {
			hideLoading();
		}
	};

	const handleCardClick = (i: number) => {
		const pos = getPosition(i);
		if (pos !== "center") {
			setActiveIndex(i);
			return;
		}
		if (isHost) {
			handleGameStart();
		} else {
			setShowHostOnlyModal(true);
		}
	};

	const positionClass = {
		center: styles.cardCenter(),
		left: styles.cardLeft(),
		right: styles.cardRight(),
	};

	return (
		<div className={styles.wrapper()}>
			<div className={styles.stage()}>
				{GAMES.map((game, i) => {
					const pos = getPosition(i);
					return (
						<div
							key={game.type}
							className={`${styles.cardBase()} ${positionClass[pos]} ${CARD_THEME[game.type]}`}
							onClick={() => handleCardClick(i)}
						>
							<div className={styles.gameIcon()}>
								<Image
									src={game.icon}
									alt={game.title}
									fill
									className="object-contain"
								/>
							</div>
							<Typography variant="h2" font="dot-gothic-16" as="div" className={styles.gameTitle()}>
								{game.title}
							</Typography>
							<Typography variant="small" as="div" className={styles.gameDesc()}>
								{game.desc}
							</Typography>
							<div className={styles.cardInfo()}>
								<span className="flex items-center gap-0.5">
									<Users className="w-3 h-3" />
									{getPlayerRangeLabel(game.type)}
								</span>
								{game.mode === "cooperative" ? (
									<span className={styles.modeTagCooperative()}>協力</span>
								) : (
									<span className={styles.modeTagCompetitive()}>対戦</span>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<div className={styles.kvContainer()}>
				{GAMES[activeIndex].roles && (
					<div className={styles.kvTabsOverlay()}>
						{GAMES[activeIndex].roles.map((role, i) => (
							<button
								key={role}
								className={`${styles.kvTab()} ${
									i === selectedRoleIndex
										? styles.kvTabActive()
										: styles.kvTabInactive()
								}`}
								onClick={() => setSelectedRoleIndex(i)}
							>
								{role}
							</button>
						))}
					</div>
				)}
				{"videos" in GAMES[activeIndex] ? (
					<video
						key={GAMES[activeIndex].videos[selectedRoleIndex]}
						src={GAMES[activeIndex].videos[selectedRoleIndex]}
						autoPlay
						loop
						muted
						playsInline
						className="w-full h-full object-cover"
					/>
				) : (
					<Image
						src={GAMES[activeIndex].icon}
						alt={GAMES[activeIndex].title}
						fill
						className="object-contain p-6"
					/>
				)}
			</div>

			<Typography variant="small" font="dot-gothic-16" className={styles.ruleDesc()}>
				{GAMES[activeIndex].shortDesc}
			</Typography>

			<div className={styles.actionRow()}>
				<LeaveRoomButton roomId={roomId} isHost={isHost} onLeaveRoom={onLeaveRoom} />
				{isHost && (
					<Button
						variant="primary"
						onClick={handleGameStart}
						className="font-cherry-bomb-one"
					>
						はじめる
					</Button>
				)}
			</div>

			<Modal
				isOpen={showGameStartError}
				onClose={() => setShowGameStartError(false)}
				title="ゲームを開始できません"
				showCloseButton
			>
				<div className={styles.errorModalContent()}>
					<Typography variant="body" className={styles.errorModalText()}>
						現在の参加者数（{memberCount}
						人）では、このゲームをプレイできません。
					</Typography>
					<Typography variant="small" className={styles.errorModalSub()}>
						{gameStartErrorType === "error-hunter" &&
							`ERROR HUNTER は ${getPlayerRangeLabel("error-hunter")}でプレイできます。`}
						{gameStartErrorType === "null-hand" &&
							`NULL HAND は ${getPlayerRangeLabel("null-hand")}でプレイできます。`}
						{gameStartErrorType === "star-shield" &&
							"STAR SHIELD は 2人のみでプレイできます。"}
					</Typography>
					<div className={styles.errorModalActions()}>
						<Button
							variant="success"
							onClick={() => setShowGameStartError(false)}
						>
							<Typography variant="label" font="cherry-bomb-one" className="font-bold">
								とじる
							</Typography>
						</Button>
					</div>
				</div>
			</Modal>

		<Modal
			isOpen={showHostOnlyModal}
			onClose={() => setShowHostOnlyModal(false)}
			title="ゲームを開始できません"
			showCloseButton
		>
			<div className={styles.errorModalContent()}>
				<Typography variant="body" className={styles.errorModalText()}>
					ゲームの開始はホストのみが行えます。
				</Typography>
				<Typography variant="small" className={styles.errorModalSub()}>
					ホストに開始してもらいましょう。
				</Typography>
				<div className={styles.errorModalActions()}>
					<Button
						variant="success"
						onClick={() => setShowHostOnlyModal(false)}
					>
						<Typography variant="label" font="cherry-bomb-one" className="font-bold">
							とじる
						</Typography>
					</Button>
				</div>
			</div>
		</Modal>
		</div>
	);
}
