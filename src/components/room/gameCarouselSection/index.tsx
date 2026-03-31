"use client";

import { useState, useEffect, useContext } from "react";
import { useLoading } from "@/lib/loading-context";
import { SoundContext } from "@/lib/sound-context";
import { Users } from "lucide-react";
import { gameCarouselSection } from "./styles";
import { Modal } from "@/components/ui/modal";
import { LeaveRoomButton } from "../leaveRoomButton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ASCII_ART } from "@/constants/errorHunterGame/constants";
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
		desc: "バグを最速で潰せ！",
		mode: "competitive",
		shortDesc:
			"エラーダイアログが突然出現！最速でエラーをたくさん潰した人が勝ち！",
		roles: null,
		videos: ["/mp4/error-hunter.mp4"] as const,
	},
	{
		type: "null-hand",
		title: "NULL HAND",
		icon: "/svg/object/null-hand.svg",
		desc: "心理戦で相手を欺け",
		mode: "competitive",
		shortDesc:
			"ホストは裏で手を選択。ゲストはその心理を読んで勝て。その確率本当に信じていいのかな？",
		roles: ["HOST", "GUEST"] as const,
		videos: ["/mp4/null-hand-host.mp4", "/mp4/null-hand-guest.mp4"] as const,
	},
	{
		type: "star-shield",
		title: "STAR SHIELD",
		icon: "/svg/object/target-circle.svg",
		desc: "90秒間星を守りきれ！",
		mode: "cooperative",
		shortDesc:
			"タイピングで弾を撃ち、シューティングで狙い撃ち、90秒間星を守り切れ！",
		roles: ["SHOOTER", "TYPIST"] as const,
		videos: ["/mp4/shooting.mp4", "/mp4/typing.mp4"] as const,
	},
] as const;

type GameType = (typeof GAMES)[number]["type"];

function renderGameTitle(type: GameType) {
	switch (type) {
		case "error-hunter":
			return (
				<pre className="font-['Courier_New',monospace] text-[5px] leading-[1.2] font-bold whitespace-pre overflow-hidden mx-auto">
					{ASCII_ART}
				</pre>
			);
		case "star-shield":
			return (
				<div className="select-none flex flex-col items-center">
					<Typography variant="display" font="honk" as="span" className="text-6xl block leading-[0.6]">
						STAR
					</Typography>
					<Typography variant="display" font="honk" as="span" className="text-6xl block leading-[0.6]">
						SHIELD
					</Typography>
				</div>
			);
		case "null-hand":
			return (
				<Typography variant="display" font="sans" as="div" className="font-black text-3xl tracking-widest text-center drop-shadow-[2px_2px_0_rgba(255,68,68,0.4)] leading-loose">
					NULL HAND
				</Typography>
			);
	}
}

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
	const sound = useContext(SoundContext);

	const playSE = (file: string) => {
		if (!sound?.isPlaying) return;
		const audio = new Audio(file);
		audio.volume = 0.1;
		audio.play().catch(() => {});
	};
	const [activeIndex, setActiveIndex] = useState(0);
	const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
	const [isVideoLoading, setIsVideoLoading] = useState(true);

	useEffect(() => {
		setSelectedRoleIndex(0);
	}, [activeIndex]);

	useEffect(() => {
		setIsVideoLoading(true);
	}, [activeIndex, selectedRoleIndex]);
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
		playSE("/se/submit-se.mp3");
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
			playSE("/se/change-slide-se.mp3");
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
							{renderGameTitle(game.type)}
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
								onClick={() => {
									playSE("/se/switch-se.mp3");
									setSelectedRoleIndex(i);
								}}
							>
								{role}
							</button>
						))}
					</div>
				)}
				<video
					key={GAMES[activeIndex].videos[selectedRoleIndex]}
					src={GAMES[activeIndex].videos[selectedRoleIndex]}
					autoPlay
					loop
					muted
					playsInline
					className="w-full h-full object-cover"
					onCanPlay={() => setIsVideoLoading(false)}
				/>
				{isVideoLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/40">
						<div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
					</div>
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
						se={null}
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
