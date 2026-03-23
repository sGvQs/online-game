"use client";

import { PackagePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRoom } from "@/server/actions/room";
import { dashboardSidebar } from "./dashboardSidebar.styles";
import { Typography } from "@/components/ui/typography";

const sidebarStyles = dashboardSidebar();

export function DashboardSidebar() {
	return (
		<div className={sidebarStyles.wrapper()}>
			<Typography
				variant="h3"
				as="h2"
				font="dot-gothic-16"
				className={sidebarStyles.heading()}
			>
				<PackagePlus className="w-4 h-4" />
				ルームを作成
			</Typography>
			<Button
				onClick={async () => {
					await createRoom();
				}}
				className="w-full bg-brand-300 hover:bg-brand-400 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
			>
				<Plus className="w-5 h-5" />
				新規ルーム
			</Button>
		</div>
	);
}
