"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type HomeAchievementToastProps = {
	open: boolean;
	message: string;
	onDismiss: () => void;
	/** 表示してから自動で閉じるまでの ms */
	autoHideMs?: number;
};

export function HomeAchievementToast({
	open,
	message,
	onDismiss,
	autoHideMs = 4500,
}: HomeAchievementToastProps) {
	useEffect(() => {
		if (!open) return;
		const id = window.setTimeout(onDismiss, autoHideMs);
		return () => window.clearTimeout(id);
	}, [open, onDismiss, autoHideMs]);

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					role="status"
					aria-live="polite"
					className="pointer-events-none fixed top-4 left-1/2 z-100 max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-lg border border-white/20 bg-zinc-900/90 px-4 py-3 text-center text-sm text-white shadow-lg backdrop-blur-sm"
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: -12, opacity: 0 }}
					transition={{ type: "spring", stiffness: 380, damping: 28 }}
				>
					{message}
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
