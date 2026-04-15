"use client";

import { motion } from "framer-motion";
import { Keyboard, MousePointerClick, RotateCcw } from "lucide-react";

interface ShooterAmmoHudProps {
	ammo: number;
	ammoMax: number;
	/** アクティブな pill の色（弾種に合わせる）。CSS color 値 */
	activeColor: string;
	/** 次の弾種の色。CSS color 値 */
	nextColor: string;
	/** 2つ先の弾種の色。CSS color 値 */
	nextNextColor: string;
}

const segmentFrame =
	"inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/85 backdrop-blur-md px-2 py-1 text-xs text-slate-200/90";

const reloadPulseWeak =
	"0 4px 6px -1px rgba(0,0,0,0.12),0 0 12px rgba(255,255,255,0.12)";
const reloadPulseStrong =
	"0 4px 6px -1px rgba(0,0,0,0.12),0 0 26px rgba(255,255,255,0.38)";

/**
 * HOME 緊急モードと同じ弾数バー + 操作説明 HUD。
 * ammoMax 個の pill を横並びで表示し、弾切れ時はリロード案内をパルス。
 */
export function ShooterAmmoHud({ ammo, ammoMax, activeColor, nextColor, nextNextColor }: ShooterAmmoHudProps) {
	const isEmpty = ammo < 1;

	return (
		<motion.div
			className="flex flex-col items-center gap-2"
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ type: "spring", stiffness: 320, damping: 32 }}
		>

			{/* 弾数バー */}
			<div className="flex flex-wrap justify-center gap-1" aria-hidden>
				{Array.from({ length: ammoMax }, (_, i) => (
					<span
						key={i}
						className="w-1.5 h-6 rounded-full shrink-0 transition-all duration-150"
						style={
							i < ammo
								? { backgroundColor: activeColor, boxShadow: `0 0 4px ${activeColor}99` }
								: { backgroundColor: "rgba(255,255,255,0.15)" }
						}
					/>
				))}
			</div>

			{/* 操作説明 */}
			<div className="flex flex-wrap justify-center gap-1.5">
				<span className={segmentFrame}>
					<span
						className="w-2 h-2 rounded-full shrink-0"
						style={{ backgroundColor: activeColor, boxShadow: `0 0 4px ${activeColor}` }}
						aria-hidden
					/>
					<Keyboard className="size-3.5 shrink-0 text-slate-200/90" strokeWidth={2} aria-hidden />
				</span>
				<span className={segmentFrame}>
					<span
						className="w-2 h-2 rounded-full shrink-0"
						style={{ backgroundColor: nextColor, boxShadow: `0 0 4px ${nextColor}` }}
						aria-hidden
					/>
					<MousePointerClick className="size-3.5 shrink-0 text-slate-200/90" strokeWidth={2} aria-hidden />
				</span>
				<span className={segmentFrame}>
					<span
						className="w-2 h-2 rounded-full shrink-0"
						style={{ backgroundColor: nextNextColor, boxShadow: `0 0 4px ${nextNextColor}` }}
						aria-hidden
					/>
					<MousePointerClick className="size-3.5 shrink-0 text-slate-200/90" strokeWidth={2} aria-hidden />
					<MousePointerClick className="size-3.5 shrink-0 text-slate-200/90" strokeWidth={2} aria-hidden />
				</span>
				{isEmpty ? (
					<motion.span
						className={segmentFrame}
						animate={{
							y: [0, -2.5, 0],
							boxShadow: [reloadPulseWeak, reloadPulseStrong, reloadPulseWeak],
						}}
						transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
					>
						<RotateCcw className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
						<kbd className="rounded border border-white/20 bg-slate-900/50 px-1 py-px font-mono text-[10px] leading-none">
							Space
						</kbd>
					</motion.span>
				) : (
					<span className={segmentFrame}>
						<RotateCcw className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
						<kbd className="rounded border border-white/20 bg-slate-900/50 px-1 py-px font-mono text-[10px] leading-none">
							Space
						</kbd>
					</span>
				)}
			</div>
		</motion.div>
	);
}
