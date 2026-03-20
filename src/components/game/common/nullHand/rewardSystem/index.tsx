import { SideHeader } from "@/components/game/common/nullHand/sideHeader";
import { rewardSystem } from "./styles";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RewardSystemProps {
	isHost?: boolean;
	userColor?: string;
	variant?: "cyan" | "red";
	size?: "sm" | "md" | "lg";
	showArrow?: boolean;
}

export function RewardSystem({
	isHost = false,
	userColor = "#44FFFF",
	variant = "red",
	size = "md",
	showArrow = true,
}: RewardSystemProps) {
	const rules = [
		{
			title: "NULL HAND",
			desc: "全員があいこ",
			show: true,
			pts: "+5",
			target: "HOST",
			color: "#FF4444",
		},
		{
			title: "GUEST WIN",
			desc: "ホストに勝利",
			show: true,
			pts: "+3",
			target: "GUEST",
			color: "#44FFFF",
		},
		{
			title: "HOST PERFECT",
			desc: "ゲスト全員を撃破",
			show: true,
			pts: "+3",
			target: "HOST",
			color: "#FF4444",
		},
	];

	return (
		<div className={rewardSystem({ variant, size }).card()}>
			<SideHeader
				engLabel="REWARD SYSTEM"
				label="ポイント配当"
				variant={variant}
				className={
					variant === "red" ? "border-[#FF4444]/30" : "border-[#44FFFF]/30"
				}
				compact
			/>
			<div className="mt-4 space-y-4">
				{rules.map((item) => {
					const isMyTarget =
						(isHost && item.target === "HOST") ||
						(!isHost && item.target === "GUEST");

					return (
						item.show && (
							<div
								key={item.title}
								className={cn(
									"group relative transition-opacity duration-300",
									!isMyTarget && item.target !== "ALL"
										? "opacity-70"
										: "opacity-100",
								)}
								style={{ ["--rule-color" as string]: item.color }}
							>
								<div className="flex items-center justify-between mb-1">
									<div className="flex items-center gap-2">
										<div className="relative w-1 h-3">
											<div className={rewardSystem().ruleDot()} />
											{showArrow && isMyTarget && (
												<motion.div
													initial={{ opacity: 0, x: -5 }}
													animate={{
														opacity: [0.4, 1, 0.4],
														x: -8,
													}}
													transition={{
														opacity: {
															repeat: Infinity,
															duration: 1.5,
															ease: "easeInOut",
														},
													}}
													className={rewardSystem().ruleArrow()}
													style={{ ["--rule-color" as string]: userColor }}
												>
													▶
												</motion.div>
											)}
										</div>
										<span
											className={cn(
												"text-[10px] font-black tracking-widest font-sans transition-colors",
												isMyTarget ? "text-white" : "text-white/70",
											)}
										>
											{item.title}
										</span>
									</div>
									<div
										className={cn(
											"flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border transition-all",
											isMyTarget
												? isHost
													? "border-[#FF4444]/50 shadow-[0_0_10px_rgba(255,68,68,0.2)]"
													: "border-[#44FFFF]/50 shadow-[0_0_10px_rgba(68,255,255,0.2)]"
												: "border-white/5",
										)}
									>
										<span
											className={cn(
												"text-[8px] font-bold uppercase tracking-tighter",
												isMyTarget
													? isHost
														? "text-[#FF4444] animate-pulse"
														: "text-[#44FFFF] animate-pulse"
													: "text-white/90",
											)}
										>
											{item.target}
										</span>
										<span className={rewardSystem().rulePts()}>
											{item.pts}
											<span className="text-[8px] ml-0.5 opacity-70">PT</span>
										</span>
									</div>
								</div>
								<div className="text-[9px] text-white/50 font-bold pl-3 leading-tight tracking-tight">
									{item.desc}
								</div>
							</div>
						)
					);
				})}
			</div>
		</div>
	);
}
