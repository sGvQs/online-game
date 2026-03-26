"use client";

import { useState, useCallback, useEffect } from "react";
import { useSE } from "@/hooks/useSE";
import { Win95Dialog } from "@/components/game/common/errorHunter/win95Dialog";
import { Win95TitleBarButton } from "@/components/game/common/errorHunter/win95TitleBarButton";
import { errorHunterDemo as errorHunterDemoStyles } from "./errorHunterDemo.styles";

const styles = errorHunterDemoStyles();

const ERROR_MESSAGES = [
	"Windows Protection Error.\nYou need to restart your computer.",
	"A fatal exception 0E has occurred.\nThe current application will be terminated.",
	"This program has performed an illegal operation\nand will be shut down.",
];

function getRandomErrorMessage(): string {
	return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]!;
}

const DINOSAUR_ICON = "/svg/charactor/annoying-dinosaur.svg";

const ERROR_POSITIONS = [
	{ x: 15, y: 25 },
	{ x: 55, y: 30 },
	{ x: 35, y: 55 },
	{ x: 70, y: 60 },
	{ x: 25, y: 75 },
];

interface ErrorModalState {
	id: string;
	positionX: number;
	positionY: number;
	message: string;
	closed: boolean;
}

export function ErrorHunterDemo() {
	const { play } = useSE();
	const [phase, setPhase] = useState<"playing" | "result">("playing");
	const [errors, setErrors] = useState<ErrorModalState[]>([]);

	useEffect(() => {
		setErrors(
			ERROR_POSITIONS.map((pos, i) => ({
				id: `err-${i}`,
				positionX: pos.x,
				positionY: pos.y,
				message: getRandomErrorMessage(),
				closed: false,
			})),
		);
	}, []);

	const closeError = useCallback(
		(id: string) => {
			setErrors((prev) => {
				const next = prev.map((e) =>
					e.id === id ? { ...e, closed: true } : e,
				);
				const allClosed = next.every((e) => e.closed);
				if (allClosed) {
					play("tada");
					setTimeout(() => setPhase("result"), 300);
				}
				return next;
			});
		},
		[play],
	);

	const endDemo = useCallback(() => {
		play("error");
		setPhase("playing");
		setErrors(
			ERROR_POSITIONS.map((pos, i) => ({
				id: `err-${i}`,
				positionX: pos.x,
				positionY: pos.y,
				message: getRandomErrorMessage(),
				closed: false,
			})),
		);
	}, [play]);

	return (
		<div className={styles.wrapper()}>
			{/* Win95 デスクトップ上にエラーダイアログを配置 */}
			{phase === "playing" &&
				errors
					.filter((e) => !e.closed)
					.map((e) => (
						<div
							key={e.id}
							className={styles.errorCard()}
							style={{
								left: `${e.positionX}%`,
								top: `${e.positionY}%`,
								width: "min(320px, 90vw)",
							}}
						>
							<Win95Dialog
								title="Error"
								icon="error"
								innerClassName="error"
								titlebarButtons={
									<Win95TitleBarButton
										onClick={() => closeError(e.id)}
										aria-label="Close"
									>
										×
									</Win95TitleBarButton>
								}
							>
								<p style={{ whiteSpace: "pre-line", fontSize: "12px" }}>
									{e.message}
								</p>
							</Win95Dialog>
						</div>
					))}

			{/* リザルトモーダル */}
			{phase === "result" && (
				<div className={styles.overlay()}>
					<Win95Dialog
						title="Result"
						customIconSrc={DINOSAUR_ICON}
						buttons={[
							{
								label: "もう一度",
								onClick: endDemo,
								primary: true,
							},
						]}
					>
						<div style={{ minWidth: "300px" }}>
							<div style={{ marginBottom: "12px", marginLeft: "24px" }}>
								<p
									style={{
										fontSize: "12px",
										fontWeight: "normal",
										color: "#000",
										marginBottom: "4px",
										padding: "4px",
										backgroundColor: "transparent",
										borderRadius: "2px",
									}}
								>
									名もなき恐竜さんからのコメント
								</p>
								<p
									style={{
										fontSize: "14px",
										fontWeight: "bold",
										color: "#000080",
										marginBottom: "4px",
										padding: "4px",
										backgroundColor: "#e0e0e0",
										borderRadius: "2px",
									}}
								>
									ゲームで待ってるぜ
								</p>
							</div>
							<p
								style={{
									fontSize: "12px",
									color: "#000080",
									marginLeft: "24px",
									marginTop: "12px",
								}}
							>
								もう一度エラーを出す
							</p>
						</div>
					</Win95Dialog>
				</div>
			)}
		</div>
	);
}
