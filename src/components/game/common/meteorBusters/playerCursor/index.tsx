import { GLOW_COLORS } from "@/constants/meteorBustersGame/gameConfig";
import type { PlayerCursorState } from "@/types";

const PLAYER_COLORS = ["#00ccff", "#ff66cc", "#66ff88", "#ffaa00"];

interface PlayerCursorProps {
	cursors: PlayerCursorState[];
	currentUserId: string;
	players: { userId: string }[];
}

export function PlayerCursors({
	cursors,
	currentUserId,
	players,
}: PlayerCursorProps) {
	const otherCursors = cursors.filter((c) => c.playerId !== currentUserId);

	return (
		<>
			{otherCursors.map((cursor) => {
				const playerIdx = players.findIndex((p) => p.userId === cursor.playerId);
				const playerColor = PLAYER_COLORS[playerIdx % PLAYER_COLORS.length] ?? "#ffffff";
				const bulletColor = GLOW_COLORS[cursor.bulletType];

				return (
					<div
						key={cursor.playerId}
						className="pointer-events-none absolute z-50"
						style={{
							left: cursor.x,
							top: cursor.y,
							transform: "translate(-50%, -50%)",
						}}
					>
						{/* カーソル本体 */}
						<div
							className="w-5 h-5 rounded-full border-2 opacity-80"
							style={{
								borderColor: playerColor,
								boxShadow: `0 0 6px ${playerColor}`,
							}}
						/>
						{/* 現在の弾タイプ表示 */}
						<div
							className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1 rounded"
							style={{
								color: bulletColor,
								textShadow: `0 0 4px ${bulletColor}`,
							}}
						>
							{cursor.bulletType}
						</div>
					</div>
				);
			})}
		</>
	);
}
