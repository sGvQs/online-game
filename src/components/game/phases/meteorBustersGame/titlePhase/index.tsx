"use client";

import { useState } from "react";
import { titlePhase } from "./styles";
import type { RoomWithUsersAndReadyStatus, MeteorDifficulty } from "@/types";

interface TitlePhaseProps {
	room: RoomWithUsersAndReadyStatus;
	isHost: boolean;
	isReady: boolean;
	isTogglingReady: boolean;
	allUsersReady: boolean;
	isProcessing: boolean;
	currentUserId: string;
	onStartGame: (difficulty: MeteorDifficulty) => Promise<void>;
	onClose: () => void;
	onToggleReady: () => void;
}

const DIFFICULTY_LABELS: Record<MeteorDifficulty, string> = {
	EASY: "易しい",
	NORMAL: "普通",
	HARD: "難しい",
};

const DIFFICULTY_DESC: Record<MeteorDifficulty, string> = {
	EASY: "15体 / 4秒間隔",
	NORMAL: "20体 / 3秒間隔",
	HARD: "30体 / 2秒間隔",
};

export function TitlePhase({
	room,
	isHost,
	isReady,
	isTogglingReady,
	allUsersReady,
	isProcessing,
	currentUserId,
	onStartGame,
	onClose,
	onToggleReady,
}: TitlePhaseProps) {
	const styles = titlePhase();
	const [selectedDifficulty, setSelectedDifficulty] =
		useState<MeteorDifficulty>("NORMAL");

	const canStart = isHost && allUsersReady && !isProcessing;

	return (
		<div className={styles.container()}>
			<div className="text-center">
				<h1 className={styles.title()}>METEOR BUSTERS</h1>
				<p className={styles.subtitle()}>協力して隕石を撃破せよ</p>
			</div>

			{/* 難易度選択（ホストのみ） */}
			{isHost && (
				<div className={styles.card()}>
					<p className={styles.sectionTitle()}>難易度</p>
					<div className={styles.difficultyGrid()}>
						{(["EASY", "NORMAL", "HARD"] as MeteorDifficulty[]).map((diff) => (
							<button
								key={diff}
								onClick={() => setSelectedDifficulty(diff)}
								className={`${styles.difficultyBtn()} ${
									selectedDifficulty === diff
										? styles.difficultyBtnActive()
										: styles.difficultyBtnInactive()
								}`}
							>
								<div>{DIFFICULTY_LABELS[diff]}</div>
								<div className="text-[10px] mt-1 opacity-60">
									{DIFFICULTY_DESC[diff]}
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* プレイヤー一覧 */}
			<div className={styles.card()}>
				<p className={styles.sectionTitle()}>
					プレイヤー ({room.users.length}人)
				</p>
				<div className={styles.playerList()}>
					{room.users.map((u) => (
						<div key={u.userId} className={styles.playerRow()}>
							<span className={styles.playerName()}>
								{u.userId === currentUserId ? "あなた" : u.userId.slice(0, 8)}
								{u.userId === room.createdBy && (
									<span className="ml-2 text-[10px] text-brand-500/70 tracking-widest">HOST</span>
								)}
							</span>
							<span
								className={`${styles.readyBadge()} ${
									u.isReady
										? styles.readyBadgeReady()
										: styles.readyBadgeWaiting()
								}`}
							>
								{u.isReady ? "READY" : "WAITING"}
							</span>
						</div>
					))}
				</div>

				<div className={styles.actionRow()}>
					<button
						onClick={onToggleReady}
						disabled={isTogglingReady}
						className={`${styles.readyBtn()} ${
							isReady ? styles.readyBtnActive() : styles.readyBtnInactive()
						}`}
					>
						{isReady ? "✓ 準備完了" : "準備する"}
					</button>

					{isHost && (
						<button
							onClick={() => onStartGame(selectedDifficulty)}
							disabled={!canStart}
							className={`${styles.startBtn()} ${
								canStart ? styles.startBtnEnabled() : styles.startBtnDisabled()
							}`}
						>
							{isProcessing
								? "開始中..."
								: allUsersReady
									? "ゲーム開始"
									: "全員の準備を待っています"}
						</button>
					)}
				</div>
			</div>

			{/* 操作説明 */}
			<div className={styles.controls()}>
				<p>クリック: 弾切り替え　スペース: リロード　任意キー: 射撃</p>
				<p>クリアライン: 撃破率 80%以上</p>
			</div>

			<button onClick={onClose} className={styles.closeBtn()}>
				ルームに戻る
			</button>
		</div>
	);
}
