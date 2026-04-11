"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { createRoom } from "@/server/actions/room";
import { signOut } from "@/server/actions/auth";
import { useLoading } from "@/lib/loading-context";
import { useHomeStarted } from "@/lib/home-started-context";

const BOUNCE_SPRING = {
	type: "spring" as const,
	stiffness: 280,
	damping: 14,
	mass: 0.7,
};

export function HomeActions() {
	const { hasStarted } = useHomeStarted();
	const { showLoading, hideLoading } = useLoading();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	if (!hasStarted) return null;

	return (
		<motion.div
			className="flex items-center gap-10 mt-20"
			initial={{ scale: 0.3, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={BOUNCE_SPRING}
		>
			<Button
				variant="success"
				size="lg"
				disabled={isPending}
				onClick={async () => {
					showLoading();
					try {
						startTransition(() => signOut());
					} finally {
						hideLoading();
					}
				}}
			>
				<Typography variant="label" font="cherry-bomb-one" className="font-bold">
					ログアウト
				</Typography>
			</Button>
			<Button
				variant="primary"
				size="lg"
				se="submit"
				onClick={async () => {
					showLoading();
					try {
						await createRoom();
					} finally {
						hideLoading();
					}
				}}
			>
				<Typography variant="label" font="cherry-bomb-one" className="font-bold">ルームをつくる</Typography>
			</Button>
			<Button
				variant="primary"
				size="lg"
				se="submit"
				onClick={() => router.push("/room/search")}
			>
				<Typography variant="label" font="cherry-bomb-one" className="font-bold">ルームをさがす</Typography>
			</Button>
			<Button
				variant="outline"
				size="lg"
				onClick={() => router.push("/ranking")}
				se="buy"
			>
				<Typography variant="label" font="cherry-bomb-one" className="font-bold">ランキング</Typography>
			</Button>
		</motion.div>
	);
}
