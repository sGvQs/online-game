"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { BulletAnim, MeteorBulletType } from "@/types";

interface TutorialOverlayProps {
	cursorX: number;
	cursorY: number;
	bulletAnims: BulletAnim[];
	ammoRemaining: number;
	bulletType: MeteorBulletType;
	destroyedCount: number;
	totalSpawnCount: number;
	onUnlockSpawn: () => void;
}

const STEPS = [
	{ id: "CURSOR", text: "カーソルを動かして、隕石に照準を合わせよう" },
	{ id: "SHOOT",  text: "任意のキーを押して隕石を撃とう！" },
	{ id: "AMMO",   text: "弾は12発まで持てる。なくなったら…" },
	{ id: "COLOR",  text: "クリックで弾の色が変わる！隕石の色に合わせよう" },
	{ id: "MATCH",  text: "色が一致すると1〜2発で倒せる！不一致は25分の1のダメージ" },
	{ id: "GOAL",   text: "恐竜に届く前に撃破しよう！撃破率80%以上でクリア！" },
] as const;

type StepState = "HINT" | "CLEARED";

export function TutorialOverlay({
	cursorX,
	cursorY,
	bulletAnims,
	ammoRemaining,
	bulletType,
	destroyedCount,
	totalSpawnCount,
	onUnlockSpawn,
}: TutorialOverlayProps) {
	const [step, setStep] = useState(0);
	const [stepState, setStepState] = useState<StepState>("HINT");

	// カーソル初期値を記録（-100,-100 からの変化を無視するため）
	const initialCursorRef = useRef<{ x: number; y: number } | null>(null);
	const prevAmmoRef = useRef(ammoRemaining);
	const prevTypeRef = useRef(bulletType);
	const prevDestroyedRef = useRef(destroyedCount);
	const advancingRef = useRef(false); // 多重起動防止

	const advance = useCallback((nextStep: number) => {
		if (advancingRef.current) return;
		advancingRef.current = true;
		setStepState("CLEARED");
		// ステップ4（MATCH）開始時に隕石スポーン開放（倒すことが進行条件なので、始まる時に出す）
		if (nextStep === 4) onUnlockSpawn();
		setTimeout(() => {
			setStep(nextStep);
			setStepState("HINT");
			advancingRef.current = false;
		}, 800);
	}, [onUnlockSpawn]);

	// CURSOR → SHOOT: 初回カーソル移動（初期値からの変化を検出）
	useEffect(() => {
		if (step !== 0 || stepState !== "HINT") return;
		if (initialCursorRef.current === null) {
			initialCursorRef.current = { x: cursorX, y: cursorY };
			return;
		}
		if (cursorX !== initialCursorRef.current.x || cursorY !== initialCursorRef.current.y) {
			advance(1);
		}
	}, [cursorX, cursorY, step, stepState, advance]);

	// SHOOT → AMMO: 初回射撃
	useEffect(() => {
		if (step !== 1 || stepState !== "HINT") return;
		if (bulletAnims.length > 0) advance(2);
	}, [bulletAnims.length, step, stepState, advance]);

	// AMMO → COLOR: ammoRemaining が増加（リロード検出）
	useEffect(() => {
		if (step !== 2) { prevAmmoRef.current = ammoRemaining; return; }
		if (stepState !== "HINT") { prevAmmoRef.current = ammoRemaining; return; }
		if (ammoRemaining > prevAmmoRef.current) advance(3);
		prevAmmoRef.current = ammoRemaining;
	}, [ammoRemaining, step, stepState, advance]);

	// COLOR → MATCH: bulletType が変化（クリック検出）
	useEffect(() => {
		if (step !== 3) { prevTypeRef.current = bulletType; return; }
		if (stepState !== "HINT") { prevTypeRef.current = bulletType; return; }
		if (bulletType !== prevTypeRef.current) advance(4);
		prevTypeRef.current = bulletType;
	}, [bulletType, step, stepState, advance]);

	// MATCH → GOAL: destroyedCount が増加（初破壊）
	useEffect(() => {
		if (step !== 4) { prevDestroyedRef.current = destroyedCount; return; }
		if (stepState !== "HINT") { prevDestroyedRef.current = destroyedCount; return; }
		if (destroyedCount > prevDestroyedRef.current) advance(5);
		prevDestroyedRef.current = destroyedCount;
	}, [destroyedCount, step, stepState, advance]);

	const currentStep = STEPS[step];
	if (!currentStep) return null;

	const isAmmoEmpty = step === 2 && ammoRemaining === 0 && stepState === "HINT";
	const remaining = Math.max(0, totalSpawnCount - destroyedCount);
	const isGoal = step === 5;
	const displayText = isGoal
		? `隕石をなるべく全て破壊しよう。残り ${remaining} 個`
		: isAmmoEmpty
			? "スペースキーでリロード！"
			: currentStep.text;
	const isCleared = stepState === "CLEARED";

	return (
		<div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
			<AnimatePresence mode="wait">
				{isCleared ? (
					<motion.div
						key={`cleared-${step}`}
						initial={{ opacity: 0, scale: 0.85 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.1 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap"
						style={{
							background: "rgba(16,185,129,0.2)",
							border: "1px solid rgba(16,185,129,0.6)",
							backdropFilter: "blur(8px)",
							boxShadow: "0 0 24px rgba(16,185,129,0.3)",
						}}
					>
						<motion.span
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.05 }}
							className="text-lg"
						>
							✓
						</motion.span>
						<span className="font-dot-gothic-16 text-sm text-emerald-300">
							クリア！
						</span>
					</motion.div>
				) : (
					<motion.div
						key={`hint-${step}-${isAmmoEmpty}`}
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="flex items-center gap-3 px-5 py-3 rounded-2xl whitespace-nowrap"
						style={{
							background: "rgba(15,23,42,0.85)",
							border: isAmmoEmpty
								? "1px solid rgba(248,113,113,0.6)"
								: "1px solid rgba(129,140,248,0.3)",
							backdropFilter: "blur(8px)",
							boxShadow: isAmmoEmpty
								? "0 0 16px rgba(248,113,113,0.25)"
								: "0 0 16px rgba(129,140,248,0.15)",
						}}
					>
						<Image
							src="/svg/object/metor.svg"
							alt=""
							width={18}
							height={18}
							className="shrink-0 opacity-80"
						/>
						<span
							className="font-dot-gothic-16 text-sm"
							style={{ color: isAmmoEmpty ? "#f87171" : "rgba(255,255,255,0.9)" }}
						>
							{displayText}
						</span>
						{!isGoal && (
							<span className="text-xs ml-2 shrink-0 tabular-nums" style={{ color: "rgba(129,140,248,0.5)" }}>
								{step + 1} / {STEPS.length}
							</span>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
