import { type NextRequest } from "next/server"
import { updateSession } from "@/backend/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * 以下のパスを除外する:
         * - _next/static, _next/image, favicon.ico
         * - 画像ファイル
         * - /auth/callback (← これを追加！)
         */
        "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}