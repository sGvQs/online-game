import { tv } from 'tailwind-variants'

export const titleScreen = tv({
  slots: {
    titleStar: [
      'block text-[5.5rem] font-black leading-none',
      '[font-family:var(--font-rubik-puddles)]',
      'bg-gradient-to-br from-white via-purple-400 to-pink-400 bg-clip-text text-transparent',
      '[filter:drop-shadow(0_0_30px_rgba(192,132,252,0.6))]',
    ],
    titleShield: [
      'block text-[5.5rem] font-black leading-none -mt-2',
      '[font-family:var(--font-rubik-puddles)]',
      'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
      '[filter:drop-shadow(0_0_30px_rgba(129,140,248,0.6))]',
    ],
    subtitle: 'flex gap-2 text-sm mt-3 [font-family:var(--font-dot-gothic-16)] text-[rgba(167,139,250,0.7)]',
    playerCard: 'rounded-2xl p-5 bg-[rgba(129,140,248,0.05)] border border-[rgba(129,140,248,0.18)]',
    playerCardTitle: 'text-[10px] tracking-[0.4em] uppercase mb-4 [font-family:var(--font-dot-gothic-16)] text-[rgba(129,140,248,0.6)]',
    statusDot: 'w-2 h-2 rounded-full shrink-0 transition-colors duration-300 [background-color:var(--status-dot-color)]',
    playerName: 'text-base flex-1 truncate [font-family:var(--font-dot-gothic-16)] [color:var(--player-name-color)]',
    playerNameSuffix: 'text-xs text-brand-500/50 ml-1 [font-family:var(--font-dot-gothic-16)]',
    playerRank: 'text-xs shrink-0 tabular-nums [font-family:var(--font-dot-gothic-16)] text-[rgba(192,132,252,0.8)]',
    readyBadge: 'text-xs px-2 py-0.5 rounded-full [font-family:var(--font-cherry-bomb-one)] text-indigo-400 bg-[rgba(129,140,248,0.15)] border border-[rgba(129,140,248,0.4)]',
    waitingBadge: 'text-xs [font-family:var(--font-dot-gothic-16)] text-white/20',
    progressTrack: 'mt-4 h-1 rounded-full overflow-hidden bg-white/[0.06]',
    progressBar: 'h-full rounded-full transition-all duration-500 [width:var(--progress-pct)] bg-gradient-to-r from-indigo-400 to-purple-400 [box-shadow:0_0_8px_rgba(129,140,248,0.6)]',
    howToCard: 'rounded-2xl p-5 bg-[rgba(192,132,252,0.05)] border border-[rgba(192,132,252,0.18)]',
    howToTitle: 'text-[10px] tracking-[0.4em] uppercase mb-4 [font-family:var(--font-dot-gothic-16)] text-[rgba(192,132,252,0.6)]',
    howToText: 'text-xs leading-5 [font-family:var(--font-dot-gothic-16)] text-[rgba(203,213,225,0.7)]',
    menuButton: [
      'py-3 px-6 rounded-2xl font-bold text-left transition-all duration-200 select-none',
      '[font-family:var(--font-cherry-bomb-one)] text-base',
      '[background:var(--btn-bg)] [border:var(--btn-border)] [color:var(--btn-color)] [box-shadow:var(--btn-glow)]',
    ],
    menuButtonDisabled: [
      'py-3 px-6 rounded-2xl font-bold text-left transition-all duration-200 select-none',
      '[font-family:var(--font-cherry-bomb-one)] text-base',
      'bg-gray-800/60 text-gray-500 border-2 border-gray-700/50',
    ],
  },
})
