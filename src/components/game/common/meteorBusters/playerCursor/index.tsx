import Image from "next/image";
import type { PlayerCursorState } from "@/types";

interface PlayerCursorProps {
	cursors: PlayerCursorState[];
	currentUserId: string;
	players: { userId: string; name?: string | null }[];
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
				const player = players.find((p) => p.userId === cursor.playerId);
				const name = player?.name ?? cursor.playerId.slice(0, 6);

				return (
					<div
						key={cursor.playerId}
						className="pointer-events-none absolute z-50 flex flex-col items-center"
						style={{
							left: cursor.x,
							top: cursor.y,
							transform: "translate(-50%, -50%)",
						}}
					>
						{/* target-circle.svg を 1/4 サイズ（12px）で表示 */}
						<div className="relative w-3 h-3 opacity-70">
							<Image
								src="/svg/object/target-circle.svg"
								alt=""
								fill
								className="object-contain"
							/>
						</div>
						{/* プレイヤー名 */}
						<span
							className="mt-0.5 text-[8px] leading-none whitespace-nowrap text-white/70 font-dot-gothic-16"
							style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
						>
							{name}
						</span>
					</div>
				);
			})}
		</>
	);
}
