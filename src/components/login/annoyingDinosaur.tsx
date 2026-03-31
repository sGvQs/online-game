"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { detectIncognito } from "detectincognitojs";
import {
	DIALOGUE_MESSAGES_CACHE_RESET,
	DIALOGUE_MESSAGES_INCOGNITO,
	DIALOGUE_MESSAGES_VISIT_0,
	DIALOGUE_MESSAGES_VISIT_1_PLUS,
	DIALOGUE_MESSAGES_RETURNING,
	LP_DINOSAUR_MESSAGES,
	SUCKED_IN_AFTERMATH_MESSAGES,
} from "@/constants/login/dinosaurLoginMessages";
import {
	getHasLoggedInSession,
	getHasVisitedSite,
	getLoginVisitCount,
	setHasVisitedSite,
	setLoginVisitCount,
} from "@/lib/local-storage-bridge";
import { useSE } from "@/hooks/useSE";
import { Typography } from "@/components/ui/typography";
const ENTER_DURATION = 3;
const IDLE_DURATION = 10;
/** なんちゃってパターン時の待機時間（秒） */
const IDLE_DURATION_AFTERMATH = 10;
const EXIT_DURATION = 5;
/** 2回目以降向け：退場後、再登場までの待機時間（秒） */
const VISIT_1_PLUS_REAPPEAR_DELAY_SEC = 10;
/** 一文字表示の間隔（ms）喋るスピード感 */
const CHAR_INTERVAL_MS = 150;

/** 各パターンの発生確率（5パターン中1つなので0.2） */
const PATTERN_PROBABILITY = 0.2;
/** 吸い込まれるアニメーションの所要時間（秒） */
const SUCKED_IN_DURATION = 15;

function getDialogueMessages(): string[] {
	if (typeof window === "undefined") return DIALOGUE_MESSAGES_VISIT_0;
	if (getHasLoggedInSession()) {
		return DIALOGUE_MESSAGES_RETURNING;
	}
	const count = getLoginVisitCount();
	// キャッシュリセット検出：訪問回数が0だが訪問履歴フラグあり
	if (count === 0 && getHasVisitedSite()) {
		return DIALOGUE_MESSAGES_CACHE_RESET;
	}
	return count === 0
		? DIALOGUE_MESSAGES_VISIT_0
		: DIALOGUE_MESSAGES_VISIT_1_PLUS;
}

function markAsVisited(): void {
	if (typeof window === "undefined") return;
	setHasVisitedSite(true);
}

function incrementVisitCount(): void {
	if (typeof window === "undefined") return;
	setLoginVisitCount(getLoginVisitCount() + 1);
}

/**
 * パターン構成（5種類）:
 * 1. 左下から出てくる → 左に退場のみ
 * 2. 下から出てくる → 下に退場のみ
 * 3. 回転しながら喋ってる 左下=>右上
 * 4. 回転しながら喋ってる 左上=>右下
 * 5. なんちゃってパターン
 */
type EnterPattern =
	| "left"
	| "bottom"
	| "rotate-bl-tr"
	| "rotate-tl-br"
	| "nantechatte";

/** 回転しながら喋る方向（2パターン・吸い込まれると同じく常に動き続ける） */
type RotateFlowDirection = "bl-tr" | "tl-br";

/** 回転しながら喋るアニメーションの所要時間（吸い込まれると同様） */
const ROTATE_FLOW_DURATION = 60;

/** 回転しながら喋ってるアニメーション：常に動き続ける（吸い込まれると同じ動き） */
function RotateWhileTalkingAnimation({
	direction,
	displayedText,
	onComplete,
}: {
	direction: RotateFlowDirection;
	displayedText: string;
	onComplete: () => void;
}) {
	useEffect(() => {
		const timer = setTimeout(onComplete, ROTATE_FLOW_DURATION * 1000);
		return () => clearTimeout(timer);
	}, [onComplete]);

	/** 左下=>右上 / 左上=>右下（画面外から画面外へ流れ続ける） */
	const positions = {
		"bl-tr": {
			initial: { x: "-80vw", y: "50vh" },
			animate: { x: "80vw", y: "-80vh" },
		},
		"tl-br": {
			initial: { x: "-80vw", y: "50vh" },
			animate: { x: "80vw", y: "-150vh" },
		},
	} as const;
	const { initial, animate } = positions[direction];

	return (
		<motion.div
			className="fixed left-1/2 top-1/2 z-0 pointer-events-none"
			initial={initial}
			animate={animate}
			transition={{
				duration: ROTATE_FLOW_DURATION,
				ease: "easeIn",
			}}
		>
			{/* [svg][text] でSVGを左軸に回転 */}
			<motion.div
				className="flex items-end gap-2"
				initial={{ rotate: 0 }}
				animate={{ rotate: 720 }}
				transition={{
					duration: ROTATE_FLOW_DURATION,
					ease: "linear",
				}}
				style={{ transformOrigin: "left center" }}
			>
				<div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
					<Image
						src="/svg/charactor/annoying-dinosaur.svg"
						alt="Susum"
						fill
						sizes="64px"
						className="object-contain"
					/>
				</div>
				<div className="shrink-0 mb-2 px-2.5 py-1.5 rounded-xl border border-white bg-white text-black text-[10px] font-medium shadow-sm max-w-[400px]">
					<Typography variant="body" as="span" font="cherry-bomb-one">
						{displayedText}
					</Typography>
				</div>
			</motion.div>
		</motion.div>
	);
}

/** 吸い込まれるアニメーション：画面外右上→中央下へ回転しながら流れる */
function SuckedInAnimation({ onComplete }: { onComplete: () => void }) {
	const SUCKED_IN_MESSAGE = "うぁー、すいこまれるー";

	useEffect(() => {
		const timer = setTimeout(onComplete, SUCKED_IN_DURATION * 1000);
		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			className="fixed left-1/2 top-0 z-0 pointer-events-none"
			initial={{ x: "60vw", y: "-100vh" }}
			animate={{ x: "-50%", y: "130vh" }}
			transition={{
				duration: SUCKED_IN_DURATION,
				ease: "easeIn",
			}}
		>
			{/* [svg][text] でSVGを左軸に回転 */}
			<motion.div
				className="flex items-end gap-2"
				initial={{ rotate: 0 }}
				animate={{ rotate: 720 }}
				transition={{
					duration: SUCKED_IN_DURATION,
					ease: "linear",
				}}
				style={{ transformOrigin: "left center" }}
			>
				<div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
					<Image
						src="/svg/charactor/annoying-dinosaur.svg"
						alt="Susum"
						fill
						sizes="64px"
						className="object-contain"
					/>
				</div>
				<div className="shrink-0 mb-1 px-2.5 py-1.5 rounded-xl border border-white bg-white text-black text-[10px] font-medium shadow-sm">
					<Typography variant="body" as="span" font="cherry-bomb-one">
						{SUCKED_IN_MESSAGE}
					</Typography>
				</div>
			</motion.div>
		</motion.div>
	);
}

export function AnnoyingDinosaur() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const forceVisit1Plus = searchParams.get("flow") === "1";
	const isLP = pathname === "/";

	const [phase, setPhase] = useState<"entering" | "idle" | "exiting">(
		"entering",
	);
	const [dialogueIndex, setDialogueIndex] = useState(0);
	const [dialogueMessages, setDialogueMessages] = useState<string[]>(
		DIALOGUE_MESSAGES_VISIT_0,
	);
	const [displayedText, setDisplayedText] = useState("");
	const [isVisible, setIsVisible] = useState(true);
	const [repeatMessageSource, setRepeatMessageSource] = useState<
		"visit1plus" | "returning" | "lp" | null
	>(null);
	const [enterPattern, setEnterPattern] = useState<EnterPattern | null>(null);
	const [enterFrom, setEnterFrom] = useState<"left" | "bottom" | null>(null);
	const [rotateFlowDirection, setRotateFlowDirection] =
		useState<RotateFlowDirection | null>(null);
	const [isSuckedInAftermath, setIsSuckedInAftermath] = useState(false);

	const isInitialNantechatte =
		enterPattern === "nantechatte" && !isSuckedInAftermath;
	const isRotatePattern =
		enterPattern === "rotate-bl-tr" || enterPattern === "rotate-tl-br";
	/** 左下・下から：文言1個のみ（切り替えなし） */
	const isSimplePattern = enterPattern === "left" || enterPattern === "bottom";

	// 描画前に4パターンから1つを選択
	const pickPattern = useCallback(() => {
		const roll = Math.random();
		if (roll < PATTERN_PROBABILITY) {
			setEnterPattern("left");
			setEnterFrom("left");
			setRotateFlowDirection(null);
		} else if (roll < PATTERN_PROBABILITY * 2) {
			setEnterPattern("bottom");
			setEnterFrom("bottom");
			setRotateFlowDirection(null);
		} else if (roll < PATTERN_PROBABILITY * 3) {
			setEnterPattern("rotate-bl-tr");
			setEnterFrom("left");
			setRotateFlowDirection("bl-tr");
		} else if (roll < PATTERN_PROBABILITY * 4) {
			setEnterPattern("rotate-tl-br");
			setEnterFrom("left");
			setRotateFlowDirection("tl-br");
		} else {
			setEnterPattern("nantechatte");
			setEnterFrom(null);
			setRotateFlowDirection(null);
		}
	}, []);

	useLayoutEffect(() => {
		pickPattern();
	}, [pickPattern]);

	useEffect(() => {
		if (enterPattern === "nantechatte" || isSuckedInAftermath) return;
		const initMessages = async () => {
			if (isLP) {
				setDialogueMessages(LP_DINOSAUR_MESSAGES);
				setDialogueIndex(
					Math.floor(Math.random() * LP_DINOSAUR_MESSAGES.length),
				);
				setRepeatMessageSource("lp");
				return;
			}
			const { isPrivate } = await detectIncognito();
			if (isPrivate) {
				setDialogueMessages(DIALOGUE_MESSAGES_INCOGNITO);
			} else {
				const messages = getDialogueMessages();
				markAsVisited();
				incrementVisitCount();
				// 2回目以降向け・ログイン済み向けは配列をそのまま使い、10秒ごとにランダム切り替え＋再登場ループ
				// ?flow=1 で流れアニメーションをテスト可能
				if (forceVisit1Plus || messages === DIALOGUE_MESSAGES_VISIT_1_PLUS) {
					const source = DIALOGUE_MESSAGES_VISIT_1_PLUS;
					setDialogueMessages(source);
					setDialogueIndex(Math.floor(Math.random() * source.length));
					setRepeatMessageSource("visit1plus");
				} else if (messages === DIALOGUE_MESSAGES_RETURNING) {
					setDialogueMessages(messages);
					setDialogueIndex(Math.floor(Math.random() * messages.length));
					setRepeatMessageSource("returning");
				} else {
					setDialogueMessages(messages);
				}
			}
		};
		initMessages();
	}, [enterPattern, isSuckedInAftermath, forceVisit1Plus, isLP]);

	useEffect(() => {
		if (isInitialNantechatte || isRotatePattern || phase !== "entering") return;
		// 入場完了 → 待機
		const enterTimer = setTimeout(() => {
			setPhase("idle");
		}, ENTER_DURATION * 1000);

		return () => clearTimeout(enterTimer);
	}, [phase, isInitialNantechatte, isRotatePattern]);

	useEffect(() => {
		if (
			isInitialNantechatte ||
			isRotatePattern ||
			isSimplePattern ||
			phase !== "idle"
		)
			return;

		// 待機中にセリフを切り替え（10秒ごと・visit1plus/returning向け）
		const dialogueInterval = setInterval(() => {
			setDialogueIndex(Math.floor(Math.random() * dialogueMessages.length));
		}, 10000);

		return () => clearInterval(dialogueInterval);
	}, [
		phase,
		dialogueMessages.length,
		isInitialNantechatte,
		isRotatePattern,
		isSimplePattern,
	]);

	const { play } = useSE();
	// 一文字ずつ表示（喋るスピード感）
	useEffect(() => {
		if (isInitialNantechatte || isRotatePattern || phase !== "idle") return;

		const fullText =
			dialogueMessages[Math.min(dialogueIndex, dialogueMessages.length - 1)] ??
			"";
		setDisplayedText("");

		/** 音を出さない文字（句読点・記号など） */
		const isSilentChar = (c: string) => /^[。、．，….\s「」『』（）]$/.test(c);

		let charIndex = 0;
		const typeInterval = setInterval(() => {
			if (charIndex < fullText.length) {
				const nextChar = fullText[charIndex];
				if (nextChar && !isSilentChar(nextChar)) {
					play("dinosaur");
				}
				setDisplayedText(fullText.slice(0, charIndex + 1));
				charIndex++;
			} else {
				clearInterval(typeInterval);
			}
		}, CHAR_INTERVAL_MS);

		return () => clearInterval(typeInterval);
	}, [
		phase,
		dialogueIndex,
		dialogueMessages,
		isInitialNantechatte,
		isRotatePattern,
	]);

	useEffect(() => {
		if (isInitialNantechatte || isRotatePattern || phase !== "idle") return;

		// 退場開始（回転パターンは常に動き続けるためここには来ない）
		const exitTimer = setTimeout(
			() => {
				setPhase("exiting");
			},
			(isSuckedInAftermath ? IDLE_DURATION_AFTERMATH : IDLE_DURATION) * 1000,
		);

		return () => clearTimeout(exitTimer);
	}, [phase, isInitialNantechatte, isRotatePattern, isSuckedInAftermath]);

	const handleExitComplete = useCallback(() => {
		setIsVisible(false);
		setRotateFlowDirection(null);
		if (repeatMessageSource) {
			const source =
				repeatMessageSource === "visit1plus"
					? DIALOGUE_MESSAGES_VISIT_1_PLUS
					: repeatMessageSource === "returning"
						? DIALOGUE_MESSAGES_RETURNING
						: LP_DINOSAUR_MESSAGES;
			setTimeout(() => {
				setDialogueMessages(source);
				setDialogueIndex(Math.floor(Math.random() * source.length));
				setDisplayedText("");
				pickPattern();
				setPhase("entering");
				setIsVisible(true);
			}, VISIT_1_PLUS_REAPPEAR_DELAY_SEC * 1000);
		}
	}, [repeatMessageSource, pickPattern]);

	useEffect(() => {
		if (isInitialNantechatte || phase !== "exiting" || rotateFlowDirection)
			return;

		// 通常退場（回転パターン以外）の完了後に非表示
		const hideTimer = setTimeout(handleExitComplete, EXIT_DURATION * 1000);

		return () => clearTimeout(hideTimer);
	}, [phase, isInitialNantechatte, rotateFlowDirection, handleExitComplete]);

	// 回転しながら喋ってる（パターン3・4の退場）
	// 回転しながら喋ってる（パターン3・4・常に動き続ける・吸い込まれると同じ）
	if (rotateFlowDirection) {
		const fullText =
			dialogueMessages[Math.min(dialogueIndex, dialogueMessages.length - 1)] ??
			displayedText;
		return (
			<RotateWhileTalkingAnimation
				direction={rotateFlowDirection}
				displayedText={fullText}
				onComplete={handleExitComplete}
			/>
		);
	}

	// なんちゃってパターン（パターン4・吸い込まれる→なんちゃって、てへ）
	if (isInitialNantechatte) {
		return (
			<SuckedInAnimation
				onComplete={() => {
					setIsSuckedInAftermath(true);
					setEnterPattern("bottom");
					setEnterFrom("bottom");
					setDialogueMessages([
						SUCKED_IN_AFTERMATH_MESSAGES[
						Math.floor(Math.random() * SUCKED_IN_AFTERMATH_MESSAGES.length)
						]!,
					]);
					setDialogueIndex(0);
					setDisplayedText("");
					setPhase("entering");
					setIsVisible(true);
				}}
			/>
		);
	}

	if (!isVisible || enterFrom === null) return null;

	const isFromBottom = enterFrom === "bottom";
	/** なんちゃって時：体が半分だけ出る（y: 50% = 自要素の半分上にずらして下半分を隠す） */
	const bottomIdleY = isSuckedInAftermath ? "10%" : 0;
	const initialPos = isFromBottom
		? { x: "-50%", y: "100%" }
		: { x: "-100%", y: 0 };
	const exitPos = isFromBottom
		? { x: "-50%", y: "100%" }
		: { x: "-100%", y: 0 };
	const idlePos = isFromBottom ? { x: "-50%", y: bottomIdleY } : { x: 0, y: 0 };

	return (
		<motion.div
			className={`fixed bottom-0 z-0 flex items-end pointer-events-none ${isFromBottom ? "left-1/2" : "left-0"}`}
			initial={initialPos}
			animate={
				phase === "entering" ? idlePos : phase === "exiting" ? exitPos : idlePos
			}
			transition={{
				duration: phase === "exiting" ? EXIT_DURATION : ENTER_DURATION,
				ease: phase === "exiting" ? "easeIn" : "easeOut",
			}}
		>
			{/* キャラクターと吹き出しを横並び（絶対に被らない） */}
			<div
				className={`flex items-start gap-2 ${isFromBottom ? "min-w-[280px]" : ""}`}
			>
				{/* キャラクター */}
				<div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
					<Image
						src="/svg/charactor/annoying-dinosaur.svg"
						alt="Susum"
						fill
						sizes="64px"
						className="object-contain"
						priority
					/>
				</div>

				{/* 中央から登場時：吹き出しスペースを事前に確保してレイアウトシフトを防ぐ */}
				{isFromBottom && phase === "entering" && (
					<div className="min-w-[200px] shrink-0" aria-hidden />
				)}

				{/* チャット風吹き出し：SVGと被らないよう右側に配置、しっぽは口方向へ */}
				{phase !== "entering" && (
					<motion.div
						className={`shrink-0 mt-2 ${isFromBottom ? "w-[200px] min-w-[200px]" : "min-w-[80px] max-w-[400px]"}`}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.4, delay: 0.2 }}
					>
						<div className="relative px-2.5 py-1.5 rounded-xl border border-white bg-white text-black text-[10px] font-medium shadow-sm">
							<Typography
								variant="body"
								as="span"
								font="cherry-bomb-one"
								className="tracking-wide"
							>
								{displayedText}
								{displayedText.length <
									(
										dialogueMessages[
										Math.min(dialogueIndex, dialogueMessages.length - 1)
										] ?? ""
									).length && (
										<span
											className="inline-block w-0.5 h-3 ml-0.5 bg-current animate-pulse"
											aria-hidden
										/>
									)}
							</Typography>
							{/* 口方向へのしっぽ（吹き出しの左からキャラへ向かう） */}
							<div
								className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-white"
								aria-hidden
							/>
						</div>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
}
