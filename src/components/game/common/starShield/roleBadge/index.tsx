import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import type { RoleChoice } from "@/types/starShieldGame";
import { ROLE_META } from "@/constants/starShieldGame/constants";
import { roleBadge } from "./styles";

export function RoleBadge({ role }: { role: RoleChoice }) {
	const meta = ROLE_META[role];
	const styles = roleBadge();
	return (
		<Typography
			variant="small"
			as="span"
			font="cherry-bomb-one"
			className={styles.badge()}
			style={{
				["--badge-color" as string]: meta.text,
				["--badge-bg" as string]: meta.bg,
				["--badge-border" as string]: `1px solid ${meta.border}`,
			} as React.CSSProperties}
		>
			<span className="relative w-3.5 h-3.5 shrink-0 block">
				<Image src={meta.iconSrc} alt="" fill className="object-contain" />
			</span>
			{meta.label}
		</Typography>
	);
}
