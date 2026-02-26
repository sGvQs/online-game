import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Maru_Gothic, DotGothic16, Kaisei_Opti, Yusei_Magic, Honk, Coral_Pixels, Sixtyfour_Convergence, Bitcount_Grid_Double_Ink } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import BGMPlayer from "@/components/ui/BGMPlayer";
import { SoundProvider } from "@/lib/sound-context";
import { DebugComplaintKeyListener } from "@/components/dashboard/DebugComplaintKeyListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const kaiseiOpti = Kaisei_Opti({
  variable: "--font-kaisei-opti",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  fallback: ["serif"],
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru-gothic",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  fallback: ["sans-serif"],
});

const dotGothic16 = DotGothic16({
  variable: "--font-dot-gothic-16",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
});

const yuseiMagic = Yusei_Magic({
  variable: "--font-yusei-magic",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["sans-serif"],
});

const honk = Honk({
  variable: "--font-honk",
  subsets: ["latin"],
  display: "swap",
  fallback: ["sans-serif"],
});

const coralPixels = Coral_Pixels({
  variable: "--font-coral-pixels",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["sans-serif"],
});

const sixtyfourConvergence = Sixtyfour_Convergence({
  variable: "--font-sixtyfour-convergence",
  subsets: ["latin"],
  display: "swap",
  fallback: ["sans-serif"],
});

const bitcountGridDoubleInk = Bitcount_Grid_Double_Ink({
  variable: "--font-bitcount-grid-double-ink",
  subsets: ["latin"],
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "Pukapuka Space | ぷかぷか宇宙",
  description: "さあ、人生の大事な時間を、無駄にする準備はできた？ —— 名もなき恐竜より",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${dotGothic16.variable} ${yuseiMagic.variable} ${kaiseiOpti.variable} ${zenMaruGothic.variable} ${geistSans.variable} ${geistMono.variable} ${honk.variable} ${coralPixels.variable} ${sixtyfourConvergence.variable} ${bitcountGridDoubleInk.variable} antialiased`}
        suppressHydrationWarning
      >
        <SoundProvider>
          <ThemeProvider>
            <DebugComplaintKeyListener />
            {children}
            <BGMPlayer />
          </ThemeProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
