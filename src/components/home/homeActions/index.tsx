"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { createRoom } from "@/server/actions/room";
import { signOut } from "@/server/actions/auth";
import { useLoading } from "@/lib/loading-context";

export function HomeActions() {
    const { showLoading, hideLoading } = useLoading();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    return (
        <div className="flex items-center gap-10 mt-20">
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
            >
                <Typography variant="label" font="cherry-bomb-one" className="font-bold">ランキング</Typography>
            </Button>
        </div>
    );
}
