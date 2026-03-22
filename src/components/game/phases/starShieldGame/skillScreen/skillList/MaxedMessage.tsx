import { maxedMessageStyles } from "./styles";

const s = maxedMessageStyles();

export function MaxedMessage({ children }: { children: React.ReactNode }) {
	return (
		<div className={s.root()}>
			<span className={s.icon()}>🏆</span>
			<span className={s.text()}>{children}</span>
		</div>
	);
}
