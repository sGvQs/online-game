"use client";

import { ButtonHTMLAttributes, forwardRef, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { win95TitleBarButton } from "./styles";
import { SoundContext } from "@/lib/sound-context";

export interface Win95TitleBarButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Win95TitleBarButton = forwardRef<
	HTMLButtonElement,
	Win95TitleBarButtonProps
>(({ className, children, onClick, ...props }, ref) => {
	const styles = win95TitleBarButton();
	const [isActive, setIsActive] = useState(false);
	const sound = useContext(SoundContext);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			if (sound?.isPlaying) {
				const audio = new Audio("/se/click-se.mp3");
				audio.volume = 0.1;
				audio.play().catch(() => {});
			}
			onClick?.(e);
		},
		[sound, onClick],
	);

	return (
		<button
			ref={ref}
			className={cn(
				styles.root(),
				isActive &&
					"border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#a0a0a0]",
				className,
			)}
			// onMouseLeave はホバー効果ではなく「ボタン押下中にマウスが離れた際のアクティブ状態キャンセル」用
			onMouseDown={() => setIsActive(true)}
			onMouseUp={() => setIsActive(false)}
			onMouseLeave={() => setIsActive(false)}
			onClick={handleClick}
			{...props}
		>
			{children}
		</button>
	);
});
Win95TitleBarButton.displayName = "Win95TitleBarButton";

export { Win95TitleBarButton };
