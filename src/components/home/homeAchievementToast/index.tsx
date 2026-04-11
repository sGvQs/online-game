"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type HomeAchievementToastProps = {
	open: boolean;
	message: string;
	onDismiss: () => void;
	/** 表示してから自動で閉じるまでの ms */
	autoHideMs?: number;
	/** "danger": 検出（red）/ "warning": 警告（amber）/ "success": 完了（green） */
	variant?: "danger" | "warning" | "success";
};

export function HomeAchievementToast({
	open,
	message,
	onDismiss,
	autoHideMs = 4500,
	variant = "success",
}: HomeAchievementToastProps) {
	useEffect(() => {
		if (!open || !autoHideMs) return;
		const id = window.setTimeout(onDismiss, autoHideMs);
		return () => window.clearTimeout(id);
	}, [open, onDismiss, autoHideMs]);

	const borderBg =
		variant === "danger"
			? "border-red-500/50 bg-red-950/80"
			: variant === "warning"
				? "border-amber-400/50 bg-amber-950/80"
				: "border-green-500/40 bg-green-950/80";

	const icon =
		variant === "danger" ? "⚠" : variant === "warning" ? "⚠" : "✓";

	const isPulsing = variant === "danger" || variant === "warning";

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					role="status"
					aria-live="polite"
					className={[
						"pointer-events-none fixed top-4 left-1/2 z-100 -translate-x-1/2",
						"max-w-[min(90vw,24rem)] rounded-lg border px-4 py-3",
						"text-center text-sm text-white shadow-lg backdrop-blur-sm",
						borderBg,
					].join(" ")}
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: -12, opacity: 0 }}
					transition={{ type: "spring", stiffness: 380, damping: 28 }}
				>
					{isPulsing ? (
						<motion.span
							className="inline-block whitespace-pre-line"
							animate={{ opacity: [1, 0.3, 1] }}
							transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
						>
							{icon} {message}
						</motion.span>
					) : (
						<span className="whitespace-pre-line">{icon} {message}</span>
					)}
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
