import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Maru_Gothic, DotGothic16, Kaisei_Opti, Yusei_Magic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const kaiseiOpti = Kaisei_Opti({
  variable: "--font-kaisei-opti",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru-gothic",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"]
});

const dotGothic16 = DotGothic16({
  variable: "--font-dot-gothic-16",
  subsets: ["latin"],
  weight: "400"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const yuseiMagic = Yusei_Magic({
  variable: "--font-yusei-magic",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "スペースゲーム",
  description: "オンラインスペースゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${dotGothic16.variable} ${yuseiMagic.variable} ${kaiseiOpti.variable} ${zenMaruGothic.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
