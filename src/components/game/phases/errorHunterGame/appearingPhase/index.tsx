"use client";

import { Win95Dialog } from "@/components/game/common/errorHunter/win95Dialog";
import { Win95TitleBarButton } from "@/components/game/common/errorHunter/win95TitleBarButton";
import { appearingPhase } from "./styles";
import { Typography } from "@/components/ui/typography";
import type { ErrorEventWithUser } from "@/types";

const ERROR_MESSAGES = [
	"Windows Protection Error.\nYou need to restart your computer.",
];
function getRandomErrorMessage() {
	return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]!;
}
import { cn } from "@/lib/utils";

export interface AppearingPhaseProps {
	errorEvents: ErrorEventWithUser[];
	onCloseError: (eventId: string) => void;
	isProcessing: boolean;
}

export function AppearingPhase({
	errorEvents,
	onCloseError,
	isProcessing,
}: AppearingPhaseProps) {
	const styles = appearingPhase();
	const unclosedEvents = errorEvents.filter(
		(event: ErrorEventWithUser) => !event.closedAt,
	);

	return (
		<div className="fixed inset-0 z-50">
			{unclosedEvents.map((event: ErrorEventWithUser) => {
				const errorWithPosition = event as typeof event & {
					positionX: number;
					positionY: number;
				};
				return (
					<div
						key={event.id}
						className={cn(
							styles.floatingDialog(),
							"translate-x-[-50%] translate-y-[-50%]",
						)}
						style={{
							["--dialog-left" as string]: `${errorWithPosition.positionX}%`,
							["--dialog-top" as string]: `${errorWithPosition.positionY}%`,
						}}
					>
						<Win95Dialog
							title="Error"
							icon="error"
							innerClassName="error"
							titlebarButtons={
								<Win95TitleBarButton
									onClick={() => onCloseError(event.id)}
									disabled={isProcessing}
									aria-label="Close"
								>
									×
								</Win95TitleBarButton>
							}
						>
							<Typography variant="body" className={styles.errorMessage()}>
								{getRandomErrorMessage()}
							</Typography>
						</Win95Dialog>
					</div>
				);
			})}
		</div>
	);
}
