"use client";

import {
	Keyboard,
	MousePointerClick,
	RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useHomeAmmo } from "@/lib/home-ammo-context";

const iconClass = "size-3.5 shrink-0 text-slate-200/90";

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

	return (
		<div className="w-full pointer-events-none opacity-85">
			<span className="sr-only">
				赤い球はキーボード、黄色い球はクリック、スペースキーで弾をリロード
			</span>
			<div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
				<span className={segmentFrame}>
					<span
						className="h-1.5 w-5 shrink-0 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"
						aria-hidden
					/>
					<Keyboard className={iconClass} strokeWidth={2} aria-hidden />
				</span>
				<span className={segmentFrame}>
					<span
						className="h-1.5 w-5 shrink-0 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.55)]"
						aria-hidden
					/>
					<MousePointerClick className={iconClass} strokeWidth={2} aria-hidden />
				</span>
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
