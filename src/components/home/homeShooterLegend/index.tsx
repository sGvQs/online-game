"use client";

import {
	Keyboard,
	MousePointerClick,
	RotateCcw,
} from "lucide-react";

const iconClass = "size-3.5 shrink-0 text-slate-200/90";

export function HomeShooterLegend() {
	return (
		<div
			className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs pointer-events-none opacity-85"
		>
			<span className="sr-only">
				赤い球はキーボード、黄色い球はクリック、スペースキーで弾をリロード
			</span>
			<span className="inline-flex items-center gap-1.5">
				<span
					className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"
					aria-hidden
				/>
				<Keyboard className={iconClass} strokeWidth={2} aria-hidden />
			</span>
			<span className="text-white/25 select-none" aria-hidden>
				|
			</span>
			<span className="inline-flex items-center gap-1.5">
				<span
					className="h-2 w-2 shrink-0 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.55)]"
					aria-hidden
				/>
				<MousePointerClick className={iconClass} strokeWidth={2} aria-hidden />
			</span>
			<span className="text-white/25 select-none" aria-hidden>
				|
			</span>
			<span className="inline-flex items-center gap-1.5">
				<RotateCcw className={iconClass} strokeWidth={2} aria-hidden />
				<kbd className="rounded border border-white/20 bg-slate-900/50 px-1 py-px font-mono text-[10px] text-slate-200/90 leading-none">
					Space
				</kbd>
			</span>
		</div>
	);
}
