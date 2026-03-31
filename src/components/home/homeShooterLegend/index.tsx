"use client";

import {
	Keyboard,
	MousePointerClick,
	RotateCcw,
	type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useHomeAmmo } from "@/lib/home-ammo-context";
import {
	HOME_SHOOTER_LEGEND_ORDER,
	HOME_SHOOTER_MODES,
	type HomeShooterModeKey,
} from "@/lib/home-shooter-config";

const iconClass = "size-3.5 shrink-0 text-slate-200/90";

const LEGEND_INPUT_ICONS: Record<
	(typeof HOME_SHOOTER_MODES)[HomeShooterModeKey]["legendInput"],
	LucideIcon
> = {
	keyboard: Keyboard,
	mouse: MousePointerClick,
};

const segmentFrame =
	"inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/85 backdrop-blur-md shadow-md px-2 py-1 text-xs";

const reloadSegmentPulseWeak =
	"0 4px 6px -1px rgba(0,0,0,0.12), 0 2px 4px -2px rgba(0,0,0,0.08), 0 0 12px rgba(255,255,255,0.12)";

const reloadSegmentPulseStrong =
	"0 4px 6px -1px rgba(0,0,0,0.12), 0 2px 4px -2px rgba(0,0,0,0.08), 0 0 26px rgba(255,255,255,0.38)";

const reloadSegmentFrame =
	"inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/85 backdrop-blur-md px-2 py-1 text-xs";

function ReloadSegmentContent() {
	return (
		<>
			<RotateCcw className={iconClass} strokeWidth={2} aria-hidden />
			<kbd className="rounded border border-white/20 bg-slate-900/50 px-1 py-px font-mono text-[10px] text-slate-200/90 leading-none">
				Space
			</kbd>
		</>
	);
}

export function HomeShooterLegend() {
	const ammoCtx = useHomeAmmo();
	const isAmmoEmpty = ammoCtx !== undefined && ammoCtx.ammo < 1;

	const a11ySummary = [
		...HOME_SHOOTER_LEGEND_ORDER.map(
			(key) => HOME_SHOOTER_MODES[key].a11yBulletLabel,
		),
		"スペースキーで弾をリロード",
	].join("、");

	return (
		<div className="w-full pointer-events-none opacity-85">
			<span className="sr-only">{a11ySummary}</span>
			<div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
				{HOME_SHOOTER_LEGEND_ORDER.map((modeKey) => {
					const cfg = HOME_SHOOTER_MODES[modeKey];
					const Icon = LEGEND_INPUT_ICONS[cfg.legendInput];
					return (
						<span key={modeKey} className={segmentFrame}>
							<span
								className={cfg.legendChipClassName}
								aria-hidden
							/>
							<Icon className={iconClass} strokeWidth={2} aria-hidden />
						</span>
					);
				})}
				{isAmmoEmpty ? (
					<motion.span
						className={reloadSegmentFrame}
						initial={false}
						animate={{
							y: [0, -2.5, 0],
							boxShadow: [
								reloadSegmentPulseWeak,
								reloadSegmentPulseStrong,
								reloadSegmentPulseWeak,
							],
						}}
						transition={{
							duration: 2.2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						<ReloadSegmentContent />
					</motion.span>
				) : (
					<span className={segmentFrame}>
						<ReloadSegmentContent />
					</span>
				)}
			</div>
		</div>
	);
}
