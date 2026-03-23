"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { gameCarouselSection } from "./gameCarouselSection.styles";
import { GameDescriptionModal } from "./gameDescriptionModal";
import { RoomModal } from "./roomModal";
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
		hostDesc: "バグを見つけて潰せ！",
		guestDesc: "クリックでルールを表示",
		mode: "competitive",
	},
	{
		type: "null-hand",
		title: "NULL HAND",
		icon: "/svg/object/null-hand.svg",
		hostDesc: "心理戦で相手を欺け",
		guestDesc: "クリックでルールを表示",
		mode: "competitive",
	},
	{
		type: "star-shield",
		title: "STAR SHIELD",
		icon: "/svg/object/target-circle.svg",
		hostDesc: "90秒生き延びて星を守れ",
		guestDesc: "クリックでルールを表示",
		mode: "cooperative",
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
	const [isPending, startTransition] = useTransition();
	const [showGameDescription, setShowGameDescription] = useState(false);
	const [selectedGameType, setSelectedGameType] = useState<string>("");
	const [showGameStartError, setShowGameStartError] = useState(false);
	const [gameStartErrorType, setGameStartErrorType] = useState<string>("");

	const getPosition = (i: number): "center" | "left" | "right" => {
		const diff = ((i - activeIndex) % 3 + 3) % 3;
		if (diff === 0) return "center";
		if (diff === 1) return "right";
		return "left";
	};

	const handlePrev = () => {
		setActiveIndex((prev) => (prev - 1 + GAMES.length) % GAMES.length);
	};

	const handleNext = () => {
		setActiveIndex((prev) => (prev + 1) % GAMES.length);
	};

	const handleCardClick = (i: number) => {
		const pos = getPosition(i);
		if (pos !== "center") {
			setActiveIndex(i);
			return;
		}
		const game = GAMES[i];
		if (isHost) {
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
		} else {
			setSelectedGameType(game.type);
			setShowGameDescription(true);
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
							<div className={styles.gameTitle()}>{game.title}</div>
							<div className={styles.gameDesc()}>
								{isHost ? game.hostDesc : game.guestDesc}
							</div>
						</div>
					);
				})}
			</div>

			<div className={styles.infoPanel()}>
				<div className={styles.infoItem()}>
					<Users className="w-4 h-4" />
					<span>{getPlayerRangeLabel(GAMES[activeIndex].type)}</span>
				</div>
				<div className={styles.infoItem()}>
					{GAMES[activeIndex].mode === "cooperative" ? (
						<span className={styles.modeTagCooperative()}>協力</span>
					) : (
						<span className={styles.modeTagCompetitive()}>対戦</span>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<button
					className={styles.navButton()}
					onClick={handlePrev}
					aria-label="前のゲーム"
				>
					<ChevronLeft className="w-5 h-5" />
				</button>

				{isHost && (
					<Button
						variant="solid"
						disabled={isPending}
						onClick={() => handleCardClick(activeIndex)}
					>
						{isPending ? "開始中..." : "ゲームスタート"}
					</Button>
				)}

				{!isHost && (
					<Button
						variant="ghost"
						onClick={() => handleCardClick(activeIndex)}
					>
						ルールを見る
					</Button>
				)}

				<button
					className={styles.navButton()}
					onClick={handleNext}
					aria-label="次のゲーム"
				>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>

			<GameDescriptionModal
				isOpen={showGameDescription}
				onClose={() => setShowGameDescription(false)}
				gameType={selectedGameType}
			/>

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
