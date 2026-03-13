import { tv } from 'tailwind-variants'

export const titleScreen = tv({
  slots: {
    titleStar: [
      'block text-[5.5rem] font-black leading-none',
      'bg-linear-to-br from-white via-purple-400 to-pink-400 bg-clip-text text-transparent',
      '[filter:drop-shadow(0_0_30px_rgba(192,132,252,0.6))]',
    ],
    titleShield: [
      'block text-[5.5rem] font-black leading-none -mt-2',
      'bg-linear-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
      '[filter:drop-shadow(0_0_30px_rgba(129,140,248,0.6))]',
    ],
    subtitle: 'flex gap-2 text-sm mt-3 text-[rgba(167,139,250,0.7)]',
    playerCard: 'rounded-2xl p-5 bg-[rgba(129,140,248,0.05)] border border-[rgba(129,140,248,0.18)]',
    playerCardTitle: 'text-[10px] tracking-[0.4em] uppercase mb-4 text-[rgba(129,140,248,0.6)]',
    statusDot: 'w-2 h-2 rounded-full shrink-0 transition-colors duration-300 [background-color:var(--status-dot-color)]',
    playerName: 'text-base flex-1 truncate [color:var(--player-name-color)]',
    playerNameSuffix: 'text-xs text-brand-500/50 ml-1',
    playerRank: 'text-xs shrink-0 tabular-nums text-[rgba(192,132,252,0.8)]',
    readyBadge: 'text-xs px-2 py-0.5 rounded-full text-indigo-400 bg-[rgba(129,140,248,0.15)] border border-[rgba(129,140,248,0.4)]',
    waitingBadge: 'text-xs text-white/20',
    progressTrack: 'mt-4 h-1 rounded-full overflow-hidden bg-white/6',
    progressBar: 'h-full rounded-full transition-all duration-500 [width:var(--progress-pct)] bg-linear-to-r from-indigo-400 to-purple-400 [box-shadow:0_0_8px_rgba(129,140,248,0.6)]',
    howToCard: 'rounded-2xl p-5 bg-[rgba(192,132,252,0.05)] border border-[rgba(192,132,252,0.18)]',
    howToTitle: 'text-[10px] tracking-[0.4em] uppercase mb-4 text-[rgba(192,132,252,0.6)]',
    howToText: 'text-xs leading-5 text-[rgba(203,213,225,0.7)]',
    pairRankBadge: [
      'flex items-center gap-2 rounded-2xl px-4 py-3',
      'bg-[rgba(129,140,248,0.05)] border border-[rgba(129,140,248,0.18)]',
      'hover:bg-[rgba(129,140,248,0.1)] hover:border-[rgba(129,140,248,0.35)]',
      'transition-all duration-200 cursor-pointer group',
    ],
  },
})
