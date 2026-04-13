import { bulletHud } from "./styles";
import { GLOW_COLORS } from "@/constants/meteorBustersGame/gameConfig";
import { MAX_AMMO } from "@/constants/meteorBustersGame/gameConfig";
import type { MeteorBulletType } from "@/types";

interface BulletHudProps {
	bulletType: MeteorBulletType;
	ammoRemaining: number;
}

export function BulletHud({ bulletType, ammoRemaining }: BulletHudProps) {
	const styles = bulletHud();
	const color = GLOW_COLORS[bulletType];

	return (
		<div className={styles.container()}>
			<p className={styles.typeLabel()}>弾タイプ</p>
			<div
				className={styles.typeBadge()}
				style={{
					backgroundColor: `${color}22`,
					borderColor: color,
					boxShadow: `0 0 8px ${color}66`,
				}}
			>
				{bulletType}
			</div>
			<div className={styles.ammoRow()}>
				{Array.from({ length: MAX_AMMO }).map((_, i) => (
					<div
						key={i}
						className={`${styles.ammoDot()} ${
							i < ammoRemaining
								? styles.ammoDotFull()
								: styles.ammoDotEmpty()
						}`}
						style={{ backgroundColor: i < ammoRemaining ? color : "#ffffff" }}
					/>
				))}
			</div>
		</div>
	);
}
