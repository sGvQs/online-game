"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ScanFace, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { RoomModal } from "@/components/room/roomModal";
import { updateProfile } from "@/server/actions/user/updateProfile";
import {
	FACE_ICON_PATHS,
	FACE_ICON_OPTIONS,
	FaceIcon,
} from "@/constants/common/faceIcon";
import { dashboardHeaderProfile } from "./dashboardHeaderProfile.styles";

const styles = dashboardHeaderProfile();

interface DashboardHeaderProfileProps {
	name: string;
	comment: string | null;
	faceIcon: FaceIcon;
	rank: number | null;
	totalPoints: number;
}

const NAME_MAX_LENGTH = 10;
const COMMENT_MAX_LENGTH = 20;

export function DashboardHeaderProfile({
	name,
	comment,
	faceIcon,
	rank,
	totalPoints,
}: DashboardHeaderProfileProps) {
	const router = useRouter();
	const [modalOpen, setModalOpen] = useState(false);

	const handleClose = () => {
		setModalOpen(false);
	};

	return (
		<>
			<div className={styles.wrapper()}>
				{/* 吹き出し（外側に配置） */}
				<div className={styles.bubble()}>
					<Typography variant="small" as="span" className={styles.bubbleText()}>
						{comment || "煽りコメントを設定"}
					</Typography>
					<div className={styles.bubbleTail()} aria-hidden />
				</div>
				{/* アイコン・名前・順位・ポイント（クリック可能、ホバー派手） */}
				<Button
					type="button"
					variant="outline"
					onClick={() => setModalOpen(true)}
					className="flex items-center gap-2 rounded-full text-white shrink-0 bg-white/10 border-brand-200/30 hover:bg-brand-400/30 hover:border-brand-400/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98] duration-300"
				>
					<div className={styles.avatarWrapper()}>
						<Image
							src={FACE_ICON_PATHS[faceIcon]}
							alt=""
							fill
							sizes="32px"
							className="object-contain"
						/>
					</div>
					<span>{name}</span>
					<span className="opacity-95">{rank ? `${rank}位` : "圏外"}</span>
					<span className="opacity-95">{totalPoints}pt</span>
				</Button>
			</div>

			<RoomModal
				isOpen={modalOpen}
				onClose={handleClose}
				title="プロフィールを編集"
			>
				<ProfileEditForm
					initialName={name}
					initialComment={comment ?? ""}
					initialFaceIcon={faceIcon}
					onSuccess={() => {
						router.refresh();
						handleClose();
					}}
				/>
			</RoomModal>
		</>
	);
}

function ProfileEditForm({
	initialName,
	initialComment,
	initialFaceIcon,
	onSuccess,
}: {
	initialName: string;
	initialComment: string;
	initialFaceIcon: FaceIcon;
	onSuccess: () => void;
}) {
	const [name, setName] = useState(initialName);
	const [comment, setComment] = useState(initialComment);
	const [selectedFaceIcon, setSelectedFaceIcon] = useState(initialFaceIcon);
	const [isPending, startTransition] = useTransition();
	const [success, setSuccess] = useState(false);

	const hasChanges =
		name !== initialName ||
		comment !== initialComment ||
		selectedFaceIcon !== initialFaceIcon;

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		startTransition(async () => {
			try {
				await updateProfile({
					name: name.trim(),
					faceIcon: selectedFaceIcon,
					comment,
				});
				setSuccess(true);
				setTimeout(() => {
					setSuccess(false);
					onSuccess();
				}, 800);
			} catch (error) {
				console.error("プロフィールの保存に失敗しました:", error);
				alert(
					error instanceof Error
						? error.message
						: "プロフィールの保存に失敗しました",
				);
			}
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* 名前 */}
			<div>
				<Typography
					variant="h4"
					className="mb-2 text-brand-500 flex items-center gap-2"
				>
					<User className="w-4 h-4" />
					名前
				</Typography>
				<Input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value.slice(0, NAME_MAX_LENGTH))}
					placeholder="表示名を入力..."
					maxLength={NAME_MAX_LENGTH}
					disabled={isPending}
					className="input-dark w-full border-brand-200 focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2"
				/>
				<Typography
					variant="caption"
					as="p"
					className="text-brand-500 opacity-90 mt-1"
				>
					{name.length} / {NAME_MAX_LENGTH}文字
				</Typography>
			</div>

			{/* 顔アイコン */}
			<div>
				<Typography
					variant="h4"
					className="mb-2 text-brand-500 flex items-center gap-2"
				>
					<ScanFace className="w-4 h-4" />
					顔アイコン
				</Typography>
				<div className="grid grid-cols-4 gap-2">
					{FACE_ICON_OPTIONS.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => setSelectedFaceIcon(option.value)}
							disabled={isPending}
							className={`relative w-full aspect-square rounded-xl border-2 transition-all overflow-hidden ${
								selectedFaceIcon === option.value
									? "border-brand-500 bg-brand-100 dark:bg-brand-900/50"
									: "border-transparent bg-white/10 hover:bg-white/20"
							}`}
						>
							<Image
								src={FACE_ICON_PATHS[option.value]}
								alt={option.label}
								fill
								className="object-contain p-2"
							/>
						</button>
					))}
				</div>
			</div>

			{/* 煽りコメント */}
			<div>
				<Typography
					variant="h4"
					className="mb-2 text-brand-500 flex items-center gap-2"
				>
					<MessageSquare className="w-4 h-4" />
					煽りコメント
				</Typography>
				<Input
					type="text"
					value={comment}
					onChange={(e) =>
						setComment(e.target.value.slice(0, COMMENT_MAX_LENGTH))
					}
					placeholder="ゲーム終了後に勝ったら表示されるコメントを入力..."
					maxLength={COMMENT_MAX_LENGTH}
					disabled={isPending}
					className="input-dark w-full border-brand-200 focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2"
				/>
				<Typography
					variant="caption"
					as="p"
					className="text-brand-500 opacity-90 mt-1"
				>
					{comment.length} / {COMMENT_MAX_LENGTH}文字
				</Typography>
			</div>

			<Button
				type="submit"
				disabled={isPending || !hasChanges}
				className="w-full bg-brand-300 hover:bg-brand-500 text-white gap-2"
			>
				{isPending ? "保存中..." : success ? "保存しました！" : "保存"}
			</Button>
		</form>
	);
}
