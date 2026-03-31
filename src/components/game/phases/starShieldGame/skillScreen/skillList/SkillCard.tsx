import { RoleBadge } from "@/components/game/common/starShield/roleBadge";
import { skillCardStyles } from "./styles";

export function SkillCard({
	title,
	jurisdiction,
	children,
}: {
	title: string;
	jurisdiction: "attack" | "defence";
	children: React.ReactNode;
}) {
	const s = skillCardStyles({ jurisdiction });
	const isAttack = jurisdiction === "attack";
	return (
		<div className={s.root()}>
			<div className={s.header()}>
				<p className={s.title()}>{title}</p>
				<RoleBadge role={isAttack ? "SHOOTER" : "TYPIST"} />
			</div>
			{children}
		</div>
	);
}
