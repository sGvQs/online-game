
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 blur-[100px] rounded-full pointer-events-none animate-pulse-slow"></div>

      <div className="glass-card p-12 rounded-2xl text-center max-w-2xl relative z-10 border-t border-white/20">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-300 dark:to-brand-100 mb-6 drop-shadow-sm">
          スペースゲーム
        </h1>
        <p className="text-xl text-brand-700 dark:text-brand-200 mb-8 font-light">
          虚空を体験せよ。銀河を征服せよ。
        </p>
        <div className="text-sm font-mono text-brand-500 dark:text-brand-400 opacity-70">
          [ LP ランディングページ プレースホルダー ]
        </div>
      </div>
    </main>
  )
}
