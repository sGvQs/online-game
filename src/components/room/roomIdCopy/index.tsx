"use client";

import { useState, useCallback, useContext } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { roomIdCopy } from "./styles";
import { SoundContext } from "@/lib/sound-context";

interface RoomIdCopyProps {
	roomId: string;
}

export function RoomIdCopy({ roomId }: RoomIdCopyProps) {
	const styles = roomIdCopy();
	const [copied, setCopied] = useState(false);
	const sound = useContext(SoundContext);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(roomId);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
			if (sound?.isPlaying) {
				const audio = new Audio("/se/switch-se.mp3");
				audio.volume = 0.1;
				audio.play().catch(() => {});
			}
		} catch {
			// clipboard API が使えない場合は無視
		}
	}, [roomId, sound]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={styles.button()}
		>
			<Typography variant="body" gradientColor="RedToPurple" className="font-bold">
				ルームID: {roomId}
			</Typography>
			{copied ? (
				<ClipboardCheck className="w-4 h-4 text-brand-600 shrink-0" />
			) : (
				<Clipboard className="w-4 h-4 text-brand-600 shrink-0" />
			)}
		</button>
	);
}
