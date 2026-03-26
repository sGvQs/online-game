"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLoading } from "@/lib/loading-context";
import { loadingOverlay } from "./styles";

const DOT_COUNT = 3;

export function LoadingOverlay() {
	const { isLoading } = useLoading();
	const styles = loadingOverlay();

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					className={styles.overlay()}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<div className={styles.dots()}>
						{Array.from({ length: DOT_COUNT }).map((_, i) => (
							<motion.span
								key={i}
								className={styles.dot()}
								animate={{ y: [0, -14, 0], opacity: [0.4, 1, 0.4] }}
								transition={{
									duration: 0.7,
									repeat: Infinity,
									delay: i * 0.15,
									ease: "easeInOut",
								}}
							/>
						))}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
