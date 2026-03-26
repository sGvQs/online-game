"use client";

import { Win95Dialog } from "@/components/game/common/errorHunter/win95Dialog";
import { resultPhase } from "./styles";
import { Typography } from "@/components/ui/typography";
import type { MatchWithErrorEventsAndUsers } from "@/types";

export interface ResultPhaseProps {
	match: MatchWithErrorEventsAndUsers | null;
	winnerName: string;
	winnerComment: string;
	winnerFaceIconPath: string | null;
	currentUserId: string;
	onFinish: () => void;
}

export function ResultPhase({
	match,
	winnerName,
	winnerComment,
	winnerFaceIconPath,
	currentUserId,
	onFinish,
}: ResultPhaseProps) {
	const styles = resultPhase();
	return (
		<div className={styles.overlay()}>
			<Win95Dialog
				title="Result"
				icon={winnerFaceIconPath ? undefined : "lose"}
				customIconSrc={winnerFaceIconPath ?? undefined}
				buttons={[
					{
						label: "終了",
						onClick: onFinish,
						primary: true,
					},
				]}
			>
				<div className={styles.inner()}>
					<div className={styles.headerSection()}>
						<Typography variant="small" className={styles.commentLabel()}>
							{match?.winnerId === currentUserId
								? `${winnerName}さんから皆さんへのコメント`
								: `${winnerName}さんからのコメント`}
						</Typography>
						<Typography variant="body" className={styles.commentText()}>
							{winnerComment || "私の勝ちです"}
						</Typography>
					</div>
					{match?.winnerId === currentUserId ? (
						<Typography variant="body" className={styles.resultText()}>
							あなたの勝ちです
						</Typography>
					) : (
						<Typography variant="body" className={styles.resultText()}>
							あなたの負けです
						</Typography>
					)}
				</div>
			</Win95Dialog>
		</div>
	);
}
