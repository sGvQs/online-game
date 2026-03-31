"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { FaceIcon } from "@prisma/client";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FACE_ICON_PATHS, FACE_ICON_OPTIONS } from "@/constants/common/faceIcon";
import { updateProfile } from "@/server/actions/user/updateProfile";
import { useLoading } from "@/lib/loading-context";
import { useHomeModalOpen } from "@/lib/home-modal-context";
import { homeProfile } from "./styles";

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
	const { showLoading, hideLoading } = useLoading();
	const { setModalOpen } = useHomeModalOpen();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		setModalOpen(isOpen);
	}, [isOpen, setModalOpen]);
	const [name, setName] = useState(initialName);
	const [faceIcon, setFaceIcon] = useState<FaceIcon>(initialFaceIcon);
	const [comment, setComment] = useState(initialComment);
	const [error, setError] = useState("");

	const openModal = () => {
		setName(initialName);
		setFaceIcon(initialFaceIcon);
		setComment(initialComment);
		setError("");
		setIsOpen(true);
	};

	const closeModal = useCallback(() => {
		setIsOpen(false);
	}, []);

	const handleSave = async () => {
		if (name.trim().length === 0) {
			setError("名前を入力してください");
			return;
		}
		if (name.length > 10) {
			setError("名前は10文字以内で入力してください");
			return;
		}
		setError("");
		showLoading();
		try {
			await updateProfile({ name: name.trim(), faceIcon, comment });
			setIsOpen(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "保存に失敗しました");
		} finally {
			hideLoading();
		}
	};

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

			<Modal
				isOpen={isOpen}
				onClose={closeModal}
				title="プロフィール編集"
				showCloseButton
			>
				<div className="flex flex-col gap-5">
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
							variant="success"
							onClick={closeModal}
						>
							<Typography variant="label" font="cherry-bomb-one" className="font-bold">
								キャンセル
							</Typography>
						</Button>
						<Button
							variant="primary"
							se="submit"
							onClick={handleSave}
						>
							<Typography variant="label" font="cherry-bomb-one" className="font-bold">
								セーブ
							</Typography>
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
