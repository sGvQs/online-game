import { MatchScoreWithUser } from "@/types";
import { SideHeader } from "@/components/game/common/nullHand/sideHeader";
import { currentScores as currentScoresStyles } from "./styles";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { PlayerFaceIcon } from "@/components/game/common/nullHand/playerFaceIcon";

interface CurrentScoresProps {
	currentScores: MatchScoreWithUser[];
	currentUserId: string;
	hostId?: string;
	label?: string;
	engLabel?: string;
	variant?: "cyan" | "red";
	size?: "sm" | "md" | "lg";
	userColor?: string;
}

function getRowColor(
	score: MatchScoreWithUser,
	currentUserId: string,
	hostId: string | undefined,
	userColor: string | undefined,
) {
	return score.userId === currentUserId
		? (userColor ?? "#44FFFF")
		: hostId && score.userId === hostId && currentUserId !== hostId
			? "#FF4444"
			: "#44FFFF";
}

export function CurrentScores({
	currentScores,
	currentUserId,
	hostId,
	label = "現在のスコア",
	engLabel = "CURRENT SCORES",
	variant = "cyan",
	size = "md",
	userColor,
}: CurrentScoresProps) {
	return (
		<div
			className={
				currentScoresStyles({ variant, size }).card() +
				" flex-1 overflow-hidden flex flex-col"
			}
		>
			<SideHeader
				engLabel={engLabel}
				label={label}
				className={
					variant === "cyan" ? "border-[#44FFFF]/30" : "border-[#FF4444]/30"
				}
			/>
			<div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar scrollbar-hide">
				{currentScores.length > 0 ? (
					currentScores.map((score, index) => (
						<div
							key={score.userId}
							className={cn(
								"flex items-center justify-between p-2 rounded border",
								score.userId === currentUserId
									? "bg-[#44FFFF]/10 border-[#44FFFF]/30"
									: "bg-black/20 border-white/5",
							)}
							style={{
								["--row-color" as string]: getRowColor(
									score,
									currentUserId,
									hostId,
									userColor,
								),
							}}
						>
							<div className="flex items-center gap-2 min-w-0">
								<div
									className={cn(
										currentScoresStyles().indexNumber(),
										"text-[color:var(--row-color)]",
									)}
								>
									{index + 1}
								</div>
								<PlayerFaceIcon
									faceIcon={score.user.faceIcon}
									size={size === "lg" ? "md" : "sm"}
								/>
								<div
									className={cn(
										currentScoresStyles().playerName(),
										"text-[color:var(--row-color)]",
									)}
								>
									{score.user.name}
								</div>
							</div>
							<div
								className={cn(
									currentScoresStyles().points(),
									"text-[color:var(--row-color)]",
								)}
							>
								<span>{score.points}</span>
								<Typography
									variant="caption"
									as="span"
									font="sans"
									className="ml-1"
								>
									pt
								</Typography>
							</div>
						</div>
					))
				) : (
					<div className="text-center py-4 text-[10px] text-gray-600 italic">
						No scores recorded
					</div>
				)}
			</div>
		</div>
	);
}
