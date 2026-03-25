"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { FaceIcon } from "@prisma/client";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FACE_ICON_PATHS, FACE_ICON_OPTIONS } from "@/constants/common/faceIcon";
import { updateProfile } from "@/server/actions/user/updateProfile";
import { homeProfile } from "./homeProfile.styles";

interface HomeProfileProps {
	initialName: string;
	initialFaceIcon: FaceIcon;
	initialComment: string;
	rank?: number;
	totalPoints?: number;
}

export function HomeProfile({
	initialName,
	initialFaceIcon,
	initialComment,
	rank,
	totalPoints,
}: HomeProfileProps) {
	const styles = homeProfile();
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState(initialName);
	const [faceIcon, setFaceIcon] = useState<FaceIcon>(initialFaceIcon);
	const [comment, setComment] = useState(initialComment);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	const openModal = () => {
		setName(initialName);
		setFaceIcon(initialFaceIcon);
		setComment(initialComment);
		setError("");
		setIsOpen(true);
	};

	const closeModal = useCallback(() => {
		if (isPending) return;
		setIsOpen(false);
	}, [isPending]);

	const handleSave = () => {
		if (name.trim().length === 0) {
			setError("名前を入力してください");
			return;
		}
		if (name.length > 10) {
			setError("名前は10文字以内で入力してください");
			return;
		}
		setError("");
		startTransition(async () => {
			try {
				await updateProfile({ name: name.trim(), faceIcon, comment });
				setIsOpen(false);
			} catch (e) {
				setError(e instanceof Error ? e.message : "保存に失敗しました");
			}
		});
	};

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeModal();
		};
		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, closeModal]);

	return (
		<>
			<button className={styles.profileCard()} onClick={openModal}>
				<Image
					src={FACE_ICON_PATHS[initialFaceIcon]}
					alt="face icon"
					width={20}
					height={20}
				/>
				<Typography variant="small">{initialName}</Typography>
				<Typography variant="small">{rank}位</Typography>
				<Typography variant="small">{totalPoints}pt</Typography>
				<Pencil className={styles.editHint()} />
			</button>

			{isOpen &&
				createPortal(
					<div
						className={styles.overlay()}
						onClick={closeModal}
					>
						<div
							className={styles.modal()}
							onClick={(e) => e.stopPropagation()}
						>
							<div className={styles.modalHeader()}>
								<span className={styles.modalTitle()}>プロフィール編集</span>
								<button
									className={styles.closeButton()}
									onClick={closeModal}
									disabled={isPending}
								>
									✕
								</button>
							</div>

							<div className={styles.modalBody()}>
								{/* アイコン選択 */}
								<div>
									<p className={styles.sectionLabel()}>アイコン</p>
									<div className={styles.iconGrid()}>
										{FACE_ICON_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												className={`${styles.iconOption()} ${faceIcon === opt.value ? styles.iconOptionSelected() : ""}`}
												onClick={() => setFaceIcon(opt.value)}
												title={opt.label}
											>
												<Image
													src={FACE_ICON_PATHS[opt.value]}
													alt={opt.label}
													fill
													className="object-contain p-1"
												/>
											</button>
										))}
									</div>
								</div>

								{/* 名前 */}
								<div className={styles.inputWrapper()}>
									<p className={styles.sectionLabel()}>なまえ</p>
									<Input
										className={styles.nameInput()}
										value={name}
										onChange={(e) => setName(e.target.value)}
										maxLength={10}
										placeholder="名前（10文字以内）"
									/>
									<p className={styles.nameCounter()}>{name.length}/10</p>
								</div>

								{/* コメント */}
								<div className={styles.inputWrapper()}>
									<p className={styles.sectionLabel()}>ひとことコメント</p>
									<textarea
										className={styles.commentArea()}
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										placeholder="勝利時に表示されるひとこと"
										rows={2}
									/>
								</div>

								{error && <p className={styles.errorText()}>{error}</p>}

								<div className={styles.actions()}>
									<Button
										variant="outline"
										onClick={closeModal}
										disabled={isPending}
									>
										キャンセル
									</Button>
									<Button
										variant="primary"
										onClick={handleSave}
										disabled={isPending}
									>
										{isPending ? "保存中..." : "保存する"}
									</Button>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
