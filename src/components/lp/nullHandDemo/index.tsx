"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChoicePhase } from "@/components/game/phases/nullHandGame/choicePhase";
import { BattlePhase } from "@/components/game/phases/nullHandGame/battlePhase";
import { ResultPhase } from "@/components/game/phases/nullHandGame/resultPhase";
import { HandType } from "@/types";
import { nullHandDemo } from "./styles";
import { Typography } from "@/components/ui/typography";
import { judgeHand } from "@/utils/nullHandGame";
import type {
	JankenEventWithGuests,
	HostStats,
	MatchScoreWithUser,
	RoomUserWithUser,
} from "@/types";

// 開発者の手の組み合わせ（3種類からランダムに選ぶ）
const HAND_PAIRS: [HandType, HandType][] = [
	[HandType.ROCK, HandType.PAPER],
	[HandType.ROCK, HandType.SCISSORS],
	[HandType.PAPER, HandType.SCISSORS],
];

function createMockEvent(): JankenEventWithGuests {
	const [real, bluff] =
		HAND_PAIRS[Math.floor(Math.random() * HAND_PAIRS.length)]!;
	return {
		id: "lp-demo-event",
		matchId: "lp-demo-match",
		currentHostId: "2",
		turnNumber: 1,
		phase: "CHOICE",
		systemRealHand: real,
		systemBluffHand: bluff,
		hostChoice: null,
		finalHostHand: null,
		match: {
			id: "lp-demo-match",
			roomId: "lp-demo-room",
			gameType: "NULL_HAND",
			status: "CHOICE",
			winnerId: null,
			createdAt: new Date(),
			currentTurnIndex: 1,
			totalTurns: 1,
		},
		guestHands: [],
	} as JankenEventWithGuests;
}

function getRandomReverseRate(): number {
	return Math.floor(Math.random() * 21) + 60; // 60〜80
}

function useMockHostStats(): HostStats {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	return useMemo(
		() => ({
			reverseRate: mounted ? getRandomReverseRate() : 60,
			totalHostCount: 5,
		}),
		[mounted],
	);
}

const INITIAL_SCORES: MatchScoreWithUser[] = [
	{
		id: "ms-1",
		userId: "1",
		points: 0,
		turnOrder: 0,
		matchId: "lp-demo-match",
		createdAt: new Date(),
		user: {
			id: "1",
			name: "あなた",
			email: "demo@example.com",
			comment: null,
			faceIcon: "BOY_FACE",
			createdAt: new Date(),
		},
	},
	{
		id: "ms-2",
		userId: "2",
		points: 0,
		turnOrder: 1,
		matchId: "lp-demo-match",
		createdAt: new Date(),
		user: {
			id: "2",
			name: "開発者",
			email: "demo@example.com",
			comment: null,
			faceIcon: "LADY_FACE",
			createdAt: new Date(),
		},
	},
	{
		id: "ms-12",
		userId: "12",
		points: 0,
		turnOrder: 2,
		matchId: "lp-demo-match",
		createdAt: new Date(),
		user: {
			id: "12",
			name: "あなたの友達",
			email: "demo@example.com",
			comment: null,
			faceIcon: "BOY_FACE",
			createdAt: new Date(),
		},
	},
];

const mockRoomUsers: RoomUserWithUser[] = [
	{
		userId: "1",
		roomId: "lp-demo-room",
		turnOrder: 0,
		isReady: false,
		createdAt: new Date(),
		user: {
			id: "1",
			name: "あなた",
			email: "demo@example.com",
			comment: null,
			faceIcon: "BOY_FACE",
			createdAt: new Date(),
		},
	},
	{
		userId: "2",
		roomId: "lp-demo-room",
		turnOrder: 1,
		isReady: false,
		createdAt: new Date(),
		user: {
			id: "2",
			name: "開発者",
			email: "demo@example.com",
			comment: null,
			faceIcon: "LADY_FACE",
			createdAt: new Date(),
		},
	},
	{
		userId: "12",
		roomId: "lp-demo-room",
		turnOrder: 2,
		isReady: false,
		createdAt: new Date(),
		user: {
			id: "12",
			name: "あなたの友達",
			email: "demo@example.com",
			comment: null,
			faceIcon: "BOY_FACE",
			createdAt: new Date(),
		},
	},
] as unknown as RoomUserWithUser[];

type DemoPhase = "choice" | "battle" | "result";

/** ChoicePhase 内部アニメーション完了まで約9秒 + 余裕を持って12秒 */
const BATTLE_TRIGGER_MS = 12000;

/**
 * リザルト用 JankenEvent を組み立てる。
 *
 * ゲームロジック（LP デモ仕様）:
 *   開発者の持ち手は毎回ランダムな2択。
 *
 *   - 開発者が持っていない手を選んだ → ゲストの勝ち（HOST_WIN になる手を finalHostHand に）
 *   - 開発者が持っている手を選んだ  → NULL HAND（全員 DRAW、guestCount > 1 で判定）
 */
function buildResultEvent(
	base: JankenEventWithGuests,
	userHand: HandType,
): JankenEventWithGuests {
	const devHands = [
		base.systemRealHand as HandType,
		base.systemBluffHand as HandType,
	];
	const isUserWin = !devHands.includes(userHand);

	// ゲスト勝ち：開発者の手のうち userHand に負ける手を finalHostHand にする（GUEST_WIN = ホスト負け）
	const losingHostHand =
		devHands.find((h) => judgeHand(h, userHand) === "GUEST_WIN") ??
		devHands[0]!;
	const finalHostHand = isUserWin ? losingHostHand : userHand; // DRAW → NULL HAND

	const makeGuestHand = (userId: string, hand: HandType) =>
		({
			id: `gh-${userId}`,
			jankenEventId: base.id,
			userId,
			hand,
			isConfirmed: true,
			createdAt: new Date(),
			user: mockRoomUsers.find((u) => u.userId === userId)?.user ?? null,
		}) as JankenEventWithGuests["guestHands"][number];

	// NULL HAND 判定には guestCount > 1 が必要なので、負け時は架空のゲストも追加
	const guestHands = isUserWin
		? [makeGuestHand("1", userHand)]
		: [makeGuestHand("1", userHand), makeGuestHand("12", userHand)];

	return {
		...base,
		finalHostHand,
		hostChoice: "STAY",
		guestHands,
	};
}

export function NullHandDemo() {
	const styles = nullHandDemo();
	const mockHostStats = useMockHostStats();
	const sectionRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasTriggeredRef = useRef(false);
	const isInitialChoiceRef = useRef(true);

	const [demoPhase, setDemoPhase] = useState<DemoPhase>("choice");
	const [baseEvent, setBaseEvent] = useState<JankenEventWithGuests>(() =>
		createMockEvent(),
	);
	const [selectedHand, setSelectedHand] = useState<HandType | null>(null);
	const [resultEvent, setResultEvent] = useState<JankenEventWithGuests | null>(
		null,
	);
	const [scores, setScores] = useState<MatchScoreWithUser[]>(INITIAL_SCORES);

	// Battle 用 JankenEvent（finalHostHand なし・手の種類だけ表示）
	const battleEvent = useMemo<JankenEventWithGuests>(
		() => ({ ...baseEvent, phase: "BATTLE" }) as JankenEventWithGuests,
		[baseEvent],
	);

	// IntersectionObserver：初回表示時にセクションが見えてから BATTLE_TRIGGER_MS 後に BATTLE へ
	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (!entry?.isIntersecting || hasTriggeredRef.current) return;

				hasTriggeredRef.current = true;
				timerRef.current = setTimeout(() => {
					isInitialChoiceRef.current = false;
					setDemoPhase("battle");
				}, BATTLE_TRIGGER_MS);
			},
			{ threshold: 0.3 },
		);

		observer.observe(el);
		return () => {
			observer.disconnect();
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	// リトライで choice に戻ったとき、BATTLE_TRIGGER_MS 後に自動で battle へ
	useEffect(() => {
		if (isInitialChoiceRef.current || demoPhase !== "choice") return;

		timerRef.current = setTimeout(() => {
			setDemoPhase("battle");
		}, BATTLE_TRIGGER_MS);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [demoPhase]);

	const handleBattle = useCallback(() => {
		if (!selectedHand) return;
		const event = buildResultEvent(baseEvent, selectedHand);

		// ポイント加算：開発者が持っていない手 → ユーザー +3、持っている手 → NULL HAND → 開発者 +5
		const devHands = [
			baseEvent.systemRealHand as HandType,
			baseEvent.systemBluffHand as HandType,
		];
		const isUserWin = !devHands.includes(selectedHand);
		setScores((prev) =>
			prev.map((s) => {
				if (isUserWin && s.userId === "1") {
					return { ...s, points: s.points + 3 };
				}
				if (!isUserWin && s.userId === "2") {
					return { ...s, points: s.points + 5 };
				}
				return s;
			}),
		);

		setResultEvent(event);
		setDemoPhase("result");
	}, [selectedHand, baseEvent]);

	const handleRetry = useCallback(async () => {
		setBaseEvent(createMockEvent());
		setSelectedHand(null);
		setResultEvent(null);
		setDemoPhase("choice");
	}, []);

	const phaseLabel =
		demoPhase === "choice"
			? "HOST CHOICE"
			: demoPhase === "battle"
				? "BATTLE"
				: "RESULT";

	return (
		<div
			ref={sectionRef}
			className="bg-black text-white overflow-visible flex items-center justify-center p-4 md:p-6 relative"
		>
			<div
				className={cn(
					styles.gameGrid(),
					"scale-[0.85] origin-center md:scale-90 lg:scale-95",
				)}
			>
				<div className={styles.phaseBox()}>
					<Typography
						variant="h2"
						font="sans"
						className="font-black text-[#FF4444] tracking-[0.2em] uppercase"
					>
						{phaseLabel}
					</Typography>
				</div>

				{demoPhase === "choice" && (
					<ChoicePhase
						jankenEvent={baseEvent}
						hostStats={mockHostStats}
						isCurrentHost={false}
						isProcessing={false}
						onChoice={async () => {}}
						hostName="開発者"
						hostFaceIcon="LADY_FACE"
						currentScores={scores}
						currentUserId="1"
						userColor="#FFFFFF"
					/>
				)}

				{demoPhase === "battle" && (
					// aspect-square なボタン内で Hand3D(150px固定高) がはみ出すため overflow-hidden でクリップ
					// [&_.aspect-square>.absolute.bottom-4] でグー/チョキ/パーのラベルを非表示
					<div className="contents [&_.aspect-square]:overflow-hidden [&_.aspect-square>.absolute.bottom-4]:hidden">
						<BattlePhase
							jankenEvent={battleEvent}
							hostStats={mockHostStats}
							isCurrentHost={false}
							selectedHand={selectedHand}
							isProcessing={false}
							onSelectHand={setSelectedHand}
							onSubmit={handleBattle}
							hostName="開発者"
							hostFaceIcon="LADY_FACE"
							currentScores={scores}
							currentUserId="1"
							userColor="#FFFFFF"
						/>
					</div>
				)}

				{demoPhase === "result" && resultEvent && (
					<ResultPhase
						jankenEvent={resultEvent}
						currentScores={scores}
						isProcessing={false}
						onNextRound={handleRetry}
						hostName="開発者"
						currentUserId="1"
						isCurrentHost={false}
						roomUsers={mockRoomUsers}
						userColor="#FFFFFF"
					/>
				)}
			</div>
		</div>
	);
}
