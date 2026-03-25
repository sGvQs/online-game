"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { createRoom } from "@/server/actions/room";

export function HomeActions() {
    const router = useRouter();
    return (
        <div className="flex items-center gap-10 mt-20">
            <Button
                variant="success"
                size="lg"
                onClick={() => {
                    console.log("END GAME");
                }}
            >
                <Typography variant="label" font="cherry-bomb-one" className="font-bold">ログアウト</Typography>
            </Button>
            <Button
                variant="primary"
                size="lg"
                onClick={async () => {
                    await createRoom();
                }}
            >
                <Typography variant="label" font="cherry-bomb-one" className="font-bold">ルームをつくる</Typography>
            </Button>
            <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/room/search")}
            >
                <Typography variant="label" font="cherry-bomb-one" className="font-bold">ルームをさがす</Typography>
            </Button>
            <Button
                variant="outline"
                size="lg"
                onClick={() => {
                    console.log("END GAME");
                }}
            >
                <Typography variant="label" font="cherry-bomb-one" className="font-bold">ランキング</Typography>
            </Button>
        </div>
    );
}
