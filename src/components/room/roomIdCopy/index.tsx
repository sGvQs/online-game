"use client";

import { useState, useCallback } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { roomIdCopy } from "./styles";

interface RoomIdCopyProps {
	roomId: string;
}

export function RoomIdCopy({ roomId }: RoomIdCopyProps) {
	const styles = roomIdCopy();
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(roomId);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// clipboard API が使えない場合は無視
		}
	}, [roomId]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={styles.button()}
		>
			<Typography variant="body" gradientColor="RedToPurple" className="font-bold">
				RoomID: {roomId}
			</Typography>
			{copied ? (
				<ClipboardCheck className="w-4 h-4 text-brand-600 shrink-0" />
			) : (
				<Clipboard className="w-4 h-4 text-brand-600 shrink-0" />
			)}
		</button>
	);
}
