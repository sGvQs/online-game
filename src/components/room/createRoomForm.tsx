"use client";

import { createRoom } from "@/server/actions/room";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CreateRoomForm() {
	return (
		<Button
			onClick={async () => {
				await createRoom();
			}}
			className="w-full bg-brand-300 hover:bg-brand-400 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
		>
			<Plus className="w-5 h-5" />
			新規ルーム
		</Button>
	);
}
