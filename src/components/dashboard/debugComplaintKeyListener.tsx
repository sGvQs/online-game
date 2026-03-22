"use client";

import { useEffect } from "react";

export const DEBUG_COMPLAINT_EVENT = "debug-complaint-toggle";

/**
 * アプリ全体で Cmd+Shift+7 を監視し、押されたらカスタムイベントを発火。
 * layout に配置して常時マウントされるようにする。
 */
export function DebugComplaintKeyListener() {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "Digit7") {
				e.preventDefault();
				window.dispatchEvent(new CustomEvent(DEBUG_COMPLAINT_EVENT));
			}
		};
		document.addEventListener("keydown", handleKeyDown, { capture: true });
		return () =>
			document.removeEventListener("keydown", handleKeyDown, { capture: true });
	}, []);
	return null;
}
