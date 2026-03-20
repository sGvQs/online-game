import { ReactNode } from "react";
import { gameLayout } from "./styles";
import { JankenPhase } from "@/types";
import { motion } from "framer-motion";

interface GameLayoutProps {
	phase: JankenPhase;
	error: string | null;
	children: ReactNode; // Expecting Main Area and Side Area or other content
	mainArea?: ReactNode;
	sideArea?: ReactNode;
	hostName: string;
}

export function GameLayout({
	phase,
	error,
	children,
	mainArea,
	sideArea,
	hostName,
}: GameLayoutProps) {
	const styles = gameLayout();

	const getPhaseText = (p: JankenPhase) => {
		switch (p) {
			case "DEAL":
				return `PREPARING`;
			case "CHOICE":
				return `HOST CHOICE`;
			case "BATTLE":
				return `BATTLE`;
			case "RESULT":
				return "RESULT";
			case "GAME_OVER":
				return "GAME OVER";
			default:
				return "";
		}
	};

	// If mainArea and sideArea are provided, use them in the grid.
	// Otherwise render children directly (for flexibility).
	const content =
		mainArea || sideArea ? (
			<>
				{mainArea}
				{sideArea}
			</>
		) : (
			children
		);

	return (
		<div className={styles.container()}>
			{/* エラー表示 */}
			{error && (
				<div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-8 py-4 border-[3px] border-[#FF4444] font-bold tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center gap-4">
					<span className="text-2xl">⚠️</span>
					<span>{error}</span>
				</div>
			)}

			<div className={styles.gameGrid()}>
				<motion.div
					className={styles.phaseBox()}
					layout
					transition={{ duration: 0.3 }}
				>
					<h2 className="text-3xl font-black text-[#FF4444] mb-6 text-center tracking-[0.2em] uppercase drop-shadow-[2px_2px_0_rgba(255,0,0,0.3)]">
						{getPhaseText(phase)}
					</h2>
				</motion.div>
				{content}
			</div>
		</div>
	);
}
