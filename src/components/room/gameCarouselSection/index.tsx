"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { gameCarouselSection } from "./styles";
import { RoomModal } from "../roomModal";
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
}: GameCarouselSectionProps) {
	const styles = gameCarouselSection();
	const [activeIndex, setActiveIndex] = useState(0);
	const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		setSelectedRoleIndex(0);
	}, [activeIndex]);
	const [showGameStartError, setShowGameStartError] = useState(false);
	const [gameStartErrorType, setGameStartErrorType] = useState<string>("");

	const getPosition = (i: number): "center" | "left" | "right" => {
		const diff = ((i - activeIndex) % 3 + 3) % 3;
		if (diff === 0) return "center";
		if (diff === 1) return "right";
		return "left";
	};

	const handleCardClick = (i: number) => {
		const pos = getPosition(i);
		if (pos !== "center") {
			setActiveIndex(i);
			return;
		}
	};

	const handleGameStart = () => {
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
		startTransition(async () => {
			await selectGame(roomId, game.type);
		});
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
				<Image
					src={GAMES[activeIndex].icon}
					alt={GAMES[activeIndex].title}
					fill
					className="object-contain p-6"
				/>
			</div>

			<Typography variant="small" font="dot-gothic-16" className={styles.ruleDesc()}>
				{GAMES[activeIndex].shortDesc}
			</Typography>

			<div className={styles.actionRow()}>
				<LeaveRoomButton roomId={roomId} isHost={isHost} />
				{isHost && (
					<Button
						variant="primary"
						onClick={handleGameStart}
						disabled={isPending}
						className="font-cherry-bomb-one"
					>
						{isPending ? "処理中..." : `はじめる`}
					</Button>
				)}
			</div>

			<RoomModal
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
							variant="danger"
							onClick={() => setShowGameStartError(false)}
						>
							OK
						</Button>
					</div>
				</div>
			</RoomModal>
		</div>
	);
}
