import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/auth/callback")) {
		return NextResponse.next();
	}

	let supabaseResponse = NextResponse.next({
		request,
	});

	// With Fluid compute, don't put this client in a global environment
	// variable. Always create a new one on each request.
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(
					cookiesToSet: Array<{ name: string; value: string; options?: any }>,
				) {
					cookiesToSet.forEach(
						({ name, value }: { name: string; value: string }) =>
							request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(
						({
							name,
							value,
							options,
						}: {
							name: string;
							value: string;
							options?: any;
						}) => supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// Do not run code between createServerClient and
	// supabase.auth.getClaims(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: If you remove getClaims() and you use server-side rendering
	// with the Supabase client, your users may be randomly logged out.
	const { data } = await supabase.auth.getClaims();

	const user = data?.claims;

	if (
		!user &&
		request.nextUrl.pathname !== "/" &&
		!request.nextUrl.pathname.startsWith("/login") &&
		!request.nextUrl.pathname.startsWith("/auth") &&
		!request.nextUrl.pathname.startsWith("/privacy") &&
		!request.nextUrl.pathname.startsWith("/terms")
	) {
		// 無効なセッション Cookie をローカルでクリア（API呼び出しなし）
		await supabase.auth.signOut({ scope: "local" });

		const url = request.nextUrl.clone();
		url.pathname = "/login";
		const redirectResponse = NextResponse.redirect(url);

		// クリア済み Cookie をリダイレクトレスポンスにコピー
		supabaseResponse.cookies.getAll().forEach((cookie) => {
			redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
		});

		return redirectResponse;
	}

	if (user) {
		const { pathname } = request.nextUrl;
		if (pathname === "/login" || pathname === "/") {
			const url = request.nextUrl.clone();
			url.pathname = "/home";
			return NextResponse.redirect(url);
		}
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
	// creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse;
}
