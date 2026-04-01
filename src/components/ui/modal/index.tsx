"use client";

import React, { useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { modal } from "./styles";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { SoundContext } from "@/lib/sound-context";
import { effectiveSeVolume } from "@/lib/sound-volume";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	showCloseButton?: boolean;
}

/**
 * 共通モーダルコンポーネント
 *
 * glassmorphismデザインで、画面の縦横60%のサイズで中央に浮遊表示される。
 */
export function Modal({
	isOpen,
	onClose,
	title,
	children,
	showCloseButton = true,
}: ModalProps) {
	const styles = modal();
	const sound = useContext(SoundContext);

	useEffect(() => {
		if (!isOpen) return;
		if (!sound?.isPlaying) return;
		const audio = new Audio("/se/modal-se.mp3");
		audio.volume = effectiveSeVolume(0.1, sound.volume);
		audio.play().catch(() => {});
	}, [isOpen, sound]);

	// ESCキーでモーダルを閉じる
	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	// モーダルが開いているときはbodyのスクロールを無効化
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const modalContent = (
		<div className={styles.overlay()} onClick={onClose}>
			<div className={styles.content()} onClick={(e) => e.stopPropagation()}>
				{/* ヘッダー */}
				<div className={styles.header()}>
					<Typography variant="h2" font="dot-gothic-16" className={styles.title()}>
						{title}
					</Typography>
					{showCloseButton && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							aria-label="閉じる"
							className="text-white text-2xl w-8 h-8 hover:bg-white/20 active:bg-white/30"
						>
							×
						</Button>
					)}
				</div>

				{/* コンテンツ */}
				<div className={styles.body()}>{children}</div>
			</div>
		</div>
	);

	return typeof document !== "undefined"
		? createPortal(modalContent, document.body)
		: modalContent;
}
