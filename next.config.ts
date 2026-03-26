import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins: [
		"localhost:3000",
		"127.0.0.1:3000",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"localhost:54321",
		"127.0.0.1:54321",
		"localhost:54324",
		"127.0.0.1:54324",
	],

	// セキュリティヘッダー
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
};

export default nextConfig;
