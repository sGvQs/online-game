"use client";

import Image from "next/image";
import { dashboardHeaderTitle } from "./dashboardHeaderTitle.styles";
import { Typography } from "@/components/ui/typography";

const styles = dashboardHeaderTitle();

export function DashboardHeaderTitle() {
	return (
		<Typography variant="h1" font="rubik-puddles" className={styles.heading()}>
			<Image
				src="/icon.svg"
				alt=""
				width={40}
				height={40}
				className="shrink-0"
			/>
			<span>Pukapuka</span>
			<span>Space</span>
		</Typography>
	);
}
